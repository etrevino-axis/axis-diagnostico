import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { StepScreen } from "@/components/wizard/step-screen";
import { DiagnosticoToolbar } from "./components/diagnostico-toolbar";
import { OptionCard } from "./components/option-card";
import { LeadForm, type LeadData } from "./components/lead-form";
import { DiagnosticoResult } from "./components/diagnostico-result";
import { QUESTIONS, computeScore, getTier, type Answers } from "@/lib/diagnostico";

type View = "quiz" | "lead" | "results";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const STEP_COUNT = QUESTIONS.length;
// Pausa breve para que se vea la selección marcada antes de saltar al
// siguiente paso — suficiente para dar feedback, poco para sentirse lento.
const AUTO_ADVANCE_DELAY_MS = 320;

/**
 * Diagnóstico Financiero (`/`) — herramienta auto-servible que mide 6
 * dimensiones de salud financiera y filtra al visitante ANTES de pedirle
 * una llamada. Un solo tap en la respuesta avanza el paso — sin botón
 * "Continuar" duplicado. El lead se captura después del quiz (fricción
 * baja, ya invirtió tiempo) y el CTA final manda a Calendly.
 */
export default function Diagnostico() {
  const [view, setView] = useState<View>("quiz");
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [lead, setLead] = useState<LeadData | null>(null);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Evento de "inicio" — útil para medir tasa de abandono del funnel en GA4.
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "diagnostico_iniciado" });
  }, []);

  useEffect(() => () => clearTimeout(advanceTimeout.current), []);

  const question = QUESTIONS[activeStep];
  const isLast = activeStep === STEP_COUNT - 1;

  const goNext = useCallback(() => {
    if (!isLast) {
      setActiveStep((i) => i + 1);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "diagnostico_completado" });
      setView("lead");
    }
  }, [isLast]);

  const handleSelect = useCallback(
    (optionId: string) => {
      setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
      clearTimeout(advanceTimeout.current);
      advanceTimeout.current = setTimeout(goNext, AUTO_ADVANCE_DELAY_MS);
    },
    [question, goNext],
  );

  const handleBack = useCallback(() => {
    clearTimeout(advanceTimeout.current);
    setActiveStep((i) => Math.max(0, i - 1));
  }, []);

  const handleLeadSubmit = useCallback((data: LeadData) => {
    setLead(data);
    setView("results");
  }, []);

  const handleRestart = useCallback(() => {
    clearTimeout(advanceTimeout.current);
    setAnswers({});
    setLead(null);
    setActiveStep(0);
    setView("quiz");
    window.scrollTo(0, 0);
  }, []);

  const progress =
    view === "quiz"
      ? Math.round(((activeStep + 1) / (STEP_COUNT + 1)) * 100)
      : view === "lead"
        ? 95
        : 100;

  const score = computeScore(answers);
  const tier = getTier(score.percent);

  return (
    <div className="calc-canvas min-h-screen">
      <DiagnosticoToolbar progress={progress} onReset={handleRestart} />

      <main className="mx-auto max-w-[90rem] px-6 py-6 sm:px-8">
        {view === "quiz" && (
          <StepScreen
            key={activeStep}
            index={activeStep}
            total={STEP_COUNT}
            title={question.title}
            question={question.question}
            helper={question.helper}
            isLast={isLast}
            hideContinue
            onBack={activeStep > 0 ? handleBack : undefined}
            onContinue={goNext}
          >
            <div className="rounded-[var(--radius)] bg-white px-5 py-2 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.5)] sm:px-6">
              {question.options.map((option, i) => (
                <OptionCard
                  key={option.id}
                  index={i + 1}
                  label={option.label}
                  selected={answers[question.id] === option.id}
                  onSelect={() => handleSelect(option.id)}
                />
              ))}
            </div>
          </StepScreen>
        )}

        {view === "lead" && <LeadForm onSubmit={handleLeadSubmit} />}

        {view === "results" && lead && (
          <DiagnosticoResult tier={tier} score={score} lead={lead} onRestart={handleRestart} />
        )}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
