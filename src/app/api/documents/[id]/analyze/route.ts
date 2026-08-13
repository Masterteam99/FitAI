import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, STORAGE_BUCKETS } from "@/lib/supabase";
import { anthropic, MODELS } from "@/lib/anthropic";
import { aiRatelimit } from "@/lib/redis";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MEDIA_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function mediaTypeFromPath(path: string): string | null {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  return MEDIA_BY_EXT[ext] ?? null;
}

const SYSTEM_PROMPT = `Sei un assistente che aiuta a leggere documenti di fitness e nutrizione (referti, esami del sangue, piani alimentari, schede di allenamento) e a suggerire come adattare il piano dell'utente.
NON sei un medico e NON fornisci diagnosi. Traduci il contenuto in indicazioni pratiche e prudenti.
Rispondi SOLO con un oggetto JSON valido, senza testo attorno, con questa forma esatta:
{
  "summary": "sintesi in italiano di cosa contiene il documento (max 3 frasi)",
  "fitnessAdjustments": ["aggiustamento pratico all'allenamento", "..."],
  "nutritionAdjustments": ["aggiustamento pratico all'alimentazione", "..."],
  "cautions": ["cautela o cosa segnalare a un medico", "..."]
}
Se un array non ha elementi pertinenti, restituiscilo vuoto. Non inventare valori non presenti nel documento.`;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  const userId = session.user.id as string;
  const { id } = await params;

  const { success } = await aiRatelimit.limit(userId);
  if (!success) return NextResponse.json({ error: "Troppe richieste. Riprova tra un minuto." }, { status: 429 });

  const doc = await prisma.userDocument.findFirst({
    where: { id, userId },
    select: { id: true, kind: true, name: true, path: true },
  });
  if (!doc) return NextResponse.json({ error: "Documento non trovato" }, { status: 404 });

  const mediaType = mediaTypeFromPath(doc.path);
  if (!mediaType) return NextResponse.json({ error: "Formato non supportato" }, { status: 415 });

  // Scarica il file dal bucket privato via service-role.
  const admin = getSupabaseAdmin();
  const { data: blob, error: dlErr } = await admin.storage.from(STORAGE_BUCKETS.USER_DOCUMENTS).download(doc.path);
  if (dlErr || !blob) return NextResponse.json({ error: "Impossibile leggere il documento" }, { status: 500 });
  const b64 = Buffer.from(await blob.arrayBuffer()).toString("base64");

  // Contesto utente per rendere gli aggiustamenti pertinenti.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { primaryGoal: true, fitnessLevel: true, dietType: true, medicalNotes: true, age: true, weightKg: true, heightCm: true },
  });
  const profileLine = `Profilo utente — obiettivo: ${user?.primaryGoal ?? "n/d"}, livello: ${user?.fitnessLevel ?? "n/d"}, dieta: ${user?.dietType ?? "n/d"}, età: ${user?.age ?? "n/d"}, peso: ${user?.weightKg ?? "n/d"}kg, altezza: ${user?.heightCm ?? "n/d"}cm. Note mediche: ${user?.medicalNotes ?? "nessuna"}.`;
  const taskLine = `Il documento è di tipo ${doc.kind === "FITNESS" ? "allenamento/fitness" : "nutrizione"}. Analizzalo e proponi gli aggiustamenti.`;

  // Blocco documento (PDF) o immagine, a seconda del tipo file.
  const fileBlock =
    mediaType === "application/pdf"
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } }
      : { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } };

  let text = "";
  try {
    const response = await anthropic.messages.create({
      model: MODELS.DEFAULT,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            fileBlock as never,
            { type: "text", text: `${profileLine}\n\n${taskLine}` },
          ],
        },
      ],
    });
    text = response.content[0]?.type === "text" ? response.content[0].text : "";
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number })?.status ?? 500;
    console.error("[documents/analyze] AI error", { status, err: rawMsg });
    const msg = rawMsg.includes("credit balance")
      ? "Il credito API del provider AI è esaurito: il gestore deve ricaricarlo."
      : "Errore durante l'analisi AI.";
    return NextResponse.json({ error: msg, code: "AI_PROVIDER_ERROR" }, { status: status >= 400 && status < 600 ? status : 500 });
  }

  // Parsing JSON robusto (Claude può rispondere con o senza fence ```json).
  let analysis: {
    summary?: string;
    fitnessAdjustments?: string[];
    nutritionAdjustments?: string[];
    cautions?: string[];
  } | null = null;
  try {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const candidate = fenced ? fenced[1] : text;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("no-json");
    analysis = JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return NextResponse.json({ error: "Output AI non valido", raw: text.slice(0, 300) }, { status: 502 });
  }

  const normalized = {
    summary: typeof analysis?.summary === "string" ? analysis.summary : "",
    fitnessAdjustments: Array.isArray(analysis?.fitnessAdjustments) ? analysis.fitnessAdjustments.filter((s) => typeof s === "string") : [],
    nutritionAdjustments: Array.isArray(analysis?.nutritionAdjustments) ? analysis.nutritionAdjustments.filter((s) => typeof s === "string") : [],
    cautions: Array.isArray(analysis?.cautions) ? analysis.cautions.filter((s) => typeof s === "string") : [],
  };

  const analyzedAt = new Date();
  await prisma.userDocument.update({
    where: { id: doc.id },
    data: { analysisJson: normalized, analyzedAt },
  });

  return NextResponse.json({ analysis: normalized, analyzedAt: analyzedAt.toISOString() });
}
