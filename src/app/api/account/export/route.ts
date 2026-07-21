import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const [user, workoutPlans, workoutSessions, analysisSessions, nutritionLogs, achievements, progressEntries] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, avatar: true, fitnessLevel: true, age: true, weightKg: true,
        heightCm: true, gender: true, primaryGoal: true, availableEquipment: true, weeklyWorkoutDays: true,
        dietType: true, pastInjuries: true, pastSports: true, nutritionPlanJson: true,
        onboardingCompleted: true, emailVerified: true, totalPoints: true, currentStreak: true,
        longestStreak: true, lastWorkoutDate: true, createdAt: true, updatedAt: true,
      },
    }),
    prisma.workoutPlan.findMany({
      where: { userId },
      include: { days: { include: { exercises: { include: { exercise: { select: { name: true, slug: true } } } } } } },
    }),
    prisma.workoutSession.findMany({ where: { userId }, include: { planDay: { select: { name: true } } } }),
    prisma.analysisSession.findMany({ where: { userId } }),
    prisma.nutritionLog.findMany({ where: { userId } }),
    prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true } }),
    prisma.userProgress.findMany({ where: { userId } }),
  ]);

  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  const payload = {
    exportDate: new Date().toISOString(),
    user,
    workoutPlans,
    workoutSessions,
    analysisSessions,
    nutritionLogs,
    achievements,
    progressEntries,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="motion-insight-data-${user.email}-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
