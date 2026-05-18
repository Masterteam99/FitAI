import { anthropic, MODELS } from "@/lib/anthropic";
import type { L1Result, L2Result, L3Result, FinalReport } from "@/types/analysis";

function buildFinalReportPrompt(
  exerciseName: string,
  l1: L1Result,
  l2: L2Result,
  l3: L3Result,
  combinedScore: number
): string {
  const l1Critical = l1.triggeredFeedback.filter((t) => t.severity === "CRITICAL");
  const l1InjuryItems = l1.triggeredFeedback.filter((t) => t.injuryRisk);

  return `Sintetizza in italiano un giudizio finale di personal trainer su un'esecuzione di "${exerciseName}" basato sulle 3 analisi qui sotto.

L1 — BIOMECCANICA NUMERICA (peso 34%, score ${l1.score}/100)
Trigger attivati:
${l1.triggeredFeedback.map((t) => `- [${t.severity}${t.injuryRisk ? "/INJURY" : ""}] ${t.feedback}`).join("\n") || "- nessun trigger"}

L2 — VISION ANALYSIS (peso 33%, score ${l2.score}/100)
${l2.qualitativeAnalysis}
Osservazioni visive: ${l2.visualObservations.join("; ") || "nessuna"}
Rischi rilevati: ${l2.injuryRiskFlags.join("; ") || "nessuno"}

L3 — CONFRONTO CON PT (peso 33%, score ${l3.score}/100)
${l3.comparisonFeedback}
Differenze chiave: ${l3.keyDifferences.map((d) => `${d.aspect}: utente "${d.user}" vs PT "${d.pro}"`).join("; ") || "nessuna"}

SCORE COMBINATO: ${combinedScore}/100

REGOLE DI SINTESI:
1. Dai PRIORITÀ ai trigger CRITICAL di L1 nel giudizio: ${l1Critical.length} trigger CRITICAL presenti.
2. Riconcilia contraddizioni: se L1 dice numeri ok e L2 dice "instabile", privilegia L2 sull'aspetto visivo.
3. Per injuryRiskAlert combina ${l1InjuryItems.length} flag injury L1 + ${l2.injuryRiskFlags.length} flag L2.
   Level: ALTO se >=1 trigger CRITICAL con injuryRisk, MEDIO se >=2 flag totali, BASSO altrimenti.

Rispondi SOLO con JSON valido (no markdown):
{
  "combinedScore": ${combinedScore},
  "overallJudgment": "<narrativa unica, max 100 parole>",
  "prioritizedImprovements": ["<3-5 punti, ordinati per impatto>"],
  "injuryRiskAlert": {
    "level": "BASSO" | "MEDIO" | "ALTO",
    "explanation": "<spiegazione breve>",
    "affectedAreas": ["<area corporea>", ...]
  },
  "positiveAspects": ["<2-4 punti positivi osservati>"]
}`;
}

export async function generateFinalReport(params: {
  exerciseName: string;
  l1: L1Result;
  l2: L2Result;
  l3: L3Result;
}): Promise<FinalReport> {
  const combinedScore = Math.round(
    params.l1.score * 0.34 + params.l2.score * 0.33 + params.l3.score * 0.33
  );

  const response = await anthropic.messages.create({
    model: MODELS.FAST,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: buildFinalReportPrompt(params.exerciseName, params.l1, params.l2, params.l3, combinedScore),
      },
    ],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  try {
    const parsed = JSON.parse(text) as FinalReport;
    return { ...parsed, combinedScore };
  } catch {
    const hasCritical = params.l1.triggeredFeedback.some((t) => t.severity === "CRITICAL" && t.injuryRisk);
    const totalFlags = params.l1.triggeredFeedback.filter((t) => t.injuryRisk).length + params.l2.injuryRiskFlags.length;
    return {
      combinedScore,
      overallJudgment: text.slice(0, 600) || `Esecuzione di ${params.exerciseName} elaborata. Punteggio complessivo ${combinedScore}/100.`,
      prioritizedImprovements: params.l1.triggeredFeedback.slice(0, 5).map((t) => t.feedback),
      injuryRiskAlert: {
        level: hasCritical ? "ALTO" : totalFlags >= 2 ? "MEDIO" : "BASSO",
        explanation: hasCritical ? "Rilevati trigger CRITICAL con rischio infortunio." : "Nessun rischio acuto rilevato.",
        affectedAreas: [],
      },
      positiveAspects: params.l2.visualObservations.slice(0, 3),
    };
  }
}
