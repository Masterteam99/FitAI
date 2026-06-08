import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";
import { logAdminAction } from "@/lib/admin-audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ACCEPTED_MIME = ["video/mp4", "video/webm", "video/quicktime"];

interface Props {
  params: Promise<{ id: string }>;
}

function extToMime(mime: string): "mp4" | "webm" | "mov" {
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/quicktime") return "mov";
  return "webm";
}

function pathFromPublicUrl(url: string): string | null {
  const marker = `/${STORAGE_BUCKETS.EXERCISE_VIDEOS}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function POST(req: NextRequest, { params }: Props) {
  let adminCtx;
  try {
    adminCtx = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    select: { id: true, slug: true, videoUrl: true },
  });
  if (!exercise) {
    return NextResponse.json({ error: "Esercizio non trovato" }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Multipart form data richiesto" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Campo 'file' mancante o non è un file" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File vuoto" }, { status: 400 });
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return NextResponse.json(
      { error: `Video troppo grande (max ${MAX_VIDEO_BYTES / 1024 / 1024}MB)` },
      { status: 413 },
    );
  }
  if (!ACCEPTED_MIME.includes(file.type)) {
    return NextResponse.json(
      { error: `Formato non supportato. Accettati: ${ACCEPTED_MIME.join(", ")}` },
      { status: 415 },
    );
  }

  const ext = extToMime(file.type);
  const path = `pt/${exercise.slug}.${ext}`;
  const supabaseAdmin = getSupabaseAdmin();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.EXERCISE_VIDEOS)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error("[admin pt-video] upload error", uploadError);
    return NextResponse.json({ error: "Errore upload Supabase" }, { status: 500 });
  }

  const { data: pub } = supabaseAdmin.storage
    .from(STORAGE_BUCKETS.EXERCISE_VIDEOS)
    .getPublicUrl(path);

  await prisma.exercise.update({
    where: { id },
    data: { videoUrl: pub.publicUrl },
  });

  await logAdminAction({
    actorId: adminCtx.userId,
    actorEmail: adminCtx.email,
    action: "UPLOAD_PT_VIDEO",
    targetType: "exercise",
    targetId: id,
    payload: { slug: exercise.slug, videoUrl: pub.publicUrl },
  });

  return NextResponse.json({ videoUrl: pub.publicUrl, path, adminEmail: adminCtx.email });
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  let adminCtx;
  try {
    adminCtx = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }

  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({
    where: { id },
    select: { id: true, slug: true, videoUrl: true },
  });
  if (!exercise) {
    return NextResponse.json({ error: "Esercizio non trovato" }, { status: 404 });
  }
  if (!exercise.videoUrl) {
    return NextResponse.json({ ok: true, alreadyEmpty: true });
  }

  const path = pathFromPublicUrl(exercise.videoUrl);
  if (path) {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKETS.EXERCISE_VIDEOS)
      .remove([path]);
    if (error) console.error("[admin pt-video] delete error (continuing)", error);
  }

  await prisma.exercise.update({ where: { id }, data: { videoUrl: null } });

  await logAdminAction({
    actorId: adminCtx.userId,
    actorEmail: adminCtx.email,
    action: "DELETE_PT_VIDEO",
    targetType: "exercise",
    targetId: id,
    payload: { slug: exercise.slug },
  });

  return NextResponse.json({ ok: true });
}
