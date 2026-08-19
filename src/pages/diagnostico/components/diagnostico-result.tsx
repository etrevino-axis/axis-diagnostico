import { useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/wizard/icon";
import { ResultStamp } from "./result-stamp";
import type { Tier } from "@/lib/diagnostico";
import type { LeadData } from "./lead-form";

const CALENDLY_URL = "https://calendly.com/etrevino-axisconsultoresmx/30min";

interface DiagnosticoResultProps {
  tier: Tier;
  percent: number;
  lead: LeadData;
  onRestart: () => void;
}

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function DiagnosticoResult({ tier, percent, lead, onRestart }: DiagnosticoResultProps) {
  // Dispara el evento de conversión principal para Google Ads / GA4 en
  // cuanto se muestra el resultado — el lead ya está capturado en este punto.
  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "lead_capturado",
      diagnostico_tier: tier.id,
      diagnostico_score: percent,
    });
  }, [tier.id, percent]);

  const calendlyHref = `${CALENDLY_URL}?name=${encodeURIComponent(lead.nombre)}&email=${encodeURIComponent(lead.email)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-2xl flex-col justify-center py-6"
    >
      <div
        className="rounded-[20px] p-8 text-center shadow-[0_24px_60px_-28px_rgba(24,12,64,0.45)] sm:p-10"
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
          {tier.description}
        </p>

        <div className="mx-auto mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 font-mono text-xs text-[var(--color-muted-foreground)]">
          {percent}% de salud financiera
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="mt-6 text-sm text-[var(--color-muted-foreground)] underline-offset-4 hover:underline"
        >
          Volver a empezar
        </button>
      </div>
    </motion.div>
  );
}
