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
  const action = url.searchParams.get("action");
  const actorId = url.searchParams.get("actorId");

  const where: Prisma.AdminActionLogWhereInput = {};
  if (action) where.action = action as Prisma.AdminActionLogWhereInput["action"];
  if (actorId) where.actorId = actorId;

  const [items, total] = await Promise.all([
    prisma.adminActionLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.adminActionLog.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      actorEmail: i.actorEmail,
      action: i.action,
      targetType: i.targetType,
      targetId: i.targetId,
      payload: i.payload,
      createdAt: i.createdAt.toISOString(),
    })),
    page,
    totalPages: Math.ceil(total / PAGE_SIZE) || 1,
  });
}
