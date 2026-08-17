import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

async function guard() {
  await requireAdmin();
}

export async function GET() {
  try {
    await guard();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const rewards = await prisma.leaderboardReward.findMany({ orderBy: { rankFrom: "asc" } });
  return NextResponse.json({ rewards });
}

const CreateSchema = z.object({
  rankFrom: z.number().int().min(1),
  rankTo: z.number().int().min(1),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await guard();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const parsed = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  const d = parsed.data;
  if (d.rankTo < d.rankFrom) return NextResponse.json({ error: "L'ultima posizione deve essere ≥ alla prima" }, { status: 400 });

  const created = await prisma.leaderboardReward.create({
    data: { rankFrom: d.rankFrom, rankTo: d.rankTo, title: d.title, description: d.description ?? null },
  });
  return NextResponse.json({ reward: created }, { status: 201 });
}
