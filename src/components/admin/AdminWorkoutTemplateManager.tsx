"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Pencil, Save } from "lucide-react";
import { copy } from "@/content/copy";

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ATHLETE"];
const GOALS = ["LOSE_WEIGHT", "BUILD_MUSCLE", "ENDURANCE", "FLEXIBILITY", "GENERAL_FITNESS", "ATHLETIC_PERFORMANCE"];
const EQUIPMENT = ["NONE", "DUMBBELLS", "BARBELL", "MACHINE", "RESISTANCE_BANDS", "PULL_UP_BAR", "BENCH", "KETTLEBELL", "CABLES", "FULL_GYM"];

interface Item {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  targetGoals: string[];
  requiredEquipment: string[];
  durationWeeks: number;
  workoutsPerWeek: number;
  createdAt: string;
}

interface TemplateFull extends Omit<Item, "createdAt"> {
  rationale: string;
  daysJson: unknown;
}

const c = copy.adminWorkoutPool;
const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring";
const areaCls = "w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary";

export function AdminWorkoutTemplateManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{ id: string; data: TemplateFull } | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  async function remove(id: string) {
    await fetch(`/api/admin/workout-plans?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function startEdit(id: string) {
    setLoadingEditId(id);
    try {
      const res = await fetch(`/api/admin/workout-plans/${id}`);
      if (!res.ok) return;
      const { template } = await res.json();
      setShowForm(false);
      setEditing({ id, data: template as TemplateFull });
    } finally {
      setLoadingEditId(null);
    }
  }

  return (
    <div className="space-y-4">
      {!editing && (
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
          <Plus className="w-4 h-4" />
          {c.newTemplate}
        </Button>
      )}

      {showForm && !editing && (
        <TemplateForm onSaved={(it) => { setItems((prev) => [it, ...prev]); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      )}

      {editing && (
        <TemplateForm
          templateId={editing.id}
          initial={editing.data}
          onSaved={(it) => { setItems((prev) => prev.map((i) => (i.id === it.id ? { ...i, ...it } : i))); setEditing(null); }}
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
                      <Badge variant="secondary" className="text-xs">{i.difficulty}</Badge>
                      <Badge variant="outline" className="text-xs">{c.weeksBadge(i.durationWeeks, i.workoutsPerWeek)}</Badge>
                      {i.targetGoals.slice(0, 3).map((g) => <Badge key={g} variant="outline" className="text-xs">{g}</Badge>)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{i.description}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(i.id)} aria-label={c.editAria} disabled={loadingEditId === i.id} className="text-muted-foreground hover:text-foreground transition-colors p-1">
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

function TemplateForm({
  templateId,
  initial,
  onSaved,
  onCancel,
}: {
  templateId?: string;
  initial?: TemplateFull;
  onSaved: (i: Item) => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(templateId);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    difficulty: initial?.difficulty ?? LEVELS[0],
    durationWeeks: String(initial?.durationWeeks ?? 4),
    workoutsPerWeek: String(initial?.workoutsPerWeek ?? 3),
    rationale: initial?.rationale ?? "",
    daysText: initial?.daysJson ? JSON.stringify(initial.daysJson, null, 2) : "",
  });
  const [goals, setGoals] = useState<string[]>(initial?.targetGoals ?? []);
  const [equipment, setEquipment] = useState<string[]>(initial?.requiredEquipment ?? ["NONE"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }
  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  }

  const canSubmit = form.name.trim().length >= 2 && form.description.trim().length >= 2 && form.rationale.trim().length >= 2 && goals.length >= 1;

  async function submit() {
    setError(null);
    let daysJson: unknown = [];
    if (form.daysText.trim()) {
      try { daysJson = JSON.parse(form.daysText); }
      catch { setError(c.invalidJson); return; }
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      difficulty: form.difficulty,
      targetGoals: goals,
      requiredEquipment: equipment.length ? equipment : ["NONE"],
      durationWeeks: Number(form.durationWeeks) || 4,
      workoutsPerWeek: Number(form.workoutsPerWeek) || 3,
      rationale: form.rationale.trim(),
      daysJson,
    };
    const res = await fetch(isEdit ? `/api/admin/workout-plans/${templateId}` : "/api/admin/workout-plans", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { setError(c.error); return; }
    const body = await res.json();
    onSaved({
      id: isEdit ? (templateId as string) : body.id,
      name: payload.name,
      description: payload.description,
      difficulty: payload.difficulty,
      targetGoals: payload.targetGoals,
      requiredEquipment: payload.requiredEquipment,
      durationWeeks: payload.durationWeeks,
      workoutsPerWeek: payload.workoutsPerWeek,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <Card className="border-primary/30">
      <CardHeader><CardTitle className="text-base">{isEdit ? c.editTemplate : c.newTemplate}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Field label={c.nameLabel}><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label={c.descLabel}><textarea value={form.description} onChange={(e) => set("description", e.target.value)} className={`${areaCls} min-h-[60px]`} /></Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label={c.difficultyLabel}>
            <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} className={inputCls}>
              {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </Field>
          <Field label={c.weeksLabel}><Input type="number" min="1" max="52" value={form.durationWeeks} onChange={(e) => set("durationWeeks", e.target.value)} /></Field>
          <Field label={c.perWeekLabel}><Input type="number" min="1" max="7" value={form.workoutsPerWeek} onChange={(e) => set("workoutsPerWeek", e.target.value)} /></Field>
        </div>

        <Field label={c.goalsLabel}><ChipMulti options={GOALS} selected={goals} onToggle={(v) => toggle(goals, setGoals, v)} /></Field>
        <Field label={c.equipmentLabel}><ChipMulti options={EQUIPMENT} selected={equipment} onToggle={(v) => toggle(equipment, setEquipment, v)} /></Field>

        <Field label={c.rationaleLabel}><textarea value={form.rationale} onChange={(e) => set("rationale", e.target.value)} className={`${areaCls} min-h-[60px]`} /></Field>
        <Field label={c.daysLabel}>
          <textarea value={form.daysText} onChange={(e) => set("daysText", e.target.value)} placeholder={c.daysPlaceholder} className={`${areaCls} min-h-[120px] font-mono text-xs`} />
          <p className="text-[11px] text-muted-foreground mt-1">{c.daysHint}</p>
        </Field>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function ChipMulti({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button key={o} type="button" onClick={() => onToggle(o)} className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
            {o}
          </button>
        );
      })}
    </div>
  );
}
