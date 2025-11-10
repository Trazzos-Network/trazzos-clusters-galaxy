"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { CONNECTION_COLORS } from "@/lib/utils/colors";
import ParticleFlow from "./ParticleFlow";
import type { Connection } from "@/lib/data/process-data";

interface ConnectionLineProps {
  connection: Connection;
}

const LINE_HEIGHT_OFFSET = 0.05;

export default function ConnectionLine({ connection }: ConnectionLineProps) {
  const linePoints = useMemo(
    () =>
      connection.path.map(
        ([x, y, z]) => new THREE.Vector3(x, y + LINE_HEIGHT_OFFSET, z)
      ),
    [connection.path]
  );

  const particleColor =
    CONNECTION_COLORS[connection.type] || CONNECTION_COLORS.synergy;
  const lineColor = CONNECTION_COLORS.synergy;
  return (
    <>
      <Line
        points={linePoints}
        color={lineColor}
        transparent
        opacity={0.9}
        lineWidth={1}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
      <ParticleFlow
        path={linePoints}
        color={particleColor}
        strength={connection.strength}
      />
    </>
  );
}
