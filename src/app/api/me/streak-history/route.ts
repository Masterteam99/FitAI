import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const revalidate = 600;

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const start = new Date(Date.now() - 365 * DAY_MS);
  start.setHours(0, 0, 0, 0);

  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      status: "COMPLETED",
      completedAt: { gte: start },
    },
    select: { completedAt: true },
  });

  const counts = new Map<string, number>();
  for (const s of sessions) {
    if (!s.completedAt) continue;
    const iso = s.completedAt.toISOString().slice(0, 10);
    counts.set(iso, (counts.get(iso) ?? 0) + 1);
  }

  const data = Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ data, totalDays: 365 });
}
