"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { emitAchievement } from "@/components/celebration/AchievementUnlock";
import { copy } from "@/content/copy";

export interface Exercise {
  id: string;
  name: string;
  slug: string;
  muscleGroupPrimary: string;
  sets: number;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number;
  notes: string | null;
}

export type SessionPhase = "exercise" | "rest" | "completed";

const MOTIVATIONAL_QUOTES = copy.allenamentoSessione.motivationalQuotes;

export function useWorkoutSession(planId: string, dayId: string | null) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<SessionPhase>("exercise");
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [restTotal, setRestTotal] = useState(60);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date>(new Date());
  const completionFiredRef = useRef(false);

  // Quote shuffled once per rest
  const currentQuote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restSecondsLeft === restTotal]);

  useEffect(() => {
    if (!dayId) return;
    fetch(`/api/workout-plans/${planId}`)
      .then((r) => r.json())
      .then((plan) => {
        const day = plan.days?.find((d: { id: string }) => d.id === dayId);
        if (!day) throw new Error(copy.allenamentoSessione.dayNotFound);
        const exs: Exercise[] = day.exercises.map((e: {
          id: string; exercise: { id: string; name: string; slug: string; muscleGroupPrimary: string };
          sets: number; reps: number | null; durationSeconds: number | null; restSeconds: number; notes: string | null;
        }) => ({
          id: e.exercise.id,
          name: e.exercise.name,
          slug: e.exercise.slug,
          muscleGroupPrimary: e.exercise.muscleGroupPrimary,
          sets: e.sets,
          reps: e.reps,
          durationSeconds: e.durationSeconds,
          restSeconds: e.restSeconds,
          notes: e.notes,
        }));
        setExercises(exs);
        return fetch("/api/workout-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, planDayId: dayId }),
        });
      })
      .then((r) => r?.json())
      .then((s) => { if (s?.id) setSessionId(s.id); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [dayId, planId]);

  const startRest = useCallback((seconds: number) => {
    setPhase("rest");
    setRestTotal(seconds);
    setRestSecondsLeft(seconds);
  }, []);

  useEffect(() => {
    if (phase !== "rest" || isPaused) return;
    timerRef.current = setInterval(() => {
      setRestSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          setPhase("exercise");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, isPaused]);

  const completeSet = useCallback(() => {
    const ex = exercises[currentExIndex];
    if (!ex) return;

    const key = `${currentExIndex}-${currentSet}`;
    setCompletedSets((prev) => ({ ...prev, [key]: 1 }));

    const isLastSet = currentSet >= ex.sets;
    const isLastExercise = currentExIndex >= exercises.length - 1;

    if (isLastSet && isLastExercise) {
      setPhase("completed");
      if (sessionId) {
        const durationMinutes = Math.round((Date.now() - startTimeRef.current.getTime()) / 60000);
        fetch(`/api/workout-sessions`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sessionId, status: "COMPLETED", totalDuration: durationMinutes }),
        });
      }
    } else if (isLastSet) {
      setCurrentExIndex((i) => i + 1);
      setCurrentSet(1);
      startRest(ex.restSeconds ?? 60);
    } else {
      setCurrentSet((s) => s + 1);
      startRest(ex.restSeconds ?? 60);
    }
  }, [exercises, currentExIndex, currentSet, sessionId, startRest]);

  const skipRest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("exercise");
    setRestSecondsLeft(0);
  }, []);

  // Fire achievement once on completion
  useEffect(() => {
    if (phase === "completed" && !completionFiredRef.current) {
      completionFiredRef.current = true;
      setTimeout(() => {
        emitAchievement({
          icon: "💪",
          name: copy.allenamentoSessione.achievementName,
          points: 25,
          rarity: "UNCOMMON",
        });
      }, 700);
    }
  }, [phase]);

  return {
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
  };
}
