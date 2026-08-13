"use client";

import { useEffect, useState } from "react";
import { AdminNewExerciseForm, type ExerciseInitial } from "./AdminNewExerciseForm";
import { copy } from "@/content/copy";

export function AdminEditExercise({ id }: { id: string }) {
  const [initial, setInitial] = useState<ExerciseInitial | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/exercises/${id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const d = await r.json();
        setInitial(d.exercise as ExerciseInitial);
      })
      .catch(() => setError(copy.adminNewExercise.error));
  }, [id]);

  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!initial) return <p className="text-sm text-muted-foreground">{copy.adminNewExercise.creating}</p>;

  return <AdminNewExerciseForm exerciseId={id} initial={initial} />;
}
