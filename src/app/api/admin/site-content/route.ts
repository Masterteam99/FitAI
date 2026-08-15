import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { copy } from "@/content/copy";
import { editableEntries, isEditableKey } from "@/lib/site-content";
import { z } from "zod";

export const dynamic = "force-dynamic";

async function guard() {
  await requireAdmin();
}

// GET: elenco chiavi editabili (foglie stringa di copy.ts) con default + override attuale.
export async function GET() {
  try {
    await guard();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const entries = editableEntries(copy);
  const rows = await prisma.siteContent.findMany({ select: { key: true, value: true } });
  const overrideMap = new Map(rows.map((r) => [r.key, typeof r.value === "string" ? r.value : null]));

  return NextResponse.json({
    entries: entries.map((e) => ({
      key: e.key,
      default: e.default,
      override: overrideMap.get(e.key) ?? null,
    })),
    overrideCount: rows.length,
  });
}

const PutSchema = z.object({
  key: z.string().min(1),
  // value null/"" => elimina l'override (torna al default)
  value: z.string().max(5000).nullable(),
});

// PUT: imposta o rimuove un override per una chiave (validata nella whitelist).
export async function PUT(req: NextRequest) {
  try {
    await guard();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const parsed = PutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  const { key, value } = parsed.data;

  if (!isEditableKey(copy, key)) {
    return NextResponse.json({ error: "Chiave non editabile" }, { status: 400 });
  }

  const trimmed = value?.trim() ?? "";
  if (trimmed === "") {
    await prisma.siteContent.deleteMany({ where: { key } });
    return NextResponse.json({ key, override: null });
  }

  await prisma.siteContent.upsert({
    where: { key },
    create: { key, value: trimmed },
    update: { value: trimmed },
  });
  return NextResponse.json({ key, override: trimmed });
}
