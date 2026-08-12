import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic, MODELS } from "@/lib/anthropic";
import { aiRatelimit } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { computeNutritionTargets } from "@/lib/nutrition-targets";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const { success } = await aiRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: "Troppe richieste. Riprova tra un minuto." }, { status: 429 });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weightKg: true, heightCm: true, age: true, primaryGoal: true, dietType: true },
  });
  const targets = computeNutritionTargets({ weightKg: user?.weightKg, heightCm: user?.heightCm, age: user?.age, goal: user?.primaryGoal });

  const prompt = `Sei un nutrizionista. Proponi 3 ricette semplici e salutari, adatte a: obiettivo ${user?.primaryGoal ?? "GENERAL_FITNESS"}, alimentazione "${user?.dietType ?? "onnivora"}", fabbisogno giornaliero indicativo ~${targets.calories} kcal e ~${targets.protein} g di proteine.
Per ogni ricetta indica: nome, ingredienti principali, kcal indicative e macro (proteine/carboidrati/grassi). Scrivi in italiano, in elenco leggibile. Sono indicazioni di benessere, non un consulto medico.`;

  try {
    const msg = await anthropic.messages.create({
      model: MODELS.DEFAULT,
      max_tokens: 1200,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    return NextResponse.json({ recipes: text });
  } catch {
    return NextResponse.json({ error: "Generazione non riuscita. Riprova." }, { status: 500 });
  }
}
