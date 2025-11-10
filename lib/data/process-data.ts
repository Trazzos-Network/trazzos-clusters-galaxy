import { COMPANY_LOCATIONS, type Empresa } from "./locations";
import { latLonTo3D } from "../utils/coordinates";
import type {
  ParadaProgramada,
  NecesidadMaterial,
  SinergiaDetectada,
  Proveedor,
} from "@/types";

/**
 * Enrich an entity with location data
 */
export function enrichWithLocation<T extends { empresa: string }>(
  entity: T
): (T & { location: { lat: number; lon: number } }) | null {
  const location = COMPANY_LOCATIONS.find(
    (loc) => loc.empresa === entity.empresa
  );
  if (!location) return null;

  return {
    ...entity,
    location: {
      lat: location.lat,
      lon: location.lon,
    },
  };
}

/**
 * Enriched company data with location and related entities
 */
export interface EnrichedCompany {
  empresa: Empresa;
  location: { lat: number; lon: number; name: string };
  paradas: ParadaProgramada[];
  necesidades: NecesidadMaterial[];
  position3D: [number, number, number];
}

/**
 * Normalize positions to fit within the 50x50 surface (-25 to +25)
 * Centers the network and scales it to fit
 */
const SURFACE_HALF = 25;
const SURFACE_PADDING = 3;
export const SURFACE_ALLOWED_HALF = SURFACE_HALF - SURFACE_PADDING; // Margin from the edges
const EPSILON = 1e-3;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function spreadPositions(
  positions: [number, number, number][]
): [number, number, number][] {
  const adjusted = positions.map(
    ([x, y, z]) => [x, y, z] as [number, number, number]
  );
  const minDistance = 6;
  const iterations = 25;
  const minLimit = -SURFACE_ALLOWED_HALF;
  const maxLimit = SURFACE_ALLOWED_HALF;

  for (let iter = 0; iter < iterations; iter += 1) {
    for (let i = 0; i < adjusted.length; i += 1) {
      for (let j = i + 1; j < adjusted.length; j += 1) {
        const dx = adjusted[i][0] - adjusted[j][0];
        const dz = adjusted[i][2] - adjusted[j][2];
        const distanceSq = dx * dx + dz * dz;
        if (distanceSq === 0) {
          // Perfect overlap, nudge randomly
          const offset = (minDistance / 2) * (Math.random() - 0.5);
          adjusted[i][0] += offset;
          adjusted[j][0] -= offset;
          adjusted[i][2] += offset;
          adjusted[j][2] -= offset;
          continue;
        }

        const distance = Math.sqrt(distanceSq);
        if (distance < minDistance) {
          const overlap = (minDistance - distance) / 2;
          const nx = dx / distance;
          const nz = dz / distance;
          adjusted[i][0] = clamp(
            adjusted[i][0] + nx * overlap,
            minLimit,
            maxLimit
          );
          adjusted[i][2] = clamp(
            adjusted[i][2] + nz * overlap,
            minLimit,
            maxLimit
          );
          adjusted[j][0] = clamp(
            adjusted[j][0] - nx * overlap,
            minLimit,
            maxLimit
          );
          adjusted[j][2] = clamp(
            adjusted[j][2] - nz * overlap,
            minLimit,
            maxLimit
          );
        }
      }
    }
  }

  return adjusted;
}

function normalizePositions(
  positions: [number, number, number][]
): [number, number, number][] {
  if (positions.length === 0) return positions;

  // Find bounds
  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;

  for (const [x, , z] of positions) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }

  // Calculate center and range
  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const rangeX = maxX - minX || 1; // Avoid division by zero
  const rangeZ = maxZ - minZ || 1;

  // Scale to use most of the 50x50 surface while retaining relative spacing
  const maxRange = Math.max(rangeX, rangeZ);
  const allowedSpan = SURFACE_ALLOWED_HALF * 2;
  const scale = maxRange === 0 ? 1 : allowedSpan / maxRange;
  const minLimit = -SURFACE_ALLOWED_HALF;
  const maxLimit = SURFACE_ALLOWED_HALF;

  const normalized = positions.map(([x, y, z]) => {
    const normalizedX = (x - centerX) * scale;
    const normalizedZ = (z - centerZ) * scale;
    const clampedX = clamp(normalizedX, minLimit, maxLimit);
    const clampedZ = clamp(normalizedZ, minLimit, maxLimit);
    return [clampedX, y, clampedZ] as [number, number, number];
  });

  return spreadPositions(normalized);
}

/**
 * Create enriched companies from data
 */
export function createEnrichedCompanies(
  paradas: ParadaProgramada[],
  necesidades: NecesidadMaterial[],
  empresas?: ReadonlyArray<Empresa>
): EnrichedCompany[] {
  const empresaFilter =
    empresas && empresas.length > 0 ? new Set(empresas) : null;

  // First, create companies with raw positions
  const companies = COMPANY_LOCATIONS.filter((location) =>
    empresaFilter ? empresaFilter.has(location.empresa) : true
  ).map((location) => {
    const companyParadas = paradas.filter(
      (p) => p.empresa === location.empresa
    );
    const companyNecesidades = necesidades.filter(
      (n) => n.empresa === location.empresa
    );

    const [x, y, z] = latLonTo3D(location.lat, location.lon, 0);

    return {
      empresa: location.empresa,
      location: {
        lat: location.lat,
        lon: location.lon,
        name: location.name,
      },
      paradas: companyParadas,
      necesidades: companyNecesidades,
      position3D: [x, y, z] as [number, number, number],
    };
  });

  // Normalize all positions to fit within the 50x50 surface
  const positions = companies.map((c) => c.position3D);
  const normalizedPositions = normalizePositions(positions);

  // Update companies with normalized positions
  return companies.map((company, index) => ({
    ...company,
    position3D: normalizedPositions[index],
  }));
}

export function optimizeCompanyLayout(
  companies: EnrichedCompany[],
  sinergias: SinergiaDetectada[]
): EnrichedCompany[] {
  if (companies.length <= 1) return companies;

  const empresaToIndex = new Map<Empresa, number>();
  companies.forEach((company, idx) => {
    empresaToIndex.set(company.empresa, idx);
  });

  const edges: Array<[number, number]> = [];

  for (const sinergia of sinergias) {
    for (let i = 0; i < sinergia.empresas.length; i += 1) {
      for (let j = i + 1; j < sinergia.empresas.length; j += 1) {
        const sourceIndex = empresaToIndex.get(sinergia.empresas[i] as Empresa);
        const targetIndex = empresaToIndex.get(sinergia.empresas[j] as Empresa);

        if (
          sourceIndex !== undefined &&
          targetIndex !== undefined &&
          sourceIndex !== targetIndex
        ) {
          edges.push([sourceIndex, targetIndex]);
        }
      }
    }
  }

  const initialPositions: Vector2D[] = companies.map((company) => ({
    x: company.position3D[0],
    z: company.position3D[2],
  }));

  const optimizedPositions = applyForces(initialPositions, edges);
  const expandedPositions = expandToBounds(optimizedPositions);

  return companies.map((company, idx) => ({
    ...company,
    position3D: [
      expandedPositions[idx].x,
      company.position3D[1],
      expandedPositions[idx].z,
    ],
  }));
}

/**
 * Connection between entities
 */
export interface Connection {
  id: string;
  from: { empresa: Empresa; position: [number, number, number] };
  to: { empresa: Empresa; position: [number, number, number] };
  type: "synergy" | "supply" | "need" | "rfp";
  strength: number; // 0-1
  path: [number, number, number][];
  data?: unknown;
}

interface Vector2D {
  x: number;
  z: number;
}

const REPULSION_STRENGTH = 30;
const SPRING_STRENGTH = 0.12;
const SPRING_REST_LENGTH = 12;
const DAMPING = 0.85;
const MAX_STEP = 1.8;

function clampToSurface(value: number) {
  return clamp(value, -SURFACE_ALLOWED_HALF, SURFACE_ALLOWED_HALF);
}

function expandToBounds(positions: Vector2D[]): Vector2D[] {
  if (positions.length === 0) return positions;

  let maxAbsX = 0;
  let maxAbsZ = 0;

  for (const pos of positions) {
    maxAbsX = Math.max(maxAbsX, Math.abs(pos.x));
    maxAbsZ = Math.max(maxAbsZ, Math.abs(pos.z));
  }

  const currentMax = Math.max(maxAbsX, maxAbsZ, EPSILON);
  const targetMax = SURFACE_ALLOWED_HALF * 0.95;
  const scale = targetMax / currentMax;

  const scaled = positions.map((pos) => ({
    x: clampToSurface(pos.x * scale),
    z: clampToSurface(pos.z * scale),
  }));

  let centerX = 0;
  let centerZ = 0;

  for (const pos of scaled) {
    centerX += pos.x;
    centerZ += pos.z;
  }

  centerX /= scaled.length;
  centerZ /= scaled.length;

  if (Math.abs(centerX) < 0.01 && Math.abs(centerZ) < 0.01) {
    return scaled;
  }

  return scaled.map((pos) => ({
    x: clampToSurface(pos.x - centerX),
    z: clampToSurface(pos.z - centerZ),
  }));
}

function applyForces(
  positions: Vector2D[],
  connections: Array<[number, number]>
): Vector2D[] {
  const velocities = positions.map(() => ({ x: 0, z: 0 }));

  for (let iteration = 0; iteration < 200; iteration += 1) {
    const forces = positions.map(() => ({ x: 0, z: 0 }));

    for (let i = 0; i < positions.length; i += 1) {
      for (let j = i + 1; j < positions.length; j += 1) {
        const dx = positions[i].x - positions[j].x;
        const dz = positions[i].z - positions[j].z;
        const distanceSq = dx * dx + dz * dz + 0.01;
        const distance = Math.sqrt(distanceSq);
        const force = REPULSION_STRENGTH / distanceSq;
        const fx = (dx / distance) * force;
        const fz = (dz / distance) * force;
        forces[i].x += fx;
        forces[i].z += fz;
        forces[j].x -= fx;
        forces[j].z -= fz;
      }
    }

    for (const [sourceIndex, targetIndex] of connections) {
      const source = positions[sourceIndex];
      const target = positions[targetIndex];
      const dx = target.x - source.x;
      const dz = target.z - source.z;
      const distance = Math.sqrt(dx * dx + dz * dz) || 0.01;
      const displacement = distance - SPRING_REST_LENGTH;
      const force = SPRING_STRENGTH * displacement;
      const fx = (dx / distance) * force;
      const fz = (dz / distance) * force;
      forces[sourceIndex].x += fx;
      forces[sourceIndex].z += fz;
      forces[targetIndex].x -= fx;
      forces[targetIndex].z -= fz;
    }

    let maxVelocity = 0;

    for (let i = 0; i < positions.length; i += 1) {
      velocities[i].x = (velocities[i].x + forces[i].x) * DAMPING;
      velocities[i].z = (velocities[i].z + forces[i].z) * DAMPING;
      const speed = Math.sqrt(
        velocities[i].x * velocities[i].x + velocities[i].z * velocities[i].z
      );
      if (speed > maxVelocity) {
        maxVelocity = speed;
      }
    }

    const step = Math.min(1, MAX_STEP / (maxVelocity || 1));

    for (let i = 0; i < positions.length; i += 1) {
      positions[i].x = clampToSurface(positions[i].x + velocities[i].x * step);
      positions[i].z = clampToSurface(positions[i].z + velocities[i].z * step);
    }

    if (maxVelocity < 0.05) break;
  }

  return positions;
}

function generateOrthogonalPath(
  from: [number, number, number],
  to: [number, number, number],
  index: number
): [number, number, number][] {
  const start = { x: from[0], y: from[1], z: from[2] };
  const end = { x: to[0], y: to[1], z: to[2] };

  const path: [number, number, number][] = [[start.x, start.y, start.z]];

  const dx = end.x - start.x;
  const dz = end.z - start.z;

  const laneGroup = Math.floor(index / 6);
  const lanePosition = index % 6;
  const offsetMagnitude = 2 + laneGroup * 1.4;
  const offsetDirection = lanePosition - 2.5;
  const offset = offsetDirection * offsetMagnitude * 0.6;

  const goZFirst = (laneGroup + lanePosition) % 2 === 0;

  if (Math.abs(dx) < EPSILON && Math.abs(dz) < EPSILON) {
    path.push([end.x, end.y, end.z]);
    return path;
  }

  if (goZFirst) {
    const midZ = start.z + offset;
    path.push([start.x, start.y, midZ]);
    path.push([end.x, start.y, midZ]);
  } else {
    const midX = start.x + offset;
    path.push([midX, start.y, start.z]);
    path.push([midX, start.y, end.z]);
  }

  path.push([end.x, end.y, end.z]);

  const deduped: [number, number, number][] = [];
  for (const point of path) {
    if (
      deduped.length === 0 ||
      point[0] !== deduped[deduped.length - 1][0] ||
      point[2] !== deduped[deduped.length - 1][2]
    ) {
      deduped.push(point);
    }
  }

  return deduped;
}

/**
 * Calculate connections from synergies
 */
export function calculateConnections(
  sinergias: SinergiaDetectada[],
  enrichedCompanies: EnrichedCompany[]
): Connection[] {
  const connections: Connection[] = [];

  for (const sinergia of sinergias) {
    const empresas = sinergia.empresas;

    // Create connections between all pairs of companies in the synergy
    for (let i = 0; i < empresas.length; i++) {
      for (let j = i + 1; j < empresas.length; j++) {
        const company1 = enrichedCompanies.find(
          (c) => c.empresa === empresas[i]
        );
        const company2 = enrichedCompanies.find(
          (c) => c.empresa === empresas[j]
        );

        if (company1 && company2) {
          const strength = calculateSynergyStrength(sinergia);
          connections.push({
            id: `synergy-${sinergia.id}-${i}-${j}`,
            from: {
              empresa: company1.empresa,
              position: company1.position3D,
            },
            to: {
              empresa: company2.empresa,
              position: company2.position3D,
            },
            type: "synergy",
            strength,
            path: generateOrthogonalPath(
              company1.position3D,
              company2.position3D,
              connections.length
            ),
            data: sinergia,
          });
        }
      }
    }
  }

  return connections;
}

/**
 * Calculate synergy strength (0-1)
 */
function calculateSynergyStrength(sinergia: SinergiaDetectada): number {
  // Base strength from volume
  const volumeFactor = Math.min(1, sinergia.volumen_total / 500);

  // Factor from number of companies involved
  const companyFactor = Math.min(1, sinergia.empresas_involucradas / 6);

  // Combine factors
  return volumeFactor * 0.6 + companyFactor * 0.4;
}

/**
 * Calculate connection strength between two entities
 */
export function calculateStrength(
  entity1: unknown,
  entity2: unknown,
  type: Connection["type"]
): number {
  switch (type) {
    case "synergy":
      if (
        typeof entity1 === "object" &&
        entity1 !== null &&
        "volumen_total" in entity1
      ) {
        return calculateSynergyStrength(entity1 as SinergiaDetectada);
      }
      return 0.5;

    case "supply":
      if (
        typeof entity1 === "object" &&
        entity1 !== null &&
        "cumplimiento_historico" in entity1
      ) {
        const provider = entity1 as Proveedor;
        return (provider.cumplimiento_historico || 50) / 100;
      }
      return 0.5;

    default:
      return 0.5;
  }
}
