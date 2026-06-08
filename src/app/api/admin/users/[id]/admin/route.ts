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

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, isAdmin: true },
  });
  if (!target) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  if (target.isAdmin) return NextResponse.json({ ok: true, alreadyAdmin: true });

  await prisma.user.update({ where: { id }, data: { isAdmin: true } });
  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "PROMOTE_ADMIN",
    targetType: "user",
    targetId: id,
    payload: { targetEmail: target.email },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  if (id === actor.userId) {
    return NextResponse.json({ error: "Non puoi revocare admin a te stesso" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, isAdmin: true },
  });
  if (!target) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  if (!target.isAdmin) return NextResponse.json({ ok: true, alreadyNotAdmin: true });

  const totalAdmins = await prisma.user.count({ where: { isAdmin: true } });
  if (totalAdmins <= 1) {
    return NextResponse.json({ error: "Non puoi revocare l'ultimo admin" }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { isAdmin: false } });
  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "REVOKE_ADMIN",
    targetType: "user",
    targetId: id,
    payload: { targetEmail: target.email },
  });

  return NextResponse.json({ ok: true });
}
