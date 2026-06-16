"use client";

import { Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { GradientMesh } from "@/components/visualizations/GradientMesh";
import { useWorkoutSession } from "@/components/allenamento/session/useWorkoutSession";
import { SessionTopBar } from "@/components/allenamento/session/SessionTopBar";
import { RestView } from "@/components/allenamento/session/RestView";
import { ExerciseView } from "@/components/allenamento/session/ExerciseView";
import { CompletedView } from "@/components/allenamento/session/CompletedView";
import { copy } from "@/content/copy";

function WorkoutSessionContent() {
  const { id: planId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const dayId = searchParams.get("day");

  const {
    exercises,
    loading,
    error,
    currentExIndex,
    currentSet,
    phase,
    completedSets,
    restSecondsLeft,
    restTotal,
    isPaused,
    setIsPaused,
    currentQuote,
    completeSet,
    skipRest,
    startTimeRef,
    lastLoads,
  } = useWorkoutSession(planId, dayId);

  if (loading) {
    return (
      <div className="relative h-screen flex items-center justify-center">
        <GradientMesh palette="cool" intensity="low" />
        <Loader2 className="w-12 h-12 animate-spin text-primary relative" />
      </div>
    );
  }

  if (error || !exercises.length) {
    return (
      <div className="relative h-screen flex items-center justify-center">
        <GradientMesh palette="warm" intensity="low" />
        <div className="text-center space-y-4 relative">
          <p className="text-muted-foreground">{error ?? copy.allenamentoSessione.noExercisesError}</p>
          <Link href={`/allenamento/${planId}`}><Button>{copy.allenamentoSessione.backToPlan}</Button></Link>
        </div>
      </div>
    );
  }

  if (phase === "completed") {
    const durationMin = Math.round((Date.now() - startTimeRef.current.getTime()) / 60000);
    return <CompletedView planId={planId} exercises={exercises} durationMin={durationMin} />;
  }

  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = Object.keys(completedSets).length;
  const progressPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
  const palette = phase === "rest" ? "cool" : "warm";

  return (
    <div className="relative min-h-screen">
      <GradientMesh palette={palette} intensity="medium" fixed />

      <SessionTopBar planId={planId} currentIndex={currentExIndex} total={exercises.length} progressPct={progressPct} />

      <div className="relative z-10 px-4 lg:px-6 pb-6">
        <AnimatePresence mode="wait">
          {phase === "rest" && (
            <RestView
              key="rest"
              restSecondsLeft={restSecondsLeft}
              restTotal={restTotal}
              isPaused={isPaused}
              quote={currentQuote}
              onTogglePause={() => setIsPaused((p) => !p)}
              onSkip={skipRest}
            />
          )}

          {phase === "exercise" && (
            <ExerciseView
              key={`ex-${currentExIndex}`}
              exercises={exercises}
              currentExIndex={currentExIndex}
              currentSet={currentSet}
              completedSets={completedSets}
              lastLoad={lastLoads[exercises[currentExIndex]?.id ?? ""]}
              onCompleteSet={completeSet}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SessionePage() {
  return (
    <Suspense fallback={
      <div className="relative h-screen flex items-center justify-center">
        <GradientMesh palette="cool" intensity="low" />
        <Loader2 className="w-12 h-12 animate-spin text-primary relative" />
      </div>
    }>
      <WorkoutSessionContent />
    </Suspense>
  );
}
