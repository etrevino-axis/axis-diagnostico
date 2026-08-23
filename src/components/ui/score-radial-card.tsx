import React from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { cn } from "@/lib/utils";

interface ScoreRadialCardProps {
  /** Etiqueta pequeña sobre el título (ej. "Diagnóstico para Axis SA") */
  eyebrow?: string;
  /** Título principal de la tarjeta. */
  title: string;
  /** Valor numérico central (0–100). */
  value: number;
  /** Texto de estado corto bajo el número (ej. "Riesgo", "Estable", "Óptimo"). */
  status: string;
  /** Descripción de cierre. */
  description: React.ReactNode;
  /** Progreso del anillo (0–100) — normalmente igual a `value`. */
  progress: number;
  /** Ícono a mostrar en la esquina superior derecha. */
  icon: React.ReactNode;
  className?: string;
}

/**
 * Tarjeta con anillo de progreso animado — reemplaza el sello plano
 * "ZONA DE RIESGO" por una visualización más sofisticada del score
 * general. Adaptada de un componente de 21st.dev (Vo2MaxCard); recoloreada
 * a azul rey (sin dorado) y usando `motion/react` en vez de `framer-motion`
 * para no agregar una dependencia nueva — ambas librerías comparten API.
 */
export const ScoreRadialCard: React.FC<ScoreRadialCardProps> = ({
  eyebrow,
  title,
  value,
  status,
  description,
  progress,
  icon,
  className,
}) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const progressValue = useMotionValue(0);

  React.useEffect(() => {
    const valueAnimation = animate(count, value, { duration: 1.4, ease: [0.43, 0.13, 0.23, 0.96] });
    const progressAnimation = animate(progressValue, progress, {
      duration: 1.4,
      ease: [0.43, 0.13, 0.23, 0.96],
    });
    return () => {
      valueAnimation.stop();
      progressAnimation.stop();
    };
  }, [value, progress, count, progressValue]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useTransform(progressValue, (v) => circumference - (v / 100) * circumference);

  return (
    <div
      className={cn(
        "relative flex w-full flex-col gap-4 overflow-hidden rounded-[20px] p-7 shadow-[0_24px_60px_-28px_rgba(12,33,86,0.4)] sm:p-8",
        className,
      )}
      style={{ backgroundColor: "var(--color-card)", color: "var(--color-card-foreground)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-support,#6b7280)]">
              {eyebrow}
            </p>
          )}
          <h3 className="font-heading mt-1 text-xl text-[var(--color-card-foreground)] sm:text-2xl">{title}</h3>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--color-primary)", color: "var(--color-primary-foreground)" }}
        >
          {icon}
        </div>
      </div>

      {/* Radial Progress and Value */}
      <div className="relative flex h-52 w-full items-center justify-center">
        <svg
          width="190"
          height="190"
          viewBox="0 0 200 200"
          className="-rotate-90"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <circle
            cx="100"
            cy="100"
            r={radius}
            strokeWidth="12"
            fill="transparent"
            stroke="rgba(42,70,224,0.12)"
            strokeDasharray="8 12"
            strokeLinecap="round"
          />
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            strokeWidth="12"
            fill="transparent"
            stroke="var(--color-primary)"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeLinecap="round"
            style={{ strokeDashoffset }}
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <motion.span className="font-heading text-6xl tracking-tighter text-[var(--color-card-foreground)]">
            {rounded}
          </motion.span>
          <p className="text-lg font-medium" style={{ color: "var(--color-primary)" }}>
            {status}
          </p>
        </div>
      </div>

      <div className="text-center text-[15px] leading-relaxed text-[var(--color-gray-support,#6b7280)]">
        {description}
      </div>
    </div>
  );
};
