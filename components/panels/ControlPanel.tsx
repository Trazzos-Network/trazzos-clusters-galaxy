"use client";

import { useVisualizationStore } from "@/lib/store/visualization-store";
import { COLORS } from "@/lib/utils/colors";

export default function ControlPanel() {
  const filters = useVisualizationStore((state) => state.filters);
  const toggleFilter = useVisualizationStore((state) => state.toggleFilter);
  const connectionMode = useVisualizationStore((state) => state.connectionMode);
  const setConnectionMode = useVisualizationStore(
    (state) => state.setConnectionMode
  );

  return (
    <div className="">
      {/* Connection view */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[#cbffc4]">
          Vista de conexiones
        </p>
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

      {/* Category Filters */}
      {/* <div className="space-y-2">
        <p
          className="text-sm font-semibold"
          style={{ color: COLORS.dataviz[0] }}
        >
          Filtros
        </p>
        {Object.entries(filters).map(([key, value]) => (
          <label
            key={key}
            className="flex items-center space-x-2 text-white text-sm cursor-pointer"
          >
            <input
              type="checkbox"
              checked={value}
              onChange={() => toggleFilter(key as keyof typeof filters)}
              className="accent-[#9aff8d]"
            />
            <span className="capitalize">
              {key === "companies"
                ? "Empresas"
                : key === "providers"
                ? "Proveedores"
                : key === "synergies"
                ? "Sinergias"
                : key === "rfps"
                ? "RFPs"
                : key === "offers"
                ? "Ofertas"
                : "Eventos"}
            </span>
          </label>
        ))}
      </div> */}
    </div>
  );
}
