import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminExerciseTagsEditor } from "@/components/admin/AdminExerciseTagsEditor";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.adminExerciseTags.meta.title };
export const dynamic = "force-dynamic";

export default async function AdminExerciseTagsPage() {
  const exercises = await prisma.exercise.findMany({
    select: { id: true, name: true, muscleGroupPrimary: true, tags: true, professionalNotes: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <Link href="/admin/exercises" className="text-xs text-muted-foreground hover:text-foreground">
        {copy.adminExerciseTags.backToList}
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{copy.adminExerciseTags.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.adminExerciseTags.subtitle}</p>
      </div>

      <AdminExerciseTagsEditor
        exercises={exercises.map((e) => ({
          id: e.id,
          name: e.name,
          muscleGroupPrimary: e.muscleGroupPrimary,
          tags: e.tags,
          professionalNotes: e.professionalNotes,
        }))}
      />
    </div>
  );
}
