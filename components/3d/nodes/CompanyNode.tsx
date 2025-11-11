"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Html, useGLTF } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import {
  useVisualizationStore,
  type ClusterCompany,
} from "@/lib/store/visualization-store";
import { NODE_COLORS } from "@/lib/utils/colors";
import { GEOMETRIES } from "@/lib/utils/geometry";
import type { GLTF } from "three-stdlib";

function useCompanyModel(assetPath: string, targetRadius: number) {
  const gltf = useGLTF(assetPath) as GLTF;
  return useMemo(() => {
    const scene = gltf.scene;
    if (!scene) return null;
    const cloned = scene.clone(true);
    cloned.updateMatrixWorld(true);

    const initialBox = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    initialBox.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z);
    const center = new THREE.Vector3();
    initialBox.getCenter(center);
    cloned.position.sub(center);

    cloned.updateMatrixWorld(true);
    const centeredBox = new THREE.Box3().setFromObject(cloned);
    const lift = -centeredBox.min.y;
    cloned.position.y += lift;

    const scale = maxDimension > 0 ? (targetRadius * 1.75) / maxDimension : 1;
    const group = new THREE.Group();
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    group.add(cloned);
    group.scale.setScalar(scale);
    return group;
  }, [gltf.scene, targetRadius]);
}

interface CompanyNodeProps {
  company: ClusterCompany;
}

export default function CompanyNode({ company }: CompanyNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const portalGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const setHoveredNode = useVisualizationStore((state) => state.setHoveredNode);
  const setSelectedNode = useVisualizationStore(
    (state) => state.setSelectedNode
  );
  const setConnectionMode = useVisualizationStore(
    (state) => state.setConnectionMode
  );
  const registerInteraction = useVisualizationStore(
    (state) => state.registerInteraction
  );
  const selectedNode = useVisualizationStore((state) => state.selectedNode);
  const cameraSettled = useVisualizationStore((state) => state.cameraSettled);
  const showLabels = useVisualizationStore((state) => state.debug.showLabels);
  const orbitEnabled = useVisualizationStore(
    (state) => state.debug.useOrbitControls
  );
  const sinergias = useVisualizationStore(
    (state) => state.clusterIndex[company.clusterId]?.sinergias ?? []
  );
  const nodeColor = NODE_COLORS.company;
  const isSelected = selectedNode === company.nodeId;
  const isFocus = company.isFocus ?? false;
  const focusSegments = Math.max(company.focusSegments ?? 8, 3);
  const normalizedEmpresa = useMemo(
    () => company.empresa.replace(/\s+/g, "").toLowerCase(),
    [company.empresa]
  );
  const isMyCompany = useMemo(
    () => normalizedEmpresa.includes("argos"),
    [normalizedEmpresa]
  );
  const shouldShowModel = Boolean(selectedNode);
  const modelGroupRef = useRef<THREE.Group>(null);
  const connectionMode = useVisualizationStore((state) => state.connectionMode);

  const geometry = useMemo(() => GEOMETRIES.company, []);
  const baseDimensions = useMemo(() => {
    if (isFocus) {
      const radius = 4.2;
      const height = 1.2;
      const segments = Math.max(focusSegments, 6);
      return {
        width: radius * 2,
        height,
        depth: radius * 2,
        radius,
        segments,
        geometry: new THREE.CylinderGeometry(
          radius,
          radius,
          height,
          segments,
          1,
          false
        ),
      };
    }
    const radius = geometry.parameters.width / 2;
    const height = geometry.parameters.height;
    const segments = 16;
    return {
      width: radius * 2,
      height,
      depth: radius * 2,
      radius,
      segments,
      geometry: new THREE.CylinderGeometry(
        radius,
        radius,
        height,
        segments,
        1,
        false
      ),
    };
  }, [
    focusSegments,
    geometry.parameters.height,
    geometry.parameters.width,
    isFocus,
  ]);

  const isPrimaryModel = isFocus && isMyCompany;
  const modelAssetPath = isPrimaryModel
    ? "/company.glb"
    : "/company-secondary.glb";
  const companyModel = useCompanyModel(modelAssetPath, baseDimensions.radius);

  const relatedSynergies = useMemo(
    () =>
      sinergias.filter((sinergia) =>
        sinergia.empresas.includes(company.empresa)
      ),
    [sinergias, company.empresa]
  );

  const potentialSavings = useMemo(
    () =>
      relatedSynergies.reduce(
        (acc, sinergia) => acc + (sinergia.ahorro_estimado_monto ?? 0),
        0
      ),
    [relatedSynergies]
  );

  const formattedSavings = useMemo(() => {
    if (potentialSavings <= 0) return null;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: potentialSavings >= 10000 ? 0 : 2,
    }).format(potentialSavings);
  }, [potentialSavings]);

  const plasmaMaterials = useMemo(() => {
    const map = new Map<string, THREE.ShaderMaterial>();
    relatedSynergies.forEach((sinergia, idx) => {
      const hue = (sinergia.id.charCodeAt(0) * 0.037 + idx * 0.11) % 1;
      const tint = new THREE.Color().setHSL(hue, 0.85, 0.65);
      map.set(
        sinergia.id,
        new THREE.ShaderMaterial({
          uniforms: {
            time: { value: idx * 1.3 },
            intensity: { value: 0 },
            tint: { value: tint },
          },
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
          vertexShader: /* glsl */ `
            varying vec3 vPosition;
            void main() {
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: /* glsl */ `
            uniform float time;
            uniform float intensity;
            uniform vec3 tint;
            varying vec3 vPosition;

            float noise(vec3 p) {
              return fract(sin(dot(p, vec3(12.9898, 78.233, 54.53))) * 43758.5453);
            }

            void main() {
              float r = length(vPosition);
              float glow = exp(-r * 6.5);
              float turbulence = noise(vPosition * 7.0 + time * 4.0) * 0.7;
              float flame = smoothstep(0.7, 0.0, r) + turbulence;
              float alpha = clamp((flame + glow) * intensity, 0.0, 1.0);
              if (alpha < 0.025) discard;
              vec3 color = mix(tint, vec3(1.0, 0.75, 1.0), glow);
              gl_FragColor = vec4(color, alpha);
            }
          `,
        })
      );
    });
    return map;
  }, [relatedSynergies]);

  const topMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);

  const { scale, aperture } = useSpring({
    scale: hovered || isSelected ? 1.18 : 1,
    aperture: isSelected && cameraSettled ? 1 : 0,
    config: { tension: 110, friction: 16, precision: 0.0001 },
  });

  const labelPosition = useMemo(
    () =>
      [
        0,
        baseDimensions.height / 2 + 0.35,
        baseDimensions.depth * 0.8 + 0.6,
      ] as [number, number, number],
    [baseDimensions.depth, baseDimensions.height]
  );

  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  useEffect(() => {
    return () => {
      plasmaMaterials.forEach((mat) => mat.dispose());
    };
  }, [plasmaMaterials]);

  useEffect(() => {
    return () => {
      baseDimensions.geometry.dispose();
    };
  }, [baseDimensions.geometry]);

  const blackHoleGeometry = useMemo(() => {
    const radius = baseDimensions.radius * 1.65;
    return new THREE.PlaneGeometry(radius, radius, 1, 1);
  }, [baseDimensions.radius]);

  useEffect(() => {
    return () => {
      blackHoleGeometry.dispose();
    };
  }, [blackHoleGeometry]);

  const companyModelOffset = useMemo(
    () => baseDimensions.height * 0.32 + 0.24,
    [baseDimensions.height]
  );
  const modelTopHeight = useMemo(
    () => companyModelOffset + baseDimensions.radius * 1.75,
    [baseDimensions.radius, companyModelOffset]
  );

  const modelSpring = useSpring({
    position: shouldShowModel
      ? ([0, companyModelOffset, 0] as [number, number, number])
      : ([0, companyModelOffset - 0.6, 0] as [number, number, number]),
    scale: shouldShowModel ? 1 : 0.001,
    glow: shouldShowModel ? 1 : 0,
    config: shouldShowModel
      ? { mass: 0.8, tension: 260, friction: 18, precision: 0.0001 }
      : { mass: 0.9, tension: 190, friction: 22, precision: 0.0001 },
  });
  const {
    position: modelPosition,
    scale: modelScale,
    glow: modelGlow,
  } = modelSpring;

  useEffect(() => {
    if (!isMyCompany) return;
    if (!isFocus) return;
    if (isSelected) return;
    if (connectionMode !== "focus") return;

    setSelectedNode(company.nodeId);
    setConnectionMode("focus");
  }, [
    company.nodeId,
    isFocus,
    isMyCompany,
    isSelected,
    connectionMode,
    setConnectionMode,
    setSelectedNode,
  ]);

  const blackHoleMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const [renderBlackHoleMaterial, setRenderBlackHoleMaterial] =
    useState<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    let frameId: number | null = null;

    if (!isFocus) {
      if (blackHoleMaterialRef.current) {
        blackHoleMaterialRef.current.dispose();
        blackHoleMaterialRef.current = null;
      }
      frameId = requestAnimationFrame(() => {
        setRenderBlackHoleMaterial(null);
      });
      return () => {
        if (frameId !== null) {
          cancelAnimationFrame(frameId);
        }
      };
    }

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        aperture: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float time;
        uniform float aperture;
        varying vec2 vUv;

        void main() {
          vec2 centered = vUv - 0.5;
          float r = length(centered) * 1.4;
          float angle = atan(centered.y, centered.x);

          float swirl = sin(angle * 16.0 - time * 2.5);
          float glow = smoothstep(1.2, 0.2, r);
          float gravity = smoothstep(0.3, 0.6, r);
          float alpha = clamp((1.0 - r) * (0.75 + swirl * 0.2), 0.0, 1.0);
          alpha *= glow;
          alpha = pow(alpha, 1.3);

          vec3 rimColor = vec3(0.35, 0.78, 0.45);
          vec3 innerColor = vec3(0.02, 0.03, 0.05);
          vec3 color = mix(innerColor, rimColor, glow) + swirl * 0.08;
          color *= mix(0.4, 1.15, glow);
          color *= mix(1.0, 0.55, gravity);

          float finalAlpha = clamp(alpha * aperture, 0.0, 1.0);

          if (finalAlpha < 0.01) discard;
          gl_FragColor = vec4(color, finalAlpha);
        }
      `,
    });

    if (blackHoleMaterialRef.current) {
      blackHoleMaterialRef.current.dispose();
    }
    blackHoleMaterialRef.current = material;
    frameId = requestAnimationFrame(() => {
      setRenderBlackHoleMaterial(material);
    });

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      material.dispose();
      if (blackHoleMaterialRef.current === material) {
        blackHoleMaterialRef.current = null;
      }
    };
  }, [isFocus]);

  useFrame((state, delta) => {
    const apertureValue = aperture.get();

    if (portalGroupRef.current) {
      portalGroupRef.current.visible =
        relatedSynergies.length > 0 && apertureValue > 0.05;
      if (apertureValue > 0.05) {
        portalGroupRef.current.rotation.y += delta * 0.45;
      }
    }

    plasmaMaterials.forEach((mat) => {
      mat.uniforms.time.value += delta * 2.2;
      mat.uniforms.intensity.value = THREE.MathUtils.lerp(
        mat.uniforms.intensity.value,
        apertureValue * 1.5,
        0.18
      );
    });

    const holeMaterial = blackHoleMaterialRef.current;
    if (holeMaterial) {
      holeMaterial.uniforms.time.value += delta * 1.6;
      holeMaterial.uniforms.aperture.value = THREE.MathUtils.lerp(
        holeMaterial.uniforms.aperture.value,
        apertureValue,
        0.12
      );
    }

    if (modelGroupRef.current) {
      const scaleValue = modelScale.get();
      if (scaleValue > 0.02) {
        modelGroupRef.current.rotation.y += delta * 0.7;
      } else {
        modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          modelGroupRef.current.rotation.y,
          0,
          0.12
        );
      }
    }
  });

  const lidPosition = aperture.to((value) => [
    0,
    baseDimensions.height / 2 + 0.011 - value * 0.55,
    0,
  ]) as unknown as [number, number, number];
  const lidTwist = useMemo(() => {
    if (!isFocus) return 0;
    const segments = baseDimensions.segments ?? 1;
    return segments > 0 ? (Math.PI * 2) / segments / 2 : 0;
  }, [baseDimensions.segments, isFocus]);
  const showFocusModel = shouldShowModel;
  const portalScale = aperture.to((value) => [
    value,
    value,
    value,
  ]) as unknown as [number, number, number];
  const showSavingsCard =
    isMyCompany &&
    formattedSavings &&
    relatedSynergies.length > 0 &&
    Boolean(showFocusModel && renderBlackHoleMaterial);
  return (
    <animated.group
      ref={meshRef}
      position={company.position3D}
      scale={scale}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        setHoveredNode(company.nodeId);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        setHoveredNode(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!orbitEnabled) {
          registerInteraction();
        }
        setSelectedNode(company.nodeId);
        setConnectionMode("focus");
      }}
    >
      <mesh geometry={baseDimensions.geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={nodeColor}
          emissive={hovered || isSelected ? nodeColor : "#000000"}
          emissiveIntensity={hovered || isSelected ? 0.75 : 0.2}
          metalness={0.32}
          roughness={0.45}
        />
      </mesh>

      <animated.group position={lidPosition}>
        <mesh rotation={[-Math.PI / 2, 0, lidTwist]}>
          <circleGeometry
            args={[baseDimensions.radius, baseDimensions.segments]}
          />
          <meshStandardMaterial
            ref={topMaterialRef}
            color="#f5f8f2"
            metalness={0.08}
            roughness={0.35}
            toneMapped={false}
          />
        </mesh>
      </animated.group>

      {isFocus && renderBlackHoleMaterial && (
        <mesh
          geometry={blackHoleGeometry}
          position={[0, baseDimensions.height / 2 + 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          material={renderBlackHoleMaterial}
          renderOrder={4}
        />
      )}

      <animated.group
        ref={modelGroupRef}
        position={modelPosition}
        scale={modelScale.to((value) => value / 1.4)}
        renderOrder={5}
      >
        {shouldShowModel && companyModel && (
          <>
            <primitive object={companyModel} />
            {isPrimaryModel && (
              <animated.pointLight
                color="#b0f5ff"
                intensity={modelGlow.to((value) => 0.8 + value * 0.6)}
                distance={2.8}
                decay={2}
              />
            )}
          </>
        )}
      </animated.group>

      <animated.group
        ref={portalGroupRef}
        position={[0, baseDimensions.height / 2 + 0.2, 0]}
        scale={portalScale}
        visible={relatedSynergies.length > 0}
      >
        {relatedSynergies.map((sinergia, index) => {
          const angle =
            relatedSynergies.length === 1
              ? 0
              : (index / relatedSynergies.length) * Math.PI * 2;
          const radius = 0.3;
          const height = Math.sin(angle * 4.2) * 0.12;
          const material = plasmaMaterials.get(sinergia.id);
          if (!material) return null;
          return (
            <group
              key={`portal-synergy-${sinergia.id}`}
              position={[
                Math.cos(angle) * radius,
                height,
                Math.sin(angle) * radius,
              ]}
              rotation={[0, -angle, 0]}
            >
              <mesh castShadow receiveShadow>
                <sphereGeometry args={[0.14, 24, 24]} />
                <primitive attach="material" object={material} />
              </mesh>
              <pointLight
                color="#ffb0ff"
                intensity={isSelected ? 1.3 : 0.6}
                distance={0.7}
              />
            </group>
          );
        })}
      </animated.group>

      {showLabels && (
        <Html position={labelPosition} center pointerEvents="none">
          <div className="px-3 py-1 rounded-md border border-white/10 bg-card/65 text-[11px] font-medium text-white whitespace-nowrap shadow-lg">
            {company.empresa}
          </div>
        </Html>
      )}

      {showSavingsCard && (
        <Html
          position={[0, modelTopHeight, 0]}
          center
          transform
          sprite
          distanceFactor={10}
        >
          <div className="rounded-2xl max-w-[200px] border border-primary bg-card/65 px-6 py-4 text-center text-white shadow-[0_28px_55px_-25px_rgba(0,0,0,0.9)] backdrop-blur-lg">
            <p className="text-xs uppercase tracking-[0.36em] text-white/50">
              Potencial de ahorro
            </p>
            <p className="text-2xl font-semibold text-[#cbffc4]">
              {formattedSavings}
            </p>
            <p className="text-sm text-white/60">
              {relatedSynergies.length} sinergia
              {relatedSynergies.length === 1 ? "" : "s"} activas
            </p>
          </div>
        </Html>
      )}
    </animated.group>
  );
}

useGLTF.preload("/company.glb");
useGLTF.preload("/company-secondary.glb");
