import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET() {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const items = await prisma.revisionRequest.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: { user: { select: { email: true, name: true } } },
  });

  return NextResponse.json({
    items: items.map((r) => ({
      id: r.id,
      type: r.type,
      message: r.message,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      userEmail: r.user.email,
      userName: r.user.name,
    })),
  });
}

const PatchSchema = z.object({ id: z.string(), status: z.enum(["PENDING", "REVIEWED"]) });

export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  await prisma.revisionRequest.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ ok: true });
}
