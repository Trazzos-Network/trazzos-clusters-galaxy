"use client";

import { COLORS } from "@/lib/utils/colors";

export default function Header() {
  return (
    <div className="">
      <h1 className="text-2xl font-bold" style={{ color: COLORS.foreground }}>
        Cluster Petroquímico 3D
      </h1>
      <p className="text-sm text-white/70 mt-1">
        Visualización de Red - Zona Industrial Mamonal
      </p>
    </div>
  );
}
