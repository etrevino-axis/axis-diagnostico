import { useCallback, useEffect, useState } from "react";
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

/**
 * Diagnóstico Financiero (`/`) — herramienta auto-servible de 7 preguntas
 * que califica la salud financiera de una empresa y filtra al visitante
 * ANTES de pedirle una llamada. El lead se captura después del quiz
 * (fricción baja, ya invirtió tiempo) y el CTA final manda a Calendly.
 */
export default function Diagnostico() {
  const [view, setView] = useState<View>("quiz");
  const [activeStep, setActiveStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [lead, setLead] = useState<LeadData | null>(null);

  // Evento de "inicio" — útil para medir tasa de abandono del funnel en GA4.
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "diagnostico_iniciado" });
  }, []);

  const question = QUESTIONS[activeStep];
  const isLast = activeStep === STEP_COUNT - 1;
  const hasAnswer = Boolean(answers[question?.id]);

  const handleSelect = useCallback(
    (optionId: string) => {
      setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    },
    [question],
  );

  const handleContinue = useCallback(() => {
    if (!hasAnswer) return;
    if (!isLast) {
      setActiveStep((i) => i + 1);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "diagnostico_completado" });
      setView("lead");
    }
  }, [hasAnswer, isLast]);

  const handleBack = useCallback(() => {
    setActiveStep((i) => Math.max(0, i - 1));
  }, []);

  const handleLeadSubmit = useCallback((data: LeadData) => {
    setLead(data);
    setView("results");
  }, []);

  const handleRestart = useCallback(() => {
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

  const { percent } = computeScore(answers);
  const tier = getTier(percent);

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
            onBack={activeStep > 0 ? handleBack : undefined}
            onContinue={handleContinue}
          >
            <div className="space-y-3">
              {question.options.map((option) => (
                <OptionCard
                  key={option.id}
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
          <DiagnosticoResult tier={tier} percent={percent} lead={lead} onRestart={handleRestart} />
        )}
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
