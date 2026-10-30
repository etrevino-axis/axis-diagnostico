import { useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Icon } from "@/components/wizard/icon";
import { ScoreRadialCard } from "@/components/ui/score-radial-card";
import { ProfileForm } from "./profile-form";
import { SolutionsSection } from "./solutions-section";
import { getDimensionTierLabel, type FitResult, type ScoreResult, type Tier, type TierId } from "@/lib/diagnostico";
import type { LeadData } from "./lead-form";

const CALENDLY_URL = "https://calendly.com/etrevino-axisconsultoresmx/30min";
// Número de WhatsApp para el botón secundario (formato internacional sin "+").
// Tomado del teléfono de la cuenta de Google Ads — confirmar/ajustar si es otro.
const WHATSAPP_NUMBER = "528120349991";

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
        empresa: lead.empresa ?? "",
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

  const calendlySrc = useMemo(() => {
    const params = new URLSearchParams({
      embed_domain: window.location.hostname,
      embed_type: "Inline",
      hide_gdpr_banner: "1",
      name: lead.nombre,
      email: lead.email,
      a1: lead.telefono,
    });
    return `${CALENDLY_URL}?${params.toString()}`;
  }, [lead.nombre, lead.email, lead.telefono]);

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, soy ${lead.nombre}. Hice el diagnóstico de Axis Consultores y quiero agendar una sesión.`,
  )}`;

  // Reserva dentro de la misma página: Calendly avisa por postMessage cuando se agenda.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return;
      const type = (e.data as { event?: string } | null)?.event;
      if (type === "calendly.event_scheduled") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: "calendly_agendado", diagnostico_tier: tier.id });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [tier.id]);
  const weakestInsight = score.weakest.dimension.insights[score.weakest.points];
  const strongestInsight =
    score.strongest.points >= 2 && score.strongest.dimension.id !== score.weakest.dimension.id
      ? score.strongest.dimension.insights[score.strongest.points]
      : null;

  const trackWhatsappClick = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "whatsapp_click", diagnostico_tier: tier.id });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="mx-auto flex max-w-2xl flex-col py-6"
    >
      <ScoreRadialCard
        eyebrow={`Diagnóstico para ${lead.empresa || lead.nombre}`}
        title={tier.title}
        value={score.percent}
        status={TIER_STATUS[tier.id]}
        progress={score.percent}
        icon={<Icon name={TIER_ICON[tier.id]} className="text-[20px]" />}
        description={tier.description}
      />

      <div className="axis-card mt-4 p-5 sm:p-6">
        <h3 className="font-heading text-xl font-bold tracking-[-0.02em] text-[#021f74]">
          Agenda tu sesión de 30 minutos, sin costo
        </h3>
        <p className="mt-1 text-[15px] text-[#2e384c]">
          Revisamos tu {score.weakest.dimension.label.toLowerCase()} a fondo. Elige día y hora aquí mismo.
        </p>
        <ul className="mt-4 space-y-2.5 text-[15px] text-[#2e384c]">
          {[
            "Revisamos tu situación fiscal actual y qué está pendiente con el SAT.",
            "Te decimos qué necesitas ordenar primero y qué puede esperar.",
            "Sales con un plan claro y, si te sirve, con una propuesta sin compromiso.",
          ].map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <Icon name="check_circle" className="mt-0.5 text-[18px] text-[#021f74]" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <iframe
          title="Agendar sesión con Axis Consultores"
          src={calendlySrc}
          className="mt-4 w-full rounded-[12px] border-0"
          style={{ height: 700 }}
          loading="lazy"
        />
        <p className="mt-3 text-center text-sm text-[#2e384c]">
          ¿Prefieres que te escribamos?{" "}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackWhatsappClick}
            className="font-semibold text-[#021f74] underline underline-offset-4"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      </div>

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

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="text-sm text-[#2e384c]/70 underline-offset-4 hover:underline"
        >
          Volver a empezar
        </button>
      </div>

      <ProfileForm lead={lead} />

      <SolutionsSection />
    </motion.div>
  );
}
