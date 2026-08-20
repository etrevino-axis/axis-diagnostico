import { motion } from "motion/react";
import type { TierId } from "@/lib/diagnostico";
import { cn } from "@/lib/utils";

// Paleta restringida a los tokens del UI Kit — sin semáforo multicolor.
// "Riesgo" usa el destructive ya definido en el sistema (color funcional,
// no un extra sin justificación); el resto se queda en navy/dorado.
const STAMP_STYLE: Record<TierId, string> = {
  riesgo: "border-[var(--color-destructive)] text-[var(--color-destructive)]",
  estable: "border-[var(--color-navy)] text-[var(--color-navy)]",
  optimizado: "border-[#8A6A1F] text-[#8A6A1F]",
};

/**
 * El momento firma del diagnóstico: un sello estilo auditoría — sobrio,
 * casi sin rotación, tipografía Inter en vez de mono decorativo. La
 * versión anterior (rotación marcada, colores saturados) se sentía
 * juguetona; esta se acerca más a un sello real sobre un documento.
 */
export function ResultStamp({ tierId, label }: { tierId: TierId; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.15, rotate: -6 }}
      animate={{ opacity: 1, scale: 1, rotate: -2 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className={cn(
        "inline-flex select-none items-center justify-center rounded-md border-2 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] sm:text-sm",
        STAMP_STYLE[tierId],
      )}
    >
      {label}
    </motion.div>
  );
}
