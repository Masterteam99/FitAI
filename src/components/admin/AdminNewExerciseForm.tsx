"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import { copy } from "@/content/copy";
import { TriggerSpecEditor, type SpecValue } from "./TriggerSpecEditor";

const urlOrEmpty = z.string().trim().url("URL non valido").or(z.literal(""));
const positiveNumStr = z.string().refine((s) => s.trim() !== "" && Number(s) > 0, "Deve essere un numero positivo");

const exerciseFormSchema = z.object({
  name: z.string().trim().min(3, "Minimo 3 caratteri").max(100, "Massimo 100 caratteri"),
  slug: z.string().trim().regex(/^[a-z0-9-]*$/, "Solo minuscole, numeri e trattini"),
  description: z.string().trim().min(10, "Minimo 10 caratteri").max(2000, "Massimo 2000 caratteri"),
  videoUrl: urlOrEmpty,
  explanationVideoUrl: urlOrEmpty,
  thumbnailUrl: urlOrEmpty,
  recordingDurationSeconds: positiveNumStr,
  caloriesPerMinute: positiveNumStr,
});

type ExerciseFormFields = z.infer<typeof exerciseFormSchema>;
type FieldErrors = Partial<Record<keyof ExerciseFormFields, string>>;

const MUSCLES = ["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "FOREARMS", "CORE", "QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES", "FULL_BODY"];
const EQUIPMENT = ["NONE", "DUMBBELLS", "BARBELL", "MACHINE", "RESISTANCE_BANDS", "PULL_UP_BAR", "BENCH", "KETTLEBELL", "CABLES", "FULL_GYM"];
const CATEGORIES = ["STRENGTH", "CARDIO", "FLEXIBILITY", "BALANCE", "PLYOMETRIC", "FUNCTIONAL"];
const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring";
const areaCls = "w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary";

export interface ExerciseInitial {
  name: string;
  slug: string;
  description: string;
  instructions: string[];
  muscleGroupPrimary: string;
  muscleGroupsSecondary: string[];
  difficulty: string;
  category: string;
  equipment: string[];
  videoUrl: string | null;
  explanationVideoUrl: string | null;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
  recordingDurationSeconds: number;
  caloriesPerMinute: number;
  professionalNotes: string | null;
  tags: string[];
  availableForFreeTrial: boolean;
  biomechanicalSpec: unknown | null;
}

// La spec salvata arriva come `unknown` dall'API (JSON libero lato DB); qui la
// normalizziamo nella forma tipizzata che l'editor si aspetta, senza fidarsi
// ciecamente della struttura (un vecchio JSON scritto a mano potrebbe avere
// campi mancanti).
function parseInitialSpec(raw: unknown): SpecValue {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as { movements?: unknown }).movements)) {
    return { movements: [] };
  }
  return raw as SpecValue;
}

export function AdminNewExerciseForm({ exerciseId, initial }: { exerciseId?: string; initial?: ExerciseInitial } = {}) {
  const c = copy.adminNewExercise;
  const router = useRouter();
  const isEdit = Boolean(exerciseId);

  const [f, setF] = useState({
    name: initial?.name ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    instructions: (initial?.instructions ?? []).join("\n"),
    muscleGroupPrimary: initial?.muscleGroupPrimary ?? MUSCLES[0],
    difficulty: initial?.difficulty ?? DIFFICULTIES[0],
    category: initial?.category ?? CATEGORIES[0],
    videoUrl: initial?.videoUrl ?? "",
    explanationVideoUrl: initial?.explanationVideoUrl ?? "",
    thumbnailUrl: initial?.thumbnailUrl ?? "",
    durationSeconds: initial?.durationSeconds != null ? String(initial.durationSeconds) : "",
    recordingDurationSeconds: String(initial?.recordingDurationSeconds ?? 20),
    caloriesPerMinute: String(initial?.caloriesPerMinute ?? 5),
    professionalNotes: initial?.professionalNotes ?? "",
    tags: (initial?.tags ?? []).join(", "),
  });
  const [spec, setSpec] = useState<SpecValue>(() => parseInitialSpec(initial?.biomechanicalSpec));
  const [secondary, setSecondary] = useState<string[]>(initial?.muscleGroupsSecondary ?? []);
  const [equipment, setEquipment] = useState<string[]>(initial?.equipment ?? ["NONE"]);
  const [availableForFreeTrial, setAvailableForFreeTrial] = useState(initial?.availableForFreeTrial ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) {
    setF((p) => ({ ...p, [k]: v }));
    if (k in fieldErrors) setFieldErrors((p) => { const n = { ...p }; delete n[k as keyof FieldErrors]; return n; });
  }
  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  }

  async function submit() {
    setError(null);
    const validation = exerciseFormSchema.safeParse({
      name: f.name,
      slug: f.slug,
      description: f.description,
      videoUrl: f.videoUrl,
      explanationVideoUrl: f.explanationVideoUrl,
      thumbnailUrl: f.thumbnailUrl,
      recordingDurationSeconds: f.recordingDurationSeconds,
      caloriesPerMinute: f.caloriesPerMinute,
    });
    if (!validation.success) {
      const errors: FieldErrors = {};
      for (const issue of validation.error.issues) {
        const key = issue.path[0] as keyof ExerciseFormFields;
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      setError(c.error);
      return;
    }
    setFieldErrors({});

    const biomechanicalSpec: unknown = spec.movements.length > 0 ? spec : null;
    const num = (s: string) => (s.trim() === "" ? null : Number(s));

    setSaving(true);
    const res = await fetch(isEdit ? `/api/admin/exercises/${exerciseId}` : "/api/admin/exercises", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: f.name.trim(),
        slug: f.slug.trim() || undefined,
        description: f.description.trim(),
        instructions: f.instructions.split("\n").map((s) => s.trim()).filter(Boolean),
        muscleGroupPrimary: f.muscleGroupPrimary,
        muscleGroupsSecondary: secondary,
        difficulty: f.difficulty,
        equipment: equipment.length ? equipment : ["NONE"],
        category: f.category,
        videoUrl: f.videoUrl.trim() || null,
        explanationVideoUrl: f.explanationVideoUrl.trim() || null,
        thumbnailUrl: f.thumbnailUrl.trim() || null,
        durationSeconds: num(f.durationSeconds),
        recordingDurationSeconds: Number(f.recordingDurationSeconds) || 20,
        caloriesPerMinute: Number(f.caloriesPerMinute) || 5,
        professionalNotes: f.professionalNotes.trim() || null,
        tags: f.tags.split(",").map((s) => s.trim()).filter(Boolean),
        availableForFreeTrial,
        biomechanicalSpec,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ? String(body.error) : c.error);
      return;
    }
    router.push("/admin/exercises");
  }

  const canSubmit = f.name.trim().length >= 3 && f.description.trim().length >= 10;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{isEdit ? c.editExercise : c.newExercise}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Field label={c.nameLabel} error={fieldErrors.name}><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label={c.slugLabel} error={fieldErrors.slug}><Input value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" /></Field>
        <Field label={c.descLabel} error={fieldErrors.description}><textarea value={f.description} onChange={(e) => set("description", e.target.value)} className={`${areaCls} min-h-[70px]`} /></Field>
        <Field label={c.instructionsLabel}><textarea value={f.instructions} onChange={(e) => set("instructions", e.target.value)} className={`${areaCls} min-h-[70px]`} /></Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={c.primaryMuscleLabel}>
            <select value={f.muscleGroupPrimary} onChange={(e) => set("muscleGroupPrimary", e.target.value)} className={inputCls}>
              {MUSCLES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label={c.difficultyLabel}>
            <select value={f.difficulty} onChange={(e) => set("difficulty", e.target.value)} className={inputCls}>
              {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label={c.categoryLabel}>
            <select value={f.category} onChange={(e) => set("category", e.target.value)} className={inputCls}>
              {CATEGORIES.map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </Field>
        </div>

        <Field label={c.secondaryMuscleLabel}>
          <ChipMulti options={MUSCLES} selected={secondary} onToggle={(v) => toggle(secondary, setSecondary, v)} />
        </Field>
        <Field label={c.equipmentLabel}>
          <ChipMulti options={EQUIPMENT} selected={equipment} onToggle={(v) => toggle(equipment, setEquipment, v)} />
        </Field>

        <Field label={c.videoLabel} error={fieldErrors.videoUrl}><Input value={f.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://…" /></Field>
        <Field label={c.explanationVideoLabel} error={fieldErrors.explanationVideoUrl}><Input value={f.explanationVideoUrl} onChange={(e) => set("explanationVideoUrl", e.target.value)} placeholder="https://…" /></Field>
        <Field label={c.thumbnailLabel} error={fieldErrors.thumbnailUrl}><Input value={f.thumbnailUrl} onChange={(e) => set("thumbnailUrl", e.target.value)} placeholder="https://…" /></Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label={c.durationLabel}><Input type="number" value={f.durationSeconds} onChange={(e) => set("durationSeconds", e.target.value)} /></Field>
          <Field label={c.recordingLabel} error={fieldErrors.recordingDurationSeconds}><Input type="number" value={f.recordingDurationSeconds} onChange={(e) => set("recordingDurationSeconds", e.target.value)} /></Field>
          <Field label={c.caloriesLabel} error={fieldErrors.caloriesPerMinute}><Input type="number" value={f.caloriesPerMinute} onChange={(e) => set("caloriesPerMinute", e.target.value)} /></Field>
        </div>

        <Field label={c.notesLabel}><textarea value={f.professionalNotes} onChange={(e) => set("professionalNotes", e.target.value)} className={`${areaCls} min-h-[60px]`} /></Field>
        <Field label={c.tagsLabel}><Input value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="forza, casa, gambe" /></Field>

        <label className="flex items-center gap-2.5 text-sm">
          <input type="checkbox" checked={availableForFreeTrial} onChange={(e) => setAvailableForFreeTrial(e.target.checked)} />
          {c.freeTrialLabel}
        </label>

        <Field label={c.specLabel}>
          <TriggerSpecEditor value={spec} onChange={setSpec} />
        </Field>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <Button onClick={submit} disabled={saving || !canSubmit} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? (isEdit ? c.savingChanges : c.creating) : isEdit ? c.saveChanges : c.create}
        </Button>
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

function ChipMulti({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onToggle(o)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${on ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
