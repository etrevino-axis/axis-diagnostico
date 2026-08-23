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
          "flex h-11 w-full rounded-md border border-black/15 bg-white px-3 py-2 text-base text-[#111111] ring-offset-background placeholder:text-[#6b7280] file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A46E0] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
