import { motion } from "motion/react";

interface OptionCardProps {
  index: number;
  label: string;
  selected: boolean;
  onSelect: () => void;
}

/** Opción de respuesta — tarjeta con borde 1.5px estilo portal Axis. */
export function OptionCard({ index, label, selected, onSelect }: OptionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.12 }}
      className="mb-2.5 flex w-full items-start gap-3.5 text-left last:mb-0"
      style={{
        background: selected ? "#eef2fb" : "#ffffff",
        border: `1.5px solid ${selected ? "#021f74" : "#e8edf8"}`,
        borderRadius: 12,
        padding: "14px 16px",
        boxShadow: selected ? "0 4px 16px rgba(2,31,116,.10)" : "none",
        transition: "border-color .14s, background .14s, box-shadow .14s",
        fontFamily: "inherit",
      }}
    >
      <span
        className="mt-0.5 shrink-0 text-[12px] font-bold tabular-nums"
        style={{
          color: selected ? "#ffffff" : "#021f74",
          background: selected ? "#021f74" : "#e8edf8",
          borderRadius: 99,
          minWidth: 24,
          height: 24,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .14s",
        }}
      >
        {index}
      </span>
      <span
        className="text-[15px] leading-snug sm:text-base"
        style={{ color: "#021f74", fontWeight: selected ? 600 : 500 }}
      >
        {label}
      </span>
    </motion.button>
  );
}
