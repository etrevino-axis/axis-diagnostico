import React from "react";
import { motion } from "motion/react";

export interface Testimonial {
  text: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{ duration: props.duration || 10, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-4 pb-4"
      >
        {[...new Array(2).fill(0).map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, name, role }, i) => (
              <div
                className="w-full max-w-xs rounded-[var(--radius)] border border-black/8 bg-white p-6 shadow-[0_16px_40px_-24px_rgba(12,33,86,0.35)]"
                key={i}
              >
                <p className="text-[15px] leading-relaxed text-[var(--color-ink)]">"{text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-semibold"
                    style={{ backgroundColor: "var(--color-accent)", color: "var(--color-navy)" }}
                  >
                    {name.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-semibold leading-5 text-[var(--color-ink)]">{name}</div>
                    <div className="text-xs leading-5 text-[var(--color-gray-support)]">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))]}
      </motion.div>
    </div>
  );
};
