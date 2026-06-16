"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/MotionPrimitives";
import { clamp } from "@/lib/utils";

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polar(cx, cy, r, endDeg);
  const e = polar(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? "0" : "1";
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

export function RadialGauge({
  value,
  max,
  unit,
  color = "#3fae5a",
  size = 120,
  label,
}: {
  value: number;
  max: number;
  unit?: string;
  color?: string;
  size?: number;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const start = -135;
  const end = 135;
  const pct = clamp(value / max, 0, 1);
  const valueEnd = start + (end - start) * pct;
  const trackLen = Math.PI * r * 1.5; // 270° dell'arco completo
  const drawLen = trackLen * pct; // lunghezza effettiva dell'arco del valore

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <path d={arcPath(cx, cy, r, start, end)} fill="none" stroke="var(--organic-line)" strokeWidth="9" strokeLinecap="round" />
        <motion.path
          d={arcPath(cx, cy, r, start, valueEnd)}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={drawLen}
          initial={{ strokeDashoffset: reduced ? 0 : drawLen }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: reduced ? 0 : 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl leading-none" style={{ color: "var(--organic-espresso)" }}>
          <CountUp value={value} />{unit && <small className="text-xs font-sans">{unit}</small>}
        </span>
        {label && <small className="text-[10px] text-muted-foreground mt-0.5">{label}</small>}
      </div>
    </div>
  );
}
