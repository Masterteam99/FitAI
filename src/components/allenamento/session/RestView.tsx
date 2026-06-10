"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pause, Play, SkipForward } from "lucide-react";
import { NumberPunch } from "@/components/motion/NumberPunch";
import { copy } from "@/content/copy";

const REST_CIRCUMFERENCE = 2 * Math.PI * 90;

export function RestView({ restSecondsLeft, restTotal, isPaused, quote, onTogglePause, onSkip }: {
  restSecondsLeft: number;
  restTotal: number;
  isPaused: boolean;
  quote: string;
  onTogglePause: () => void;
  onSkip: () => void;
}) {
  const reduced = useReducedMotion();
  const restProgress = restTotal > 0 ? restSecondsLeft / restTotal : 0;

  return (
    <motion.div
      key="rest"
      initial={reduced ? false : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduced ? undefined : { opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-[70vh]"
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">{copy.allenamentoSessione.rest}</p>

      <div className="relative">
        <svg viewBox="0 0 200 200" className="w-64 h-64 -rotate-90">
          <circle cx="100" cy="100" r="90" fill="none" stroke="var(--secondary)" strokeWidth="6" />
          <motion.circle
            cx="100" cy="100" r="90"
            fill="none"
            stroke="var(--energy-cool)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={REST_CIRCUMFERENCE}
            style={{ strokeDashoffset: REST_CIRCUMFERENCE * (1 - restProgress) }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <NumberPunch
            value={restSecondsLeft}
            unit="s"
            duration={0.2}
            className="text-hero text-foreground"
          />
          {isPaused && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-energy-warm mt-2">{copy.allenamentoSessione.paused}</span>
          )}
        </div>
      </div>

      <p className="text-muted-foreground italic mt-8 text-center max-w-xs">{quote}</p>

      <div className="flex items-center gap-3 mt-8">
        <Button variant="outline" size="lg" onClick={onTogglePause} className="gap-2">
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {isPaused ? copy.allenamentoSessione.resume : copy.allenamentoSessione.pause}
        </Button>
        <Button size="lg" onClick={onSkip} className="gap-2">
          <SkipForward className="w-4 h-4" /> {copy.allenamentoSessione.skip}
        </Button>
      </div>
    </motion.div>
  );
}
