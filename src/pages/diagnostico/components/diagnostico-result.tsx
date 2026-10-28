import { useEffect } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/wizard/icon";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { ScoreRadialCard } from "@/components/ui/score-radial-card";
import { ProfileForm } from "./profile-form";
import { TestimonialsSection } from "./testimonials-section";
import { getDimensionTierLabel, type FitResult, type ScoreResult, type Tier, type TierId } from "@/lib/diagnostico";
import type { LeadData } from "./lead-form";

const CALENDLY_URL = "https://calendly.com/etrevino-axisconsultoresmx/30min";

interface DiagnosticoResultProps {
  tier: Tier;
  score: ScoreResult;
  fit: FitResult;
  lead: LeadData;
  onRestart: () => void;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const SEVERITY_FILL = ["rgba(2,31,116,0.25)", "rgba(2,31,116,0.5)", "rgba(2,31,116,0.75)", "#021f74"];
const SEVERITY_TEXT = ["#8a93a8", "#5a6580", "#021f74", "#021f74"];

const TIER_STATUS: Record<TierId, string> = { riesgo: "Riesgo", estable: "Estable", optimizado: "Óptimo" };
const TIER_ICON: Record<TierId, string> = { riesgo: "priority_high", estable: "insights", optimizado: "verified" };

export function DiagnosticoResult({ tier, score, fit, lead, onRestart }: DiagnosticoResultProps) {
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "lead_capturado",
      diagnostico_tier: tier.id,
      diagnostico_score: score.percent,
      diagnostico_punto_debil: score.weakest.dimension.id,
      diagnostico_perfil: fit.fit,
    });

    fetch("/api/notify-telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: lead.nombre,
        empresa: lead.empresa,
        telefono: lead.telefono,
        email: lead.email,
        scorePercent: score.percent,
        tierStamp: tier.stamp,
        puntoDebil: score.weakest.dimension.label,
        perfil: fit.label,
        perfilDetalle: fit.details,
      }),
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <ScoreRadialCard
        eyebrow={`Diagnóstico para ${lead.empresa}`}
        title={tier.title}
        value={score.percent}
        status={TIER_STATUS[tier.id]}
        progress={score.percent}
        icon={<Icon name={TIER_ICON[tier.id]} className="text-[20px]" />}
        description={tier.description}
      />

      <div
        className="mt-4 axis-card p-7 sm:p-8"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-support)]">
          Tu radiografía financiera
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
                    style={{ backgroundColor: i < points ? SEVERITY_FILL[points] : "#e8edf8" }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-4 axis-card border-l-[3px] p-7 sm:p-8"
        style={{ backgroundColor: "var(--color-card)", borderColor: "#021f74" }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em]" style={{ color: "#021f74" }}>
          Tu punto más urgente: {score.weakest.dimension.label}
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink)] sm:text-base">{weakestInsight}</p>
      </div>

      {strongestInsight && (
        <div
          className="mt-4 axis-card border-l-[3px] p-7 sm:p-8"
          style={{ backgroundColor: "var(--color-card)", borderColor: "rgba(2,31,116,0.35)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-support)]">
            Ya tienes bien resuelto: {score.strongest.dimension.label}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--color-ink)] sm:text-base">{strongestInsight}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <a href={calendlyHref} target="_blank" rel="noopener noreferrer" onClick={trackCalendlyClick}>
          <ShimmerButton>
            <Icon name="calendar_month" className="text-[20px]" />
            {tier.ctaHelper}
          </ShimmerButton>
        </a>
        <p className="text-sm text-[#2e384c]">
          30 minutos, sin costo — revisamos tu {score.weakest.dimension.label.toLowerCase()} a fondo.
        </p>

        <button
          type="button"
          onClick={onRestart}
          className="mt-4 text-sm text-[#2e384c]/70 underline-offset-4 hover:underline"
        >
          Volver a empezar
        </button>
      </div>

      <ProfileForm lead={lead} />

      <TestimonialsSection />
    </motion.div>
  );
}
