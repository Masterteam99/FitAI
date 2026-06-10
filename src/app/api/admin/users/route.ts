import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

const PAGE_SIZE = 50;

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

  const [total, totalPremium, totalAdmin, users, filteredCount] = await Promise.all([
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
        _count: { select: { workoutSessions: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      isAdmin: u.isAdmin,
      subscriptionStatus: u.subscriptionStatus,
      subscriptionPlan: u.subscriptionPlan,
      premiumGrantedUntil: u.premiumGrantedUntil && u.premiumGrantedUntil > now ? u.premiumGrantedUntil.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
      sessionsCount: u._count.workoutSessions,
    })),
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(filteredCount / PAGE_SIZE) || 1,
    counters: { total, premium: totalPremium, admin: totalAdmin },
  });
}
