import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { id } = await params;
  const report = await prisma.analysisSession.findFirst({
    where: { id, userId: session.user.id },
    include: { exercise: { select: { name: true, slug: true } } },
  });

  if (!report) return NextResponse.json({ error: "Report non trovato" }, { status: 404 });
  return NextResponse.json(report);
}
