"use client";

import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { CONNECTION_COLORS } from "@/lib/utils/colors";
import ParticleFlow from "./ParticleFlow";
import type { SinergiaDetectada } from "@/types";
import SynergyMarker from "./SynergyHoverCard";
import {
  useVisualizationStore,
  type ClusterConnection,
} from "@/lib/store/visualization-store";
import { createSynergyNodeId } from "@/lib/utils/node-ids";

interface ConnectionLineProps {
  connection: ClusterConnection;
  duplicateIndex?: number;
  duplicateCount?: number;
}

const LINE_HEIGHT_OFFSET = -0.6;

export default function ConnectionLine({
  connection,
  duplicateIndex = 0,
  duplicateCount = 1,
}: ConnectionLineProps) {
  const [hovered, setHovered] = useState(false);
  const hoverDepth = useRef(0);

  const updateHover = (value: boolean) => {
    if (value) {
      hoverDepth.current += 1;
      setHovered(true);
    } else {
      hoverDepth.current = Math.max(0, hoverDepth.current - 1);
      if (hoverDepth.current === 0) {
        setHovered(false);
      }
    }
  };

  const setHoveredNode = useVisualizationStore((state) => state.setHoveredNode);

  const linePoints = useMemo(
    () =>
      connection.path.map(
        ([x, y, z]) => new THREE.Vector3(x, y + LINE_HEIGHT_OFFSET, z)
      ),
    [connection.path]
  );

  const pathMetrics = useMemo(() => {
    if (linePoints.length === 0) return null;

    const startPoint = linePoints[0]!.clone();
    const endPoint = linePoints[linePoints.length - 1]!.clone();
    const directionVector = endPoint.clone().sub(startPoint);

    if (linePoints.length === 1) {
      return {
        midPoint: startPoint,
        direction: directionVector,
        totalDistance: 0,
      };
    }

    let totalDistance = 0;
    const segments: {
      from: THREE.Vector3;
      to: THREE.Vector3;
      distance: number;
    }[] = [];

    for (let i = 0; i < linePoints.length - 1; i += 1) {
      const from = linePoints[i]!;
      const to = linePoints[i + 1]!;
      const distance = from.distanceTo(to);
      totalDistance += distance;
      segments.push({ from, to, distance });
    }

    if (totalDistance === 0) {
      return {
        midPoint: startPoint,
        direction: directionVector,
        totalDistance: 0,
      };
    }

    const halfDistance = totalDistance / 2;
    let accumulated = 0;
    let resolvedMid: THREE.Vector3 | null = null;

    for (const segment of segments) {
      if (accumulated + segment.distance >= halfDistance) {
        const remaining = halfDistance - accumulated;
        const ratio = remaining / segment.distance;
        resolvedMid = new THREE.Vector3().lerpVectors(
          segment.from,
          segment.to,
          Number.isFinite(ratio) ? ratio : 0.5
        );
        break;
      }
      accumulated += segment.distance;
    }

    if (!resolvedMid) {
      resolvedMid = segments[segments.length - 1]!.to.clone();
    }

    return {
      midPoint: resolvedMid,
      direction: directionVector,
      totalDistance,
    };
  }, [linePoints]);

  const midPoint = pathMetrics?.midPoint ?? null;

  const badgePosition = useMemo(() => {
    if (!midPoint) return null;
    const basePosition = midPoint.clone();

    if (duplicateCount > 1 && pathMetrics) {
      const tangent = pathMetrics.direction.clone();
      tangent.y = 0;
      if (tangent.lengthSq() < 1e-4) {
        tangent.set(1, 0, 0);
      } else {
        tangent.normalize();
      }

      const offsetIndex = duplicateIndex - (duplicateCount - 1) / 2;
      const spacingUnit =
        pathMetrics.totalDistance > 0
          ? Math.min(2.8, pathMetrics.totalDistance / (duplicateCount + 1))
          : 1.5;

      basePosition.add(tangent.multiplyScalar(offsetIndex * spacingUnit));
    }

    return [basePosition.x, basePosition.y + 0.6, basePosition.z] as [
      number,
      number,
      number
    ];
  }, [midPoint, duplicateCount, duplicateIndex, pathMetrics]);

  const synergyData =
    connection.type === "synergy"
      ? (connection.data as SinergiaDetectada | undefined)
      : undefined;

  const synergyNodeRef = useMemo(() => {
    if (!synergyData || connection.type !== "synergy") return null;
    return createSynergyNodeId(connection.clusterId, synergyData.id);
  }, [connection.clusterId, connection.type, synergyData]);

  const setHoverState = (value: boolean) => {
    if (connection.type !== "synergy") return;
    updateHover(value);
    if (!synergyNodeRef) return;
    const currentHovered = useVisualizationStore.getState().hoveredNode;
    if (value) {
      if (currentHovered !== synergyNodeRef) {
        setHoveredNode(synergyNodeRef);
      }
    } else if (currentHovered === synergyNodeRef) {
      setHoveredNode(null);
    }
  };

  const isBaseline = connection.type === "baseline";
  const particleColor = isBaseline
    ? null
    : (() => {
        switch (connection.type) {
          case "synergy":
            return CONNECTION_COLORS.synergy;
          case "supply":
            return CONNECTION_COLORS.supply;
          case "need":
            return CONNECTION_COLORS.need;
          case "rfp":
            return CONNECTION_COLORS.rfp;
          default:
            return CONNECTION_COLORS.synergy;
        }
      })();
  const lineColor = isBaseline
    ? CONNECTION_COLORS.mutedSynergy
    : CONNECTION_COLORS.synergy;
  return (
    <>
      <Line
        points={linePoints}
        color={lineColor}
        transparent={!isBaseline}
        opacity={isBaseline ? 1 : 0.9}
        lineWidth={isBaseline ? 1.8 : 1}
        toneMapped={false}
        blending={isBaseline ? THREE.NormalBlending : THREE.AdditiveBlending}
        depthWrite={isBaseline}
        depthTest
        onPointerOver={
          connection.type === "synergy"
            ? (event) => {
                event.stopPropagation();
                setHoverState(true);
              }
            : undefined
        }
        onPointerOut={
          connection.type === "synergy"
            ? (event) => {
                event.stopPropagation();
                setHoverState(false);
              }
            : undefined
        }
        onPointerDown={
          connection.type === "synergy"
            ? (event) => {
                event.stopPropagation();
              }
            : undefined
        }
      />
      {!isBaseline && particleColor && (
        <ParticleFlow
          path={linePoints}
          color={particleColor}
          strength={connection.strength}
        />
      )}
      {connection.type === "synergy" && synergyData && badgePosition && (
        <SynergyMarker
          hovered={hovered}
          position={badgePosition}
          sinergia={synergyData}
          onHoverChange={(value) => setHoverState(value)}
        />
      )}
    </>
  );
}
