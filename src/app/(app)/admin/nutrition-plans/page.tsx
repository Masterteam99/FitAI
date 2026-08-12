import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminNutritionPoolManager } from "@/components/admin/AdminNutritionPoolManager";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.adminNutritionPool.meta.title };
export const dynamic = "force-dynamic";

type GoalKey = keyof typeof copy.adminNutritionPool.goals;

export default async function AdminNutritionPoolPage() {
  const items = await prisma.nutritionPlanTemplate.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, description: true, dietType: true, targetGoal: true, createdAt: true },
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminNutritionPool.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.adminNutritionPool.subtitle}</p>
      </div>

      <AdminNutritionPoolManager
        initial={items.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          dietType: p.dietType,
          targetGoal: p.targetGoal as GoalKey,
          createdAt: p.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
