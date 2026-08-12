import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const docs = await prisma.userDocument.findMany({
    where: { userId: session.user.id as string },
    orderBy: { createdAt: "desc" },
    select: { id: true, kind: true, name: true, path: true, createdAt: true },
  });

  const admin = docs.length ? getSupabaseAdmin() : null;
  const items = await Promise.all(
    docs.map(async (d) => {
      let url: string | null = null;
      if (admin) {
        const { data } = await admin.storage.from(STORAGE_BUCKETS.USER_DOCUMENTS).createSignedUrl(d.path, 60 * 60);
        url = data?.signedUrl ?? null;
      }
      return { id: d.id, kind: d.kind, name: d.name, createdAt: d.createdAt.toISOString(), url };
    }),
  );

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Form data richiesto" }, { status: 400 });

  const kind = form.get("kind");
  const file = form.get("file");
  if (kind !== "FITNESS" && kind !== "NUTRITION") return NextResponse.json({ error: "Tipo documento non valido" }, { status: 400 });
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "File mancante" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "File troppo grande (max 10MB)" }, { status: 413 });
  if (!ACCEPTED.includes(file.type)) return NextResponse.json({ error: "Formato non supportato (PDF o immagine)" }, { status: 415 });

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120) || "documento";
  const path = `${userId}/${Date.now()}-${safeName}`;

  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from(STORAGE_BUCKETS.USER_DOCUMENTS).upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("Document upload error:", error);
    return NextResponse.json({ error: "Errore durante il caricamento" }, { status: 500 });
  }

  const doc = await prisma.userDocument.create({
    data: { userId, kind, name: safeName, path },
    select: { id: true, kind: true, name: true, createdAt: true },
  });

  return NextResponse.json({ id: doc.id, kind: doc.kind, name: doc.name, createdAt: doc.createdAt.toISOString(), url: null }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id mancante" }, { status: 400 });

  const doc = await prisma.userDocument.findFirst({ where: { id, userId: session.user.id as string }, select: { id: true, path: true } });
  if (!doc) return NextResponse.json({ error: "Non trovato" }, { status: 404 });

  try {
    await getSupabaseAdmin().storage.from(STORAGE_BUCKETS.USER_DOCUMENTS).remove([doc.path]);
  } catch (e) {
    console.error("Document delete storage error:", e);
  }
  await prisma.userDocument.delete({ where: { id: doc.id } });

  return NextResponse.json({ ok: true });
}
