import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }> }

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay(); // 0 dom, 1 lun, ..., 6 sab
  const diff = day === 0 ? -6 : 1 - day;
  const r = new Date(d);
  r.setDate(d.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

export async function GET(_req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id as string;
  const { id: planId } = await params;

  const monday = startOfWeekMonday(new Date());

  const sessions = await prisma.workoutSession.findMany({
    where: { planId, userId, status: "COMPLETED", completedAt: { gte: monday } },
    select: { id: true, planDayId: true, completedAt: true, totalSeconds: true, totalVolumeKg: true },
    orderBy: { completedAt: "asc" },
  });

  return NextResponse.json({ items: sessions });
}
