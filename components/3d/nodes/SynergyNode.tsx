"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { useVisualizationStore } from "@/lib/store/visualization-store";
import type { NodeRef } from "@/lib/utils/node-ids";
import { NODE_COLORS } from "@/lib/utils/colors";
import type { SinergiaDetectada } from "@/types";

interface SynergyNodeProps {
  sinergia: SinergiaDetectada;
  position: [number, number, number];
  nodeId: NodeRef;
}

const ORBIT_RADIUS = 0.6;
const ORBIT_HEIGHT = 0.4;
const SPHERE_RADIUS = 0.22;
const BASE_HEIGHT = 1.2;
const ORBIT_SPEED = 3.2;
const TRAIL_POINTS = 24;

export default function SynergyNode({
  sinergia,
  position,
  nodeId,
}: SynergyNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereARef = useRef<THREE.Mesh>(null);
  const sphereBRef = useRef<THREE.Mesh>(null);
  const trailARef = useRef<THREE.LineSegments>(null);
  const trailBRef = useRef<THREE.LineSegments>(null);
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

  const isSelected = selectedNode === nodeId;
  const highlight = hovered || isSelected;

  const sphereGeometry = useMemo(
    () => new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32),
    []
  );

  const trailGeometryA = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new Array(TRAIL_POINTS * 3).fill(0), 3)
    );
    return geometry;
  }, []);

  const trailGeometryB = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new Array(TRAIL_POINTS * 3).fill(0), 3)
    );
    return geometry;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const baseY = BASE_HEIGHT + Math.sin(time * 0.6 + position[0]) * 0.15;

    if (groupRef.current) {
      groupRef.current.position.set(position[0], baseY, position[2]);
    }

    const phase = time * ORBIT_SPEED;

    const updateSphere = (
      mesh: THREE.Mesh | null,
      trail: THREE.LineSegments | null,
      positions: THREE.BufferAttribute,
      offset: number
    ) => {
      if (!mesh) return;
      const angle = phase + offset;
      const x = Math.cos(angle) * ORBIT_RADIUS * 0.8;
      const z = Math.sin(angle * 2.3) * ORBIT_RADIUS * 0.45;
      const y = Math.sin(angle * 1.4) * ORBIT_HEIGHT * 0.6;

      mesh.position.set(x, y, z);
      mesh.rotation.y = angle;

      for (let i = 0; i < TRAIL_POINTS; i += 1) {
        const t = angle - (i / TRAIL_POINTS) * Math.PI * 2;
        const px = Math.cos(t) * ORBIT_RADIUS * 0.8;
        const pz = Math.sin(t * 2) * ORBIT_RADIUS * 0.4;
        const py = Math.sin(t) * ORBIT_HEIGHT * 0.5;
        positions.setXYZ(i, px, py, pz);
      }
      positions.needsUpdate = true;

      if (trail) {
        trail.visible = highlight;
      }
    };

    const positionsA = trailGeometryA.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const positionsB = trailGeometryB.getAttribute(
      "position"
    ) as THREE.BufferAttribute;

    updateSphere(sphereARef.current, trailARef.current, positionsA, 0);
    updateSphere(sphereBRef.current, trailBRef.current, positionsB, Math.PI);
  });

  return (
    <group
      ref={groupRef}
      position={[position[0], BASE_HEIGHT, position[2]]}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        setHoveredNode(nodeId);
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
        setSelectedNode(nodeId);
        setConnectionMode("focus");
      }}
    >
      <group>
        <mesh
          ref={sphereARef}
          geometry={sphereGeometry}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={NODE_COLORS.synergy}
            emissive={NODE_COLORS.synergy}
            emissiveIntensity={highlight ? 1.2 : 0.4}
            metalness={0.3}
            roughness={0.35}
          />
        </mesh>
        <lineSegments ref={trailARef} geometry={trailGeometryA}>
          <lineBasicMaterial
            color={NODE_COLORS.synergy}
            transparent
            opacity={highlight ? 0.55 : 0.3}
          />
        </lineSegments>
      </group>

      <group>
        <mesh
          ref={sphereBRef}
          geometry={sphereGeometry}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={"#ffffff"}
            emissive={NODE_COLORS.synergy}
            emissiveIntensity={highlight ? 0.9 : 0.3}
            metalness={0.25}
            roughness={0.3}
          />
        </mesh>
        <lineSegments ref={trailBRef} geometry={trailGeometryB}>
          <lineBasicMaterial
            color={"#d2fff6"}
            transparent
            opacity={highlight ? 0.5 : 0.25}
          />
        </lineSegments>
      </group>

      {hovered && (
        <Html position={[0, BASE_HEIGHT + 1.4, 0]} center pointerEvents="none">
          <div className="px-4 py-3 rounded-lg bg-[#131313]/92 border border-white/25 text-white text-sm shadow-2xl min-w-[210px]">
            <p className="text-base font-semibold text-[#cbffc4] mb-2">
              {sinergia.insumo}
            </p>
            <p className="text-xs text-white/80 mb-2">
              Empresas: {sinergia.empresas.join(", ")}
            </p>
            <p className="text-xs text-white/70">
              Volumen: {sinergia.volumen_total} {sinergia.unidad_medida}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
