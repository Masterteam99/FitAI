"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { copy } from "@/content/copy";

interface Ex {
  id: string;
  name: string;
  muscleGroupPrimary: string;
  tags: string[];
  professionalNotes: string | null;
}

export function AdminExerciseTagsEditor({ exercises }: { exercises: Ex[] }) {
  return (
    <div className="space-y-3">
      {exercises.map((ex) => (
        <ExerciseRow key={ex.id} ex={ex} />
      ))}
    </div>
  );
}

function ExerciseRow({ ex }: { ex: Ex }) {
  const c = copy.adminExerciseTags;
  const [tags, setTags] = useState(ex.tags.join(", "));
  const [notes, setNotes] = useState(ex.professionalNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    const tagsArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
    await fetch(`/api/admin/exercises/${ex.id}/tags`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: tagsArr, professionalNotes: notes.trim() || null }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="font-medium text-sm">{ex.name}</p>
          <p className="text-xs text-muted-foreground">{ex.muscleGroupPrimary}</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{c.tagsLabel}</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={c.tagsPlaceholder}
            className="w-full h-9 px-3 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">{c.notesLabel}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={c.notesPlaceholder}
            maxLength={2000}
            className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px]"
          />
        </div>
        <Button size="sm" onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? c.saved : c.save}
        </Button>
      </CardContent>
    </Card>
  );
}
