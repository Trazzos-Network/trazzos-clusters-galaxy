import { Suspense } from "react";

import Scene from "@/components/3d/Scene";
import AuthBootstrap from "@/components/auth/AuthBootstrap";
import AuthScopeBadge from "@/components/auth/AuthScopeBadge";
import DebugPanel from "@/components/panels/DebugPanel";
import InfoPanel from "@/components/panels/InfoPanel";
import HoverInfoPanel from "@/components/panels/HoverInfoPanel";

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <AuthBootstrap />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full text-white">
            Cargando...
          </div>
        }
      >
        <Scene />
      </Suspense>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 z-999 flex flex-col gap-3 pointer-events-auto">
          <AuthScopeBadge />
          <DebugPanel />
        </div>
        <InfoPanel />
        <HoverInfoPanel />
      </div>
    </main>
  );
}
