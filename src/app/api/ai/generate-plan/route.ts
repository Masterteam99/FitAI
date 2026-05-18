import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic, MODELS } from "@/lib/anthropic";
import { aiRatelimit } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { SYSTEM_PROMPTS, buildPlanGeneratorPrompt } from "@/services/ai/promptTemplates";
import { checkQuota, incrementUsage } from "@/lib/billing/gating";
import { z } from "zod";

const schema = z.object({
  goal: z.string().optional(),
  goals: z.array(z.string()).optional(),
  fitnessLevel: z.string().optional(),
  currentLevel: z.string().optional(),
  equipment: z.array(z.string()),
  daysPerWeek: z.number().min(1).max(7),
  focusAreas: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
  restrictions: z.string().optional(),
  durationWeeks: z.number().min(2).max(16).default(4),
  dietType: z.string().optional(),
  pastInjuries: z.array(z.string()).optional(),
  pastSports: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { success } = await aiRatelimit.limit(session.user.id);
  if (!success) return NextResponse.json({ error: "Troppe richieste. Riprova tra un minuto." }, { status: 429 });

  const gate = await checkQuota(session.user.id as string, "generate_plan");
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Hai esaurito le generazioni AI di questo mese. Passa a Premium per averle illimitate.", code: gate.reason, limit: gate.limit, resetAt: gate.resetAt },
      { status: 402 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  if (!gate.premium) await incrementUsage(session.user.id as string, "generate_plan");

  const d = parsed.data;
  const normalizedGoals = d.goals ?? (d.goal ? [d.goal] : ["GENERAL_FITNESS"]);
  const normalizedLevel = d.currentLevel ?? d.fitnessLevel ?? "INTERMEDIATE";
  const normalizedRestrictions = d.restrictions ?? d.notes ?? "";

  // Recupera esercizi dal DB per il prompt
  const exercises = await prisma.exercise.findMany({
    where: { isActive: true },
    select: { slug: true, name: true, muscleGroupPrimary: true, difficulty: true, equipment: true, category: true, caloriesPerMinute: true },
  });

  const exerciseList = exercises
    .map((e) => `- ${e.slug}: "${e.name}" | muscolo: ${e.muscleGroupPrimary} | difficoltà: ${e.difficulty} | attrezzatura: ${e.equipment.join(",")} | categoria: ${e.category}`)
    .join("\n");

  // Few-shot: 2-3 template più simili al profilo utente
  const matchedTemplates = await prisma.workoutPlanTemplate.findMany({
    where: {
      difficulty: normalizedLevel as never,
      targetGoals: { hasSome: normalizedGoals as never },
    },
    take: 3,
    orderBy: { createdAt: "asc" },
  });
  const fewShotBlock = matchedTemplates.length > 0
    ? matchedTemplates.map((t) =>
        `### Esempio: ${t.name}\n${t.description}\nRationale: ${t.rationale}\nDays:\n${JSON.stringify(t.daysJson, null, 2)}`
      ).join("\n\n---\n\n")
    : "";

  const stream = await anthropic.messages.stream({
    model: MODELS.DEFAULT,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: SYSTEM_PROMPTS.PLAN_GENERATOR, cache_control: { type: "ephemeral" } } as never,
          {
            type: "text",
            text: buildPlanGeneratorPrompt({
              goals: normalizedGoals,
              currentLevel: normalizedLevel,
              equipment: d.equipment,
              daysPerWeek: d.daysPerWeek,
              focusAreas: d.focusAreas ?? [],
              restrictions: normalizedRestrictions,
              durationWeeks: d.durationWeeks,
              dietType: d.dietType,
              pastInjuries: d.pastInjuries,
              pastSports: d.pastSports,
              exerciseList,
              fewShotExamples: fewShotBlock,
            }),
          },
        ],
      },
    ],
  });

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" } }
  );
}
