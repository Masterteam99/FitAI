import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({ content: z.string().min(1).max(1000) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Contenuto non valido" }, { status: 400 });

  const post = await prisma.socialPost.create({
    data: { userId: session.user.id as string, type: "WORKOUT_SHARE", content: parsed.data.content },
    select: {
      id: true, type: true, content: true, imageUrl: true, likesCount: true, createdAt: true,
      user: { select: { id: true, name: true, avatar: true } },
    },
  });

  return NextResponse.json(
    { ...post, createdAt: post.createdAt.toISOString(), likedByMe: false, commentsCount: 0 },
    { status: 201 },
  );
}
