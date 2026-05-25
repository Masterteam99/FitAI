import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;
const PRICE_MONTHLY = Number(process.env.STRIPE_PRICE_MONTHLY_AMOUNT_EUR ?? "9.99");
const PRICE_YEARLY = Number(process.env.STRIPE_PRICE_YEARLY_AMOUNT_EUR ?? "79");

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const status = url.searchParams.get("status") ?? "all";

  const where: Record<string, unknown> = { subscriptionStatus: { not: "FREE" } };
  if (status !== "all") where.subscriptionStatus = status.toUpperCase();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [premiumActive, monthlyActive, yearlyActive, canceledLast30, totalActive30dAgo, renewalsNext7, list, totalRows] = await Promise.all([
    prisma.user.count({ where: { subscriptionStatus: { in: ["ACTIVE", "TRIALING"] } } }),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE", subscriptionPlan: "MONTHLY" } }),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE", subscriptionPlan: "YEARLY" } }),
    prisma.user.count({ where: { subscriptionStatus: "CANCELED", updatedAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { subscriptionStatus: { in: ["ACTIVE", "TRIALING"] }, createdAt: { lte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE", subscriptionCurrentPeriodEnd: { gte: new Date(), lte: sevenDaysAhead } } }),
    prisma.user.findMany({
      where,
      orderBy: { subscriptionCurrentPeriodEnd: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, email: true, subscriptionStatus: true, subscriptionPlan: true, subscriptionCurrentPeriodEnd: true, stripeCustomerId: true },
    }),
    prisma.user.count({ where }),
  ]);

  const mrr = monthlyActive * PRICE_MONTHLY + yearlyActive * (PRICE_YEARLY / 12);
  const churn = totalActive30dAgo > 0 ? (canceledLast30 / totalActive30dAgo) * 100 : 0;

  return NextResponse.json({
    metrics: {
      premiumActive,
      mrrEur: Math.round(mrr * 100) / 100,
      churn30dPct: Math.round(churn * 10) / 10,
      renewalsNext7d: renewalsNext7,
    },
    list: list.map((s) => ({
      ...s,
      subscriptionCurrentPeriodEnd: s.subscriptionCurrentPeriodEnd?.toISOString() ?? null,
    })),
    page,
    totalPages: Math.ceil(totalRows / PAGE_SIZE) || 1,
  });
}
