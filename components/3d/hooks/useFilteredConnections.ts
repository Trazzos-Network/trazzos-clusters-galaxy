import { useMemo } from "react";
import { useVisualizationStore } from "@/lib/store/visualization-store";
import {
  createCompanyNodeId,
  createSynergyNodeId,
  parseNodeRef,
} from "@/lib/utils/node-ids";

export function useFilteredConnections() {
  const useOrdered = useVisualizationStore(
    (state) => state.debug.useOrderedConnections
  );
  const orderedConnections = useVisualizationStore(
    (state) => state.connections
  );
  const naturalConnections = useVisualizationStore(
    (state) => state.naturalConnections
  );
  const connectionMode = useVisualizationStore((state) => state.connectionMode);
  const selectedNode = useVisualizationStore((state) => state.selectedNode);

  const baseConnections = useMemo(
    () =>
      (useOrdered ? orderedConnections : naturalConnections).filter(
        (connection) => connection.type === "synergy"
      ),
    [naturalConnections, orderedConnections, useOrdered]
  );

  const selectedSynergy = useMemo(() => {
    const parsed = parseNodeRef(selectedNode);
    if (!parsed || parsed.type !== "synergy") return null;
    return parsed;
  }, [selectedNode]);

  const selectedCompany = useMemo(() => {
    const parsed = parseNodeRef(selectedNode);
    if (!parsed || parsed.type !== "company") return null;
    return parsed;
  }, [selectedNode]);

  const filteredConnections = useMemo(() => {
    const forcedConnections = new Set<string>();
    if (selectedSynergy) {
      baseConnections.forEach((connection) => {
        const synergyData = connection.data as { id?: string } | undefined;
        if (
          connection.clusterId === selectedSynergy.clusterId &&
          synergyData?.id === selectedSynergy.entityId
        ) {
          forcedConnections.add(connection.id);
        }
      });
    }

    if (connectionMode === "all") {
      return baseConnections;
    }

    if (connectionMode === "focus") {
      const focusClusterId = selectedCompany?.clusterId ?? null;
      const focusCompanyId = selectedCompany?.entityId ?? null;

      const focusedConnections =
        focusClusterId && focusCompanyId
          ? baseConnections.filter(
              (connection) =>
                connection.clusterId === focusClusterId &&
                (connection.from.empresa === focusCompanyId ||
                  connection.to.empresa === focusCompanyId)
            )
          : [];

      if (!forcedConnections.size) {
        return focusedConnections;
      }

      const merged = new Map<string, (typeof baseConnections)[number]>();
      for (const connection of [...focusedConnections, ...baseConnections]) {
        if (forcedConnections.has(connection.id)) {
          merged.set(connection.id, connection);
        }
      }
      return Array.from(merged.values());
    }

    const sorted = [...baseConnections].sort((a, b) => b.strength - a.strength);
    const maxConnections = Math.max(5, Math.ceil(sorted.length * 0.25));
    const base = sorted.slice(0, maxConnections);

    if (!forcedConnections.size) return base;

    const merged = new Map<string, (typeof baseConnections)[number]>();
    for (const connection of [...base, ...baseConnections]) {
      if (forcedConnections.has(connection.id)) {
        merged.set(connection.id, connection);
      }
    }
    return Array.from(merged.values());
  }, [baseConnections, connectionMode, selectedCompany, selectedSynergy]);

  const activeSynergyNodeIds = useMemo(() => {
    const ids = new Set<string>();
    filteredConnections.forEach((connection) => {
      const synergyData = connection.data as { id?: string } | undefined;
      if (synergyData?.id) {
        ids.add(createSynergyNodeId(connection.clusterId, synergyData.id));
      }
    });
    return ids;
  }, [filteredConnections]);

  const selectedCompanyNode = useMemo(() => {
    if (!selectedCompany) return null;
    return createCompanyNodeId(
      selectedCompany.clusterId,
      selectedCompany.entityId
    );
  }, [selectedCompany]);

  return {
    filteredConnections,
    activeSynergyNodeIds,
    selectedCompanyNode,
  } as const;
}
