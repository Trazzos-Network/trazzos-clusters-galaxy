"use client";

import { ShieldCheck } from "lucide-react";

import { useAuthStore } from "@/lib/store/auth-store";

export default function AuthScopeBadge() {
  const empresa = useAuthStore((state) => state.empresa);
  const clusterId = useAuthStore((state) => state.clusterId);
  const accessHash = useAuthStore((state) => state.accessHash);
  const error = useAuthStore((state) => state.error);

  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-white/10 bg-[#131313]/85 px-4 py-3 shadow-xl backdrop-blur">
      <ShieldCheck className="h-5 w-5 text-[#9aff8d]" />
      <div className="text-xs text-white/80">
        {error ? (
          <>
            <p className="font-semibold text-[#f97070]">
              Acceso restringido · ID no reconocido
            </p>
            <p className="text-white/60">
              Solicita un identificador válido para visualizar tu clúster.
            </p>
          </>
        ) : (
          <>
            <p className="text-white/60">
              Alcance autorizado · Identificador{" "}
              <span className="font-semibold text-white/90">{accessHash}</span>
            </p>
            <p className="font-semibold text-white">
              {empresa ?? "Sin compañía asignada"}
            </p>
            {clusterId && (
              <p className="text-white/50">Clúster activo: {clusterId}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
