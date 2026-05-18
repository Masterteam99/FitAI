"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ChevronLeft, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { readOnboarding, clearOnboarding, type OnboardingState } from "../onboardingState";

const GOAL_LABELS: Record<string, string> = {
  LOSE_WEIGHT: "Perdita di peso",
  BUILD_MUSCLE: "Aumento massa muscolare",
  ATHLETIC_PERFORMANCE: "Performance atletica",
  ENDURANCE: "Resistenza cardiovascolare",
  FLEXIBILITY: "Flessibilità e mobilità",
  GENERAL_FITNESS: "Forma fisica generale",
};

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzato",
  ATHLETE: "Atleta",
};

export default function OnboardingStep4() {
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [busy, setBusy] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const s = readOnboarding();
    if (!s.age || !s.primaryGoal || !s.fitnessLevel || !s.availableEquipment) {
      router.replace("/onboarding/step1");
      return;
    }
    setState(s);
  }, [router]);

  async function finish() {
    if (!state) return;
    setBusy(true);
    setError("");
    setStreamText("");

    try {
      // 1. Save profile
      const profileRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          primaryGoal: state.primaryGoal,
          fitnessLevel: state.fitnessLevel,
          availableEquipment: state.availableEquipment,
          age: state.age,
          weightKg: state.weightKg,
          heightCm: state.heightCm,
          gender: state.gender,
          weeklyWorkoutDays: state.weeklyWorkoutDays,
          dietType: state.dietType,
          pastInjuries: state.pastInjuries,
          pastSports: state.pastSports,
        }),
      });
      if (!profileRes.ok) throw new Error("Errore salvataggio profilo");

      // 2. Generate starter plan via streaming
      const planRes = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: state.primaryGoal,
          fitnessLevel: state.fitnessLevel,
          daysPerWeek: state.weeklyWorkoutDays,
          equipment: state.availableEquipment,
          dietType: state.dietType,
          pastInjuries: state.pastInjuries,
          pastSports: state.pastSports,
          notes: "",
        }),
      });
      if (!planRes.ok || !planRes.body) throw new Error("Errore generazione piano AI");

      const reader = planRes.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setStreamText(fullText);
      }

      const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/);
      if (!jsonMatch) throw new Error("Formato piano non riconosciuto");
      const planData = JSON.parse(jsonMatch[1]);

      // 3. Translate slugs → ids and save
      const exRes = await fetch("/api/exercises?limit=100");
      if (!exRes.ok) throw new Error("Errore caricamento esercizi");
      const exerciseList: Array<{ id: string; slug: string }> = await exRes.json();
      const slugToId = new Map(exerciseList.map((e) => [e.slug, e.id]));

      const days = (planData.days ?? []).map((day: {
        dayNumber: number; name: string; restDay?: boolean;
        exercises?: Array<{ exerciseSlug: string; sets: number; reps?: number; durationSeconds?: number | null; restSeconds?: number; notes?: string }>;
      }) => ({
        dayNumber: day.dayNumber,
        name: day.name,
        restDay: day.restDay ?? false,
        exercises: (day.exercises ?? []).flatMap((ex, idx) => {
          const exerciseId = slugToId.get(ex.exerciseSlug);
          if (!exerciseId) return [];
          return [{
            exerciseId, orderIndex: idx,
            sets: ex.sets, reps: ex.reps,
            durationSeconds: ex.durationSeconds ?? null,
            restSeconds: ex.restSeconds ?? 60,
            notes: ex.notes,
          }];
        }),
      }));

      const saveRes = await fetch("/api/workout-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: planData.name,
          durationWeeks: planData.durationWeeks,
          workoutsPerWeek: planData.workoutsPerWeek,
          primaryGoal: state.primaryGoal,
          generatedByAI: true,
          setActive: true,
          days,
        }),
      });
      if (!saveRes.ok) throw new Error("Errore salvataggio piano");

      clearOnboarding();
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
      setBusy(false);
    }
  }

  if (!state) return null;

  if (busy) {
    return (
      <div className="min-h-screen bg-background p-4 py-10">
        <div className="max-w-2xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-bold">Sto preparando il tuo piano…</h2>
          <p className="text-muted-foreground text-sm">Claude sta creando un piano personalizzato per te</p>
          {streamText && (
            <Card>
              <CardContent className="p-4">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-80 text-left">{streamText}</pre>
              </CardContent>
            </Card>
          )}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Tutto pronto</h1>
          <p className="text-muted-foreground text-sm">Step 4 di 4 — riepilogo e generazione piano AI</p>
        </div>

        <Card>
          <CardContent className="p-5 space-y-3 text-sm">
            <Row label="Obiettivo" value={GOAL_LABELS[state.primaryGoal!] ?? state.primaryGoal!} />
            <Row label="Livello" value={LEVEL_LABELS[state.fitnessLevel!] ?? state.fitnessLevel!} />
            <Row label="Attrezzatura" value={state.availableEquipment!.join(", ")} />
            <Row label="Età" value={`${state.age} anni`} />
            <Row label="Peso" value={`${state.weightKg} kg`} />
            <Row label="Altezza" value={`${state.heightCm} cm`} />
            <Row label="Allenamenti / settimana" value={String(state.weeklyWorkoutDays)} />
            {state.dietType && <Row label="Dieta" value={state.dietType} />}
            {state.pastSports && state.pastSports.length > 0 && <Row label="Sport" value={state.pastSports.join(", ")} />}
            {state.pastInjuries && state.pastInjuries.length > 0 && <Row label="Problematiche" value={state.pastInjuries.join(", ")} />}
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/onboarding/step3")} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Indietro
          </Button>
          <Button size="lg" onClick={finish} className="flex-1 gap-2">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            Genera piano e inizia
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
