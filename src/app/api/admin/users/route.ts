import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";
import { estimateCostEur } from "@/lib/billing/ai-pricing";
import { userMonthlyRevenueEur, MONTHLY_REVENUE_EUR } from "@/lib/billing/plan-revenue";

const PAGE_SIZE = 50;

function periodCurrent(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const q = url.searchParams.get("q")?.trim() ?? "";
  const filter = url.searchParams.get("filter") ?? "all";
  const period = periodCurrent();

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }
  const now = new Date();
  const premiumWhere: Prisma.UserWhereInput = {
    OR: [
      { subscriptionStatus: { in: ["ACTIVE", "TRIALING"] } },
      { premiumGrantedUntil: { gt: now } },
    ],
  };
  if (filter === "premium") where.OR = premiumWhere.OR;
  else if (filter === "free") {
    where.subscriptionStatus = "FREE";
    where.AND = [{ OR: [{ premiumGrantedUntil: null }, { premiumGrantedUntil: { lte: now } }] }];
  } else if (filter === "admin") where.isAdmin = true;

  const [total, totalPremium, totalAdmin, users, filteredCount, payingByPlan, allUsageThisMonth] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: premiumWhere }),
    prisma.user.count({ where: { isAdmin: true } }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        premiumGrantedUntil: true,
        createdAt: true,
        lastWorkoutDate: true,
        _count: { select: { workoutSessions: true } },
      },
    }),
    prisma.user.count({ where }),
    // Ricavo mensile ricorrente (MRR): utenti paganti raggruppati per piano.
    prisma.user.groupBy({
      by: ["subscriptionPlan"],
      where: { subscriptionStatus: { in: ["ACTIVE", "TRIALING"] } },
      _count: { _all: true },
    }),
    // Costo AI dell'intera piattaforma nel mese corrente (stima da UsageCounter).
    prisma.usageCounter.groupBy({
      by: ["feature"],
      where: { period },
      _sum: { count: true },
    }),
  ]);

  // Costo AI per-utente (mese corrente): usage counters della pagina.
  const pageIds = users.map((u) => u.id);
  const pageUsage = pageIds.length
    ? await prisma.usageCounter.findMany({
        where: { userId: { in: pageIds }, period },
        select: { userId: true, feature: true, count: true },
      })
    : [];
  const callsByUser = new Map<string, Record<string, number>>();
  for (const c of pageUsage) {
    const m = callsByUser.get(c.userId) ?? {};
    m[c.feature] = (m[c.feature] ?? 0) + c.count;
    callsByUser.set(c.userId, m);
  }

  // Aggregati piattaforma.
  let mrrEur = 0;
  for (const g of payingByPlan) {
    const perUser = g.subscriptionPlan === "YEARLY" ? MONTHLY_REVENUE_EUR.YEARLY : MONTHLY_REVENUE_EUR.MONTHLY;
    mrrEur += perUser * (g._count._all ?? 0);
  }
  mrrEur = Math.round(mrrEur * 100) / 100;

  const platformCalls: Record<string, number> = {};
  for (const r of allUsageThisMonth) platformCalls[r.feature] = r._sum.count ?? 0;
  const aiCostEur = estimateCostEur(platformCalls);
  const marginEur = Math.round((mrrEur - aiCostEur) * 100) / 100;

  return NextResponse.json({
    users: users.map((u) => {
      const revenueEur = userMonthlyRevenueEur({ subscriptionStatus: u.subscriptionStatus, subscriptionPlan: u.subscriptionPlan });
      const costEur = estimateCostEur(callsByUser.get(u.id) ?? {});
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        isAdmin: u.isAdmin,
        subscriptionStatus: u.subscriptionStatus,
        subscriptionPlan: u.subscriptionPlan,
        premiumGrantedUntil: u.premiumGrantedUntil && u.premiumGrantedUntil > now ? u.premiumGrantedUntil.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
        sessionsCount: u._count.workoutSessions,
        lastWorkoutDate: u.lastWorkoutDate?.toISOString() ?? null,
        aiCostEur: costEur,
        revenueEur,
        marginEur: Math.round((revenueEur - costEur) * 100) / 100,
      };
    }),
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(filteredCount / PAGE_SIZE) || 1,
    counters: { total, premium: totalPremium, admin: totalAdmin },
    economics: { mrrEur, aiCostEur, marginEur, period },
  });
}
