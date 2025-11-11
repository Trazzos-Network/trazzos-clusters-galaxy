"use client";

import { useMemo } from "react";
import { useVisualizationStore } from "@/lib/store/visualization-store";
import { parseNodeRef } from "@/lib/utils/node-ids";
import { getSynergyStateMeta } from "@/components/3d/connections/SynergyHoverCard";

interface PanelMetric {
  label: string;
  value: string;
}

interface HoverPanelData {
  kind: "company" | "synergy" | "other";
  title: string;
  subtitle: string;
  metrics: PanelMetric[];
  accent?: string;
}

export default function HoverInfoPanel() {
  const hoveredNode = useVisualizationStore((state) => state.hoveredNode);
  const clusterIndex = useVisualizationStore((state) => state.clusterIndex);

  const panelData = useMemo<HoverPanelData | null>(() => {
    if (!hoveredNode) return null;
    const parsed = parseNodeRef(hoveredNode);
    if (!parsed) return null;

    const cluster = clusterIndex[parsed.clusterId];
    if (!cluster) return null;

    if (parsed.type === "company") {
      const company = cluster.enrichedCompanies.find(
        (entry) => entry.nodeId === hoveredNode
      );
      if (!company) return null;

      return {
        kind: "company",
        title: company.empresa,
        subtitle: cluster.etiqueta,
        metrics: [
          {
            label: "Ubicación",
            value: company.location.name,
          },
          {
            label: "Paradas activas",
            value: `${company.paradas.length}`,
          },
          {
            label: "Necesidades",
            value: `${company.necesidades.length}`,
          },
          {
            label: "Coordenadas",
            value: `${company.location.lat.toFixed(
              3
            )}, ${company.location.lon.toFixed(3)}`,
          },
        ],
        accent: "#cbffc4",
      };
    }

    if (parsed.type === "synergy") {
      const sinergia = cluster.dataset.sinergias.find(
        (entry) => entry.id === parsed.entityId
      );
      if (!sinergia) return null;

      const meta = getSynergyStateMeta(sinergia.estado);

      const metrics: PanelMetric[] = [
        {
          label: "Participantes",
          value: sinergia.empresas.join(", "),
        },
        {
          label: "Estado",
          value: meta.label,
        },
      ];

      if (sinergia.ahorro_estimado_pct != null) {
        const ahorroMonto =
          sinergia.ahorro_estimado_monto != null
            ? ` · $${Math.round(
                sinergia.ahorro_estimado_monto
              ).toLocaleString()}`
            : "";
        metrics.push({
          label: "Ahorro estimado",
          value: `${sinergia.ahorro_estimado_pct.toFixed(1)}%${ahorroMonto}`,
        });
      } else {
        metrics.push({
          label: "Volumen total",
          value: `${sinergia.volumen_total} ${sinergia.unidad_medida}`,
        });
      }

      return {
        kind: "synergy",
        title: sinergia.insumo,
        subtitle: `${cluster.etiqueta} · Sinergia`,
        metrics,
        accent: meta.background,
      };
    }

    return {
      kind: "other",
      title: cluster.etiqueta,
      subtitle: "Entidad en foco",
      metrics: [],
      accent: "#38bdf8",
    };
  }, [clusterIndex, hoveredNode]);

  const isVisible = Boolean(panelData);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-1200 flex flex-col items-end">
      <div
        className={`pointer-events-auto origin-bottom-left transform-gpu rounded-2xl border border-white/10 bg-[#0b0b0fea] px-5 py-4 text-white shadow-[0_18px_38px_-18px_rgba(0,0,0,0.85)] backdrop-blur-md transition-all duration-250 ease-out ${
          isVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
        style={{
          minWidth: "260px",
          maxWidth: "320px",
        }}
      >
        <div className="space-y-3">
          <header>
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              {panelData?.subtitle ?? "Explora la galaxia"}
            </p>
            <h3
              className="text-lg font-semibold"
              style={{ color: panelData?.accent ?? "#e0f2fe" }}
            >
              {panelData?.title ?? "Selecciona una entidad"}
            </h3>
          </header>

          {panelData && panelData.metrics.length > 0 ? (
            <ul className="space-y-1.5 text-xs">
              {panelData.metrics.map((metric) => (
                <li
                  key={`${panelData.title}-${metric.label}`}
                  className="flex items-baseline justify-between gap-3 text-white/70"
                >
                  <span className="uppercase tracking-[0.18em] text-[9px] text-white/45">
                    {metric.label}
                  </span>
                  <span className="text-right text-[11px] text-white">
                    {metric.value}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-white/45">
              Acerca el cursor a una compañía o sinergia para ver detalles al
              instante.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
