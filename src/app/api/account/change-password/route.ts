import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendPasswordChangedNotice } from "@/lib/email";

const schema = z.object({
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi (minimo 8 caratteri)" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, passwordHash: true } });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  if (user.passwordHash) {
    if (!parsed.data.currentPassword) {
      return NextResponse.json({ error: "Password attuale richiesta" }, { status: 400 });
    }
    const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Password attuale non corretta" }, { status: 401 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  sendPasswordChangedNotice(user.email).catch((err) => console.error("[change-password] notifica fallita:", err));

  return NextResponse.json({ ok: true });
}
