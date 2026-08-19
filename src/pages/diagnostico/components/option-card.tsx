import { cn } from "@/lib/utils";

interface OptionCardProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Opción de respuesta grande y tap-friendly — pensada para tráfico de
 * campañas pagadas en móvil, donde un radio button pequeño pierde clics.
 * Selección única por pregunta; avanza automáticamente al elegir.
 */
export function OptionCard({ label, selected, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left text-[15px] font-medium transition-all duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] sm:text-base",
        selected
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-card-foreground)] shadow-[0_0_0_1px_var(--color-primary)]"
          : "border-black/10 bg-white/70 text-[var(--color-card-foreground)] hover:border-black/20 hover:bg-white",
      )}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          selected ? "border-[var(--color-primary)] bg-[var(--color-primary)]" : "border-black/20",
        )}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </button>
  );
}
