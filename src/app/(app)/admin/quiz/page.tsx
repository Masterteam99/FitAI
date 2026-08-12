import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminQuizEditor } from "@/components/admin/AdminQuizEditor";
import { DEFAULT_QUIZ, type QuizConfig } from "@/lib/quiz";
import { copy } from "@/content/copy";

export const metadata: Metadata = { title: copy.adminQuiz.meta.title };
export const dynamic = "force-dynamic";

export default async function AdminQuizPage() {
  const row = await prisma.quizConfig.findUnique({ where: { id: "singleton" } });
  const config = (row?.questionsJson as unknown as QuizConfig) ?? DEFAULT_QUIZ;

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{copy.adminQuiz.title}</h1>
        <p className="text-sm text-muted-foreground">{copy.adminQuiz.subtitle}</p>
      </div>
      <AdminQuizEditor initial={config} />
    </div>
  );
}
