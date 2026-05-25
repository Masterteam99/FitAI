import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    mauUsers,
    dauUsers,
    workouts30,
    analyses30,
    checkins30,
    newUsersDaily,
    workoutsDaily,
    topExercises,
    fitnessLevelDistRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        OR: [
          { workoutSessions: { some: { startedAt: { gte: thirtyDaysAgo } } } },
          { analysisSessions: { some: { startedAt: { gte: thirtyDaysAgo } } } },
          { nutritionLogs: { some: { date: { gte: thirtyDaysAgo } } } },
        ],
      },
    }),
    prisma.user.count({
      where: {
        OR: [
          { workoutSessions: { some: { startedAt: { gte: todayStart } } } },
          { analysisSessions: { some: { startedAt: { gte: todayStart } } } },
        ],
      },
    }),
    prisma.workoutSession.count({ where: { status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } } }),
    prisma.analysisSession.count({ where: { startedAt: { gte: thirtyDaysAgo } } }),
    prisma.dailyCheckin.count({ where: { date: { gte: thirtyDaysAgo } } }),
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::bigint AS count
      FROM "users"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT DATE_TRUNC('day', "completedAt")::date AS day, COUNT(*)::bigint AS count
      FROM "workout_sessions"
      WHERE "status" = 'COMPLETED' AND "completedAt" >= ${thirtyDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw<Array<{ exerciseId: string; name: string; count: bigint }>>`
      SELECT e.id AS "exerciseId", e.name, COUNT(wse.id)::bigint AS count
      FROM "exercises" e
      JOIN "workout_session_exercises" wse ON wse."exerciseId" = e.id
      JOIN "workout_sessions" ws ON ws.id = wse."sessionId"
      WHERE ws."status" = 'COMPLETED' AND ws."completedAt" >= ${thirtyDaysAgo}
      GROUP BY e.id, e.name
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.user.groupBy({
      by: ["fitnessLevel"],
      _count: { _all: true },
    }),
  ]);

  return NextResponse.json({
    counters: {
      totalUsers,
      mauUsers,
      dauUsers,
      workouts30,
      analyses30,
      checkins30,
    },
    newUsersDaily: newUsersDaily.map((d) => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.count) })),
    workoutsDaily: workoutsDaily.map((d) => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.count) })),
    topExercises: topExercises.map((e) => ({ id: e.exerciseId, name: e.name, count: Number(e.count) })),
    fitnessLevelDistribution: fitnessLevelDistRaw.map((r) => ({ level: r.fitnessLevel, count: r._count._all })),
  });
}
