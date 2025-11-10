"use client";

import { useEffect, useRef } from "react";

import { useAuthStore } from "@/lib/store/auth-store";
import { getDefaultAccessRecord } from "@/lib/auth/company-access";

const STORAGE_KEY = "trazzos:company-access-hash";

export default function AuthBootstrap() {
  const authenticate = useAuthStore((state) => state.authenticate);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let candidate: string | null = null;

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      candidate =
        url.searchParams.get("id") ??
        url.searchParams.get("hash") ??
        window.localStorage.getItem(STORAGE_KEY);
    }

    if (!candidate) {
      const fallback = getDefaultAccessRecord();
      candidate = fallback.hash;
    }

    authenticate(candidate);

    if (typeof window !== "undefined" && candidate) {
      window.localStorage.setItem(STORAGE_KEY, candidate);
    }
  }, [authenticate]);

  return null;
}
