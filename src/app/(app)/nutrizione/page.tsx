"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Apple, Plus, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { AiNutritionPlan, type NutritionPlan } from "./AiNutritionPlan";
import { NutritionMatchCard } from "./NutritionMatchCard";
import { ProfessionalPlanCard, type ProfessionalDoc } from "./ProfessionalPlanCard";
import { RecipesCard } from "./RecipesCard";
import { FoodSearchAutocomplete, type SelectedFoodEntry } from "@/components/nutrizione/FoodSearchAutocomplete";
import { RadialGauge } from "@/components/wow";
import { RevisionRequestForm } from "@/components/RevisionRequestForm";
import { computeNutritionTargets, DEFAULT_TARGETS } from "@/lib/nutrition-targets";
import { copy } from "@/content/copy";

interface NutritionLog {
  id: string;
  mealType: string;
  foodName: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

interface Totals { calories: number; protein: number; carbs: number; fat: number }

const MEAL_LABELS: Record<string, string> = copy.nutrizione.mealLabels;

const MEAL_TYPES = Object.keys(MEAL_LABELS);

export default function NutrizionePage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [totals, setTotals] = useState<Totals>({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ mealType: "LUNCH" });
  const [foodEntry, setFoodEntry] = useState<SelectedFoodEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [targets, setTargets] = useState(DEFAULT_TARGETS);
  const [persistedPlan, setPersistedPlan] = useState<NutritionPlan | null | undefined>(undefined);
  const [professionalDoc, setProfessionalDoc] = useState<ProfessionalDoc | null | undefined>(undefined);
  const addFormRef = useRef<HTMLDivElement>(null);

  // Il form "nuovo alimento" appare più in basso nella pagina (sotto piano attivo,
  // calendario, gauge calorie): senza scroll sembra che il bottone "Aggiungi" non
  // faccia nulla, specialmente quando c'è un piano attivo che occupa molto spazio.
  useEffect(() => {
    if (showForm) addFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showForm]);

  useEffect(() => {
    fetch("/api/profilo")
      .then((r) => r.json())
      .then((d) => {
        setTargets(computeNutritionTargets({ weightKg: d.weightKg, heightCm: d.heightCm, age: d.age, goal: d.primaryGoal }));
        setPersistedPlan((d.nutritionPlanJson as NutritionPlan | null) ?? null);
      })
      .catch(() => setPersistedPlan(null));

    // Priorità massima: un piano caricato come documento da un professionista (Profilo → Documenti),
    // se già analizzato dall'AI, batte sia il piano generato dal quiz sia quello del pool.
    fetch("/api/documents")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items: Array<{ id: string; kind: string; name: string; url: string | null; analysis: ProfessionalDoc["analysis"] | null }> }) => {
        const doc = (d.items ?? []).find((it) => it.kind === "NUTRITION" && it.analysis);
        setProfessionalDoc(doc ? { id: doc.id, name: doc.name, url: doc.url, analysis: doc.analysis! } : null);
      })
      .catch(() => setProfessionalDoc(null));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/nutrition?date=${date}`)
      .then((r) => r.json())
      .then((d) => { setLogs(d.logs ?? []); setTotals(d.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }); })
      .finally(() => setLoading(false));
  }, [date]);

  async function addLog() {
    if (!foodEntry) return;
    setSaving(true);
    const res = await fetch("/api/nutrition", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        mealType: form.mealType,
        foodName: foodEntry.foodName,
        foodId: foodEntry.foodId,
        quantity: foodEntry.grams,
        unit: "g",
        calories: foodEntry.calories,
        proteinG: foodEntry.proteinG,
        carbsG: foodEntry.carbsG,
        fatG: foodEntry.fatG,
        fiberG: foodEntry.fiberG,
      }),
    });
    if (res.ok) {
      const newLog = await res.json();
      setLogs((prev) => [...prev, newLog]);
      setTotals((prev) => ({
        calories: prev.calories + newLog.calories,
        protein: prev.protein + newLog.proteinG,
        carbs: prev.carbs + newLog.carbsG,
        fat: prev.fat + newLog.fatG,
      }));
      setForm({ mealType: "LUNCH" });
      setFoodEntry(null);
      setShowForm(false);
    }
    setSaving(false);
  }

  async function deleteLog(id: string) {
    await fetch(`/api/nutrition?id=${id}`, { method: "DELETE" });
    const deleted = logs.find((l) => l.id === id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
    if (deleted) {
      setTotals((prev) => ({
        calories: prev.calories - deleted.calories,
        protein: prev.protein - deleted.proteinG,
        carbs: prev.carbs - deleted.carbsG,
        fat: prev.fat - deleted.fatG,
      }));
    }
  }

  const grouped = MEAL_TYPES.reduce((acc, mt) => {
    acc[mt] = logs.filter((l) => l.mealType === mt);
    return acc;
  }, {} as Record<string, NutritionLog[]>);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Apple className="w-7 h-7 text-primary" />
            {copy.nutrizione.title}
          </h1>
          <p className="text-muted-foreground">{copy.nutrizione.subtitle}</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
          <Plus className="w-4 h-4" />
          {copy.nutrizione.add}
        </Button>
      </div>

      {/* Piano attivo — priorità: 1) documento di un professionista caricato in Profilo (se analizzato),
          2) piano AI generato dal quiz, 3) piano consigliato dal pool. Solo uno resta visibile come
          "piano attivo", invece di mostrarli tutti sovrapposti senza gerarchia. */}
      {professionalDoc === undefined || persistedPlan === undefined ? null : professionalDoc ? (
        <ProfessionalPlanCard doc={professionalDoc} />
      ) : persistedPlan ? (
        <AiNutritionPlan initialPlan={persistedPlan} />
      ) : (
        <>
          <NutritionMatchCard />
          <AiNutritionPlan initialPlan={null} />
        </>
      )}

      {/* Date navigator */}
      <div className="flex items-center gap-3 justify-center">
        <Button variant="ghost" size="icon" aria-label={copy.nutrizione.prevDayAria} onClick={() => setDate(format(subDays(parseISO(date), 1), "yyyy-MM-dd"))}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="font-medium min-w-[160px] text-center">
          {format(parseISO(date), "EEEE d MMMM yyyy", { locale: it })}
        </span>
        <Button variant="ghost" size="icon" aria-label={copy.nutrizione.nextDayAria} onClick={() => setDate(format(addDays(parseISO(date), 1), "yyyy-MM-dd"))} disabled={date >= format(new Date(), "yyyy-MM-dd")}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calorie del giorno — gauge */}
      <Card>
        <CardContent className="p-5 flex items-center gap-5">
          <RadialGauge value={totals.calories} max={targets.calories} size={116} color="#3fae5a" label="kcal" />
          <div className="text-sm">
            <p className="font-medium">{copy.nutrizione.macros.calories}</p>
            <p className="text-muted-foreground mt-0.5">
              {totals.calories >= targets.calories
                ? "Obiettivo calorico giornaliero raggiunto."
                : `Mancano ${targets.calories - totals.calories} kcal all'obiettivo di oggi.`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Macro totals */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: copy.nutrizione.macros.calories, value: totals.calories, unit: copy.nutrizione.caloriesUnit, target: targets.calories, color: "text-primary" },
          { label: copy.nutrizione.macros.protein, value: Math.round(totals.protein), unit: copy.nutrizione.gramsUnit, target: targets.protein, color: "text-blue-400" },
          { label: copy.nutrizione.macros.carbs, value: Math.round(totals.carbs), unit: copy.nutrizione.gramsUnit, target: targets.carbs, color: "text-orange-400" },
          { label: copy.nutrizione.macros.fat, value: Math.round(totals.fat), unit: copy.nutrizione.gramsUnit, target: targets.fat, color: "text-yellow-400" },
        ].map((m) => {
          const pct = Math.min(Math.round((m.value / m.target) * 100), 100);
          return (
            <Card key={m.label}>
              <CardContent className="p-3 text-center">
                <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
                <div className="text-xs text-muted-foreground">{m.unit}</div>
                <div className="text-xs text-muted-foreground">{m.label}</div>
                <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{pct}%</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add form */}
      {showForm && (
        <Card ref={addFormRef} className="border-primary/30">
          <CardHeader><CardTitle className="text-base">{copy.nutrizione.newFoodTitle}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select
              value={form.mealType}
              onChange={(e) => setForm((f) => ({ ...f, mealType: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg p-2 text-sm"
            >
              {MEAL_TYPES.map((mt) => <option key={mt} value={mt}>{MEAL_LABELS[mt]}</option>)}
            </select>
            <FoodSearchAutocomplete onChange={setFoodEntry} />
            <div className="flex gap-2">
              <Button onClick={addLog} disabled={saving || !foodEntry} className="flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : copy.nutrizione.add}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>{copy.nutrizione.cancel}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meals */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {MEAL_TYPES.filter((mt) => grouped[mt]?.length > 0).map((mt) => (
            <Card key={mt}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{MEAL_LABELS[mt]}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {grouped[mt].reduce((a, l) => a + l.calories, 0)} {copy.nutrizione.caloriesUnit}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {grouped[mt].map((log) => (
                  <div key={log.id} className="flex items-center justify-between gap-3 text-sm p-2 rounded-lg bg-secondary/40">
                    <span className="flex-1 truncate">{log.foodName}</span>
                    <span className="text-muted-foreground text-xs shrink-0">{copy.nutrizione.macroSummary(log.proteinG, log.carbsG, log.fatG)}</span>
                    <span className="font-medium shrink-0">{log.calories} {copy.nutrizione.caloriesUnit}</span>
                    <button onClick={() => deleteLog(log.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {logs.length === 0 && (
            <Card className="border-dashed border-2">
              <CardContent className="py-10 text-center">
                <Apple className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">{copy.nutrizione.emptyDay}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <RecipesCard />

      <RevisionRequestForm type="NUTRITION" />
    </div>
  );
}
