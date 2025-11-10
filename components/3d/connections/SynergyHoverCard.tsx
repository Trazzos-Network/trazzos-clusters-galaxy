"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import type { SinergiaDetectada } from "@/types";
import { EstadoSinergia } from "@/types";

interface SynergyHoverCardProps {
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

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}

export default function SynergyHoverCard({
  hovered,
  position,
  sinergia,
  onHoverChange,
  animationProgress,
  onPointerDown,
}: SynergyHoverCardProps) {
  const meta = useMemo(
    () => getSynergyStateMeta(sinergia.estado),
    [sinergia.estado]
  );

  const participantsCount = useMemo(() => {
    if (sinergia.empresas_involucradas) {
      return sinergia.empresas_involucradas;
    }
    return sinergia.empresas.length;
  }, [sinergia.empresas, sinergia.empresas_involucradas]);

  const savingsLine = useMemo(() => {
    if (sinergia.ahorro_estimado_pct != null) {
      const amount =
        sinergia.ahorro_estimado_monto != null
          ? ` · $${Math.round(sinergia.ahorro_estimado_monto).toLocaleString()}`
          : "";
      return `${sinergia.ahorro_estimado_pct.toFixed(1)}% ahorro${amount}`;
    }
    return `${sinergia.volumen_total} ${sinergia.unidad_medida} agrupados`;
  }, [
    sinergia.ahorro_estimado_monto,
    sinergia.ahorro_estimado_pct,
    sinergia.unidad_medida,
    sinergia.volumen_total,
  ]);

  const baseScale =
    animationProgress != null ? 0.85 + 0.25 * animationProgress : 0.96;
  const finalScale = hovered ? baseScale + 0.06 : baseScale;

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
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: hovered ? "0.65rem" : "0",
          color: "#f8fafc",
          fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
          textShadow: "0 1px 4px rgba(15, 23, 42, 0.45)",
          transition: "gap 0.18s ease-out",
        }}
        onPointerEnter={() => onHoverChange?.(true)}
        onPointerLeave={() => onHoverChange?.(false)}
        onPointerDownCapture={onPointerDown}
      >
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "9999px",
            background: meta.background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 10px 22px ${meta.shadow}`,
            border: "1px solid var(--color-primary)",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: "40px", lineHeight: 1 }}>{meta.emoji}</span>
        </div>
        <div
          style={{
            minWidth: "160px",
            padding: "8px 14px",
            borderRadius: "9px",
            background: "#1a1a1acc",
            backdropFilter: "blur(6px)",
            border: "1px solid var(--color-border)",
            textAlign: "left",
            lineHeight: 1.25,
            opacity: hovered ? 1 : 0,
            transform: hovered
              ? "translateY(0px) scale(1)"
              : "translateY(-10px) scale(0.92)",
            pointerEvents: hovered ? "auto" : "none",
            transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "2px",
              letterSpacing: "0.02em",
            }}
          >
            {truncate(sinergia.insumo, 28)}
          </div>
          <div
            style={{
              fontSize: "11px",
              opacity: 0.85,
              fontWeight: 500,
            }}
          >
            {meta.label} · {participantsCount}{" "}
            {participantsCount === 1 ? "empresa" : "empresas"}
          </div>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 500,
              opacity: 0.7,
              marginTop: "2px",
            }}
          >
            {savingsLine}
          </div>
        </div>
      </div>
    </Html>
  );
}
