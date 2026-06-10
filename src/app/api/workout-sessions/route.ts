import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSchema = z.object({
  planId: z.string().optional(),
  planDayId: z.string().optional(),
});

const updateSchema = z.object({
  sessionId: z.string().optional(),
  id: z.string().optional(),
  status: z.enum(["COMPLETED", "CANCELLED"]).optional(),
  totalDuration: z.number().optional(),
  totalSeconds: z.number().optional(),
  totalVolumeKg: z.number().optional(),
  caloriesBurned: z.number().optional(),
  overallFeeling: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
  completedSets: z.record(z.string(), z.array(z.unknown())).optional(),
}).refine((d) => !!(d.sessionId ?? d.id), "sessionId or id required");

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const workoutSession = await prisma.workoutSession.create({
    data: { userId, ...parsed.data },
  });

  return NextResponse.json(workoutSession, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const { sessionId, id: sessionId2, totalDuration, ...data } = parsed.data;
  const resolvedId = sessionId ?? sessionId2!;

  const workoutSession = await prisma.workoutSession.updateMany({
    where: { id: resolvedId, userId },
    data: {
      ...data,
      ...(totalDuration !== undefined && { totalDuration }),
      ...(data.status === "COMPLETED" && { completedAt: new Date() }),
    },
  });

  if (workoutSession.count === 0) return NextResponse.json({ error: "Sessione non trovata" }, { status: 404 });

  // Aggiorna streak e punti utente se completato
  if (data.status === "COMPLETED") {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { currentStreak: true, longestStreak: true, lastWorkoutDate: true, totalPoints: true } });
    if (user) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const lastDate = user.lastWorkoutDate ? new Date(user.lastWorkoutDate) : null;
      lastDate?.setHours(0, 0, 0, 0);

      const newStreak = lastDate?.getTime() === yesterday.getTime() ? user.currentStreak + 1 : 1;

      await prisma.user.update({
        where: { id: userId },
        data: { currentStreak: newStreak, longestStreak: { set: Math.max(newStreak, user.longestStreak) }, lastWorkoutDate: new Date(), totalPoints: { increment: 10 } },
      });

      await checkAndUnlockAchievements(userId, { currentStreak: newStreak });
    }

    await createWorkoutFeedPost(userId, resolvedId).catch((err) => console.error("[feed] post failed:", err));
  }

  return NextResponse.json({ ok: true });
}

async function createWorkoutFeedPost(userId: string, sessionId: string) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: { planDay: { select: { name: true } } },
  });
  if (!session) return;
  const minutes = Math.round((session.totalSeconds ?? 0) / 60);
  const dayName = session.planDay?.name ?? "Allenamento";
  await prisma.socialPost.create({
    data: {
      userId,
      type: "WORKOUT_SHARE",
      content: `${dayName} completato — ${minutes} min`,
      workoutSessionId: sessionId,
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const offset = parseInt(searchParams.get("offset") ?? "0");

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: limit,
    skip: offset,
    include: { planDay: { select: { name: true } } },
  });

  return NextResponse.json(sessions);
}

async function checkAndUnlockAchievements(
  userId: string,
  ctx: { currentStreak: number },
) {
  const totalCompletedSessions = await prisma.workoutSession.count({
    where: { userId, status: "COMPLETED" },
  });

  const candidates: string[] = [];
  if (totalCompletedSessions >= 1) candidates.push("first_workout");
  if (totalCompletedSessions >= 10) candidates.push("ten_workouts");
  if (totalCompletedSessions >= 50) candidates.push("fifty_workouts");
  if (ctx.currentStreak >= 7) candidates.push("week_streak");
  if (ctx.currentStreak >= 30) candidates.push("month_streak");
  if (new Date().getHours() < 7) candidates.push("early_bird");

  if (candidates.length === 0) return;

  // Singola query: achievement candidati non ancora sbloccati dall'utente
  const achievements = await prisma.achievement.findMany({
    where: { key: { in: candidates }, userAchievements: { none: { userId } } },
    select: { id: true, points: true },
  });

  if (achievements.length === 0) return;

  await prisma.$transaction([
    ...achievements.map((a) =>
      prisma.userAchievement.create({ data: { userId, achievementId: a.id } }),
    ),
    prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: achievements.reduce((s, a) => s + (a.points ?? 0), 0),
        },
      },
    }),
  ]);
}
