"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertTriangle, ChefHat } from "lucide-react";

const GOALS = [
  { value: "LOSE_WEIGHT", label: "Perdita di peso" },
  { value: "BUILD_MUSCLE", label: "Aumento massa" },
  { value: "ENDURANCE", label: "Resistenza" },
  { value: "FLEXIBILITY", label: "Flessibilità" },
  { value: "GENERAL_FITNESS", label: "Forma generale" },
  { value: "ATHLETIC_PERFORMANCE", label: "Performance atletica" },
];

const DIETS = ["onnivora", "vegetariana", "vegana", "chetogenica", "mediterranea"];

const ACTIVITY = [
  { value: "sedentario", label: "Sedentario" },
  { value: "leggero", label: "Leggero" },
  { value: "moderato", label: "Moderato" },
  { value: "intenso", label: "Intenso" },
];

const DAYS = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
const DAY_LABELS: Record<string, string> = {
  lunedi: "Lunedì", martedi: "Martedì", mercoledi: "Mercoledì", giovedi: "Giovedì",
  venerdi: "Venerdì", sabato: "Sabato", domenica: "Domenica",
};

interface Meal {
  name: string;
  ingredients?: Array<{ food: string; quantityG: number }>;
  preparationNotes?: string;
  estimatedKcal?: number;
  estimatedProteinG?: number;
  estimatedCarbsG?: number;
  estimatedFatG?: number;
}

interface DayPlan {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  snacks?: Meal[];
}

interface NutritionPlan {
  name: string;
  description?: string;
  dietType?: string;
  targetGoal?: string;
  targetMacros?: { kcal: number; proteinG: number; carbsG: number; fatG: number };
  weeklyPlan?: Record<string, DayPlan>;
  rationale?: string;
}

const MEAL_ORDER: Array<{ key: keyof DayPlan; label: string }> = [
  { key: "breakfast", label: "Colazione" },
  { key: "lunch", label: "Pranzo" },
  { key: "dinner", label: "Cena" },
];

function MealRow({ label, meal }: { label: string; meal: Meal }) {
  return (
    <div className="rounded-lg bg-secondary/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
        {meal.estimatedKcal != null && (
          <Badge variant="secondary" className="text-xs">{meal.estimatedKcal} kcal</Badge>
        )}
      </div>
      <p className="text-sm font-medium mt-1">{meal.name}</p>
      {meal.ingredients && meal.ingredients.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {meal.ingredients.map((i) => `${i.food} ${i.quantityG}g`).join(" · ")}
        </p>
      )}
      {(meal.estimatedProteinG != null || meal.estimatedCarbsG != null || meal.estimatedFatG != null) && (
        <p className="text-xs text-muted-foreground mt-1">
          P:{meal.estimatedProteinG ?? 0}g C:{meal.estimatedCarbsG ?? 0}g G:{meal.estimatedFatG ?? 0}g
        </p>
      )}
    </div>
  );
}

export function AiNutritionPlan() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [form, setForm] = useState({
    weightKg: "", heightCm: "", age: "", gender: "M",
    activityLevel: "moderato", dietType: "onnivora", targetGoal: "GENERAL_FITNESS",
  });

  // Prefill da profilo utente quando si apre il form
  useEffect(() => {
    if (!open) return;
    fetch("/api/profilo")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (!p) return;
        setForm((f) => ({
          ...f,
          weightKg: p.weightKg != null ? String(p.weightKg) : f.weightKg,
          heightCm: p.heightCm != null ? String(p.heightCm) : f.heightCm,
          age: p.age != null ? String(p.age) : f.age,
          targetGoal: p.primaryGoal ?? f.targetGoal,
        }));
      })
      .catch(() => {});
  }, [open]);

  const canGenerate = form.weightKg && form.heightCm && form.age;

  async function generate() {
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    setQuotaExceeded(false);
    try {
      const res = await fetch("/api/ai/generate-nutrition-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weightKg: Number(form.weightKg),
          heightCm: Number(form.heightCm),
          age: Number(form.age),
          gender: form.gender,
          activityLevel: form.activityLevel,
          dietType: form.dietType,
          targetGoal: form.targetGoal,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({} as { error?: string }));
        if (res.status === 402) {
          setQuotaExceeded(true);
          setError(body.error || "Hai esaurito il piano nutrizionale AI di questo mese.");
        } else if (res.status === 429) {
          setError(body.error || "Troppe richieste. Riprova tra un minuto.");
        } else {
          setError(body.error || "Errore generazione piano nutrizionale");
        }
        return;
      }

      const data = await res.json();
      setPlan(data.plan as NutritionPlan);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {!open && !plan && (
        <Card className="border-dashed border-2 border-primary/30">
          <CardContent className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
              <ChefHat className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-medium">Piano alimentare settimanale con AI</p>
              <p className="text-sm text-muted-foreground">Claude crea un menù bilanciato su misura per i tuoi obiettivi</p>
            </div>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Sparkles className="w-4 h-4" /> Genera con AI
            </Button>
          </CardContent>
        </Card>
      )}

      {open && (
        <Card className="border-primary/30">
          <CardHeader><CardTitle className="text-base">Genera piano alimentare AI</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="Peso (kg) *" type="number" value={form.weightKg} onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))} />
              <Input placeholder="Altezza (cm) *" type="number" value={form.heightCm} onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))} />
              <Input placeholder="Età *" type="number" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))} className="w-full bg-secondary border border-border rounded-lg p-2 text-sm">
                <option value="M">Uomo</option>
                <option value="F">Donna</option>
              </select>
              <select value={form.activityLevel} onChange={(e) => setForm((f) => ({ ...f, activityLevel: e.target.value }))} className="w-full bg-secondary border border-border rounded-lg p-2 text-sm">
                {ACTIVITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <select value={form.dietType} onChange={(e) => setForm((f) => ({ ...f, dietType: e.target.value }))} className="w-full bg-secondary border border-border rounded-lg p-2 text-sm">
                {DIETS.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
              <select value={form.targetGoal} onChange={(e) => setForm((f) => ({ ...f, targetGoal: e.target.value }))} className="w-full bg-secondary border border-border rounded-lg p-2 text-sm">
                {GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>

            {error && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
                {quotaExceeded && (
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/abbonamento">Passa a Premium</Link>
                  </Button>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={generate} disabled={loading || !canGenerate} className="flex-1 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? "Generazione in corso..." : "Genera piano"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Annulla</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {plan && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> {plan.name}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => { setPlan(null); setOpen(true); }}>Rigenera</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
              {plan.targetMacros && (
                <div className="flex gap-2 flex-wrap text-xs">
                  <Badge variant="secondary">{plan.targetMacros.kcal} kcal/g</Badge>
                  <Badge variant="secondary">P {plan.targetMacros.proteinG}g</Badge>
                  <Badge variant="secondary">C {plan.targetMacros.carbsG}g</Badge>
                  <Badge variant="secondary">G {plan.targetMacros.fatG}g</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {plan.weeklyPlan && DAYS.filter((d) => plan.weeklyPlan?.[d]).map((d) => {
            const day = plan.weeklyPlan![d];
            return (
              <Card key={d}>
                <CardHeader className="pb-2"><CardTitle className="text-sm">{DAY_LABELS[d]}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {MEAL_ORDER.map(({ key, label }) => {
                    const meal = day[key] as Meal | undefined;
                    return meal ? <MealRow key={key} label={label} meal={meal} /> : null;
                  })}
                  {day.snacks?.map((snack, i) => <MealRow key={`snack-${i}`} label="Spuntino" meal={snack} />)}
                </CardContent>
              </Card>
            );
          })}

          {plan.rationale && (
            <Card className="bg-secondary/30">
              <CardContent className="py-3">
                <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground">Logica nutrizionale:</span> {plan.rationale}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
