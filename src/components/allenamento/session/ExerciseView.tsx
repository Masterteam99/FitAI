"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, Flame } from "lucide-react";
import { NumberPunch } from "@/components/motion/NumberPunch";
import { cn } from "@/lib/utils";
import { copy } from "@/content/copy";
import type { Exercise } from "./useWorkoutSession";

export function ExerciseView({ exercises, currentExIndex, currentSet, completedSets, onCompleteSet }: {
  exercises: Exercise[];
  currentExIndex: number;
  currentSet: number;
  completedSets: Record<string, number>;
  onCompleteSet: () => void;
}) {
  const reduced = useReducedMotion();
  const currentEx = exercises[currentExIndex];
  if (!currentEx) return null;

  return (
    <motion.div
      key={`ex-${currentExIndex}`}
      initial={reduced ? false : { opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? undefined : { opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-2xl mx-auto pt-2"
    >
      <p className="text-[10px] uppercase tracking-[0.3em] text-energy-warm">{currentEx.muscleGroupPrimary}</p>
      <h1 className="text-display-lg mt-2 mb-1 text-foreground">{currentEx.name}</h1>

      {currentEx.notes && (
        <p className="text-sm text-muted-foreground bg-card/60 backdrop-blur border border-border p-3 rounded-lg mt-3">
          {currentEx.notes}
        </p>
      )}

      {/* Hero number — reps / duration */}
      <div className="flex items-end justify-center gap-4 my-10">
        {currentEx.reps !== null && (
          <>
            <NumberPunch
              value={currentEx.reps}
              tone="energy"
              className="text-hero leading-none"
            />
            <span className="text-lg text-muted-foreground pb-3 uppercase tracking-wider">{copy.allenamentoSessione.repsUnit}</span>
          </>
        )}
        {currentEx.reps === null && currentEx.durationSeconds !== null && (
          <>
            <NumberPunch
              value={currentEx.durationSeconds}
              unit="s"
              tone="energy"
              className="text-hero leading-none"
            />
          </>
        )}
      </div>

      {/* Set progress dots — GIGANTI */}
      <div className="flex gap-3 justify-center mb-8 flex-wrap">
        {Array.from({ length: currentEx.sets }, (_, i) => {
          const key = `${currentExIndex}-${i + 1}`;
          const done = !!completedSets[key];
          const isCurrent = i + 1 === currentSet;
          return (
            <motion.div
              key={i}
              initial={false}
              animate={done ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
              aria-label={copy.allenamentoSessione.setDotAria(i + 1, done)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center font-display text-lg transition-all",
                done && "bg-energy-warm text-background shadow-[0_0_20px_-2px_var(--energy-warm)]",
                isCurrent && !done && "border-2 border-energy-cool text-energy-cool",
                !done && !isCurrent && "bg-secondary/60 text-muted-foreground",
              )}
            >
              {done ? <CheckCircle className="w-6 h-6" /> : i + 1}
            </motion.div>
          );
        })}
      </div>

      {/* Serie attuale label */}
      <div className="text-center mb-6">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {copy.allenamentoSessione.seriesLabel(currentSet, currentEx.sets)}
        </span>
      </div>

      {/* CTA principale */}
      <motion.div whileTap={reduced ? undefined : { scale: 0.97 }} whileHover={reduced ? undefined : { y: -2 }}>
        <Button
          size="lg"
          onClick={onCompleteSet}
          className="w-full h-16 text-base gap-3 gradient-energy text-background hover:opacity-90 font-display tracking-wide"
        >
          <CheckCircle className="w-6 h-6" />
          {copy.allenamentoSessione.setCompleted}
          <ChevronRight className="w-6 h-6" />
        </Button>
      </motion.div>

      {/* Upcoming */}
      {currentExIndex < exercises.length - 1 && (
        <div className="mt-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">{copy.allenamentoSessione.upcoming}</p>
          <div className="space-y-2">
            {exercises.slice(currentExIndex + 1, currentExIndex + 3).map((ex) => (
              <div key={ex.id} className="flex items-center gap-3 p-3 rounded-lg bg-card/40 backdrop-blur border border-border text-sm">
                <Flame className="w-4 h-4 text-energy-warm shrink-0" />
                <span className="text-foreground">{ex.name}</span>
                <span className="ml-auto text-muted-foreground text-xs">
                  {ex.sets}×{ex.reps ?? `${ex.durationSeconds}s`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
