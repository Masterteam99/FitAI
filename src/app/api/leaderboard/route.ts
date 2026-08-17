import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TOP_N = 20;

// Classifica per punti totali, solo profili PUBLIC (stesso flag privacy della
// Community: opt-in esplicito dell'utente in Profilo → "Visibilità profilo").
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const [top, rewards, me] = await Promise.all([
    prisma.user.findMany({
      where: { profileVisibility: "PUBLIC", totalPoints: { gt: 0 } },
      select: { id: true, name: true, avatar: true, totalPoints: true, currentStreak: true },
      orderBy: { totalPoints: "desc" },
      take: TOP_N,
    }),
    prisma.leaderboardReward.findMany({
      where: { isActive: true },
      orderBy: { rankFrom: "asc" },
      select: { id: true, rankFrom: true, rankTo: true, title: true, description: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id as string },
      select: { profileVisibility: true, totalPoints: true, currentStreak: true },
    }),
  ]);

  let myRank: number | null = null;
  if (me?.profileVisibility === "PUBLIC" && me.totalPoints > 0) {
    const better = await prisma.user.count({
      where: { profileVisibility: "PUBLIC", totalPoints: { gt: me.totalPoints } },
    });
    myRank = better + 1;
  }

  return NextResponse.json({
    top: top.map((u, i) => ({ rank: i + 1, id: u.id, name: u.name, avatar: u.avatar, points: u.totalPoints, streak: u.currentStreak })),
    rewards,
    isPublic: me?.profileVisibility === "PUBLIC",
    myRank,
    myPoints: me?.totalPoints ?? 0,
  });
}
