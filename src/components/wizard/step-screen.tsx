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
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Single-focus step. Counter + question sit on the saturated
 * field in the ported display type scale; inputs live in one soft card. The
 * whole step fades + rises in with a small stagger on step change.
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
      className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-3xl flex-col justify-center py-6"
    >
      <motion.div variants={item} className="flex items-center gap-2">
        <span className="type-small font-semibold uppercase tracking-[0.14em] text-[#F6C967]">
          {title}
        </span>
        {optional && (
          <span className="type-small text-white/45">· optional</span>
        )}
      </motion.div>

      <motion.p variants={item} className="type-small mt-1 font-medium text-white/50">
        Paso {index + 1} de {total}
      </motion.p>

      <motion.h2 variants={item} className="type-h1 mt-3 text-white">
        {question}
      </motion.h2>

      <motion.p variants={item} className="type-body-lg mt-4 text-white/70">
        {helper}
      </motion.p>

      <motion.div
        variants={item}
        className="mt-8 rounded-[20px] p-7 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.55)] sm:p-8"
        style={{ backgroundColor: "var(--color-card)" }}
      >
        <div className="space-y-6 text-[var(--color-card-foreground)]">{children}</div>
      </motion.div>

      <motion.div variants={item} className="mt-8 flex items-center gap-3">
        {onBack && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            aria-label="Atrás"
            className="h-[52px] rounded-full px-5 text-base text-white transition-[background-color] duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:bg-white/15 hover:text-white"
          >
            <Icon name="arrow_back" className="text-[20px]" />
            Atrás
          </Button>
        )}
        {!hideContinue && (
          <Button
            type="submit"
            disabled={!canContinue}
            className="h-[52px] rounded-full bg-[var(--color-primary)] px-8 text-base font-semibold text-[var(--color-primary-foreground)] shadow-lg transition-transform duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:scale-[1.02] active:scale-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            {isLast ? "Ver mi resultado" : "Continuar"}
          </Button>
        )}
        {optional && onSkip && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            className="h-[52px] rounded-full px-5 text-base text-white transition-[background-color] duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:bg-white/15 hover:text-white"
          >
            Omitir
          </Button>
        )}
      </motion.div>
    </motion.form>
  );
}
