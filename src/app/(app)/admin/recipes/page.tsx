import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminRecipesManager } from "@/components/admin/AdminRecipesManager";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.adminRecipes.meta.title };
export const dynamic = "force-dynamic";

export default async function AdminRecipesPage() {
  const items = await prisma.recipe.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, description: true, imageUrl: true, mealType: true, dietType: true, isActive: true, createdAt: true },
  });

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminRecipes.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.adminRecipes.subtitle}</p>
      </div>

      <AdminRecipesManager
        initial={items.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          imageUrl: r.imageUrl,
          mealType: r.mealType,
          dietType: r.dietType,
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
