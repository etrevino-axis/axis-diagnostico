import { Icon } from "@/components/wizard/icon";

interface DiagnosticoToolbarProps {
  progress: number; // 0–100
  onReset: () => void;
}

export function DiagnosticoToolbar({ progress, onReset }: DiagnosticoToolbarProps) {
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-white/15">
        <div
          className="h-full rounded-r-full bg-[#2A46E0] transition-[width] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progreso del diagnóstico"
        />
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

        
          href="https://axismx.framer.website/"
          className="text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          Volver al sitio
        </a>
      </header>
    </>
  );
}
