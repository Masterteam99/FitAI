import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const { id } = await params;
  const userId = session.user.id as string;

  const existing = await prisma.socialLike.findUnique({ where: { postId_userId: { postId: id, userId } } });

  if (existing) {
    await prisma.$transaction([
      prisma.socialLike.delete({ where: { id: existing.id } }),
      prisma.socialPost.update({ where: { id }, data: { likesCount: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ liked: false });
  }

  await prisma.$transaction([
    prisma.socialLike.create({ data: { postId: id, userId } }),
    prisma.socialPost.update({ where: { id }, data: { likesCount: { increment: 1 } } }),
  ]);
  return NextResponse.json({ liked: true });
}
