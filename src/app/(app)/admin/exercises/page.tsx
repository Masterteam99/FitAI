import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { AdminExercisesTable } from "@/components/admin/AdminExercisesTable";

export const metadata: Metadata = { title: "Admin · Video PT" };
export const dynamic = "force-dynamic";

export default async function AdminExercisesPage() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) {
      if (e.status === 401) redirect("/login");
      redirect("/dashboard");
    }
    throw e;
  }

  const exercises = await prisma.exercise.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, name: true, muscleGroupPrimary: true, videoUrl: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Video PT di riferimento</h1>
        <p className="text-sm text-muted-foreground">
          Carica i video del Personal Trainer usati dall&apos;Analisi L3 per il confronto frame-by-frame.
        </p>
      </div>
      <AdminExercisesTable exercises={exercises} />
    </div>
  );
}
