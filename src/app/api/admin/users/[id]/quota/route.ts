import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
  if (!target) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const result = await prisma.usageCounter.deleteMany({ where: { userId: id, period } });

  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "RESET_USER_QUOTA",
    targetType: "user",
    targetId: id,
    payload: { targetEmail: target.email, period, deletedCount: result.count },
  });

  return NextResponse.json({ ok: true, deletedCount: result.count });
}
