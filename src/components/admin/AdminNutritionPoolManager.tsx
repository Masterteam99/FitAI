"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { copy } from "@/content/copy";

interface Item {
  id: string;
  name: string;
  description: string;
  dietType: string;
  targetGoal: keyof typeof copy.adminNutritionPool.goals;
  createdAt: string;
}

const c = copy.adminNutritionPool;
const GOAL_KEYS = Object.keys(c.goals) as (keyof typeof c.goals)[];

export function AdminNutritionPoolManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [showForm, setShowForm] = useState(false);

  async function remove(id: string) {
    await fetch(`/api/admin/nutrition-plans?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-4">
      <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
        <Plus className="w-4 h-4" />
        {c.newPlan}
      </Button>

      {showForm && <CreateForm onCreated={(it) => { setItems((prev) => [it, ...prev]); setShowForm(false); }} />}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{c.empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{i.name}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <Badge variant="secondary" className="text-xs">{i.dietType}</Badge>
                      <Badge variant="outline" className="text-xs">{c.goals[i.targetGoal] ?? i.targetGoal}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{i.description}</p>
                  </div>
                  <button onClick={() => remove(i.id)} aria-label={c.deleteAria} className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateForm({ onCreated }: { onCreated: (i: Item) => void }) {
  const [form, setForm] = useState({
    name: "", description: "", dietType: c.dietTypes[0] as string, targetGoal: GOAL_KEYS[0],
    rationale: "", weeklyPlanText: "", calories: "", protein: "", carbs: "", fat: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const canSubmit = form.name.trim().length >= 2 && form.description.trim().length >= 2
    && form.rationale.trim().length >= 2 && form.weeklyPlanText.trim().length >= 2;

  async function submit() {
    setSaving(true);
    setError(null);
    const num = (s: string) => (s.trim() === "" ? null : Number(s));
    const res = await fetch("/api/admin/nutrition-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        description: form.description.trim(),
        dietType: form.dietType,
        targetGoal: form.targetGoal,
        rationale: form.rationale.trim(),
        weeklyPlanText: form.weeklyPlanText.trim(),
        calories: num(form.calories),
        protein: num(form.protein),
        carbs: num(form.carbs),
        fat: num(form.fat),
      }),
    });
    setSaving(false);
    if (!res.ok) { setError(c.error); return; }
    const { id } = await res.json();
    onCreated({
      id, name: form.name.trim(), description: form.description.trim(),
      dietType: form.dietType, targetGoal: form.targetGoal, createdAt: new Date().toISOString(),
    });
  }

  const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <Card className="border-primary/30">
      <CardHeader><CardTitle className="text-base">{c.newPlan}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{c.nameLabel}</label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{c.descLabel}</label>
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={2000}
            className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{c.dietLabel}</label>
            <select value={form.dietType} onChange={(e) => set("dietType", e.target.value)} className={inputCls}>
              {c.dietTypes.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{c.goalLabel}</label>
            <select value={form.targetGoal} onChange={(e) => set("targetGoal", e.target.value as keyof typeof c.goals)} className={inputCls}>
              {GOAL_KEYS.map((g) => <option key={g} value={g}>{c.goals[g]}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1"><label className="text-xs text-muted-foreground">{c.caloriesLabel}</label><Input type="number" value={form.calories} onChange={(e) => set("calories", e.target.value)} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">{c.proteinLabel}</label><Input type="number" value={form.protein} onChange={(e) => set("protein", e.target.value)} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">{c.carbsLabel}</label><Input type="number" value={form.carbs} onChange={(e) => set("carbs", e.target.value)} /></div>
          <div className="space-y-1"><label className="text-xs text-muted-foreground">{c.fatLabel}</label><Input type="number" value={form.fat} onChange={(e) => set("fat", e.target.value)} /></div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{c.rationaleLabel}</label>
          <textarea value={form.rationale} onChange={(e) => set("rationale", e.target.value)} maxLength={2000}
            className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[60px]" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{c.weeklyLabel}</label>
          <textarea value={form.weeklyPlanText} onChange={(e) => set("weeklyPlanText", e.target.value)} placeholder={c.weeklyPlaceholder} maxLength={8000}
            className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]" />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={submit} disabled={saving || !canSubmit} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? c.creating : c.create}
        </Button>
      </CardContent>
    </Card>
  );
}
