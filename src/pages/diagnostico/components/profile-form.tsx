import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { OptionCard } from "./option-card";
import { PROFILE_QUESTIONS, type ProfileAnswers } from "@/lib/profile-questions";
import type { LeadData } from "./lead-form";

type ProfileView = "intro" | "questions" | "done" | "skipped";

const AUTO_ADVANCE_DELAY_MS = 280;

interface ProfileFormProps {
  lead: LeadData;
}

export function ProfileForm({ lead }: ProfileFormProps) {
  const [view, setView] = useState<ProfileView>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ProfileAnswers>({});
  const advanceTimeout = useRef<ReturnType<typeof setTimeout>>();

  const total = PROFILE_QUESTIONS.length;
  const question = PROFILE_QUESTIONS[step];

  const sendProfile = useCallback(
    (finalAnswers: ProfileAnswers) => {
      const labeled = PROFILE_QUESTIONS.reduce<Record<string, string>>((acc, q) => {
        const chosen = q.options.find((o) => o.id === finalAnswers[q.id]);
        if (chosen) acc[q.question] = chosen.label;
        return acc;
      }, {});
      fetch("/api/notify-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "profile",
          nombre: lead.nombre,
          empresa: lead.empresa,
          email: lead.email,
          profile: labeled,
        }),
      }).catch(() => {
        /* silencioso a propósito */
      });
    },
    [lead],
  );

  const goNext = useCallback(
    (nextAnswers: ProfileAnswers) => {
      if (step < total - 1) {
        setStep((s) => s + 1);
      } else {
        setView("done");
        sendProfile(nextAnswers);
      }
    },
    [step, total, sendProfile],
  );

  const handleSelect = useCallback(
    (optionId: string) => {
      const next = { ...answers, [question.id]: optionId };
      setAnswers(next);
      clearTimeout(advanceTimeout.current);
      advanceTimeout.current = setTimeout(() => goNext(next), AUTO_ADVANCE_DELAY_MS);
    },
    [answers, question, goNext],
  );

  if (view === "skipped") return null;

  return (
    <div
      className="mt-4 rounded-[20px] p-7 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.4)] sm:p-8"
      style={{ backgroundColor: "var(--color-card)" }}
    >
      <AnimatePresence mode="wait">
        {view === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-support)]">
              Opcional — 30 segundos
            </p>
            <h3 className="font-heading mt-2 text-xl text-[var(--color-ink)]">
              Ayúdenos a preparar su sesión
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-gray-support)]">
              5 preguntas rápidas para que, al revisar su diagnóstico antes de la llamada, ya sepamos con
              quién estamos hablando.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setView("questions")}
                className="h-[44px] rounded-full px-6 text-sm font-semibold text-white transition-transform duration-150 hover:scale-[1.02]"
                style={{ backgroundColor: "var(--color-royal)" }}
              >
                Comenzar
              </button>
              <button
                type="button"
                onClick={() => setView("skipped")}
                className="h-[44px] rounded-full px-5 text-sm font-medium text-[var(--color-gray-support)] hover:text-[var(--color-ink)]"
              >
                Omitir
              </button>
            </div>
          </motion.div>
        )}

        {view === "questions" && (
          <motion.div
            key={`q-${step}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-support)]">
                Pregunta {step + 1} de {total}
              </p>
              <button
                type="button"
                onClick={() => setView("skipped")}
                className="text-xs font-medium text-[var(--color-gray-support)] hover:text-[var(--color-ink)]"
              >
                Omitir
              </button>
            </div>
            <h3 className="font-heading mt-2 text-xl text-[var(--color-ink)]">{question.question}</h3>
            <div className="mt-4 rounded-[var(--radius)] border border-black/8 px-2">
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
          </motion.div>
        )}

        {view === "done" && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="font-heading text-lg text-[var(--color-ink)]">Gracias, {lead.nombre.split(" ")[0]}.</p>
            <p className="mt-2 text-[15px] text-[var(--color-gray-support)]">
              Ya tenemos el contexto que necesitábamos para su sesión.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
