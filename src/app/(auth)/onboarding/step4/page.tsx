"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, ChevronLeft, AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { readOnboarding, clearOnboarding, type OnboardingState } from "../onboardingState";
import { SkipOnboardingButton } from "../SkipOnboardingButton";
import { OnboardingProgress } from "../OnboardingProgress";
import { copy } from "@/content/copy";
import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

// Claude può rispondere con JSON puro o dentro un fence ```json: estrazione robusta.
function extractPlanJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error(copy.onboardingStep4.errors.planFormat);
  return JSON.parse(candidate.slice(start, end + 1));
}

const GOAL_LABELS: Record<string, string> = copy.onboardingStep4.goalLabels;

const LEVEL_LABELS: Record<string, string> = copy.onboardingStep4.levelLabels;

const EQUIPMENT_LABELS: Record<string, string> = Object.fromEntries(
  copy.onboardingStep2.equipment.map((e) => [e.value, e.label])
);

export default function OnboardingStep4() {
  const c = useCopy().onboardingStep4;
  const router = useRouter();
  const [state, setState] = useState<OnboardingState | null>(null);
  const [busy, setBusy] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState(false);

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
    setQuotaExceeded(false);

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
      if (!profileRes.ok) throw new Error(copy.onboardingStep4.errors.profileSave);

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
      // Il profilo è già salvato (onboardingCompleted=true): se la generazione
      // fallisce per quota (402), l'utente può comunque proseguire alla dashboard.
      if (!planRes.ok) {
        const errBody = await planRes.json().catch(() => ({} as { error?: string }));
        if (planRes.status === 402) {
          setQuotaExceeded(true);
          setError(errBody.error || copy.onboardingStep4.errors.quotaExceeded);
          setBusy(false);
          return;
        }
        const detail = errBody.error ? ` — ${errBody.error}` : "";
        throw new Error(copy.onboardingStep4.errors.planGeneration(planRes.status, detail));
      }
      if (!planRes.body) throw new Error(copy.onboardingStep4.errors.planStreamEmpty);

      const reader = planRes.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setStreamText(fullText);
      }

      const planData = extractPlanJson(fullText) as {
        name: string; durationWeeks: number; workoutsPerWeek: number;
        days?: Array<{
          dayNumber: number; name: string; restDay?: boolean;
          exercises?: Array<{ exerciseSlug: string; sets: number; reps?: number; durationSeconds?: number | null; restSeconds?: number; notes?: string }>;
        }>;
      };

      // 3. Translate slugs → ids and save
      const exRes = await fetch("/api/exercises?limit=100");
      if (!exRes.ok) throw new Error(copy.onboardingStep4.errors.exercisesLoad);
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
      if (!saveRes.ok) throw new Error(copy.onboardingStep4.errors.planSave);

      clearOnboarding();
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.onboardingStep4.errors.unknown);
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
          <h2 className="text-xl font-bold"><EditableText path="onboardingStep4.busyTitle">{c.busyTitle}</EditableText></h2>
          <p className="text-muted-foreground text-sm"><EditableText path="onboardingStep4.busySubtitle">{c.busySubtitle}</EditableText></p>
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
        <OnboardingProgress current={4} />
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/15 mb-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold"><EditableText path="onboardingStep4.title">{c.title}</EditableText></h1>
          <p className="text-muted-foreground text-sm"><EditableText path="onboardingStep4.stepLabel">{c.stepLabel}</EditableText></p>
        </div>

        <Card>
          <CardContent className="p-5 space-y-3 text-sm">
            <Row label={c.rows.goal} value={GOAL_LABELS[state.primaryGoal!] ?? state.primaryGoal!} />
            <Row label={c.rows.level} value={LEVEL_LABELS[state.fitnessLevel!] ?? state.fitnessLevel!} />
            <Row label={c.rows.equipment} value={state.availableEquipment!.map((e) => EQUIPMENT_LABELS[e] ?? e).join(", ")} />
            <Row label={c.rows.age} value={`${state.age} ${c.rows.ageSuffix}`} />
            <Row label={c.rows.weight} value={`${state.weightKg} ${c.rows.weightSuffix}`} />
            <Row label={c.rows.height} value={`${state.heightCm} ${c.rows.heightSuffix}`} />
            <Row label={c.rows.workoutsPerWeek} value={String(state.weeklyWorkoutDays)} />
            {state.dietType && <Row label={c.rows.diet} value={state.dietType} />}
            {state.pastSports && state.pastSports.length > 0 && <Row label={c.rows.sports} value={state.pastSports.join(", ")} />}
            {state.pastInjuries && state.pastInjuries.length > 0 && <Row label={c.rows.injuries} value={state.pastInjuries.join(", ")} />}
          </CardContent>
        </Card>

        {error && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
            {quotaExceeded && (
              <Button size="lg" className="w-full gap-2" onClick={() => { clearOnboarding(); router.push("/dashboard"); }}>
                <EditableText path="onboardingStep4.continueToDashboard">{c.continueToDashboard}</EditableText>
              </Button>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/onboarding/step3")} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> <EditableText path="onboardingStep4.back">{c.back}</EditableText>
          </Button>
          <Button size="lg" onClick={finish} className="flex-1 gap-2">
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            {quotaExceeded
              ? <EditableText path="onboardingStep4.retry">{c.retry}</EditableText>
              : <EditableText path="onboardingStep4.generate">{c.generate}</EditableText>}
          </Button>
        </div>

        <div className="text-center">
          <SkipOnboardingButton />
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
