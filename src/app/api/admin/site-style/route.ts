import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { copy } from "@/content/copy";
import { isEditableKey } from "@/lib/site-content";
import { z } from "zod";

// Palette e taglie ammesse — whitelist, non input libero: evita che l'admin
// (o una richiesta malformata) inietti CSS arbitrario nel sito pubblico.
export const ALLOWED_COLORS = ["default", "green", "terracotta", "sand", "muted"] as const;
export const ALLOWED_SIZES = ["default", "sm", "lg", "xl"] as const;

const PutSchema = z.object({
  key: z.string().min(1),
  color: z.enum(ALLOWED_COLORS).nullable().optional(),
  fontSize: z.enum(ALLOWED_SIZES).nullable().optional(),
});

async function guard() {
  await requireAdmin();
}

export async function PUT(req: NextRequest) {
  try {
    await guard();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const parsed = PutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  const { key, color, fontSize } = parsed.data;

  if (!isEditableKey(copy, key)) {
    return NextResponse.json({ error: "Chiave non editabile" }, { status: 400 });
  }

  const colorVal = color && color !== "default" ? color : null;
  const sizeVal = fontSize && fontSize !== "default" ? fontSize : null;

  if (!colorVal && !sizeVal) {
    await prisma.siteStyleOverride.deleteMany({ where: { key } });
    return NextResponse.json({ key, color: null, fontSize: null });
  }

  await prisma.siteStyleOverride.upsert({
    where: { key },
    create: { key, color: colorVal, fontSize: sizeVal },
    update: { color: colorVal, fontSize: sizeVal },
  });
  return NextResponse.json({ key, color: colorVal, fontSize: sizeVal });
}
