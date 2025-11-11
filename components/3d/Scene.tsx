"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
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
import Stars from "./Stars";

const FOCUS_DISTANCE = 26;
const ACCEL_FOCUS = 0.0032;
const DAMPING_FOCUS = 0.92;
const LOOK_ACCEL = 0.02;
const LOOK_DAMPING = 0.9;
const TILT_SENSITIVITY = 0.05;
const TILT_LERP = 0.06;
const MAX_TILT = THREE.MathUtils.degToRad(3);

interface CameraOrientation {
  defaultCameraPosition: THREE.Vector3;
  defaultLookTarget: THREE.Vector3;
  centerOffset: THREE.Vector3;
}

function computeBoundingBox(clusters: ClusterVisualizationState[]): {
  center: THREE.Vector3;
  span: number;
} {
  if (!clusters.length) {
    const fallbackHeight = MAP_PLANE_DEFAULT_SIZE * 1.4;
    return {
      center: new THREE.Vector3(0, 0, 0),
      span: fallbackHeight,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  const halfPlaneSize = MAP_PLANE_DEFAULT_SIZE;

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
    const fallbackHeight = MAP_PLANE_DEFAULT_SIZE * 1.4;
    return {
      center: new THREE.Vector3(0, 0, 0),
      span: fallbackHeight,
    };
  }

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;
  const spanX = Math.abs(maxX - minX);
  const spanZ = Math.abs(maxZ - minZ);
  const span = Math.max(spanX, spanZ, MAP_PLANE_DEFAULT_SIZE * 1.1);

  return {
    center: new THREE.Vector3(centerX, 0, centerZ),
    span,
  };
}

function computeCameraOrientation(
  clusters: ClusterVisualizationState[]
): CameraOrientation {
  const { center, span } = computeBoundingBox(clusters);
  const height = span * 0.9;

  return {
    defaultCameraPosition: new THREE.Vector3(0, height, 0),
    defaultLookTarget: new THREE.Vector3(0, 0, 0),
    centerOffset: center,
  };
}

function CameraController({
  defaultCameraPosition,
  defaultLookTarget,
  centerOffset,
}: CameraOrientation) {
  const { camera } = useThree();
  const selectedNode = useVisualizationStore((state) => state.selectedNode);
  const hasInteracted = useVisualizationStore((state) => state.hasInteracted);
  const setCameraSettled = useVisualizationStore(
    (state) => state.setCameraSettled
  );
  const setCameraTelemetry = useVisualizationStore(
    (state) => state.setCameraTelemetry
  );
  const useOrbitControls = useVisualizationStore(
    (state) => state.debug.useOrbitControls
  );
  const nodeIndex = useVisualizationStore((state) => state.nodeIndex);
  const cameraVelocity = useRef(new THREE.Vector3());
  const lookVelocity = useRef(new THREE.Vector3());
  const lookTarget = useRef(defaultLookTarget.clone());
  const lastSelection = useRef<string | null>(null);
  const mouseTilt = useRef(new THREE.Vector2(0, 0));
  const tiltVelocity = useRef(new THREE.Vector2(0, 0));

  const effectiveSelection = hasInteracted ? selectedNode : null;

  const targetPosition = useMemo(() => {
    if (!effectiveSelection) return defaultLookTarget.clone();
    const nodeEntry = nodeIndex[effectiveSelection];
    if (!nodeEntry) return defaultLookTarget.clone();

    return new THREE.Vector3(
      nodeEntry.position[0] - centerOffset.x,
      nodeEntry.position[1],
      nodeEntry.position[2] - centerOffset.z
    );
  }, [centerOffset, defaultLookTarget, effectiveSelection, nodeIndex]);

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

  useFrame((state, delta) => {
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

    const distance = FOCUS_DISTANCE * distanceFactor;
    const desiredPosition = targetPosition
      .clone()
      .add(new THREE.Vector3(-distance * 0.5, distance * 0.75, distance * 0.5));

    const positionDiff = desiredPosition.clone().sub(camera.position);
    cameraVelocity.current.addScaledVector(positionDiff, ACCEL_FOCUS);
    cameraVelocity.current.multiplyScalar(DAMPING_FOCUS);
    camera.position.addScaledVector(cameraVelocity.current, dt * 30);

    const lookDiff = targetPosition.clone().sub(lookTarget.current);
    lookVelocity.current.addScaledVector(lookDiff, LOOK_ACCEL);
    lookVelocity.current.multiplyScalar(LOOK_DAMPING);
    lookTarget.current.addScaledVector(lookVelocity.current, dt * 30);

    const pointer = state.pointer;
    const targetTiltX = THREE.MathUtils.clamp(
      pointer.y * TILT_SENSITIVITY,
      -MAX_TILT,
      MAX_TILT
    );
    const targetTiltY = THREE.MathUtils.clamp(
      pointer.x * TILT_SENSITIVITY,
      -MAX_TILT,
      MAX_TILT
    );
    tiltVelocity.current.lerp(
      new THREE.Vector2(targetTiltX, targetTiltY),
      TILT_LERP
    );
    mouseTilt.current.copy(tiltVelocity.current);

    const tiltMatrix = new THREE.Matrix4()
      .makeRotationX(mouseTilt.current.x)
      .multiply(new THREE.Matrix4().makeRotationY(mouseTilt.current.y));
    const tiltedForward = new THREE.Vector3(0, 0, -1).applyMatrix4(tiltMatrix);
    const tiltedUp = new THREE.Vector3(0, 1, 0).applyMatrix4(tiltMatrix);

    const cameraDirection = lookTarget.current.clone().sub(camera.position);
    const baseOrientation = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, -1),
      cameraDirection.clone().normalize()
    );
    const tiltQuaternion = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(new THREE.Vector3(), tiltedForward, tiltedUp)
    );
    baseOrientation.multiply(tiltQuaternion);
    camera.quaternion.slerp(baseOrientation, 0.12);

    const worldDir = new THREE.Vector3();
    camera.getWorldDirection(worldDir);
    setCameraTelemetry({
      position: [camera.position.x, camera.position.y, camera.position.z],
      rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z],
      direction: [worldDir.x, worldDir.y, worldDir.z],
    });

    const hasSettled =
      positionDiff.length() < 0.25 &&
      lookDiff.length() < 0.25 &&
      cameraVelocity.current.length() < 0.01;
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
  const selectedNode = useVisualizationStore((state) => state.selectedNode);
  const hasInteracted = useVisualizationStore((state) => state.hasInteracted);

  const planeShadowConfigs = useMemo(() => {
    const { center } = computeBoundingBox(clusters);
    return clusters.map((cluster) => {
      const [offsetX, offsetZ] = cluster.offset;
      const surfaceY = -0.6;
      return {
        id: cluster.id,
        position: [
          offsetX - center.x,
          surfaceY - MAP_PLANE_DEFAULT_THICKNESS / 2,
          offsetZ - center.z,
        ] as [number, number, number],
        size: MAP_PLANE_DEFAULT_SIZE,
      };
    });
  }, [clusters]);

  const { defaultCameraPosition, defaultLookTarget, centerOffset } = useMemo(
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

  const sceneCenter = centerOffset;

  const groundSpring = useSpring({
    scale: hasInteracted && selectedNode ? 1 : 0,
    config: { tension: 120, friction: 18, precision: 0.0001 },
  });

  return (
    <Canvas shadows gl={{ antialias: true }}>
      <Stars count={3500} radius={420} />
      <TopCamera defaultCameraPosition={defaultCameraPosition} />
      <CameraController
        defaultCameraPosition={defaultCameraPosition}
        defaultLookTarget={defaultLookTarget}
        centerOffset={centerOffset}
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

      <group position={[-sceneCenter.x, 0, -sceneCenter.z]}>
        <animated.group
          scale={groundSpring.scale.to((value) => [value, value, value])}
          name="ground"
        >
          {clusters.map((cluster) => (
            <MapPlane
              key={`plane-${cluster.id}`}
              position={[cluster.offset[0], -0.6, cluster.offset[1]]}
              size={MAP_PLANE_DEFAULT_SIZE}
              thickness={MAP_PLANE_DEFAULT_THICKNESS}
            />
          ))}
        </animated.group>

        <Nodes />
        {debug.showLabels && <ClusterLabels />}
        <Connections />
      </group>
      <PostProcessing />
    </Canvas>
  );
}
