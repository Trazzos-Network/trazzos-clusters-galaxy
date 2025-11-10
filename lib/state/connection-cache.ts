import {
  calculateConnections,
  optimizeCompanyLayout,
  type EnrichedCompany,
} from "@/lib/data/process-data";
import type { SinergiaDetectada } from "@/types";

interface CacheKey {
  empresas: string[];
  sinergias: SinergiaDetectada[];
  ordered: boolean;
}

function generateKey({ empresas, sinergias, ordered }: CacheKey): string {
  const empresasKey = empresas.slice().sort().join("|");
  const sinergiasKey = sinergias
    .map((item) => item.id)
    .sort()
    .join("|");
  return `${empresasKey}__${sinergiasKey}__${ordered ? "ordered" : "natural"}`;
}

const connectionsCache = new Map<
  string,
  ReturnType<typeof calculateConnections>
>();

const optimizedCache = new Map<string, EnrichedCompany[]>();

export function getOptimizedCompanies(
  key: string,
  optimizer: () => EnrichedCompany[]
): EnrichedCompany[] {
  if (!optimizedCache.has(key)) {
    optimizedCache.set(key, optimizer());
  }
  return optimizedCache.get(key)!;
}

export function getConnections(
  params: CacheKey,
  generator: () => ReturnType<typeof calculateConnections>
) {
  const cacheKey = generateKey(params);
  if (!connectionsCache.has(cacheKey)) {
    connectionsCache.set(cacheKey, generator());
  }
  return connectionsCache.get(cacheKey)!;
}

export function clearConnectionCache() {
  connectionsCache.clear();
  optimizedCache.clear();
}
