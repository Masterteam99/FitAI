"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, CheckCircle2 } from "lucide-react";
import { copy } from "@/content/copy";

export function RevisionRequestForm({ type }: { type: "FITNESS" | "NUTRITION" }) {
  const c = copy.revisione;
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (message.trim().length < 3) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/revision-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, message: message.trim() }),
    });
    setSending(false);
    if (!res.ok) {
      setError(c.error);
      return;
    }
    setSent(true);
    setMessage("");
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          {c.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sent ? (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {c.sent}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{type === "FITNESS" ? c.descFitness : c.descNutrition}</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={c.placeholder}
              maxLength={2000}
              className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={submit} disabled={sending || message.trim().length < 3} className="gap-2">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {c.cta}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
