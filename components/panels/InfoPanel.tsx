"use client";

import { useMemo } from "react";
import { useVisualizationStore } from "@/lib/store/visualization-store";
import { parseNodeRef } from "@/lib/utils/node-ids";

interface PanelSectionProps {
  title: string;
  children: React.ReactNode;
}

function PanelSection({ title, children }: PanelSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs uppercase tracking-wide text-white/50">{title}</h4>
      <div className="rounded-md border border-white/10 bg-white/2 p-3 text-sm text-white/80">
        {children}
      </div>
    </div>
  );
}

export default function InfoPanel() {
  const selectedNode = useVisualizationStore((state) => state.selectedNode);
  const setSelectedNode = useVisualizationStore(
    (state) => state.setSelectedNode
  );
  const resetInteraction = useVisualizationStore(
    (state) => state.resetInteraction
  );
  const setConnectionMode = useVisualizationStore(
    (state) => state.setConnectionMode
  );
  const clusterIndex = useVisualizationStore((state) => state.clusterIndex);

  const panelData = useMemo(() => {
    if (!selectedNode) return null;
    const parsed = parseNodeRef(selectedNode);
    if (!parsed) return null;

    const cluster = clusterIndex[parsed.clusterId];
    if (!cluster) return null;

    if (parsed.type === "company") {
      const company = cluster.enrichedCompanies.find(
        (entry) => entry.nodeId === selectedNode
      );
      if (!company) return null;

      const sampleCompanyEntry = Object.values(
        cluster.dataset.companies ?? {}
      ).find((entry) => entry.name === company.empresa);

      return {
        type: "company" as const,
        title: company.location.name,
        subtitle: cluster.etiqueta,
        location: company.location.name,
        metadata: [
          { label: "Paradas programadas", value: company.paradas.length },
          { label: "Necesidades activas", value: company.necesidades.length },
          {
            label: "Coordenadas",
            value: `${company.location.lat.toFixed(
              4
            )}, ${company.location.lon.toFixed(4)}`,
          },
        ],
        extra: sampleCompanyEntry
          ? [
              {
                label: "Tipo de compañía",
                value: sampleCompanyEntry.type,
              },
              {
                label: "Plantas",
                value: sampleCompanyEntry.plantas.join(", "),
              },
            ]
          : [],
        paradas: company.paradas.slice(0, 3),
        necesidades: company.necesidades.slice(0, 3),
      };
    }

    if (parsed.type === "synergy") {
      const sinergia = cluster.dataset.sinergias.find(
        (entry) => entry.id === parsed.entityId
      );
      if (!sinergia) return null;

      return {
        type: "synergy" as const,
        title: sinergia.insumo,
        subtitle: `${cluster.etiqueta} · Sinergia detectada`,
        metadata: [
          {
            label: "Volumen total",
            value: `${sinergia.volumen_total} ${sinergia.unidad_medida}`,
          },
          {
            label: "Empresas involucradas",
            value: sinergia.empresas.join(", "),
          },
        ],
      };
    }

    return {
      type: "other" as const,
      title: cluster.etiqueta,
      subtitle: "Entidad seleccionada",
      metadata: [],
    };
  }, [clusterIndex, selectedNode]);

  const isOpen = Boolean(panelData);

  return (
    <div className="pointer-events-none fixed inset-y-0 right-0 flex justify-end">
      <div
        className={`pointer-events-auto h-full w-[340px] max-w-full transform bg-[#111]/95 backdrop-blur-md border-l border-white/10 shadow-xl transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <header className="flex items-start justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                {panelData?.subtitle || "Entidad"}
              </p>
              <h2 className="text-lg font-semibold text-[#cbffc4]">
                {panelData?.title || "Sin selección"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedNode(null);
                resetInteraction();
                setConnectionMode("key");
              }}
              className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/60 transition hover:border-white/30 hover:text-white"
            >
              Cerrar
            </button>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {panelData?.metadata && panelData.metadata.length > 0 && (
              <PanelSection title="Resumen">
                <ul className="space-y-1">
                  {panelData.metadata.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-baseline justify-between text-xs"
                    >
                      <span className="text-white/50">{item.label}</span>
                      <span className="text-white">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </PanelSection>
            )}

            {panelData?.type === "company" && (
              <>
                {panelData.extra && panelData.extra.length > 0 && (
                  <PanelSection title="Perfil">
                    <ul className="space-y-1 text-xs">
                      {panelData.extra.map((item) => (
                        <li key={item.label}>
                          <span className="text-white/50">{item.label}:</span>{" "}
                          <span className="text-white">{item.value}</span>
                        </li>
                      ))}
                    </ul>
                  </PanelSection>
                )}

                <PanelSection title="Próximas paradas">
                  {panelData.paradas.length === 0 ? (
                    <p className="text-xs text-white/50">
                      No hay paradas registradas.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {panelData.paradas.map((parada, idx) => (
                        <li key={parada.parada_id ?? `parada-${idx}`}>
                          <p className="text-white">
                            {parada.planta} · {parada.unidad}
                          </p>
                          <p className="text-white/60">
                            {new Date(parada.inicio).toLocaleDateString()} →{" "}
                            {new Date(parada.fin).toLocaleDateString()}
                          </p>
                          <p className="text-white/50">
                            Criticidad: {parada.criticidad}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </PanelSection>

                <PanelSection title="Necesidades activas">
                  {panelData.necesidades.length === 0 ? (
                    <p className="text-xs text-white/50">
                      No hay necesidades de materiales activas.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-xs">
                      {panelData.necesidades.map((need, idx) => (
                        <li key={need.req_id ?? `need-${idx}`}>
                          <p className="text-white">
                            {need.insumo} ·{" "}
                            <span className="text-white/60">
                              {need.qty} {need.unidad_medida}
                            </span>
                          </p>
                          <p className="text-white/50">
                            Unidad: {need.unidad} · Lead time:{" "}
                            {need.lead_time_dias} días
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </PanelSection>
              </>
            )}

            {panelData?.type === "synergy" && (
              <PanelSection title="Detalles de la sinergia">
                <ul className="space-y-1 text-xs">
                  {panelData.metadata.map((item) => (
                    <li
                      key={item.label}
                      className="flex items-baseline justify-between text-xs"
                    >
                      <span className="text-white/50">{item.label}</span>
                      <span className="text-white">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </PanelSection>
            )}

            {panelData?.type === "other" && (
              <PanelSection title="Detalle de la entidad">
                <p className="text-xs text-white/50">
                  No hay información adicional disponible para esta entidad.
                </p>
              </PanelSection>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
