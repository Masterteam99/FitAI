import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export interface StyleOverride {
  color?: string;
  fontSize?: string;
}

// Pubblico: mappa dot-path → { color?, fontSize? }. Il client la applica sopra
// il rendering di default via <EditableText>, stesso pattern di /api/site-content.
export async function GET() {
  const rows = await prisma.siteStyleOverride.findMany();
  const overrides: Record<string, StyleOverride> = {};
  for (const r of rows) {
    const entry: StyleOverride = {};
    if (r.color) entry.color = r.color;
    if (r.fontSize) entry.fontSize = r.fontSize;
    if (Object.keys(entry).length > 0) overrides[r.key] = entry;
  }
  return NextResponse.json({ overrides });
}
