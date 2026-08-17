import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { detectPhases } from "@/services/biomechanical/phaseDetector";
import { evaluateExerciseSpec, type BiomechanicalSpecData } from "@/services/biomechanical/specEvaluator";
import { analyzeUserVideoVision, compareVideoVision, type VisionFrame } from "@/services/ai/visionAnalyzer";
import { generateFinalReport } from "@/services/ai/finalReportGenerator";
import { computeCombinedScore } from "@/services/analysis/weights";
import { buildReferenceProfile, compareToReference } from "@/services/analysis/referenceProfile";
import { sendGuestAnalysisReportEmail } from "@/lib/email";
import { GUEST_SESSION_COOKIE } from "@/lib/guest-analysis";
import type { FrameAnalysis, L1Result, L2Result, L3Result, ReferenceProfile } from "@/types/analysis";
import { z } from "zod";

const visionFrameSchema = z.object({
  base64: z.string().min(1),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  label: z.string(),
});

const schema = z.object({
  guestSessionId: z.string(),
  frameHistory: z.array(z.any()).default([]),
  userFrames: z.array(visionFrameSchema).default([]),
  proFrames: z.array(visionFrameSchema).default([]),
  durationSeconds: z.number().optional(),
});

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get(GUEST_SESSION_COOKIE)?.value;
  if (!cookieToken) return NextResponse.json({ error: "Sessione scaduta, ricomincia la prova gratuita" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  if (parsed.data.guestSessionId !== cookieToken) return NextResponse.json({ error: "Sessione non valida" }, { status: 401 });

  const guestRequest = await prisma.guestAnalysisRequest.findUnique({
    where: { id: parsed.data.guestSessionId },
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
  if (!guestRequest) return NextResponse.json({ error: "Sessione non trovata" }, { status: 404 });

  // Una sola prova gratuita completata per email, a vita — non un limite giornaliero: i
  // tentativi di registrazione (prima dell'invio definitivo) restano illimitati, è solo
  // l'analisi effettiva a essere gated una volta sola per contenere il costo AI.
  const alreadyUsed = await prisma.guestAnalysisRequest.count({
    where: { email: guestRequest.email, status: "COMPLETED", id: { not: guestRequest.id } },
  });
  if (alreadyUsed > 0) {
    return NextResponse.json({ error: "Hai già usato la tua prova gratuita con questa email. Crea un account per continuare ad analizzare la tua tecnica." }, { status: 429 });
  }

  await prisma.guestAnalysisRequest.update({
    where: { id: guestRequest.id },
    data: { status: "PROCESSING", durationSeconds: parsed.data.durationSeconds },
  });

  const frameHistory = parsed.data.frameHistory as FrameAnalysis[];
  const exerciseSlug = guestRequest.exercise.slug;
  const exerciseName = guestRequest.exercise.name;
  const professionalNotes = guestRequest.exercise.professionalNotes ?? "";

  const timeline = detectPhases(frameHistory, exerciseSlug);

  const ptProfile = guestRequest.exercise.referenceProfile as unknown as ReferenceProfile | null;
  const numericL3 = ptProfile && Array.isArray(ptProfile.movements) && ptProfile.movements.length > 0
    ? compareToReference(buildReferenceProfile(frameHistory, timeline), ptProfile)
    : null;

  const specData: BiomechanicalSpecData | null = guestRequest.exercise.biomechanicalSpec
    ? {
        movements: guestRequest.exercise.biomechanicalSpec.movements.map((m) => ({
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

  const l2Promise: Promise<L2Result> = analyzeUserVideoVision({ exerciseName, professionalNotes, userFrames });

  const hasProFrames = proFrames.length > 0;
  const l3Promise: Promise<L3Result> = hasProFrames
    ? compareVideoVision({ exerciseName, professionalNotes, userFrames, proFrames })
    : Promise.resolve({
        score: -1,
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

  const L3_NUMERIC_WEIGHT = 0.6;
  const hasVisionL3 = hasProFrames && l3.score >= 0;

  if (numericL3) {
    const visionScore = hasVisionL3 ? l3.score : null;
    const combined = visionScore === null
      ? numericL3.numericScore
      : Math.round(L3_NUMERIC_WEIGHT * numericL3.numericScore + (1 - L3_NUMERIC_WEIGHT) * visionScore);
    l3 = {
      score: combined,
      numericScore: numericL3.numericScore,
      comparisonFeedback: hasVisionL3 ? l3.comparisonFeedback : "Confronto numerico col profilo PT (analisi vision non disponibile).",
      keyDifferences: [...numericL3.keyDifferences, ...(hasVisionL3 ? l3.keyDifferences : [])].slice(0, 6),
    };
  } else if (l3.score === -1) {
    l3 = { ...l3, score: Math.round((l1.score + l2.score) / 2) };
  }

  const hasL3 = !!numericL3 || hasProFrames;

  const failures = [l1Settled, l2Settled].filter((r) => r.status === "rejected").length
    + (hasProFrames && l3Settled.status === "rejected" ? 1 : 0);
  if (failures >= 2) {
    await prisma.guestAnalysisRequest.update({
      where: { id: guestRequest.id },
      data: { status: "ERROR", l1Result: l1 as object, l2Result: l2 as object, l3Result: l3 as object },
    });
    return NextResponse.json({ error: "Analisi fallita: troppi sotto-step non disponibili." }, { status: 500 });
  }

  const finalReport = await generateFinalReport({ exerciseName, l1, l2, l3, hasProVideo: hasL3 }).catch(() => ({
    combinedScore: computeCombinedScore(l1.score, l2.score, l3.score, { hasProVideo: hasL3 }),
    overallJudgment: `Esecuzione di ${exerciseName} elaborata. Sintesi finale non disponibile.`,
    prioritizedImprovements: l1.triggeredFeedback.slice(0, 5).map((t) => t.feedback),
    injuryRiskAlert: { level: "BASSO" as const, explanation: "Sintesi non generata.", affectedAreas: [] },
    positiveAspects: l2.visualObservations.slice(0, 3),
  }));

  await prisma.guestAnalysisRequest.update({
    where: { id: guestRequest.id },
    data: {
      status: "COMPLETED",
      l1Result: l1 as object,
      l2Result: l2 as object,
      l3Result: l3 as object,
      finalReport: finalReport as object,
      combinedScore: finalReport.combinedScore,
    },
  });

  sendGuestAnalysisReportEmail(
    guestRequest.email,
    exerciseName,
    finalReport.combinedScore,
    finalReport.overallJudgment,
    finalReport.prioritizedImprovements,
  )
    .then(() => prisma.guestAnalysisRequest.update({ where: { id: guestRequest.id }, data: { reportSentAt: new Date() } }))
    .catch((e) => console.error("[guest-analysis] invio referto fallito:", e));

  return NextResponse.json({
    combinedScore: finalReport.combinedScore,
    overallJudgment: finalReport.overallJudgment,
    exerciseName,
    status: "COMPLETED",
  });
}
