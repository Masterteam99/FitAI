import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectPhases } from "@/services/biomechanical/phaseDetector";
import { evaluateExerciseSpec, type BiomechanicalSpecData } from "@/services/biomechanical/specEvaluator";
import { analyzeUserVideoVision, compareVideoVision, type VisionFrame } from "@/services/ai/visionAnalyzer";
import { generateFinalReport } from "@/services/ai/finalReportGenerator";
import type { FrameAnalysis, L1Result, L2Result, L3Result } from "@/types/analysis";
import { z } from "zod";

const visionFrameSchema = z.object({
  base64: z.string().min(1),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  label: z.string(),
});

const schema = z.object({
  analysisSessionId: z.string(),
  frameHistory: z.array(z.any()).default([]),
  userFrames: z.array(visionFrameSchema).default([]),
  proFrames: z.array(visionFrameSchema).default([]),
  durationSeconds: z.number().optional(),
});

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const analysisSession = await prisma.analysisSession.findFirst({
    where: { id: parsed.data.analysisSessionId, userId },
    include: {
      exercise: {
        include: {
          biomechanicalSpec: {
            include: { movements: { include: { phases: { include: { triggers: true } } } } },
          },
        },
      },
    },
  });
  if (!analysisSession) return NextResponse.json({ error: "Sessione non trovata" }, { status: 404 });

  await prisma.analysisSession.update({
    where: { id: analysisSession.id },
    data: { status: "PROCESSING", durationSeconds: parsed.data.durationSeconds },
  });

  const frameHistory = parsed.data.frameHistory as FrameAnalysis[];
  const exerciseSlug = analysisSession.exercise.slug;
  const exerciseName = analysisSession.exercise.name;
  const professionalNotes = analysisSession.exercise.professionalNotes ?? "";

  const timeline = detectPhases(frameHistory, exerciseSlug);

  const specData: BiomechanicalSpecData | null = analysisSession.exercise.biomechanicalSpec
    ? {
        movements: analysisSession.exercise.biomechanicalSpec.movements.map((m) => ({
          joint: m.joint,
          movementType: m.movementType,
          phases: m.phases.map((p) => ({
            phase: p.phase,
            minAngle: p.minAngle,
            maxAngle: p.maxAngle,
            triggers: p.triggers.map((t) => ({
              condition: t.condition,
              severity: t.severity,
              feedback: t.feedback,
              injuryRisk: t.injuryRisk,
            })),
          })),
        })),
      }
    : null;

  const l1Promise: Promise<L1Result> = Promise.resolve(
    specData
      ? evaluateExerciseSpec(frameHistory, specData, timeline)
      : { score: 0, triggeredFeedback: [], detectedPhases: timeline.detectedPhases, rawAnglesSampled: [] }
  );

  const userFrames = parsed.data.userFrames as VisionFrame[];
  const proFrames = parsed.data.proFrames as VisionFrame[];

  const l2Promise: Promise<L2Result> = analyzeUserVideoVision({
    exerciseName,
    professionalNotes,
    userFrames,
  });

  const hasProFrames = proFrames.length > 0;
  const l3Promise: Promise<L3Result> = hasProFrames
    ? compareVideoVision({ exerciseName, professionalNotes, userFrames, proFrames })
    : Promise.resolve({
        score: -1, // sentinel: redistribuiremo i pesi a valle
        comparisonFeedback: "Confronto con video PT non eseguito: frame di riferimento non estratti.",
        keyDifferences: [],
      });

  const [l1Settled, l2Settled, l3Settled] = await Promise.allSettled([l1Promise, l2Promise, l3Promise]);

  const l1: L1Result = l1Settled.status === "fulfilled" ? l1Settled.value : {
    score: 0,
    triggeredFeedback: [{ feedback: "Analisi biomeccanica non disponibile.", severity: "WARNING", injuryRisk: false }],
    detectedPhases: timeline.detectedPhases,
    rawAnglesSampled: [],
  };
  const l2: L2Result = l2Settled.status === "fulfilled" ? l2Settled.value : {
    score: 0,
    qualitativeAnalysis: "Analisi vision (utente) fallita.",
    visualObservations: [],
    injuryRiskFlags: [],
  };
  let l3: L3Result = l3Settled.status === "fulfilled" ? l3Settled.value : {
    score: 0,
    comparisonFeedback: "Confronto con video PT fallito.",
    keyDifferences: [],
  };

  // Redistribuzione pesi: se L3 sentinel (-1), il finalReport calcola combinedScore solo su L1+L2
  if (l3.score === -1) {
    l3 = { ...l3, score: Math.round((l1.score + l2.score) / 2) };
  }

  const failures = [l1Settled, l2Settled].filter((r) => r.status === "rejected").length
    + (hasProFrames && l3Settled.status === "rejected" ? 1 : 0);
  if (failures >= 2) {
    await prisma.analysisSession.update({
      where: { id: analysisSession.id },
      data: { status: "ERROR", l1Result: l1 as object, l2Result: l2 as object, l3Result: l3 as object },
    });
    return NextResponse.json({ error: "Analisi fallita: troppi sotto-step non disponibili.", analysisSessionId: analysisSession.id }, { status: 500 });
  }

  const finalReport = await generateFinalReport({ exerciseName, l1, l2, l3 }).catch(() => ({
    combinedScore: Math.round(l1.score * 0.34 + l2.score * 0.33 + l3.score * 0.33),
    overallJudgment: `Esecuzione di ${exerciseName} elaborata. Sintesi finale non disponibile.`,
    prioritizedImprovements: l1.triggeredFeedback.slice(0, 5).map((t) => t.feedback),
    injuryRiskAlert: { level: "BASSO" as const, explanation: "Sintesi non generata.", affectedAreas: [] },
    positiveAspects: l2.visualObservations.slice(0, 3),
  }));

  await prisma.analysisSession.update({
    where: { id: analysisSession.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
      l1Result: l1 as object,
      l2Result: l2 as object,
      l3Result: l3 as object,
      finalReport: finalReport as object,
      combinedScore: finalReport.combinedScore,
    },
  });

  return NextResponse.json({
    analysisSessionId: analysisSession.id,
    combinedScore: finalReport.combinedScore,
    status: "COMPLETED",
  });
}
