import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "30"), 50);
  const cursor = searchParams.get("cursor");

  const userId = session.user.id as string;
  const posts = await prisma.socialPost.findMany({
    where: { user: { profileVisibility: "PUBLIC" } },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    select: {
      id: true,
      type: true,
      content: true,
      imageUrl: true,
      likesCount: true,
      createdAt: true,
      user: { select: { id: true, name: true, avatar: true } },
      likes: { where: { userId }, select: { id: true } },
      _count: { select: { comments: true } },
    },
  });

  const hasMore = posts.length > limit;
  const sliced = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? sliced[sliced.length - 1].id : null;

  const items = sliced.map((p) => ({
    id: p.id,
    type: p.type,
    content: p.content,
    imageUrl: p.imageUrl,
    likesCount: p.likesCount,
    createdAt: p.createdAt,
    user: p.user,
    likedByMe: p.likes.length > 0,
    commentsCount: p._count.comments,
  }));

  return NextResponse.json({ items, nextCursor });
}
