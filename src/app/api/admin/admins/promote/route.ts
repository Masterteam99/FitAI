import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";

export async function POST(req: NextRequest) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email mancante" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, isAdmin: true } });
  if (!target) return NextResponse.json({ error: "Utente non trovato — deve registrarsi prima" }, { status: 404 });
  if (target.isAdmin) return NextResponse.json({ ok: true, alreadyAdmin: true });

  await prisma.user.update({ where: { id: target.id }, data: { isAdmin: true } });
  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "PROMOTE_ADMIN",
    targetType: "user",
    targetId: target.id,
    payload: { targetEmail: target.email, via: "admins-page-form" },
  });

  return NextResponse.json({ ok: true, userId: target.id });
}
