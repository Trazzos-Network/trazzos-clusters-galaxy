"use client";

import { memo, useMemo } from "react";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

interface StarsProps {
  count?: number;
  radius?: number;
}

function generatePositions(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = Math.pow(Math.random(), 0.4) * radius;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));

    const x = r * Math.sin(phi) * Math.cos(theta);
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = -Math.abs(r * Math.cos(phi)) - 16;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

function Stars({ count = 2500, radius = 280 }: StarsProps) {
  const positions = useMemo(
    () => generatePositions(count, radius),
    [count, radius]
  );

  return (
    <group>
      <Points positions={positions} stride={3} frustumCulled>
        <PointMaterial
          transparent
          color="#d0d9e3"
          size={0.7}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      <Points
        positions={positions}
        stride={3}
        frustumCulled
        rotation={[0, 0, Math.PI / 4]}
      >
        <PointMaterial
          transparent
          color="#8b9cb0"
          size={0.45}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

export default memo(Stars);
