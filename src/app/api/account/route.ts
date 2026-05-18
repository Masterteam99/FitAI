import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  confirmText: z.literal("ELIMINA"),
  password: z.string().optional(),
});

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Conferma non valida" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  if (user.passwordHash) {
    if (!parsed.data.password) return NextResponse.json({ error: "Password richiesta" }, { status: 400 });
    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Password non corretta" }, { status: 401 });
  }

  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ ok: true });
}
