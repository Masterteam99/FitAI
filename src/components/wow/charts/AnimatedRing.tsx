"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/MotionPrimitives";
import { clamp } from "@/lib/utils";

export function AnimatedRing({
  value,
  max = 100,
  size = 140,
  thickness = 12,
  label,
  trackColor = "var(--organic-line)",
  from = "#8a9a7b",
  to = "#3fae5a",
}: {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: string;
  trackColor?: string;
  from?: string;
  to?: string;
}) {
  const reduced = useReducedMotion();
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = clamp(value / max, 0, 1);
  const gid = `ring-${Math.round(value)}-${size}`;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={thickness} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduced ? c * (1 - pct) : c }}
          whileInView={{ strokeDashoffset: c * (1 - pct) }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: reduced ? 0 : 1.4, ease: [0.2, 0.8, 0.2, 1] }}
        />
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl leading-none" style={{ color: "var(--organic-espresso)" }}>
          <CountUp value={value} />
        </span>
        {label && <small className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</small>}
      </div>
    </div>
  );
}
