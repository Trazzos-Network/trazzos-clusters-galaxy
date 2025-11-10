"use client";

import { useRef, useState } from "react";
import { useVisualizationStore } from "@/lib/store/visualization-store";
import * as THREE from "three";
import type { NodeRef, NodeType } from "@/lib/utils/node-ids";
import { getGeometryForType } from "@/lib/utils/geometry";
import { NODE_COLORS } from "@/lib/utils/colors";

interface NodeProps {
  id: NodeRef;
  type: NodeType;
  position: [number, number, number];
  color?: string;
  data?: unknown;
}

export default function Node({ id, type, position, color, data }: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const setHoveredNode = useVisualizationStore((state) => state.setHoveredNode);
  const setSelectedNode = useVisualizationStore(
    (state) => state.setSelectedNode
  );
  const selectedNode = useVisualizationStore((state) => state.selectedNode);

  const nodeColor = color || NODE_COLORS[type];
  const isSelected = selectedNode === id;

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={getGeometryForType(type)}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        setHoveredNode(id);
      }}
      onPointerOut={() => {
        setHovered(false);
        setHoveredNode(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedNode(id);
      }}
      scale={hovered || isSelected ? 1.2 : 1}
    >
      <meshStandardMaterial
        color={nodeColor}
        emissive={hovered || isSelected ? nodeColor : "#000000"}
        emissiveIntensity={hovered || isSelected ? 0.5 : 0}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
}
