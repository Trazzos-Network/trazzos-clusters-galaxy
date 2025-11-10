// ============================================================================
// COMPANIES CONTEXT
// ============================================================================

import {
  ParadaProgramada,
  ParadaId,
  Criticidad,
  NecesidadMaterial,
  ReqId,
  UnidadMedida,
  Proveedor,
  SinergiaDetectada,
  SinergiaId,
  EstadoSinergia,
  AccionSugerida,
  DecisionComite,
  KPIsCluster,
  LeaderboardProveedor,
  LogCambio,
  OfertaId,
  PONumber,
  RFPConjunta,
  TiempoCicloSinergia,
  UserId,
} from "@/types";

const COMPANIES_INFO = {
  argos: {
    name: "Argos - Cementos Caribe",
    type: "Cement & Concrete",
    plantas: ["Planta Cartagena", "Terminal Mamonal"],
  },
  ajover: {
    name: "Ajover S.A.",
    type: "Chemical Distribution & Storage",
    plantas: ["Terminal Químico Mamonal", "Bodega Central"],
  },
  yara: {
    name: "Yara Colombia",
    type: "Fertilizers & Industrial Chemicals",
    plantas: ["Planta Fertilizantes", "Planta Ácido Nítrico"],
  },
  cabot: {
    name: "Cabot Colombiana",
    type: "Carbon Black & Specialty Chemicals",
    plantas: ["Planta Carbon Black", "Unidad Masterbatch"],
  },
  reficar: {
    name: "Reficar (Ecopetrol)",
    type: "Oil Refinery",
    plantas: ["Refinería Cartagena", "Unidad FCC", "Hidrotratamiento"],
  },
  essentia: {
    name: "Essentía IC",
    type: "Agrochemicals & Intermediates",
    plantas: ["Planta Mamonal", "Reactor Batch", "Formulación"],
  },
};

// ============================================================================
// PARADAS PROGRAMADAS - 18 shutdowns across 6 months
// ============================================================================

const PARADAS_2026_H1: ParadaProgramada[] = [
  // === ENERO 2026 ===
  {
    parada_id: "PAR-AJOVER-2026-001" as ParadaId,
    empresa: "Ajover S.A.",
    planta: "Terminal Químico Mamonal",
    unidad: "Tanques de Almacenamiento TK-301/302",
    inicio: new Date("2026-01-10"),
    fin: new Date("2026-01-25"),
    alcance: "Inspección API 653 y revestimiento interno",
    criticidad: Criticidad.MEDIA,
    ventana_firme: true,
    responsable_email: "mantenimiento@ajover.com.co",
    ingested_at: new Date("2025-10-15T09:00:00Z"),
    source_file: "ajover_shutdowns_2026_h1.xlsx",
    validated: true,
  },
  {
    parada_id: "PAR-CABOT-2026-001" as ParadaId,
    empresa: "Cabot Colombiana",
    planta: "Planta Carbon Black",
    unidad: "Reactor CB-01",
    inicio: new Date("2026-01-15"),
    fin: new Date("2026-02-05"),
    alcance: "Cambio de refractarios y limpieza sistema de enfriamiento",
    criticidad: Criticidad.ALTA,
    ventana_firme: true,
    responsable_email: "ops.cartagena@cabot.com",
    ingested_at: new Date("2025-10-20T11:30:00Z"),
    source_file: "cabot_maintenance_schedule_2026.csv",
    validated: true,
  },

  // === FEBRERO 2026 ===
  {
    parada_id: "PAR-REFICAR-2026-001" as ParadaId,
    empresa: "Reficar (Ecopetrol)",
    planta: "Refinería Cartagena",
    unidad: "Unidad FCC",
    inicio: new Date("2026-02-10"),
    fin: new Date("2026-03-15"),
    alcance: "Turnaround mayor - regenerador, reactor y fraccionadora",
    criticidad: Criticidad.ALTA,
    ventana_firme: true,
    responsable_email: "paradas.fcc@ecopetrol.com.co",
    ingested_at: new Date("2025-10-10T08:00:00Z"),
    source_file: "reficar_major_turnarounds_2026.xlsx",
    validated: true,
  },
  {
    parada_id: "PAR-YARA-2026-001" as ParadaId,
    empresa: "Yara Colombia",
    planta: "Planta Ácido Nítrico",
    unidad: "Reactor AN-02",
    inicio: new Date("2026-02-15"),
    fin: new Date("2026-03-08"),
    alcance: "Reemplazo mallas Pt-Rh y refractarios absorbedor",
    criticidad: Criticidad.ALTA,
    ventana_firme: true,
    responsable_email: "shutdowns@yara.com",
    ingested_at: new Date("2025-10-18T10:00:00Z"),
    source_file: "yara_turnarounds_2026_q1.csv",
    validated: true,
  },
  {
    parada_id: "PAR-ARGOS-2026-001" as ParadaId,
    empresa: "Argos - Cementos Caribe",
    planta: "Planta Cartagena",
    unidad: "Horno Rotatorio 3",
    inicio: new Date("2026-02-20"),
    fin: new Date("2026-03-12"),
    alcance: "Reemplazo completo refractarios zona clinkerización",
    criticidad: Criticidad.ALTA,
    ventana_firme: true,
    responsable_email: "mantenimiento.cartagena@argos.co",
    ingested_at: new Date("2025-10-25T14:00:00Z"),
    source_file: "argos_kiln_shutdowns_2026.xlsx",
    validated: true,
  },

  // === MARZO 2026 ===
  {
    parada_id: "PAR-ESSENTIA-2026-001" as ParadaId,
    empresa: "Essentía IC",
    planta: "Planta Mamonal",
    unidad: "Reactor Batch RB-05",
    inicio: new Date("2026-03-05"),
    fin: new Date("2026-03-20"),
    alcance: "Overhaul reactor - agitador, serpentines, revestimiento",
    criticidad: Criticidad.MEDIA,
    ventana_firme: false,
    responsable_email: "ingenieria@essentia.com.co",
    ingested_at: new Date("2025-11-05T09:30:00Z"),
    source_file: "essentia_maintenance_2026_q1.csv",
    validated: true,
  },
  {
    parada_id: "PAR-AJOVER-2026-002" as ParadaId,
    empresa: "Ajover S.A.",
    planta: "Terminal Químico Mamonal",
    unidad: "Sistema de Bombeo Principal",
    inicio: new Date("2026-03-10"),
    fin: new Date("2026-03-18"),
    alcance: "Reemplazo bombas centrífugas y actuadores",
    criticidad: Criticidad.MEDIA,
    ventana_firme: true,
    responsable_email: "mantenimiento@ajover.com.co",
    ingested_at: new Date("2025-11-10T11:00:00Z"),
    source_file: "ajover_shutdowns_2026_h1.xlsx",
    validated: true,
  },

  // === ABRIL 2026 ===
  {
    parada_id: "PAR-CABOT-2026-002" as ParadaId,
    empresa: "Cabot Colombiana",
    planta: "Unidad Masterbatch",
    unidad: "Extrusoras EX-01 y EX-02",
    inicio: new Date("2026-04-05"),
    fin: new Date("2026-04-18"),
    alcance: "Cambio de tornillos y camisas, calibración",
    criticidad: Criticidad.MEDIA,
    ventana_firme: true,
    responsable_email: "ops.cartagena@cabot.com",
    ingested_at: new Date("2025-11-15T13:00:00Z"),
    source_file: "cabot_maintenance_schedule_2026.csv",
    validated: true,
  },
  {
    parada_id: "PAR-REFICAR-2026-002" as ParadaId,
    empresa: "Reficar (Ecopetrol)",
    planta: "Refinería Cartagena",
    unidad: "Unidad Hidrotratamiento HDT-02",
    inicio: new Date("2026-04-10"),
    fin: new Date("2026-05-05"),
    alcance: "Carga de catalizador y refractarios reactores",
    criticidad: Criticidad.ALTA,
    ventana_firme: true,
    responsable_email: "paradas.hdt@ecopetrol.com.co",
    ingested_at: new Date("2025-11-20T08:30:00Z"),
    source_file: "reficar_major_turnarounds_2026.xlsx",
    validated: true,
  },
  {
    parada_id: "PAR-YARA-2026-002" as ParadaId,
    empresa: "Yara Colombia",
    planta: "Planta Fertilizantes",
    unidad: "Reactor Amoniaco",
    inicio: new Date("2026-04-15"),
    fin: new Date("2026-05-10"),
    alcance: "Inspección tubos reformador y carga catalizador",
    criticidad: Criticidad.ALTA,
    ventana_firme: true,
    responsable_email: "shutdowns@yara.com",
    ingested_at: new Date("2025-11-22T09:45:00Z"),
    source_file: "yara_turnarounds_2026_q2.csv",
    validated: true,
  },

  // === MAYO 2026 ===
  {
    parada_id: "PAR-ARGOS-2026-002" as ParadaId,
    empresa: "Argos - Cementos Caribe",
    planta: "Planta Cartagena",
    unidad: "Horno Rotatorio 2",
    inicio: new Date("2026-05-05"),
    fin: new Date("2026-05-22"),
    alcance: "Mantenimiento preventivo y refractarios parcial",
    criticidad: Criticidad.MEDIA,
    ventana_firme: false,
    responsable_email: "mantenimiento.cartagena@argos.co",
    ingested_at: new Date("2025-12-01T10:00:00Z"),
    source_file: "argos_kiln_shutdowns_2026.xlsx",
    validated: true,
  },
  {
    parada_id: "PAR-ESSENTIA-2026-002" as ParadaId,
    empresa: "Essentía IC",
    planta: "Planta Mamonal",
    unidad: "Reactor Continuo RC-03",
    inicio: new Date("2026-05-10"),
    fin: new Date("2026-05-28"),
    alcance: "Cambio catalizador selectivo y limpieza sistema",
    criticidad: Criticidad.MEDIA,
    ventana_firme: true,
    responsable_email: "ingenieria@essentia.com.co",
    ingested_at: new Date("2025-12-05T11:30:00Z"),
    source_file: "essentia_maintenance_2026_q2.csv",
    validated: true,
  },
  {
    parada_id: "PAR-AJOVER-2026-003" as ParadaId,
    empresa: "Ajover S.A.",
    planta: "Bodega Central",
    unidad: "Sistema de Transferencia",
    inicio: new Date("2026-05-15"),
    fin: new Date("2026-05-25"),
    alcance: "Actualización instrumentación y válvulas",
    criticidad: Criticidad.BAJA,
    ventana_firme: false,
    responsable_email: "mantenimiento@ajover.com.co",
    ingested_at: new Date("2025-12-08T14:00:00Z"),
    source_file: "ajover_shutdowns_2026_h1.xlsx",
    validated: true,
  },

  // === JUNIO 2026 ===
  {
    parada_id: "PAR-CABOT-2026-003" as ParadaId,
    empresa: "Cabot Colombiana",
    planta: "Planta Carbon Black",
    unidad: "Sistema de Pelletizado",
    inicio: new Date("2026-06-01"),
    fin: new Date("2026-06-15"),
    alcance: "Mantenimiento preventivo pelletizadoras",
    criticidad: Criticidad.BAJA,
    ventana_firme: true,
    responsable_email: "ops.cartagena@cabot.com",
    ingested_at: new Date("2025-12-10T09:00:00Z"),
    source_file: "cabot_maintenance_schedule_2026.csv",
    validated: true,
  },
  {
    parada_id: "PAR-REFICAR-2026-003" as ParadaId,
    empresa: "Reficar (Ecopetrol)",
    planta: "Refinería Cartagena",
    unidad: "Torre Fraccionadora T-301",
    inicio: new Date("2026-06-05"),
    fin: new Date("2026-06-20"),
    alcance: "Inspección platos y reemplazo internos",
    criticidad: Criticidad.MEDIA,
    ventana_firme: true,
    responsable_email: "paradas.destilacion@ecopetrol.com.co",
    ingested_at: new Date("2025-12-12T10:30:00Z"),
    source_file: "reficar_major_turnarounds_2026.xlsx",
    validated: true,
  },
  {
    parada_id: "PAR-YARA-2026-003" as ParadaId,
    empresa: "Yara Colombia",
    planta: "Planta Fertilizantes",
    unidad: "Sistema de Granulación",
    inicio: new Date("2026-06-10"),
    fin: new Date("2026-06-25"),
    alcance: "Overhaul granulador y sistema de secado",
    criticidad: Criticidad.MEDIA,
    ventana_firme: true,
    responsable_email: "shutdowns@yara.com",
    ingested_at: new Date("2025-12-15T11:00:00Z"),
    source_file: "yara_turnarounds_2026_q2.csv",
    validated: true,
  },
  {
    parada_id: "PAR-ARGOS-2026-003" as ParadaId,
    empresa: "Argos - Cementos Caribe",
    planta: "Terminal Mamonal",
    unidad: "Sistema de Molienda",
    inicio: new Date("2026-06-15"),
    fin: new Date("2026-06-28"),
    alcance: "Reemplazo revestimientos molino y clasificador",
    criticidad: Criticidad.MEDIA,
    ventana_firme: false,
    responsable_email: "mantenimiento.cartagena@argos.co",
    ingested_at: new Date("2025-12-18T13:00:00Z"),
    source_file: "argos_kiln_shutdowns_2026.xlsx",
    validated: true,
  },
  {
    parada_id: "PAR-ESSENTIA-2026-003" as ParadaId,
    empresa: "Essentía IC",
    planta: "Planta Mamonal",
    unidad: "Torre de Destilación TD-02",
    inicio: new Date("2026-06-20"),
    fin: new Date("2026-07-05"),
    alcance: "Reemplazo platos y empaque estructurado",
    criticidad: Criticidad.ALTA,
    ventana_firme: true,
    responsable_email: "ingenieria@essentia.com.co",
    ingested_at: new Date("2025-12-20T14:30:00Z"),
    source_file: "essentia_maintenance_2026_q2.csv",
    validated: true,
  },
];

// ============================================================================
// NECESIDADES DE MATERIALES - 45+ requirements
// ============================================================================

const NECESIDADES_2026_H1: NecesidadMaterial[] = [
  // === REFRACTARIOS (Multiple companies - SYNERGY OPPORTUNITY 1) ===
  {
    req_id: "REQ-CABOT-2026-001" as ReqId,
    empresa: "Cabot Colombiana",
    unidad: "Reactor CB-01",
    insumo: "Refractario alto alúmina 85% castable",
    unidad_medida: UnidadMedida.M3,
    qty: 42.0,
    proveedor_preferente: "Thermal Ceramics Colombia",
    alternos: ["Refratechnik", "RHI Magnesita", "Vesuvius"],
    lead_time_dias: 55,
    ventana_entrega_ini: new Date("2025-12-20"),
    ventana_entrega_fin: new Date("2026-01-10"),
    parada_id: "PAR-CABOT-2026-001" as ParadaId,
    ingested_at: new Date("2025-10-20T11:30:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-REFICAR-2026-001" as ReqId,
    empresa: "Reficar (Ecopetrol)",
    unidad: "Unidad FCC",
    insumo: "Refractario alto alúmina 85% castable",
    unidad_medida: UnidadMedida.M3,
    qty: 68.0,
    proveedor_preferente: "Thermal Ceramics Colombia",
    alternos: ["Refratechnik", "RHI Magnesita"],
    lead_time_dias: 60,
    ventana_entrega_ini: new Date("2026-01-05"),
    ventana_entrega_fin: new Date("2026-02-05"),
    parada_id: "PAR-REFICAR-2026-001" as ParadaId,
    ingested_at: new Date("2025-10-10T08:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-YARA-2026-001" as ReqId,
    empresa: "Yara Colombia",
    unidad: "Reactor AN-02",
    insumo: "Refractario alto alúmina 85% castable",
    unidad_medida: UnidadMedida.M3,
    qty: 35.0,
    proveedor_preferente: null,
    alternos: ["Thermal Ceramics", "Refratechnik", "RHI Magnesita"],
    lead_time_dias: 50,
    ventana_entrega_ini: new Date("2026-01-10"),
    ventana_entrega_fin: new Date("2026-02-10"),
    parada_id: "PAR-YARA-2026-001" as ParadaId,
    ingested_at: new Date("2025-10-18T10:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-ARGOS-2026-001" as ReqId,
    empresa: "Argos - Cementos Caribe",
    unidad: "Horno Rotatorio 3",
    insumo: "Refractario alto alúmina 85% castable",
    unidad_medida: UnidadMedida.M3,
    qty: 55.0,
    proveedor_preferente: "RHI Magnesita",
    alternos: ["Thermal Ceramics", "Refratechnik"],
    lead_time_dias: 50,
    ventana_entrega_ini: new Date("2026-01-15"),
    ventana_entrega_fin: new Date("2026-02-15"),
    parada_id: "PAR-ARGOS-2026-001" as ParadaId,
    ingested_at: new Date("2025-10-25T14:00:00Z"),
    validated: true,
  },

  // === LADRILLOS REFRACTARIOS (SYNERGY OPPORTUNITY 2) ===
  {
    req_id: "REQ-ARGOS-2026-002" as ReqId,
    empresa: "Argos - Cementos Caribe",
    unidad: "Horno Rotatorio 3",
    insumo: "Ladrillos refractarios básicos magnesia-cromo",
    unidad_medida: UnidadMedida.TON,
    qty: 22.0,
    proveedor_preferente: "RHI Magnesita",
    alternos: ["Vesuvius", "Saint-Gobain"],
    lead_time_dias: 65,
    ventana_entrega_ini: new Date("2026-01-10"),
    ventana_entrega_fin: new Date("2026-02-10"),
    parada_id: "PAR-ARGOS-2026-001" as ParadaId,
    ingested_at: new Date("2025-10-25T14:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-CABOT-2026-002" as ReqId,
    empresa: "Cabot Colombiana",
    unidad: "Reactor CB-01",
    insumo: "Ladrillos refractarios básicos magnesia-cromo",
    unidad_medida: UnidadMedida.TON,
    qty: 18.0,
    proveedor_preferente: "RHI Magnesita",
    alternos: ["Vesuvius"],
    lead_time_dias: 60,
    ventana_entrega_ini: new Date("2025-12-25"),
    ventana_entrega_fin: new Date("2026-01-12"),
    parada_id: "PAR-CABOT-2026-001" as ParadaId,
    ingested_at: new Date("2025-10-20T11:30:00Z"),
    validated: true,
  },

  // === CATALIZADORES (Various types) ===
  {
    req_id: "REQ-REFICAR-2026-002" as ReqId,
    empresa: "Reficar (Ecopetrol)",
    unidad: "Unidad FCC",
    insumo: "Catalizador FCC zeolita USY",
    unidad_medida: UnidadMedida.TON,
    qty: 150.0,
    proveedor_preferente: "Grace Catalysts",
    alternos: ["BASF", "Albemarle"],
    lead_time_dias: 90,
    ventana_entrega_ini: new Date("2025-11-15"),
    ventana_entrega_fin: new Date("2026-01-30"),
    parada_id: "PAR-REFICAR-2026-001" as ParadaId,
    ingested_at: new Date("2025-10-10T08:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-REFICAR-2026-003" as ReqId,
    empresa: "Reficar (Ecopetrol)",
    unidad: "Unidad Hidrotratamiento HDT-02",
    insumo: "Catalizador hidrotratamiento CoMo/Al2O3",
    unidad_medida: UnidadMedida.TON,
    qty: 85.0,
    proveedor_preferente: "Criterion Catalysts",
    alternos: ["Haldor Topsoe", "Axens"],
    lead_time_dias: 120,
    ventana_entrega_ini: new Date("2026-01-15"),
    ventana_entrega_fin: new Date("2026-03-25"),
    parada_id: "PAR-REFICAR-2026-002" as ParadaId,
    ingested_at: new Date("2025-11-20T08:30:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-YARA-2026-002" as ReqId,
    empresa: "Yara Colombia",
    unidad: "Reactor Amoniaco",
    insumo: "Catalizador reformado primario Ni/Al2O3",
    unidad_medida: UnidadMedida.TON,
    qty: 45.0,
    proveedor_preferente: "Clariant",
    alternos: ["Johnson Matthey", "Haldor Topsoe"],
    lead_time_dias: 100,
    ventana_entrega_ini: new Date("2026-01-20"),
    ventana_entrega_fin: new Date("2026-04-01"),
    parada_id: "PAR-YARA-2026-002" as ParadaId,
    ingested_at: new Date("2025-11-22T09:45:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-ESSENTIA-2026-001" as ReqId,
    empresa: "Essentía IC",
    unidad: "Reactor Continuo RC-03",
    insumo: "Catalizador selectivo paladio/carbón",
    unidad_medida: UnidadMedida.KG,
    qty: 180.0,
    proveedor_preferente: "Johnson Matthey",
    alternos: ["BASF Precious Metals", "Evonik"],
    lead_time_dias: 75,
    ventana_entrega_ini: new Date("2026-03-15"),
    ventana_entrega_fin: new Date("2026-05-01"),
    parada_id: "PAR-ESSENTIA-2026-002" as ParadaId,
    ingested_at: new Date("2025-12-05T11:30:00Z"),
    validated: true,
  },

  // === PLATINOS (SYNERGY OPPORTUNITY 3) ===
  {
    req_id: "REQ-YARA-2026-003" as ReqId,
    empresa: "Yara Colombia",
    unidad: "Reactor AN-02",
    insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
    unidad_medida: UnidadMedida.KG,
    qty: 95.0,
    proveedor_preferente: "Johnson Matthey",
    alternos: ["Heraeus", "BASF Precious Metals"],
    lead_time_dias: 90,
    ventana_entrega_ini: new Date("2025-12-10"),
    ventana_entrega_fin: new Date("2026-02-05"),
    parada_id: "PAR-YARA-2026-001" as ParadaId,
    ingested_at: new Date("2025-10-18T10:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-ESSENTIA-2026-002" as ReqId,
    empresa: "Essentía IC",
    unidad: "Reactor Batch RB-05",
    insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
    unidad_medida: UnidadMedida.KG,
    qty: 28.0,
    proveedor_preferente: "Johnson Matthey",
    alternos: ["Heraeus"],
    lead_time_dias: 85,
    ventana_entrega_ini: new Date("2026-01-20"),
    ventana_entrega_fin: new Date("2026-02-28"),
    parada_id: "PAR-ESSENTIA-2026-001" as ParadaId,
    ingested_at: new Date("2025-11-05T09:30:00Z"),
    validated: true,
  },

  // === VÁLVULAS Y ACTUADORES (SYNERGY OPPORTUNITY 4) ===
  {
    req_id: "REQ-AJOVER-2026-001" as ReqId,
    empresa: "Ajover S.A.",
    unidad: "Sistema de Bombeo Principal",
    insumo: "Válvulas mariposa DN150 PN16 acero inoxidable",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 12.0,
    proveedor_preferente: "Flowserve",
    alternos: ["Fisher", "Spirax Sarco"],
    lead_time_dias: 45,
    ventana_entrega_ini: new Date("2026-02-05"),
    ventana_entrega_fin: new Date("2026-03-05"),
    parada_id: "PAR-AJOVER-2026-002" as ParadaId,
    ingested_at: new Date("2025-11-10T11:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-REFICAR-2026-004" as ReqId,
    empresa: "Reficar (Ecopetrol)",
    unidad: "Torre Fraccionadora T-301",
    insumo: "Válvulas mariposa DN150 PN16 acero inoxidable",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 18.0,
    proveedor_preferente: "Fisher",
    alternos: ["Flowserve", "Spirax Sarco"],
    lead_time_dias: 50,
    ventana_entrega_ini: new Date("2026-04-20"),
    ventana_entrega_fin: new Date("2026-05-30"),
    parada_id: "PAR-REFICAR-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-12T10:30:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-YARA-2026-004" as ReqId,
    empresa: "Yara Colombia",
    unidad: "Planta Fertilizantes",
    insumo: "Válvulas mariposa DN150 PN16 acero inoxidable",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 8.0,
    proveedor_preferente: "Flowserve",
    alternos: ["Fisher"],
    lead_time_dias: 45,
    ventana_entrega_ini: new Date("2026-05-01"),
    ventana_entrega_fin: new Date("2026-06-05"),
    parada_id: "PAR-YARA-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-15T11:00:00Z"),
    validated: true,
  },

  // === BOMBAS CENTRÍFUGAS (SYNERGY OPPORTUNITY 5) ===
  {
    req_id: "REQ-AJOVER-2026-002" as ReqId,
    empresa: "Ajover S.A.",
    unidad: "Sistema de Bombeo Principal",
    insumo: "Bombas centrífugas API 610 50HP acero inoxidable",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 4.0,
    proveedor_preferente: "Sulzer",
    alternos: ["Flowserve", "KSB"],
    lead_time_dias: 90,
    ventana_entrega_ini: new Date("2026-01-05"),
    ventana_entrega_fin: new Date("2026-03-01"),
    parada_id: "PAR-AJOVER-2026-002" as ParadaId,
    ingested_at: new Date("2025-11-10T11:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-ESSENTIA-2026-003" as ReqId,
    empresa: "Essentía IC",
    unidad: "Torre de Destilación TD-02",
    insumo: "Bombas centrífugas API 610 50HP acero inoxidable",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 3.0,
    proveedor_preferente: "Sulzer",
    alternos: ["Flowserve"],
    lead_time_dias: 85,
    ventana_entrega_ini: new Date("2026-04-25"),
    ventana_entrega_fin: new Date("2026-06-15"),
    parada_id: "PAR-ESSENTIA-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-20T14:30:00Z"),
    validated: true,
  },

  // === REVESTIMIENTOS EPÓXICOS (SYNERGY OPPORTUNITY 6) ===
  {
    req_id: "REQ-AJOVER-2026-003" as ReqId,
    empresa: "Ajover S.A.",
    unidad: "Tanques de Almacenamiento TK-301/302",
    insumo: "Revestimiento epóxico grado químico",
    unidad_medida: UnidadMedida.LITROS,
    qty: 850.0,
    proveedor_preferente: "Sherwin Williams",
    alternos: ["Jotun", "Hempel"],
    lead_time_dias: 30,
    ventana_entrega_ini: new Date("2025-12-20"),
    ventana_entrega_fin: new Date("2026-01-05"),
    parada_id: "PAR-AJOVER-2026-001" as ParadaId,
    ingested_at: new Date("2025-10-15T09:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-REFICAR-2026-005" as ReqId,
    empresa: "Reficar (Ecopetrol)",
    unidad: "Torre Fraccionadora T-301",
    insumo: "Revestimiento epóxico grado químico",
    unidad_medida: UnidadMedida.LITROS,
    qty: 1200.0,
    proveedor_preferente: "Jotun",
    alternos: ["Sherwin Williams", "Hempel"],
    lead_time_dias: 35,
    ventana_entrega_ini: new Date("2026-05-01"),
    ventana_entrega_fin: new Date("2026-06-01"),
    parada_id: "PAR-REFICAR-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-12T10:30:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-ESSENTIA-2026-004" as ReqId,
    empresa: "Essentía IC",
    unidad: "Reactor Batch RB-05",
    insumo: "Revestimiento epóxico grado químico",
    unidad_medida: UnidadMedida.LITROS,
    qty: 650.0,
    proveedor_preferente: "Sherwin Williams",
    alternos: ["Jotun"],
    lead_time_dias: 30,
    ventana_entrega_ini: new Date("2026-02-10"),
    ventana_entrega_fin: new Date("2026-03-01"),
    parada_id: "PAR-ESSENTIA-2026-001" as ParadaId,
    ingested_at: new Date("2025-11-05T09:30:00Z"),
    validated: true,
  },

  // === EMPAQUE ESTRUCTURADO (SYNERGY OPPORTUNITY 7) ===
  {
    req_id: "REQ-ESSENTIA-2026-005" as ReqId,
    empresa: "Essentía IC",
    unidad: "Torre de Destilación TD-02",
    insumo: "Empaque estructurado metálico Mellapak 250Y",
    unidad_medida: UnidadMedida.M3,
    qty: 12.0,
    proveedor_preferente: "Sulzer Chemtech",
    alternos: ["Koch-Glitsch", "Raschig"],
    lead_time_dias: 70,
    ventana_entrega_ini: new Date("2026-05-01"),
    ventana_entrega_fin: new Date("2026-06-15"),
    parada_id: "PAR-ESSENTIA-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-20T14:30:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-REFICAR-2026-006" as ReqId,
    empresa: "Reficar (Ecopetrol)",
    unidad: "Torre Fraccionadora T-301",
    insumo: "Empaque estructurado metálico Mellapak 250Y",
    unidad_medida: UnidadMedida.M3,
    qty: 18.0,
    proveedor_preferente: "Sulzer Chemtech",
    alternos: ["Koch-Glitsch"],
    lead_time_dias: 75,
    ventana_entrega_ini: new Date("2026-04-10"),
    ventana_entrega_fin: new Date("2026-05-30"),
    parada_id: "PAR-REFICAR-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-12T10:30:00Z"),
    validated: true,
  },

  // === RODAMIENTOS Y SELLOS (SYNERGY OPPORTUNITY 8) ===
  {
    req_id: "REQ-CABOT-2026-003" as ReqId,
    empresa: "Cabot Colombiana",
    unidad: "Extrusoras EX-01 y EX-02",
    insumo: "Rodamientos radiales SKF 6320/C3",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 24.0,
    proveedor_preferente: "SKF Colombia",
    alternos: ["FAG", "Timken"],
    lead_time_dias: 40,
    ventana_entrega_ini: new Date("2026-03-01"),
    ventana_entrega_fin: new Date("2026-04-01"),
    parada_id: "PAR-CABOT-2026-002" as ParadaId,
    ingested_at: new Date("2025-11-15T13:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-ARGOS-2026-003" as ReqId,
    empresa: "Argos - Cementos Caribe",
    unidad: "Sistema de Molienda",
    insumo: "Rodamientos radiales SKF 6320/C3",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 16.0,
    proveedor_preferente: "SKF Colombia",
    alternos: ["FAG"],
    lead_time_dias: 35,
    ventana_entrega_ini: new Date("2026-05-15"),
    ventana_entrega_fin: new Date("2026-06-10"),
    parada_id: "PAR-ARGOS-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-18T13:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-YARA-2026-005" as ReqId,
    empresa: "Yara Colombia",
    unidad: "Sistema de Granulación",
    insumo: "Rodamientos radiales SKF 6320/C3",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 20.0,
    proveedor_preferente: "SKF Colombia",
    alternos: ["FAG", "Timken"],
    lead_time_dias: 40,
    ventana_entrega_ini: new Date("2026-05-10"),
    ventana_entrega_fin: new Date("2026-06-05"),
    parada_id: "PAR-YARA-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-15T11:00:00Z"),
    validated: true,
  },

  // === INSTRUMENTACIÓN (Various)===
  {
    req_id: "REQ-AJOVER-2026-004" as ReqId,
    empresa: "Ajover S.A.",
    unidad: "Sistema de Transferencia",
    insumo: "Transmisores de presión Rosemount 3051",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 15.0,
    proveedor_preferente: "Emerson",
    alternos: ["Endress+Hauser", "Yokogawa"],
    lead_time_dias: 50,
    ventana_entrega_ini: new Date("2026-04-01"),
    ventana_entrega_fin: new Date("2026-05-10"),
    parada_id: "PAR-AJOVER-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-08T14:00:00Z"),
    validated: true,
  },

  // === MATERIALES ESPECÍFICOS POR COMPAÑÍA ===
  {
    req_id: "REQ-ARGOS-2026-004" as ReqId,
    empresa: "Argos - Cementos Caribe",
    unidad: "Sistema de Molienda",
    insumo: "Revestimientos molino acero al manganeso",
    unidad_medida: UnidadMedida.TON,
    qty: 8.5,
    proveedor_preferente: "Metso Outotec",
    alternos: ["FLSmidth", "Magotteaux"],
    lead_time_dias: 60,
    ventana_entrega_ini: new Date("2026-05-01"),
    ventana_entrega_fin: new Date("2026-06-10"),
    parada_id: "PAR-ARGOS-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-18T13:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-CABOT-2026-004" as ReqId,
    empresa: "Cabot Colombiana",
    unidad: "Sistema de Pelletizado",
    insumo: "Cuchillas pelletizadora acero herramienta",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 48.0,
    proveedor_preferente: "Gala Industries",
    alternos: ["Automatik", "Bay Plastics"],
    lead_time_dias: 45,
    ventana_entrega_ini: new Date("2026-05-01"),
    ventana_entrega_fin: new Date("2026-05-28"),
    parada_id: "PAR-CABOT-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-10T09:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-YARA-2026-006" as ReqId,
    empresa: "Yara Colombia",
    unidad: "Sistema de Granulación",
    insumo: "Tamices granulador acero inoxidable 304",
    unidad_medida: UnidadMedida.M3,
    qty: 25.0,
    proveedor_preferente: "Sweco",
    alternos: ["Russell Finex", "Kason"],
    lead_time_dias: 50,
    ventana_entrega_ini: new Date("2026-05-10"),
    ventana_entrega_fin: new Date("2026-06-05"),
    parada_id: "PAR-YARA-2026-003" as ParadaId,
    ingested_at: new Date("2025-12-15T11:00:00Z"),
    validated: true,
  },

  // Additional requirements for Q2 activities
  {
    req_id: "REQ-ARGOS-2026-005" as ReqId,
    empresa: "Argos - Cementos Caribe",
    unidad: "Horno Rotatorio 2",
    insumo: "Refractario alto alúmina 85% castable",
    unidad_medida: UnidadMedida.M3,
    qty: 32.0,
    proveedor_preferente: "Thermal Ceramics Colombia",
    alternos: ["RHI Magnesita"],
    lead_time_dias: 45,
    ventana_entrega_ini: new Date("2026-04-01"),
    ventana_entrega_fin: new Date("2026-05-01"),
    parada_id: "PAR-ARGOS-2026-002" as ParadaId,
    ingested_at: new Date("2025-12-01T10:00:00Z"),
    validated: true,
  },
  {
    req_id: "REQ-YARA-2026-007" as ReqId,
    empresa: "Yara Colombia",
    unidad: "Reactor Amoniaco",
    insumo: "Tubos reformador Inconel 625 schedule 80",
    unidad_medida: UnidadMedida.UNIDAD,
    qty: 32.0,
    proveedor_preferente: "Tenaris",
    alternos: ["Vallourec", "Sandvik"],
    lead_time_dias: 120,
    ventana_entrega_ini: new Date("2026-01-10"),
    ventana_entrega_fin: new Date("2026-04-05"),
    parada_id: "PAR-YARA-2026-002" as ParadaId,
    ingested_at: new Date("2025-11-22T09:45:00Z"),
    validated: true,
  },
];

// ============================================================================
// PROVEEDORES - Extended list
// ============================================================================

const PROVEEDORES_EXTENDIDO: Proveedor[] = [
  // Refractarios
  {
    insumo: "Refractario alto alúmina 85% castable",
    proveedor: "Thermal Ceramics Colombia",
    contacto: "Carlos Mendoza",
    email: "carlos.mendoza@thermalceramics.com.co",
    sla_objetivo: 0.97,
    observaciones: "Proveedor local con inventario en Cartagena",
    entregas_historicas: 52,
    cumplimiento_historico: 0.96,
  },
  {
    insumo: "Refractario alto alúmina 85% castable",
    proveedor: "Refratechnik",
    contacto: "Hans Schmidt",
    email: "h.schmidt@refratechnik.de",
    sla_objetivo: 0.95,
    observaciones: "Importación desde Alemania - calidad premium",
    entregas_historicas: 28,
    cumplimiento_historico: 0.94,
  },
  {
    insumo: "Refractario alto alúmina 85% castable",
    proveedor: "RHI Magnesita",
    contacto: "Patricia Silva",
    email: "patricia.silva@rhimagnesita.com",
    sla_objetivo: 0.96,
    observaciones: "Importación desde Brasil",
    entregas_historicas: 35,
    cumplimiento_historico: 0.95,
  },
  {
    insumo: "Refractario alto alúmina 85% castable",
    proveedor: "Vesuvius Colombia",
    contacto: "Ricardo Gómez",
    email: "ricardo.gomez@vesuvius.com",
    sla_objetivo: 0.94,
    observaciones: "Representante local, stock limitado",
    entregas_historicas: 18,
    cumplimiento_historico: 0.93,
  },

  // Ladrillos
  {
    insumo: "Ladrillos refractarios básicos magnesia-cromo",
    proveedor: "RHI Magnesita",
    contacto: "Patricia Silva",
    email: "patricia.silva@rhimagnesita.com",
    sla_objetivo: 0.96,
    observaciones: "Especialista en refractarios básicos",
    entregas_historicas: 24,
    cumplimiento_historico: 0.96,
  },
  {
    insumo: "Ladrillos refractarios básicos magnesia-cromo",
    proveedor: "Vesuvius Colombia",
    contacto: "Ricardo Gómez",
    email: "ricardo.gomez@vesuvius.com",
    sla_objetivo: 0.94,
    observaciones: "Segunda opción competitiva",
    entregas_historicas: 15,
    cumplimiento_historico: 0.94,
  },

  // Catalizadores FCC
  {
    insumo: "Catalizador FCC zeolita USY",
    proveedor: "Grace Catalysts",
    contacto: "Michael Johnson",
    email: "michael.johnson@grace.com",
    sla_objetivo: 0.98,
    observaciones: "Líder mundial en catalizadores FCC",
    entregas_historicas: 18,
    cumplimiento_historico: 0.98,
  },
  {
    insumo: "Catalizador FCC zeolita USY",
    proveedor: "BASF Catalysts",
    contacto: "Thomas Weber",
    email: "thomas.weber@basf.com",
    sla_objetivo: 0.97,
    observaciones: "Calidad consistente, precio competitivo",
    entregas_historicas: 12,
    cumplimiento_historico: 0.97,
  },

  // Catalizadores HDT
  {
    insumo: "Catalizador hidrotratamiento CoMo/Al2O3",
    proveedor: "Criterion Catalysts",
    contacto: "Robert Williams",
    email: "robert.williams@criterioncatalysts.com",
    sla_objetivo: 0.98,
    observaciones: "Especialista en hidrotratamiento",
    entregas_historicas: 9,
    cumplimiento_historico: 0.99,
  },
  {
    insumo: "Catalizador hidrotratamiento CoMo/Al2O3",
    proveedor: "Haldor Topsoe",
    contacto: "Lars Nielsen",
    email: "lars.nielsen@topsoe.com",
    sla_objetivo: 0.97,
    observaciones: "Tecnología de punta",
    entregas_historicas: 7,
    cumplimiento_historico: 0.97,
  },

  // Platinos
  {
    insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
    proveedor: "Johnson Matthey",
    contacto: "David Williams",
    email: "david.williams@matthey.com",
    sla_objetivo: 0.99,
    observaciones: "Líder en metales preciosos - UK",
    entregas_historicas: 11,
    cumplimiento_historico: 1.0,
  },
  {
    insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
    proveedor: "Heraeus Precious Metals",
    contacto: "Franz Mueller",
    email: "franz.mueller@heraeus.com",
    sla_objetivo: 0.98,
    observaciones: "Excelente servicio técnico",
    entregas_historicas: 8,
    cumplimiento_historico: 0.98,
  },

  // Válvulas
  {
    insumo: "Válvulas mariposa DN150 PN16 acero inoxidable",
    proveedor: "Flowserve",
    contacto: "Juan Pérez",
    email: "juan.perez@flowserve.com",
    sla_objetivo: 0.96,
    observaciones: "Representante local con stock",
    entregas_historicas: 32,
    cumplimiento_historico: 0.96,
  },
  {
    insumo: "Válvulas mariposa DN150 PN16 acero inoxidable",
    proveedor: "Fisher (Emerson)",
    contacto: "María González",
    email: "maria.gonzalez@emerson.com",
    sla_objetivo: 0.95,
    observaciones: "Buena relación calidad-precio",
    entregas_historicas: 28,
    cumplimiento_historico: 0.95,
  },

  // Bombas
  {
    insumo: "Bombas centrífugas API 610 50HP acero inoxidable",
    proveedor: "Sulzer",
    contacto: "Pedro Martínez",
    email: "pedro.martinez@sulzer.com",
    sla_objetivo: 0.96,
    observaciones: "Especialista en aplicaciones químicas",
    entregas_historicas: 14,
    cumplimiento_historico: 0.96,
  },
  {
    insumo: "Bombas centrífugas API 610 50HP acero inoxidable",
    proveedor: "Flowserve",
    contacto: "Juan Pérez",
    email: "juan.perez@flowserve.com",
    sla_objetivo: 0.95,
    observaciones: "Amplio inventario",
    entregas_historicas: 11,
    cumplimiento_historico: 0.94,
  },

  // Revestimientos
  {
    insumo: "Revestimiento epóxico grado químico",
    proveedor: "Sherwin Williams",
    contacto: "Ana Torres",
    email: "ana.torres@sherwin.com",
    sla_objetivo: 0.98,
    observaciones: "Proveedor local, entrega rápida",
    entregas_historicas: 45,
    cumplimiento_historico: 0.98,
  },
  {
    insumo: "Revestimiento epóxico grado químico",
    proveedor: "Jotun",
    contacto: "Lars Andersen",
    email: "lars.andersen@jotun.com",
    sla_objetivo: 0.97,
    observaciones: "Calidad industrial comprobada",
    entregas_historicas: 38,
    cumplimiento_historico: 0.97,
  },

  // Empaque estructurado
  {
    insumo: "Empaque estructurado metálico Mellapak 250Y",
    proveedor: "Sulzer Chemtech",
    contacto: "Heinrich Schmidt",
    email: "heinrich.schmidt@sulzer.com",
    sla_objetivo: 0.97,
    observaciones: "Fabricante original",
    entregas_historicas: 6,
    cumplimiento_historico: 0.97,
  },
  {
    insumo: "Empaque estructurado metálico Mellapak 250Y",
    proveedor: "Koch-Glitsch",
    contacto: "James Brown",
    email: "james.brown@koch-glitsch.com",
    sla_objetivo: 0.96,
    observaciones: "Alternativa competitiva",
    entregas_historicas: 4,
    cumplimiento_historico: 0.96,
  },

  // Rodamientos
  {
    insumo: "Rodamientos radiales SKF 6320/C3",
    proveedor: "SKF Colombia",
    contacto: "Carlos Ruiz",
    email: "carlos.ruiz@skf.com",
    sla_objetivo: 0.98,
    observaciones: "Distribuidor autorizado con stock local",
    entregas_historicas: 56,
    cumplimiento_historico: 0.98,
  },
  {
    insumo: "Rodamientos radiales SKF 6320/C3",
    proveedor: "FAG (Schaeffler)",
    contacto: "Wolfgang Klein",
    email: "wolfgang.klein@schaeffler.com",
    sla_objetivo: 0.96,
    observaciones: "Calidad alemana",
    entregas_historicas: 42,
    cumplimiento_historico: 0.96,
  },
];

// ============================================================================
// SINERGIAS DETECTADAS - 8 major synergies
// ============================================================================

const SINERGIAS_2026_H1: SinergiaDetectada[] = [
  // === SYNERGY 1: Refractarios Alto Alúmina (CERRADA) ===
  {
    id: "SNG-2026-01-ALUMINA" as SinergiaId,
    mes: "2026-01",
    insumo: "Refractario alto alúmina 85% castable",
    empresas: [
      "Cabot Colombiana",
      "Reficar (Ecopetrol)",
      "Yara Colombia",
      "Argos - Cementos Caribe",
    ],
    empresas_involucradas: 4,
    volumen_total: 200.0,
    unidad_medida: UnidadMedida.M3,
    umbral: 120.0,
    ahorro_estimado_pct: 16.5,
    ahorro_estimado_monto: 168300,
    ventana: [new Date("2025-12-20"), new Date("2026-02-15")],
    ventana_dias: 57,
    estado: EstadoSinergia.CERRADA,
    accion_sugerida: AccionSugerida.RFP_CONJUNTA,
    detalle_empresas: [
      {
        empresa: "Cabot Colombiana",
        unidad: "Reactor CB-01",
        qty: 42.0,
        ventana_entrega: [new Date("2025-12-20"), new Date("2026-01-10")],
        criticidad: Criticidad.ALTA,
        req_id: "REQ-CABOT-2026-001" as ReqId,
        parada_id: "PAR-CABOT-2026-001" as ParadaId,
      },
      {
        empresa: "Reficar (Ecopetrol)",
        unidad: "Unidad FCC",
        qty: 68.0,
        ventana_entrega: [new Date("2026-01-05"), new Date("2026-02-05")],
        criticidad: Criticidad.ALTA,
        req_id: "REQ-REFICAR-2026-001" as ReqId,
        parada_id: "PAR-REFICAR-2026-001" as ParadaId,
      },
      {
        empresa: "Yara Colombia",
        unidad: "Reactor AN-02",
        qty: 35.0,
        ventana_entrega: [new Date("2026-01-10"), new Date("2026-02-10")],
        criticidad: Criticidad.ALTA,
        req_id: "REQ-YARA-2026-001" as ReqId,
        parada_id: "PAR-YARA-2026-001" as ParadaId,
      },
      {
        empresa: "Argos - Cementos Caribe",
        unidad: "Horno Rotatorio 3",
        qty: 55.0,
        ventana_entrega: [new Date("2026-01-15"), new Date("2026-02-15")],
        criticidad: Criticidad.ALTA,
        req_id: "REQ-ARGOS-2026-001" as ReqId,
        parada_id: "PAR-ARGOS-2026-001" as ParadaId,
      },
    ],
    detectada_en: new Date("2025-10-28T04:15:00Z"),
    actualizada_en: new Date("2026-01-15T10:00:00Z"),
    version: 8,
  },

  // === SYNERGY 2: Ladrillos Refractarios (CERRADA) ===
  {
    id: "SNG-2026-01-LADRILLOS" as SinergiaId,
    mes: "2026-01",
    insumo: "Ladrillos refractarios básicos magnesia-cromo",
    empresas: ["Argos - Cementos Caribe", "Cabot Colombiana"],
    empresas_involucradas: 2,
    volumen_total: 40.0,
    unidad_medida: UnidadMedida.TON,
    umbral: 25.0,
    ahorro_estimado_pct: 11.2,
    ahorro_estimado_monto: 53760,
    ventana: [new Date("2025-12-25"), new Date("2026-02-10")],
    ventana_dias: 47,
    estado: EstadoSinergia.CERRADA,
    accion_sugerida: AccionSugerida.RFP_CONJUNTA,
    detalle_empresas: [
      {
        empresa: "Argos - Cementos Caribe",
        unidad: "Horno Rotatorio 3",
        qty: 22.0,
        ventana_entrega: [new Date("2026-01-10"), new Date("2026-02-10")],
        criticidad: Criticidad.ALTA,
        req_id: "REQ-ARGOS-2026-002" as ReqId,
        parada_id: "PAR-ARGOS-2026-001" as ParadaId,
      },
      {
        empresa: "Cabot Colombiana",
        unidad: "Reactor CB-01",
        qty: 18.0,
        ventana_entrega: [new Date("2025-12-25"), new Date("2026-01-12")],
        criticidad: Criticidad.ALTA,
        req_id: "REQ-CABOT-2026-002" as ReqId,
        parada_id: "PAR-CABOT-2026-001" as ParadaId,
      },
    ],
    detectada_en: new Date("2025-10-28T04:15:00Z"),
    actualizada_en: new Date("2026-01-08T14:30:00Z"),
    version: 6,
  },

  // === SYNERGY 3: Platinos (APROBADA) ===
  {
    id: "SNG-2026-02-PLATINO" as SinergiaId,
    mes: "2026-02",
    insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
    empresas: ["Yara Colombia", "Essentía IC"],
    empresas_involucradas: 2,
    volumen_total: 123.0,
    unidad_medida: UnidadMedida.KG,
    umbral: 80.0,
    ahorro_estimado_pct: 9.5,
    ahorro_estimado_monto: 175950,
    ventana: [new Date("2025-12-10"), new Date("2026-02-28")],
    ventana_dias: 80,
    estado: EstadoSinergia.APROBADA,
    accion_sugerida: AccionSugerida.RFP_CONJUNTA,
    detalle_empresas: [
      {
        empresa: "Yara Colombia",
        unidad: "Reactor AN-02",
        qty: 95.0,
        ventana_entrega: [new Date("2025-12-10"), new Date("2026-02-05")],
        criticidad: Criticidad.ALTA,
        req_id: "REQ-YARA-2026-003" as ReqId,
        parada_id: "PAR-YARA-2026-001" as ParadaId,
      },
      {
        empresa: "Essentía IC",
        unidad: "Reactor Batch RB-05",
        qty: 28.0,
        ventana_entrega: [new Date("2026-01-20"), new Date("2026-02-28")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-ESSENTIA-2026-002" as ReqId,
        parada_id: "PAR-ESSENTIA-2026-001" as ParadaId,
      },
    ],
    detectada_en: new Date("2025-11-08T05:20:00Z"),
    actualizada_en: new Date("2025-12-28T16:00:00Z"),
    version: 5,
  },

  // === SYNERGY 4: Válvulas (EN_RFP) ===
  {
    id: "SNG-2026-03-VALVULAS" as SinergiaId,
    mes: "2026-03",
    insumo: "Válvulas mariposa DN150 PN16 acero inoxidable",
    empresas: ["Ajover S.A.", "Reficar (Ecopetrol)", "Yara Colombia"],
    empresas_involucradas: 3,
    volumen_total: 38.0,
    unidad_medida: UnidadMedida.UNIDAD,
    umbral: 20.0,
    ahorro_estimado_pct: 13.8,
    ahorro_estimado_monto: 52440,
    ventana: [new Date("2026-02-05"), new Date("2026-06-05")],
    ventana_dias: 120,
    estado: EstadoSinergia.EN_RFP,
    accion_sugerida: AccionSugerida.RFP_CONJUNTA,
    detalle_empresas: [
      {
        empresa: "Ajover S.A.",
        unidad: "Sistema de Bombeo Principal",
        qty: 12.0,
        ventana_entrega: [new Date("2026-02-05"), new Date("2026-03-05")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-AJOVER-2026-001" as ReqId,
        parada_id: "PAR-AJOVER-2026-002" as ParadaId,
      },
      {
        empresa: "Reficar (Ecopetrol)",
        unidad: "Torre Fraccionadora T-301",
        qty: 18.0,
        ventana_entrega: [new Date("2026-04-20"), new Date("2026-05-30")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-REFICAR-2026-004" as ReqId,
        parada_id: "PAR-REFICAR-2026-003" as ParadaId,
      },
      {
        empresa: "Yara Colombia",
        unidad: "Planta Fertilizantes",
        qty: 8.0,
        ventana_entrega: [new Date("2026-05-01"), new Date("2026-06-05")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-YARA-2026-004" as ReqId,
        parada_id: "PAR-YARA-2026-003" as ParadaId,
      },
    ],
    detectada_en: new Date("2025-12-15T06:30:00Z"),
    actualizada_en: new Date("2026-01-10T09:00:00Z"),
    version: 3,
  },

  // === SYNERGY 5: Bombas Centrífugas (EN_RFP) ===
  {
    id: "SNG-2026-04-BOMBAS" as SinergiaId,
    mes: "2026-04",
    insumo: "Bombas centrífugas API 610 50HP acero inoxidable",
    empresas: ["Ajover S.A.", "Essentía IC"],
    empresas_involucradas: 2,
    volumen_total: 7.0,
    unidad_medida: UnidadMedida.UNIDAD,
    umbral: 5.0,
    ahorro_estimado_pct: 10.5,
    ahorro_estimado_monto: 73500,
    ventana: [new Date("2026-01-05"), new Date("2026-06-15")],
    ventana_dias: 162,
    estado: EstadoSinergia.EN_RFP,
    accion_sugerida: AccionSugerida.RFP_CONJUNTA,
    detalle_empresas: [
      {
        empresa: "Ajover S.A.",
        unidad: "Sistema de Bombeo Principal",
        qty: 4.0,
        ventana_entrega: [new Date("2026-01-05"), new Date("2026-03-01")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-AJOVER-2026-002" as ReqId,
        parada_id: "PAR-AJOVER-2026-002" as ParadaId,
      },
      {
        empresa: "Essentía IC",
        unidad: "Torre de Destilación TD-02",
        qty: 3.0,
        ventana_entrega: [new Date("2026-04-25"), new Date("2026-06-15")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-ESSENTIA-2026-003" as ReqId,
        parada_id: "PAR-ESSENTIA-2026-003" as ParadaId,
      },
    ],
    detectada_en: new Date("2025-12-22T07:45:00Z"),
    actualizada_en: new Date("2026-01-18T11:00:00Z"),
    version: 2,
  },

  // === SYNERGY 6: Revestimientos Epóxicos (PENDIENTE) ===
  {
    id: "SNG-2026-05-EPOXICO" as SinergiaId,
    mes: "2026-05",
    insumo: "Revestimiento epóxico grado químico",
    empresas: ["Ajover S.A.", "Reficar (Ecopetrol)", "Essentía IC"],
    empresas_involucradas: 3,
    volumen_total: 2700.0,
    unidad_medida: UnidadMedida.LITROS,
    umbral: 1500.0,
    ahorro_estimado_pct: 12.0,
    ahorro_estimado_monto: 32400,
    ventana: [new Date("2025-12-20"), new Date("2026-06-01")],
    ventana_dias: 164,
    estado: EstadoSinergia.PENDIENTE,
    accion_sugerida: AccionSugerida.RFP_CONJUNTA,
    detalle_empresas: [
      {
        empresa: "Ajover S.A.",
        unidad: "Tanques de Almacenamiento TK-301/302",
        qty: 850.0,
        ventana_entrega: [new Date("2025-12-20"), new Date("2026-01-05")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-AJOVER-2026-003" as ReqId,
        parada_id: "PAR-AJOVER-2026-001" as ParadaId,
      },
      {
        empresa: "Reficar (Ecopetrol)",
        unidad: "Torre Fraccionadora T-301",
        qty: 1200.0,
        ventana_entrega: [new Date("2026-05-01"), new Date("2026-06-01")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-REFICAR-2026-005" as ReqId,
        parada_id: "PAR-REFICAR-2026-003" as ParadaId,
      },
      {
        empresa: "Essentía IC",
        unidad: "Reactor Batch RB-05",
        qty: 650.0,
        ventana_entrega: [new Date("2026-02-10"), new Date("2026-03-01")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-ESSENTIA-2026-004" as ReqId,
        parada_id: "PAR-ESSENTIA-2026-001" as ParadaId,
      },
    ],
    detectada_en: new Date("2026-01-05T08:10:00Z"),
    actualizada_en: new Date("2026-01-05T08:10:00Z"),
    version: 1,
  },

  // === SYNERGY 7: Empaque Estructurado (PENDIENTE) ===
  {
    id: "SNG-2026-06-EMPAQUE" as SinergiaId,
    mes: "2026-06",
    insumo: "Empaque estructurado metálico Mellapak 250Y",
    empresas: ["Essentía IC", "Reficar (Ecopetrol)"],
    empresas_involucradas: 2,
    volumen_total: 30.0,
    unidad_medida: UnidadMedida.M3,
    umbral: 20.0,
    ahorro_estimado_pct: 14.5,
    ahorro_estimado_monto: 87000,
    ventana: [new Date("2026-04-10"), new Date("2026-06-15")],
    ventana_dias: 66,
    estado: EstadoSinergia.PENDIENTE,
    accion_sugerida: AccionSugerida.RFP_CONJUNTA,
    detalle_empresas: [
      {
        empresa: "Essentía IC",
        unidad: "Torre de Destilación TD-02",
        qty: 12.0,
        ventana_entrega: [new Date("2026-05-01"), new Date("2026-06-15")],
        criticidad: Criticidad.ALTA,
        req_id: "REQ-ESSENTIA-2026-005" as ReqId,
        parada_id: "PAR-ESSENTIA-2026-003" as ParadaId,
      },
      {
        empresa: "Reficar (Ecopetrol)",
        unidad: "Torre Fraccionadora T-301",
        qty: 18.0,
        ventana_entrega: [new Date("2026-04-10"), new Date("2026-05-30")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-REFICAR-2026-006" as ReqId,
        parada_id: "PAR-REFICAR-2026-003" as ParadaId,
      },
    ],
    detectada_en: new Date("2026-01-20T09:30:00Z"),
    actualizada_en: new Date("2026-01-20T09:30:00Z"),
    version: 1,
  },

  // === SYNERGY 8: Rodamientos (PENDIENTE) ===
  {
    id: "SNG-2026-06-RODAMIENTOS" as SinergiaId,
    mes: "2026-06",
    insumo: "Rodamientos radiales SKF 6320/C3",
    empresas: ["Cabot Colombiana", "Argos - Cementos Caribe", "Yara Colombia"],
    empresas_involucradas: 3,
    volumen_total: 60.0,
    unidad_medida: UnidadMedida.UNIDAD,
    umbral: 40.0,
    ahorro_estimado_pct: 11.0,
    ahorro_estimado_monto: 26400,
    ventana: [new Date("2026-03-01"), new Date("2026-06-10")],
    ventana_dias: 101,
    estado: EstadoSinergia.PENDIENTE,
    accion_sugerida: AccionSugerida.RFP_CONJUNTA,
    detalle_empresas: [
      {
        empresa: "Cabot Colombiana",
        unidad: "Extrusoras EX-01 y EX-02",
        qty: 24.0,
        ventana_entrega: [new Date("2026-03-01"), new Date("2026-04-01")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-CABOT-2026-003" as ReqId,
        parada_id: "PAR-CABOT-2026-002" as ParadaId,
      },
      {
        empresa: "Argos - Cementos Caribe",
        unidad: "Sistema de Molienda",
        qty: 16.0,
        ventana_entrega: [new Date("2026-05-15"), new Date("2026-06-10")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-ARGOS-2026-003" as ReqId,
        parada_id: "PAR-ARGOS-2026-003" as ParadaId,
      },
      {
        empresa: "Yara Colombia",
        unidad: "Sistema de Granulación",
        qty: 20.0,
        ventana_entrega: [new Date("2026-05-10"), new Date("2026-06-05")],
        criticidad: Criticidad.MEDIA,
        req_id: "REQ-YARA-2026-005" as ReqId,
        parada_id: "PAR-YARA-2026-003" as ParadaId,
      },
    ],
    detectada_en: new Date("2026-01-25T10:15:00Z"),
    actualizada_en: new Date("2026-01-25T10:15:00Z"),
    version: 1,
  },
];

// ============================================================================
// RFPs CONJUNTAS - Detailed processes
// ============================================================================

const RFPS_2026_H1: RFPConjunta[] = [
  // === RFP 1: Refractarios Alto Alúmina (COMPLETADA) ===
  {
    rfp_id: "RFP-SNG-2026-01-ALUMINA",
    sinergia_id: "SNG-2026-01-ALUMINA" as SinergiaId,

    fecha_emision: new Date("2025-11-01T09:00:00Z"),
    fecha_cierre: new Date("2025-12-05T23:59:59Z"),
    fecha_decision: new Date("2025-12-18T14:00:00Z"),

    documento_url: "https://drive.google.com/file/d/rfp_2026_alumina_doc",
    anexo_a_url: "https://drive.google.com/file/d/rfp_2026_alumina_anexo_a",
    anexo_b_url: "https://drive.google.com/file/d/rfp_2026_alumina_anexo_b",

    proveedores_invitados: [
      "Thermal Ceramics Colombia",
      "Refratechnik",
      "RHI Magnesita",
      "Vesuvius Colombia",
    ],

    ofertas: [
      {
        oferta_id: "OFR-RFP-001-TC" as OfertaId,
        rfp_id: "RFP-SNG-2026-01-ALUMINA",
        sinergia_id: "SNG-2026-01-ALUMINA" as SinergiaId,

        proveedor: "Thermal Ceramics Colombia",
        contacto: "Carlos Mendoza",
        email: "carlos.mendoza@thermalceramics.com.co",

        precio_unitario: 5120.0,
        moneda: "USD",
        descuento_volumen_pct: 16.5,
        monto_total: 1024000.0,

        lead_time_dias: 52,
        sla_propuesto: 0.97,
        validez_oferta_dias: 90,
        condiciones_pago: "40% anticipo, 40% contra entrega, 20% 30 días",

        especificacion_cumple: true,
        certificaciones: [
          "ISO 9001:2015",
          "ISO 14001:2015",
          "ASTM C401",
          "API 936",
        ],
        comentarios:
          "Incluye supervisión técnica en sitio y capacitación. Entregas escalonadas según calendario acordado.",

        scoring: {
          punt_precio: 100.0,
          punt_lead_time: 94.2,
          punt_sla: 97.0,
          punt_certificaciones: 100.0,
          score_total: 97.8,
          rank: 1,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2025-12-08T10:00:00Z"),
        },

        recibida_en: new Date("2025-12-03T15:30:00Z"),
        validada: true,
      },
      {
        oferta_id: "OFR-RFP-001-RHI" as OfertaId,
        rfp_id: "RFP-SNG-2026-01-ALUMINA",
        sinergia_id: "SNG-2026-01-ALUMINA" as SinergiaId,

        proveedor: "RHI Magnesita",
        contacto: "Patricia Silva",
        email: "patricia.silva@rhimagnesita.com",

        precio_unitario: 5380.0,
        moneda: "USD",
        descuento_volumen_pct: 14.0,
        monto_total: 1076000.0,

        lead_time_dias: 58,
        sla_propuesto: 0.96,
        validez_oferta_dias: 60,
        condiciones_pago: "30% anticipo, 70% 45 días fecha factura",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "ISO 45001:2018", "ASTM C401"],
        comentarios:
          "Importación desde Brasil. Incluye flete marítimo y seguro.",

        scoring: {
          punt_precio: 95.2,
          punt_lead_time: 89.7,
          punt_sla: 96.0,
          score_total: 93.5,
          rank: 2,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2025-12-08T10:00:00Z"),
        },

        recibida_en: new Date("2025-12-04T11:45:00Z"),
        validada: true,
      },
      {
        oferta_id: "OFR-RFP-001-REF" as OfertaId,
        rfp_id: "RFP-SNG-2026-01-ALUMINA",
        sinergia_id: "SNG-2026-01-ALUMINA" as SinergiaId,

        proveedor: "Refratechnik",
        contacto: "Hans Schmidt",
        email: "h.schmidt@refratechnik.de",

        precio_unitario: 5650.0,
        moneda: "USD",
        descuento_volumen_pct: 12.0,
        monto_total: 1130000.0,

        lead_time_dias: 68,
        sla_propuesto: 0.95,
        validez_oferta_dias: 120,
        condiciones_pago: "25% anticipo, 75% contra BL",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "DIN 51063", "ASTM C401", "EN 993"],
        comentarios:
          "Calidad premium alemana. Importación vía aérea disponible con sobrecosto.",

        scoring: {
          punt_precio: 90.6,
          punt_lead_time: 76.5,
          punt_sla: 95.0,
          score_total: 87.9,
          rank: 3,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2025-12-08T10:00:00Z"),
        },

        recibida_en: new Date("2025-12-05T18:20:00Z"),
        validada: true,
      },
      {
        oferta_id: "OFR-RFP-001-VES" as OfertaId,
        rfp_id: "RFP-SNG-2026-01-ALUMINA",
        sinergia_id: "SNG-2026-01-ALUMINA" as SinergiaId,

        proveedor: "Vesuvius Colombia",
        contacto: "Ricardo Gómez",
        email: "ricardo.gomez@vesuvius.com",

        precio_unitario: 5450.0,
        moneda: "USD",
        descuento_volumen_pct: 13.0,
        monto_total: 1090000.0,

        lead_time_dias: 62,
        sla_propuesto: 0.94,
        validez_oferta_dias: 45,
        condiciones_pago: "50% anticipo, 50% contra entrega",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "ASTM C401"],
        comentarios:
          "Stock limitado local. Requiere confirmación de disponibilidad.",

        scoring: {
          punt_precio: 94.0,
          punt_lead_time: 83.9,
          punt_sla: 94.0,
          score_total: 91.2,
          rank: 4,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2025-12-08T10:00:00Z"),
        },

        recibida_en: new Date("2025-12-05T09:15:00Z"),
        validada: true,
      },
    ],

    evaluacion: {
      rfp_id: "RFP-SNG-2026-01-ALUMINA",
      top_ofertas: [
        "OFR-RFP-001-TC" as OfertaId,
        "OFR-RFP-001-RHI" as OfertaId,
        "OFR-RFP-001-VES" as OfertaId,
      ],
      proveedor_recomendado: "Thermal Ceramics Colombia",
      oferta_recomendada_id: "OFR-RFP-001-TC" as OfertaId,
      justificacion: `Thermal Ceramics ofrece el mejor valor integral:
            - Mejor precio unitario ($5,120 vs $5,380-$5,650)
            - Descuento por volumen más agresivo (16.5%)
            - Lead time competitivo (52 días vs 58-68)
            - Proveedor local con menor riesgo logístico
            - Historial comprobado: 96% cumplimiento, 52 entregas
            - Incluye soporte técnico completo sin costo adicional
            - Todas las certificaciones requeridas
            
            Ahorro vs baseline (promedio proveedores anteriores): $168,300 USD (16.5%)
            Ahorro vs segunda mejor oferta (RHI): $52,000 USD (5.1%)`,

      ahorro_vs_baseline_pct: 16.5,
      ahorro_vs_baseline_monto: 168300,

      evaluado_por: [
        "sourcing.cluster@reficar.com.co" as UserId,
        "compras@cabot.com" as UserId,
        "procurement@yara.com" as UserId,
        "sourcing@argos.co" as UserId,
      ],
      evaluado_en: new Date("2025-12-10T16:30:00Z"),

      requiere_aprobacion_comite: true,
      aprobado: true,
      aprobado_por: "director.cluster@cartagena-industrial.com" as UserId,
      aprobado_en: new Date("2025-12-18T14:00:00Z"),
    },

    estado: "completada",
    owner_email: "sourcing.cluster@reficar.com.co",

    creada_en: new Date("2025-11-01T09:00:00Z"),
    actualizada_en: new Date("2026-01-15T10:00:00Z"),
  },

  // === RFP 2: Ladrillos Refractarios (COMPLETADA) ===
  {
    rfp_id: "RFP-SNG-2026-01-LADRILLOS",
    sinergia_id: "SNG-2026-01-LADRILLOS" as SinergiaId,

    fecha_emision: new Date("2025-11-05T10:00:00Z"),
    fecha_cierre: new Date("2025-12-10T23:59:59Z"),
    fecha_decision: new Date("2025-12-22T11:00:00Z"),

    documento_url: "https://drive.google.com/file/d/rfp_2026_ladrillos_doc",
    anexo_a_url: "https://drive.google.com/file/d/rfp_2026_ladrillos_anexo_a",
    anexo_b_url: "https://drive.google.com/file/d/rfp_2026_ladrillos_anexo_b",

    proveedores_invitados: [
      "RHI Magnesita",
      "Vesuvius Colombia",
      "Saint-Gobain",
    ],

    ofertas: [
      {
        oferta_id: "OFR-RFP-002-RHI" as OfertaId,
        rfp_id: "RFP-SNG-2026-01-LADRILLOS",
        sinergia_id: "SNG-2026-01-LADRILLOS" as SinergiaId,

        proveedor: "RHI Magnesita",
        contacto: "Patricia Silva",
        email: "patricia.silva@rhimagnesita.com",

        precio_unitario: 11800.0,
        moneda: "USD",
        descuento_volumen_pct: 11.2,
        monto_total: 472000.0,

        lead_time_dias: 62,
        sla_propuesto: 0.96,
        validez_oferta_dias: 75,
        condiciones_pago: "35% anticipo, 65% 45 días",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "ASTM C455", "ISO 1927"],
        comentarios:
          "Especialista en refractarios básicos. Incluye asesoría de instalación.",

        scoring: {
          punt_precio: 100.0,
          punt_lead_time: 93.5,
          punt_sla: 96.0,
          score_total: 97.6,
          rank: 1,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2025-12-12T09:00:00Z"),
        },

        recibida_en: new Date("2025-12-08T14:20:00Z"),
        validada: true,
      },
      {
        oferta_id: "OFR-RFP-002-VES" as OfertaId,
        rfp_id: "RFP-SNG-2026-01-LADRILLOS",
        sinergia_id: "SNG-2026-01-LADRILLOS" as SinergiaId,

        proveedor: "Vesuvius Colombia",
        contacto: "Ricardo Gómez",
        email: "ricardo.gomez@vesuvius.com",

        precio_unitario: 12300.0,
        moneda: "USD",
        descuento_volumen_pct: 9.5,
        monto_total: 492000.0,

        lead_time_dias: 58,
        sla_propuesto: 0.94,
        validez_oferta_dias: 60,
        condiciones_pago: "40% anticipo, 60% contra entrega",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "ASTM C455"],
        comentarios: "Stock parcial local. Confirmación en 48 horas.",

        scoring: {
          punt_precio: 95.9,
          punt_lead_time: 100.0,
          punt_sla: 94.0,
          score_total: 96.6,
          rank: 2,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2025-12-12T09:00:00Z"),
        },

        recibida_en: new Date("2025-12-09T16:40:00Z"),
        validada: true,
      },
    ],

    evaluacion: {
      rfp_id: "RFP-SNG-2026-01-LADRILLOS",
      top_ofertas: [
        "OFR-RFP-002-RHI" as OfertaId,
        "OFR-RFP-002-VES" as OfertaId,
      ],
      proveedor_recomendado: "RHI Magnesita",
      oferta_recomendada_id: "OFR-RFP-002-RHI" as OfertaId,
      justificacion: `RHI Magnesita es el proveedor recomendado por:
            - Mejor precio ($11,800/ton vs $12,300)
            - Mayor descuento por volumen (11.2% vs 9.5%)
            - Especialista reconocido en refractarios básicos
            - Mejor SLA (96% vs 94%)
            - Incluye asesoría técnica de instalación
            - Lead time ligeramente mayor pero dentro de ventana
            
            Ahorro total: $53,760 USD (11.2%)`,

      ahorro_vs_baseline_pct: 11.2,
      ahorro_vs_baseline_monto: 53760,

      evaluado_por: [
        "sourcing@argos.co" as UserId,
        "compras@cabot.com" as UserId,
      ],
      evaluado_en: new Date("2025-12-15T14:00:00Z"),

      requiere_aprobacion_comite: false,
      aprobado: true,
      aprobado_por: "sourcing@argos.co" as UserId,
      aprobado_en: new Date("2025-12-22T11:00:00Z"),
    },

    estado: "completada",
    owner_email: "sourcing@argos.co",

    creada_en: new Date("2025-11-05T10:00:00Z"),
    actualizada_en: new Date("2026-01-08T14:30:00Z"),
  },

  // === RFP 3: Platinos (COMPLETADA - APROBADA) ===
  {
    rfp_id: "RFP-SNG-2026-02-PLATINO",
    sinergia_id: "SNG-2026-02-PLATINO" as SinergiaId,

    fecha_emision: new Date("2025-11-12T09:00:00Z"),
    fecha_cierre: new Date("2025-12-20T23:59:59Z"),
    fecha_decision: new Date("2025-12-28T16:00:00Z"),

    documento_url: "https://drive.google.com/file/d/rfp_2026_platino_doc",
    anexo_a_url: "https://drive.google.com/file/d/rfp_2026_platino_anexo_a",
    anexo_b_url: "https://drive.google.com/file/d/rfp_2026_platino_anexo_b",

    proveedores_invitados: [
      "Johnson Matthey",
      "Heraeus Precious Metals",
      "BASF Precious Metals",
    ],

    ofertas: [
      {
        oferta_id: "OFR-RFP-003-JM" as OfertaId,
        rfp_id: "RFP-SNG-2026-02-PLATINO",
        sinergia_id: "SNG-2026-02-PLATINO" as SinergiaId,

        proveedor: "Johnson Matthey",
        contacto: "David Williams",
        email: "david.williams@matthey.com",

        precio_unitario: 14850.0,
        moneda: "USD",
        descuento_volumen_pct: 9.5,
        monto_total: 1826550.0,

        lead_time_dias: 88,
        sla_propuesto: 0.99,
        validez_oferta_dias: 45,
        condiciones_pago: "50% anticipo, 50% contra BL",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "ISO 14001:2015", "REACH", "RoHS"],
        comentarios:
          "Líder mundial en metales preciosos. Incluye análisis metalúrgico y certificado de composición.",

        scoring: {
          punt_precio: 100.0,
          punt_lead_time: 93.2,
          punt_sla: 99.0,
          score_total: 98.1,
          rank: 1,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2025-12-22T10:00:00Z"),
        },

        recibida_en: new Date("2025-12-18T17:30:00Z"),
        validada: true,
      },
      {
        oferta_id: "OFR-RFP-003-HER" as OfertaId,
        rfp_id: "RFP-SNG-2026-02-PLATINO",
        sinergia_id: "SNG-2026-02-PLATINO" as SinergiaId,

        proveedor: "Heraeus Precious Metals",
        contacto: "Franz Mueller",
        email: "franz.mueller@heraeus.com",

        precio_unitario: 15200.0,
        moneda: "USD",
        descuento_volumen_pct: 8.0,
        monto_total: 1869600.0,

        lead_time_dias: 82,
        sla_propuesto: 0.98,
        validez_oferta_dias: 60,
        condiciones_pago: "40% anticipo, 60% 30 días",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "ISO 14001:2015", "IATF 16949"],
        comentarios:
          "Calidad alemana premium. Servicio técnico en sitio disponible.",

        scoring: {
          punt_precio: 97.7,
          punt_lead_time: 100.0,
          punt_sla: 98.0,
          score_total: 98.1,
          rank: 2,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2025-12-22T10:00:00Z"),
        },

        recibida_en: new Date("2025-12-19T11:15:00Z"),
        validada: true,
      },
    ],

    evaluacion: {
      rfp_id: "RFP-SNG-2026-02-PLATINO",
      top_ofertas: [
        "OFR-RFP-003-JM" as OfertaId,
        "OFR-RFP-003-HER" as OfertaId,
      ],
      proveedor_recomendado: "Johnson Matthey",
      oferta_recomendada_id: "OFR-RFP-003-JM" as OfertaId,
      justificacion: `Johnson Matthey recomendado por:
            - Mejor precio unitario ($14,850/kg vs $15,200)
            - Mayor descuento (9.5% vs 8.0%)
            - SLA superior (99% vs 98%)
            - Historial perfecto: 100% cumplimiento en 11 entregas
            - Certificaciones completas
            - Lead time aceptable dentro de ventana
            
            Ahorro estimado: $175,950 USD (9.5%)
            Empate técnico en score (98.1), pero precio define decisión.`,

      ahorro_vs_baseline_pct: 9.5,
      ahorro_vs_baseline_monto: 175950,

      evaluado_por: [
        "procurement@yara.com" as UserId,
        "sourcing@essentia.com.co" as UserId,
      ],
      evaluado_en: new Date("2025-12-26T15:00:00Z"),

      requiere_aprobacion_comite: true,
      aprobado: true,
      aprobado_por: "director.cluster@cartagena-industrial.com" as UserId,
      aprobado_en: new Date("2025-12-28T16:00:00Z"),
    },

    estado: "completada",
    owner_email: "procurement@yara.com",

    creada_en: new Date("2025-11-12T09:00:00Z"),
    actualizada_en: new Date("2025-12-28T16:00:00Z"),
  },

  // === RFP 4: Válvulas (EN EVALUACIÓN) ===
  {
    rfp_id: "RFP-SNG-2026-03-VALVULAS",
    sinergia_id: "SNG-2026-03-VALVULAS" as SinergiaId,

    fecha_emision: new Date("2026-01-10T09:00:00Z"),
    fecha_cierre: new Date("2026-02-10T23:59:59Z"),
    fecha_decision: undefined,

    documento_url: "https://drive.google.com/file/d/rfp_2026_valvulas_doc",
    anexo_a_url: "https://drive.google.com/file/d/rfp_2026_valvulas_anexo_a",
    anexo_b_url: "https://drive.google.com/file/d/rfp_2026_valvulas_anexo_b",

    proveedores_invitados: ["Flowserve", "Fisher (Emerson)", "Spirax Sarco"],

    ofertas: [
      {
        oferta_id: "OFR-RFP-004-FLOW" as OfertaId,
        rfp_id: "RFP-SNG-2026-03-VALVULAS",
        sinergia_id: "SNG-2026-03-VALVULAS" as SinergiaId,

        proveedor: "Flowserve",
        contacto: "Juan Pérez",
        email: "juan.perez@flowserve.com",

        precio_unitario: 980.0,
        moneda: "USD",
        descuento_volumen_pct: 13.8,
        monto_total: 37240.0,

        lead_time_dias: 42,
        sla_propuesto: 0.96,
        validez_oferta_dias: 90,
        condiciones_pago: "30% anticipo, 70% contra entrega",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "API 609", "ASME B16.34"],
        comentarios:
          "Stock local en Cartagena. Entrega inmediata para primeras 20 unidades.",

        scoring: {
          punt_precio: 100.0,
          punt_lead_time: 100.0,
          punt_sla: 96.0,
          score_total: 99.4,
          rank: 1,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2026-02-12T09:00:00Z"),
        },

        recibida_en: new Date("2026-02-08T14:30:00Z"),
        validada: true,
      },
      {
        oferta_id: "OFR-RFP-004-FISH" as OfertaId,
        rfp_id: "RFP-SNG-2026-03-VALVULAS",
        sinergia_id: "SNG-2026-03-VALVULAS" as SinergiaId,

        proveedor: "Fisher (Emerson)",
        contacto: "María González",
        email: "maria.gonzalez@emerson.com",

        precio_unitario: 1050.0,
        moneda: "USD",
        descuento_volumen_pct: 12.0,
        monto_total: 39900.0,

        lead_time_dias: 48,
        sla_propuesto: 0.95,
        validez_oferta_dias: 75,
        condiciones_pago: "25% anticipo, 75% 45 días",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "API 609"],
        comentarios: "Incluye actuadores neumáticos sin costo adicional.",

        scoring: {
          punt_precio: 93.3,
          punt_lead_time: 87.5,
          punt_sla: 95.0,
          score_total: 92.5,
          rank: 2,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2026-02-12T09:00:00Z"),
        },

        recibida_en: new Date("2026-02-09T16:20:00Z"),
        validada: true,
      },
      {
        oferta_id: "OFR-RFP-004-SPIR" as OfertaId,
        rfp_id: "RFP-SNG-2026-03-VALVULAS",
        sinergia_id: "SNG-2026-03-VALVULAS" as SinergiaId,

        proveedor: "Spirax Sarco",
        contacto: "Roberto Díaz",
        email: "roberto.diaz@spiraxsarco.com",

        precio_unitario: 1120.0,
        moneda: "USD",
        descuento_volumen_pct: 10.5,
        monto_total: 42560.0,

        lead_time_dias: 52,
        sla_propuesto: 0.94,
        validez_oferta_dias: 60,
        condiciones_pago: "40% anticipo, 60% contra entrega",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "API 609"],
        comentarios: "Calidad premium. Garantía extendida 3 años.",

        scoring: {
          punt_precio: 87.5,
          punt_lead_time: 80.8,
          punt_sla: 94.0,
          score_total: 86.8,
          rank: 3,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2026-02-12T09:00:00Z"),
        },

        recibida_en: new Date("2026-02-10T10:45:00Z"),
        validada: true,
      },
    ],

    evaluacion: {
      rfp_id: "RFP-SNG-2026-03-VALVULAS",
      top_ofertas: [
        "OFR-RFP-004-FLOW" as OfertaId,
        "OFR-RFP-004-FISH" as OfertaId,
        "OFR-RFP-004-SPIR" as OfertaId,
      ],
      proveedor_recomendado: "Flowserve",
      oferta_recomendada_id: "OFR-RFP-004-FLOW" as OfertaId,
      justificacion: `Flowserve es claramente la mejor opción:
            - Mejor precio ($980/unidad)
            - Lead time más corto (42 días)
            - Stock local en Cartagena
            - Descuento más agresivo (13.8%)
            - Score perfecto en precio y lead time
            
            Ahorro: $52,440 USD (13.8%)
            Pendiente aprobación del comité.`,

      ahorro_vs_baseline_pct: 13.8,
      ahorro_vs_baseline_monto: 52440,

      evaluado_por: [
        "compras@ajover.com.co" as UserId,
        "sourcing.cluster@reficar.com.co" as UserId,
        "procurement@yara.com" as UserId,
      ],
      evaluado_en: new Date("2026-02-14T11:00:00Z"),

      requiere_aprobacion_comite: false,
      aprobado: undefined,
      aprobado_por: undefined,
      aprobado_en: undefined,
    },

    estado: "en_evaluacion",
    owner_email: "compras@ajover.com.co",

    creada_en: new Date("2026-01-10T09:00:00Z"),
    actualizada_en: new Date("2026-02-14T11:00:00Z"),
  },

  // === RFP 5: Bombas (EN EVALUACIÓN) ===
  {
    rfp_id: "RFP-SNG-2026-04-BOMBAS",
    sinergia_id: "SNG-2026-04-BOMBAS" as SinergiaId,

    fecha_emision: new Date("2026-01-18T09:00:00Z"),
    fecha_cierre: new Date("2026-02-25T23:59:59Z"),
    fecha_decision: undefined,

    documento_url: "https://drive.google.com/file/d/rfp_2026_bombas_doc",
    anexo_a_url: "https://drive.google.com/file/d/rfp_2026_bombas_anexo_a",
    anexo_b_url: "https://drive.google.com/file/d/rfp_2026_bombas_anexo_b",

    proveedores_invitados: ["Sulzer", "Flowserve", "KSB"],

    ofertas: [
      {
        oferta_id: "OFR-RFP-005-SUL" as OfertaId,
        rfp_id: "RFP-SNG-2026-04-BOMBAS",
        sinergia_id: "SNG-2026-04-BOMBAS" as SinergiaId,

        proveedor: "Sulzer",
        contacto: "Pedro Martínez",
        email: "pedro.martinez@sulzer.com",

        precio_unitario: 98500.0,
        moneda: "USD",
        descuento_volumen_pct: 10.5,
        monto_total: 689500.0,

        lead_time_dias: 85,
        sla_propuesto: 0.96,
        validez_oferta_dias: 120,
        condiciones_pago: "30% anticipo, 40% avance 70%, 30% puesta en marcha",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "API 610", "ATEX"],
        comentarios:
          "Especialista en químicos. Incluye puesta en marcha y capacitación.",

        scoring: {
          punt_precio: 100.0,
          punt_lead_time: 95.3,
          punt_sla: 96.0,
          score_total: 98.2,
          rank: 1,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2026-02-26T10:00:00Z"),
        },

        recibida_en: new Date("2026-02-23T15:40:00Z"),
        validada: true,
      },
      {
        oferta_id: "OFR-RFP-005-FLOW" as OfertaId,
        rfp_id: "RFP-SNG-2026-04-BOMBAS",
        sinergia_id: "SNG-2026-04-BOMBAS" as SinergiaId,

        proveedor: "Flowserve",
        contacto: "Juan Pérez",
        email: "juan.perez@flowserve.com",

        precio_unitario: 102000.0,
        moneda: "USD",
        descuento_volumen_pct: 9.0,
        monto_total: 714000.0,

        lead_time_dias: 82,
        sla_propuesto: 0.95,
        validez_oferta_dias: 90,
        condiciones_pago: "35% anticipo, 65% contra entrega",

        especificacion_cumple: true,
        certificaciones: ["ISO 9001:2015", "API 610"],
        comentarios: "Stock parcial. Primera bomba disponible en 45 días.",

        scoring: {
          punt_precio: 96.6,
          punt_lead_time: 98.8,
          punt_sla: 95.0,
          score_total: 96.9,
          rank: 2,
          ponderadores: {
            peso_precio: 0.6,
            peso_lead: 0.25,
            peso_sla: 0.15,
          },
          calculado_en: new Date("2026-02-26T10:00:00Z"),
        },

        recibida_en: new Date("2026-02-24T11:25:00Z"),
        validada: true,
      },
    ],

    evaluacion: {
      rfp_id: "RFP-SNG-2026-04-BOMBAS",
      top_ofertas: [
        "OFR-RFP-005-SUL" as OfertaId,
        "OFR-RFP-005-FLOW" as OfertaId,
      ],
      proveedor_recomendado: "Sulzer",
      oferta_recomendada_id: "OFR-RFP-005-SUL" as OfertaId,
      justificacion: `Sulzer recomendado:
            - Mejor precio ($98,500/unidad vs $102,000)
            - Mayor descuento (10.5% vs 9.0%)
            - Especialista en aplicaciones químicas
            - Incluye servicios adicionales (puesta en marcha, capacitación)
            - Mejor SLA (96% vs 95%)
            
            Ahorro: $73,500 USD (10.5%)`,

      ahorro_vs_baseline_pct: 10.5,
      ahorro_vs_baseline_monto: 73500,

      evaluado_por: [
        "compras@ajover.com.co" as UserId,
        "sourcing@essentia.com.co" as UserId,
      ],
      evaluado_en: new Date("2026-02-27T14:30:00Z"),

      requiere_aprobacion_comite: true,
      aprobado: undefined,
      aprobado_por: undefined,
      aprobado_en: undefined,
    },

    estado: "en_evaluacion",
    owner_email: "compras@ajover.com.co",

    creada_en: new Date("2026-01-18T09:00:00Z"),
    actualizada_en: new Date("2026-02-27T14:30:00Z"),
  },
];

// ============================================================================
// DECISIONES DEL COMITÉ
// ============================================================================

const DECISIONES_COMITE: DecisionComite[] = [
  // Decision 1: Refractarios (CERRADA)
  {
    sinergia_id: "SNG-2026-01-ALUMINA" as SinergiaId,
    accion: "cerrar",
    proveedor_seleccionado: "Thermal Ceramics Colombia",
    oferta_seleccionada_id: "OFR-RFP-001-TC" as OfertaId,
    motivo: "Aprobación unánime del comité de compras del clúster",
    comentarios: `Decisión basada en análisis técnico-económico:
          1. Mejor precio y condiciones comerciales
          2. Proveedor local - menor riesgo logístico
          3. Historial comprobado en el clúster
          4. Soporte técnico incluido
          5. Todas las entregas dentro de ventanas críticas
          
          PO conjunta emitida con entregas escalonadas:
          - Cabot: 42 m³ entrega 08-Ene-2026
          - Reficar: 68 m³ entrega 05-Feb-2026
          - Yara: 35 m³ entrega 10-Feb-2026
          - Argos: 55 m³ entrega 15-Feb-2026`,

    po_numero: "PO-CLUSTER-2026-001" as PONumber,
    po_monto_total: 1024000.0,
    po_fecha_emision: new Date("2025-12-22T10:00:00Z"),
    ahorro_real_pct: 16.5,
    ahorro_real_monto: 168300.0,

    decidido_por: "director.cluster@cartagena-industrial.com" as UserId,
    decidido_en: new Date("2025-12-18T14:00:00Z"),

    notificado_a: [
      "ops.cartagena@cabot.com",
      "paradas.fcc@ecopetrol.com.co",
      "shutdowns@yara.com",
      "mantenimiento.cartagena@argos.co",
      "carlos.mendoza@thermalceramics.com.co",
    ],
    notificado_en: new Date("2025-12-18T14:30:00Z"),
  },

  // Decision 2: Ladrillos (CERRADA)
  {
    sinergia_id: "SNG-2026-01-LADRILLOS" as SinergiaId,
    accion: "cerrar",
    proveedor_seleccionado: "RHI Magnesita",
    oferta_seleccionada_id: "OFR-RFP-002-RHI" as OfertaId,
    motivo:
      "Mejor oferta técnico-económica. No requirió aprobación de comité general.",
    comentarios: `RHI Magnesita seleccionado:
          - Especialista en refractarios básicos
          - Mejor precio y descuento
          - Asesoría técnica incluida
          - Cumplimiento histórico: 96%
          
          Entregas programadas:
          - Argos: 22 ton entrega 10-Ene-2026
          - Cabot: 18 ton entrega 12-Ene-2026`,

    po_numero: "PO-CLUSTER-2026-002" as PONumber,
    po_monto_total: 472000.0,
    po_fecha_emision: new Date("2025-12-23T11:00:00Z"),
    ahorro_real_pct: 11.2,
    ahorro_real_monto: 53760.0,

    decidido_por: "sourcing@argos.co" as UserId,
    decidido_en: new Date("2025-12-22T11:00:00Z"),

    notificado_a: [
      "mantenimiento.cartagena@argos.co",
      "ops.cartagena@cabot.com",
      "patricia.silva@rhimagnesita.com",
    ],
    notificado_en: new Date("2025-12-22T11:30:00Z"),
  },

  // Decision 3: Platinos (APROBADA - Pendiente PO)
  {
    sinergia_id: "SNG-2026-02-PLATINO" as SinergiaId,
    accion: "aprobar",
    proveedor_seleccionado: "Johnson Matthey",
    oferta_seleccionada_id: "OFR-RFP-003-JM" as OfertaId,
    motivo:
      "Comité aprueba. Pendiente emisión de PO por Yara (comprador líder).",
    comentarios: `Johnson Matthey aprobado:
          - Líder mundial en metales preciosos
          - Mejor precio y SLA
          - Cumplimiento histórico: 100%
          - Certificaciones completas
          
          Próximos pasos:
          1. Yara emite PO en semana del 06-Ene-2026
          2. Confirmar ventanas de entrega finales
          3. Coordinar logística importación
          
          Entregas estimadas:
          - Yara: 95 kg entrega Feb-2026
          - Essentía: 28 kg entrega Feb-2026`,

    decidido_por: "director.cluster@cartagena-industrial.com" as UserId,
    decidido_en: new Date("2025-12-28T16:00:00Z"),

    notificado_a: [
      "shutdowns@yara.com",
      "sourcing@essentia.com.co",
      "david.williams@matthey.com",
    ],
    notificado_en: new Date("2025-12-28T16:30:00Z"),
  },
];

// ============================================================================
// KPIs DEL CLUSTER - 6 meses
// ============================================================================

const KPIS_2026_H1: KPIsCluster[] = [
  // Enero 2026
  {
    periodo: "2026-01",
    fecha_calculo: new Date("2026-01-31T23:59:59Z"),

    cobertura_calendario_pct: 88.0,
    empresas_participantes: 6,
    paradas_totales: 5,
    paradas_cubiertas: 4,

    sinergias_detectadas: 3,
    sinergias_activas: 1,
    sinergias_cerradas: 2,
    tasa_aceptacion_pct: 100.0,

    ahorro_estimado_total: 397910,
    ahorro_real_total: 222060,
    ahorro_promedio_por_sinergia_pct: 13.3,
    descuento_promedio_volumen_pct: 13.0,

    fill_rate_pct: 97.5,
    stockouts_criticos: 1,
    tiempo_promedio_decision_dias: 21,
    tiempo_promedio_ciclo_dias: 38,

    tasa_errores_ingesta_pct: 0.6,
    rfps_completadas: 2,
    rfps_canceladas: 0,

    top_insumos_volumen: [
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Ladrillos refractarios básicos magnesia-cromo",
        sinergias: 1,
        volumen_total: 40.0,
        ahorro_total: 53760,
        ahorro_pct: 11.2,
      },
    ],

    top_insumos_ahorro: [
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Ladrillos refractarios básicos magnesia-cromo",
        sinergias: 1,
        volumen_total: 40.0,
        ahorro_total: 53760,
        ahorro_pct: 11.2,
      },
    ],
  },

  // Febrero 2026
  {
    periodo: "2026-02",
    fecha_calculo: new Date("2026-02-28T23:59:59Z"),

    cobertura_calendario_pct: 91.0,
    empresas_participantes: 6,
    paradas_totales: 7,
    paradas_cubiertas: 6,

    sinergias_detectadas: 4,
    sinergias_activas: 2,
    sinergias_cerradas: 3,
    tasa_aceptacion_pct: 75.0,

    ahorro_estimado_total: 625300,
    ahorro_real_total: 397950,
    ahorro_promedio_por_sinergia_pct: 12.1,
    descuento_promedio_volumen_pct: 11.8,

    fill_rate_pct: 96.8,
    stockouts_criticos: 2,
    tiempo_promedio_decision_dias: 19,
    tiempo_promedio_ciclo_dias: 35,

    tasa_errores_ingesta_pct: 0.5,
    rfps_completadas: 3,
    rfps_canceladas: 0,

    top_insumos_volumen: [
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
        sinergias: 1,
        volumen_total: 123.0,
        ahorro_total: 175950,
        ahorro_pct: 9.5,
      },
      {
        insumo: "Ladrillos refractarios básicos magnesia-cromo",
        sinergias: 1,
        volumen_total: 40.0,
        ahorro_total: 53760,
        ahorro_pct: 11.2,
      },
    ],

    top_insumos_ahorro: [
      {
        insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
        sinergias: 1,
        volumen_total: 123.0,
        ahorro_total: 175950,
        ahorro_pct: 9.5,
      },
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Ladrillos refractarios básicos magnesia-cromo",
        sinergias: 1,
        volumen_total: 40.0,
        ahorro_total: 53760,
        ahorro_pct: 11.2,
      },
    ],
  },

  // Marzo 2026
  {
    periodo: "2026-03",
    fecha_calculo: new Date("2026-03-31T23:59:59Z"),

    cobertura_calendario_pct: 90.0,
    empresas_participantes: 6,
    paradas_totales: 6,
    paradas_cubiertas: 5,

    sinergias_detectadas: 5,
    sinergias_activas: 3,
    sinergias_cerradas: 3,
    tasa_aceptacion_pct: 60.0,

    ahorro_estimado_total: 751640,
    ahorro_real_total: 397950,
    ahorro_promedio_por_sinergia_pct: 12.4,
    descuento_promedio_volumen_pct: 12.2,

    fill_rate_pct: 95.2,
    stockouts_criticos: 3,
    tiempo_promedio_decision_dias: 22,
    tiempo_promedio_ciclo_dias: 37,

    tasa_errores_ingesta_pct: 0.7,
    rfps_completadas: 3,
    rfps_canceladas: 0,

    top_insumos_volumen: [
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
        sinergias: 1,
        volumen_total: 123.0,
        ahorro_total: 175950,
        ahorro_pct: 9.5,
      },
      {
        insumo: "Válvulas mariposa DN150 PN16",
        sinergias: 1,
        volumen_total: 38.0,
        ahorro_total: 52440,
        ahorro_pct: 13.8,
      },
    ],

    top_insumos_ahorro: [
      {
        insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
        sinergias: 1,
        volumen_total: 123.0,
        ahorro_total: 175950,
        ahorro_pct: 9.5,
      },
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Ladrillos refractarios básicos magnesia-cromo",
        sinergias: 1,
        volumen_total: 40.0,
        ahorro_total: 53760,
        ahorro_pct: 11.2,
      },
    ],
  },

  // Abril 2026
  {
    periodo: "2026-04",
    fecha_calculo: new Date("2026-04-30T23:59:59Z"),

    cobertura_calendario_pct: 92.0,
    empresas_participantes: 6,
    paradas_totales: 5,
    paradas_cubiertas: 5,

    sinergias_detectadas: 6,
    sinergias_activas: 4,
    sinergias_cerradas: 3,
    tasa_aceptacion_pct: 50.0,

    ahorro_estimado_total: 825140,
    ahorro_real_total: 397950,
    ahorro_promedio_por_sinergia_pct: 11.9,
    descuento_promedio_volumen_pct: 11.5,

    fill_rate_pct: 96.0,
    stockouts_criticos: 2,
    tiempo_promedio_decision_dias: 20,
    tiempo_promedio_ciclo_dias: 36,

    tasa_errores_ingesta_pct: 0.4,
    rfps_completadas: 3,
    rfps_canceladas: 0,

    top_insumos_volumen: [
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
        sinergias: 1,
        volumen_total: 123.0,
        ahorro_total: 175950,
        ahorro_pct: 9.5,
      },
      {
        insumo: "Bombas centrífugas API 610",
        sinergias: 1,
        volumen_total: 7.0,
        ahorro_total: 73500,
        ahorro_pct: 10.5,
      },
    ],

    top_insumos_ahorro: [
      {
        insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
        sinergias: 1,
        volumen_total: 123.0,
        ahorro_total: 175950,
        ahorro_pct: 9.5,
      },
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Bombas centrífugas API 610",
        sinergias: 1,
        volumen_total: 7.0,
        ahorro_total: 73500,
        ahorro_pct: 10.5,
      },
    ],
  },

  // Mayo 2026
  {
    periodo: "2026-05",
    fecha_calculo: new Date("2026-05-31T23:59:59Z"),

    cobertura_calendario_pct: 93.0,
    empresas_participantes: 6,
    paradas_totales: 6,
    paradas_cubiertas: 6,

    sinergias_detectadas: 7,
    sinergias_activas: 5,
    sinergias_cerradas: 3,
    tasa_aceptacion_pct: 42.9,

    ahorro_estimado_total: 857540,
    ahorro_real_total: 397950,
    ahorro_promedio_por_sinergia_pct: 11.6,
    descuento_promedio_volumen_pct: 11.2,

    fill_rate_pct: 97.0,
    stockouts_criticos: 1,
    tiempo_promedio_decision_dias: 21,
    tiempo_promedio_ciclo_dias: 38,

    tasa_errores_ingesta_pct: 0.5,
    rfps_completadas: 3,
    rfps_canceladas: 0,

    top_insumos_volumen: [
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
        sinergias: 1,
        volumen_total: 123.0,
        ahorro_total: 175950,
        ahorro_pct: 9.5,
      },
      {
        insumo: "Revestimiento epóxico grado químico",
        sinergias: 1,
        volumen_total: 2700.0,
        ahorro_total: 32400,
        ahorro_pct: 12.0,
      },
    ],

    top_insumos_ahorro: [
      {
        insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
        sinergias: 1,
        volumen_total: 123.0,
        ahorro_total: 175950,
        ahorro_pct: 9.5,
      },
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Bombas centrífugas API 610",
        sinergias: 1,
        volumen_total: 7.0,
        ahorro_total: 73500,
        ahorro_pct: 10.5,
      },
    ],
  },

  // Junio 2026
  {
    periodo: "2026-06",
    fecha_calculo: new Date("2026-06-30T23:59:59Z"),

    cobertura_calendario_pct: 94.0,
    empresas_participantes: 6,
    paradas_totales: 8,
    paradas_cubiertas: 7,

    sinergias_detectadas: 8,
    sinergias_activas: 5,
    sinergias_cerradas: 3,
    tasa_aceptacion_pct: 37.5,

    ahorro_estimado_total: 970940,
    ahorro_real_total: 397950,
    ahorro_promedio_por_sinergia_pct: 11.8,
    descuento_promedio_volumen_pct: 11.5,

    fill_rate_pct: 96.5,
    stockouts_criticos: 2,
    tiempo_promedio_decision_dias: 20,
    tiempo_promedio_ciclo_dias: 36,

    tasa_errores_ingesta_pct: 0.6,
    rfps_completadas: 3,
    rfps_canceladas: 0,

    top_insumos_volumen: [
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
        sinergias: 1,
        volumen_total: 123.0,
        ahorro_total: 175950,
        ahorro_pct: 9.5,
      },
      {
        insumo: "Empaque estructurado metálico Mellapak 250Y",
        sinergias: 1,
        volumen_total: 30.0,
        ahorro_total: 87000,
        ahorro_pct: 14.5,
      },
    ],

    top_insumos_ahorro: [
      {
        insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",
        sinergias: 1,
        volumen_total: 123.0,
        ahorro_total: 175950,
        ahorro_pct: 9.5,
      },
      {
        insumo: "Refractario alto alúmina 85% castable",
        sinergias: 1,
        volumen_total: 200.0,
        ahorro_total: 168300,
        ahorro_pct: 16.5,
      },
      {
        insumo: "Empaque estructurado metálico Mellapak 250Y",
        sinergias: 1,
        volumen_total: 30.0,
        ahorro_total: 87000,
        ahorro_pct: 14.5,
      },
    ],
  },
];

// ============================================================================
// TIEMPOS DE CICLO
// ============================================================================

const TIEMPOS_CICLO: TiempoCicloSinergia[] = [
  {
    sinergia_id: "SNG-2026-01-ALUMINA" as SinergiaId,
    insumo: "Refractario alto alúmina 85% castable",

    detectada_en: new Date("2025-10-28T04:15:00Z"),
    rfp_emitida_en: new Date("2025-11-01T09:00:00Z"),
    evaluacion_completada_en: new Date("2025-12-10T16:30:00Z"),
    decision_tomada_en: new Date("2025-12-18T14:00:00Z"),
    cerrada_en: new Date("2025-12-22T10:00:00Z"),

    dias_deteccion_a_rfp: 4,
    dias_rfp_a_evaluacion: 39,
    dias_evaluacion_a_decision: 8,
    dias_decision_a_cierre: 4,
    dias_ciclo_total: 55,

    es_rapido: false,
    es_lento: true,
  },
  {
    sinergia_id: "SNG-2026-01-LADRILLOS" as SinergiaId,
    insumo: "Ladrillos refractarios básicos magnesia-cromo",

    detectada_en: new Date("2025-10-28T04:15:00Z"),
    rfp_emitida_en: new Date("2025-11-05T10:00:00Z"),
    evaluacion_completada_en: new Date("2025-12-15T14:00:00Z"),
    decision_tomada_en: new Date("2025-12-22T11:00:00Z"),
    cerrada_en: new Date("2025-12-23T11:00:00Z"),

    dias_deteccion_a_rfp: 8,
    dias_rfp_a_evaluacion: 40,
    dias_evaluacion_a_decision: 7,
    dias_decision_a_cierre: 1,
    dias_ciclo_total: 56,

    es_rapido: false,
    es_lento: true,
  },
  {
    sinergia_id: "SNG-2026-02-PLATINO" as SinergiaId,
    insumo: "Mallas catalizadoras Pt-Rh (90%-10%)",

    detectada_en: new Date("2025-11-08T05:20:00Z"),
    rfp_emitida_en: new Date("2025-11-12T09:00:00Z"),
    evaluacion_completada_en: new Date("2025-12-26T15:00:00Z"),
    decision_tomada_en: new Date("2025-12-28T16:00:00Z"),
    cerrada_en: undefined,

    dias_deteccion_a_rfp: 4,
    dias_rfp_a_evaluacion: 44,
    dias_evaluacion_a_decision: 2,
    dias_decision_a_cierre: undefined,
    dias_ciclo_total: undefined,

    es_rapido: true,
    es_lento: false,
  },
];

// ============================================================================
// LEADERBOARD PROVEEDORES - H1 2026
// ============================================================================

const LEADERBOARD_H1_2026: LeaderboardProveedor[] = [
  {
    proveedor: "Thermal Ceramics Colombia",
    periodo: "2026-H1",

    rfps_participadas: 2,
    ofertas_ganadoras: 1,
    tasa_exito_pct: 50.0,

    cumplimiento_promedio: 0.96,
    lead_time_promedio_dias: 52,
    precio_competitivo_rank: 1,

    volumen_total_adjudicado: 200.0,
    monto_total_adjudicado: 1024000,

    certificaciones: [
      "ISO 9001:2015",
      "ISO 14001:2015",
      "ASTM C401",
      "API 936",
    ],
    incidentes: 0,

    score_proveedor: 97.8,
    rank_general: 1,
  },
  {
    proveedor: "Johnson Matthey",
    periodo: "2026-H1",

    rfps_participadas: 1,
    ofertas_ganadoras: 1,
    tasa_exito_pct: 100.0,

    cumplimiento_promedio: 1.0,
    lead_time_promedio_dias: 88,
    precio_competitivo_rank: 1,

    volumen_total_adjudicado: 123.0,
    monto_total_adjudicado: 1826550,

    certificaciones: ["ISO 9001:2015", "ISO 14001:2015", "REACH", "RoHS"],
    incidentes: 0,

    score_proveedor: 98.1,
    rank_general: 2,
  },
  {
    proveedor: "RHI Magnesita",
    periodo: "2026-H1",

    rfps_participadas: 3,
    ofertas_ganadoras: 1,
    tasa_exito_pct: 33.3,

    cumplimiento_promedio: 0.96,
    lead_time_promedio_dias: 60,
    precio_competitivo_rank: 2,

    volumen_total_adjudicado: 40.0,
    monto_total_adjudicado: 472000,

    certificaciones: [
      "ISO 9001:2015",
      "ISO 45001:2018",
      "ASTM C401",
      "ISO 1927",
    ],
    incidentes: 0,

    score_proveedor: 95.6,
    rank_general: 3,
  },
  {
    proveedor: "Flowserve",
    periodo: "2026-H1",

    rfps_participadas: 2,
    ofertas_ganadoras: 0,
    tasa_exito_pct: 0.0,

    cumplimiento_promedio: 0.96,
    lead_time_promedio_dias: 42,
    precio_competitivo_rank: 1,

    volumen_total_adjudicado: 0.0,
    monto_total_adjudicado: 0.0,

    certificaciones: ["ISO 9001:2015", "API 609", "API 610", "ASME B16.34"],
    incidentes: 0,

    score_proveedor: 96.6,
    rank_general: 4,
  },
  {
    proveedor: "Sulzer",
    periodo: "2026-H1",

    rfps_participadas: 1,
    ofertas_ganadoras: 0,
    tasa_exito_pct: 0.0,

    cumplimiento_promedio: 0.96,
    lead_time_promedio_dias: 85,
    precio_competitivo_rank: 1,

    volumen_total_adjudicado: 0.0,
    monto_total_adjudicado: 0.0,

    certificaciones: ["ISO 9001:2015", "API 610", "ATEX"],
    incidentes: 0,

    score_proveedor: 98.2,
    rank_general: 5,
  },
  {
    proveedor: "Heraeus Precious Metals",
    periodo: "2026-H1",

    rfps_participadas: 1,
    ofertas_ganadoras: 0,
    tasa_exito_pct: 0.0,

    cumplimiento_promedio: 0.98,
    lead_time_promedio_dias: 82,
    precio_competitivo_rank: 2,

    volumen_total_adjudicado: 0.0,
    monto_total_adjudicado: 0.0,

    certificaciones: ["ISO 9001:2015", "ISO 14001:2015", "IATF 16949"],
    incidentes: 0,

    score_proveedor: 98.1,
    rank_general: 6,
  },
];

// ============================================================================
// LOG DE AUDITORÍA - Últimas 20 entradas
// ============================================================================

const LOG_AUDITORIA_H1: LogCambio[] = [
  {
    log_id: "LOG-2025-12-28-001",
    timestamp: new Date("2025-12-28T16:00:00Z"),
    escenario: "S7",
    entidad_tipo: "decision",
    entidad_id: "DEC-SNG-2026-02-PLATINO",
    accion: "create",
    actor: "director.cluster@cartagena-industrial.com" as UserId,
    actor_email: "director.cluster@cartagena-industrial.com",
    comentario: "Comité aprueba oferta Johnson Matthey - Platinos",
    metadata: {
      accion: "aprobar",
      proveedor: "Johnson Matthey",
      ahorro_estimado: 175950,
    },
  },
  {
    log_id: "LOG-2025-12-23-002",
    timestamp: new Date("2025-12-23T11:00:00Z"),
    escenario: "S7",
    entidad_tipo: "sinergia",
    entidad_id: "SNG-2026-01-LADRILLOS",
    accion: "state_change",
    campo_modificado: "estado",
    valor_anterior: EstadoSinergia.APROBADA,
    valor_nuevo: EstadoSinergia.CERRADA,
    actor: "sourcing@argos.co" as UserId,
    actor_email: "sourcing@argos.co",
    comentario: "PO-CLUSTER-2026-002 emitida - Ladrillos refractarios",
    metadata: {
      po_numero: "PO-CLUSTER-2026-002",
      monto: 472000,
      ahorro_real_pct: 11.2,
    },
  },
  {
    log_id: "LOG-2025-12-22-003",
    timestamp: new Date("2025-12-22T10:00:00Z"),
    escenario: "S7",
    entidad_tipo: "sinergia",
    entidad_id: "SNG-2026-01-ALUMINA",
    accion: "state_change",
    campo_modificado: "estado",
    valor_anterior: EstadoSinergia.APROBADA,
    valor_nuevo: EstadoSinergia.CERRADA,
    actor: "director.cluster@cartagena-industrial.com" as UserId,
    actor_email: "director.cluster@cartagena-industrial.com",
    comentario: "PO-CLUSTER-2026-001 emitida - Refractarios alto alúmina",
    metadata: {
      po_numero: "PO-CLUSTER-2026-001",
      monto: 1024000,
      ahorro_real_pct: 16.5,
    },
  },
  {
    log_id: "LOG-2025-12-18-004",
    timestamp: new Date("2025-12-18T14:00:00Z"),
    escenario: "S7",
    entidad_tipo: "decision",
    entidad_id: "DEC-SNG-2026-01-ALUMINA",
    accion: "create",
    actor: "director.cluster@cartagena-industrial.com" as UserId,
    actor_email: "director.cluster@cartagena-industrial.com",
    comentario: "Comité aprueba oferta Thermal Ceramics - Refractarios",
    metadata: {
      accion: "aprobar",
      proveedor: "Thermal Ceramics Colombia",
      ahorro_estimado: 168300,
    },
  },
  {
    log_id: "LOG-2026-02-14-005",
    timestamp: new Date("2026-02-14T11:00:00Z"),
    escenario: "S5",
    entidad_tipo: "rfp",
    entidad_id: "RFP-SNG-2026-03-VALVULAS",
    accion: "update",
    campo_modificado: "evaluacion",
    valor_anterior: null,
    valor_nuevo: { proveedor_recomendado: "Flowserve" },
    actor: "compras@ajover.com.co" as UserId,
    actor_email: "compras@ajover.com.co",
    comentario: "Evaluación completada RFP Válvulas - 3 ofertas",
    metadata: {
      ofertas_evaluadas: 3,
      top_proveedor: "Flowserve",
      score: 99.4,
    },
  },
  {
    log_id: "LOG-2026-02-10-006",
    timestamp: new Date("2026-02-10T23:59:59Z"),
    escenario: "S5",
    entidad_tipo: "rfp",
    entidad_id: "RFP-SNG-2026-03-VALVULAS",
    accion: "update",
    campo_modificado: "estado",
    valor_anterior: "emitida",
    valor_nuevo: "en_evaluacion",
    actor: "system" as UserId,
    comentario: "RFP Válvulas cerrada - 3 ofertas recibidas",
    metadata: {
      ofertas_recibidas: 3,
      fecha_cierre: "2026-02-10",
    },
  },
  {
    log_id: "LOG-2026-01-25-007",
    timestamp: new Date("2026-01-25T10:15:00Z"),
    escenario: "S3",
    entidad_tipo: "sinergia",
    entidad_id: "SNG-2026-06-RODAMIENTOS",
    accion: "create",
    actor: "system" as UserId,
    comentario: "Sinergia detectada - Rodamientos SKF - 3 empresas",
    metadata: {
      empresas: 3,
      volumen: 60,
      ahorro_estimado_pct: 11.0,
      insumo: "Rodamientos radiales SKF 6320/C3",
    },
  },
  {
    log_id: "LOG-2026-01-20-008",
    timestamp: new Date("2026-01-20T09:30:00Z"),
    escenario: "S3",
    entidad_tipo: "sinergia",
    entidad_id: "SNG-2026-06-EMPAQUE",
    accion: "create",
    actor: "system" as UserId,
    comentario: "Sinergia detectada - Empaque estructurado - 2 empresas",
    metadata: {
      empresas: 2,
      volumen: 30,
      ahorro_estimado_pct: 14.5,
      insumo: "Empaque estructurado metálico Mellapak 250Y",
    },
  },
  {
    log_id: "LOG-2026-01-18-009",
    timestamp: new Date("2026-01-18T09:00:00Z"),
    escenario: "S5",
    entidad_tipo: "rfp",
    entidad_id: "RFP-SNG-2026-04-BOMBAS",
    accion: "create",
    actor: "compras@ajover.com.co" as UserId,
    actor_email: "compras@ajover.com.co",
    comentario: "RFP emitida - Bombas centrífugas - 3 proveedores",
    metadata: {
      sinergia_id: "SNG-2026-04-BOMBAS",
      proveedores_invitados: 3,
      fecha_cierre: "2026-02-25",
    },
  },
  {
    log_id: "LOG-2026-01-10-010",
    timestamp: new Date("2026-01-10T09:00:00Z"),
    escenario: "S5",
    entidad_tipo: "rfp",
    entidad_id: "RFP-SNG-2026-03-VALVULAS",
    accion: "create",
    actor: "compras@ajover.com.co" as UserId,
    actor_email: "compras@ajover.com.co",
    comentario: "RFP emitida - Válvulas mariposa - 3 proveedores",
    metadata: {
      sinergia_id: "SNG-2026-03-VALVULAS",
      proveedores_invitados: 3,
      fecha_cierre: "2026-02-10",
    },
  },
];

// ============================================================================
// EXPORT ALL DATA
// ============================================================================

export const COMPREHENSIVE_SAMPLE_2026_H1 = {
  companies: COMPANIES_INFO,
  paradas: PARADAS_2026_H1,
  necesidades: NECESIDADES_2026_H1,
  proveedores: PROVEEDORES_EXTENDIDO,
  sinergias: SINERGIAS_2026_H1,
  rfps: RFPS_2026_H1,
  decisiones: DECISIONES_COMITE,
  kpis: KPIS_2026_H1,
  tiempos_ciclo: TIEMPOS_CICLO,
  leaderboard: LEADERBOARD_H1_2026,
  log_auditoria: LOG_AUDITORIA_H1,
};

// ============================================================================
// SUMMARY STATISTICS
// ============================================================================

console.log(`
    ╔═══════════════════════════════════════════════════════════════════╗
    ║   CLÚSTER PETROQUÍMICO CARTAGENA - COMPREHENSIVE SAMPLE H1 2026   ║
    ╚═══════════════════════════════════════════════════════════════════╝
    
    📊 DATASET OVERVIEW
    ├─ Period: January - June 2026 (6 months)
    ├─ Companies: 6 (Argos, Ajover, Yara, Cabot, Reficar, Essentía)
    ├─ Total Paradas: 18 shutdowns
    ├─ Total Necesidades: 45+ material requirements
    ├─ Proveedores: 15+ suppliers
    └─ Data Quality: 99.4% validated
    
    💡 SYNERGIES DETECTED: 8
    ┌─ Synergy 1: Refractarios Alto Alúmina (CERRADA)
    │  • Companies: 4 (Cabot, Reficar, Yara, Argos)
    │  • Volume: 200 m³
    │  • Savings: $168,300 (16.5%)
    │  • Status: PO-CLUSTER-2026-001 issued
    │
    ├─ Synergy 2: Ladrillos Refractarios (CERRADA)
    │  • Companies: 2 (Argos, Cabot)
    │  • Volume: 40 ton
    │  • Savings: $53,760 (11.2%)
    │  • Status: PO-CLUSTER-2026-002 issued
    │
    ├─ Synergy 3: Platinos Pt-Rh (APROBADA)
    │  • Companies: 2 (Yara, Essentía)
    │  • Volume: 123 kg
    │  • Savings: $175,950 (9.5%)
    │  • Status: Approved, PO pending
    │
    ├─ Synergy 4: Válvulas Mariposa (EN_RFP)
    │  • Companies: 3 (Ajover, Reficar, Yara)
    │  • Volume: 38 units
    │  • Savings: $52,440 (13.8%)
    │  • Status: Evaluation complete, pending approval
    │
    ├─ Synergy 5: Bombas Centrífugas (EN_RFP)
    │  • Companies: 2 (Ajover, Essentía)
    │  • Volume: 7 units
    │  • Savings: $73,500 (10.5%)
    │  • Status: Evaluation complete, pending approval
    │
    ├─ Synergy 6: Revestimientos Epóxicos (PENDIENTE)
    │  • Companies: 3 (Ajover, Reficar, Essentía)
    │  • Volume: 2,700 liters
    │  • Estimated: $32,400 (12.0%)
    │
    ├─ Synergy 7: Empaque Estructurado (PENDIENTE)
    │  • Companies: 2 (Essentía, Reficar)
    │  • Volume: 30 m³
    │  • Estimated: $87,000 (14.5%)
    │
    └─ Synergy 8: Rodamientos (PENDIENTE)
       • Companies: 3 (Cabot, Argos, Yara)
       • Volume: 60 units
       • Estimated: $26,400 (11.0%)
    
    📋 RFP PROCESSES: 5
    ├─ Completed: 3 (Alumina, Ladrillos, Platinos)
    ├─ In Evaluation: 2 (Válvulas, Bombas)
    └─ Pending: 3 (Epóxicos, Empaque, Rodamientos)
    
    💰 FINANCIAL IMPACT (H1 2026)
    ├─ Total Estimated Savings: $970,940
    ├─ Realized Savings (Closed): $397,950
    ├─ Average Discount: 11.5%
    ├─ Largest Single Saving: $175,950 (Platinos)
    └─ ROI: ~3.8x (savings vs coordination cost)
    
    📈 OPERATIONAL KPIs (June 2026)
    ├─ Calendar Coverage: 94%
    ├─ Fill Rate: 96.5%
    ├─ Critical Stock-outs: 2
    ├─ Avg Decision Time: 20 days
    ├─ Avg Cycle Time: 36 days
    └─ Ingestion Error Rate: 0.6%
    
    🏆 TOP SUPPLIERS (H1 2026)
    1. Johnson Matthey - Score: 98.1 | $1.83M awarded
    2. Thermal Ceramics - Score: 97.8 | $1.02M awarded
    3. RHI Magnesita - Score: 95.6 | $472K awarded
    4. Sulzer - Score: 98.2 | $0 (pending)
    5. Flowserve - Score: 96.6 | $0 (pending)
    
    📊 TOP MATERIALS BY SAVINGS
    1. Platinos Pt-Rh: $175,950 (9.5%)
    2. Refractarios: $168,300 (16.5%)
    3. Empaque: $87,000 (14.5% est.)
    4. Bombas: $73,500 (10.5%)
    5. Ladrillos: $53,760 (11.2%)
    
    ✅ DATA COMPLETENESS
    ├─ Paradas: 18/18 (100%)
    ├─ Necesidades: 45/48 (93.8%)
    ├─ RFP Documents: 5/5 (100%)
    ├─ Ofertas: 13 offers received
    ├─ Decisiones: 3 committee decisions
    └─ Audit Logs: 10 critical events tracked
    
    🔄 WORKFLOW STATUS
    ├─ Active Synergies: 5
    ├─ Pending RFPs: 3
    ├─ Pending Approvals: 2
    ├─ Open POs: 2
    └─ Completed Cycles: 3
    
    📅 NEXT MILESTONES
    - Week 1: Approve Válvulas RFP (Flowserve)
    - Week 2: Approve Bombas RFP (Sulzer)
    - Week 3: Issue PO Platinos (Johnson Matthey)
    - Week 4: Launch RFP Epóxicos
    - Month 2: Launch RFPs Empaque & Rodamientos
    `);
