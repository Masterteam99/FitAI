"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";
import { copy } from "@/content/copy";

interface CuratedRecipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  mealType: string | null;
  dietType: string | null;
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  ingredients: string[];
  steps: string[];
  tags: string[];
}

export function RecipesCard() {
  const c = copy.nutrizione;
  const [curated, setCurated] = useState<CuratedRecipe[] | null>(null);
  const [recipes, setRecipes] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCurated(Array.isArray(d?.recipes) ? d.recipes : []))
      .catch(() => setCurated([]));
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/ai/recipes", { method: "POST" });
    setLoading(false);
    if (!res.ok) {
      setError(c.recipesError);
      return;
    }
    const d = await res.json();
    setRecipes(d.recipes ?? "");
  }

  const hasCurated = (curated?.length ?? 0) > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{c.recipesTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{c.recipesHint}</p>

        {/* Ricette curate dal gestore (se presenti) */}
        {hasCurated && (
          <div className="space-y-3">
            {curated!.map((r) => (
              <div key={r.id} className="rounded-lg border p-3 space-y-2">
                {r.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.imageUrl} alt={r.title} className="w-full h-40 object-cover rounded-md" loading="lazy" />
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">{r.title}</p>
                  <Badge variant="secondary" className="text-[10px]">{c.recipesCuratedBadge}</Badge>
                  {r.calories != null && <span className="text-xs text-muted-foreground">{r.calories} kcal</span>}
                  {r.proteinG != null && <span className="text-xs text-muted-foreground">· {r.proteinG}g prot</span>}
                </div>
                <p className="text-sm text-muted-foreground">{r.description}</p>
                {r.ingredients.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{c.recipesIngredients}</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {r.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                    </ul>
                  </div>
                )}
                {r.steps.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{c.recipesSteps}</p>
                    <ol className="list-decimal pl-5 text-sm text-muted-foreground">
                      {r.steps.map((s, i) => <li key={i}>{s}</li>)}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ricette AI generate su richiesta */}
        {recipes && <p className="text-sm whitespace-pre-wrap">{recipes}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {hasCurated && <p className="text-xs text-muted-foreground pt-1">{c.recipesAiHint}</p>}
        <Button onClick={generate} disabled={loading} variant="outline" className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? c.recipesLoading : c.recipesCta}
        </Button>
      </CardContent>
    </Card>
  );
}
