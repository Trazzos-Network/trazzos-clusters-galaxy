"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticleFlowProps {
  path: THREE.Vector3[];
  color: string;
  strength: number;
}

interface Particle {
  progress: number;
}

const EPSILON = 1e-4;

export default function ParticleFlow({
  path,
  color,
  strength,
}: ParticleFlowProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const particlesRef = useRef<Particle[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tempVector = useMemo(() => new THREE.Vector3(), []);

  const capsuleGeometry = useMemo(
    () => new THREE.CapsuleGeometry(0.14, 0.36, 8, 16),
    []
  );

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 2,
      transparent: true,
      opacity: 0.95,
      metalness: 0.2,
      roughness: 0.4,
    });
    mat.toneMapped = false;
    mat.depthWrite = false;
    mat.blending = THREE.AdditiveBlending;
    return mat;
  }, [color]);

  useEffect(() => () => capsuleGeometry.dispose(), [capsuleGeometry]);
  useEffect(() => () => material.dispose(), [material]);

  const pathData = useMemo(() => {
    if (path.length < 2) {
      return {
        segments: [] as Array<{
          start: THREE.Vector3;
          length: number;
          direction: THREE.Vector3;
          quaternion: THREE.Quaternion;
          cumulativeStart: number;
        }>,
        totalLength: 0,
      };
    }

    const segments: Array<{
      start: THREE.Vector3;
      length: number;
      direction: THREE.Vector3;
      quaternion: THREE.Quaternion;
      cumulativeStart: number;
    }> = [];

    let cumulative = 0;

    for (let i = 0; i < path.length - 1; i += 1) {
      const start = path[i];
      const end = path[i + 1];
      const vector = new THREE.Vector3().subVectors(end, start);
      const length = vector.length();

      if (length <= EPSILON) continue;

      const direction = vector.clone().normalize();
      const quaternion = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
      );

      segments.push({
        start: start.clone(),
        length,
        direction,
        quaternion,
        cumulativeStart: cumulative,
      });

      cumulative += length;
    }

    return { segments, totalLength: cumulative };
  }, [path]);

  const particleCount = useMemo(
    () => Math.max(1, Math.ceil(strength * 4)),
    [strength]
  );

  const progressSpeed = useMemo(() => {
    if (pathData.totalLength <= EPSILON) return 0;
    const baseSpeed = Math.max(0.2, strength * 10);
    return baseSpeed / pathData.totalLength;
  }, [strength, pathData.totalLength]);

  useEffect(() => {
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      progress: i / particleCount,
    }));
  }, [particleCount]);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.count = particleCount;
    meshRef.current.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [particleCount]);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const { segments, totalLength } = pathData;

    if (
      !mesh ||
      particlesRef.current.length === 0 ||
      totalLength <= EPSILON ||
      segments.length === 0
    ) {
      return;
    }

    particlesRef.current.forEach((particle, index) => {
      particle.progress += progressSpeed * delta;
      if (particle.progress > 1) {
        particle.progress -= 1;
      }

      const distanceAlong = particle.progress * totalLength;

      let segment = segments[segments.length - 1];
      for (let i = 0; i < segments.length; i += 1) {
        const candidate = segments[i];
        if (distanceAlong <= candidate.cumulativeStart + candidate.length) {
          segment = candidate;
          break;
        }
      }

      const distanceOnSegment = distanceAlong - segment.cumulativeStart;
      const segmentProgress = distanceOnSegment / segment.length;

      tempVector
        .copy(segment.direction)
        .multiplyScalar(segment.length * segmentProgress)
        .add(segment.start);

      const pulse =
        0.85 +
        Math.sin((state.clock.elapsedTime + particle.progress) * Math.PI * 2) *
          0.25;

      dummy.position.copy(tempVector);
      dummy.quaternion.copy(segment.quaternion);
      dummy.scale.set(0.6 * pulse, 1.3 * pulse, 0.6 * pulse);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[capsuleGeometry, material, particleCount]}
      castShadow={false}
      receiveShadow={false}
      frustumCulled={false}
    />
  );
}
