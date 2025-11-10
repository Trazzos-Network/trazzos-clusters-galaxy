"use client";

import { create } from "zustand";

import type { Empresa } from "@/lib/data/locations";
import {
  getDefaultAccessRecord,
  resolveCompanyByHash,
} from "@/lib/auth/company-access";
import { useVisualizationStore } from "@/lib/store/visualization-store";

interface AuthState {
  accessHash: string | null;
  empresa: Empresa | null;
  clusterId: string | null;
  error: string | null;
  authenticate: (hash: string | null | undefined) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessHash: null,
  empresa: null,
  clusterId: null,
  error: null,
  authenticate: (hash) => {
    const normalized = hash?.trim().toLowerCase() ?? null;
    if (!normalized) {
      const fallback = getDefaultAccessRecord();
      useVisualizationStore.getState().personalizeForCompany(fallback.empresa);
      set({
        accessHash: fallback.hash,
        empresa: fallback.empresa,
        clusterId: fallback.clusterId,
        error: null,
      });
      return;
    }

    const resolved = resolveCompanyByHash(normalized);
    if (!resolved) {
      useVisualizationStore.getState().personalizeForCompany(null);
      set({
        accessHash: normalized,
        empresa: null,
        clusterId: null,
        error: "El identificador no es válido para esta instancia.",
      });
      return;
    }

    useVisualizationStore.getState().personalizeForCompany(resolved.empresa);
    set({
      accessHash: resolved.hash,
      empresa: resolved.empresa,
      clusterId: resolved.clusterId,
      error: null,
    });
  },
  logout: () => {
    useVisualizationStore.getState().personalizeForCompany(null);
    set({
      accessHash: null,
      empresa: null,
      clusterId: null,
      error: null,
    });
  },
}));
