"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedBars({
  data,
  color = "#3fae5a",
  className,
}: {
  data: Array<{ label: string; value: number }>;
  color?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={className}>
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3 py-1.5">
          <span className="text-xs text-muted-foreground w-20 shrink-0 truncate">{d.label}</span>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--organic-line)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: color, transformOrigin: "left" }}
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: d.value / max }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : i * 0.06 }}
            />
          </div>
          <span className="text-xs font-semibold w-8 text-right tabular-nums">{Math.round(d.value)}</span>
        </div>
      ))}
    </div>
  );
}
