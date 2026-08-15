import { prisma } from "@/lib/prisma";
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS } from "@/types/exercise";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Dumbbell, Search } from "lucide-react";
import { ExerciseCardMedia } from "@/components/esercizi/ExerciseCardMedia";
import type { Metadata } from "next";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.esercizi.meta.title };

interface Props {
  searchParams: Promise<{ muscolo?: string; difficolta?: string; cerca?: string; tag?: string; attrezzatura?: string }>;
}

export default async function EserciziPage({ searchParams }: Props) {
  const params = await searchParams;
  const [exercises, tagRows] = await Promise.all([
    prisma.exercise.findMany({
      where: {
        isActive: true,
        ...(params.muscolo && { muscleGroupPrimary: params.muscolo as never }),
        ...(params.difficolta && { difficulty: params.difficolta as never }),
        ...(params.tag && { tags: { has: params.tag } }),
        ...(params.attrezzatura && { equipment: { has: params.attrezzatura as never } }),
        ...(params.cerca && { name: { contains: params.cerca, mode: "insensitive" } }),
      },
      orderBy: { name: "asc" },
      include: { biomechanicalSpec: { select: { id: true } } },
    }),
    prisma.exercise.findMany({ where: { isActive: true }, select: { tags: true } }),
  ]);

  const allTags = Array.from(new Set(tagRows.flatMap((r) => r.tags))).sort().slice(0, 30);
  const muscleGroups = Object.entries(MUSCLE_GROUP_LABELS);
  const difficulties = Object.entries(DIFFICULTY_LABELS);
  const equipmentOptions = Object.entries(EQUIPMENT_LABELS).filter(([key]) => key !== "NONE");

  function buildHref(overrides: Partial<{ muscolo: string; difficolta: string; tag: string; attrezzatura: string; cerca: string }>) {
    const next = { ...params, ...overrides };
    const qs = new URLSearchParams();
    if (next.cerca) qs.set("cerca", next.cerca);
    if (next.muscolo) qs.set("muscolo", next.muscolo);
    if (next.difficolta) qs.set("difficolta", next.difficolta);
    if (next.tag) qs.set("tag", next.tag);
    if (next.attrezzatura) qs.set("attrezzatura", next.attrezzatura);
    const s = qs.toString();
    return s ? `/esercizi?${s}` : "/esercizi";
  }

  const difficultyColor = { BEGINNER: "success", INTERMEDIATE: "warning", ADVANCED: "destructive" } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{copy.esercizi.title}</h1>
        <p className="text-muted-foreground">{copy.esercizi.countAvailable(exercises.length)}</p>
      </div>

      {/* Filtri */}
      <div className="flex flex-wrap gap-3">
        <form className="relative flex-1 min-w-48 max-w-xs">
          {params.muscolo && <input type="hidden" name="muscolo" value={params.muscolo} />}
          {params.difficolta && <input type="hidden" name="difficolta" value={params.difficolta} />}
          {params.tag && <input type="hidden" name="tag" value={params.tag} />}
          {params.attrezzatura && <input type="hidden" name="attrezzatura" value={params.attrezzatura} />}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            name="cerca"
            defaultValue={params.cerca}
            placeholder={copy.esercizi.searchPlaceholder}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>

        <div className="flex flex-wrap gap-2">
          <Link href={buildHref({ muscolo: undefined })} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!params.muscolo ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
            {copy.esercizi.allFilter}
          </Link>
          {muscleGroups.map(([key, label]) => (
            <Link key={key} href={buildHref({ muscolo: params.muscolo === key ? undefined : key })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.muscolo === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="flex gap-2">
          {difficulties.map(([key, label]) => (
            <Link key={key} href={buildHref({ difficolta: params.difficolta === key ? undefined : key })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.difficolta === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="w-full flex flex-wrap gap-2">
          {equipmentOptions.map(([key, label]) => (
            <Link key={key} href={buildHref({ attrezzatura: params.attrezzatura === key ? undefined : key })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.attrezzatura === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
              {label}
            </Link>
          ))}
        </div>

        {allTags.length > 0 && (
          <div className="w-full flex flex-wrap gap-2">
            {allTags.map((t) => (
              <Link key={t} href={buildHref({ tag: params.tag === t ? undefined : t })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${params.tag === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"}`}>
                #{t}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Grid esercizi */}
      {exercises.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">{copy.esercizi.noResults}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exercises.map((ex) => (
            <Link key={ex.id} href={`/esercizi/${ex.slug}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-4 space-y-3">
                  <ExerciseCardMedia videoUrl={ex.videoUrl} thumbnailUrl={ex.thumbnailUrl} name={ex.name} />

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm leading-tight">{ex.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ex.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant={difficultyColor[ex.difficulty]}>{DIFFICULTY_LABELS[ex.difficulty]}</Badge>
                      <Badge variant="outline">{MUSCLE_GROUP_LABELS[ex.muscleGroupPrimary as keyof typeof MUSCLE_GROUP_LABELS]}</Badge>
                      {ex.biomechanicalSpec != null && (
                        <Badge variant="secondary" className="text-primary">🎯 AI</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
