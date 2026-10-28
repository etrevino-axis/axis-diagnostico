/**
 * Motor de reglas del Diagnóstico Financiero de Axis Consultores — v5.
 *
 * IMPORTANTE: las preguntas y helpers de abajo son el texto EXACTO que
 * Eric proporcionó, sin parafrasear ni acortar — la versión anterior
 * recortaba palabras para "escaneo móvil" sin haberlo pedido; eso fue
 * un error y no se repite aquí. Cada `question` + `helper` juntos
 * reproducen la oración completa tal como fue escrita.
 *
 * v6 (arquetipo "cliente base"): 3 preguntas de diagnóstico (las más cercanas al dolor
 * de contabilidad atrasada) + 3 de calificación sin puntaje (ver QUALIFICATION_QUESTIONS).
 * Las dimensiones eficiencia_fiscal, toma_decisiones y preparacion_terceros se retiraron del
 * quiz pero se conservan en DIMENSIONS por si se reactivan.
 *
 * Dimensiones puntuadas, una pregunta cada una. Opciones ordenadas de mejor (1)
 * a peor (4) tal como las definió Eric → puntos 3,2,1,0 respectivamente.
 * Sin IA, sin backend: reglas puras y auditables.
 */

export interface DiagnosticoOption {
  id: string;
  label: string;
  points: number; // 3 = mejor situación, 0 = mayor urgencia
}

export type DimensionId =
  | "informacion_financiera"
  | "control_gasto"
  | "cumplimiento_fiscal"
  | "eficiencia_fiscal"
  | "toma_decisiones"
  | "preparacion_terceros";

export interface DiagnosticoQuestion {
  id: string;
  dimensionId: DimensionId;
  title: string;
  question: string;
  helper: string;
  options: DiagnosticoOption[];
}

export const QUESTIONS: DiagnosticoQuestion[] = [
  {
    id: "informacion_financiera",
    dimensionId: "informacion_financiera",
    title: "Información financiera",
    question:
      "Si hoy necesitara saber exactamente cómo está su situación financiera, ¿qué tan fácil sería obtener una respuesta confiable?",
    helper: "Ya sea para conocer sus ingresos y gastos, saber cuánto ganó realmente o simplemente tener su contabilidad al día.",
    options: [
      { id: "actualizada", label: "Tengo información actualizada y puedo consultarla rápidamente.", points: 3 },
      { id: "revisar", label: "Tengo la información, pero necesito revisarla o pedirla.", points: 2 },
      { id: "no_integrada", label: "La información existe, pero no está actualizada o integrada.", points: 1 },
      { id: "sin_certeza", label: "No tengo certeza de mis números actuales.", points: 0 },
    ],
  },
  {
    id: "control_gasto",
    dimensionId: "control_gasto",
    title: "Control de gasto",
    question: "¿Qué tan claro tiene dónde está utilizando su dinero?",
    helper:
      "Considere gastos, costos, pagos, inversiones y, si aplica, cuáles de ellos están afectando la rentabilidad de su actividad.",
    options: [
      { id: "exacto", label: "Sé exactamente en qué se está utilizando.", points: 3 },
      { id: "idea_no_monitoreo", label: "Tengo una idea, aunque no lo monitoreo regularmente.", points: 2 },
      { id: "principales", label: "Conozco mis principales gastos, pero no tengo una visión completa.", points: 1 },
      { id: "saldo", label: "Normalmente reviso mi saldo bancario para saber cómo voy.", points: 0 },
    ],
  },
  {
    id: "cumplimiento_fiscal",
    dimensionId: "cumplimiento_fiscal",
    title: "Cumplimiento fiscal",
    question: "¿Qué tan seguro está de que su situación fiscal está correctamente atendida?",
    helper: "Incluyendo declaraciones, pagos, facturación y demás obligaciones que correspondan a su actividad.",
    options: [
      { id: "totalmente_seguro", label: "Totalmente seguro.", points: 3 },
      { id: "creo_que_si", label: "Creo que sí, pero no lo he verificado recientemente.", points: 2 },
      { id: "dudas", label: "Tengo algunas dudas o pendientes.", points: 1 },
      { id: "atencion", label: "Sé que tengo situaciones que necesitan atención.", points: 0 },
    ],
  },
];

export const MAX_SCORE = QUESTIONS.length * 3; // 3 × 3 = 9

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
    id: "cumplimiento_fiscal",
    label: "Cumplimiento Fiscal",
    icon: "gavel",
    priority: 0,
    insights: [
      "Saber que existen situaciones pendientes y no haberlas resuelto es, de las áreas de este diagnóstico, la que representa mayor riesgo inmediato — cada mes que pasa sin atenderlas, la exposición ante el SAT se acumula.",
      "Tener dudas o pendientes sin resolver rara vez se queda como está — normalmente crece hasta convertirse en un requerimiento formal en el momento menos oportuno.",
      "Creer que está en regla sin haberlo verificado recientemente es una posición común — y también la más fácil de corregir con una revisión puntual antes de que se convierta en un problema real.",
      "Tener la certeza, verificada, de que su situación fiscal está en regla es la base sobre la que se puede construir estrategia — no solo cumplimiento.",
    ],
  },
  {
    id: "eficiencia_fiscal",
    label: "Eficiencia Fiscal",
    icon: "savings",
    priority: 1,
    insights: [
      "Esa respuesta describe, con honestidad, algo que le está costando dinero cada mes — casi siempre hay deducciones o estructuras fiscales legítimas sin aprovechar, y no preguntarlo no hace que dejen de aplicar.",
      "Cumplir sin optimizar es la posición por default de la mayoría de los negocios — y también la más fácil de mejorar, porque no requiere cambiar cómo opera, solo cómo se declara.",
      "Una eficiencia fiscal que no se revisa periódicamente se vuelve obsoleta sin que nadie lo note — la ley cambia, y una estructura que aplicaba hace dos años puede ya no ser la óptima hoy.",
      "Una revisión preventiva y regular es, literalmente, la definición de una estrategia fiscal bien llevada — muy pocos negocios de su tamaño llegan a este nivel.",
    ],
  },
  {
    id: "informacion_financiera",
    label: "Información Financiera",
    icon: "monitoring",
    priority: 2,
    insights: [
      "No tener certeza de sus números actuales no es un tema menor: es la razón más común por la que una decisión que parecía correcta termina complicando la operación.",
      "Tener la información pero sin actualizar o integrar equivale a no tenerla cuando más se necesita — el dato existe, pero llega tarde para decidir con él.",
      "Depender de revisar o pedir la información antes de poder usarla introduce un retraso que, en el momento de una decisión importante, puede costar la oportunidad misma.",
      "Tener información actualizada y accesible de inmediato es la base sobre la que se construye cualquier decisión financiera sólida — el punto de partida menos común entre negocios de su tamaño.",
    ],
  },
  {
    id: "control_gasto",
    label: "Control de Gasto",
    icon: "account_balance_wallet",
    priority: 3,
    insights: [
      "Guiarse por el saldo bancario es la señal más clara de que no hay control real del gasto — el saldo dice cuánto dinero hay hoy, no si la operación es rentable.",
      "Conocer los gastos principales sin una visión completa deja fuera, casi siempre, los costos pequeños y recurrentes que en conjunto erosionan la rentabilidad sin que se note mes a mes.",
      "Una idea aproximada, sin monitoreo regular, es exactamente el punto donde un gasto que dejó de tener sentido sigue saliendo durante meses antes de que alguien lo note.",
      "Saber exactamente en qué se utiliza el dinero es la diferencia entre administrar una operación y simplemente sobrevivirla — la mayoría de los negocios de su tamaño no llega a este nivel.",
    ],
  },
  {
    id: "toma_decisiones",
    label: "Toma de Decisiones",
    icon: "trending_up",
    priority: 4,
    insights: [
      "Decidir sin números listos significa que las decisiones más importantes del negocio se toman con la misma certeza que un volado — funciona hasta que la decisión equivocada cuesta cara.",
      "Una idea sin cálculos periódicos es suficiente para el día a día, pero se queda corta justo en el momento en que una decisión grande requiere precisión, no intuición.",
      "Conocer las cifras principales cubre gran parte del camino — el siguiente paso es tener metas definidas sobre esas cifras, no solo visibilidad de ellas.",
      "Tener números y metas definidos es lo que separa una operación que reacciona de una que dirige su propio crecimiento.",
    ],
  },
  {
    id: "preparacion_terceros",
    label: "Preparación ante Terceros",
    icon: "folder_shared",
    priority: 5,
    insights: [
      "No saber qué documentación se necesitaría presentar ante una revisión, crédito o socio potencial es el tipo de brecha que normalmente se descubre en el peor momento posible.",
      "Tener que revisar varias cosas antes de poder responder es manejable si hay tiempo — pero la mayoría de estas situaciones no avisan con semanas de anticipación.",
      "Poder reunir la documentación, aunque tome tiempo, es una posición razonable — el siguiente objetivo es reducir ese tiempo a horas, no días.",
      "Tener información y documentación actualizada en todo momento es la señal más clara de una operación financiera madura.",
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

export function getDimensionTierLabel(points: number): DimensionTierLabel {
  return DIMENSION_TIER_LABELS[Math.max(0, Math.min(3, points))];
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

export function computeScore(answers: Answers): ScoreResult {
  const byDimension: DimensionScore[] = QUESTIONS.map((q) => {
    const dimension = getDimension(q.dimensionId);
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
  description: string;
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
      "Este diagnóstico identificó una o más áreas donde su operación está expuesta a un riesgo concreto — no teórico, uno que ya se manifestó o está a punto de hacerlo. Abajo desglosamos exactamente cuál es y qué significa.",
    ctaHelper: "Agenda una cita con un consultor",
    min: 0,
    max: 40,
  },
  {
    id: "estable",
    stamp: "BASE SÓLIDA, PUNTOS CIEGOS",
    title: "Tiene control donde se ve — no donde no se ve",
    description:
      "El manejo general de su operación es razonable, pero hay al menos un punto ciego que cuesta margen o expone sin que se note todavía.",
    ctaHelper: "Agenda una cita con un consultor",
    min: 41,
    max: 70,
  },
  {
    id: "optimizado",
    stamp: "OPERACIÓN FINANCIERA MADURA",
    title: "El siguiente nivel ya no es orden, es estrategia",
    description:
      "Su operación está mejor administrada que la mayoría de los negocios de su tamaño. La siguiente conversación no es sobre poner orden — es sobre usar esa claridad para crecer más rápido y con menos riesgo.",
    ctaHelper: "Agenda una sesión estratégica",
    min: 71,
    max: 100,
  },
];

export function getTier(percent: number): Tier {
  return TIERS.find((t) => percent >= t.min && percent <= t.max) ?? TIERS[0];
}

// ---------------------------------------------------------------------------
// Calificación (sin puntaje) — arquetipo "cliente base"
// ---------------------------------------------------------------------------

export type Fit = "base" | "gris" | "fuera";

export interface QualificationOption {
  id: string;
  label: string;
  fit: Fit;
}

export interface QualificationQuestion {
  id: string;
  title: string;
  question: string;
  helper: string;
  options: QualificationOption[];
}

export const QUALIFICATION_QUESTIONS: QualificationQuestion[] = [
  {
    id: "q_facturas",
    title: "Su negocio",
    question: "¿Cuántas facturas emite su negocio al mes, aproximadamente?",
    helper: "Un cálculo aproximado es suficiente; nos ayuda a dimensionar el trabajo contable.",
    options: [
      { id: "f_10", label: "10 o menos.", fit: "base" },
      { id: "f_30", label: "De 11 a 30.", fit: "gris" },
      { id: "f_100", label: "De 31 a 100.", fit: "fuera" },
      { id: "f_mas", label: "Más de 100.", fit: "fuera" },
    ],
  },
  {
    id: "q_empleados",
    title: "Su negocio",
    question: "¿Cuántas personas tiene contratadas en nómina?",
    helper: "Sin contarse a usted, si trabaja por su cuenta.",
    options: [
      { id: "e_0", label: "Ninguna.", fit: "base" },
      { id: "e_3", label: "De 1 a 3.", fit: "base" },
      { id: "e_10", label: "De 4 a 10.", fit: "gris" },
      { id: "e_mas", label: "Más de 10.", fit: "fuera" },
    ],
  },
  {
    id: "q_quien_lleva",
    title: "Su negocio",
    question: "¿Quién lleva hoy su contabilidad?",
    helper: "Nos permite entender desde dónde se empezaría.",
    options: [
      { id: "l_nadie", label: "Nadie: la tengo atrasada.", fit: "base" },
      { id: "l_yo", label: "La llevo yo mismo.", fit: "base" },
      { id: "l_externo", label: "Un contador o despacho externo.", fit: "base" },
      { id: "l_interno", label: "Un equipo contable interno.", fit: "gris" },
    ],
  },
];

/** Pregunta genérica (diagnóstico o calificación) para el flujo de pasos. */
export type FlowQuestion = {
  id: string;
  title: string;
  question: string;
  helper: string;
  options: { id: string; label: string }[];
};

export const FLOW_QUESTIONS: FlowQuestion[] = [...QUESTIONS, ...QUALIFICATION_QUESTIONS];

export type FitResult = { fit: Fit; label: string; details: Record<string, string> };

const FIT_LABEL: Record<Fit, string> = {
  base: "CLIENTE BASE",
  gris: "REVISAR EN LLAMADA",
  fuera: "FUERA DE PERFIL BASE",
};

export function classifyFit(answers: Answers): FitResult {
  const details: Record<string, string> = {};
  let worst: Fit = "base";
  for (const q of QUALIFICATION_QUESTIONS) {
    const opt = q.options.find((o) => o.id === answers[q.id]);
    if (!opt) continue;
    details[q.question] = opt.label;
    if (opt.fit === "fuera") worst = "fuera";
    else if (opt.fit === "gris" && worst !== "fuera") worst = "gris";
  }
  return { fit: worst, label: FIT_LABEL[worst], details };
}
