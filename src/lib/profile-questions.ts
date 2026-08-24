export interface ProfileOption {
  id: string;
  label: string;
}

export interface ProfileQuestion {
  id: string;
  question: string;
  options: ProfileOption[];
}

export const PROFILE_QUESTIONS: ProfileQuestion[] = [
  {
    id: "rol",
    question: "¿Cuál es su rol en la empresa?",
    options: [
      { id: "dueno", label: "Dueño o Director General" },
      { id: "financiero", label: "Director o Gerente Financiero" },
      { id: "contador_interno", label: "Contador interno" },
      { id: "otro", label: "Otro" },
    ],
  },
  {
    id: "tamano",
    question: "¿Cuántas personas trabajan en la empresa?",
    options: [
      { id: "1_5", label: "1 a 5" },
      { id: "6_20", label: "6 a 20" },
      { id: "21_50", label: "21 a 50" },
      { id: "mas_50", label: "Más de 50" },
    ],
  },
  {
    id: "quien_lleva",
    question: "¿Quién lleva hoy la contabilidad?",
    options: [
      { id: "yo_mismo", label: "La llevo yo mismo" },
      { id: "contador_externo", label: "Un contador externo" },
      { id: "despacho", label: "Un despacho contable" },
      { id: "equipo_interno", label: "Tengo equipo contable interno" },
    ],
  },
  {
    id: "motivacion",
    question: "¿Qué lo motivó a tomar este diagnóstico?",
    options: [
      { id: "sat", label: "Preocupación por el SAT" },
      { id: "entender_numeros", label: "Quiero entender mejor mis números" },
      { id: "cambiar_contador", label: "Busco cambiar de contador" },
      { id: "curiosidad", label: "Solo tenía curiosidad" },
    ],
  },
  {
    id: "fuente",
    question: "¿Cómo se enteró de Axis Consultores?",
    options: [
      { id: "google", label: "Búsqueda en Google" },
      { id: "recomendacion", label: "Recomendación de alguien" },
      { id: "redes", label: "LinkedIn o redes sociales" },
      { id: "otro", label: "Otro" },
    ],
  },
];

export type ProfileAnswers = Record<string, string>;
