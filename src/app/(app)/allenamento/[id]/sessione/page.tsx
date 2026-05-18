"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, ChevronRight, Dumbbell, Loader2, Pause, Play, RotateCcw, Timer, Trophy } from "lucide-react";
import Link from "next/link";

interface Exercise {
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

interface SessionState {
  exercises: Exercise[];
  currentExIndex: number;
  currentSet: number;
  phase: "exercise" | "rest" | "completed";
  completedSets: Map<string, number>;
  restSecondsLeft: number;
  sessionId: string | null;
}

function WorkoutSessionContent() {
  const { id: planId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dayId = searchParams.get("day");

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<"exercise" | "rest" | "completed">("exercise");
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [restSecondsLeft, setRestSecondsLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date>(new Date());

  useEffect(() => {
    if (!dayId) return;
    fetch(`/api/workout-plans/${planId}`)
      .then((r) => r.json())
      .then((plan) => {
        const day = plan.days?.find((d: { id: string }) => d.id === dayId);
        if (!day) throw new Error("Giorno non trovato");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !exercises.length) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">{error ?? "Nessun esercizio per questo giorno."}</p>
        <Link href={`/allenamento/${planId}`}><Button>Torna al piano</Button></Link>
      </div>
    );
  }

  if (phase === "completed") {
    const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
    return (
      <div className="text-center py-16 space-y-6 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Sessione completata!</h2>
          <p className="text-muted-foreground mt-1">Ottimo lavoro — {exercises.length} esercizi, {totalSets} serie totali</p>
        </div>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/dashboard"><Button>Vai alla dashboard</Button></Link>
          <Link href={`/allenamento/${planId}`}><Button variant="outline">Torna al piano</Button></Link>
        </div>
      </div>
    );
  }

  const currentEx = exercises[currentExIndex];
  const progressPct = Math.round((Object.keys(completedSets).length / exercises.reduce((a, e) => a + e.sets, 0)) * 100);

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header progress */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Esercizio {currentExIndex + 1}/{exercises.length}</span>
        <span>{progressPct}% completato</span>
      </div>
      <Progress value={progressPct} className="h-2" />

      {/* Rest screen */}
      {phase === "rest" && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-12 text-center space-y-4">
            <Timer className="w-12 h-12 text-primary mx-auto" />
            <div>
              <div className="text-5xl font-bold tabular-nums">{restSecondsLeft}s</div>
              <p className="text-muted-foreground mt-1">Recupero in corso</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" onClick={() => setIsPaused((p) => !p)} className="gap-2">
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {isPaused ? "Riprendi" : "Pausa"}
              </Button>
              <Button onClick={skipRest}>Salta riposo</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise card */}
      {phase === "exercise" && currentEx && (
        <>
          <Card className="border-primary/30">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{currentEx.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">{currentEx.muscleGroupPrimary}</p>
                </div>
                <Link href={`/esercizi/${currentEx.slug}`} target="_blank">
                  <Button variant="ghost" size="sm" className="text-xs">Come si fa?</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                  Serie {currentSet} di {currentEx.sets}
                </span>
                <span className="bg-secondary px-3 py-1.5 rounded-full">
                  {currentEx.reps ? `${currentEx.reps} reps` : currentEx.durationSeconds ? `${currentEx.durationSeconds} secondi` : "Max reps"}
                </span>
                <span className="bg-secondary px-3 py-1.5 rounded-full text-muted-foreground">
                  Rest {currentEx.restSeconds}s
                </span>
              </div>

              {currentEx.notes && (
                <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">{currentEx.notes}</p>
              )}

              {/* Set progress dots */}
              <div className="flex gap-2">
                {Array.from({ length: currentEx.sets }, (_, i) => {
                  const key = `${currentExIndex}-${i + 1}`;
                  const done = !!completedSets[key];
                  const isCurrent = i + 1 === currentSet;
                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                        done ? "bg-primary text-primary-foreground" : isCurrent ? "border-2 border-primary text-primary" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                    </div>
                  );
                })}
              </div>

              <Button size="lg" onClick={completeSet} className="w-full gap-2">
                <CheckCircle className="w-5 h-5" />
                Serie completata
                <ChevronRight className="w-5 h-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming exercises */}
          {currentExIndex < exercises.length - 1 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Prossimi esercizi</p>
              <div className="space-y-2">
                {exercises.slice(currentExIndex + 1, currentExIndex + 3).map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40 text-sm">
                    <Dumbbell className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{ex.name}</span>
                    <span className="ml-auto text-muted-foreground text-xs">{ex.sets}×{ex.reps ?? `${ex.durationSeconds}s`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SessionePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <WorkoutSessionContent />
    </Suspense>
  );
}
