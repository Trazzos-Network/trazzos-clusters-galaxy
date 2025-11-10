"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { CONNECTION_COLORS } from "@/lib/utils/colors";
import ParticleFlow from "./ParticleFlow";
import SynergyHoverCard, {
  getSynergyStateMeta,
  type SynergyStateMeta,
} from "./SynergyHoverCard";
import type { ClusterConnection } from "@/lib/store/visualization-store";
import type { SinergiaDetectada } from "@/types";
import { Html } from "@react-three/drei";

interface GroupedSynergyConnectionProps {
  connections: ClusterConnection[];
}

interface SynergyPositions {
  midPoint: THREE.Vector3;
  direction: THREE.Vector3;
  totalDistance: number;
}

interface GroupBadgeProps {
  position: [number, number, number];
  meta: SynergyStateMeta;
  count: number;
  onHoverChange: (hovered: boolean) => void;
  onPointerDown: () => void;
  progress: number;
}

function SynergyGroupBadge({
  position,
  meta,
  count,
  onHoverChange,
  onPointerDown,
  progress,
}: GroupBadgeProps) {
  const clamped = Math.min(Math.max(progress, 0), 1);
  const scale = 0.85 + 0.15 * clamped;
  const opacity = clamped;
  const pointerEnabled = clamped > 0.2;

  return (
    <Html
      sprite
      center
      position={position}
      distanceFactor={24}
      pointerEvents={pointerEnabled ? "auto" : "none"}
      style={{
        transform: `scale(${scale})`,
        opacity,
        transition: "transform 0.22s ease-out, opacity 0.22s ease-out",
        willChange: "transform, opacity",
      }}
    >
      <div
        onPointerEnter={() => onHoverChange(true)}
        onPointerLeave={() => onHoverChange(false)}
        onPointerDownCapture={onPointerDown}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "76px",
            height: "76px",
            borderRadius: "9999px",
            background: meta.background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 12px 26px ${meta.shadow}`,
            border: "2px solid var(--color-primary)",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "42px", lineHeight: 1 }}>{meta.emoji}</span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "-6px",
            right: "-6px",
            width: "32px",
            height: "32px",
            borderRadius: "9999px",
            background: "var(--color-primary)",
            border: "2px solid rgba(17, 24, 39, 0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: 700,
            color: "#0f172a",
            boxShadow: "0 6px 16px rgba(12, 74, 110, 0.45)",
          }}
        >
          {count}
        </div>
      </div>
    </Html>
  );
}

export default function GroupedSynergyConnection({
  connections,
}: GroupedSynergyConnectionProps) {
  const baseConnection = connections[0];
  const [groupHovered, setGroupHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const hoverDepth = useRef(0);
  const insidePointerDown = useRef(false);
  const animationProgressRef = useRef(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  const linePoints = useMemo(
    () =>
      baseConnection.path.map(([x, y, z]) => new THREE.Vector3(x, y - 0.6, z)),
    [baseConnection.path]
  );

  const markInsidePointerDown = () => {
    insidePointerDown.current = true;
    setTimeout(() => {
      insidePointerDown.current = false;
    }, 0);
  };

  const pathMetrics = useMemo<SynergyPositions | null>(() => {
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

  const collapsedPoint = useMemo(() => {
    if (!midPoint) return null;
    return new THREE.Vector3(midPoint.x, midPoint.y + 0.6, midPoint.z);
  }, [midPoint]);

  const offsetVectors = useMemo(() => {
    if (!midPoint || !pathMetrics || connections.length <= 1) return [];

    const tangent = pathMetrics.direction.clone();
    tangent.y = 0;
    if (tangent.lengthSq() < 1e-4) {
      tangent.set(1, 0, 0);
    } else {
      tangent.normalize();
    }

    const spacingUnit =
      pathMetrics.totalDistance > 0
        ? Math.min(2.4, pathMetrics.totalDistance / (connections.length + 1))
        : 1.4;

    const vectors: THREE.Vector3[] = [];

    for (let i = 0; i < connections.length; i += 1) {
      const offsetIndex = i - (connections.length - 1) / 2;
      const offset = tangent.clone().multiplyScalar(offsetIndex * spacingUnit);
      vectors.push(offset);
    }

    return vectors;
  }, [midPoint, pathMetrics, connections.length]);

  const finalPositions = useMemo(() => {
    if (!collapsedPoint) return [];

    return offsetVectors.map((offset) => {
      const target = collapsedPoint.clone();
      target.add(offset.clone().multiplyScalar(animationProgress));
      return [target.x, target.y, target.z] as [number, number, number];
    });
  }, [collapsedPoint, offsetVectors, animationProgress]);

  const averageStrength = useMemo(() => {
    return (
      connections.reduce((acc, connection) => acc + connection.strength, 0) /
      connections.length
    );
  }, [connections]);

  useEffect(() => {
    const target = isExpanded ? 1 : 0;
    const startValue = animationProgressRef.current;
    if (startValue === target) return;

    const duration = 240;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeIn = (t: number) => t * t * t;

    let frameId: number;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = target > startValue ? easeOut(t) : easeIn(t);
      const value = startValue + (target - startValue) * eased;
      animationProgressRef.current = value;
      setAnimationProgress(value);
      if (t < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isExpanded]);

  const handleEnter = () => {
    hoverDepth.current += 1;
    if (!groupHovered) {
      setGroupHovered(true);
    }
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleLeave = () => {
    hoverDepth.current = Math.max(0, hoverDepth.current - 1);
    if (hoverDepth.current === 0) {
      setGroupHovered(false);
      setActiveIndex(null);
      // Collapse after a short delay for smoother animation
      setTimeout(() => {
        if (hoverDepth.current === 0) {
          setIsExpanded(false);
        }
      }, 160);
    }
  };

  const handleCardHoverChange = (hovered: boolean, index: number) => {
    if (hovered) {
      handleEnter();
      setActiveIndex(index);
    } else {
      handleLeave();
      setActiveIndex((prev) => (prev === index ? null : prev));
    }
  };

  useEffect(() => {
    const handleGlobalPointerDown = () => {
      if (animationProgressRef.current <= 0) return;
      if (insidePointerDown.current) return;
      hoverDepth.current = 0;
      setGroupHovered(false);
      setActiveIndex(null);
      setIsExpanded(false);
    };

    window.addEventListener("pointerdown", handleGlobalPointerDown);
    return () => {
      window.removeEventListener("pointerdown", handleGlobalPointerDown);
    };
  }, []);

  const baseLineColor = CONNECTION_COLORS.synergy;

  const showExpanded = animationProgress > 0.01;
  const showGroupBadge = collapsedPoint && animationProgress < 0.99;
  const groupBadgeProgress = 1 - animationProgress;

  return (
    <>
      <Line
        points={linePoints}
        color={baseLineColor}
        transparent
        opacity={0.9}
        lineWidth={1}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest
        onPointerDown={(event) => {
          event.stopPropagation();
          markInsidePointerDown();
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          handleEnter();
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          handleLeave();
        }}
      />
      <ParticleFlow
        path={linePoints}
        color={CONNECTION_COLORS.synergy}
        strength={averageStrength}
      />

      {showExpanded && finalPositions.length === connections.length
        ? connections.map((connection, index) => {
            const position = finalPositions[index];
            const sinergia = connection.data as SinergiaDetectada | undefined;
            if (!sinergia) return null;

            return (
              <SynergyHoverCard
                key={`${connection.id}-expanded`}
                hovered={activeIndex === index}
                position={position}
                sinergia={sinergia}
                onHoverChange={(value) => handleCardHoverChange(value, index)}
                animationProgress={animationProgress}
                onPointerDown={markInsidePointerDown}
              />
            );
          })
        : null}

      {showGroupBadge ? (
        <SynergyGroupBadge
          position={
            collapsedPoint
              ? [collapsedPoint.x, collapsedPoint.y, collapsedPoint.z]
              : [0, 0, 0]
          }
          meta={getSynergyStateMeta(
            (connections[0].data as SinergiaDetectada).estado
          )}
          count={connections.length}
          onHoverChange={(value) => (value ? handleEnter() : handleLeave())}
          onPointerDown={markInsidePointerDown}
          progress={groupBadgeProgress}
        />
      ) : null}
    </>
  );
}
