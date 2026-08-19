"use client";

import { useState } from "react";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Pencil, Save } from "lucide-react";
import { copy } from "@/content/copy";

const nonNegNumStr = z.string().refine((s) => s.trim() === "" || Number(s) >= 0, "Deve essere un numero non negativo");
const recipeFormSchema = z.object({
  title: z.string().trim().min(2, "Minimo 2 caratteri").max(150, "Massimo 150 caratteri"),
  description: z.string().trim().min(2, "Minimo 2 caratteri").max(2000, "Massimo 2000 caratteri"),
  calories: nonNegNumStr,
  proteinG: nonNegNumStr,
  carbsG: nonNegNumStr,
  fatG: nonNegNumStr,
});
type RecipeFormFields = z.infer<typeof recipeFormSchema>;
type RecipeFieldErrors = Partial<Record<keyof RecipeFormFields, string>>;

const c = copy.adminRecipes;
const MEAL_TYPES: { value: string; label: string }[] = [
  { value: "", label: c.mealAny },
  { value: "BREAKFAST", label: c.meals.BREAKFAST },
  { value: "LUNCH", label: c.meals.LUNCH },
  { value: "DINNER", label: c.meals.DINNER },
  { value: "SNACK", label: c.meals.SNACK },
];
const DIET_TYPES = ["", "onnivora", "vegetariana", "vegana", "chetogenica", "mediterranea"];

interface Item {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  mealType: string | null;
  dietType: string | null;
  isActive: boolean;
  createdAt: string;
}
interface RecipeFull extends Omit<Item, "createdAt"> {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  ingredients: string[];
  steps: string[];
  tags: string[];
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring";
const areaCls = "w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary";

export function AdminRecipesManager({ initial }: { initial: Item[] }) {
  const [items, setItems] = useState<Item[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<{ id: string; data: RecipeFull } | null>(null);
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  async function remove(id: string) {
    await fetch(`/api/admin/recipes?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function startEdit(id: string) {
    setLoadingEditId(id);
    try {
      const res = await fetch(`/api/admin/recipes/${id}`);
      if (!res.ok) return;
      const { recipe } = await res.json();
      setShowForm(false);
      setEditing({ id, data: recipe as RecipeFull });
    } finally {
      setLoadingEditId(null);
    }
  }

  const dietLabel = (d: string | null) => (d ? d : c.dietAll);
  const mealLabel = (m: string | null) => (m ? c.meals[m as keyof typeof c.meals] ?? m : c.mealAny);

  return (
    <div className="space-y-4">
      {!editing && (
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2">
          <Plus className="w-4 h-4" />
          {c.newRecipe}
        </Button>
      )}

      {showForm && !editing && (
        <RecipeForm onSaved={(it) => { setItems((prev) => [it, ...prev]); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      )}
      {editing && (
        <RecipeForm
          recipeId={editing.id}
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
                  {i.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={i.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{i.title}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <Badge variant="secondary" className="text-xs">{dietLabel(i.dietType)}</Badge>
                      <Badge variant="outline" className="text-xs">{mealLabel(i.mealType)}</Badge>
                      {!i.isActive && <Badge variant="outline" className="text-xs text-muted-foreground">{c.inactive}</Badge>}
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

function RecipeForm({
  recipeId,
  initial,
  onSaved,
  onCancel,
}: {
  recipeId?: string;
  initial?: RecipeFull;
  onSaved: (i: Item) => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(recipeId);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    imageUrl: initial?.imageUrl ?? "",
    mealType: initial?.mealType ?? "",
    dietType: initial?.dietType ?? "",
    calories: initial?.calories != null ? String(initial.calories) : "",
    proteinG: initial?.proteinG != null ? String(initial.proteinG) : "",
    carbsG: initial?.carbsG != null ? String(initial.carbsG) : "",
    fatG: initial?.fatG != null ? String(initial.fatG) : "",
    ingredients: (initial?.ingredients ?? []).join("\n"),
    steps: (initial?.steps ?? []).join("\n"),
    tags: (initial?.tags ?? []).join(", "),
    isActive: initial?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RecipeFieldErrors>({});

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (k in fieldErrors) setFieldErrors((p) => { const n = { ...p }; delete n[k as keyof RecipeFieldErrors]; return n; });
  }

  const canSubmit = form.title.trim().length >= 2 && form.description.trim().length >= 2;

  async function submit() {
    setError(null);
    const validation = recipeFormSchema.safeParse({
      title: form.title,
      description: form.description,
      calories: form.calories,
      proteinG: form.proteinG,
      carbsG: form.carbsG,
      fatG: form.fatG,
    });
    if (!validation.success) {
      const errors: RecipeFieldErrors = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof RecipeFormFields;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setError(c.error);
      return;
    }
    setFieldErrors({});

    setSaving(true);
    const num = (s: string) => (s.trim() === "" ? null : Number(s));
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim() || null,
      mealType: form.mealType || null,
      dietType: form.dietType || null,
      calories: num(form.calories),
      proteinG: num(form.proteinG),
      carbsG: num(form.carbsG),
      fatG: num(form.fatG),
      ingredients: form.ingredients.split("\n").map((s) => s.trim()).filter(Boolean),
      steps: form.steps.split("\n").map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      isActive: form.isActive,
    };
    const res = await fetch(isEdit ? `/api/admin/recipes/${recipeId}` : "/api/admin/recipes", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) { setError(c.error); return; }
    const body = await res.json();
    onSaved({
      id: isEdit ? (recipeId as string) : body.id,
      title: payload.title,
      description: payload.description,
      imageUrl: payload.imageUrl,
      mealType: payload.mealType,
      dietType: payload.dietType,
      isActive: payload.isActive,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <Card className="border-primary/30">
      <CardHeader><CardTitle className="text-base">{isEdit ? c.editRecipe : c.newRecipe}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Field label={c.titleLabel} error={fieldErrors.title}><Input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label={c.descLabel} error={fieldErrors.description}><textarea value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={2000} className={`${areaCls} min-h-[60px]`} /></Field>
        <Field label={c.imageLabel}><Input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder={c.imagePlaceholder} /></Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={c.mealLabel}>
            <select value={form.mealType} onChange={(e) => set("mealType", e.target.value)} className={inputCls}>
              {MEAL_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>
          <Field label={c.dietLabel}>
            <select value={form.dietType} onChange={(e) => set("dietType", e.target.value)} className={inputCls}>
              {DIET_TYPES.map((d) => <option key={d} value={d}>{d || c.dietAll}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Field label={c.caloriesLabel} error={fieldErrors.calories}><Input type="number" value={form.calories} onChange={(e) => set("calories", e.target.value)} /></Field>
          <Field label={c.proteinLabel} error={fieldErrors.proteinG}><Input type="number" value={form.proteinG} onChange={(e) => set("proteinG", e.target.value)} /></Field>
          <Field label={c.carbsLabel} error={fieldErrors.carbsG}><Input type="number" value={form.carbsG} onChange={(e) => set("carbsG", e.target.value)} /></Field>
          <Field label={c.fatLabel} error={fieldErrors.fatG}><Input type="number" value={form.fatG} onChange={(e) => set("fatG", e.target.value)} /></Field>
        </div>

        <Field label={c.ingredientsLabel}><textarea value={form.ingredients} onChange={(e) => set("ingredients", e.target.value)} placeholder={c.ingredientsPlaceholder} className={`${areaCls} min-h-[70px]`} /></Field>
        <Field label={c.stepsLabel}><textarea value={form.steps} onChange={(e) => set("steps", e.target.value)} placeholder={c.stepsPlaceholder} className={`${areaCls} min-h-[70px]`} /></Field>
        <Field label={c.tagsLabel}><Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder={c.tagsPlaceholder} /></Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
          {c.activeLabel}
        </label>

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

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
