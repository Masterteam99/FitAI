import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic, MODELS } from "@/lib/anthropic";
import { aiRatelimit } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { SYSTEM_PROMPTS, buildPlanGeneratorPrompt } from "@/services/ai/promptTemplates";
import { checkQuota, incrementUsage } from "@/lib/billing/gating";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

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
  const startTs = Date.now();
  try {
  console.log("[generate-plan] start", { ts: startTs });

  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;
  console.log("[generate-plan] authed", { userId });

  const { success } = await aiRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: "Troppe richieste. Riprova tra un minuto." }, { status: 429 });

  const gate = await checkQuota(userId, "generate_plan");
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Hai esaurito le generazioni AI di questo mese. Passa a Premium per averle illimitate.", code: gate.reason, limit: gate.limit, resetAt: gate.resetAt },
      { status: 402 },
    );
  }
  console.log("[generate-plan] gate ok", { premium: gate.premium, remaining: gate.remaining });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const d = parsed.data;
  const normalizedGoals = d.goals ?? (d.goal ? [d.goal] : ["GENERAL_FITNESS"]);
  const normalizedLevel = d.currentLevel ?? d.fitnessLevel ?? "INTERMEDIATE";
  const normalizedRestrictions = d.restrictions ?? d.notes ?? "";

  // Recupera esercizi dal DB per il prompt. I `tags` sono il segnale primario
  // con cui Claude seleziona dinamicamente gli esercizi più rilevanti per il
  // profilo utente (niente più template statici).
  const exercises = await prisma.exercise.findMany({
    where: { isActive: true },
    select: {
      slug: true, name: true, muscleGroupPrimary: true, muscleGroupsSecondary: true,
      difficulty: true, equipment: true, category: true, caloriesPerMinute: true, tags: true,
    },
  });

  const exerciseList = exercises
    .map((e) => {
      const secondary = e.muscleGroupsSecondary.length ? ` | secondari: ${e.muscleGroupsSecondary.join(",")}` : "";
      const tags = e.tags.length ? ` | tag: ${e.tags.join(",")}` : "";
      return `- ${e.slug}: "${e.name}" | muscolo: ${e.muscleGroupPrimary}${secondary} | difficoltà: ${e.difficulty} | attrezzatura: ${e.equipment.join(",")} | categoria: ${e.category}${tags}`;
    })
    .join("\n");
  console.log("[generate-plan] exercises loaded", { count: exercises.length });

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
            }),
          },
        ],
      },
    ],
  });
  console.log("[generate-plan] anthropic stream opened");

  return new Response(
    new ReadableStream({
      async start(controller) {
        let streamOk = false;
        try {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
          }
          streamOk = true;
          controller.close();
          console.log("[generate-plan] stream complete", { durationMs: Date.now() - startTs });
        } catch (err) {
          console.error("[generate-plan] stream error", { durationMs: Date.now() - startTs, err: err instanceof Error ? err.message : String(err) });
          controller.error(err);
          return;
        }
        if (streamOk && !gate.premium) {
          await incrementUsage(userId, "generate_plan").catch((e) =>
            console.error("[generate-plan] incrementUsage failed", e)
          );
        }
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store, no-transform" } }
  );
  } catch (err) {
    const durationMs = Date.now() - startTs;
    const msg = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number })?.status ?? 500;
    console.error("[generate-plan] handler error", { durationMs, status, err: msg });
    return NextResponse.json({ error: msg, code: "AI_PROVIDER_ERROR" }, { status: status >= 400 && status < 600 ? status : 500 });
  }
}
