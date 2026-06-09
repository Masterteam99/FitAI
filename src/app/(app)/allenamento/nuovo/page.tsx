"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, Trash2, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { copy } from "@/content/copy";

interface ExerciseOption {
  id: string;
  name: string;
  slug: string;
  muscleGroupPrimary: string;
}

interface DayDraft {
  name: string;
  restDay: boolean;
  exercises: { exerciseId: string; sets: number; reps: number; restSeconds: number }[];
}

const GOALS = copy.allenamentoNuovo.goals;

export default function NuovoPianoPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(4);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(3);
  const [primaryGoal, setPrimaryGoal] = useState<typeof GOALS[number]["value"]>("GENERAL_FITNESS");
  const [days, setDays] = useState<DayDraft[]>([
    { name: copy.allenamentoNuovo.dayNameDefault(1), restDay: false, exercises: [] },
  ]);

  useEffect(() => {
    fetch("/api/exercises?limit=100")
      .then((r) => r.json())
      .then((d: ExerciseOption[]) => setExercises(d))
      .finally(() => setLoading(false));
  }, []);

  function updateDay(idx: number, patch: Partial<DayDraft>) {
    setDays((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  }

  function addDay() {
    setDays((prev) => [...prev, { name: copy.allenamentoNuovo.dayNameDefault(prev.length + 1), restDay: false, exercises: [] }]);
  }

  function removeDay(idx: number) {
    setDays((prev) => prev.filter((_, i) => i !== idx));
  }

  function addExerciseToDay(dayIdx: number, exerciseId: string) {
    setDays((prev) => prev.map((d, i) =>
      i === dayIdx ? { ...d, exercises: [...d.exercises, { exerciseId, sets: 3, reps: 10, restSeconds: 60 }] } : d
    ));
  }

  function updateExercise(dayIdx: number, exIdx: number, patch: Partial<DayDraft["exercises"][number]>) {
    setDays((prev) => prev.map((d, i) =>
      i === dayIdx ? { ...d, exercises: d.exercises.map((ex, j) => j === exIdx ? { ...ex, ...patch } : ex) } : d
    ));
  }

  function removeExercise(dayIdx: number, exIdx: number) {
    setDays((prev) => prev.map((d, i) =>
      i === dayIdx ? { ...d, exercises: d.exercises.filter((_, j) => j !== exIdx) } : d
    ));
  }

  const valid =
    name.trim().length >= 2 &&
    durationWeeks >= 1 && durationWeeks <= 52 &&
    workoutsPerWeek >= 1 && workoutsPerWeek <= 7 &&
    days.length >= 1 &&
    days.every((d) => d.restDay || d.exercises.length > 0);

  async function save() {
    if (!valid) return;
    setSaving(true);
    setError(null);
    const payload = {
      name: name.trim(),
      durationWeeks,
      workoutsPerWeek,
      primaryGoal,
      generatedByAI: false,
      setActive: true,
      days: days.map((d, idx) => ({
        dayNumber: idx + 1,
        name: d.name,
        restDay: d.restDay,
        exercises: d.exercises.map((ex, i) => ({ ...ex, orderIndex: i })),
      })),
    };
    const res = await fetch("/api/workout-plans", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(typeof body.error === "string" ? body.error : copy.allenamentoNuovo.saveError);
      setSaving(false);
      return;
    }
    const saved = await res.json();
    router.push(`/allenamento/${saved.id}`);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/allenamento" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> {copy.allenamentoNuovo.backToPlans}
      </Link>

      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Dumbbell className="w-7 h-7 text-primary" />
          {copy.allenamentoNuovo.title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {copy.allenamentoNuovo.subtitlePre}<Link href="/allenamento/genera-ai" className="text-primary hover:underline">{copy.allenamentoNuovo.subtitleLink}</Link>{copy.allenamentoNuovo.subtitlePost}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">{copy.allenamentoNuovo.detailsTitle}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{copy.allenamentoNuovo.nameLabel}</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={copy.allenamentoNuovo.namePlaceholder} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{copy.allenamentoNuovo.weeksLabel}</label>
              <Input type="number" min={1} max={52} value={durationWeeks} onChange={(e) => setDurationWeeks(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{copy.allenamentoNuovo.daysPerWeekLabel}</label>
              <Input type="number" min={1} max={7} value={workoutsPerWeek} onChange={(e) => setWorkoutsPerWeek(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{copy.allenamentoNuovo.goalLabel}</label>
              <select
                value={primaryGoal}
                onChange={(e) => setPrimaryGoal(e.target.value as typeof GOALS[number]["value"])}
                className="flex h-10 w-full rounded-lg border border-input bg-input px-3 py-2 text-sm"
              >
                {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{copy.allenamentoNuovo.daysSectionTitle}</h2>
          <Button variant="outline" size="sm" onClick={addDay} className="gap-2">
            <Plus className="w-4 h-4" /> {copy.allenamentoNuovo.addDay}
          </Button>
        </div>

        {days.map((day, dayIdx) => (
          <Card key={dayIdx}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Input
                  value={day.name}
                  onChange={(e) => updateDay(dayIdx, { name: e.target.value })}
                  placeholder={copy.allenamentoNuovo.dayNamePlaceholder}
                  className="flex-1"
                />
                <Button
                  variant={day.restDay ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateDay(dayIdx, { restDay: !day.restDay, exercises: !day.restDay ? [] : day.exercises })}
                >
                  {copy.allenamentoNuovo.restDay}
                </Button>
                {days.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => removeDay(dayIdx)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            </CardHeader>
            {!day.restDay && (
              <CardContent className="space-y-3">
                {day.exercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{copy.allenamentoNuovo.noDayExercises}</p>
                ) : (
                  <div className="space-y-2">
                    {day.exercises.map((ex, exIdx) => {
                      const exDef = exercises.find((e) => e.id === ex.exerciseId);
                      return (
                        <div key={exIdx} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{exDef?.name ?? copy.allenamentoNuovo.unknownExercise}</p>
                            <Badge variant="secondary" className="text-xs mt-0.5">{exDef?.muscleGroupPrimary ?? ""}</Badge>
                          </div>
                          <Input type="number" min={1} max={20} value={ex.sets} onChange={(e) => updateExercise(dayIdx, exIdx, { sets: Number(e.target.value) })} className="w-16 text-center" aria-label="sets" />
                          <span className="text-xs text-muted-foreground">×</span>
                          <Input type="number" min={1} max={100} value={ex.reps} onChange={(e) => updateExercise(dayIdx, exIdx, { reps: Number(e.target.value) })} className="w-16 text-center" aria-label="reps" />
                          <span className="text-xs text-muted-foreground">{copy.allenamentoNuovo.repUnit}</span>
                          <Button variant="ghost" size="icon" onClick={() => removeExercise(dayIdx, exIdx)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <select
                  value=""
                  onChange={(e) => { if (e.target.value) { addExerciseToDay(dayIdx, e.target.value); e.target.value = ""; } }}
                  className="flex h-10 w-full rounded-lg border border-input bg-input px-3 py-2 text-sm"
                >
                  <option value="">{copy.allenamentoNuovo.addExercisePlaceholder}</option>
                  {exercises.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <div className="flex gap-2 sticky bottom-4 bg-background/95 py-3 -mx-4 px-4 border-t border-border lg:static lg:mx-0 lg:px-0 lg:border-0 lg:py-0">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/allenamento">{copy.allenamentoNuovo.cancel}</Link>
        </Button>
        <Button onClick={save} disabled={!valid || saving} className="flex-1 gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {copy.allenamentoNuovo.createPlan}
        </Button>
      </div>
    </div>
  );
}
