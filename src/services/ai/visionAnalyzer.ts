import Anthropic from "@anthropic-ai/sdk";
import { anthropic, MODELS } from "@/lib/anthropic";
import type { L2Result, L3Result } from "@/types/analysis";
import { SYSTEM_PROMPTS } from "./promptTemplates";

export interface VisionFrame {
  base64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  label: string;
}

type ContentBlock = Anthropic.Messages.ContentBlockParam;

function buildVisionAnalysisPrompt(exerciseName: string, professionalNotes: string): string {
  return `Sei un Personal Trainer esperto. Analizza visivamente l'esecuzione di "${exerciseName}" mostrata nei frame seguenti, ordinati cronologicamente.

NOTE TECNICHE DI RIFERIMENTO:
${professionalNotes || "(non fornite)"}

Concentrati su aspetti VISIVI che richiedono giudizio qualitativo (NON ripetere analisi numeriche di angoli):
- controllo del movimento e fluidità
- simmetria sinistra/destra
- pattern respiratorio visibile (espressione, postura toracica)
- espressioni di sforzo eccessivo
- asimmetrie sottili e compensi

Rispondi SOLO con JSON valido (no markdown, no testo esterno):
{
  "score": <0-100>,
  "qualitativeAnalysis": "<analisi narrativa, max 150 parole>",
  "visualObservations": ["<osservazione 1>", "<osservazione 2>", "<osservazione 3>"],
  "injuryRiskFlags": ["<rischio 1 se rilevato>", ...]
}`;
}

function buildComparisonPrompt(exerciseName: string, professionalNotes: string): string {
  return `Sei un coach video-analyst. Confronta i frame "USER" (utente) con quelli "PRO" (PT professionista) per "${exerciseName}", ordinati per fase analoga (BOTTOM, TOP, ecc.).

NOTE TECNICHE DI RIFERIMENTO:
${professionalNotes || "(non fornite)"}

Identifica le differenze chiave tra le due esecuzioni: postura, range di movimento, timing relativo, allineamento articolare.

Rispondi SOLO con JSON valido (no markdown, no testo esterno):
{
  "score": <0-100, dove 100 = utente identico al PRO>,
  "comparisonFeedback": "<analisi differenze, max 150 parole>",
  "keyDifferences": [
    { "aspect": "<aspetto>", "user": "<comportamento utente>", "pro": "<comportamento pro>" }
  ]
}`;
}

export async function analyzeUserVideoVision(params: {
  exerciseName: string;
  professionalNotes: string;
  userFrames: VisionFrame[];
}): Promise<L2Result> {
  if (params.userFrames.length === 0) {
    return {
      score: 0,
      qualitativeAnalysis: "Frame non disponibili per l'analisi visuale.",
      visualObservations: [],
      injuryRiskFlags: [],
    };
  }

  const frames = params.userFrames.slice(0, 8);
  const content: ContentBlock[] = [
    {
      type: "text",
      text: SYSTEM_PROMPTS.EXERCISE_ANALYZER,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: buildVisionAnalysisPrompt(params.exerciseName, params.professionalNotes),
    },
  ];
  for (const f of frames) {
    content.push({
      type: "image",
      source: { type: "base64", media_type: f.mediaType, data: f.base64 },
    });
    content.push({ type: "text", text: `Frame: ${f.label}` });
  }

  const response = await anthropic.messages.create({
    model: MODELS.DEFAULT,
    max_tokens: 1024,
    messages: [{ role: "user", content }],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  try {
    return JSON.parse(text) as L2Result;
  } catch {
    return {
      score: 60,
      qualitativeAnalysis: text.slice(0, 600),
      visualObservations: [],
      injuryRiskFlags: [],
    };
  }
}

export async function compareVideoVision(params: {
  exerciseName: string;
  professionalNotes: string;
  userFrames: VisionFrame[];
  proFrames: VisionFrame[];
}): Promise<L3Result> {
  if (params.userFrames.length === 0 || params.proFrames.length === 0) {
    return {
      score: 0,
      comparisonFeedback: "Confronto non disponibile: frame utente o video PT mancanti.",
      keyDifferences: [],
    };
  }

  const userFrames = params.userFrames.slice(0, 6);
  const proFrames = params.proFrames.slice(0, 6);
  const content: ContentBlock[] = [
    {
      type: "text",
      text: SYSTEM_PROMPTS.EXERCISE_ANALYZER,
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: buildComparisonPrompt(params.exerciseName, params.professionalNotes),
    },
  ];
  const pairs = Math.max(userFrames.length, proFrames.length);
  for (let i = 0; i < pairs; i++) {
    const u = userFrames[i];
    const p = proFrames[i];
    if (u) {
      content.push({ type: "image", source: { type: "base64", media_type: u.mediaType, data: u.base64 } });
      content.push({ type: "text", text: `USER ${u.label}` });
    }
    if (p) {
      content.push({ type: "image", source: { type: "base64", media_type: p.mediaType, data: p.base64 } });
      content.push({ type: "text", text: `PRO ${p.label}` });
    }
  }

  const response = await anthropic.messages.create({
    model: MODELS.DEFAULT,
    max_tokens: 1024,
    messages: [{ role: "user", content }],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  try {
    return JSON.parse(text) as L3Result;
  } catch {
    return {
      score: 60,
      comparisonFeedback: text.slice(0, 600),
      keyDifferences: [],
    };
  }
}
