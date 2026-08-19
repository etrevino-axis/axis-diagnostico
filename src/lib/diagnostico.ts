/**
 * Motor de reglas del Diagnóstico Financiero de Axis Consultores.
 *
 * Sin IA, sin backend: puro if/else ponderado, rápido de construir,
 * fácil de auditar y de ajustar según lo que aprendamos con leads reales.
 *
 * 6 preguntas puntúan la "salud financiera" (0–17 puntos → 0–100%).
 * 1 pregunta califica (factura anual) y no puntúa — solo segmenta al lead.
 */

export interface DiagnosticoOption {
  id: string;
  label: string;
  points: number; // 0 = mayor riesgo, 3 = mejor salud financiera
}

export interface DiagnosticoQuestion {
  id: string;
  title: string; // eyebrow (categoría corta)
  question: string;
  helper: string;
  options: DiagnosticoOption[];
  /** true = no puntúa hacia el score de salud; se guarda solo para calificar/segmentar al lead. */
  qualifier?: boolean;
}

export const QUESTIONS: DiagnosticoQuestion[] = [
  {
    id: "quien_lleva",
    title: "Tu contabilidad hoy",
    question: "¿Quién lleva la contabilidad de tu empresa hoy?",
    helper: "Sin juicios — solo para entender tu punto de partida.",
    options: [
      { id: "yo_mismo", label: "La llevo yo mismo, como puedo", points: 0 },
      { id: "contador_horas", label: "Un contador externo, por honorarios sueltos", points: 1 },
      { id: "despacho", label: "Un despacho contable establecido", points: 2 },
      { id: "interno", label: "Tengo un contador o equipo contable interno", points: 2 },
    ],
  },
  {
    id: "frecuencia_revision",
    title: "Estados financieros",
    question: "¿Con qué frecuencia revisas tu balance y estado de resultados?",
    helper: "Los documentos que dicen si tu empresa realmente está ganando dinero.",
    options: [
      { id: "nunca", label: "Nunca los he visto", points: 0 },
      { id: "solo_envio", label: "Solo cuando me los mandan, sin revisarlos a fondo", points: 1 },
      { id: "mensual", label: "Cada mes", points: 2 },
      { id: "semanal", label: "Cada semana — los uso para decidir", points: 3 },
    ],
  },
  {
    id: "margen_utilidad",
    title: "Margen de utilidad",
    question: "¿Sabes cuál fue tu margen de utilidad el mes pasado?",
    helper: "No la facturación total — lo que realmente te quedó.",
    options: [
      { id: "no_idea", label: "No tengo idea", points: 0 },
      { id: "aproximado", label: "Tengo una idea aproximada", points: 1 },
      { id: "preciso", label: "Sí, con precisión", points: 3 },
    ],
  },
  {
    id: "sat",
    title: "Cumplimiento fiscal",
    question: "¿Has tenido algún requerimiento o revisión del SAT en el último año?",
    helper: "Cartas invitación, requerimientos de información, discrepancias, etc.",
    options: [
      { id: "estresante", label: "Sí, y fue muy estresante — no sabíamos cómo responder", points: 0 },
      { id: "resuelto", label: "Sí, pero lo resolvimos sin mayor problema", points: 2 },
      { id: "ninguno", label: "No, ninguno", points: 3 },
    ],
  },
  {
    id: "flujo_efectivo",
    title: "Flujo de efectivo",
    question: "¿Cómo manejas el flujo de efectivo de tu empresa?",
    helper: "Lo que entra y sale de la cuenta, mes con mes.",
    options: [
      { id: "reaccionando", label: "No lo proyecto — voy reaccionando mes a mes", points: 0 },
      { id: "idea_aproximada", label: "Tengo una idea aproximada de entradas y salidas", points: 1 },
      { id: "proyectado", label: "Tengo proyecciones claras a 3+ meses", points: 3 },
    ],
  },
  {
    id: "decisiones",
    title: "Decisiones grandes",
    question: "¿Qué tan preparado te sientes para decisiones financieras grandes?",
    helper: "Contratar, invertir, expandirte a otra ciudad, pedir crédito.",
    options: [
      { id: "a_ojo", label: "Nada preparado — decido a ojo", points: 0 },
      { id: "con_dudas", label: "Algo preparado, pero con dudas", points: 1 },
      { id: "con_datos", label: "Muy preparado — tengo datos claros", points: 3 },
    ],
  },
  {
    id: "facturacion",
    title: "Tu empresa",
    question: "¿Cuál es la facturación anual aproximada de tu empresa?",
    helper: "Nos ayuda a preparar un diagnóstico relevante para tu tamaño de operación.",
    qualifier: true,
    options: [
      { id: "menos_2m", label: "Menos de $2,000,000 MXN", points: 0 },
      { id: "2m_10m", label: "Entre $2,000,000 y $10,000,000 MXN", points: 0 },
      { id: "10m_50m", label: "Entre $10,000,000 y $50,000,000 MXN", points: 0 },
      { id: "mas_50m", label: "Más de $50,000,000 MXN", points: 0 },
    ],
  },
];

export const SCORABLE_QUESTIONS = QUESTIONS.filter((q) => !q.qualifier);
export const MAX_SCORE = SCORABLE_QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
  0,
); // = 17

export type Answers = Record<string, string>; // questionId -> optionId

export function computeScore(answers: Answers): { points: number; percent: number } {
  let points = 0;
  for (const q of SCORABLE_QUESTIONS) {
    const chosen = answers[q.id];
    const option = q.options.find((o) => o.id === chosen);
    if (option) points += option.points;
  }
  const percent = Math.round((points / MAX_SCORE) * 100);
  return { points, percent };
}

export type TierId = "riesgo" | "estable" | "optimizado";

export interface Tier {
  id: TierId;
  stamp: string; // texto corto del "sello"
  title: string;
  description: string;
  ctaHelper: string;
  min: number; // % inclusive
  max: number; // % inclusive
}

export const TIERS: Tier[] = [
  {
    id: "riesgo",
    stamp: "ZONA DE RIESGO",
    title: "Tu empresa está operando a ciegas",
    description:
      "Estás tomando decisiones importantes sin la información financiera para respaldarlas. Esto no es un juicio — es la posición de la mayoría de las empresas en crecimiento antes de formalizar su función financiera. Pero cada mes que pasa así, el riesgo fiscal y operativo crece.",
    ctaHelper: "Agenda tu diagnóstico completo — identifiquemos qué corregir primero.",
    min: 0,
    max: 40,
  },
  {
    id: "estable",
    stamp: "ESTABLE, CON OPORTUNIDAD",
    title: "Tienes las bases, pero no el panorama completo",
    description:
      "Llevas un control razonable, pero hay puntos ciegos que te cuestan margen o te exponen sin que lo notes todavía. Con el nivel de facturación que manejas, esos puntos ciegos empiezan a pesar más.",
    ctaHelper: "Agenda tu diagnóstico completo — encontremos las oportunidades que faltan.",
    min: 41,
    max: 70,
  },
  {
    id: "optimizado",
    stamp: "FINANZAS OPTIMIZADAS",
    title: "Tienes control — el siguiente nivel es estrategia",
    description:
      "Tu operación financiera está mejor que la de la mayoría de las empresas de tu tamaño. La siguiente conversación no es sobre orden, es sobre cómo usar esa claridad para crecer más rápido y con menos riesgo.",
    ctaHelper: "Agenda una sesión estratégica — hablemos de tu siguiente movimiento.",
    min: 71,
    max: 100,
  },
];

export function getTier(percent: number): Tier {
  return TIERS.find((t) => percent >= t.min && percent <= t.max) ?? TIERS[0];
}
