import { prisma } from "@/lib/prisma";

export const FREE_QUOTAS = {
  generate_plan: 3,
  generate_nutrition_plan: 1,
  analysis_start: 5,
} as const;

export type GatedFeature = keyof typeof FREE_QUOTAS;

export type GatingResult =
  | { ok: true; premium: boolean; remaining?: number }
  | { ok: false; reason: "QUOTA_EXCEEDED" | "PREMIUM_REQUIRED"; limit?: number; resetAt?: Date };

const PREMIUM_STATUSES = new Set(["ACTIVE", "TRIALING"]);

function currentPeriod(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function isPremium(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true, subscriptionCurrentPeriodEnd: true },
  });
  if (!user) return false;
  if (!PREMIUM_STATUSES.has(user.subscriptionStatus)) return false;
  if (user.subscriptionCurrentPeriodEnd && user.subscriptionCurrentPeriodEnd < new Date()) return false;
  return true;
}

export async function checkQuota(userId: string, feature: GatedFeature): Promise<GatingResult> {
  if (await isPremium(userId)) return { ok: true, premium: true };

  const limit = FREE_QUOTAS[feature];
  const period = currentPeriod();
  const counter = await prisma.usageCounter.findUnique({
    where: { userId_feature_period: { userId, feature, period } },
  });
  const used = counter?.count ?? 0;
  if (used >= limit) {
    const nextMonth = new Date();
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1, 1);
    nextMonth.setUTCHours(0, 0, 0, 0);
    return { ok: false, reason: "QUOTA_EXCEEDED", limit, resetAt: nextMonth };
  }
  return { ok: true, premium: false, remaining: limit - used };
}

export async function incrementUsage(userId: string, feature: GatedFeature): Promise<void> {
  const period = currentPeriod();
  await prisma.usageCounter.upsert({
    where: { userId_feature_period: { userId, feature, period } },
    create: { userId, feature, period, count: 1 },
    update: { count: { increment: 1 } },
  });
}

export async function requirePremium(userId: string): Promise<GatingResult> {
  if (await isPremium(userId)) return { ok: true, premium: true };
  return { ok: false, reason: "PREMIUM_REQUIRED" };
}
