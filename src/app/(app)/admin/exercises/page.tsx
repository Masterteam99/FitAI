import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tags, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminExercisesTable } from "@/components/admin/AdminExercisesTable";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.adminExercises.meta.title };
export const dynamic = "force-dynamic";

export default async function AdminExercisesPage() {
  const [exercises, total, withVideo, activeCount] = await Promise.all([
    prisma.exercise.findMany({
      select: { id: true, slug: true, name: true, muscleGroupPrimary: true, videoUrl: true, isActive: true, referenceProfileAt: true },
      orderBy: { name: "asc" },
    }),
    prisma.exercise.count(),
    prisma.exercise.count({ where: { videoUrl: { not: null } } }),
    prisma.exercise.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{copy.adminExercises.title}</h1>
          <p className="text-sm text-muted-foreground">
            {copy.adminExercises.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/exercises/tags">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Tags className="w-4 h-4" />
              {copy.adminExerciseTags.openEditor}
            </Button>
          </Link>
          <Link href="/admin/exercises/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" />
              {copy.adminNewExercise.newExercise}
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminMetricCard label={copy.adminExercises.metricTotal} value={total} />
        <AdminMetricCard label={copy.adminExercises.metricWithVideo} value={withVideo} tone="success" />
        <AdminMetricCard label={copy.adminExercises.metricActive} value={activeCount} tone="info" />
      </div>

      <AdminExercisesTable
        exercises={exercises.map((e) => ({
          id: e.id,
          slug: e.slug,
          name: e.name,
          muscleGroupPrimary: e.muscleGroupPrimary,
          videoUrl: e.videoUrl,
          isActive: e.isActive,
          hasProfile: e.referenceProfileAt != null,
        }))}
      />
    </div>
  );
}
