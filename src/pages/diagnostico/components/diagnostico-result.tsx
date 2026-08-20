import { useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/wizard/icon";
import { ResultStamp } from "./result-stamp";
import {
  getDimensionTierColor,
  getDimensionTierLabel,
  getEntityType,
  personalize,
  type Answers,
  type ScoreResult,
  type Tier,
} from "@/lib/diagnostico";
import type { LeadData } from "./lead-form";

// TODO: reemplazar si el equipo comercial cambia de calendario en el futuro.
const CALENDLY_URL = "https://calendly.com/etrevino-axisconsultoresmx/30min";

interface DiagnosticoResultProps {
  tier: Tier;
  score: ScoreResult;
  answers: Answers;
  lead: LeadData;
  onRestart: () => void;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function DiagnosticoResult({ tier, score, answers, lead, onRestart }: DiagnosticoResultProps) {
  const entity = getEntityType(answers);

  // Dispara el evento de conversión principal para Google Ads / GA4 en
  // cuanto se muestra el resultado — el lead ya está capturado en este punto.
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "lead_capturado",
      diagnostico_tier: tier.id,
      diagnostico_score: score.percent,
      diagnostico_punto_debil: score.weakest.dimension.id,
    });
  }, [tier.id, score.percent, score.weakest.dimension.id]);

  const calendlyHref = `${CALENDLY_URL}?name=${encodeURIComponent(lead.nombre)}&email=${encodeURIComponent(lead.email)}`;
  const weakestInsight = personalize(score.weakest.dimension.insights[score.weakest.points], entity);
  const strongestInsight =
    score.strongest.points >= 2 && score.strongest.dimension.id !== score.weakest.dimension.id
      ? personalize(score.strongest.dimension.insights[score.strongest.points], entity)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="mx-auto flex max-w-2xl flex-col py-6"
    >
      {/* --- Cabecera: sello + veredicto general --- */}
      <div
        className="rounded-[20px] p-8 text-center shadow-[0_24px_60px_-28px_rgba(12,33,86,0.4)] sm:p-10"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        <p className="type-small font-semibold uppercase tracking-[0.12em] text-[var(--color-muted-foreground)]">
          Diagnóstico para {lead.empresa}
        </p>

        <div className="mt-5 flex justify-center">
          <ResultStamp tierId={tier.id} label={tier.stamp} />
        </div>

        <h2 className="type-h1 mt-6 text-[var(--color-card-foreground)]">{tier.title}</h2>

        <p className="type-body-lg mx-auto mt-4 max-w-lg text-[var(--color-muted-foreground)]">
          {personalize(tier.description, entity)}
        </p>
      </div>

      {/* --- Scorecard por dimensión --- */}
      <div
        className="mt-4 rounded-[20px] p-7 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.4)] sm:p-8"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        <p className="type-small font-semibold uppercase tracking-[0.12em] text-[var(--color-muted-foreground)]">
          Tu radiografía financiera
        </p>
        <div className="mt-5 space-y-5">
          {score.byDimension.map(({ dimension, points }) => (
            <div key={dimension.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-card-foreground)]">
                  <Icon name={dimension.icon} className="text-[18px] text-[var(--color-muted-foreground)]" />
                  {dimension.label}
                </span>
                <span
                  className="font-body text-xs font-semibold uppercase tracking-wide"
                  style={{ color: getDimensionTierColor(points) }}
                >
                  {getDimensionTierLabel(points)}
                </span>
              </div>
              <div className="mt-2 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      backgroundColor: i < points ? getDimensionTierColor(points) : "rgba(0,0,0,0.08)",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Punto más urgente: el insight de autoridad --- */}
      <div
        className="mt-4 rounded-[20px] border-l-4 p-7 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.4)] sm:p-8"
        style={{
          backgroundColor: "var(--color-card)",
          borderColor: getDimensionTierColor(score.weakest.points),
        }}
      >
        <p
          className="type-small font-semibold uppercase tracking-[0.12em]"
          style={{ color: getDimensionTierColor(score.weakest.points) }}
        >
          Tu punto más urgente: {score.weakest.dimension.label}
        </p>
        <p className="type-body-lg mt-3 text-[var(--color-card-foreground)]">{weakestInsight}</p>
      </div>

      {/* --- Lo que ya funciona bien (si aplica) --- */}
      {strongestInsight && (
        <div
          className="mt-4 rounded-[20px] border-l-4 p-7 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.35)] sm:p-8"
          style={{ backgroundColor: "var(--color-card)", borderColor: "#F6C967" }}
        >
          <p className="type-small font-semibold uppercase tracking-[0.12em] text-[#B8892E]">
            Lo que ya tienes bien: {score.strongest.dimension.label}
          </p>
          <p className="type-body-lg mt-3 text-[var(--color-card-foreground)]">{strongestInsight}</p>
        </div>
      )}

      {/* --- CTA --- */}
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <Button
          asChild
          className="h-[52px] rounded-full bg-[var(--color-primary)] px-8 text-base font-semibold text-[var(--color-primary-foreground)] shadow-lg transition-transform duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:scale-[1.02] active:scale-100"
        >
          <a
            href={calendlyHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({ event: "calendly_click", diagnostico_tier: tier.id });
            }}
          >
            <Icon name="calendar_month" className="text-[20px]" />
            {tier.ctaHelper}
          </a>
        </Button>
        <p className="text-sm text-white/60">
          30 minutos, sin costo — revisamos tu {score.weakest.dimension.label.toLowerCase()} a fondo.
        </p>

        <button
          type="button"
          onClick={onRestart}
          className="mt-4 text-sm text-white/50 underline-offset-4 hover:underline"
        >
          Volver a empezar
        </button>
      </div>
    </motion.div>
  );
}
