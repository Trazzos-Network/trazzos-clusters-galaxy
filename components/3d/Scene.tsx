"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import {
  useVisualizationStore,
  type ClusterVisualizationState,
} from "@/lib/store/visualization-store";
import { parseNodeRef } from "@/lib/utils/node-ids";
import Connections from "./Connections";
import Lighting from "./Lighting";
import MapPlane, {
  MAP_PLANE_DEFAULT_SIZE,
  MAP_PLANE_DEFAULT_THICKNESS,
} from "./MapPlane";
import Nodes from "./Nodes";
import ClusterLabels from "./overlays/ClusterLabels";

const FOCUS_DISTANCE = 18;
const ACCEL_FOCUS = 0.0055;
const DAMPING_FOCUS = 0.97;
const LOOK_ACCEL = 0.028;
const LOOK_DAMPING = 0.95;

interface CameraOrientation {
  defaultCameraPosition: THREE.Vector3;
  defaultLookTarget: THREE.Vector3;
}

function computeCameraOrientation(
  clusters: ClusterVisualizationState[]
): CameraOrientation {
  if (!clusters.length) {
    const fallbackHeight = MAP_PLANE_DEFAULT_SIZE * 1.5;
    return {
      defaultCameraPosition: new THREE.Vector3(
        0,
        fallbackHeight,
        fallbackHeight
      ),
      defaultLookTarget: new THREE.Vector3(0, 0, 0),
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  const halfPlaneSize = MAP_PLANE_DEFAULT_SIZE / 2;

  clusters.forEach((cluster) => {
    const [offsetX, offsetZ] = cluster.offset;
    minX = Math.min(minX, offsetX - halfPlaneSize);
    maxX = Math.max(maxX, offsetX + halfPlaneSize);
    minZ = Math.min(minZ, offsetZ - halfPlaneSize);
    maxZ = Math.max(maxZ, offsetZ + halfPlaneSize);

    cluster.enrichedCompanies.forEach((company) => {
      const [x, , z] = company.position3D;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minZ = Math.min(minZ, z);
      maxZ = Math.max(maxZ, z);
    });
  });

  if (!Number.isFinite(minX) || !Number.isFinite(maxX)) {
    const fallbackHeight = MAP_PLANE_DEFAULT_SIZE * 1.5;
    return {
      defaultCameraPosition: new THREE.Vector3(
        0,
        fallbackHeight,
        fallbackHeight
      ),
      defaultLookTarget: new THREE.Vector3(0, 0, 0),
    };
  }

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const spanX = Math.abs(maxX - minX);
  const spanZ = Math.abs(maxZ - minZ);
  const span = Math.max(spanX, spanZ, MAP_PLANE_DEFAULT_SIZE * 1.4);

  const height = span * 0.75;
  const distance = span * 0.65;

  return {
    defaultCameraPosition: new THREE.Vector3(
      centerX - distance * 0.45,
      height,
      centerZ + distance * 0.9
    ),
    defaultLookTarget: new THREE.Vector3(centerX, 0, centerZ),
  };
}

function CameraController({
  defaultCameraPosition,
  defaultLookTarget,
}: CameraOrientation) {
  const { camera } = useThree();
  const selectedNode = useVisualizationStore((state) => state.selectedNode);
  const hasInteracted = useVisualizationStore((state) => state.hasInteracted);
  const setCameraSettled = useVisualizationStore(
    (state) => state.setCameraSettled
  );
  const useOrbitControls = useVisualizationStore(
    (state) => state.debug.useOrbitControls
  );
  const nodeIndex = useVisualizationStore((state) => state.nodeIndex);
  const cameraVelocity = useRef(new THREE.Vector3());
  const lookVelocity = useRef(new THREE.Vector3());
  const lookTarget = useRef(defaultLookTarget.clone());
  const lastSelection = useRef<string | null>(null);

  const effectiveSelection = hasInteracted ? selectedNode : null;

  const targetPosition = useMemo(() => {
    if (!effectiveSelection) return defaultLookTarget.clone();
    const nodeEntry = nodeIndex[effectiveSelection];
    if (!nodeEntry) return defaultLookTarget.clone();

    return new THREE.Vector3(
      nodeEntry.position[0],
      nodeEntry.position[1],
      nodeEntry.position[2]
    );
  }, [defaultLookTarget, effectiveSelection, nodeIndex]);

  useEffect(() => {
    camera.position.copy(defaultCameraPosition);
    camera.lookAt(defaultLookTarget);
    lookTarget.current.copy(defaultLookTarget);
  }, [camera, defaultCameraPosition, defaultLookTarget]);

  useEffect(() => {
    if (lastSelection.current !== effectiveSelection) {
      cameraVelocity.current.set(0, 0, 0);
      lookVelocity.current.set(0, 0, 0);
      lastSelection.current = effectiveSelection ?? null;
    }
  }, [effectiveSelection]);

  useFrame((_, delta) => {
    if (useOrbitControls) {
      setCameraSettled(true);
      return;
    }

    const dt = Math.min(delta, 0.03);
    const hasSelection = Boolean(effectiveSelection);

    if (!hasSelection) {
      camera.position.lerp(defaultCameraPosition, 0.12);
      cameraVelocity.current.set(0, 0, 0);

      lookTarget.current.lerp(defaultLookTarget, 0.12);
      lookVelocity.current.set(0, 0, 0);
      camera.lookAt(lookTarget.current);
      setCameraSettled(false);
      return;
    }

    const parsed = parseNodeRef(effectiveSelection);
    const distanceFactor = parsed?.type === "synergy" ? 0.45 : 1;

    const horizontalDirection = targetPosition
      .clone()
      .sub(defaultLookTarget)
      .setY(0);
    if (horizontalDirection.lengthSq() < 1e-3) {
      horizontalDirection.set(1, 0, 0);
    } else {
      horizontalDirection.normalize();
    }

    const perpendicular = new THREE.Vector3(
      -horizontalDirection.z,
      0,
      horizontalDirection.x
    );

    const desiredPosition = targetPosition
      .clone()
      .add(
        horizontalDirection
          .clone()
          .multiplyScalar(-FOCUS_DISTANCE * 0.55 * distanceFactor)
      )
      .add(perpendicular.multiplyScalar(FOCUS_DISTANCE * 0.35))
      .add(new THREE.Vector3(0, FOCUS_DISTANCE * 0.85 * distanceFactor, 0));

    const positionDiff = desiredPosition.clone().sub(camera.position);
    cameraVelocity.current.addScaledVector(positionDiff, ACCEL_FOCUS);
    cameraVelocity.current.multiplyScalar(DAMPING_FOCUS);
    camera.position.addScaledVector(cameraVelocity.current, dt * 30);

    const lookDiff = targetPosition.clone().sub(lookTarget.current);
    lookVelocity.current.addScaledVector(lookDiff, LOOK_ACCEL);
    lookVelocity.current.multiplyScalar(LOOK_DAMPING);
    lookTarget.current.addScaledVector(lookVelocity.current, dt * 30);

    camera.lookAt(lookTarget.current);

    const hasSettled =
      positionDiff.length() < 0.4 &&
      lookDiff.length() < 0.4 &&
      cameraVelocity.current.length() < 0.02;
    setCameraSettled(hasSettled);
  });

  return null;
}

function TopCamera({
  defaultCameraPosition,
}: {
  defaultCameraPosition: THREE.Vector3;
}) {
  return (
    <PerspectiveCamera
      makeDefault
      position={[
        defaultCameraPosition.x,
        defaultCameraPosition.y,
        defaultCameraPosition.z,
      ]}
      fov={60}
    />
  );
}

function PostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.45}
        luminanceThreshold={0.12}
        luminanceSmoothing={0.9}
        mipmapBlur
        radius={0.49}
        kernelSize={3}
        blendFunction={BlendFunction.ADD}
      />
    </EffectComposer>
  );
}

export default function Scene() {
  const clusters = useVisualizationStore((state) => state.clusters);
  const debug = useVisualizationStore((state) => state.debug);

  const planeShadowConfigs = useMemo(
    () =>
      clusters.map((cluster) => {
        const [offsetX, offsetZ] = cluster.offset;
        const surfaceY = -0.6;
        return {
          id: cluster.id,
          position: [
            offsetX,
            surfaceY - MAP_PLANE_DEFAULT_THICKNESS / 2,
            offsetZ,
          ] as [number, number, number],
          size: MAP_PLANE_DEFAULT_SIZE,
        };
      }),
    [clusters]
  );

  const { defaultCameraPosition, defaultLookTarget } = useMemo(
    () => computeCameraOrientation(clusters),
    [clusters]
  );

  const axesHelper = useMemo(() => {
    const helper = new THREE.AxesHelper(32);
    helper.position.set(0, 0.02, 0);
    return helper;
  }, []);

  const gridHelper = useMemo(() => {
    const helper = new THREE.GridHelper(50, 25, "#4ade80", "#1f2937");
    helper.position.set(0, -0.59, 0);
    const material = helper.material;
    if (Array.isArray(material)) {
      material.forEach((mat) => {
        mat.transparent = true;
        mat.opacity = 0.28;
        mat.depthWrite = false;
      });
    } else {
      material.transparent = true;
      material.opacity = 0.28;
      material.depthWrite = false;
    }
    return helper;
  }, []);

  return (
    <Canvas shadows gl={{ antialias: true }}>
      <TopCamera defaultCameraPosition={defaultCameraPosition} />
      <CameraController
        defaultCameraPosition={defaultCameraPosition}
        defaultLookTarget={defaultLookTarget}
      />
      {debug.useOrbitControls && (
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan
          minDistance={12}
          maxDistance={140}
        />
      )}
      <Lighting planes={planeShadowConfigs} />

      {debug.showGrid && <primitive object={gridHelper} />}
      {debug.showAxes && <primitive object={axesHelper} />}

      {clusters.map((cluster) => (
        <MapPlane
          key={`plane-${cluster.id}`}
          position={[cluster.offset[0], -0.6, cluster.offset[1]]}
          size={MAP_PLANE_DEFAULT_SIZE}
          thickness={MAP_PLANE_DEFAULT_THICKNESS}
        />
      ))}

      <Nodes />
      {debug.showLabels && <ClusterLabels />}
      <Connections />
      <PostProcessing />
    </Canvas>
  );
}
