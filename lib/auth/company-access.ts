import type { Empresa } from "@/lib/data/locations";

interface CompanyAccessRecord {
  hash: string;
  empresa: Empresa;
  clusterId: string;
}

const COMPANY_ACCESS_REGISTRY: CompanyAccessRecord[] = [
  {
    hash: "c92f5a4e-argos-2026",
    empresa: "Argos - Cementos Caribe",
    clusterId: "petroquimico-cartagena",
  },
  {
    hash: "d84aac7b-ajover-2026",
    empresa: "Ajover S.A.",
    clusterId: "petroquimico-cartagena",
  },
  {
    hash: "6af31e02-yara-2026",
    empresa: "Yara Colombia",
    clusterId: "petroquimico-cartagena",
  },
  {
    hash: "56b40ad5-cabot-2026",
    empresa: "Cabot Colombiana",
    clusterId: "petroquimico-cartagena",
  },
  {
    hash: "a3fe91cc-reficar-2026",
    empresa: "Reficar (Ecopetrol)",
    clusterId: "petroquimico-cartagena",
  },
  {
    hash: "1f6743d9-essentia-2026",
    empresa: "Essentía IC",
    clusterId: "petroquimico-cartagena",
  },
  {
    hash: "7d9c12ba-cargill-2026",
    empresa: "Cargill Proteína (Pollos Bucanero)",
    clusterId: "proteina-blanca-valle",
  },
  {
    hash: "f0a2d7c8-santa-anita-2026",
    empresa: "Santa Anita Nápoles",
    clusterId: "proteina-blanca-valle",
  },
  {
    hash: "e63bd104-porcival-2026",
    empresa: "Porcícola del Valle (Porcival)",
    clusterId: "proteina-blanca-valle",
  },
  {
    hash: "3416a0f9-mr-lechon-2026",
    empresa: "Mr. Lechón",
    clusterId: "proteina-blanca-valle",
  },
  {
    hash: "9be1d4c2-global-meals-2026",
    empresa: "Global Meals",
    clusterId: "proteina-blanca-valle",
  },
  {
    hash: "b7428e6d-santa-rita-2026",
    empresa: "Avícola Santa Rita",
    clusterId: "proteina-blanca-valle",
  },
];

export function resolveCompanyByHash(hash: string | null | undefined) {
  if (!hash) return null;
  const normalized = hash.trim().toLowerCase();
  return (
    COMPANY_ACCESS_REGISTRY.find(
      (entry) => entry.hash.toLowerCase() === normalized
    ) ?? null
  );
}

export function getDefaultAccessRecord(): CompanyAccessRecord {
  return COMPANY_ACCESS_REGISTRY[0]!;
}

export function listAvailableAccessIds(): CompanyAccessRecord[] {
  return COMPANY_ACCESS_REGISTRY.slice();
}
