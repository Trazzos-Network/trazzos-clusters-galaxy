"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function VanillaXRPage() {
  const [status, setStatus] = useState<string>("Inicializando escena XR…");

  useEffect(() => {
    let disposed = false;
    let disposeFn: (() => void) | undefined;

    async function bootstrap() {
      try {
        const clientModule = await import("./vanillaXrClient");
        const { message, dispose } = await clientModule.initVanillaXR({
          containerId: "xr-root",
        });

        if (!disposed) {
          if (message) setStatus(message);
          disposeFn = dispose;
        } else {
          dispose?.();
        }
      } catch (error) {
        console.error("Failed to initialize vanilla XR demo", error);
        if (!disposed) {
          setStatus(
            error instanceof Error ? error.message : "Fallo al inicializar XR"
          );
        }
      }
    }

    bootstrap();

    return () => {
      disposed = true;
      disposeFn?.();
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-black text-white">
      <header className="pointer-events-none absolute left-0 right-0 top-0 z-20 flex flex-col gap-2 px-6 py-4 text-sm">
        <div className="pointer-events-auto flex items-center justify-between rounded border border-white/10 bg-white/5 px-3 py-2 backdrop-blur">
          <span className="font-mono text-xs uppercase tracking-wider text-white/70">
            Demo XR Vanilla · Three.js
          </span>
          <Link
            href="/"
            className="rounded bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
          >
            Volver
          </Link>
        </div>
        <div className="pointer-events-auto rounded border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 backdrop-blur">
          {status}
        </div>
      </header>
      <div
        id="xr-root"
        className="relative flex h-screen w-screen items-center justify-center overflow-hidden"
      >
        <noscript className="absolute z-10 rounded bg-black/80 px-4 py-3 text-center text-sm">
          Necesitas habilitar JavaScript para usar la demo XR.
        </noscript>
      </div>
    </main>
  );
}
