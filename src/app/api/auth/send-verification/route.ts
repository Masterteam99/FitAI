import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { randomBytes } from "node:crypto";
import { sendVerifyEmail } from "@/lib/email";
import { authEmailRatelimit } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailVerified: true } });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await authEmailRatelimit.limit(`${ip}:${user.email}`);
  if (!success) return NextResponse.json({ error: "Troppe richieste, riprova più tardi" }, { status: 429 });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.emailVerificationToken.create({ data: { token, userId, expiresAt } });

  try {
    await sendVerifyEmail(user.email, token);
  } catch (err) {
    console.error("[send-verification] email send failed:", err);
    return NextResponse.json({ error: "Errore invio email" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
