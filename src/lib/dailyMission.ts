import { prisma } from "@/lib/prisma";
import {
  NUTRITION_TASK_THRESHOLD,
  MOOD_EMOJI,
  type DailyMission,
  type MissionTaskStatus,
  type WorkoutMissionTask,
  type NutritionMissionTask,
  type CheckinMissionTask,
} from "@/lib/dailyMission-shared";

export * from "@/lib/dailyMission-shared";

function todayUtcMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function getDailyMission(userId: string): Promise<DailyMission> {
  const today = todayUtcMidnight();
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [activePlan, sessionsCompletedCount, sessionToday, nutritionCount, checkin] = await Promise.all([
    prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      include: { days: { orderBy: { dayNumber: "asc" } } },
    }),
    prisma.workoutSession.count({
      where: { userId, status: "COMPLETED" },
    }),
    prisma.workoutSession.findFirst({
      where: {
        userId,
        status: "COMPLETED",
        completedAt: { gte: today, lt: tomorrow },
      },
      select: { id: true, planDayId: true },
    }),
    prisma.nutritionLog.count({
      where: { userId, date: { gte: today, lt: tomorrow } },
    }),
    prisma.dailyCheckin.findUnique({
      where: { userId_date: { userId, date: today } },
    }),
  ]);

  let workout: WorkoutMissionTask;
  if (!activePlan || activePlan.days.length === 0) {
    workout = {
      kind: "workout",
      status: "pending",
      label: "Crea il tuo piano AI",
      ctaHref: "/allenamento",
      restDay: false,
      hasPlan: false,
    };
  } else {
    const nextIdx = sessionsCompletedCount % activePlan.days.length;
    const targetDay = activePlan.days[nextIdx];
    const isCompletedToday = sessionToday?.planDayId === targetDay.id;
    workout = {
      kind: "workout",
      status: targetDay.restDay ? "done" : isCompletedToday ? "done" : "pending",
      label: targetDay.restDay
        ? `${targetDay.name} — Riposo`
        : `Day ${targetDay.dayNumber} — ${targetDay.name}`,
      ctaHref: "/allenamento",
      restDay: targetDay.restDay,
      hasPlan: true,
    };
  }

  const nutritionStatus: MissionTaskStatus =
    nutritionCount >= NUTRITION_TASK_THRESHOLD
      ? "done"
      : nutritionCount > 0
        ? "in_progress"
        : "pending";
  const nutrition: NutritionMissionTask = {
    kind: "nutrition",
    status: nutritionStatus,
    label: `Pasti loggati: ${Math.min(nutritionCount, NUTRITION_TASK_THRESHOLD)}/${NUTRITION_TASK_THRESHOLD}`,
    ctaHref: "/nutrizione",
    loggedCount: nutritionCount,
    threshold: NUTRITION_TASK_THRESHOLD,
  };

  const checkinTask: CheckinMissionTask = checkin
    ? {
        kind: "checkin",
        status: "done",
        label: `Oggi ti senti ${MOOD_EMOJI[checkin.mood] ?? ""}`,
        selectedMood: checkin.mood,
      }
    : {
        kind: "checkin",
        status: "pending",
        label: "Come ti senti oggi?",
        selectedMood: null,
      };

  const completedCount = [workout, nutrition, checkinTask].filter((t) => t.status === "done").length;

  return {
    date: today.toISOString().slice(0, 10),
    workout,
    nutrition,
    checkin: checkinTask,
    completedCount,
  };
}
