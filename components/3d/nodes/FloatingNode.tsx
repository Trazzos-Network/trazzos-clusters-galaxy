"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { animated, useSpring } from "@react-spring/three";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useVisualizationStore } from "@/lib/store/visualization-store";
import type { NodeRef, NodeType } from "@/lib/utils/node-ids";
import { getGeometryForType } from "@/lib/utils/geometry";
import { NODE_COLORS } from "@/lib/utils/colors";

interface FloatingNodeProps {
  id: NodeRef;
  type: NodeType;
  basePosition: [number, number, number];
  hoverHeight?: number;
  color?: string;
  info?: {
    title: string;
    description?: string;
    meta?: Record<string, unknown>;
  };
}

export default function FloatingNode({
  id,
  type,
  basePosition,
  hoverHeight = 1.5, // Height above the surface
  color,
  info,
}: FloatingNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const setHoveredNode = useVisualizationStore((state) => state.setHoveredNode);
  const setSelectedNode = useVisualizationStore(
    (state) => state.setSelectedNode
  );
  const setConnectionMode = useVisualizationStore(
    (state) => state.setConnectionMode
  );
  const registerInteraction = useVisualizationStore(
    (state) => state.registerInteraction
  );
  const selectedNode = useVisualizationStore((state) => state.selectedNode);
  const orbitEnabled = useVisualizationStore(
    (state) => state.debug.useOrbitControls
  );

  const nodeColor = color || NODE_COLORS[type];
  const isSelected = selectedNode === id;

  const { scale } = useSpring({
    scale: hovered || isSelected ? 1.18 : 1,
    config: { tension: 110, friction: 14, precision: 0.0001 },
  });

  const tooltip = useMemo(() => {
    if (info) return info;
    const label =
      type === "synergy"
        ? "Sinergia detectada"
        : type === "provider"
        ? "Proveedor"
        : type === "rfp"
        ? "Solicitud (RFP)"
        : type === "offer"
        ? "Oferta"
        : type === "event"
        ? "Evento"
        : "Entidad";

    return {
      title: label,
      description: undefined,
      meta: undefined,
    };
  }, [info, type]);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle hovering animation
      const t = state.clock.getElapsedTime();
      const hover = Math.sin(t * 1.5) * 0.15; // Subtle hover animation
      meshRef.current.position.y = basePosition[1] + hoverHeight + hover;
    }
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={basePosition}
      geometry={getGeometryForType(type) as THREE.BufferGeometry}
      castShadow
      receiveShadow
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        setHoveredNode(id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        setHoveredNode(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!orbitEnabled) {
          registerInteraction();
        }
        setSelectedNode(id);
        setConnectionMode("focus");
      }}
      scale={scale}
    >
      <meshStandardMaterial
        color={nodeColor}
        emissive={hovered || isSelected ? nodeColor : "#000000"}
        emissiveIntensity={hovered || isSelected ? 0.5 : 0}
        metalness={0.3}
        roughness={0.7}
      />

      {hovered && (
        <Html position={[0, hoverHeight + 0.95, 0]} center pointerEvents="none">
          <div className="px-4 py-3 rounded-lg bg-[#131313]/92 border border-white/20 text-white text-sm shadow-2xl min-w-[200px]">
            <p className="text-base font-semibold text-[#cbffc4] mb-2">
              {tooltip.title}
            </p>
            {tooltip.description && (
              <p className="text-xs text-white/80 mb-2">
                {tooltip.description}
              </p>
            )}
            {tooltip.meta &&
              Object.entries(tooltip.meta).map(([key, value]) => (
                <p key={key} className="text-xs text-white/70">
                  {key}: {String(value)}
                </p>
              ))}
          </div>
        </Html>
      )}
    </animated.mesh>
  );
}
