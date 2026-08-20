import { cn } from "@/lib/utils";

interface OptionCardProps {
  index: number; // 1-based, para la numeración editorial
  label: string;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Fila de respuesta numerada — estilo "tarjeta de servicio" del UI Kit
 * (numeración simple, sin saturación visual). Sin radio button circular
 * dorado ni fondo relleno de color — la selección se marca con un borde
 * izquierdo delgado y el numeral en navy. El dorado se reserva para el
 * CTA, no para cada fila de cada pregunta.
 */
export function OptionCard({ index, label, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-start gap-4 border-b px-1 py-4 text-left transition-colors duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] last:border-b-0",
        selected ? "border-transparent" : "border-black/8 hover:border-black/16",
      )}
      style={
        selected
          ? {
              borderLeft: "3px solid var(--color-navy)",
              paddingLeft: "calc(0.25rem + 1px)",
              backgroundColor: "rgba(12,33,86,0.04)",
            }
          : { borderLeft: "3px solid transparent", paddingLeft: "calc(0.25rem + 1px)" }
      }
    >
      <span
        className={cn(
          "mt-0.5 shrink-0 text-[13px] font-semibold tabular-nums transition-colors",
          selected ? "text-[var(--color-navy)]" : "text-[var(--color-gray-support)]",
        )}
      >
        {String(index).padStart(2, "0")}
      </span>
      <span
        className={cn(
          "text-[15px] leading-snug transition-colors sm:text-base",
          selected ? "font-medium text-[var(--color-ink)]" : "text-[var(--color-ink)]/85",
        )}
      >
        {label}
      </span>
    </button>
  );
}
