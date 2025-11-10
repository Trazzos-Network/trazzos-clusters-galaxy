"use client";

import * as THREE from "three";
import { useMemo, useEffect } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

import { THEME } from "@/app/config/theme";

export const MAP_PLANE_DEFAULT_SIZE = 50;
export const MAP_PLANE_DEFAULT_THICKNESS = 0.8;

interface MapPlaneProps {
  position?: [number, number, number];
  size?: number;
  thickness?: number;
  cornerRadius?: number;
  cornerSegments?: number;
}

export default function MapPlane({
  position = [0, -0.6, 0],
  size = MAP_PLANE_DEFAULT_SIZE,
  thickness = MAP_PLANE_DEFAULT_THICKNESS,
  cornerRadius = 1,
  cornerSegments = 6,
}: MapPlaneProps) {
  const getCssVariable = (name: string, fallback: string) => {
    if (typeof window === "undefined") return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(
      name
    );
    return value?.trim() || fallback;
  };

  const cardColor = useMemo(
    () => getCssVariable("--colors-card", "#565656"),
    []
  );

  const sideColor = THEME.nodes.primary;

  const texture = useMemo(() => {
    const texSize = 64;
    const canvas = document.createElement("canvas");
    canvas.width = texSize;
    canvas.height = texSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, texSize, texSize);

    const drawDot = (x: number, y: number, r: number, opacity: number) => {
      ctx.beginPath();
      const alpha = Math.min(Math.max(opacity / 255, 0), 1);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    drawDot(texSize * 0.1, texSize * 0.1, 1.2, 200);
    drawDot(texSize * 0.6, texSize * 0.1, 1.1, 200);
    drawDot(texSize * 0.1, texSize * 0.6, 1.1, 200);
    drawDot(texSize * 0.6, texSize * 0.6, 1.0, 200);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(25, 25);
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  const geometry = useMemo(() => {
    const smallestDimension = Math.min(size, thickness);
    const maxAllowedRadius = Math.max(smallestDimension / 2 - 0.01, 0);
    const constrainedRadius = Math.max(
      Math.min(cornerRadius, maxAllowedRadius),
      0
    );
    return new RoundedBoxGeometry(
      size,
      thickness,
      size,
      cornerSegments,
      Math.max(constrainedRadius, 0)
    );
  }, [cornerRadius, cornerSegments, size, thickness]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  const meshPosition = useMemo<[number, number, number]>(() => {
    const [x, y, z] = position;
    return [x, y - thickness / 2, z];
  }, [position, thickness]);

  const materials = useMemo<THREE.MeshStandardMaterial[]>(() => {
    const topBottom = new THREE.MeshStandardMaterial({
      color: cardColor,
      map: texture ?? undefined,
      roughness: 0.92,
      metalness: 0.03,
      side: THREE.DoubleSide,
    });

    const side = new THREE.MeshStandardMaterial({
      color: sideColor,
      roughness: 0.92,
      metalness: 0.03,
    });

    return [side, side, topBottom, topBottom, side, side];
  }, [cardColor, sideColor, texture]);

  useEffect(() => {
    return () => {
      const uniqueMaterials = new Set(materials);
      uniqueMaterials.forEach((material) => {
        material.dispose();
      });
    };
  }, [materials]);

  return (
    <mesh
      position={meshPosition}
      receiveShadow
      castShadow
      geometry={geometry}
      material={materials}
    />
  );
}
