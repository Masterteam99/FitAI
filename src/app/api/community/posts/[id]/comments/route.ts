import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const { id } = await params;

  const comments = await prisma.socialComment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "asc" },
    take: 100,
    select: { id: true, content: true, createdAt: true, user: { select: { name: true } } },
  });

  return NextResponse.json({
    items: comments.map((c) => ({ id: c.id, content: c.content, createdAt: c.createdAt.toISOString(), userName: c.user.name })),
  });
}

const Schema = z.object({ content: z.string().min(1).max(500) });

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const { id } = await params;

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Commento non valido" }, { status: 400 });

  const created = await prisma.socialComment.create({
    data: { postId: id, userId: session.user.id as string, content: parsed.data.content },
    select: { id: true, content: true, createdAt: true, user: { select: { name: true } } },
  });

  return NextResponse.json(
    { id: created.id, content: created.content, createdAt: created.createdAt.toISOString(), userName: created.user.name },
    { status: 201 },
  );
}
