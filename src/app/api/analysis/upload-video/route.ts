import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analysisRatelimit } from "@/lib/redis";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";
import { z } from "zod";

const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const ACCEPTED_MIME = ["video/webm", "video/mp4", "video/quicktime"];

const metadataSchema = z.object({
  analysisSessionId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  const userId = session.user.id;

  const { success } = await analysisRatelimit.limit(userId);
  if (!success) {
    return NextResponse.json({ error: "Limite analisi raggiunto (5/ora)." }, { status: 429 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Multipart form data richiesto" }, { status: 400 });
  }

  const parsed = metadataSchema.safeParse({
    analysisSessionId: formData.get("analysisSessionId"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "analysisSessionId mancante" }, { status: 400 });
  }
  const { analysisSessionId } = parsed.data;

  const file = formData.get("video");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Campo 'video' mancante o non è un file" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File video vuoto" }, { status: 400 });
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: `Video troppo grande (max ${MAX_VIDEO_BYTES / 1024 / 1024}MB)` }, { status: 413 });
  }
  if (!ACCEPTED_MIME.includes(file.type)) {
    return NextResponse.json({ error: `Formato non supportato. Accettati: ${ACCEPTED_MIME.join(", ")}` }, { status: 415 });
  }

  const analysisSession = await prisma.analysisSession.findFirst({
    where: { id: analysisSessionId, userId },
  });
  if (!analysisSession) {
    return NextResponse.json({ error: "Sessione di analisi non trovata" }, { status: 404 });
  }

  const ext = file.type === "video/mp4" ? "mp4" : file.type === "video/quicktime" ? "mov" : "webm";
  const path = `${userId}/${analysisSessionId}/${Date.now()}.${ext}`;

  const supabaseAdmin = getSupabaseAdmin();
  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.ANALYSIS_VIDEOS)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error("Supabase upload error:", uploadError);
    return NextResponse.json({ error: "Errore durante l'upload del video" }, { status: 500 });
  }

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKETS.ANALYSIS_VIDEOS)
    .createSignedUrl(path, 60 * 60 * 24);

  if (signError || !signed) {
    console.error("Signed URL error:", signError);
    return NextResponse.json({ error: "Errore generazione URL video" }, { status: 500 });
  }

  await prisma.analysisSession.update({
    where: { id: analysisSessionId },
    data: { videoUrl: signed.signedUrl, status: "PROCESSING" },
  });

  return NextResponse.json({ videoUrl: signed.signedUrl, path });
}
