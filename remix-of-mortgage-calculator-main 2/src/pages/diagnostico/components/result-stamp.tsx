import { motion } from "motion/react";
import type { TierId } from "@/lib/diagnostico";
import { cn } from "@/lib/utils";

const STAMP_COLOR: Record<TierId, string> = {
  riesgo: "border-[#E8664D] text-[#E8664D]",
  estable: "border-[#D4A24E] text-[#D4A24E]",
  optimizado: "border-[#4E9E6D] text-[#4E9E6D]",
};

/**
 * El momento firma del diagnóstico: un "sello" estilo auditoría, como el
 * que estampa un revisor sobre un documento — apropiado para el mundo
 * contable/fiscal, y memorable sin depender de gráficas genéricas.
 */
export function ResultStamp({ tierId, label }: { tierId: TierId; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.4, rotate: -14 }}
      animate={{ opacity: 1, scale: 1, rotate: -6 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-lg border-[3px] px-5 py-2.5 font-mono text-sm font-bold uppercase tracking-[0.14em] sm:text-base",
        STAMP_COLOR[tierId],
      )}
      style={{ boxShadow: "0 0 0 1px currentColor inset" }}
    >
      {label}
    </motion.div>
  );
}
