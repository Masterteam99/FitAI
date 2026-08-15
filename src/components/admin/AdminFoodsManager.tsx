"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Pencil, Save } from "lucide-react";
import { FOOD_CATEGORIES } from "@/lib/admin/food-schema";
import { copy } from "@/content/copy";

const c = copy.adminFoods;

const nonNegNumStr = z.string().refine((s) => s.trim() !== "" && Number(s) >= 0, "Deve essere un numero non negativo");
const foodFormSchema = z.object({
  name: z.string().trim().min(2, "Minimo 2 caratteri").max(120, "Massimo 120 caratteri"),
  caloriesPer100g: nonNegNumStr,
  proteinPer100g: nonNegNumStr,
  carbsPer100g: nonNegNumStr,
  fatPer100g: nonNegNumStr,
  fiberPer100g: z.string().refine((s) => s.trim() === "" || Number(s) >= 0, "Deve essere un numero non negativo"),
});
type FoodFormFields = z.infer<typeof foodFormSchema>;
type FoodFieldErrors = Partial<Record<keyof FoodFormFields, string>>;

interface Item {
  id: string;
  name: string;
  category: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  source: string;
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring";

export function AdminFoodsManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, search]);

  async function remove(item: Item) {
    if (!confirm(c.confirmDelete(item.name))) return;
    await fetch(`/api/admin/foods?id=${item.id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input placeholder={c.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        {!editing && (
          <Button onClick={() => setShowForm((v) => !v)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            {c.newFood}
          </Button>
        )}
      </div>

      {showForm && !editing && (
        <FoodForm onSaved={(it) => { setItems((prev) => [it, ...prev]); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      )}
      {editing && (
        <FoodForm
          foodId={editing.id}
          initial={editing}
          onSaved={(it) => { setItems((prev) => prev.map((i) => (i.id === it.id ? it : i))); setEditing(null); }}
          onCancel={() => setEditing(null)}
        />
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{c.empty}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((i) => (
            <Card key={i.id}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm truncate">{i.name}</p>
                    <Badge variant="outline" className="text-xs shrink-0">{c.categories[i.category] ?? i.category}</Badge>
                    {i.source === "curated" && <Badge variant="secondary" className="text-xs shrink-0">seed</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(i.caloriesPer100g)} kcal · P {i.proteinPer100g}g · C {i.carbsPer100g}g · G {i.fatPer100g}g <span className="opacity-70">/100g</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => { setShowForm(false); setEditing(i); }} aria-label={c.editAria} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(i)} aria-label={c.deleteAria} className="text-muted-foreground hover:text-destructive transition-colors p-1">
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

function FoodForm({
  foodId,
  initial,
  onSaved,
  onCancel,
}: {
  foodId?: string;
  initial?: Item;
  onSaved: (i: Item) => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(foodId);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? FOOD_CATEGORIES[0],
    caloriesPer100g: initial ? String(initial.caloriesPer100g) : "",
    proteinPer100g: initial ? String(initial.proteinPer100g) : "",
    carbsPer100g: initial ? String(initial.carbsPer100g) : "",
    fatPer100g: initial ? String(initial.fatPer100g) : "",
    fiberPer100g: initial ? String(initial.fiberPer100g) : "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FoodFieldErrors>({});

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (k in fieldErrors) setFieldErrors((p) => { const n = { ...p }; delete n[k as keyof FoodFieldErrors]; return n; });
  }

  async function submit() {
    setError(null);
    const validation = foodFormSchema.safeParse(form);
    if (!validation.success) {
      const errors: FoodFieldErrors = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof FoodFormFields;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setError(c.error);
      return;
    }
    setFieldErrors({});

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      caloriesPer100g: Number(form.caloriesPer100g),
      proteinPer100g: Number(form.proteinPer100g),
      carbsPer100g: Number(form.carbsPer100g),
      fatPer100g: Number(form.fatPer100g),
      fiberPer100g: form.fiberPer100g.trim() === "" ? 0 : Number(form.fiberPer100g),
    };
    const res = await fetch(isEdit ? `/api/admin/foods/${foodId}` : "/api/admin/foods", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(res.status === 409 ? c.duplicateError : (body.error ?? c.error));
      return;
    }
    const body = await res.json();
    onSaved({ id: isEdit ? (foodId as string) : body.id, ...payload, source: initial?.source ?? "admin" });
  }

  return (
    <Card className="border-primary/30">
      <CardHeader><CardTitle className="text-base">{isEdit ? c.editFood : c.newFood}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Field label={c.nameLabel} error={fieldErrors.name}><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>

        <Field label={c.categoryLabel}>
          <select value={form.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
            {FOOD_CATEGORIES.map((cat) => <option key={cat} value={cat}>{c.categories[cat] ?? cat}</option>)}
          </select>
        </Field>

        <p className="text-xs text-muted-foreground">{c.per100gNote}</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <Field label={c.caloriesLabel} error={fieldErrors.caloriesPer100g}><Input type="number" value={form.caloriesPer100g} onChange={(e) => set("caloriesPer100g", e.target.value)} /></Field>
          <Field label={c.proteinLabel} error={fieldErrors.proteinPer100g}><Input type="number" value={form.proteinPer100g} onChange={(e) => set("proteinPer100g", e.target.value)} /></Field>
          <Field label={c.carbsLabel} error={fieldErrors.carbsPer100g}><Input type="number" value={form.carbsPer100g} onChange={(e) => set("carbsPer100g", e.target.value)} /></Field>
          <Field label={c.fatLabel} error={fieldErrors.fatPer100g}><Input type="number" value={form.fatPer100g} onChange={(e) => set("fatPer100g", e.target.value)} /></Field>
          <Field label={c.fiberLabel} error={fieldErrors.fiberPer100g}><Input type="number" value={form.fiberPer100g} onChange={(e) => set("fiberPer100g", e.target.value)} /></Field>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={submit} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {saving ? (isEdit ? c.savingChanges : c.creating) : isEdit ? c.saveChanges : c.create}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={saving}>{c.cancel}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
