"use client";

import {
  useVisualizationStore,
  type ClusterConnection,
} from "@/lib/store/visualization-store";
import ConnectionLine from "./connections/ConnectionLine";
import GroupedSynergyConnection from "./connections/GroupedSynergyConnection";
import { useFilteredConnections } from "./hooks/useFilteredConnections";

export default function Connections() {
  const filters = useVisualizationStore((state) => state.filters);
  const { filteredConnections } = useFilteredConnections();

  if (!filters.synergies) return null;

  const groupedSynergies: Array<{
    key: string;
    connections: ClusterConnection[];
  }> = [];
  const singleConnections: ClusterConnection[] = [];

  const groupMap = new Map<string, ClusterConnection[]>();

  filteredConnections.forEach((connection) => {
    if (connection.type !== "synergy") {
      singleConnections.push(connection);
      return;
    }

    const participants = [
      connection.from.empresa,
      connection.to.empresa,
    ].sort();
    const key = `${connection.clusterId}|${participants[0]}|${participants[1]}`;
    const existing = groupMap.get(key);
    if (existing) {
      existing.push(connection);
    } else {
      groupMap.set(key, [connection]);
    }
  });

  groupMap.forEach((connections, key) => {
    if (connections.length > 1) {
      groupedSynergies.push({ key, connections });
    } else {
      singleConnections.push(connections[0]!);
    }
  });

  return (
    <>
      {groupedSynergies.map(({ key, connections }) => (
        <GroupedSynergyConnection
          key={`group-${key}`}
          connections={connections}
        />
      ))}
      {singleConnections.map((connection: ClusterConnection) => (
        <ConnectionLine key={connection.id} connection={connection} />
      ))}
    </>
  );
}
