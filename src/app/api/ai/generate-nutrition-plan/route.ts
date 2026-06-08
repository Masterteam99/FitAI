import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic, MODELS } from "@/lib/anthropic";
import { aiRatelimit } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { NUTRITION_SYSTEM_PROMPT, buildNutritionPlanPrompt } from "@/services/ai/promptTemplates";
import { checkQuota, incrementUsage } from "@/lib/billing/gating";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  weightKg: z.number().min(30).max(300),
  heightCm: z.number().min(100).max(250),
  age: z.number().int().min(12).max(100),
  gender: z.enum(["M", "F"]),
  activityLevel: z.enum(["sedentario", "leggero", "moderato", "intenso"]),
  dietType: z.string().default("onnivora"),
  targetGoal: z.string().default("GENERAL_FITNESS"),
  pastInjuries: z.array(z.string()).optional(),
});

const ACTIVITY_FACTORS: Record<string, number> = {
  sedentario: 1.2, leggero: 1.375, moderato: 1.55, intenso: 1.725,
};

const GOAL_KCAL_ADJUST: Record<string, number> = {
  LOSE_WEIGHT: 0.80,
  BUILD_MUSCLE: 1.10,
  GENERAL_FITNESS: 1.0,
  ENDURANCE: 1.05,
  ATHLETIC_PERFORMANCE: 1.10,
  FLEXIBILITY: 1.0,
};

function computeTargetMacros(p: {
  weightKg: number; heightCm: number; age: number;
  gender: "M" | "F"; activityLevel: string; targetGoal: string;
}) {
  const bmr = p.gender === "M"
    ? 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + 5
    : 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age - 161;
  const tdee = bmr * (ACTIVITY_FACTORS[p.activityLevel] ?? 1.2);
  const adj = GOAL_KCAL_ADJUST[p.targetGoal] ?? 1.0;
  const kcal = Math.round(tdee * adj);
  const proteinPerKg = p.targetGoal === "BUILD_MUSCLE" ? 2.0 : 1.7;
  const proteinG = Math.round(p.weightKg * proteinPerKg);
  const fatG = Math.round((kcal * 0.28) / 9);
  const carbsG = Math.round((kcal - proteinG * 4 - fatG * 9) / 4);
  return { kcal, proteinG, carbsG: Math.max(carbsG, 0), fatG };
}

export async function POST(req: NextRequest) {
  try {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { success } = await aiRatelimit.limit(session.user.id);
  if (!success) return NextResponse.json({ error: "Troppe richieste. Riprova tra un minuto." }, { status: 429 });

  const gate = await checkQuota(session.user.id as string, "generate_nutrition_plan");
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Hai esaurito il piano nutrizionale AI di questo mese. Passa a Premium per averlo illimitato.", code: gate.reason, limit: gate.limit, resetAt: gate.resetAt },
      { status: 402 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const d = parsed.data;
  const targetMacros = computeTargetMacros(d);

  const response = await anthropic.messages.create({
    model: MODELS.DEFAULT,
    max_tokens: 6000,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: NUTRITION_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } } as never,
          {
            type: "text",
            text: buildNutritionPlanPrompt({
              ...d,
              targetMacros,
            }),
          },
        ],
      },
    ],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  let plan: object | null = null;
  try {
    // Claude può rispondere con JSON puro o dentro un fence ```json: estraiamo
    // il primo oggetto JSON in modo robusto.
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const candidate = fenced ? fenced[1] : text;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("no-json");
    plan = JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return NextResponse.json({ error: "Output AI non valido", raw: text.slice(0, 500) }, { status: 500 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { nutritionPlanJson: plan as object },
  });

  if (!gate.premium) {
    await incrementUsage(session.user.id as string, "generate_nutrition_plan").catch((e) =>
      console.error("[generate-nutrition-plan] incrementUsage failed", e)
    );
  }

  return NextResponse.json({ plan, targetMacros });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number })?.status ?? 500;
    console.error("[generate-nutrition-plan] handler error", { status, err: msg });
    return NextResponse.json({ error: msg, code: "AI_PROVIDER_ERROR" }, { status: status >= 400 && status < 600 ? status : 500 });
  }
}
