import { motion } from "motion/react";
import type { TierId } from "@/lib/diagnostico";

// Escala de severidad dentro del propio sistema de marca — sin introducir
// rojo/verde genéricos, tal como indica el UI Kit ("no colores adicionales
// sin función clara"). Ink = más serio, Navy = institucional/estable,
// Dorado = logro/óptimo.
const STAMP_STYLE: Record<TierId, { border: string; text: string; bg: string }> = {
  riesgo: { border: "#111111", text: "#111111", bg: "transparent" },
  estable: { border: "#0C2156", text: "#0C2156", bg: "transparent" },
  optimizado: { border: "#F6C967", text: "#111111", bg: "#F6C967" },
};

/**
 * El "sello" de veredicto — el momento firma del diagnóstico, apropiado
 * para el mundo contable/fiscal sin salirse de la paleta institucional.
 */
export function ResultStamp({ tierId, label }: { tierId: TierId; label: string }) {
  const style = STAMP_STYLE[tierId];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.4, rotate: -14 }}
      animate={{ opacity: 1, scale: 1, rotate: -4 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="inline-flex select-none items-center justify-center rounded-lg border-[3px] px-5 py-2.5 font-heading text-sm font-semibold uppercase tracking-[0.1em] sm:text-base"
      style={{ borderColor: style.border, color: style.text, backgroundColor: style.bg }}
    >
      {label}
    </motion.div>
  );
}
