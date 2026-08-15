import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendVerifyEmail, sendEmailChangedNotice } from "@/lib/email";
import { randomBytes } from "node:crypto";
import { authEmailRatelimit } from "@/lib/redis";

const schema = z.object({
  newEmail: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  const newEmail = parsed.data.newEmail.toLowerCase().trim();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await authEmailRatelimit.limit(`change-email:${ip}:${userId}`);
  if (!success) return NextResponse.json({ error: "Troppe richieste, riprova più tardi" }, { status: 429 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, passwordHash: true } });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  if (user.passwordHash) {
    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Password non corretta" }, { status: 401 });
  }

  if (newEmail === user.email.toLowerCase()) {
    return NextResponse.json({ error: "È già la tua email attuale" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: newEmail } });
  if (existing) return NextResponse.json({ error: "Email già in uso" }, { status: 409 });

  const oldEmail = user.email;
  await prisma.user.update({ where: { id: userId }, data: { email: newEmail, emailVerified: null } });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.emailVerificationToken.create({ data: { token, userId, expiresAt } });

  try {
    await sendVerifyEmail(newEmail, token);
    await sendEmailChangedNotice(oldEmail, newEmail).catch(() => undefined);
  } catch (err) {
    console.error("[change-email] invio email fallito:", err);
  }

  return NextResponse.json({ ok: true, email: newEmail });
}
