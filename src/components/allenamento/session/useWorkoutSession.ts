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

export interface SetLog {
  set: number;
  reps?: number;
  weightKg?: number;
}

export interface LastLoad {
  weightKg: number | null;
  reps: number | null;
  date: string | null;
}

export type SessionPhase = "exercise" | "rest" | "completed";

const MOTIVATIONAL_QUOTES = copy.allenamentoSessione.motivationalQuotes;

// Persistenza del progresso in sessionStorage: se l'utente esce per fare un'analisi video
// avanzata e torna, riprende da dove aveva lasciato invece di ricominciare la sessione da capo.
function storageKey(dayId: string) { return `motion-insight:workout-session:${dayId}`; }

interface PersistedProgress {
  sessionId: string;
  currentExIndex: number;
  currentSet: number;
  completedSets: Record<string, number>;
  setLogs: Record<string, SetLog[]>;
  startedAt: string;
}

function loadPersisted(dayId: string): PersistedProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(storageKey(dayId));
    return raw ? (JSON.parse(raw) as PersistedProgress) : null;
  } catch {
    return null;
  }
}

function savePersisted(dayId: string, data: PersistedProgress) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(storageKey(dayId), JSON.stringify(data));
  } catch {
    // storage pieno o non disponibile — non blocca la sessione
  }
}

function clearPersisted(dayId: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(storageKey(dayId));
}

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
  const [lastLoads, setLastLoads] = useState<Record<string, LastLoad>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date>(new Date());
  const completionFiredRef = useRef(false);
  // Log per-serie (exerciseId → serie registrate), inviato col PATCH finale
  const setLogsRef = useRef<Record<string, SetLog[]>>({});

  // Quote shuffled once per rest
  const currentQuote = useMemo(() => {
    return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restSecondsLeft === restTotal]);

  useEffect(() => {
    if (!dayId) return;
    const persisted = loadPersisted(dayId);

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
        // Ultimi carichi registrati per il prefill degli input (best-effort)
        const ids = exs.map((e) => e.id).join(",");
        fetch(`/api/me/last-loads?exerciseIds=${ids}`)
          .then((r) => (r.ok ? r.json() : {}))
          .then(setLastLoads)
          .catch(() => {});

        // Se l'utente è uscito per un'analisi avanzata ed è tornato, riprendiamo la stessa
        // WorkoutSession invece di crearne una nuova e perdere il progresso fatto finora.
        if (persisted) {
          setSessionId(persisted.sessionId);
          setCurrentExIndex(persisted.currentExIndex);
          setCurrentSet(persisted.currentSet);
          setCompletedSets(persisted.completedSets);
          setLogsRef.current = persisted.setLogs;
          startTimeRef.current = new Date(persisted.startedAt);
          return null;
        }

        return fetch("/api/workout-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, planDayId: dayId }),
        });
      })
      .then((r) => r?.json())
      .then((s) => {
        if (s?.id) {
          setSessionId(s.id);
          savePersisted(dayId, {
            sessionId: s.id,
            currentExIndex: 0,
            currentSet: 1,
            completedSets: {},
            setLogs: {},
            startedAt: startTimeRef.current.toISOString(),
          });
        }
      })
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

  const completeSet = useCallback((log?: { weightKg?: number; reps?: number }) => {
    const ex = exercises[currentExIndex];
    if (!ex) return;

    const key = `${currentExIndex}-${currentSet}`;
    setCompletedSets((prev) => ({ ...prev, [key]: 1 }));

    // Registra la serie (carico/reps opzionali; le reps di default sono quelle del piano)
    const logs = setLogsRef.current;
    logs[ex.id] = [
      ...(logs[ex.id] ?? []),
      { set: currentSet, reps: log?.reps ?? ex.reps ?? undefined, weightKg: log?.weightKg },
    ];

    const isLastSet = currentSet >= ex.sets;
    const isLastExercise = currentExIndex >= exercises.length - 1;
    const newCompletedSets = { ...completedSets, [key]: 1 };

    if (isLastSet && isLastExercise) {
      setPhase("completed");
      if (sessionId) {
        const totalSeconds = Math.round((Date.now() - startTimeRef.current.getTime()) / 1000);
        fetch(`/api/workout-sessions`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: sessionId, status: "COMPLETED", totalSeconds, completedSets: setLogsRef.current }),
        });
      }
      if (dayId) clearPersisted(dayId);
    } else if (isLastSet) {
      const nextIndex = currentExIndex + 1;
      setCurrentExIndex(nextIndex);
      setCurrentSet(1);
      startRest(ex.restSeconds ?? 60);
      if (dayId && sessionId) {
        savePersisted(dayId, { sessionId, currentExIndex: nextIndex, currentSet: 1, completedSets: newCompletedSets, setLogs: setLogsRef.current, startedAt: startTimeRef.current.toISOString() });
      }
    } else {
      const nextSet = currentSet + 1;
      setCurrentSet(nextSet);
      startRest(ex.restSeconds ?? 60);
      if (dayId && sessionId) {
        savePersisted(dayId, { sessionId, currentExIndex, currentSet: nextSet, completedSets: newCompletedSets, setLogs: setLogsRef.current, startedAt: startTimeRef.current.toISOString() });
      }
    }
  }, [exercises, currentExIndex, currentSet, sessionId, startRest, dayId, completedSets]);

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
    sessionId,
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
  };
}
