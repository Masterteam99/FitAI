"use client";

import { useEffect, useState, useCallback, useRef, Suspense, useMemo } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight, Loader2, Pause, Play, SkipForward, Trophy, X, Flame } from "lucide-react";
import Link from "next/link";
import { GradientMesh } from "@/components/visualizations/GradientMesh";
import { NumberPunch } from "@/components/motion/NumberPunch";
import { emitAchievement } from "@/components/celebration/AchievementUnlock";
import { cn } from "@/lib/utils";

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

const MOTIVATIONAL_QUOTES = [
  "Recupera, conquista.",
  "Il riposo costruisce il muscolo.",
  "Respira. Ricarica.",
  "La prossima serie è la tua.",
  "Focus sul prossimo rep.",
  "L'energia torna. Tienila pronta.",
  "Un set alla volta.",
  "Resta presente.",
  "Il muscolo cresce quando recuperi.",
  "Sei più forte di un minuto fa.",
];

function WorkoutSessionContent() {
  const { id: planId } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dayId = searchParams.get("day");
  const reduced = useReducedMotion();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<"exercise" | "rest" | "completed">("exercise");
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
          name: "Sessione completata",
          points: 25,
          rarity: "UNCOMMON",
        });
      }, 700);
    }
  }, [phase]);

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
          <p className="text-muted-foreground">{error ?? "Nessun esercizio per questo giorno."}</p>
          <Link href={`/allenamento/${planId}`}><Button>Torna al piano</Button></Link>
        </div>
      </div>
    );
  }

  // === COMPLETED PHASE ===
  if (phase === "completed") {
    const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
    const durationMin = Math.round((Date.now() - startTimeRef.current.getTime()) / 60000);
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
            <p className="text-[10px] uppercase tracking-[0.3em] text-energy-warm">Sessione completata</p>
            <h1 className="text-display-lg text-foreground">Ottimo lavoro 💪</h1>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Durata</div>
              <div className="font-display text-3xl">
                <NumberPunch value={durationMin} unit="m" />
              </div>
            </div>
            <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Esercizi</div>
              <div className="font-display text-3xl">
                <NumberPunch value={exercises.length} />
              </div>
            </div>
            <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Set tot.</div>
              <div className="font-display text-3xl">
                <NumberPunch value={totalSets} />
              </div>
            </div>
          </div>

          <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-4 max-w-md mx-auto">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Muscoli colpiti oggi</div>
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
                <ChevronRight className="w-5 h-5" /> Dashboard
              </Button>
            </Link>
            <Link href={`/allenamento/${planId}`}>
              <Button size="lg" variant="outline">Piano</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentEx = exercises[currentExIndex];
  const totalSets = exercises.reduce((a, e) => a + e.sets, 0);
  const doneSets = Object.keys(completedSets).length;
  const progressPct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
  const palette = phase === "rest" ? "cool" : "warm";
  const restCircumference = 2 * Math.PI * 90;
  const restProgress = restTotal > 0 ? restSecondsLeft / restTotal : 0;

  return (
    <div className="relative min-h-screen">
      <GradientMesh palette={palette} intensity="medium" fixed />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-4 lg:p-6">
        <Link href={`/allenamento/${planId}`}>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" /> Esci
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentExIndex + 1} / {exercises.length}
          </span>
          <div className="w-32 h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-energy"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-8">{progressPct}%</span>
        </div>
      </div>

      <div className="relative z-10 px-4 lg:px-6 pb-6">
        <AnimatePresence mode="wait">

          {/* === REST PHASE === */}
          {phase === "rest" && (
            <motion.div
              key="rest"
              initial={reduced ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col items-center justify-center min-h-[70vh]"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">Recupero</p>

              <div className="relative">
                <svg viewBox="0 0 200 200" className="w-64 h-64 -rotate-90">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="var(--secondary)" strokeWidth="6" />
                  <motion.circle
                    cx="100" cy="100" r="90"
                    fill="none"
                    stroke="var(--energy-cool)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={restCircumference}
                    style={{ strokeDashoffset: restCircumference * (1 - restProgress) }}
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
                    <span className="text-[10px] uppercase tracking-[0.3em] text-energy-warm mt-2">in pausa</span>
                  )}
                </div>
              </div>

              <p className="text-muted-foreground italic mt-8 text-center max-w-xs">{currentQuote}</p>

              <div className="flex items-center gap-3 mt-8">
                <Button variant="outline" size="lg" onClick={() => setIsPaused((p) => !p)} className="gap-2">
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? "Riprendi" : "Pausa"}
                </Button>
                <Button size="lg" onClick={skipRest} className="gap-2">
                  <SkipForward className="w-4 h-4" /> Salta
                </Button>
              </div>
            </motion.div>
          )}

          {/* === EXERCISE PHASE === */}
          {phase === "exercise" && currentEx && (
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
                    <span className="text-lg text-muted-foreground pb-3 uppercase tracking-wider">reps</span>
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
                  Serie {currentSet} di {currentEx.sets}
                </span>
              </div>

              {/* CTA principale */}
              <motion.div whileTap={reduced ? undefined : { scale: 0.97 }} whileHover={reduced ? undefined : { y: -2 }}>
                <Button
                  size="lg"
                  onClick={completeSet}
                  className="w-full h-16 text-base gap-3 gradient-energy text-background hover:opacity-90 font-display tracking-wide"
                >
                  <CheckCircle className="w-6 h-6" />
                  Serie completata
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </motion.div>

              {/* Upcoming */}
              {currentExIndex < exercises.length - 1 && (
                <div className="mt-10">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">Prossimi</p>
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
