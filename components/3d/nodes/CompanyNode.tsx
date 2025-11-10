"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import { animated, useSpring } from "@react-spring/three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  useVisualizationStore,
  type ClusterCompany,
} from "@/lib/store/visualization-store";
import { NODE_COLORS } from "@/lib/utils/colors";
import { GEOMETRIES } from "@/lib/utils/geometry";

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
  const { camera } = useThree();

  const nodeColor = NODE_COLORS.company;
  const isSelected = selectedNode === company.nodeId;
  const isFocus = company.isFocus ?? false;
  const focusSegments = Math.max(company.focusSegments ?? 8, 3);

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

  const relatedSynergies = useMemo(
    () =>
      sinergias.filter((sinergia) =>
        sinergia.empresas.includes(company.empresa)
      ),
    [sinergias, company.empresa]
  );

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

  const topTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.clearRect(0, 0, size, size);

    const center = size / 2;

    const trimmed = company.empresa.trim();
    const primaryLetter = trimmed.charAt(0).toUpperCase();
    const secondaryLetter = trimmed.charAt(1)?.toLowerCase() ?? "";

    ctx.fillStyle = "#f8fcf1";
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.arc(center, center, size, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = size * 0.01;
    ctx.beginPath();
    ctx.arc(center, center, size * 0.39, 0, Math.PI * 2);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = NODE_COLORS.company;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (secondaryLetter) {
      ctx.font = `700 ${
        size * 0.42
      }px 'Inter', 'Helvetica', 'Arial', sans-serif`;
      ctx.fillText(
        primaryLetter,
        size / 2 - size * 0.08,
        size / 2 + size * 0.02
      );
      ctx.font = `500 ${
        size * 0.28
      }px 'Inter', 'Helvetica', 'Arial', sans-serif`;
      ctx.fillText(
        secondaryLetter,
        size / 2 + size * 0.22,
        size / 2 + size * 0.05
      );
    } else {
      ctx.font = `700 ${
        size * 0.5
      }px 'Inter', 'Helvetica', 'Arial', sans-serif`;
      ctx.fillText(primaryLetter, size / 2, size / 2 + size * 0.02);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [company.empresa]);

  const { scale, aperture } = useSpring({
    scale: hovered || isSelected ? 1.18 : 1,
    aperture: isSelected && cameraSettled ? 1 : 0,
    config: { tension: 110, friction: 16, precision: 0.0001 },
  });

  const tooltipHeight = baseDimensions.height / 2 + 0.85;
  const tooltipRadius = baseDimensions.depth * 0.85 + 0.95;
  const [tooltipPos, setTooltipPos] = useState<[number, number, number]>([
    0,
    tooltipHeight,
    tooltipRadius,
  ]);

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
      topTexture?.dispose();
      document.body.style.cursor = "auto";
    };
  }, [topTexture]);

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

    if (hovered && !showLabels) {
      const companyPosition = new THREE.Vector3(
        company.position3D[0],
        company.position3D[1],
        company.position3D[2]
      );
      const toCamera = new THREE.Vector3()
        .subVectors(camera.position, companyPosition)
        .setY(0);
      const north = new THREE.Vector3(0, 0, 1);
      const blended =
        toCamera.lengthSq() > 1e-6 ? toCamera.normalize() : north.clone();
      const offsetDir = north.clone().lerp(blended, 0.35).normalize();
      offsetDir.multiplyScalar(tooltipRadius);
      const target: [number, number, number] = [
        offsetDir.x,
        tooltipHeight,
        offsetDir.z,
      ];
      setTooltipPos((prev) => {
        if (
          Math.abs(prev[0] - target[0]) < 0.01 &&
          Math.abs(prev[1] - target[1]) < 0.01 &&
          Math.abs(prev[2] - target[2]) < 0.01
        ) {
          return prev;
        }
        return target;
      });
    }
  });

  const lidPosition = aperture.to((value) => [
    0,
    baseDimensions.height / 2 + 0.011 - value * 0.55,
    0,
  ]) as unknown as [number, number, number];
  const portalScale = aperture.to((value) => [
    value,
    value,
    value,
  ]) as unknown as [number, number, number];

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

      <animated.mesh
        position={lidPosition}
        rotation={[
          -Math.PI / 2,
          0,
          isFocus ? (Math.PI * 2) / (baseDimensions.segments ?? 1) / 2 : 0,
        ]}
      >
        <circleGeometry
          args={[baseDimensions.radius, baseDimensions.segments]}
        />
        <meshStandardMaterial
          map={topTexture ?? undefined}
          color="#ffffff"
          transparent
          opacity={topTexture ? 1 : 0}
          metalness={0.1}
          roughness={0.4}
          emissive="#000000"
          emissiveIntensity={0}
          toneMapped={false}
        />
      </animated.mesh>

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

      {hovered && !showLabels && (
        <Html position={tooltipPos} center pointerEvents="none">
          <div className="px-4 py-3 rounded-lg bg-[#131313]/92 border border-[#74b600]/35 text-white text-sm shadow-2xl min-w-[200px]">
            <p className="text-base font-semibold text-[#cbffc4] mb-2">
              {company.location.name}
            </p>
            <p className="text-xs text-white/80 mb-1">
              Lat: {company.location.lat.toFixed(4)} · Lon:{" "}
              {company.location.lon.toFixed(4)}
            </p>
            <p className="text-xs text-white/70">
              Paradas: {company.paradas.length} · Necesidades:{" "}
              {company.necesidades.length}
            </p>
          </div>
        </Html>
      )}
    </animated.group>
  );
}
