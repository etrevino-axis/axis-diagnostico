import { motion } from "motion/react";
import { Icon } from "@/components/wizard/icon";

interface DiagnosticoToolbarProps {
  progress: number;
  onReset: () => void;
  storyMode?: boolean;
}

const STORY_DURATION_S = 16;
const PULSE_STARTS_AT_S = STORY_DURATION_S - 4;

export function DiagnosticoToolbar({ progress, onReset, storyMode = false }: DiagnosticoToolbarProps) {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-1 overflow-hidden bg-white/15">
        {storyMode ? (
          <motion.div
            key="story-bar"
            className="relative h-full bg-[#2A46E0]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: STORY_DURATION_S, ease: "linear" }}
          >
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.55, 0] }}
              transition={{
                delay: PULSE_STARTS_AT_S,
                duration: 0.5,
                repeat: 6,
                repeatType: "loop",
              }}
            />
          </motion.div>
        ) : (
          <div
            className="h-full rounded-r-full bg-[#2A46E0] transition-[width] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso del diagnóstico"
          />
        )}
      </div>

      <header className="relative z-30 mx-auto flex max-w-[90rem] items-center justify-between gap-4 px-6 py-5 sm:px-8">
        <button
          type="button"
          onClick={onReset}
          aria-label="Diagnóstico Financiero Axis — empezar de nuevo"
          className="flex items-center gap-2 rounded-full text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A46E0]/60"
        >
          <Icon name="account_balance" className="text-[20px] text-[#2A46E0]" />
          <span className="font-heading text-base font-semibold tracking-tight">Axis Consultores</span>
        </button>

        
          <a
          href="https://axismx.framer.website/"
          className="text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          Volver al sitio
        </a>
      </header>
    </>
  );
}
