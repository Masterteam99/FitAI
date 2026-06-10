"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trophy } from "lucide-react";
import { GradientMesh } from "@/components/visualizations/GradientMesh";
import { NumberPunch } from "@/components/motion/NumberPunch";
import { copy } from "@/content/copy";
import type { Exercise } from "./useWorkoutSession";

export function CompletedView({ planId, exercises, durationMin }: {
  planId: string;
  exercises: Exercise[];
  durationMin: number;
}) {
  const reduced = useReducedMotion();
  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const muscles = Array.from(new Set(exercises.map((e) => e.muscleGroupPrimary)));

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <GradientMesh palette="hot" intensity="high" fixed />
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative max-w-xl w-full text-center space-y-6"
      >
        <motion.div
          initial={reduced ? false : { scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.2 }}
          className="w-28 h-28 rounded-full bg-gradient-to-br from-energy-warm to-energy-hot flex items-center justify-center mx-auto glow-energy"
        >
          <Trophy className="w-14 h-14 text-background" strokeWidth={2.5} />
        </motion.div>

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-energy-warm">{copy.allenamentoSessione.completedLabel}</p>
          <h1 className="text-display-lg text-foreground">{copy.allenamentoSessione.completedTitle}</h1>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{copy.allenamentoSessione.statDuration}</div>
            <div className="font-display text-3xl">
              <NumberPunch value={durationMin} unit="m" />
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{copy.allenamentoSessione.statExercises}</div>
            <div className="font-display text-3xl">
              <NumberPunch value={exercises.length} />
            </div>
          </div>
          <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{copy.allenamentoSessione.statTotalSets}</div>
            <div className="font-display text-3xl">
              <NumberPunch value={totalSets} />
            </div>
          </div>
        </div>

        <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-4 max-w-md mx-auto">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{copy.allenamentoSessione.musclesHitToday}</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {muscles.map((m) => (
              <span key={m} className="px-3 py-1 rounded-full bg-energy-warm/20 text-energy-warm text-xs font-medium border border-energy-warm/30">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              <ChevronRight className="w-5 h-5" /> {copy.allenamentoSessione.dashboard}
            </Button>
          </Link>
          <Link href={`/allenamento/${planId}`}>
            <Button size="lg" variant="outline">{copy.allenamentoSessione.plan}</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
