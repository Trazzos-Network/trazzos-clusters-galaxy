"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import { useVisualizationStore } from "@/lib/store/visualization-store";

const LABEL_OFFSET_Y = 2.4;
const LABEL_OFFSET_Z = -28;

export default function ClusterLabels() {
  const clusters = useVisualizationStore((state) => state.clusters);

  const labels = useMemo(
    () =>
      clusters.map((cluster) => ({
        id: cluster.id,
        text: cluster.etiqueta,
        position: [
          cluster.offset[0],
          LABEL_OFFSET_Y,
          cluster.offset[1] + LABEL_OFFSET_Z,
        ] as [number, number, number],
      })),
    [clusters]
  );

  return (
    <>
      {labels.map((label) => (
        <Html
          key={`cluster-label-${label.id}`}
          position={label.position}
          center
          pointerEvents="none"
        >
          <div className="px-4 py-2 rounded-lg border border-border bg-card/75 text-sm font-semibold text-[#cbffc4] shadow-2xl whitespace-nowrap">
            {label.text}
          </div>
        </Html>
      ))}
    </>
  );
}
