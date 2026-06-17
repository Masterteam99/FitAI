"use client";

import { motion, useReducedMotion } from "framer-motion";

export function OnboardingProgress({ current, total = 4 }: { current: number; total?: number }) {
  const reduced = useReducedMotion();
  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Passo ${current} di ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const done = i < current;
        return (
          <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden bg-border">
            <motion.div
              className="h-full rounded-full bg-primary"
              style={{ transformOrigin: "left" }}
              initial={reduced ? false : { scaleX: 0 }}
              animate={{ scaleX: done ? 1 : 0 }}
              transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : i * 0.05 }}
            />
          </div>
        );
      })}
    </div>
  );
}
