import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id as string;

  const [allAchievements, userAchievements, user] = await Promise.all([
    prisma.achievement.findMany({ orderBy: [{ rarity: "asc" }, { points: "asc" }] }),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, unlockedAt: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { totalPoints: true, currentStreak: true } }),
  ]);

  const unlockedMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt]));

  const achievements = allAchievements.map((a) => ({
    ...a,
    unlocked: unlockedMap.has(a.id),
    unlockedAt: unlockedMap.get(a.id) ?? null,
  }));

  return NextResponse.json({
    achievements,
    totalPoints: user?.totalPoints ?? 0,
    currentStreak: user?.currentStreak ?? 0,
    unlockedCount: userAchievements.length,
    totalCount: allAchievements.length,
  });
}
