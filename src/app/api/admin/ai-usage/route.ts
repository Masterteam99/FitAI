import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { estimateCostEur, FEATURE_TOKEN_ESTIMATES } from "@/lib/billing/ai-pricing";

const PAGE_SIZE = 6;

function periodCurrent(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function periodsLastN(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const periodNow = periodCurrent();
  const last6 = periodsLastN(PAGE_SIZE);

  const [byFeatureNow, byPeriod, topUsersNow, freeUsersTotal, freeUsersAtLimit] = await Promise.all([
    prisma.usageCounter.groupBy({
      by: ["feature"],
      where: { period: periodNow },
      _sum: { count: true },
    }),
    prisma.usageCounter.groupBy({
      by: ["period"],
      where: { period: { in: last6 } },
      _sum: { count: true },
    }),
    prisma.usageCounter.groupBy({
      by: ["userId"],
      where: { period: periodNow },
      _sum: { count: true },
      orderBy: { _sum: { count: "desc" } },
      take: 10,
    }),
    prisma.user.count({ where: { subscriptionStatus: "FREE" } }),
    prisma.user.count({
      where: {
        subscriptionStatus: "FREE",
        usageCounters: {
          some: {
            period: periodNow,
            OR: [
              { feature: "generate_plan", count: { gte: 3 } },
              { feature: "analysis_start", count: { gte: 5 } },
              { feature: "generate_nutrition_plan", count: { gte: 1 } },
            ],
          },
        },
      },
    }),
  ]);

  const userIds = topUsersNow.map((u) => u.userId);
  const userInfo = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });
  const userMap = new Map(userInfo.map((u) => [u.id, u.email]));

  const callsThisMonth: Record<string, number> = {};
  for (const r of byFeatureNow) callsThisMonth[r.feature] = r._sum.count ?? 0;

  const costEur = estimateCostEur(callsThisMonth);
  const percentFreeAtLimit = freeUsersTotal > 0 ? Math.round((freeUsersAtLimit / freeUsersTotal) * 1000) / 10 : 0;

  return NextResponse.json({
    costEur,
    percentFreeAtLimit,
    byFeatureNow: Object.entries(callsThisMonth).map(([feature, count]) => ({ feature, count })),
    byPeriod: byPeriod.map((p) => ({ period: p.period, count: p._sum.count ?? 0 })).sort((a, b) => b.period.localeCompare(a.period)),
    topUsers: topUsersNow.map((u) => ({ userId: u.userId, email: userMap.get(u.userId) ?? "?", count: u._sum.count ?? 0 })),
    knownFeatures: Object.keys(FEATURE_TOKEN_ESTIMATES),
  });
}
