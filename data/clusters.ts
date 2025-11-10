import { COMPREHENSIVE_SAMPLE_2026_H1 } from "@/data/sample";
import { PROTEINA_BLANCA_SAMPLE_2026_H1 } from "@/data/sample-2";

export type ClusterDataset =
  | typeof COMPREHENSIVE_SAMPLE_2026_H1
  | typeof PROTEINA_BLANCA_SAMPLE_2026_H1;

export interface ClusterDefinition {
  id: string;
  etiqueta: string;
  descripcion: string;
  dataset: ClusterDataset;
  offset?: [number, number];
}

export const CLUSTERS_DATA: ClusterDefinition[] = [
  {
    id: "petroquimico-cartagena",
    etiqueta: "Clúster Petroquímico Cartagena",
    descripcion:
      "Red integrada de plantas petroquímicas con intensa demanda de mantenimiento y servicios especializados.",
    dataset: COMPREHENSIVE_SAMPLE_2026_H1,
    offset: [-30, 0],
  },
  {
    id: "proteina-blanca-valle",
    etiqueta: "Clúster Proteína Blanca Valle del Cauca",
    descripcion:
      "Cadena cárnica y avícola con énfasis en bioseguridad, procesamiento y logística fría regional.",
    dataset: PROTEINA_BLANCA_SAMPLE_2026_H1,
    offset: [30, 0],
  },
];
