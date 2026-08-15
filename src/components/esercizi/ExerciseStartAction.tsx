"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { copy } from "@/content/copy";

// Checkbox + bottone unico per iniziare l'esercizio: sostituisce il vecchio
// bottone "Attiva analisi avanzata" che portava sempre e comunque all'analisi.
// Qui l'utente sceglie prima se vuole essere ripreso e analizzato dall'AI;
// se non la vuole, non c'è un'azione da avviare nell'app — ha già tutto
// (video + istruzioni) sopra per allenarsi per conto suo.
export function ExerciseStartAction({ exerciseId }: { exerciseId: string }) {
  const [wantsAnalysis, setWantsAnalysis] = useState(true);

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-2.5 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={wantsAnalysis}
          onChange={(e) => setWantsAnalysis(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-border accent-primary shrink-0"
        />
        <span>
          <span className="font-medium">{copy.esercizioDettaglio.analysisCheckboxLabel}</span>
          <span className="block text-xs text-muted-foreground mt-0.5">{copy.esercizioDettaglio.analysisCheckboxHint}</span>
        </span>
      </label>

      {wantsAnalysis ? (
        <Link href={`/analisi/sessione?id=${exerciseId}`}>
          <Button size="lg" className="w-full gap-2">
            <Brain className="w-4 h-4" />
            {copy.esercizioDettaglio.startExercise}
          </Button>
        </Link>
      ) : (
        <p className="text-xs text-center text-muted-foreground py-2">{copy.esercizioDettaglio.noAnalysisNote}</p>
      )}
    </div>
  );
}
