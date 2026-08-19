import { cn } from "@/lib/utils";

interface IconProps {
  /** Material Symbols (Rounded) ligature name, e.g. "home", "arrow_back". */
  name: string;
  /** Tailwind size utility controls the glyph size, e.g. "text-[22px]". */
  className?: string;
  /** Filled variant. */
  filled?: boolean;
}

/** Google Material Symbols icon rendered as a font ligature. */
export function Icon({ name, className, filled = false }: IconProps) {
  return (
    <span
      aria-hidden
      className={cn("material-symbols-rounded shrink-0", className)}
      style={filled ? { fontVariationSettings: "'opsz' 24, 'wght' 400, 'FILL' 1, 'GRAD' 0" } : undefined}
    >
      {name}
    </span>
  );
}
