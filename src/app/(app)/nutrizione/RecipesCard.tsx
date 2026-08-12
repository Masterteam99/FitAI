"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { copy } from "@/content/copy";

export function RecipesCard() {
  const c = copy.nutrizione;
  const [recipes, setRecipes] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{c.recipesTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{c.recipesHint}</p>
        {recipes && <p className="text-sm whitespace-pre-wrap">{recipes}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={generate} disabled={loading} variant="outline" className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? c.recipesLoading : c.recipesCta}
        </Button>
      </CardContent>
    </Card>
  );
}
