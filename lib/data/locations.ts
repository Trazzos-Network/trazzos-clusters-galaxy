/**
 * Geographic locations for companies across the multi-cluster 3D scene.
 * Incluye el corredor petroquímico de Mamonal (Cartagena) y la red
 * agroindustrial de proteína blanca en el Valle del Cauca.
 */

export type Empresa =
  | "Argos - Cementos Caribe"
  | "Ajover S.A."
  | "Yara Colombia"
  | "Cabot Colombiana"
  | "Reficar (Ecopetrol)"
  | "Essentía IC"
  | "Cargill Proteína (Pollos Bucanero)"
  | "Santa Anita Nápoles"
  | "Porcícola del Valle (Porcival)"
  | "Mr. Lechón"
  | "Global Meals"
  | "Avícola Santa Rita";

export interface CompanyLocation {
  empresa: Empresa;
  name: string;
  lat: number;
  lon: number;
  city: string;
  country: string;
  source?: string;
}

/**
 * Company locations in Mamonal Industrial Zone, Cartagena
 * Coordinates are within the documented bounds for the industrial area
 */
export const COMPANY_LOCATIONS: CompanyLocation[] = [
  {
    empresa: "Argos - Cementos Caribe",
    name: "Argos - Cementos Caribe - Planta Cartagena",
    lat: 10.391,
    lon: -75.4794,
    city: "Cartagena",
    country: "Colombia",
    source: "Mamonal Industrial Zone - Representative coordinates",
  },
  {
    empresa: "Ajover S.A.",
    name: "Ajover S.A. - Terminal Químico Mamonal",
    lat: 10.4025,
    lon: -75.4728,
    city: "Cartagena",
    country: "Colombia",
    source: "Mamonal Industrial Zone - Representative coordinates",
  },
  {
    empresa: "Yara Colombia",
    name: "Yara Colombia - Planta Fertilizantes",
    lat: 10.415,
    lon: -75.465,
    city: "Cartagena",
    country: "Colombia",
    source: "Mamonal Industrial Zone - Representative coordinates",
  },
  {
    empresa: "Cabot Colombiana",
    name: "Cabot Colombiana - Planta Carbon Black",
    lat: 10.408,
    lon: -75.475,
    city: "Cartagena",
    country: "Colombia",
    source: "Mamonal Industrial Zone - Representative coordinates",
  },
  {
    empresa: "Reficar (Ecopetrol)",
    name: "Reficar (Ecopetrol) - Refinería Cartagena",
    lat: 10.425,
    lon: -75.458,
    city: "Cartagena",
    country: "Colombia",
    source: "Mamonal Industrial Zone - Representative coordinates",
  },
  {
    empresa: "Essentía IC",
    name: "Essentía IC - Planta Mamonal",
    lat: 10.395,
    lon: -75.482,
    city: "Cartagena",
    country: "Colombia",
    source: "Mamonal Industrial Zone - Representative coordinates",
  },
  {
    empresa: "Cargill Proteína (Pollos Bucanero)",
    name: "Cargill Proteína - Planta Candelaria",
    lat: 3.4045,
    lon: -76.4558,
    city: "Candelaria",
    country: "Colombia",
    source:
      "Zona industrial de Poblado Campestre (Candelaria) - Coordenadas referenciales 2024",
  },
  {
    empresa: "Santa Anita Nápoles",
    name: "Santa Anita Nápoles - Complejo Palmira",
    lat: 3.5392,
    lon: -76.2921,
    city: "Palmira",
    country: "Colombia",
    source:
      "Parque Industrial Santa Anita Nápoles - Coordenadas estimadas 2024",
  },
  {
    empresa: "Porcícola del Valle (Porcival)",
    name: "Porcícola del Valle - Planta Pradera",
    lat: 3.4278,
    lon: -76.4812,
    city: "Pradera",
    country: "Colombia",
    source: "Pradera - Circuito Porcícola Valle del Cauca 2023",
  },
  {
    empresa: "Mr. Lechón",
    name: "Mr. Lechón - Centro de Procesamiento Palmira",
    lat: 3.5124,
    lon: -76.3327,
    city: "Palmira",
    country: "Colombia",
    source: "Corredor Agroindustrial Palmira 2023",
  },
  {
    empresa: "Global Meals",
    name: "Global Meals - Planta Palmira",
    lat: 3.4715,
    lon: -76.2893,
    city: "Palmira",
    country: "Colombia",
    source: "Zonas Francas Palmira - Referencia logística 2023",
  },
  {
    empresa: "Avícola Santa Rita",
    name: "Avícola Santa Rita - Complejo El Cerrito",
    lat: 3.6842,
    lon: -76.3036,
    city: "El Cerrito",
    country: "Colombia",
    source: "Cluster Avícola Valle del Cauca 2024",
  },
] as const;

/**
 * Map bounds for Cartagena Industrial Zone
 */
export const MAP_BOUNDS = {
  north: 10.5,
  south: 3.2,
  east: -75.3,
  west: -76.6,
} as const;

const EMPRESA_SET: Set<string> = new Set(
  COMPANY_LOCATIONS.map((location) => location.empresa)
);

export function isEmpresa(value: string): value is Empresa {
  return EMPRESA_SET.has(value);
}
