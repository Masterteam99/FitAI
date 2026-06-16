"use client";

import { motion, useReducedMotion } from "framer-motion";

function buildPath(values: number[], w: number, h: number, pad: number) {
  if (values.length === 0) return { line: "", area: "" };
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = (w - pad * 2) / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;
  return { line, area };
}

export function AnimatedArea({
  values,
  width = 300,
  height = 150,
  pad = 6,
  color = "#3fae5a",
  className,
}: {
  values: number[];
  width?: number;
  height?: number;
  pad?: number;
  color?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { line, area } = buildPath(values, width, height, pad);
  const gid = `area-${values.length}-${Math.round(values[0] ?? 0)}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.4" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gid})`}
        initial={reduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reduced ? 0 : 0.8, delay: reduced ? 0 : 0.3 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reduced ? 0 : 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
