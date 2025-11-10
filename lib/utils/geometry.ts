import * as THREE from "three";

/**
 * Geometry mappings for different node types
 * Sharp-edged variants to keep a crisp, low-rounded aesthetic
 * All geometries are scaled to fit the 50x50 surface
 */
export const GEOMETRIES = {
  company: new THREE.BoxGeometry(4, 1, 4, 1, 1, 1),
  provider: new THREE.OctahedronGeometry(0.8, 0),
  synergy: new THREE.DodecahedronGeometry(0.9, 0),
  rfp: new THREE.ConeGeometry(0.9, 1.5, 3, 1),
  offer: new THREE.CylinderGeometry(0.7, 0.7, 1.2, 6, 1),
  event: new THREE.IcosahedronGeometry(1.1, 0),
} as const;

export type NodeType = keyof typeof GEOMETRIES;

/**
 * Get geometry for a node type
 */
export function getGeometryForType(type: NodeType): THREE.BufferGeometry {
  return GEOMETRIES[type];
}

/**
 * Get geometry name for debugging
 */
export function getGeometryName(type: NodeType): string {
  const names: Record<NodeType, string> = {
    company: "BoxGeometry",
    provider: "OctahedronGeometry",
    synergy: "TetrahedronGeometry",
    rfp: "ConeGeometry",
    offer: "CylinderGeometry",
    event: "IcosahedronGeometry",
  };
  return names[type];
}
