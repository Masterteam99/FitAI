import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  type: z.enum(["FITNESS", "NUTRITION"]),
  message: z.string().min(3).max(2000),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const created = await prisma.revisionRequest.create({
    data: {
      userId: session.user.id as string,
      type: parsed.data.type,
      message: parsed.data.message,
    },
    select: { id: true },
  });

  return NextResponse.json(created, { status: 201 });
}
