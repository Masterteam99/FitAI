import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, premiumGrantedUntil: true } });
  if (!target) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  // Estende un grant ancora attivo invece di sovrascriverlo; non tocca i campi
  // subscription*, che restano di proprietà esclusiva del webhook Stripe
  const base = target.premiumGrantedUntil && target.premiumGrantedUntil > new Date() ? target.premiumGrantedUntil : new Date();
  const periodEnd = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
  await prisma.user.update({
    where: { id },
    data: { premiumGrantedUntil: periodEnd },
  });

  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "GRANT_PREMIUM",
    targetType: "user",
    targetId: id,
    payload: { targetEmail: target.email, days: 30, periodEnd: periodEnd.toISOString() },
  });

  return NextResponse.json({ ok: true, periodEnd: periodEnd.toISOString() });
}
