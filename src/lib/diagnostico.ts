/**
 * Motor de reglas del Diagnóstico Financiero de Axis Consultores — v2.
 *
 * Cambio de fondo vs v1: en vez de un solo score plano, medimos 4
 * dimensiones de dolor específico (riesgo fiscal, visibilidad financiera,
 * optimización fiscal, preparación para crecer). El resultado no dice
 * "necesitas un contador" — señala CUÁL es el punto más débil y explica,
 * con autoridad, por qué importa. Eso es lo que distingue un diagnóstico
 * de un formulario disfrazado de quiz.
 *
 * Sigue sin IA, sin backend: reglas puras, auditables, ajustables con
 * lo que aprendamos de leads reales.
 */

export type EntityType = "persona_fisica" | "persona_moral";

export interface DiagnosticoOption {
  id: string;
  label: string;
  points: number; // 0 = mayor dolor/riesgo, 3 = mejor situación
}

export type DimensionId =
  | "riesgo_fiscal"
  | "visibilidad_financiera"
  | "optimizacion_fiscal"
  | "preparacion_crecimiento";

export interface DiagnosticoQuestion {
  id: string;
  dimensionId?: DimensionId; // presente = pregunta que puntúa esa dimensión
  qualifier?: boolean; // true = no puntúa, solo segmenta/personaliza
  title: string;
  question: string;
  helper: string;
  options: DiagnosticoOption[];
}

export const QUESTIONS: DiagnosticoQuestion[] = [
  {
    id: "tipo_contribuyente",
    qualifier: true,
    title: "Para empezar",
    question: "¿Cómo opera hoy tu negocio ante el SAT?",
    helper: "Así adaptamos el resto del diagnóstico a tu situación real.",
    options: [
      { id: "persona_fisica", label: "Como persona física con actividad empresarial", points: 0 },
      { id: "persona_moral", label: "Como persona moral — empresa constituida", points: 0 },
    ],
  },
  {
    id: "riesgo_fiscal",
    dimensionId: "riesgo_fiscal",
    title: "Riesgo fiscal",
    question: "En el último año, ¿cuál describe mejor tu relación con el SAT?",
    helper: "Sé honesto — esto no cambia tu resultado para mal, solo lo hace útil.",
    options: [
      {
        id: "cancelacion",
        label: "He tenido cancelación/restricción de sellos o un requerimiento que no supe resolver",
        points: 0,
      },
      { id: "cartas", label: "He recibido cartas invitación o avisos que no entendí del todo", points: 1 },
      {
        id: "sin_certeza",
        label: "No he tenido problemas, pero tampoco tengo la certeza de estar 100% en regla",
        points: 2,
      },
      { id: "en_regla", label: "Tengo la certeza, con respaldo de mi contador, de estar en regla", points: 3 },
    ],
  },
  {
    id: "visibilidad_financiera",
    dimensionId: "visibilidad_financiera",
    title: "Visibilidad financiera",
    question:
      "Si te preguntara ahora mismo cuánto puedes disponer sin comprometer nómina o impuestos del próximo mes, ¿qué tan rápido responderías con un número real?",
    helper: "No la facturación total — lo que de verdad es tuyo para usar.",
    options: [
      { id: "no_se", label: "No tendría manera de saberlo hoy", points: 0 },
      { id: "estimado", label: "Podría dar un estimado, pero no estoy seguro", points: 1 },
      { id: "calcular", label: "Tardaría un rato en juntar la información, pero sí podría calcularlo", points: 2 },
      { id: "al_momento", label: "Te doy el número ahora mismo — lo tengo siempre a la mano", points: 3 },
    ],
  },
  {
    id: "optimizacion_fiscal",
    dimensionId: "optimizacion_fiscal",
    title: "Optimización fiscal",
    question:
      "¿Cuándo fue la última vez que alguien te explicó, con números, que estabas pagando más impuestos de los que en realidad debías?",
    helper: "No 'me dijeron que revisara' — una explicación real, con cifras.",
    options: [
      { id: "nunca", label: "Nunca me lo han explicado", points: 0 },
      { id: "sin_accion", label: "Lo he escuchado, pero nunca se hizo nada al respecto", points: 1 },
      { id: "no_vigente", label: "Se revisó hace tiempo, pero no sé si sigue vigente", points: 2 },
      { id: "regular", label: "Se revisa de forma regular y se ajusta cuando aplica", points: 3 },
    ],
  },
  {
    id: "preparacion_crecimiento",
    dimensionId: "preparacion_crecimiento",
    title: "Preparación para crecer",
    question:
      "Si mañana tuvieras la oportunidad de un crédito, una inversión, o contratar a alguien clave, ¿tienes los números listos para decidir hoy mismo?",
    helper: "La velocidad de tu respuesta suele decidir si la oportunidad se aprovecha o se pierde.",
    options: [
      { id: "desde_cero", label: "No, tendría que empezar desde cero a juntar información", points: 0 },
      { id: "dias", label: "Tengo algo, pero tomaría días prepararlo", points: 1 },
      { id: "casi_listo", label: "Tengo la mayoría, con ajustes menores", points: 2 },
      { id: "listo", label: "Sí, tengo proyecciones y números actualizados en todo momento", points: 3 },
    ],
  },
  {
    id: "facturacion",
    qualifier: true,
    title: "Tu operación",
    question: "¿Cuál es la facturación anual aproximada de tu negocio?",
    helper: "Nos ayuda a preparar una conversación relevante para tu tamaño de operación.",
    options: [
      { id: "menos_2m", label: "Menos de $2,000,000 MXN", points: 0 },
      { id: "2m_10m", label: "Entre $2,000,000 y $10,000,000 MXN", points: 0 },
      { id: "10m_50m", label: "Entre $10,000,000 y $50,000,000 MXN", points: 0 },
      { id: "mas_50m", label: "Más de $50,000,000 MXN", points: 0 },
    ],
  },
];

export const SCORABLE_QUESTIONS = QUESTIONS.filter((q) => q.dimensionId);
export const MAX_SCORE = SCORABLE_QUESTIONS.length * 3; // 4 dimensiones × 3 pts = 12

export type Answers = Record<string, string>; // questionId -> optionId

// ---------------------------------------------------------------------------
// Dimensiones: metadata + insights de autoridad (uno por nivel de puntos 0-3)
// ---------------------------------------------------------------------------

export interface DimensionMeta {
  id: DimensionId;
  label: string;
  icon: string; // Material Symbols name
  /** orden de prioridad cuando hay empate en "punto más débil" — el más urgente primero */
  priority: number;
  insights: [string, string, string, string]; // índice = puntos (0-3)
}

export const DIMENSIONS: DimensionMeta[] = [
  {
    id: "riesgo_fiscal",
    label: "Riesgo Fiscal",
    icon: "gavel",
    priority: 0,
    insights: [
      "Ya tuviste una señal directa del SAT — cancelación de sellos, restricción de facturación o un requerimiento sin resolver del todo. Esto casi nunca se arregla solo con 'estar más al pendiente': normalmente hay una causa estructural (declaraciones inconsistentes, discrepancias entre lo declarado y lo depositado) que sigue activa hasta que alguien la diagnostica a fondo.",
      "Las cartas invitación del SAT casi nunca llegan sin razón — son la forma en que el sistema avisa de una discrepancia antes de escalar a un requerimiento formal. Resolverlas sin entender la causa de fondo es la forma más común en que {entidad} termina en una revisión más profunda un año después.",
      "No haber tenido problemas todavía no es lo mismo que estar en regla — es común operar bien por años y descubrir una exposición acumulada justo cuando menos conviene: en una auditoría, o al vender {entidad}.",
      "Tener la certeza —no la suposición— de estar en regla es la base sobre la que se puede construir todo lo demás. Aquí no hay urgencia; hay oportunidad de usar ese margen para optimizar, no solo para cumplir.",
    ],
  },
  {
    id: "visibilidad_financiera",
    label: "Visibilidad Financiera",
    icon: "monitoring",
    priority: 2,
    insights: [
      "No poder responder cuánto dinero es realmente tuyo para disponer es, con diferencia, la causa más común detrás de decisiones que parecían buena idea en el momento y terminan en un aprieto de flujo dos meses después.",
      "Un estimado 'a ojo' funciona hasta que deja de funcionar: la brecha entre lo que crees tener disponible y lo que realmente tienes es justo donde se originan los problemas de flujo que se sienten como que 'llegaron de la nada'.",
      "Poder calcularlo, aunque tome tiempo, significa que la información existe — el problema no es de datos, es de que no está organizada para decidir rápido cuando de verdad importa.",
      "Tener ese número siempre a la mano es una señal de madurez financiera poco común en negocios de tu tamaño — es la base que permite decidir rápido sin miedo a sorpresas.",
    ],
  },
  {
    id: "optimizacion_fiscal",
    label: "Optimización Fiscal",
    icon: "savings",
    priority: 1,
    insights: [
      "Que nunca te hayan explicado que pagabas de más no significa que no esté pasando — significa que nadie se ha tomado el tiempo de revisarlo a fondo. En la mayoría de los regímenes fiscales mexicanos hay deducciones legítimas que se quedan sobre la mesa simplemente porque nadie las buscó.",
      "Que te lo hayan mencionado sin que se actuara es, casi siempre, dinero que {entidad} sigue dejando ir cada mes que pasa sin ese ajuste.",
      "Una revisión que no sabes si sigue vigente es tan buena como no haberla hecho — la ley cambia, tu operación cambia, y una estrategia de hace dos años puede estar obsoleta hoy.",
      "Una revisión activa y regular es, literalmente, la definición de un departamento financiero bien llevado — la mayoría de los negocios de tu tamaño no llega a este nivel.",
    ],
  },
  {
    id: "preparacion_crecimiento",
    label: "Preparación para Crecer",
    icon: "trending_up",
    priority: 3,
    insights: [
      "Cuando una oportunidad real aparece —crédito, inversión, una contratación clave— y no tienes los números listos, casi siempre la respuesta termina siendo 'no' por default. No porque la oportunidad fuera mala, sino porque no había forma de decidir a tiempo.",
      "Días para preparar la información es, en la práctica, una oportunidad perdida — las decisiones de negocio importantes rara vez esperan una semana.",
      "Estar cerca, con ajustes menores, significa que el sistema casi funciona — vale la pena cerrar ese último tramo antes de que aparezca la oportunidad que sí importa.",
      "Tener proyecciones y números actualizados en todo momento pone a {entidad} en una posición donde las oportunidades se aprovechan, no se lamentan.",
    ],
  },
];

export function getDimension(id: DimensionId): DimensionMeta {
  return DIMENSIONS.find((d) => d.id === id)!;
}

export type DimensionTierLabel = "Crítico" | "Atención" | "En desarrollo" | "Sólido";

const DIMENSION_TIER_LABELS: [DimensionTierLabel, DimensionTierLabel, DimensionTierLabel, DimensionTierLabel] = [
  "Crítico",
  "Atención",
  "En desarrollo",
  "Sólido",
];

const DIMENSION_TIER_COLORS = ["#111111", "#6B6B66", "#0C2156", "#B8892E"]; // Ink · Gris de soporte · Navy · Dorado (oscurecido para contraste de texto)

export function getDimensionTierLabel(points: number): DimensionTierLabel {
  return DIMENSION_TIER_LABELS[Math.max(0, Math.min(3, points))];
}

export function getDimensionTierColor(points: number): string {
  return DIMENSION_TIER_COLORS[Math.max(0, Math.min(3, points))];
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export interface DimensionScore {
  dimension: DimensionMeta;
  points: number; // 0-3
}

export interface ScoreResult {
  totalPoints: number;
  percent: number;
  byDimension: DimensionScore[];
  weakest: DimensionScore;
  strongest: DimensionScore;
}

export function getEntityType(answers: Answers): EntityType {
  return answers["tipo_contribuyente"] === "persona_moral" ? "persona_moral" : "persona_fisica";
}

export function entityWord(entity: EntityType, capitalize = false): string {
  const word = entity === "persona_moral" ? "tu empresa" : "tu actividad";
  return capitalize ? word[0].toUpperCase() + word.slice(1) : word;
}

/** Reemplaza los placeholders {entidad} / {entidad_cap} según el tipo de contribuyente. */
export function personalize(text: string, entity: EntityType): string {
  return text.replaceAll("{entidad_cap}", entityWord(entity, true)).replaceAll("{entidad}", entityWord(entity));
}

export function computeScore(answers: Answers): ScoreResult {
  const byDimension: DimensionScore[] = SCORABLE_QUESTIONS.map((q) => {
    const dimension = getDimension(q.dimensionId!);
    const chosen = answers[q.id];
    const option = q.options.find((o) => o.id === chosen);
    return { dimension, points: option?.points ?? 0 };
  });

  const totalPoints = byDimension.reduce((sum, d) => sum + d.points, 0);
  const percent = Math.round((totalPoints / MAX_SCORE) * 100);

  const weakest = [...byDimension].sort(
    (a, b) => a.points - b.points || a.dimension.priority - b.dimension.priority,
  )[0];
  const strongest = [...byDimension].sort(
    (a, b) => b.points - a.points || a.dimension.priority - b.dimension.priority,
  )[0];

  return { totalPoints, percent, byDimension, weakest, strongest };
}

// ---------------------------------------------------------------------------
// Tier general (para el sello)
// ---------------------------------------------------------------------------

export type TierId = "riesgo" | "estable" | "optimizado";

export interface Tier {
  id: TierId;
  stamp: string;
  title: string;
  description: string; // puede contener {entidad}
  ctaHelper: string;
  min: number;
  max: number;
}

export const TIERS: Tier[] = [
  {
    id: "riesgo",
    stamp: "ZONA DE RIESGO",
    title: "Encontramos al menos un punto de exposición real",
    description:
      "Este diagnóstico identificó una o más áreas donde {entidad} está expuesta a un riesgo concreto — no teórico, uno que ya se manifestó o está a punto de hacerlo. Abajo desglosamos exactamente cuál es y qué significa.",
    ctaHelper: "Agenda tu diagnóstico completo con un consultor",
    min: 0,
    max: 40,
  },
  {
    id: "estable",
    stamp: "BASE SÓLIDA, PUNTOS CIEGOS",
    title: "Tienes control donde se ve — no donde no se ve",
    description:
      "El manejo general de {entidad} es razonable, pero hay al menos un punto ciego que cuesta margen o expone sin que se note todavía. Con el nivel de operación que manejas, ese punto ciego empieza a pesar más de lo que parece.",
    ctaHelper: "Agenda tu diagnóstico completo con un consultor",
    min: 41,
    max: 70,
  },
  {
    id: "optimizado",
    stamp: "OPERACIÓN FINANCIERA MADURA",
    title: "El siguiente nivel ya no es orden, es estrategia",
    description:
      "{entidad_cap} está mejor administrada que la mayoría de los negocios de su tamaño. La siguiente conversación no es sobre poner orden — es sobre usar esa claridad para crecer más rápido y con menos riesgo.",
    ctaHelper: "Agenda una sesión estratégica con un consultor",
    min: 71,
    max: 100,
  },
];

export function getTier(percent: number): Tier {
  return TIERS.find((t) => percent >= t.min && percent <= t.max) ?? TIERS[0];
}
