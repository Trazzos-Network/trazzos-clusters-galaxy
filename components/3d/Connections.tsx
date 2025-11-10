"use client";

import {
  useVisualizationStore,
  type ClusterConnection,
} from "@/lib/store/visualization-store";
import ConnectionLine from "./connections/ConnectionLine";
import { useFilteredConnections } from "./hooks/useFilteredConnections";

export default function Connections() {
  const filters = useVisualizationStore((state) => state.filters);
  const { filteredConnections } = useFilteredConnections();

  if (!filters.synergies) return null;

  return (
    <>
      {filteredConnections.map((connection: ClusterConnection) => (
        <ConnectionLine key={connection.id} connection={connection} />
      ))}
    </>
  );
}
