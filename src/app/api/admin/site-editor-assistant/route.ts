import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { auth } from "@/lib/auth";
import { anthropic, MODELS } from "@/lib/anthropic";
import { aiRatelimit } from "@/lib/redis";
import { copy } from "@/content/copy";
import { isEditableKey } from "@/lib/site-content";
import { ALLOWED_COLORS, ALLOWED_SIZES } from "@/app/api/admin/site-style/route";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const schema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).default([]),
  fields: z.array(z.object({ key: z.string(), currentText: z.string() })).max(80),
});

const APPLY_EDIT_TOOL: Anthropic.Tool = {
  name: "apply_edit",
  description: "Applica una modifica di testo e/o stile a un campo editabile della pagina, identificato dalla sua chiave esatta.",
  input_schema: {
    type: "object",
    properties: {
      key: { type: "string", description: "La chiave esatta del campo da modificare, presa dall'elenco fornito." },
      text: { type: "string", description: "Nuovo testo del campo. Ometti se non va cambiato." },
      color: { type: "string", enum: [...ALLOWED_COLORS], description: "Nuovo colore. Ometti se non va cambiato." },
      fontSize: { type: "string", enum: [...ALLOWED_SIZES], description: "Nuova dimensione. Ometti se non va cambiata." },
    },
    required: ["key"],
  },
};

function systemPrompt(fields: { key: string; currentText: string }[]): string {
  const fieldList = fields.map((f) => `- ${f.key}: "${f.currentText}"`).join("\n");
  return `Sei l'assistente dell'editor visuale del sito Motion Insight, usato da un amministratore per modificare il copy e lo stile (colore, dimensione) delle pagine pubbliche, senza scrivere codice.

Campi editabili presenti in questa pagina (chiave: testo attuale):
${fieldList}

Quando l'admin chiede una modifica:
- Identifica il campo giusto dall'elenco sopra in base al significato della richiesta (non serve che l'admin conosca la chiave tecnica).
- Chiama lo strumento apply_edit per ogni campo da modificare, con SOLO i parametri che cambiano (testo e/o colore e/o dimensione).
- Se la richiesta è ambigua (potrebbe riferirsi a più campi, o non è chiaro cosa cambiare), NON chiamare apply_edit: fai una domanda di chiarimento nella risposta testuale.
- Se la richiesta non riguarda nessun campo di questa pagina, spiegalo brevemente.
- Rispondi sempre in italiano, in modo breve e diretto (1-2 frasi), confermando cosa hai fatto.`;
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const session = await auth();
  const { success } = await aiRatelimit.limit(session?.user?.id ?? "site-editor-assistant");
  if (!success) return NextResponse.json({ error: "Troppe richieste. Riprova tra un minuto." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });
  const { message, history, fields } = parsed.data;

  try {
    const response = await anthropic.messages.create({
      model: MODELS.DEFAULT,
      max_tokens: 1024,
      system: systemPrompt(fields),
      tools: [APPLY_EDIT_TOOL],
      messages: [
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user" as const, content: message },
      ],
    });

    const edits: { key: string; text?: string; color?: string; fontSize?: string }[] = [];
    let reply = "";
    for (const block of response.content) {
      if (block.type === "text") reply += block.text;
      if (block.type === "tool_use" && block.name === "apply_edit") {
        const input = block.input as { key: string; text?: string; color?: string; fontSize?: string };
        if (isEditableKey(copy, input.key)) {
          edits.push(input);
        }
      }
    }

    if (!reply) {
      reply = edits.length > 0
        ? `Ho applicato ${edits.length === 1 ? "la modifica" : `${edits.length} modifiche`} richiesta.`
        : "Non sono riuscito a capire quale campo modificare — puoi essere più specifico?";
    }

    return NextResponse.json({ reply, edits });
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const msg = rawMsg.includes("credit balance")
      ? "Il credito API del provider AI è esaurito: il gestore deve ricaricarlo dalla console Anthropic (Plans & Billing)."
      : "Assistente non disponibile al momento. Riprova.";
    console.error("[site-editor-assistant] error", rawMsg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
