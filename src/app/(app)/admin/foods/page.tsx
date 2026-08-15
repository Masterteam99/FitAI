import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminFoodsManager } from "@/components/admin/AdminFoodsManager";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.adminFoods.meta.title };
export const dynamic = "force-dynamic";

export default async function AdminFoodsPage() {
  const items = await prisma.food.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminFoods.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.adminFoods.subtitle}</p>
      </div>

      <AdminFoodsManager
        initial={items.map((f) => ({
          id: f.id,
          name: f.name,
          category: f.category ?? "cereali",
          caloriesPer100g: f.caloriesPer100g,
          proteinPer100g: f.proteinPer100g,
          carbsPer100g: f.carbsPer100g,
          fatPer100g: f.fatPer100g,
          fiberPer100g: f.fiberPer100g,
          source: f.source,
        }))}
      />
    </div>
  );
}
