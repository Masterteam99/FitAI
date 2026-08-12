import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_QUIZ, mapAnswersToUser, type QuizConfig } from "@/lib/quiz";
import { z } from "zod";

const CONFIG_ID = "singleton";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await prisma.quizConfig.findUnique({ where: { id: CONFIG_ID } });
  const config = (row?.questionsJson as unknown as QuizConfig) ?? DEFAULT_QUIZ;
  return NextResponse.json(config);
}

const AnswerSchema = z.record(z.string(), z.union([z.string(), z.array(z.string()), z.number()]));

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = z.object({ answers: AnswerSchema }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Risposte non valide" }, { status: 400 });

  const update = mapAnswersToUser(parsed.data.answers);
  await prisma.user.update({
    where: { id: session.user.id as string },
    data: { ...update, onboardingCompleted: true },
  });

  return NextResponse.json({ ok: true });
}
