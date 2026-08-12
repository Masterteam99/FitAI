"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, ChevronRight, Flame, History, Camera } from "lucide-react";
import { NumberPunch } from "@/components/motion/NumberPunch";
import { cn } from "@/lib/utils";
import { copy } from "@/content/copy";
import type { Exercise, LastLoad } from "./useWorkoutSession";

export function ExerciseView({ exercises, currentExIndex, currentSet, completedSets, lastLoad, onCompleteSet }: {
  exercises: Exercise[];
  currentExIndex: number;
  currentSet: number;
  completedSets: Record<string, number>;
  lastLoad?: LastLoad;
  onCompleteSet: (log?: { weightKg?: number; reps?: number }) => void;
}) {
  const reduced = useReducedMotion();
  const currentEx = exercises[currentExIndex];
  // Prefill: ultimo carico registrato per questo esercizio (storico cross-sessione)
  const [weightInput, setWeightInput] = useState<string>(lastLoad?.weightKg != null ? String(lastLoad.weightKg) : "");
  const [repsInput, setRepsInput] = useState<string>(currentEx?.reps != null ? String(currentEx.reps) : "");
  const [analysisOn, setAnalysisOn] = useState(false);
  if (!currentEx) return null;

  function handleComplete() {
    const weightKg = weightInput.trim() === "" ? undefined : Number(weightInput.replace(",", "."));
    const reps = repsInput.trim() === "" ? undefined : Number(repsInput);
    onCompleteSet({
      weightKg: Number.isFinite(weightKg) ? weightKg : undefined,
      reps: Number.isFinite(reps) ? reps : undefined,
    });
  }

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

      {/* Toggle analisi avanzata (per esercizio) */}
      <div className="mt-4 flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => setAnalysisOn((v) => !v)}
          aria-pressed={analysisOn}
          className={cn(
            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
            analysisOn ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground",
          )}
        >
          <Camera className="w-3.5 h-3.5" />
          {copy.allenamentoSessione.analysisToggleLabel}
          <span className={cn("w-2 h-2 rounded-full", analysisOn ? "bg-primary" : "bg-muted-foreground/40")} />
        </button>
        <p className="text-[11px] text-muted-foreground text-center max-w-xs">{copy.allenamentoSessione.analysisToggleHint}</p>
      </div>

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
      <div className="text-center mb-4">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {copy.allenamentoSessione.seriesLabel(currentSet, currentEx.sets)}
        </span>
      </div>

      {/* Carico e ripetizioni della serie (opzionali) */}
      <div className="flex items-end justify-center gap-3 mb-6 flex-wrap">
        <div className="space-y-1">
          <label htmlFor="session-weight" className="block text-[10px] uppercase tracking-wider text-muted-foreground text-center">
            {copy.allenamentoSessione.weightLabel}
          </label>
          <input
            id="session-weight"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
            placeholder="—"
            className="w-24 h-12 text-center text-lg font-semibold rounded-xl border border-border bg-card/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="session-reps" className="block text-[10px] uppercase tracking-wider text-muted-foreground text-center">
            {copy.allenamentoSessione.repsLabel}
          </label>
          <input
            id="session-reps"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={repsInput}
            onChange={(e) => setRepsInput(e.target.value)}
            placeholder="—"
            className="w-20 h-12 text-center text-lg font-semibold rounded-xl border border-border bg-card/60 backdrop-blur focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        {lastLoad && lastLoad.weightKg != null && (
          <span className="inline-flex items-center gap-1.5 pb-3 text-xs text-muted-foreground">
            <History className="w-3.5 h-3.5" />
            {copy.allenamentoSessione.lastLoadHint(lastLoad.weightKg, lastLoad.reps)}
          </span>
        )}
      </div>

      {/* CTA principale */}
      <motion.div whileTap={reduced ? undefined : { scale: 0.97 }} whileHover={reduced ? undefined : { y: -2 }}>
        <Button
          size="lg"
          onClick={handleComplete}
          className="w-full h-16 text-base gap-3 gradient-energy text-background hover:opacity-90 font-display tracking-wide"
        >
          <CheckCircle className="w-6 h-6" />
          {copy.allenamentoSessione.setCompleted}
          <ChevronRight className="w-6 h-6" />
        </Button>
      </motion.div>

      {analysisOn && (
        <Link href={`/analisi/sessione?id=${currentEx.id}`} className="block mt-3">
          <Button variant="outline" size="lg" className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/5">
            <Camera className="w-5 h-5" />
            {copy.allenamentoSessione.analyzeCta}
          </Button>
        </Link>
      )}

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
