import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { randomBytes } from "node:crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { authEmailRatelimit } from "@/lib/redis";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Email non valida" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await authEmailRatelimit.limit(`${ip}:${parsed.data.email}`);
  if (!success) return NextResponse.json({ ok: true }, { status: 200 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } });
    try {
      await sendPasswordResetEmail(user.email, token);
    } catch (err) {
      console.error("[forgot-password] email send failed:", err);
    }
  }

  return NextResponse.json({ ok: true });
}
