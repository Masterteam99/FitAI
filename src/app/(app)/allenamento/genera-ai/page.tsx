"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ChevronRight, Loader2, Zap, CheckCircle, AlertTriangle } from "lucide-react";

const GOALS = [
  { value: "LOSE_WEIGHT", label: "Perdita di peso", emoji: "🔥" },
  { value: "BUILD_MUSCLE", label: "Aumento massa muscolare", emoji: "💪" },
  { value: "ATHLETIC_PERFORMANCE", label: "Performance atletica", emoji: "🏋️" },
  { value: "ENDURANCE", label: "Resistenza cardiovascolare", emoji: "🏃" },
  { value: "FLEXIBILITY", label: "Flessibilità e mobilità", emoji: "🧘" },
  { value: "GENERAL_FITNESS", label: "Forma fisica generale", emoji: "⚡" },
];

const LEVELS = [
  { value: "BEGINNER", label: "Principiante", desc: "< 6 mesi di allenamento" },
  { value: "INTERMEDIATE", label: "Intermedio", desc: "6 mesi — 2 anni" },
  { value: "ADVANCED", label: "Avanzato", desc: "2+ anni regolari" },
];

const EQUIPMENT_OPTIONS = [
  { value: "BARBELL", label: "Bilanciere" },
  { value: "DUMBBELLS", label: "Manubri" },
  { value: "MACHINE", label: "Macchinari palestra" },
  { value: "CABLES", label: "Cavi/Pulegge" },
  { value: "BODYWEIGHT", label: "Solo peso corporeo" },
  { value: "RESISTANCE_BANDS", label: "Elastici" },
  { value: "PULL_UP_BAR", label: "Sbarra trazioni" },
  { value: "BENCH", label: "Panca" },
];

const DAYS_OPTIONS = [2, 3, 4, 5, 6];

export default function GeneraAIPage() {
  const router = useRouter();
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [days, setDays] = useState(3);
  const [equipment, setEquipment] = useState<string[]>(["BARBELL", "DUMBBELLS", "MACHINE"]);
  const [notes, setNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState("");

  function toggleEquipment(val: string) {
    setEquipment((prev) => prev.includes(val) ? prev.filter((e) => e !== val) : [...prev, val]);
  }

  async function generate() {
    if (!goal || !level) return;
    setIsGenerating(true);
    setStreamText("");
    setError("");

    try {
      const res = await fetch("/api/ai/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, fitnessLevel: level, daysPerWeek: days, equipment, notes }),
      });

      if (!res.ok || !res.body) throw new Error("Errore generazione piano");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setStreamText(fullText);
      }

      // Parse the JSON plan from the streamed response
      const jsonMatch = fullText.match(/```json\n?([\s\S]*?)\n?```/);
      if (!jsonMatch) throw new Error("Formato piano non riconosciuto");

      const planData = JSON.parse(jsonMatch[1]);

      // Translation layer: Claude generates exerciseSlug; API expects exerciseId.
      // (rest/duration field names already match Prisma — restSeconds/durationSeconds.)
      const exRes = await fetch("/api/exercises?limit=100");
      if (!exRes.ok) throw new Error("Errore caricamento esercizi");
      const exerciseList: Array<{ id: string; slug: string }> = await exRes.json();
      const slugToId = new Map(exerciseList.map((e) => [e.slug, e.id]));

      const translatedDays = (planData.days ?? []).map((day: {
        dayNumber: number;
        name: string;
        restDay?: boolean;
        exercises?: Array<{
          exerciseSlug: string;
          sets: number;
          reps?: number;
          durationSeconds?: number | null;
          restSeconds?: number;
          notes?: string;
        }>;
      }) => ({
        dayNumber: day.dayNumber,
        name: day.name,
        restDay: day.restDay ?? false,
        exercises: (day.exercises ?? []).flatMap((ex, idx) => {
          const exerciseId = slugToId.get(ex.exerciseSlug);
          if (!exerciseId) {
            console.warn(`Slug non trovato nel DB: ${ex.exerciseSlug}`);
            return [];
          }
          return [{
            exerciseId,
            orderIndex: idx,
            sets: ex.sets,
            reps: ex.reps,
            durationSeconds: ex.durationSeconds ?? null,
            restSeconds: ex.restSeconds ?? 60,
            notes: ex.notes,
          }];
        }),
      }));

      const payload = {
        name: planData.name,
        durationWeeks: planData.durationWeeks,
        workoutsPerWeek: planData.workoutsPerWeek,
        primaryGoal: goal,
        generatedByAI: true,
        setActive: true,
        days: translatedDays,
      };

      // Save the plan
      const saveRes = await fetch("/api/workout-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!saveRes.ok) throw new Error("Errore salvataggio piano");
      const saved = await saveRes.json();
      router.push(`/allenamento/${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
      setIsGenerating(false);
    }
  }

  const canGenerate = goal && level && equipment.length > 0;

  if (isGenerating) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-xl font-bold">Claude sta generando il tuo piano...</h2>
          <p className="text-muted-foreground text-sm">L&apos;AI sta creando un piano personalizzato per i tuoi obiettivi</p>
        </div>

        {streamText && (
          <Card>
            <CardContent className="p-4">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-96">{streamText}</pre>
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
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-7 h-7 text-primary" />
          Genera Piano con AI
        </h1>
        <p className="text-muted-foreground">Claude creerà un piano personalizzato in pochi secondi</p>
      </div>

      {/* Goal */}
      <Card>
        <CardHeader><CardTitle className="text-base">Qual è il tuo obiettivo principale?</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={`p-3 rounded-xl border text-left transition-all text-sm ${
                goal === g.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
              }`}
            >
              <span className="text-xl block mb-1">{g.emoji}</span>
              {g.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Level */}
      <Card>
        <CardHeader><CardTitle className="text-base">Qual è il tuo livello?</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLevel(l.value)}
              className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                level === l.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
              }`}
            >
              <div>
                <p className={`font-medium text-sm ${level === l.value ? "text-primary" : ""}`}>{l.label}</p>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </div>
              {level === l.value && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Days */}
      <Card>
        <CardHeader><CardTitle className="text-base">Quante volte a settimana?</CardTitle></CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {DAYS_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`w-12 h-12 rounded-xl border font-semibold transition-all ${
                days === d ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
              }`}
            >
              {d}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader><CardTitle className="text-base">Attrezzatura disponibile</CardTitle></CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          {EQUIPMENT_OPTIONS.map((e) => (
            <button
              key={e.value}
              onClick={() => toggleEquipment(e.value)}
              className={`px-3 py-2 rounded-full border text-sm transition-all ${
                equipment.includes(e.value) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"
              }`}
            >
              {e.label}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Note aggiuntive (opzionale)</CardTitle></CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Es: dolore alla spalla destra, preferisco non fare corsa, ho 45-60 minuti a sessione..."
            className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
            maxLength={500}
          />
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <Button
        size="lg"
        onClick={generate}
        disabled={!canGenerate}
        className="w-full gap-2"
      >
        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
        Genera piano personalizzato
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
