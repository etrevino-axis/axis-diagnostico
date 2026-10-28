import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Fondo y texto FIJOS (no heredan --color-background/--color-foreground
          // globales) — evita el bug de texto invisible cuando el input vive
          // dentro de una tarjeta clara sobre un fondo general oscuro.
          "flex h-11 w-full rounded-[10px] border-[1.5px] border-[#e8edf8] bg-[#f8f9fc] px-3.5 py-2 text-base text-[#021f74] ring-offset-background placeholder:text-[#9ca3af] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#021f74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#021f74]/30 focus-visible:border-[#021f74] focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
