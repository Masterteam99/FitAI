import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
  tags: z.array(z.string().max(60)).max(50),
  professionalNotes: z.string().max(2000).nullable().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const ex = await prisma.exercise.findUnique({ where: { id }, select: { id: true } });
  if (!ex) return NextResponse.json({ error: "Esercizio non trovato" }, { status: 404 });

  await prisma.exercise.update({
    where: { id },
    data: { tags: parsed.data.tags, professionalNotes: parsed.data.professionalNotes ?? null },
  });

  return NextResponse.json({ ok: true });
}
