import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authEmailRatelimit } from "@/lib/redis";

const schema = z.object({ email: z.string().email() });

// Dopo un login con credenziali fallito, il client chiede se l'account è
// OAuth-only (esiste ma senza password) per mostrare un suggerimento utile
// invece del generico "credenziali errate". Risposta volutamente binaria e
// rate-limited per contenere l'enumeration.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ oauthOnly: false });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { success } = await authEmailRatelimit.limit(`hint:${ip}`);
  if (!success) return NextResponse.json({ oauthOnly: false });

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { passwordHash: true, accounts: { select: { provider: true }, take: 1 } },
  });

  const oauthOnly = !!user && !user.passwordHash && user.accounts.length > 0;
  return NextResponse.json({ oauthOnly });
}
