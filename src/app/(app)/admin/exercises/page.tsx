import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminExercisesTable } from "@/components/admin/AdminExercisesTable";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.adminExercises.meta.title };
export const dynamic = "force-dynamic";

export default async function AdminExercisesPage() {
  const [exercises, total, withVideo, activeCount] = await Promise.all([
    prisma.exercise.findMany({
      select: { id: true, slug: true, name: true, muscleGroupPrimary: true, videoUrl: true, isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.exercise.count(),
    prisma.exercise.count({ where: { videoUrl: { not: null } } }),
    prisma.exercise.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminExercises.title}</h1>
        <p className="text-sm text-muted-foreground">
          {copy.adminExercises.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AdminMetricCard label={copy.adminExercises.metricTotal} value={total} />
        <AdminMetricCard label={copy.adminExercises.metricWithVideo} value={withVideo} tone="success" />
        <AdminMetricCard label={copy.adminExercises.metricActive} value={activeCount} tone="info" />
      </div>

      <AdminExercisesTable exercises={exercises} />
    </div>
  );
}
