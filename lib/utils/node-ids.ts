export type NodeType =
  | "company"
  | "synergy"
  | "provider"
  | "rfp"
  | "offer"
  | "event";

export type NodeRef = `${NodeType}|${string}|${string}`;

export function createCompanyNodeId(
  clusterId: string,
  empresa: string
): NodeRef {
  return `company|${clusterId}|${empresa}` as NodeRef;
}

export function createSynergyNodeId(
  clusterId: string,
  sinergiaId: string
): NodeRef {
  return `synergy|${clusterId}|${sinergiaId}` as NodeRef;
}

export function parseNodeRef(nodeRef: string | null | undefined): {
  type: NodeType;
  clusterId: string;
  entityId: string;
} | null {
  if (!nodeRef) return null;
  const [type, clusterId, ...rest] = nodeRef.split("|");
  if (!type || !clusterId || rest.length === 0) return null;
  const entityId = rest.join("|");
  return {
    type: type as NodeType,
    clusterId,
    entityId,
  };
}

export function isCompanyNode(
  nodeRef: string | null | undefined
): nodeRef is NodeRef {
  const parsed = parseNodeRef(nodeRef);
  return Boolean(parsed && parsed.type === "company");
}

export function isSynergyNode(
  nodeRef: string | null | undefined
): nodeRef is NodeRef {
  const parsed = parseNodeRef(nodeRef);
  return Boolean(parsed && parsed.type === "synergy");
}
