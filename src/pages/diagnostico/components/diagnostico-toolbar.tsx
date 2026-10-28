import { motion } from "motion/react";

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
      <div className="fixed inset-x-0 top-0 z-40 h-1 overflow-hidden bg-[#e8edf8]">
        {storyMode ? (
          <motion.div
            key="story-bar"
            className="relative h-full bg-[#021f74]"
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
            className="h-full rounded-r-full bg-[#021f74] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
        <motion.button
          type="button"
          onClick={onReset}
          aria-label="Diagnóstico Financiero Axis — empezar de nuevo"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#021f74]/40"
        >
          <span
            className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white"
            style={{ border: "2px solid #e8edf8", boxShadow: "0 4px 20px rgba(2,31,116,.14)" }}
          >
            <img src="/logoaxis.png" alt="" width={32} height={32} style={{ objectFit: "contain" }} />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-[#021f74]">Axis Consultores</span>
        </motion.button>

        <a
          href="https://axismx.framer.website/"
          className="text-sm font-medium text-[#2e384c] transition-colors hover:text-[#021f74]"
        >
          Volver al sitio
        </a>
      </header>
    </>
  );
}
