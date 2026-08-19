import { prisma } from "@/lib/prisma";
import { MUSCLE_GROUP_LABELS, DIFFICULTY_LABELS, EQUIPMENT_LABELS } from "@/types/exercise";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { ExerciseCardMedia } from "@/components/esercizi/ExerciseCardMedia";
import { ExerciseFilters } from "@/components/esercizi/ExerciseFilters";
import { EserciziHeading, EserciziNoResults } from "./EserciziText";
import type { Metadata } from "next";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.esercizi.meta.title };

interface Props {
  searchParams: Promise<{ muscolo?: string; difficolta?: string; cerca?: string; tag?: string; attrezzatura?: string }>;
}

export default async function EserciziPage({ searchParams }: Props) {
  const params = await searchParams;
  // Un valore non valido nella query string (link vecchio/rotto, URL modificato
  // a mano) non deve mandare in errore la pagina: lo ignoriamo silenziosamente
  // invece di passarlo a Prisma, che rifiuterebbe qualsiasi stringa non nell'enum.
  const muscolo = params.muscolo && params.muscolo in MUSCLE_GROUP_LABELS ? params.muscolo : undefined;
  const difficolta = params.difficolta && params.difficolta in DIFFICULTY_LABELS ? params.difficolta : undefined;
  const attrezzatura = params.attrezzatura && params.attrezzatura in EQUIPMENT_LABELS ? params.attrezzatura : undefined;
  const [exercises, tagRows] = await Promise.all([
    prisma.exercise.findMany({
      where: {
        isActive: true,
        ...(muscolo && { muscleGroupPrimary: muscolo as never }),
        ...(difficolta && { difficulty: difficolta as never }),
        ...(params.tag && { tags: { has: params.tag } }),
        ...(attrezzatura && { equipment: { has: attrezzatura as never } }),
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

  const difficultyColor = { BEGINNER: "success", INTERMEDIATE: "warning", ADVANCED: "destructive" } as const;

  return (
    <div className="space-y-6">
      <EserciziHeading count={exercises.length} />

      {/* Filtri */}
      <ExerciseFilters
        params={params}
        muscleGroups={muscleGroups}
        difficulties={difficulties}
        equipmentOptions={equipmentOptions}
        allTags={allTags}
      />

      {/* Grid esercizi */}
      {exercises.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto" />
          <EserciziNoResults />
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
