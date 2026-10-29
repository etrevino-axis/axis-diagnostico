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
    question: "¿Cuál describe mejor tu perfil?",
    options: [
      { id: "persona_fisica", label: "Persona física (con o sin actividad empresarial)" },
      { id: "dueno", label: "Dueño o director de una empresa" },
      { id: "financiero", label: "Responsable de finanzas o administración" },
      { id: "otro", label: "Otro" },
    ],
  },
  {
    id: "motivacion",
    question: "¿Qué te motivó a tomar este diagnóstico?",
    options: [
      { id: "sat", label: "Preocupación por el SAT" },
      { id: "entender_numeros", label: "Quiero entender mejor mis números" },
      { id: "cambiar_contador", label: "Busco cambiar de contador" },
      { id: "curiosidad", label: "Solo tenía curiosidad" },
    ],
  },
  {
    id: "fuente",
    question: "¿Cómo te enteraste de Axis Consultores?",
    options: [
      { id: "google", label: "Búsqueda en Google" },
      { id: "recomendacion", label: "Recomendación de alguien" },
      { id: "redes", label: "LinkedIn o redes sociales" },
      { id: "otro", label: "Otro" },
    ],
  },
];

export type ProfileAnswers = Record<string, string>;
