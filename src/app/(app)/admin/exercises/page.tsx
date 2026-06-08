import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminExercisesTable } from "@/components/admin/AdminExercisesTable";
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";

export const metadata: Metadata = { title: "Admin · Esercizi & Video PT" };
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
        <h1 className="text-2xl font-bold">Esercizi &amp; Video PT</h1>
        <p className="text-sm text-muted-foreground">
          Carica i video del Personal Trainer usati dall&apos;Analisi L3 per il confronto frame-by-frame.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AdminMetricCard label="Esercizi totali" value={total} />
        <AdminMetricCard label="Con video PT" value={withVideo} tone="success" />
        <AdminMetricCard label="Attivi" value={activeCount} tone="info" />
      </div>

      <AdminExercisesTable exercises={exercises} />
    </div>
  );
}
