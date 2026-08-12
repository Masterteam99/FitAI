import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;

  const [user, sessions, userAchievements, analyses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true, currentStreak: true, longestStreak: true },
    }),
    prisma.workoutSession.findMany({
      where: { userId, status: "COMPLETED" },
      select: { completedAt: true, totalSeconds: true, overallFeeling: true },
      orderBy: { completedAt: "desc" },
      take: 100,
    }),
    prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: { select: { name: true, icon: true, rarity: true } } },
      orderBy: { unlockedAt: "desc" },
    }),
    prisma.analysisSession.findMany({
      where: { userId, status: "COMPLETED", combinedScore: { not: null } },
      select: { combinedScore: true, completedAt: true, exercise: { select: { name: true } } },
      orderBy: { completedAt: "asc" },
      take: 60,
    }),
  ]);

  const formScores = analyses
    .filter((a) => a.completedAt != null)
    .map((a) => ({
      date: a.completedAt!.toISOString(),
      score: Math.round(a.combinedScore ?? 0),
      exercise: a.exercise.name,
    }));

  const totalMinutes = Math.round(sessions.reduce((a, s) => a + (s.totalSeconds ?? 0), 0) / 60);

  const now = new Date();
  const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };

  const last30Days = startOfDay(new Date(now.getTime() - 30 * 24 * 3600 * 1000));
  const daysActive30 = new Set(
    sessions
      .filter((s) => s.completedAt && s.completedAt >= last30Days)
      .map((s) => startOfDay(s.completedAt!).toISOString())
  ).size;

  const weeklyVolume: { weekStart: string; minutes: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 3600 * 1000);
    const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 3600 * 1000);
    const minutes = sessions
      .filter((s) => s.completedAt && s.completedAt >= weekStart && s.completedAt < weekEnd)
      .reduce((a, s) => a + Math.round((s.totalSeconds ?? 0) / 60), 0);
    weeklyVolume.push({ weekStart: weekStart.toISOString(), minutes });
  }

  const feelings = sessions.map((s) => s.overallFeeling).filter((f): f is number => f != null);
  const avgFeeling = feelings.length > 0 ? feelings.reduce((a, b) => a + b, 0) / feelings.length : null;

  return NextResponse.json({
    totalSessions: sessions.length,
    totalMinutes,
    currentStreak: user?.currentStreak ?? 0,
    longestStreak: user?.longestStreak ?? 0,
    totalPoints: user?.totalPoints ?? 0,
    daysActive30,
    weeklyVolume,
    avgFeeling,
    formScores,
    recentSessions: sessions.map((s) => ({
      completedAt: s.completedAt?.toISOString(),
      totalSeconds: s.totalSeconds,
      overallFeeling: s.overallFeeling,
    })),
    achievements: userAchievements.map((ua) => ({
      achievement: ua.achievement,
      unlockedAt: ua.unlockedAt.toISOString(),
    })),
  });
}
