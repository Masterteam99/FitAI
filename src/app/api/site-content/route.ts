import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Overrides } from "@/lib/site-content";

export const dynamic = "force-dynamic";

// Pubblico: restituisce solo la mappa degli override (dot-path → stringa).
// Il client li applica sopra i default di copy.ts via useCopy().
export async function GET() {
  const rows = await prisma.siteContent.findMany({ select: { key: true, value: true } });
  const overrides: Overrides = {};
  for (const r of rows) {
    if (typeof r.value === "string") overrides[r.key] = r.value;
  }
  return NextResponse.json({ overrides });
}
