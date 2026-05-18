import { prisma } from "@/lib/prisma";
import { MUSCLE_GROUP_LABELS } from "@/types/exercise";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Brain, Camera, ChevronRight, Dumbbell } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analisi AI" };

export default async function AnalisiPage() {
  const exercises = await prisma.exercise.findMany({
    where: { isActive: true, biomechanicalSpec: { isNot: null } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="w-7 h-7 text-primary" />
          Analisi AI in Tempo Reale
        </h1>
        <p className="text-muted-foreground mt-1">
          Seleziona un esercizio, filma la tua esecuzione e ricevi feedback personalizzato da 3 sistemi AI in parallelo.
        </p>
      </div>

      {/* Come funziona */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { pct: "33%", title: "Biomeccanico", desc: "Misura angoli articolari in tempo reale e li confronta con soglie definite da professionisti", color: "text-blue-400" },
          { pct: "33%", title: "AI Expert", desc: "Claude analizza l'esecuzione come un personal trainer con 15 anni di esperienza", color: "text-primary" },
          { pct: "34%", title: "Confronto Video", desc: "Confronta la tua esecuzione con quella del professionista per identificare differenze", color: "text-purple-400" },
        ].map((item) => (
          <div key={item.title} className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className={`text-2xl font-bold ${item.color}`}>{item.pct}</div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary" />
          Esercizi con Analisi AI ({exercises.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <Link key={ex.id} href={`/analisi/sessione?id=${ex.id}`}>
              <Card className="hover:border-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-4">
                  <div className="aspect-video rounded-lg bg-secondary/50 mb-3 flex items-center justify-center overflow-hidden group-hover:bg-primary/5 transition-colors">
                    {ex.thumbnailUrl ? (
                      <img src={ex.thumbnailUrl} alt={ex.name} className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm">{ex.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {MUSCLE_GROUP_LABELS[ex.muscleGroupPrimary as keyof typeof MUSCLE_GROUP_LABELS]}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge variant="secondary" className="text-primary text-xs">AI ready</Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
