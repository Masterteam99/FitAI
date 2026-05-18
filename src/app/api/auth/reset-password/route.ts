import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const schema = z.object({
  token: z.string().min(32),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const record = await prisma.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!record) return NextResponse.json({ error: "Token non valido o scaduto" }, { status: 400 });
  if (record.usedAt) return NextResponse.json({ error: "Token già utilizzato" }, { status: 400 });
  if (record.expiresAt < new Date()) return NextResponse.json({ error: "Token scaduto" }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ ok: true });
}
