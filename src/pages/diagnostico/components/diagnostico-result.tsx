import { useEffect } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/wizard/icon";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ResultStamp } from "./result-stamp";
import { TestimonialsSection } from "./testimonials-section";
import { getDimensionTierLabel, type ScoreResult, type Tier } from "@/lib/diagnostico";
import type { LeadData } from "./lead-form";

// TODO: reemplazar si el equipo comercial cambia de calendario en el futuro.
const CALENDLY_URL = "https://calendly.com/etrevino-axisconsultoresmx/30min";

interface DiagnosticoResultProps {
  tier: Tier;
  score: ScoreResult;
  lead: LeadData;
  onRestart: () => void;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// Severidad comunicada con intensidad de navy (no con un semáforo de
// colores) — regla del UI Kit: sin colores adicionales sin función clara.
// El dorado se reserva exclusivamente para el CTA de esta pantalla.
const SEVERITY_FILL = ["rgba(12,33,86,0.28)", "rgba(12,33,86,0.5)", "rgba(12,33,86,0.75)", "var(--color-navy)"];
const SEVERITY_TEXT = ["#8a8a86", "#6b6b67", "var(--color-navy)", "var(--color-navy)"];

export function DiagnosticoResult({ tier, score, lead, onRestart }: DiagnosticoResultProps) {
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
  const weakestInsight = score.weakest.dimension.insights[score.weakest.points];
  const strongestInsight =
    score.strongest.points >= 2 && score.strongest.dimension.id !== score.weakest.dimension.id
      ? score.strongest.dimension.insights[score.strongest.points]
      : null;

  const trackCalendlyClick = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "calendly_click", diagnostico_tier: tier.id });
  };

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
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-support)]">
          Diagnóstico para {lead.empresa}
        </p>

        <div className="mt-5 flex justify-center">
          <ResultStamp tierId={tier.id} label={tier.stamp} />
        </div>

        <h2 className="font-heading mt-6 text-[26px] leading-tight text-[var(--color-ink)] sm:text-[32px]">
          {tier.title}
        </h2>

        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-[var(--color-gray-support)] sm:text-base">
          {tier.description}
        </p>
      </div>

      {/* --- Scorecard por dimensión --- */}
      <div
        className="mt-4 rounded-[20px] p-7 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.4)] sm:p-8"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-support)]">
          Su radiografía financiera
        </p>
        <div className="mt-5 space-y-5">
          {score.byDimension.map(({ dimension, points }) => (
            <div key={dimension.id}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
                  <Icon name={dimension.icon} className="text-[17px] text-[var(--color-gray-support)]" />
                  {dimension.label}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: SEVERITY_TEXT[points] }}>
                  {getDimensionTierLabel(points)}
                </span>
              </div>
              <div className="mt-2 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    style={{ backgroundColor: i < points ? SEVERITY_FILL[points] : "rgba(17,17,17,0.07)" }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Punto más urgente: el insight de autoridad --- */}
      <div
        className="mt-4 rounded-[20px] border-l-[3px] p-7 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.4)] sm:p-8"
        style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-navy)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-navy)]">
          Su punto más urgente: {score.weakest.dimension.label}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink)] sm:text-base">{weakestInsight}</p>
      </div>

      {/* --- Lo que ya funciona bien (si aplica) --- */}
      {strongestInsight && (
        <div
          className="mt-4 rounded-[20px] border-l-[3px] p-7 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.4)] sm:p-8"
          style={{ backgroundColor: "var(--color-card)", borderColor: "rgba(12,33,86,0.35)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-support)]">
            Ya tiene bien resuelto: {score.strongest.dimension.label}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink)] sm:text-base">{strongestInsight}</p>
        </div>
      )}

      {/* --- CTA — único lugar de la pantalla donde se usa el dorado --- */}
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <a href={calendlyHref} target="_blank" rel="noopener noreferrer" onClick={trackCalendlyClick}>
          <ShimmerButton>
            <Icon name="calendar_month" className="text-[20px]" />
            {tier.ctaHelper}
          </ShimmerButton>
        </a>
        <p className="text-sm text-white/60">
          30 minutos, sin costo — revisamos su {score.weakest.dimension.label.toLowerCase()} a fondo.
        </p>

        <button
          type="button"
          onClick={onRestart}
          className="mt-4 text-sm text-white/50 underline-offset-4 hover:underline"
        >
          Volver a empezar
        </button>
      </div>

      <TestimonialsSection />
    </motion.div>
  );
}
