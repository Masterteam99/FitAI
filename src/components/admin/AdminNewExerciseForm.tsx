"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, AlertTriangle } from "lucide-react";
import { copy } from "@/content/copy";

const MUSCLES = ["CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "FOREARMS", "CORE", "QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES", "FULL_BODY"];
const EQUIPMENT = ["NONE", "DUMBBELLS", "BARBELL", "MACHINE", "RESISTANCE_BANDS", "PULL_UP_BAR", "BENCH", "KETTLEBELL", "CABLES", "FULL_GYM"];
const CATEGORIES = ["STRENGTH", "CARDIO", "FLEXIBILITY", "BALANCE", "PLYOMETRIC", "FUNCTIONAL"];
const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring";
const areaCls = "w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary";

export function AdminNewExerciseForm() {
  const c = copy.adminNewExercise;
  const router = useRouter();

  const [f, setF] = useState({
    name: "", slug: "", description: "", instructions: "",
    muscleGroupPrimary: MUSCLES[0], difficulty: DIFFICULTIES[0], category: CATEGORIES[0],
    videoUrl: "", explanationVideoUrl: "", thumbnailUrl: "",
    durationSeconds: "", recordingDurationSeconds: "20", caloriesPerMinute: "5",
    professionalNotes: "", tags: "", specText: "",
  });
  const [secondary, setSecondary] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>(["NONE"]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) { setF((p) => ({ ...p, [k]: v })); }
  function toggle(list: string[], setList: (v: string[]) => void, val: string) {
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  }

  async function submit() {
    setError(null);
    let biomechanicalSpec: unknown = null;
    if (f.specText.trim()) {
      try { biomechanicalSpec = JSON.parse(f.specText); }
      catch { setError(c.invalidJson); return; }
    }
    const num = (s: string) => (s.trim() === "" ? null : Number(s));

    setSaving(true);
    const res = await fetch("/api/admin/exercises", {
      method: "POST",
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

  const canSubmit = f.name.trim().length >= 2 && f.description.trim().length >= 2;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{c.newExercise}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Field label={c.nameLabel}><Input value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
        <Field label={c.slugLabel}><Input value={f.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" /></Field>
        <Field label={c.descLabel}><textarea value={f.description} onChange={(e) => set("description", e.target.value)} className={`${areaCls} min-h-[70px]`} /></Field>
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

        <Field label={c.videoLabel}><Input value={f.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://…" /></Field>
        <Field label={c.explanationVideoLabel}><Input value={f.explanationVideoUrl} onChange={(e) => set("explanationVideoUrl", e.target.value)} placeholder="https://…" /></Field>
        <Field label={c.thumbnailLabel}><Input value={f.thumbnailUrl} onChange={(e) => set("thumbnailUrl", e.target.value)} placeholder="https://…" /></Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label={c.durationLabel}><Input type="number" value={f.durationSeconds} onChange={(e) => set("durationSeconds", e.target.value)} /></Field>
          <Field label={c.recordingLabel}><Input type="number" value={f.recordingDurationSeconds} onChange={(e) => set("recordingDurationSeconds", e.target.value)} /></Field>
          <Field label={c.caloriesLabel}><Input type="number" value={f.caloriesPerMinute} onChange={(e) => set("caloriesPerMinute", e.target.value)} /></Field>
        </div>

        <Field label={c.notesLabel}><textarea value={f.professionalNotes} onChange={(e) => set("professionalNotes", e.target.value)} className={`${areaCls} min-h-[60px]`} /></Field>
        <Field label={c.tagsLabel}><Input value={f.tags} onChange={(e) => set("tags", e.target.value)} placeholder="forza, casa, gambe" /></Field>

        <Field label={c.specLabel}>
          <textarea value={f.specText} onChange={(e) => set("specText", e.target.value)} className={`${areaCls} min-h-[120px] font-mono text-xs`} placeholder={c.specHint} />
          <p className="text-[11px] text-muted-foreground mt-1 font-mono break-all">{c.specHint}</p>
        </Field>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        <Button onClick={submit} disabled={saving || !canSubmit} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {saving ? c.creating : c.create}
        </Button>
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
