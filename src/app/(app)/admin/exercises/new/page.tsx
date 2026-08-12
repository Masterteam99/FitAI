import type { Metadata } from "next";
import Link from "next/link";
import { AdminNewExerciseForm } from "@/components/admin/AdminNewExerciseForm";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.adminNewExercise.meta.title };

export default function AdminNewExercisePage() {
  return (
    <div className="space-y-4 max-w-3xl">
      <Link href="/admin/exercises" className="text-xs text-muted-foreground hover:text-foreground">
        {copy.adminNewExercise.back}
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{copy.adminNewExercise.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.adminNewExercise.subtitle}</p>
      </div>
      <AdminNewExerciseForm />
    </div>
  );
}
