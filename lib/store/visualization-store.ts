import { create } from "zustand";
import { CLUSTERS_DATA, type ClusterDefinition } from "@/data/clusters";
import {
  calculateConnections,
  createEnrichedCompanies,
  optimizeCompanyLayout,
  SURFACE_ALLOWED_HALF,
  type Connection,
  type EnrichedCompany,
} from "@/lib/data/process-data";
import type { SinergiaDetectada } from "@/types";
import {
  createCompanyNodeId,
  createSynergyNodeId,
  type NodeRef,
} from "@/lib/utils/node-ids";
import {
  isEmpresa,
  type Empresa,
  COMPANY_LOCATIONS,
} from "@/lib/data/locations";

const CLUSTER_LAYOUTS: Record<string, [number, number][]> = {
  "petroquimico-cartagena": [
    [0, 0],
    [14, 0],
    [-14, 0],
    [7, 12],
    [-7, 12],
    [0, -14],
  ],
  "proteina-blanca-valle": [
    [0, 0],
    [12, 12],
    [-12, 12],
    [12, -12],
    [-12, -12],
    [0, -18],
  ],
};

export type ConnectionViewMode = "all" | "key" | "focus";

export interface ClusterCompany extends EnrichedCompany {
  clusterId: string;
  nodeId: NodeRef;
}

export interface ClusterConnection extends Connection {
  clusterId: string;
  nodeRefs: {
    from: NodeRef;
    to: NodeRef;
  };
}

export interface ClusterVisualizationState {
  id: string;
  etiqueta: string;
  descripcion: string;
  dataset: ClusterDefinition["dataset"];
  offset: [number, number];
  enrichedCompanies: ClusterCompany[];
  connections: ClusterConnection[];
  naturalConnections: ClusterConnection[];
  synergyPositions: Record<NodeRef, [number, number, number]>;
  sinergias: SinergiaDetectada[];
}

interface NodeIndexEntry {
  id: NodeRef;
  type: "company" | "synergy";
  clusterId: string;
  empresa?: string;
  sinergiaId?: string;
  position: [number, number, number];
}

function clampToSurface(value: number) {
  return Math.max(-SURFACE_ALLOWED_HALF, Math.min(SURFACE_ALLOWED_HALF, value));
}

function clampToPlaneWithOffset(value: number, offset: number): number {
  const min = offset - SURFACE_ALLOWED_HALF;
  const max = offset + SURFACE_ALLOWED_HALF;
  return Math.max(min, Math.min(max, value));
}

function clampPointToPlane(
  point: [number, number, number],
  offset: [number, number]
): [number, number, number] {
  return [
    clampToPlaneWithOffset(point[0], offset[0]),
    point[1],
    clampToPlaneWithOffset(point[2], offset[1]),
  ];
}

function computeSynergyPositionsForCluster(
  sinergias: SinergiaDetectada[],
  companies: EnrichedCompany[]
): Record<string, [number, number, number]> {
  const companyMap = new Map<string, EnrichedCompany>();
  companies.forEach((company) => {
    companyMap.set(company.empresa, company);
  });

  const positions: Record<string, [number, number, number]> = {};

  for (const sinergia of sinergias) {
    const relatedCompanies = sinergia.empresas
      .map((empresa) => companyMap.get(empresa))
      .filter((entry): entry is EnrichedCompany => Boolean(entry));

    if (relatedCompanies.length === 0) continue;

    let sumX = 0;
    let sumZ = 0;
    relatedCompanies.forEach((company) => {
      sumX += company.position3D[0];
      sumZ += company.position3D[2];
    });

    const avgX = sumX / relatedCompanies.length;
    const avgZ = sumZ / relatedCompanies.length;

    const angleOffset = (sinergia.id.charCodeAt(0) % 360) * (Math.PI / 180);
    const radialOffset = relatedCompanies.length > 1 ? 0 : 1.4;

    const offsetX = Math.cos(angleOffset) * radialOffset;
    const offsetZ = Math.sin(angleOffset) * radialOffset;

    const finalX = clampToSurface(avgX + offsetX);
    const finalZ = clampToSurface(avgZ + offsetZ);

    positions[sinergia.id] = [finalX, 1.2, finalZ];
  }

  return positions;
}

function generateOrderedConnections(
  clusterId: string,
  sinergias: SinergiaDetectada[],
  companies: ClusterCompany[],
  offset: [number, number]
): ClusterConnection[] {
  return calculateConnections(sinergias, companies).map((connection) => ({
    ...connection,
    id: `connection|${clusterId}|${connection.id}`,
    clusterId,
    nodeRefs: {
      from: createCompanyNodeId(clusterId, connection.from.empresa),
      to: createCompanyNodeId(clusterId, connection.to.empresa),
    },
    from: {
      ...connection.from,
      position: clampPointToPlane(connection.from.position, offset),
    },
    to: {
      ...connection.to,
      position: clampPointToPlane(connection.to.position, offset),
    },
    path: connection.path.map((point) => clampPointToPlane(point, offset)),
  }));
}

function generateNaturalConnections(
  clusterId: string,
  sinergias: SinergiaDetectada[],
  companies: ClusterCompany[],
  offset: [number, number]
): ClusterConnection[] {
  return sinergias.flatMap((sinergia) => {
    const participants = sinergia.empresas
      .map((empresa) =>
        companies.find((company) => company.empresa === empresa)
      )
      .filter((company): company is ClusterCompany =>
        Boolean(company?.position3D)
      );

    if (participants.length < 2) return [];

    const combos: ClusterConnection[] = [];
    for (let i = 0; i < participants.length; i += 1) {
      for (let j = i + 1; j < participants.length; j += 1) {
        const from = participants[i]!;
        const to = participants[j]!;
        combos.push({
          id: `natural-${sinergia.id}-${i}-${j}`,
          clusterId,
          from: {
            empresa: from.empresa,
            position: clampPointToPlane(from.position3D, offset),
          },
          to: {
            empresa: to.empresa,
            position: clampPointToPlane(to.position3D, offset),
          },
          type: "synergy",
          strength: 1,
          path: [
            clampPointToPlane(from.position3D, offset),
            clampPointToPlane(to.position3D, offset),
          ],
          data: sinergia,
          nodeRefs: {
            from: createCompanyNodeId(clusterId, from.empresa),
            to: createCompanyNodeId(clusterId, to.empresa),
          },
        });
      }
    }
    return combos;
  });
}

function buildClusterVisualization(
  cluster: ClusterDefinition,
  index: number
): ClusterVisualizationState {
  const empresaSet = new Set<Empresa>();

  // Collect company names declared in the dataset
  Object.values(cluster.dataset.companies ?? {}).forEach((entry) => {
    if (isEmpresa(entry.name)) {
      empresaSet.add(entry.name);
    }
  });

  cluster.dataset.paradas.forEach((parada) => {
    if (isEmpresa(parada.empresa)) {
      empresaSet.add(parada.empresa);
    }
  });

  cluster.dataset.necesidades.forEach((necesidad) => {
    if (isEmpresa(necesidad.empresa)) {
      empresaSet.add(necesidad.empresa);
    }
  });

  const empresaFilter = empresaSet.size
    ? Array.from(empresaSet)
    : COMPANY_LOCATIONS.map((location) => location.empresa);

  const rawCompanies = createEnrichedCompanies(
    cluster.dataset.paradas,
    cluster.dataset.necesidades,
    empresaFilter
  );

  const optimizedCompanies = optimizeCompanyLayout(
    rawCompanies,
    cluster.dataset.sinergias
  );

  const layout = CLUSTER_LAYOUTS[cluster.id];
  const arrangedCompanies =
    layout && layout.length > 0
      ? optimizedCompanies.map((company, index) => {
          const [layoutX, layoutZ] = layout[index % layout.length];
          return {
            ...company,
            position3D: [layoutX, company.position3D[1], layoutZ],
          };
        })
      : optimizedCompanies;

  const offset: [number, number] =
    cluster.offset ?? ([index * 70, 0] as [number, number]);

  const companiesWithOffset: ClusterCompany[] = arrangedCompanies.map(
    (company) => {
      const nodeId = createCompanyNodeId(cluster.id, company.empresa);
      const clampedX = clampToPlaneWithOffset(
        company.position3D[0] + offset[0],
        offset[0]
      );
      const clampedZ = clampToPlaneWithOffset(
        company.position3D[2] + offset[1],
        offset[1]
      );
      return {
        ...company,
        clusterId: cluster.id,
        nodeId,
        position3D: [clampedX, company.position3D[1], clampedZ],
      };
    }
  );

  const orderedConnections = generateOrderedConnections(
    cluster.id,
    cluster.dataset.sinergias,
    companiesWithOffset,
    offset
  );

  const synergyPositions = computeSynergyPositionsForCluster(
    cluster.dataset.sinergias,
    companiesWithOffset
  );

  const synergyPositionsWithIds: Record<NodeRef, [number, number, number]> = {};
  for (const sinergia of cluster.dataset.sinergias) {
    const base = synergyPositions[sinergia.id];
    if (!base) continue;
    const nodeId = createSynergyNodeId(cluster.id, sinergia.id);
    synergyPositionsWithIds[nodeId] = [
      clampToPlaneWithOffset(base[0] + offset[0], offset[0]),
      base[1],
      clampToPlaneWithOffset(base[2] + offset[1], offset[1]),
    ];
  }

  const baseCluster = {
    id: cluster.id,
    etiqueta: cluster.etiqueta,
    descripcion: cluster.descripcion,
    dataset: cluster.dataset,
    offset,
  };

  const naturalConnections = generateNaturalConnections(
    cluster.id,
    cluster.dataset.sinergias,
    companiesWithOffset,
    offset
  );

  return {
    ...baseCluster,
    enrichedCompanies: companiesWithOffset,
    connections: orderedConnections,
    naturalConnections,
    synergyPositions: synergyPositionsWithIds,
    sinergias: cluster.dataset.sinergias,
  };
}

const PRECOMPUTED_CLUSTERS = CLUSTERS_DATA.map(buildClusterVisualization);

function aggregateClusters(clusters: ClusterVisualizationState[]) {
  const enrichedCompanies = clusters.flatMap(
    (cluster) => cluster.enrichedCompanies
  );

  const connections = clusters.flatMap((cluster) => cluster.connections);

  const naturalConnections = clusters.flatMap(
    (cluster) => cluster.naturalConnections
  );

  const synergyPositions = clusters.reduce<
    Record<NodeRef, [number, number, number]>
  >((acc, cluster) => {
    Object.assign(acc, cluster.synergyPositions);
    return acc;
  }, {});

  const clusterIndex = clusters.reduce<
    Record<string, ClusterVisualizationState>
  >((acc, cluster) => {
    acc[cluster.id] = cluster;
    return acc;
  }, {});

  const nodeIndex = clusters.reduce<Record<NodeRef, NodeIndexEntry>>(
    (acc, cluster) => {
      cluster.enrichedCompanies.forEach((company) => {
        acc[company.nodeId] = {
          id: company.nodeId,
          type: "company",
          clusterId: cluster.id,
          empresa: company.empresa,
          position: company.position3D,
        };
      });

      cluster.sinergias.forEach((sinergia) => {
        const nodeId = createSynergyNodeId(cluster.id, sinergia.id);
        const position = cluster.synergyPositions[nodeId];
        if (!position) return;
        acc[nodeId] = {
          id: nodeId,
          type: "synergy",
          clusterId: cluster.id,
          sinergiaId: sinergia.id,
          position,
        };
      });

      return acc;
    },
    {}
  );

  return {
    enrichedCompanies,
    connections,
    naturalConnections,
    synergyPositions,
    clusterIndex,
    nodeIndex,
  };
}

const DEFAULT_AGGREGATED = aggregateClusters(PRECOMPUTED_CLUSTERS);
const {
  clusterIndex: DEFAULT_CLUSTER_INDEX,
  nodeIndex: DEFAULT_NODE_INDEX,
  enrichedCompanies: DEFAULT_ENRICHED_COMPANIES,
  connections: DEFAULT_CONNECTIONS,
  naturalConnections: DEFAULT_NATURAL_CONNECTIONS,
  synergyPositions: DEFAULT_SYNERGY_POSITIONS,
} = DEFAULT_AGGREGATED;

function createPersonalizedCluster(
  cluster: ClusterVisualizationState,
  focusEmpresa: Empresa
): ClusterVisualizationState {
  const focusCompany = cluster.enrichedCompanies.find(
    (company) => company.empresa === focusEmpresa
  );

  if (!focusCompany) return cluster;

  const centerY = focusCompany.position3D[1];
  const centerPosition: [number, number, number] = [
    cluster.offset[0],
    centerY,
    cluster.offset[1],
  ];

  const others = cluster.enrichedCompanies
    .filter((company) => company.empresa !== focusEmpresa)
    .sort((a, b) => a.empresa.localeCompare(b.empresa));

  const radius = Math.max(Math.min(SURFACE_ALLOWED_HALF - 2, 18), 8);
  const angleStep =
    others.length > 0 ? (Math.PI * 2) / others.length : Math.PI * 2;

  const repositioned: ClusterCompany[] = cluster.enrichedCompanies.map(
    (company) => {
      if (company.empresa === focusEmpresa) {
        return {
          ...company,
          position3D: [
            centerPosition[0],
            centerPosition[1],
            centerPosition[2],
          ] as [number, number, number],
        };
      }

      const index = others.findIndex((item) => item.nodeId === company.nodeId);
      if (index === -1) {
        return { ...company };
      }

      const angle = angleStep * index;
      const targetX = centerPosition[0] + Math.cos(angle) * radius;
      const targetZ = centerPosition[2] + Math.sin(angle) * radius;
      const nextPosition: [number, number, number] = [
        clampToPlaneWithOffset(targetX, cluster.offset[0]),
        company.position3D[1],
        clampToPlaneWithOffset(targetZ, cluster.offset[1]),
      ];

      return {
        ...company,
        position3D: nextPosition,
      };
    }
  );

  const orderedConnections = generateOrderedConnections(
    cluster.id,
    cluster.sinergias,
    repositioned,
    cluster.offset
  ).filter(
    (connection) =>
      connection.from.empresa === focusEmpresa ||
      connection.to.empresa === focusEmpresa
  );

  const naturalConnections = generateNaturalConnections(
    cluster.id,
    cluster.sinergias,
    repositioned,
    cluster.offset
  ).filter(
    (connection) =>
      connection.from.empresa === focusEmpresa ||
      connection.to.empresa === focusEmpresa
  );

  const synergyPositions = computeSynergyPositionsForCluster(
    cluster.sinergias,
    repositioned
  );

  const synergyPositionsWithIds: Record<NodeRef, [number, number, number]> = {};
  for (const sinergia of cluster.sinergias) {
    const base = synergyPositions[sinergia.id];
    if (!base) continue;
    const nodeId = createSynergyNodeId(cluster.id, sinergia.id);
    synergyPositionsWithIds[nodeId] = [
      clampToPlaneWithOffset(base[0] + cluster.offset[0], cluster.offset[0]),
      base[1],
      clampToPlaneWithOffset(base[2] + cluster.offset[1], cluster.offset[1]),
    ];
  }

  return {
    ...cluster,
    enrichedCompanies: repositioned,
    connections: orderedConnections,
    naturalConnections,
    synergyPositions: synergyPositionsWithIds,
  };
}

export interface VisualizationState {
  clusters: ClusterVisualizationState[];
  clusterIndex: Record<string, ClusterVisualizationState>;
  nodeIndex: Record<NodeRef, NodeIndexEntry>;
  hoveredNode: NodeRef | null;
  selectedNode: NodeRef | null;
  connectionMode: ConnectionViewMode;
  synergyPositions: Record<NodeRef, [number, number, number]>;
  enrichedCompanies: ClusterCompany[];
  connections: ClusterConnection[];
  naturalConnections: ClusterConnection[];
  debug: {
    showAxes: boolean;
    showGrid: boolean;
    showLabels: boolean;
    useOrbitControls: boolean;
    useOrderedConnections: boolean;
  };
  filters: {
    companies: boolean;
    providers: boolean;
    synergies: boolean;
    rfps: boolean;
    offers: boolean;
    events: boolean;
  };
  hasInteracted: boolean;
  cameraSettled: boolean;
  setHoveredNode: (id: NodeRef | null) => void;
  setSelectedNode: (id: NodeRef | null) => void;
  toggleFilter: (filter: keyof VisualizationState["filters"]) => void;
  setConnectionMode: (mode: ConnectionViewMode) => void;
  registerInteraction: () => void;
  resetInteraction: () => void;
  setCameraSettled: (settled: boolean) => void;
  setDebugOption: <K extends keyof VisualizationState["debug"]>(
    option: K,
    value: VisualizationState["debug"][K]
  ) => void;
  regenerateConnections: () => void;
  personalizeForCompany: (empresa: Empresa | null) => void;
}

export const useVisualizationStore = create<VisualizationState>((set) => ({
  clusters: PRECOMPUTED_CLUSTERS,
  clusterIndex: DEFAULT_CLUSTER_INDEX,
  nodeIndex: DEFAULT_NODE_INDEX,
  hoveredNode: null,
  selectedNode: null,
  connectionMode: "focus",
  enrichedCompanies: DEFAULT_ENRICHED_COMPANIES,
  connections: DEFAULT_CONNECTIONS,
  naturalConnections: DEFAULT_NATURAL_CONNECTIONS,
  synergyPositions: DEFAULT_SYNERGY_POSITIONS,
  debug: {
    showAxes: false,
    showGrid: false,
    showLabels: true,
    useOrbitControls: false,
    useOrderedConnections: false,
  },
  filters: {
    companies: true,
    providers: true,
    synergies: true,
    rfps: true,
    offers: true,
    events: true,
  },
  hasInteracted: false,
  cameraSettled: false,
  setHoveredNode: (id) => set({ hoveredNode: id }),
  setSelectedNode: (id) => set({ selectedNode: id }),
  toggleFilter: (filter) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [filter]: !state.filters[filter],
      },
    })),
  setConnectionMode: (mode) => set({ connectionMode: mode }),
  registerInteraction: () => set({ hasInteracted: true }),
  resetInteraction: () =>
    set({
      hasInteracted: false,
      selectedNode: null,
      cameraSettled: false,
    }),
  setCameraSettled: (settled) => set({ cameraSettled: settled }),
  setDebugOption: (option, value) =>
    set((state) => ({
      debug: {
        ...state.debug,
        [option]: value,
      },
    })),
  regenerateConnections: () =>
    set((state) => {
      const updatedClusters = state.clusters.map((cluster) => ({
        ...cluster,
        connections: generateOrderedConnections(
          cluster.id,
          cluster.dataset.sinergias,
          cluster.enrichedCompanies,
          cluster.offset
        ),
        naturalConnections: generateNaturalConnections(
          cluster.id,
          cluster.dataset.sinergias,
          cluster.enrichedCompanies,
          cluster.offset
        ),
      }));

      const aggregated = aggregateClusters(updatedClusters);

      return {
        clusters: updatedClusters,
        connections: aggregated.connections,
        naturalConnections: aggregated.naturalConnections,
        clusterIndex: aggregated.clusterIndex,
        nodeIndex: aggregated.nodeIndex,
        enrichedCompanies: aggregated.enrichedCompanies,
        synergyPositions: aggregated.synergyPositions,
      };
    }),
  personalizeForCompany: (empresa) =>
    set(() => {
      if (!empresa) {
        return {
          clusters: PRECOMPUTED_CLUSTERS,
          clusterIndex: DEFAULT_CLUSTER_INDEX,
          nodeIndex: DEFAULT_NODE_INDEX,
          enrichedCompanies: DEFAULT_ENRICHED_COMPANIES,
          connections: DEFAULT_CONNECTIONS,
          naturalConnections: DEFAULT_NATURAL_CONNECTIONS,
          synergyPositions: DEFAULT_SYNERGY_POSITIONS,
        };
      }

      const targetCluster = PRECOMPUTED_CLUSTERS.find((cluster) =>
        cluster.enrichedCompanies.some((company) => company.empresa === empresa)
      );

      if (!targetCluster) {
        return {
          clusters: PRECOMPUTED_CLUSTERS,
          clusterIndex: DEFAULT_CLUSTER_INDEX,
          nodeIndex: DEFAULT_NODE_INDEX,
          enrichedCompanies: DEFAULT_ENRICHED_COMPANIES,
          connections: DEFAULT_CONNECTIONS,
          naturalConnections: DEFAULT_NATURAL_CONNECTIONS,
          synergyPositions: DEFAULT_SYNERGY_POSITIONS,
        };
      }

      const personalizedCluster = createPersonalizedCluster(
        targetCluster,
        empresa
      );

      const updatedClusters = [personalizedCluster];

      const aggregated = aggregateClusters(updatedClusters);

      const companyNodeId = createCompanyNodeId(
        personalizedCluster.id,
        empresa
      );

      return {
        clusters: updatedClusters,
        clusterIndex: aggregated.clusterIndex,
        nodeIndex: aggregated.nodeIndex,
        enrichedCompanies: aggregated.enrichedCompanies,
        connections: aggregated.connections,
        naturalConnections: aggregated.naturalConnections,
        synergyPositions: aggregated.synergyPositions,
        selectedNode: companyNodeId,
      };
    }),
}));
