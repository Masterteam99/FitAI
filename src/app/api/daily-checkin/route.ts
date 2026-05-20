import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  mood: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
});

function todayUtcMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

    const userId = session.user.id as string;
    const date = todayUtcMidnight();

    const checkin = await prisma.dailyCheckin.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, mood: parsed.data.mood, note: parsed.data.note },
      update: { mood: parsed.data.mood, note: parsed.data.note },
    });

    return NextResponse.json({ ok: true, mood: checkin.mood });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[daily-checkin] handler error", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
