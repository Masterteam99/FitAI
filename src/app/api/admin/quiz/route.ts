import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { DEFAULT_QUIZ, type QuizConfig } from "@/lib/quiz";
import { z } from "zod";

const CONFIG_ID = "singleton";

const OptionSchema = z.object({ value: z.string().min(1).max(60), label: z.string().min(1).max(120) });
const QuestionSchema = z.object({
  key: z.string().min(1).max(40),
  title: z.string().min(1).max(300),
  help: z.string().max(400).optional(),
  type: z.enum(["single", "multi", "number", "text"]),
  options: z.array(OptionSchema).max(30).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  required: z.boolean().optional(),
});
const ConfigSchema = z.object({ questions: z.array(QuestionSchema).min(1).max(40) });

async function guard() {
  try {
    await requireAdmin();
    return null;
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}

export async function GET() {
  const blocked = await guard();
  if (blocked) return blocked;
  const row = await prisma.quizConfig.findUnique({ where: { id: CONFIG_ID } });
  const config = (row?.questionsJson as unknown as QuizConfig) ?? DEFAULT_QUIZ;
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const blocked = await guard();
  if (blocked) return blocked;

  const parsed = ConfigSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Config non valida" }, { status: 400 });

  const clean = JSON.parse(JSON.stringify(parsed.data));
  await prisma.quizConfig.upsert({
    where: { id: CONFIG_ID },
    create: { id: CONFIG_ID, questionsJson: clean },
    update: { questionsJson: clean },
  });
  return NextResponse.json({ ok: true });
}
