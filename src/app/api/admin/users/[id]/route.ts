import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      fitnessLevel: true,
      age: true,
      weightKg: true,
      heightCm: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionCurrentPeriodEnd: true,
      stripeCustomerId: true,
      createdAt: true,
      totalPoints: true,
      currentStreak: true,
      longestStreak: true,
      onboardingCompleted: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  const [recentSessions, recentCheckins] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId: id },
      orderBy: { startedAt: "desc" },
      take: 10,
      select: { id: true, status: true, startedAt: true, completedAt: true, totalSeconds: true, overallFeeling: true },
    }),
    prisma.dailyCheckin.findMany({
      where: { userId: id },
      orderBy: { date: "desc" },
      take: 5,
      select: { id: true, date: true, mood: true, note: true },
    }),
  ]);

  return NextResponse.json({ user, recentSessions, recentCheckins });
}
