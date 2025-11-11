"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import type { SinergiaDetectada } from "@/types";
import { EstadoSinergia } from "@/types";

interface SynergyMarkerProps {
  hovered: boolean;
  position: [number, number, number];
  sinergia: SinergiaDetectada;
  onHoverChange?: (hovered: boolean) => void;
  animationProgress?: number;
  onPointerDown?: () => void;
}

export interface SynergyStateMeta {
  emoji: string;
  label: string;
  background: string;
  shadow: string;
}

const STATE_META: Record<EstadoSinergia, SynergyStateMeta> = {
  [EstadoSinergia.PENDIENTE]: {
    emoji: "🕒",
    label: "Pendiente",
    background: "rgba(234, 179, 8, 0.62)",
    shadow: "rgba(234, 179, 8, 0.35)",
  },
  [EstadoSinergia.EN_RFP]: {
    emoji: "📄",
    label: "En RFP",
    background: "rgba(59, 130, 246, 0.62)",
    shadow: "rgba(59, 130, 246, 0.35)",
  },
  [EstadoSinergia.RECOMENDADA]: {
    emoji: "👍",
    label: "Recomendada",
    background: "rgba(16, 185, 129, 0.62)",
    shadow: "rgba(16, 185, 129, 0.35)",
  },
  [EstadoSinergia.APROBADA]: {
    emoji: "✅",
    label: "Aprobada",
    background: "rgba(34, 197, 94, 0.62)",
    shadow: "rgba(34, 197, 94, 0.35)",
  },
  [EstadoSinergia.CONTRAOFERTA]: {
    emoji: "🤝",
    label: "Contraoferta",
    background: "rgba(251, 191, 36, 0.62)",
    shadow: "rgba(251, 191, 36, 0.35)",
  },
  [EstadoSinergia.CERRADA]: {
    emoji: "🏁",
    label: "Cerrada",
    background: "rgba(79, 70, 229, 0.62)",
    shadow: "rgba(79, 70, 229, 0.35)",
  },
  [EstadoSinergia.RECHAZADA]: {
    emoji: "⛔️",
    label: "Rechazada",
    background: "rgba(239, 68, 68, 0.62)",
    shadow: "rgba(239, 68, 68, 0.35)",
  },
};

const FALLBACK_META: SynergyStateMeta = {
  emoji: "✨",
  label: "En análisis",
  background: "rgba(148, 163, 184, 0.62)",
  shadow: "rgba(148, 163, 184, 0.3)",
};

export function getSynergyStateMeta(estado: EstadoSinergia): SynergyStateMeta {
  return STATE_META[estado] ?? FALLBACK_META;
}

export default function SynergyMarker({
  hovered,
  position,
  sinergia,
  onHoverChange,
  animationProgress,
  onPointerDown,
}: SynergyMarkerProps) {
  const meta = useMemo(
    () => getSynergyStateMeta(sinergia.estado),
    [sinergia.estado]
  );

  const baseScale =
    animationProgress != null ? 0.85 + 0.25 * animationProgress : 0.96;
  const finalScale = hovered ? baseScale + 0.08 : baseScale;

  return (
    <Html
      sprite
      center
      position={position}
      distanceFactor={24}
      pointerEvents="auto"
      style={{
        transform: `scale(${finalScale})`,
        transition: "transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "transform",
      }}
    >
      <div
        onPointerEnter={() => onHoverChange?.(true)}
        onPointerLeave={() => onHoverChange?.(false)}
        onPointerDownCapture={onPointerDown}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.35rem",
          color: "#f8fafc",
          fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
          textShadow: "0 1px 4px rgba(15, 23, 42, 0.45)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: "74px",
            height: "74px",
            borderRadius: "9999px",
            background: meta.background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 12px 24px ${meta.shadow}`,
            border: "1px solid var(--color-primary)",
            transform: hovered ? "translateY(-3px)" : "translateY(0px)",
            transition: "transform 0.18s ease-out, box-shadow 0.18s ease-out",
          }}
        >
          <span style={{ fontSize: "40px", lineHeight: 1 }}>{meta.emoji}</span>
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: hovered ? 0.9 : 0.45,
            transition: "opacity 0.18s ease-out",
          }}
        >
          {meta.label}
        </span>
      </div>
    </Html>
  );
}
