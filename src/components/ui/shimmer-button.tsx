import React, { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Botón con brillo animado — CTA de Calendly. Estructura fiel al patrón
 * original de 21st.dev (spark detrás + backdrop recortado por `--cut`
 * que deja ver el brillo solo como un borde animado) — solo recoloreado
 * a navy/dorado de marca. Es una animación: no se aprecia en capturas
 * de pantalla estáticas, solo en el navegador.
 */
const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#0C2156",
      shimmerSize = "0.09em",
      shimmerDuration = "2.4s",
      borderRadius = "999px",
      background = "#F6C967",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        style={
          {
            "--spread": "110deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap border border-[#111111]/10 px-8 py-4 text-base font-semibold text-[#111111] [background:var(--bg)] [border-radius:var(--radius)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px hover:scale-[1.03]",
          className,
        )}
        ref={ref}
        {...props}
      >
        {/* spark container */}
        <div className={cn("-z-30 blur-[1px]", "absolute inset-0 overflow-visible [container-type:size]")}>
          {/* spark */}
          <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
            {/* spark before */}
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {children}

        {/* Highlight */}
        <div
          className={cn(
            "insert-0 absolute size-full",
            "[border-radius:var(--radius)] shadow-[inset_0_-8px_10px_rgba(17,17,17,0.12)]",
            "transform-gpu transition-all duration-300 ease-in-out",
            "group-hover:shadow-[inset_0_-6px_10px_rgba(17,17,17,0.2)]",
            "group-active:shadow-[inset_0_-10px_10px_rgba(17,17,17,0.22)]",
          )}
        />

        {/* backdrop — recorta el spark a un borde animado delgado */}
        <div className={cn("absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]")} />
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
