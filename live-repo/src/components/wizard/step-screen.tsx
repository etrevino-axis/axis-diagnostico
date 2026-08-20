import { motion, type Variants } from "motion/react";
import { Button } from "@/components/ui/button";
import { Icon } from "./icon";

interface StepScreenProps {
  index: number; // 0-based active step
  total: number; // total input steps
  title: string;
  question: string;
  helper: string;
  optional?: boolean;
  isLast?: boolean;
  /** Disables the Continue button (e.g. no answer selected yet). Defaults to enabled. */
  canContinue?: boolean;
  /** Hides the Continue button entirely — use when selecting an option auto-advances. */
  hideContinue?: boolean;
  onBack?: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  children: React.ReactNode;
}

// Entrance motion: fade + short rise, tight easing, small stagger.
const EASE = [0.25, 0.1, 0.25, 1] as const;
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

/**
 * Paso de foco único. Editorial y sobrio: etiqueta dorada, titular serif
 * de tamaño contenido (no hero gigante), tarjeta blanca provista por el
 * llamador (no se envuelve dos veces). Copy 100% en español — el template
 * original de Lovable traía "Step X of Y / Back / Skip" en inglés.
 */
export function StepScreen({
  index,
  total,
  title,
  question,
  helper,
  optional = false,
  isLast = false,
  canContinue = true,
  hideContinue = false,
  onBack,
  onContinue,
  onSkip,
  children,
}: StepScreenProps) {
  return (
    <motion.form
      key={index}
      variants={container}
      initial="hidden"
      animate="show"
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) onContinue();
      }}
      className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-2xl flex-col justify-center py-6"
    >
      <motion.div variants={item} className="flex items-center gap-2">
        <span
          className="text-xs font-semibold uppercase tracking-[0.14em]"
          style={{ color: "var(--color-gold)" }}
        >
          {title}
        </span>
        {optional && <span className="text-xs text-white/45">· opcional</span>}
      </motion.div>

      <motion.p variants={item} className="mt-1.5 text-xs font-medium text-white/45">
        Paso {index + 1} de {total}
      </motion.p>

      <motion.h2
        variants={item}
        className="font-heading mt-3 text-[26px] leading-[1.15] text-white sm:text-[32px]"
      >
        {question}
      </motion.h2>

      <motion.p variants={item} className="mt-3 text-[15px] leading-relaxed text-white/60 sm:text-base">
        {helper}
      </motion.p>

      <motion.div variants={item} className="mt-7">
        {children}
      </motion.div>

      <motion.div variants={item} className="mt-7 flex items-center gap-3">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            aria-label="Atrás"
            className="h-[48px] rounded-full px-5 text-[15px] text-white/70 transition-colors duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:bg-white/10 hover:text-white"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            Atrás
          </Button>
        )}
        {!hideContinue && (
          <Button
            type="submit"
            disabled={!canContinue}
            className="h-[48px] rounded-full px-8 text-[15px] font-semibold shadow-lg transition-transform duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:scale-[1.02] active:scale-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            style={{ backgroundColor: "var(--color-gold)", color: "var(--color-ink)" }}
          >
            {isLast ? "Ver mi resultado" : "Continuar"}
          </Button>
        )}
        {optional && onSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            className="h-[48px] rounded-full px-5 text-[15px] text-white/70 transition-colors duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:bg-white/10 hover:text-white"
          >
            Omitir
          </Button>
        )}
      </motion.div>
    </motion.form>
  );
}
