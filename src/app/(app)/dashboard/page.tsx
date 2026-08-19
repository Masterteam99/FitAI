import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration, formatDate } from "@/lib/utils";
import { getDailyMission } from "@/lib/dailyMission";
import type { FinalReport, L1Result, L2Result, L3Result } from "@/types/analysis";
import { computeImbalances, muscleLabel } from "@/lib/body-map";
import { computeNutritionTargets, DEFAULT_TARGETS } from "@/lib/nutrition-targets";
import { copy } from "@/content/copy";
import type { Metadata } from "next";
import { DashboardContent } from "./DashboardContent";

export const metadata: Metadata = { title: copy.dashboard.meta.title };

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [user, activePlan, recentSessions, achievements, mission, imbalances, streakSessions, totalSessions, weeklySessions, lastAnalysis, todayNutritionLogs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, currentStreak: true, totalPoints: true, longestStreak: true, age: true, weightKg: true, heightCm: true, primaryGoal: true } }),
    prisma.workoutPlan.findFirst({ where: { userId, isActive: true }, include: { days: { include: { exercises: { include: { exercise: true } } } } } }),
    prisma.workoutSession.findMany({ where: { userId, status: "COMPLETED" }, orderBy: { completedAt: "desc" }, take: 5, include: { planDay: true } }),
    prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true }, orderBy: { unlockedAt: "desc" }, take: 3 }),
    getDailyMission(userId),
    computeImbalances(userId, 30),
    prisma.workoutSession.findMany({
      where: { userId, status: "COMPLETED", completedAt: { gte: new Date(Date.now() - 90 * DAY_MS) } },
      select: { completedAt: true },
    }),
    prisma.workoutSession.count({ where: { userId, status: "COMPLETED" } }),
    prisma.workoutSession.count({ where: { userId, status: "COMPLETED", completedAt: { gte: new Date(Date.now() - 7 * DAY_MS) } } }),
    prisma.analysisSession.findFirst({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      select: { combinedScore: true, completedAt: true, finalReport: true, l1Result: true, l2Result: true, l3Result: true, exercise: { select: { name: true } } },
    }),
    prisma.nutritionLog.findMany({ where: { userId, date: { gte: todayStart, lte: todayEnd } }, select: { calories: true, proteinG: true, carbsG: true, fatG: true } }),
  ]);

  const nutritionTargets = computeNutritionTargets({ weightKg: user?.weightKg, heightCm: user?.heightCm, age: user?.age, goal: user?.primaryGoal }) ?? DEFAULT_TARGETS;
  const nutritionTotals = todayNutritionLogs.reduce(
    (acc, l) => ({ calories: acc.calories + l.calories, protein: acc.protein + l.proteinG, carbs: acc.carbs + l.carbsG, fat: acc.fat + l.fatG }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Aggrega streak ultimi 90 giorni
  const streakMap = new Map<string, number>();
  for (const s of streakSessions) {
    if (!s.completedAt) continue;
    const iso = s.completedAt.toISOString().slice(0, 10);
    streakMap.set(iso, (streakMap.get(iso) ?? 0) + 1);
  }
  const streakData = Array.from(streakMap.entries()).map(([date, count]) => ({ date, count }));

  const topImbalances = imbalances.slice(0, 3).map((i) => ({
    muscle: i.muscle,
    label: muscleLabel(i.muscle as never),
    daysSinceLast: i.daysSinceLast,
  }));
  const weeklyTarget = activePlan?.workoutsPerWeek ?? 3;
  const weeklyRemaining = Math.max(0, weeklyTarget - weeklySessions);

  // Form Score hero (dalla struttura dei mockup): protagonista = ultima analisi.
  const today = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  const fr = (lastAnalysis?.finalReport ?? null) as FinalReport | null;
  const l1 = (lastAnalysis?.l1Result ?? null) as L1Result | null;
  const l2 = (lastAnalysis?.l2Result ?? null) as L2Result | null;
  const l3 = (lastAnalysis?.l3Result ?? null) as L3Result | null;
  const heroScore = Math.round(lastAnalysis?.combinedScore ?? fr?.combinedScore ?? 0);
  const scoreVerdict = heroScore >= 85 ? "Ottima esecuzione" : heroScore >= 70 ? "Buona esecuzione" : heroScore >= 50 ? "Da migliorare" : "Attenzione alla tecnica";
  const heroStats = lastAnalysis
    ? [
        { label: "Biomeccanica", value: `${Math.round(l1?.score ?? 0)}` },
        { label: "Analisi AI", value: `${Math.round(l2?.score ?? 0)}` },
        { label: "Confronto PT", value: `${Math.round(l3?.score ?? 0)}` },
        { label: "Rischio infortuni", value: fr?.injuryRiskAlert?.level ?? "—" },
      ]
    : [];

  return (
    <DashboardContent
      today={today}
      firstName={user?.name?.split(" ")[0] ?? null}
      currentStreak={user?.currentStreak ?? 0}
      longestStreak={user?.longestStreak ?? 0}
      totalPoints={user?.totalPoints ?? 0}
      totalSessions={totalSessions}
      weeklySessions={weeklySessions}
      weeklyTarget={weeklyTarget}
      weeklyRemaining={weeklyRemaining}
      heroExercise={lastAnalysis?.exercise.name ?? null}
      heroContextLabel={lastAnalysis?.completedAt ? formatDate(lastAnalysis.completedAt) : undefined}
      heroScore={heroScore}
      heroVerdict={scoreVerdict}
      heroNote={fr?.overallJudgment}
      heroCorrection={fr?.prioritizedImprovements?.[0]}
      heroStats={heroStats}
      hasAnalysis={!!lastAnalysis}
      activePlan={
        activePlan
          ? {
              name: activePlan.name,
              workoutsPerWeek: activePlan.workoutsPerWeek,
              durationWeeks: activePlan.durationWeeks,
              days: activePlan.days.map((d) => ({
                id: d.id,
                dayNumber: d.dayNumber,
                name: d.name,
                restDay: d.restDay,
                exercisesCount: d.exercises.length,
              })),
            }
          : null
      }
      recentSessionsProgressCount={recentSessions.length}
      recentSessions={recentSessions.map((s) => ({
        id: s.id,
        name: s.planDay?.name ?? null,
        completedAtFormatted: formatDate(s.completedAt!),
        durationFormatted: s.totalSeconds ? formatDuration(s.totalSeconds) : null,
      }))}
      streakData={streakData}
      nutritionTargetCalories={nutritionTargets.calories}
      nutritionTotals={nutritionTotals}
      imbalances={imbalances.map((i) => ({ muscle: i.muscle, deficitPct: i.deficitPct }))}
      topImbalances={topImbalances}
      achievements={achievements.map((ua) => ({
        id: ua.id,
        icon: ua.achievement.icon,
        name: ua.achievement.name,
        points: ua.achievement.points,
      }))}
      mission={mission}
    />
  );
}
