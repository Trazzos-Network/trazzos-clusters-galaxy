"use client";

import { useVisualizationStore } from "@/lib/store/visualization-store";
import CompanyNode from "./nodes/CompanyNode";

export default function Nodes() {
  const filters = useVisualizationStore((state) => state.filters);
  const enrichedCompanies = useVisualizationStore(
    (state) => state.enrichedCompanies
  );

  if (!filters.companies) return null;

  return (
    <group name="companies">
      {enrichedCompanies.map((company) => (
        <CompanyNode key={company.nodeId} company={company} />
      ))}
    </group>
  );
}
