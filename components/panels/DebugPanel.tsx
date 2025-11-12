"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import {
  useVisualizationStore,
  type VisualizationState,
} from "@/lib/store/visualization-store";

const DEBUG_OPTIONS: Array<{
  key: keyof VisualizationState["debug"];
  label: string;
  description: string;
}> = [
  {
    key: "showAxes",
    label: "Mostrar ejes",
    description: "Renderiza AxesHelper para referencia X/Y/Z.",
  },
  {
    key: "showGrid",
    label: "Mostrar cuadrícula",
    description: "Activa una rejilla sobre el plano base.",
  },
  {
    key: "showLabels",
    label: "Etiquetas de compañías",
    description: "Muestra todos los nombres siempre visibles.",
  },
  {
    key: "useOrbitControls",
    label: "Órbita libre",
    description: "Habilita navegación con OrbitControls.",
  },
  {
    key: "useOrderedConnections",
    label: "Trazado ordenado",
    description:
      "Alterna entre rutas ortogonales optimizadas y líneas naturales directas.",
  },
];

export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debug = useVisualizationStore((state) => state.debug);
  const setDebugOption = useVisualizationStore((state) => state.setDebugOption);
  const regenerateConnections = useVisualizationStore(
    (state) => state.regenerateConnections
  );

  const connectionMode = useVisualizationStore((state) => state.connectionMode);
  const setConnectionMode = useVisualizationStore(
    (state) => state.setConnectionMode
  );
  const xrMode = useVisualizationStore((state) => state.xrMode);
  const setXRMode = useVisualizationStore((state) => state.setXRMode);
  const [xrSupport, setXrSupport] = useState<null | boolean>(null);
  const [xrError, setXrError] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== "t") return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      setIsVisible((prev) => {
        const next = !prev;
        if (next) {
          setIsOpen(true);
        }
        return next;
      });
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function checkXRSupport() {
      if (typeof navigator === "undefined" || !("xr" in navigator)) {
        if (!cancelled) {
          setXrSupport(false);
          setXrError("navigator.xr not available");
        }
        return;
      }

      const system = navigator.xr as XRSystem;
      if (typeof system.isSessionSupported === "function") {
        const supported = await system
          .isSessionSupported("immersive-ar")
          .catch((error) => {
            if (!cancelled) {
              setXrError(error?.message ?? "isSessionSupported failed");
            }
            return false;
          });
        if (!cancelled) {
          setXrSupport(supported);
          setXrError(supported ? null : "immersive-ar not supported");
        }
        return;
      }

      if (!cancelled) {
        setXrSupport(true);
        setXrError(null);
      }
    }

    checkXRSupport();

    return () => {
      cancelled = true;
    };
  }, []);
  const cameraTelemetry = useVisualizationStore(
    (state) => state.cameraTelemetry
  );

  const cameraInfo = useMemo(() => {
    const toFixed = (value: number, digits = 2) => value.toFixed(digits);
    const toDeg = (rad: number) => THREE.MathUtils.radToDeg(rad);

    return {
      position: {
        x: toFixed(cameraTelemetry.position[0]),
        y: toFixed(cameraTelemetry.position[1]),
        z: toFixed(cameraTelemetry.position[2]),
      },
      direction: {
        x: toFixed(cameraTelemetry.direction[0], 3),
        y: toFixed(cameraTelemetry.direction[1], 3),
        z: toFixed(cameraTelemetry.direction[2], 3),
      },
      rotation: {
        x: toDeg(cameraTelemetry.rotation[0]).toFixed(2),
        y: toDeg(cameraTelemetry.rotation[1]).toFixed(2),
        z: toDeg(cameraTelemetry.rotation[2]).toFixed(2),
      },
    };
  }, [cameraTelemetry]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="z-100 w-72 overflow-hidden rounded-lg border border-white/10 bg-[#0f0f0f]/90 shadow-lg backdrop-blur">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/50">
            Debug
          </p>
          <p className="text-sm font-semibold text-white">
            Herramientas de escena
          </p>
        </div>
        <span
          className={`inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[10px] text-white transition-transform ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        >
          ⌃
        </span>
      </button>

      <div
        className={`space-y-3 border-t border-white/10 px-3 pb-4 transition-[max-height,opacity] duration-300 ease-in-out ${
          isOpen ? "max-h-fit opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-2 rounded-md border border-white/10 p-3 text-xs text-white/70">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
            Cámara
          </p>
          <div className="space-y-1">
            <p>
              Posición · x {cameraInfo.position.x} · y {cameraInfo.position.y} ·
              z {cameraInfo.position.z}
            </p>
            <p>
              Orientación · pitch {cameraInfo.rotation.x}° · yaw{" "}
              {cameraInfo.rotation.y}° · roll {cameraInfo.rotation.z}°
            </p>
            <p>
              Dirección · x {cameraInfo.direction.x} · y{" "}
              {cameraInfo.direction.y} · z {cameraInfo.direction.z}
            </p>
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-white/10 p-2 text-xs text-white/70">
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
            XR / AR
          </p>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={xrMode}
              onChange={(event) => setXRMode(event.target.checked)}
              disabled={xrSupport !== true}
              className="accent-[#9aff8d]"
            />
            <span>
              Activar modo AR
              {xrSupport === null && " · comprobando compatibilidad"}
              {xrSupport === false && " · no soportado en este dispositivo"}
              {xrSupport === false && xrError && (
                <span className="block text-[10px] text-white/30">
                  {xrError}
                </span>
              )}
            </span>
          </label>
          <p className="text-[11px] text-white/40">
            Renderiza el clúster sobre superficies reales usando WebXR plane-
            detection.
          </p>
        </div>

        <div className="space-y-2 rounded-md border border-white/10 p-2">
          <div className="flex flex-col gap-2 text-sm text-white">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="connectionMode"
                value="key"
                checked={connectionMode === "key"}
                onChange={() => setConnectionMode("key")}
                className="accent-[#9aff8d]"
              />
              <span>Sinergias clave</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="connectionMode"
                value="focus"
                checked={connectionMode === "focus"}
                onChange={() => setConnectionMode("focus")}
                className="accent-[#9aff8d]"
              />
              <span>Entidad seleccionada</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="connectionMode"
                value="all"
                checked={connectionMode === "all"}
                onChange={() => setConnectionMode("all")}
                className="accent-[#9aff8d]"
              />
              <span>Mostrar todas</span>
            </label>
          </div>
        </div>

        <ul className="space-y-3 text-xs text-white/70">
          {DEBUG_OPTIONS.map(({ key, label, description }) => (
            <li key={key} className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => {
                  setDebugOption(key, !debug[key]);
                  if (key === "useOrderedConnections") {
                    regenerateConnections();
                  }
                }}
                className={`mt-0.5 inline-flex h-5 w-9 shrink-0 rounded-full border transition ${
                  debug[key]
                    ? "border-primary bg-primary/80"
                    : "border-white/20 bg-white/5"
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition-transform ${
                    debug[key] ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <div>
                <p className="font-medium text-white">{label}</p>
                <p className="text-white/50">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
