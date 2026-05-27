"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function NumberPunch({
  value,
  duration = 1.4,
  format,
  unit,
  tone = "default",
  className,
}: {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  unit?: string;
  tone?: "default" | "energy" | "hot";
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState(reduced ? value : 0);
  const controls = useAnimationControls();
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (reduced) {
      setDisplayed(value);
      return;
    }
    const start = prevValueRef.current === value ? 0 : prevValueRef.current;
    const delta = value - start;
    if (delta === 0) return;
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayed(Math.round(start + delta * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        controls.start({
          scale: [1, 1.08, 1],
          transition: { duration: 0.22, ease: "easeOut" },
        });
        prevValueRef.current = value;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, reduced]);

  const toneClass = {
    default: "",
    energy: "text-gradient-energy",
    hot: "text-energy-hot",
  }[tone];

  return (
    <motion.span
      animate={controls}
      className={cn("inline-block tabular-nums will-change-transform", toneClass, className)}
    >
      {format ? format(displayed) : displayed.toLocaleString("it-IT")}
      {unit && <span className="text-[0.5em] ml-1 align-baseline opacity-70">{unit}</span>}
    </motion.span>
  );
}
