import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminWorkoutTemplateManager } from "@/components/admin/AdminWorkoutTemplateManager";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.adminWorkoutPool.meta.title };
export const dynamic = "force-dynamic";

export default async function AdminWorkoutPoolPage() {
  const items = await prisma.workoutPlanTemplate.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, description: true, difficulty: true, targetGoals: true,
      requiredEquipment: true, durationWeeks: true, workoutsPerWeek: true, createdAt: true,
    },
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminWorkoutPool.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.adminWorkoutPool.subtitle}</p>
      </div>

      <AdminWorkoutTemplateManager
        initial={items.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          difficulty: p.difficulty,
          targetGoals: p.targetGoals,
          requiredEquipment: p.requiredEquipment,
          durationWeeks: p.durationWeeks,
          workoutsPerWeek: p.workoutsPerWeek,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
