import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic, MODELS } from "@/lib/anthropic";
import { aiRatelimit } from "@/lib/redis";
import { SYSTEM_PROMPTS } from "@/services/ai/promptTemplates";
import { requirePremium } from "@/lib/billing/gating";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).default([]),
});

export async function POST(req: NextRequest) {
  try {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const { success } = await aiRatelimit.limit(session.user.id);
  if (!success) return NextResponse.json({ error: "Troppe richieste." }, { status: 429 });

  const gate = await requirePremium(session.user.id as string);
  if (!gate.ok) {
    return NextResponse.json(
      { error: "AI Coach disponibile solo con piano Premium.", code: gate.reason },
      { status: 402 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

  const { message, history } = parsed.data;

  const stream = await anthropic.messages.stream({
    model: MODELS.DEFAULT,
    max_tokens: 1024,
    system: SYSTEM_PROMPTS.AI_COACH,
    messages: [
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ],
  });

  // Attende il primo chunk prima di aprire la risposta: gli errori del provider
  // (credito esaurito, chiave non valida...) escono come JSON pulito dal catch.
  const iterator = stream[Symbol.asyncIterator]();
  const firstChunk = await iterator.next();

  return new Response(
    new ReadableStream({
      async start(controller) {
        try {
          let item = firstChunk;
          while (!item.done) {
            const chunk = item.value;
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(new TextEncoder().encode(chunk.delta.text));
            }
            item = await iterator.next();
          }
          controller.close();
        } catch (err) {
          console.error("[ai-chat] stream error", err);
          controller.error(err);
        }
      },
    }),
    { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store, no-transform" } }
  );
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : String(err);
    const status = (err as { status?: number })?.status ?? 500;
    console.error("[ai-chat] handler error", { status, err: rawMsg });
    const msg = rawMsg.includes("credit balance")
      ? "Il credito API del provider AI è esaurito: il gestore deve ricaricarlo dalla console Anthropic (Plans & Billing)."
      : rawMsg;
    return NextResponse.json({ error: msg, code: "AI_PROVIDER_ERROR" }, { status: status >= 400 && status < 600 ? status : 500 });
  }
}
