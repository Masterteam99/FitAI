"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Pencil, Save } from "lucide-react";
import { copy } from "@/content/copy";

interface Item {
  id: string;
  name: string;
  description: string;
  dietType: string;
  targetGoal: keyof typeof copy.adminNutritionPool.goals;
  createdAt: string;
}

interface PlanFull {
  name: string;
  description: string;
  dietType: string;
  targetGoal: keyof typeof copy.adminNutritionPool.goals;
  rationale: string;
  weeklyPlanText: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
}

const c = copy.adminNutritionPool;
const GOAL_KEYS = Object.keys(c.goals) as (keyof typeof c.goals)[];

export function AdminNutritionPoolManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{ id: string; data: PlanFull } | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  async function remove(id: string) {
    await fetch(`/api/admin/nutrition-plans?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function startEdit(id: string) {
    setLoadingEditId(id);
    try {
      const res = await fetch(`/api/admin/nutrition-plans/${id}`);
      if (!res.ok) return;
      const { plan } = await res.json();
      setShowForm(false);
      setEditing({ id, data: plan as PlanFull });
    } finally {
      setLoadingEditId(null);
    }
  }

  return (
    <div className="space-y-4">
      {!editing && (
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
          <Plus className="w-4 h-4" />
          {c.newPlan}
        </Button>
      )}

      {showForm && !editing && (
        <PlanForm
          onSaved={(it) => { setItems((prev) => [it, ...prev]); setShowForm(false); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editing && (
        <PlanForm
          planId={editing.id}
          initial={editing.data}
          onSaved={(it) => {
            setItems((prev) => prev.map((i) => (i.id === it.id ? { ...i, ...it } : i)));
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}

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
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(i.id)}
                      aria-label={c.editAria}
                      disabled={loadingEditId === i.id}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {loadingEditId === i.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
                    </button>
                    <button onClick={() => remove(i.id)} aria-label={c.deleteAria} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanForm({
  planId,
  initial,
  onSaved,
  onCancel,
}: {
  planId?: string;
  initial?: PlanFull;
  onSaved: (i: Item) => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(planId);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    dietType: initial?.dietType ?? (c.dietTypes[0] as string),
    targetGoal: initial?.targetGoal ?? GOAL_KEYS[0],
    rationale: initial?.rationale ?? "",
    weeklyPlanText: initial?.weeklyPlanText ?? "",
    calories: initial?.calories != null ? String(initial.calories) : "",
    protein: initial?.protein != null ? String(initial.protein) : "",
    carbs: initial?.carbs != null ? String(initial.carbs) : "",
    fat: initial?.fat != null ? String(initial.fat) : "",
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
    const payload = {
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
    };
    const res = await fetch(isEdit ? `/api/admin/nutrition-plans/${planId}` : "/api/admin/nutrition-plans", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { setError(c.error); return; }
    const body = await res.json();
    onSaved({
      id: isEdit ? (planId as string) : body.id,
      name: payload.name,
      description: payload.description,
      dietType: payload.dietType,
      targetGoal: payload.targetGoal,
      createdAt: new Date().toISOString(),
    });
  }

  const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <Card className="border-primary/30">
      <CardHeader><CardTitle className="text-base">{isEdit ? c.editPlan : c.newPlan}</CardTitle></CardHeader>
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
        <div className="flex gap-2">
          <Button onClick={submit} disabled={saving || !canSubmit} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {saving ? (isEdit ? c.savingChanges : c.creating) : isEdit ? c.saveChanges : c.create}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={saving}>{c.cancel}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
