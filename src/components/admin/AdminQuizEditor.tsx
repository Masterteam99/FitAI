"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react";
import { copy } from "@/content/copy";
import type { QuizConfig, QuizQuestion, QuizQuestionType } from "@/lib/quiz";

const TYPES: QuizQuestionType[] = ["single", "multi", "number", "text"];

export function AdminQuizEditor({ initial }: { initial: QuizConfig }) {
  const c = copy.adminQuiz;
  const [questions, setQuestions] = useState<QuizQuestion[]>(initial.questions);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(i: number, patch: Partial<QuizQuestion>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }
  function move(i: number, dir: -1 | 1) {
    setQuestions((qs) => {
      const j = i + dir;
      if (j < 0 || j >= qs.length) return qs;
      const arr = [...qs];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }
  function removeQ(i: number) { setQuestions((qs) => qs.filter((_, idx) => idx !== i)); }
  function addQ() {
    setQuestions((qs) => [...qs, { key: `custom_${qs.length + 1}`, title: "Nuova domanda", type: "single", options: [{ value: "opt1", label: "Opzione 1" }] }]);
  }
  function addOpt(i: number) { update(i, { options: [...(questions[i].options ?? []), { value: "", label: "" }] }); }
  function updateOpt(i: number, oi: number, patch: Partial<{ value: string; label: string }>) {
    update(i, { options: (questions[i].options ?? []).map((o, idx) => (idx === oi ? { ...o, ...patch } : o)) });
  }
  function removeOpt(i: number, oi: number) { update(i, { options: (questions[i].options ?? []).filter((_, idx) => idx !== oi) }); }

  async function save() {
    setSaving(true); setError(null); setSaved(false);
    const res = await fetch("/api/admin/quiz", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questions }),
    });
    setSaving(false);
    if (!res.ok) { setError(c.error); return; }
    setSaved(true); setTimeout(() => setSaved(false), 2500);
  }

  const selCls = "w-full h-9 px-3 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring";

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} aria-label="up" className="p-1 text-muted-foreground hover:text-foreground"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => move(i, 1)} aria-label="down" className="p-1 text-muted-foreground hover:text-foreground"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => removeQ(i)} aria-label="delete" className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <Field label={c.titleLabel}><Input value={q.title} onChange={(e) => update(i, { title: e.target.value })} /></Field>
            <Field label={c.helpLabel}><Input value={q.help ?? ""} onChange={(e) => update(i, { help: e.target.value || undefined })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={c.keyLabel}><Input value={q.key} onChange={(e) => update(i, { key: e.target.value })} /></Field>
              <Field label={c.typeLabel}>
                <select value={q.type} onChange={(e) => update(i, { type: e.target.value as QuizQuestionType })} className={selCls}>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>

            {(q.type === "single" || q.type === "multi") && (
              <Field label={c.optionsLabel}>
                <div className="space-y-2">
                  {(q.options ?? []).map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <Input value={o.value} onChange={(e) => updateOpt(i, oi, { value: e.target.value })} placeholder={c.valuePlaceholder} className="w-1/3" />
                      <Input value={o.label} onChange={(e) => updateOpt(i, oi, { label: e.target.value })} placeholder={c.labelPlaceholder} />
                      <button onClick={() => removeOpt(i, oi)} aria-label="remove option" className="p-1 text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addOpt(i)} className="gap-1.5"><Plus className="w-3.5 h-3.5" />{c.addOption}</Button>
                </div>
              </Field>
            )}

            {q.type === "number" && (
              <div className="grid grid-cols-2 gap-3">
                <Field label={c.minLabel}><Input type="number" value={q.min ?? ""} onChange={(e) => update(i, { min: e.target.value === "" ? undefined : Number(e.target.value) })} /></Field>
                <Field label={c.maxLabel}><Input type="number" value={q.max ?? ""} onChange={(e) => update(i, { max: e.target.value === "" ? undefined : Number(e.target.value) })} /></Field>
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={!!q.required} onChange={(e) => update(i, { required: e.target.checked })} />
              {c.requiredLabel}
            </label>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="outline" onClick={addQ} className="gap-2"><Plus className="w-4 h-4" />{c.addQuestion}</Button>
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? c.saved : c.save}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">{c.keysHint}</p>
    </div>
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
