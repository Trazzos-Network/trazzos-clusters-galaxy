// ============================================================================
// DOMAIN TYPES - Branded types for type safety
// ============================================================================

type ParadaId = string & { readonly brand: unique symbol };
type ReqId = string & { readonly brand: unique symbol };
type SinergiaId = string & { readonly brand: unique symbol };
type OfertaId = string & { readonly brand: unique symbol };
type PONumber = string & { readonly brand: unique symbol };
type UserId = string & { readonly brand: unique symbol };

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

enum Criticidad {
  ALTA = "Alta",
  MEDIA = "Media",
  BAJA = "Baja",
}

enum EstadoSinergia {
  PENDIENTE = "pendiente",
  EN_RFP = "en_rfp",
  RECOMENDADA = "recomendada",
  APROBADA = "aprobada",
  CONTRAOFERTA = "contraoferta",
  CERRADA = "cerrada",
  RECHAZADA = "rechazada",
}

enum AccionSugerida {
  RFP_CONJUNTA = "RFP_conjunta",
  NEGOCIACION_DIRECTA = "negociacion_directa",
  ESPERAR = "esperar",
  REVISION_COMITE = "revision_comite",
}

enum UnidadMedida {
  M3 = "m3",
  KG = "kg",
  TON = "ton",
  UNIDAD = "unidad",
  LITROS = "litros",
}

// ============================================================================
// BASE ENTITIES - Inputs del sistema
// ============================================================================

/**
 * Parada de mantenimiento programada por una empresa
 * Source: calendario_paradas_cluster.csv
 */
interface ParadaProgramada {
  parada_id: ParadaId;
  empresa: string;
  planta: string;
  unidad: string;
  inicio: Date;
  fin: Date;
  alcance: string;
  criticidad: Criticidad;
  ventana_firme: boolean;
  responsable_email: string;

  // Metadata de ingesta
  ingested_at: Date;
  source_file: string;
  validated: boolean;
  validation_errors?: string[];
}

/**
 * Necesidad de material para una parada
 * Source: necesidades_materiales.csv
 */
interface NecesidadMaterial {
  req_id: ReqId;
  empresa: string;
  unidad: string;
  insumo: string;
  unidad_medida: UnidadMedida;
  qty: number;
  proveedor_preferente: string | null;
  alternos: string[];
  lead_time_dias: number;
  ventana_entrega_ini: Date;
  ventana_entrega_fin: Date;

  // Relación con parada
  parada_id?: ParadaId;

  // Metadata
  ingested_at: Date;
  validated: boolean;
}

/**
 * Información de proveedores
 * Source: proveedores.csv
 */
interface Proveedor {
  insumo: string;
  proveedor: string;
  contacto: string;
  email: string;
  sla_objetivo: number; // 0-1 (95% = 0.95)
  observaciones?: string;

  // Historial (si existe)
  entregas_historicas?: number;
  cumplimiento_historico?: number;
}

// ============================================================================
// CORE OUTPUT - Sinergias Detectadas (S3)
// ============================================================================

/**
 * Output principal del sistema: Sinergia detectada entre empresas
 * Generada por S3, actualizada por S4-S7
 */
interface SinergiaDetectada {
  // Identificación
  id: SinergiaId; // e.g., "SNG-2028-03-ALUMINA"
  mes: string; // YYYY-MM
  insumo: string;

  // Participantes
  empresas: string[]; // ["Ecopetrol", "Yara", "Esentia", "Argos"]
  empresas_involucradas: number;

  // Volumen y economía
  volumen_total: number;
  unidad_medida: UnidadMedida;
  umbral: number;
  ahorro_estimado_pct: number;
  ahorro_estimado_monto?: number;

  // Temporal
  ventana: [Date, Date]; // [inicio, fin]
  ventana_dias: number;

  // Estado y flujo
  estado: EstadoSinergia;
  accion_sugerida: AccionSugerida;

  // Detalles por empresa
  detalle_empresas: DetalleEmpresaSinergia[];

  // RFP (si aplica)
  rfp?: RFPConjunta;

  // Decisión (si aplica)
  decision?: DecisionComite;

  // Metadata
  detectada_en: Date;
  actualizada_en: Date;
  version: number;
}

/**
 * Detalle de participación de cada empresa en una sinergia
 */
interface DetalleEmpresaSinergia {
  empresa: string;
  unidad: string;
  qty: number;
  ventana_entrega: [Date, Date];
  criticidad: Criticidad;
  req_id: ReqId;
  parada_id?: ParadaId;
}

// ============================================================================
// RFP PROCESS - Request for Proposal (S5)
// ============================================================================

/**
 * RFP conjunta generada para una sinergia
 * Creada por S5
 */
interface RFPConjunta {
  rfp_id: string;
  sinergia_id: SinergiaId;

  // Timing
  fecha_emision: Date;
  fecha_cierre: Date;
  fecha_decision?: Date;

  // Documento
  documento_url: string; // Google Docs/Drive URL
  anexo_a_url: string; // Cantidades por empresa
  anexo_b_url: string; // Criterios de evaluación

  // Proveedores invitados
  proveedores_invitados: string[];

  // Ofertas recibidas
  ofertas: OfertaProveedor[];

  // Evaluación
  evaluacion?: EvaluacionRFP;

  // Estado
  estado: "emitida" | "en_evaluacion" | "completada" | "cancelada";

  // Responsable
  owner_email: string;

  // Metadata
  creada_en: Date;
  actualizada_en: Date;
}

/**
 * Oferta de un proveedor en respuesta a una RFP
 * Capturada desde Google Forms por S5
 */
interface OfertaProveedor {
  oferta_id: OfertaId;
  rfp_id: string;
  sinergia_id: SinergiaId;

  // Proveedor
  proveedor: string;
  contacto: string;
  email: string;

  // Propuesta económica
  precio_unitario: number;
  moneda: "USD" | "COP" | "EUR";
  descuento_volumen_pct?: number;
  monto_total: number;

  // Condiciones
  lead_time_dias: number;
  sla_propuesto: number; // 0-1
  validez_oferta_dias: number;
  condiciones_pago: string;

  // Técnico
  especificacion_cumple: boolean;
  certificaciones: string[];
  comentarios?: string;

  // Evaluación
  scoring?: ScoringOferta;

  // Metadata
  recibida_en: Date;
  validada: boolean;
}

/**
 * Scoring calculado para una oferta
 * Basado en Anexo B (criterios de evaluación)
 */
interface ScoringOferta {
  // Puntajes por criterio (0-100)
  punt_precio: number;
  punt_lead_time: number;
  punt_sla: number;
  punt_certificaciones?: number;

  // Score total ponderado
  score_total: number;

  // Ranking
  rank: number; // 1 = mejor

  // Cálculo
  ponderadores: {
    peso_precio: number; // e.g., 0.60
    peso_lead: number; // e.g., 0.25
    peso_sla: number; // e.g., 0.15
  };

  calculado_en: Date;
}

/**
 * Evaluación completa de una RFP
 */
interface EvaluacionRFP {
  rfp_id: string;

  // Top 3 ofertas
  top_ofertas: OfertaId[]; // Ordenadas por rank

  // Recomendación
  proveedor_recomendado: string;
  oferta_recomendada_id: OfertaId;
  justificacion: string;

  // Comparativa
  ahorro_vs_baseline_pct: number;
  ahorro_vs_baseline_monto: number;

  // Evaluadores
  evaluado_por: UserId[];
  evaluado_en: Date;

  // Aprobación
  requiere_aprobacion_comite: boolean;
  aprobado?: boolean;
  aprobado_por?: UserId;
  aprobado_en?: Date;
}

// ============================================================================
// COMMITTEE DECISION - Decisión final del comité (S7)
// ============================================================================

/**
 * Decisión del comité sobre una sinergia
 * Generada por S7
 */
interface DecisionComite {
  sinergia_id: SinergiaId;

  // Acción tomada
  accion: "aprobar" | "contraoferta" | "rechazar" | "reabrir" | "cerrar";

  // Detalles según acción
  proveedor_seleccionado?: string;
  oferta_seleccionada_id?: OfertaId;
  motivo: string;
  comentarios?: string;

  // Cierre (si aplica)
  po_numero?: PONumber;
  po_monto_total?: number;
  po_fecha_emision?: Date;
  ahorro_real_pct?: number;
  ahorro_real_monto?: number;

  // Reapertura (si aplica)
  reabierto_desde_estado?: EstadoSinergia;
  comentario_reapertura?: string;

  // Responsables
  decidido_por: UserId;
  decidido_en: Date;

  // Notificaciones
  notificado_a: string[]; // emails
  notificado_en: Date;
}

// ============================================================================
// AUDIT & LOGGING - Trazabilidad (S6, S7)
// ============================================================================

/**
 * Log de cambios para auditoría
 * Escrito por todos los escenarios
 */
interface LogCambio {
  log_id: string;
  timestamp: Date;

  // Contexto
  escenario: "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "CPB";
  entidad_tipo:
    | "parada"
    | "necesidad"
    | "sinergia"
    | "rfp"
    | "oferta"
    | "decision";
  entidad_id: string;

  // Cambio
  accion: "create" | "update" | "delete" | "state_change";
  campo_modificado?: string;
  valor_anterior?: unknown;
  valor_nuevo?: unknown;

  // Actor
  actor: UserId | "system";
  actor_email?: string;

  // Detalles
  comentario?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Error de ingesta o procesamiento
 * Data Store: errores_ingesta
 */
interface ErrorIngesta {
  error_id: string;
  timestamp: Date;

  // Fuente
  source_file: string;
  source_row?: number;
  empresa?: string;

  // Error
  error_type:
    | "validation"
    | "format"
    | "missing_field"
    | "duplicate"
    | "system";
  error_message: string;
  campo_afectado?: string;
  valor_rechazado?: unknown;

  // Estado
  resuelto: boolean;
  resuelto_en?: Date;
  resuelto_por?: UserId;

  // Severidad
  severidad: "error" | "warning" | "info";
}

// ============================================================================
// KPIs & ANALYTICS - Métricas del sistema (S6)
// ============================================================================

/**
 * KPIs agregados del cluster
 * Calculados por S6 y expuestos en BI
 */
interface KPIsCluster {
  periodo: string; // YYYY-MM
  fecha_calculo: Date;

  // Cobertura
  cobertura_calendario_pct: number; // % empresas con calendario
  empresas_participantes: number;
  paradas_totales: number;
  paradas_cubiertas: number;

  // Sinergias
  sinergias_detectadas: number;
  sinergias_activas: number;
  sinergias_cerradas: number;
  tasa_aceptacion_pct: number; // % sinergias que llegan a RFP

  // Económico
  ahorro_estimado_total: number;
  ahorro_real_total: number;
  ahorro_promedio_por_sinergia_pct: number;
  descuento_promedio_volumen_pct: number;

  // Operativo
  fill_rate_pct: number; // % necesidades cubiertas
  stockouts_criticos: number;
  tiempo_promedio_decision_dias: number;
  tiempo_promedio_ciclo_dias: number; // Detección → Cierre

  // Calidad
  tasa_errores_ingesta_pct: number;
  rfps_completadas: number;
  rfps_canceladas: number;

  // Por insumo (top 5)
  top_insumos_volumen: TopInsumo[];
  top_insumos_ahorro: TopInsumo[];
}

interface TopInsumo {
  insumo: string;
  sinergias: number;
  volumen_total: number;
  ahorro_total: number;
  ahorro_pct: number;
}

/**
 * Métricas de tiempo de ciclo por sinergia
 * Para análisis de eficiencia
 */
interface TiempoCicloSinergia {
  sinergia_id: SinergiaId;
  insumo: string;

  // Milestones
  detectada_en: Date;
  rfp_emitida_en?: Date;
  evaluacion_completada_en?: Date;
  decision_tomada_en?: Date;
  cerrada_en?: Date;

  // Tiempos calculados (días)
  dias_deteccion_a_rfp?: number;
  dias_rfp_a_evaluacion?: number;
  dias_evaluacion_a_decision?: number;
  dias_decision_a_cierre?: number;
  dias_ciclo_total?: number;

  // Benchmarks
  es_rapido: boolean; // < P25
  es_lento: boolean; // > P75
}

// ============================================================================
// AGGREGATED VIEWS - Vistas para BI (S6)
// ============================================================================

/**
 * Vista consolidada de calendario del cluster
 * Para visualización Gantt/Heatmap
 */
interface VistaCalendarioCluster {
  mes: string; // YYYY-MM
  empresa: string;
  planta: string;
  unidad: string;

  // Paradas en el mes
  paradas: {
    parada_id: ParadaId;
    inicio: Date;
    fin: Date;
    duracion_dias: number;
    criticidad: Criticidad;
  }[];

  // Necesidades asociadas
  necesidades_totales: number;
  insumos_criticos: string[];

  // Sinergias
  sinergias_participando: SinergiaId[];

  // Alertas
  alertas: {
    tipo: "solape" | "volumen_alto" | "lead_time_corto" | "proveedor_comun";
    mensaje: string;
    severidad: "alta" | "media" | "baja";
  }[];
}

/**
 * Leaderboard de proveedores
 * Para análisis de desempeño
 */
interface LeaderboardProveedor {
  proveedor: string;
  periodo: string; // YYYY-MM

  // Participación
  rfps_participadas: number;
  ofertas_ganadoras: number;
  tasa_exito_pct: number;

  // Performance
  cumplimiento_promedio: number; // 0-1
  lead_time_promedio_dias: number;
  precio_competitivo_rank: number; // 1 = más competitivo

  // Económico
  volumen_total_adjudicado: number;
  monto_total_adjudicado: number;

  // Qualité
  certificaciones: string[];
  incidentes: number;

  // Score
  score_proveedor: number; // 0-100
  rank_general: number;
}

// ============================================================================
// NOTIFICATION PAYLOADS - Mensajes para Teams/Slack (S4, S7)
// ============================================================================

/**
 * Payload para notificaciones en Teams/Slack
 * Generado por S4, S7
 */
interface NotificacionPayload {
  tipo:
    | "sinergia_detectada"
    | "rfp_emitida"
    | "top3_disponible"
    | "decision_tomada"
    | "po_emitida";
  sinergia_id: SinergiaId;

  // Contenido
  titulo: string;
  mensaje: string;
  prioridad: "alta" | "media" | "baja";

  // Enlaces
  url_bi_dashboard: string;
  url_detalle_sinergia: string;
  url_rfp_documento?: string;

  // Acciones disponibles
  acciones: {
    id: string;
    label: string;
    webhook_url: string;
    payload: Record<string, unknown>;
  }[];

  // Destinatarios
  canal: string; // e.g., "Paradas-Cluster"
  menciones: string[]; // @user o @grupo

  // Metadata
  timestamp: Date;
  enviado: boolean;
  enviado_en?: Date;
}

// ============================================================================
// WEBHOOK ACTIONS - Payloads de acciones (S7)
// ============================================================================

/**
 * Payload de webhook para acciones del comité
 * Recibido por S7
 */
type WebhookAccionComite =
  | {
      accion: "aprobar";
      sinergia_id: SinergiaId;
      proveedor: string;
      oferta_id: OfertaId;
      motivo: string;
      actor: string; // email
    }
  | {
      accion: "contraoferta";
      sinergia_id: SinergiaId;
      proveedor: string;
      motivo: string;
      condiciones_solicitadas: string;
      actor: string;
    }
  | {
      accion: "reabrir_rfp";
      sinergia_id: SinergiaId;
      comentario: string;
      actor: string;
    }
  | {
      accion: "cerrar_sinergia";
      sinergia_id: SinergiaId;
      po_numero: PONumber;
      po_monto_total: number;
      ahorro_real_pct: number;
      actor: string;
    }
  | {
      accion: "rechazar";
      sinergia_id: SinergiaId;
      motivo: string;
      actor: string;
    };

// ============================================================================
// RESULT TYPES - Para manejo de errores
// ============================================================================

/**
 * Result type para operaciones que pueden fallar
 */
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Validación de ingesta
 */
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  record: ParadaProgramada | NecesidadMaterial;
}

interface ValidationError {
  field: string;
  message: string;
  value: unknown;
  rule: string;
}

interface ValidationWarning {
  field: string;
  message: string;
  value: unknown;
  suggestion?: string;
}

// ============================================================================
// EXPORTS - Todo el modelo de datos
// ============================================================================

// Export enums as values (not types) so they can be used at runtime
export { Criticidad, EstadoSinergia, AccionSugerida, UnidadMedida };

export type {
  // Domain types
  ParadaId,
  ReqId,
  SinergiaId,
  OfertaId,
  PONumber,
  UserId,

  // Base entities
  ParadaProgramada,
  NecesidadMaterial,
  Proveedor,

  // Core outputs
  SinergiaDetectada,
  DetalleEmpresaSinergia,

  // RFP process
  RFPConjunta,
  OfertaProveedor,
  ScoringOferta,
  EvaluacionRFP,

  // Committee
  DecisionComite,

  // Audit
  LogCambio,
  ErrorIngesta,

  // KPIs
  KPIsCluster,
  TopInsumo,
  TiempoCicloSinergia,

  // Views
  VistaCalendarioCluster,
  LeaderboardProveedor,

  // Notifications
  NotificacionPayload,
  WebhookAccionComite,

  // Utilities
  Result,
  ValidationResult,
  ValidationError,
  ValidationWarning,
};
