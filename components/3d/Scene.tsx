"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { XR, useXRHitTest, useXRStore, createXRStore } from "@react-three/xr";
import {
  useVisualizationStore,
  type ClusterVisualizationState,
  type VisualizationState,
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
const AR_PLACEMENT_OFFSET = 0.05;

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
}: Pick<CameraOrientation, "defaultCameraPosition" | "defaultLookTarget">) {
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
  const cameraVelocity = useRef(new THREE.Vector3());
  const lookVelocity = useRef(new THREE.Vector3());
  const lookTarget = useRef(defaultLookTarget.clone());
  const lastSelection = useRef<string | null>(null);
  const mouseTilt = useRef(new THREE.Vector2(0, 0));
  const tiltVelocity = useRef(new THREE.Vector2(0, 0));

  const effectiveSelection = hasInteracted ? selectedNode : null;

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
    const anchor = defaultLookTarget;
    const baseOffset = new THREE.Vector3(
      -distance * 0.8,
      distance * 1.5,
      distance * 1.25
    );

    const desiredPosition = anchor.clone().add(baseOffset);

    const positionDiff = desiredPosition.clone().sub(camera.position);
    cameraVelocity.current.addScaledVector(positionDiff, ACCEL_FOCUS);
    cameraVelocity.current.multiplyScalar(DAMPING_FOCUS);
    camera.position.addScaledVector(cameraVelocity.current, dt * 30);

    const lookDiff = defaultLookTarget.clone().sub(lookTarget.current);
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

function useWebGLSupport() {
  return useMemo(() => {
    if (typeof document === "undefined") {
      return true;
    }

    try {
      const canvas = document.createElement("canvas");
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: false,
        premultipliedAlpha: false,
      });
      const context = renderer.getContext();
      renderer.dispose();
      if (context) {
        return true;
      }
    } catch {
      // fall through to second attempt
    }

    try {
      const canvas = document.createElement("canvas");
      const context =
        canvas.getContext("webgl2", { alpha: true }) ||
        canvas.getContext("webgl", { alpha: true }) ||
        canvas.getContext("experimental-webgl", { alpha: true });
      return Boolean(context);
    } catch {
      return false;
    }
  }, []);
}

function WebGLFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#050505] text-center text-sm text-white/70">
      WebGL no está disponible en este dispositivo/navegador.
    </div>
  );
}

function StandardSceneCanvas() {
  const clusters = useVisualizationStore((state) => state.clusters);
  const debug = useVisualizationStore((state) => state.debug);
  const selectedNode = useVisualizationStore((state) => state.selectedNode);
  const hasInteracted = useVisualizationStore((state) => state.hasInteracted);
  const webglSupport = useWebGLSupport();

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
    const helper = new THREE.GridHelper(50, 25, "#ffffff", "#74b600");
    helper.position.set(0, -0.59, 0);
    const material = helper.material;
    if (Array.isArray(material)) {
      material.forEach((mat) => {
        mat.transparent = true;
        mat.opacity = 0.01;
        mat.depthWrite = false;
      });
    } else {
      material.transparent = true;
      material.opacity = 0.01;
      material.depthWrite = false;
    }
    return helper;
  }, []);

  const sceneCenter = centerOffset;

  const groundSpring = useSpring({
    scale: hasInteracted && selectedNode ? 1 : 0,
    config: { tension: 120, friction: 18, precision: 0.0001 },
  });

  if (!webglSupport) {
    return <WebGLFallback />;
  }

  return (
    <Canvas shadows gl={{ antialias: true }}>
      <Stars count={3500} radius={420} />
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

type XRStoreInstance = ReturnType<typeof createXRStore>;

type ARSceneContentProps = {
  clusters: ClusterVisualizationState[];
  debug: VisualizationState["debug"];
  center: THREE.Vector3;
  span: number;
  hasPlacement: boolean;
  setHasPlacement: Dispatch<SetStateAction<boolean>>;
  setCameraSettled: (settled: boolean) => void;
};

function ARSceneContent({
  clusters,
  debug,
  center,
  span,
  hasPlacement,
  setHasPlacement,
  setCameraSettled,
}: ARSceneContentProps) {
  const anchorRef = useRef<THREE.Group>(null);
  const reticleRef = useRef<THREE.Mesh>(null);
  const placementSpring = useSpring({
    scale: hasPlacement ? 1 : 0,
    config: { tension: 120, friction: 20, precision: 0.0001 },
  });

  const tableFittedScale = useMemo(() => {
    const targetSpanMeters = 0.65; // approximate tabletop width
    if (!Number.isFinite(span) || span <= 0) {
      return 1;
    }

    const scaled = targetSpanMeters / span;
    return Math.min(0.6, Math.max(0.02, scaled));
  }, [span]);

  const tempPosition = useMemo(() => new THREE.Vector3(), []);
  const tempQuaternion = useMemo(() => new THREE.Quaternion(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);

  useXRHitTest(
    (results, getWorldMatrix) => {
      if (!results.length) {
        return;
      }

      const hit = results[0];
      const hasMatrix = getWorldMatrix(tempMatrix, hit);
      if (!hasMatrix) {
        return;
      }

      tempMatrix.decompose(tempPosition, tempQuaternion, tempScale);

      if (reticleRef.current) {
        reticleRef.current.visible = true;
        reticleRef.current.position.copy(tempPosition);
        reticleRef.current.quaternion.copy(tempQuaternion);
      }

      if (anchorRef.current) {
        anchorRef.current.position.set(
          tempPosition.x,
          tempPosition.y + AR_PLACEMENT_OFFSET,
          tempPosition.z
        );
        anchorRef.current.quaternion.copy(tempQuaternion);
      }

      if (!hasPlacement) {
        setHasPlacement(true);
        setCameraSettled(true);
      }
    },
    "viewer",
    ["plane", "mesh"]
  );

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight position={[1, 1.6, 0]} intensity={0.65} />

      <mesh ref={reticleRef} visible={false} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.09, 0.12, 32]} />
        <meshBasicMaterial
          color="#76ffd1"
          side={THREE.DoubleSide}
          transparent
          opacity={0.6}
        />
      </mesh>

      <animated.group
        ref={anchorRef}
        scale={placementSpring.scale.to((value) => {
          const scaled = value * tableFittedScale;
          return [scaled, scaled, scaled];
        })}
      >
        <group position={[-center.x, 0, -center.z]}>
          {clusters.map((cluster) => (
            <MapPlane
              key={`plane-ar-${cluster.id}`}
              position={[cluster.offset[0], -0.6, cluster.offset[1]]}
              size={MAP_PLANE_DEFAULT_SIZE}
              thickness={MAP_PLANE_DEFAULT_THICKNESS}
            />
          ))}
          <Nodes />
          {debug.showLabels && <ClusterLabels />}
          <Connections />
        </group>
      </animated.group>
    </>
  );
}

function AutoEnterAR({ onError }: { onError: (error: unknown) => void }) {
  const store = useXRStore();

  useEffect(() => {
    let active = true;

    const beginSession = async () => {
      try {
        await store.enterAR();
      } catch (error) {
        console.error("Failed to start AR session", error);
        if (active) {
          onError(error);
        }
      }
    };

    void beginSession();

    return () => {
      active = false;
      const session = store.getState().session;
      session?.end()?.catch(() => {});
    };
  }, [store, onError]);

  return null;
}

function ARSceneCanvas({
  store,
  onSessionError,
}: {
  store: XRStoreInstance;
  onSessionError: (error: unknown) => void;
}) {
  const clusters = useVisualizationStore((state) => state.clusters);
  const debug = useVisualizationStore((state) => state.debug);
  const setCameraSettled = useVisualizationStore(
    (state) => state.setCameraSettled
  );
  const webglSupport = useWebGLSupport();

  const { center, span } = useMemo(
    () => computeBoundingBox(clusters),
    [clusters]
  );
  const [hasPlacement, setHasPlacement] = useState(false);

  if (!webglSupport) {
    return <WebGLFallback />;
  }

  return (
    <Canvas shadows gl={{ antialias: true, alpha: true }}>
      <XR store={store}>
        <AutoEnterAR onError={onSessionError} />
        <ARSceneContent
          clusters={clusters}
          debug={debug}
          center={center}
          span={span}
          hasPlacement={hasPlacement}
          setHasPlacement={setHasPlacement}
          setCameraSettled={setCameraSettled}
        />
      </XR>
    </Canvas>
  );
}

export default function Scene() {
  const xrMode = useVisualizationStore((state) => state.xrMode);
  const setXRMode = useVisualizationStore((state) => state.setXRMode);

  const xrStore = useMemo(() => {
    return createXRStore({
      controller: false,
      hand: false,
      transientPointer: false,
      screenInput: false,
      hitTest: true,
      planeDetection: true,
      meshDetection: false,
      offerSession: false,
    });
  }, []);

  useEffect(() => {
    async function ensureSession() {
      if (!xrMode) {
        const session = xrStore.getState().session;
        if (session) {
          await session.end().catch(() => {});
        }
        return;
      }

      if (typeof navigator === "undefined" || !("xr" in navigator)) {
        setXRMode(false);
        return;
      }

      const system = navigator.xr as XRSystem;
      const supported =
        typeof system.isSessionSupported === "function"
          ? await system.isSessionSupported("immersive-ar").catch(() => false)
          : true;

      if (!supported) {
        setXRMode(false);
        return;
      }
    }

    ensureSession();
  }, [xrMode, xrStore, setXRMode]);

  const handleSessionError = useCallback(
    (error: unknown) => {
      if (error) {
        setXRMode(false);
      }
    },
    [setXRMode]
  );

  return xrMode ? (
    <ARSceneCanvas store={xrStore} onSessionError={handleSessionError} />
  ) : (
    <StandardSceneCanvas />
  );
}
