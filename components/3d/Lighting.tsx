"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { COLORS } from "@/lib/utils/colors";

interface ShadowPlaneConfig {
  id: string;
  position: [number, number, number];
  size: number;
}

interface LightingProps {
  planes: ShadowPlaneConfig[];
}

const SHADOW_HEIGHT = 24;
const SHADOW_MAP_SIZE = 1536;

function PlaneShadowLight({
  position,
  size,
}: {
  position: [number, number, number];
  size: number;
}) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const [x, y, z] = position;

  useEffect(() => {
    const light = lightRef.current;
    if (!light) {
      return;
    }

    light.target.position.set(x, y, z);
    light.target.updateMatrixWorld();

    const camera = light.shadow.camera as THREE.OrthographicCamera;
    const halfSize = size / 2;

    camera.left = -halfSize;
    camera.right = halfSize;
    camera.top = halfSize;
    camera.bottom = -halfSize;
    camera.near = 0.4;
    camera.far = SHADOW_HEIGHT + size * 1.4;
    camera.updateProjectionMatrix();
  }, [size, x, y, z]);

  useEffect(() => {
    const light = lightRef.current;
    return () => {
      light?.shadow.map?.dispose();
    };
  }, []);

  return (
    <group>
      <directionalLight
        ref={lightRef}
        position={[x + size * 0.35, y + SHADOW_HEIGHT, z + size * 0.35]}
        intensity={0.55}
        color={COLORS.foreground}
        castShadow
        shadow-mapSize-width={SHADOW_MAP_SIZE}
        shadow-mapSize-height={SHADOW_MAP_SIZE}
        shadow-radius={6}
        shadow-bias={-0.00008}
        shadow-normalBias={0.01}
      />
    </group>
  );
}

export default function Lighting({ planes }: LightingProps) {
  return (
    <>
      <ambientLight intensity={0.75} color="#ffffff" />

      <directionalLight
        position={[18, 26, 18]}
        intensity={0.28}
        color="#ffffff"
      />

      {planes.map((plane) => (
        <PlaneShadowLight
          key={`plane-shadow-${plane.id}`}
          position={plane.position}
          size={plane.size}
        />
      ))}

      <directionalLight
        position={[-18, 16, -18]}
        intensity={0.18}
        color="#ffffff"
      />
    </>
  );
}
