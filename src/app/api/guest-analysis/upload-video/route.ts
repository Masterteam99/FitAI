import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";
import { GUEST_SESSION_COOKIE } from "@/lib/guest-analysis";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const ACCEPTED_MIME = ["video/webm", "video/mp4", "video/quicktime"];

export async function POST(req: NextRequest) {
  const cookieToken = req.cookies.get(GUEST_SESSION_COOKIE)?.value;
  if (!cookieToken) return NextResponse.json({ error: "Sessione scaduta, ricomincia la prova gratuita" }, { status: 401 });

  const formData = await req.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Multipart form data richiesto" }, { status: 400 });

  const guestSessionId = formData.get("guestSessionId");
  if (typeof guestSessionId !== "string" || guestSessionId !== cookieToken) {
    return NextResponse.json({ error: "Sessione non valida" }, { status: 401 });
  }

  const file = formData.get("video");
  if (!(file instanceof File)) return NextResponse.json({ error: "Campo 'video' mancante o non è un file" }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "File video vuoto" }, { status: 400 });
  if (file.size > MAX_VIDEO_BYTES) return NextResponse.json({ error: `Video troppo grande (max ${MAX_VIDEO_BYTES / 1024 / 1024}MB)` }, { status: 413 });
  if (!ACCEPTED_MIME.includes(file.type)) return NextResponse.json({ error: `Formato non supportato. Accettati: ${ACCEPTED_MIME.join(", ")}` }, { status: 415 });

  const guestRequest = await prisma.guestAnalysisRequest.findUnique({ where: { id: guestSessionId } });
  if (!guestRequest) return NextResponse.json({ error: "Sessione di prova non trovata" }, { status: 404 });

  const ext = file.type === "video/mp4" ? "mp4" : file.type === "video/quicktime" ? "mov" : "webm";
  const path = `guest/${guestSessionId}/${Date.now()}.${ext}`;

  const supabaseAdmin = getSupabaseAdmin();
  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.ANALYSIS_VIDEOS)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) {
    console.error("Supabase upload error (guest):", uploadError);
    return NextResponse.json({ error: "Errore durante l'upload del video" }, { status: 500 });
  }

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.ANALYSIS_VIDEOS)
    .createSignedUrl(path, 60 * 60 * 24);
  if (signError || !signed) {
    console.error("Signed URL error (guest):", signError);
    return NextResponse.json({ error: "Errore generazione URL video" }, { status: 500 });
  }

  await prisma.guestAnalysisRequest.update({
    where: { id: guestSessionId },
    data: { videoUrl: signed.signedUrl, videoPath: path, status: "PROCESSING" },
  });

  return NextResponse.json({ videoUrl: signed.signedUrl, path });
}
