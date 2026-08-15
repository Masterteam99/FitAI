import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const userId = session.user.id as string;

  await prisma.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    create: {
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userId,
    },
    update: {
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userId,
    },
  });
  await prisma.user.update({ where: { id: userId }, data: { notifyPush: true } });

  return NextResponse.json({ ok: true });
}

const unsubscribeSchema = z.object({ endpoint: z.string().url() });

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = unsubscribeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const userId = session.user.id as string;

  await prisma.pushSubscription.deleteMany({ where: { endpoint: parsed.data.endpoint, userId } });
  const remaining = await prisma.pushSubscription.count({ where: { userId } });
  if (remaining === 0) {
    await prisma.user.update({ where: { id: userId }, data: { notifyPush: false } });
  }

  return NextResponse.json({ ok: true });
}
