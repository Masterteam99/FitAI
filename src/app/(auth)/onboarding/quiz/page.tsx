"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronRight } from "lucide-react";
import type { QuizConfig } from "@/lib/quiz";
import { copy } from "@/content/copy";

type Answer = string | string[] | number;

export default function QuizPage() {
  const c = copy.quiz;
  const router = useRouter();
  const [config, setConfig] = useState<QuizConfig | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/quiz").then((r) => r.json()).then(setConfig).catch(() => {});
  }, []);

  function setAns(key: string, v: Answer) { setAnswers((a) => ({ ...a, [key]: v })); }
  function toggleMulti(key: string, val: string) {
    setAnswers((a) => {
      const cur = Array.isArray(a[key]) ? (a[key] as string[]) : [];
      return { ...a, [key]: cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val] };
    });
  }

  async function send(payload: Record<string, Answer>) {
    setSubmitting(true); setError(null);
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    });
    setSubmitting(false);
    if (!res.ok) { setError(c.error); return; }
    router.push("/dashboard");
  }

  async function submit() {
    const missing = config?.questions.some((q) => {
      if (!q.required) return false;
      const v = answers[q.key];
      return v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
    });
    if (missing) { setError(c.missing); return; }
    await send(answers);
  }

  function skip() { send({}); }

  if (!config) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-xl mx-auto p-4 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{c.title}</h1>
        <p className="text-sm text-muted-foreground">{c.subtitle}</p>
      </div>

      {config.questions.map((q) => (
        <Card key={q.key}>
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="font-medium text-sm">{q.title}{q.required && <span className="text-destructive"> *</span>}</p>
              {q.help && <p className="text-xs text-muted-foreground mt-0.5">{q.help}</p>}
            </div>

            {q.type === "single" && (
              <div className="flex flex-wrap gap-2">
                {(q.options ?? []).map((o) => (
                  <button key={o.value} type="button" onClick={() => setAns(q.key, o.value)}
                    className={`px-3 py-2 rounded-xl border text-sm transition-colors ${answers[q.key] === o.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground"}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}

            {q.type === "multi" && (
              <div className="flex flex-wrap gap-2">
                {(q.options ?? []).map((o) => {
                  const on = Array.isArray(answers[q.key]) && (answers[q.key] as string[]).includes(o.value);
                  return (
                    <button key={o.value} type="button" onClick={() => toggleMulti(q.key, o.value)}
                      className={`px-3 py-2 rounded-xl border text-sm transition-colors ${on ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-foreground"}`}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "number" && (
              <Input type="number" min={q.min} max={q.max}
                value={typeof answers[q.key] === "number" ? String(answers[q.key]) : ""}
                onChange={(e) => setAns(q.key, e.target.value === "" ? "" : Number(e.target.value))} className="w-28" />
            )}

            {q.type === "text" && (
              <textarea value={typeof answers[q.key] === "string" ? (answers[q.key] as string) : ""}
                onChange={(e) => setAns(q.key, e.target.value)} maxLength={2000}
                className="w-full bg-secondary/50 border border-border rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[70px]" />
            )}
          </CardContent>
        </Card>
      ))}

      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="space-y-2">
        <Button onClick={submit} disabled={submitting} size="lg" className="w-full gap-2">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
          {c.submit}<ChevronRight className="w-5 h-5" />
        </Button>
        <Button onClick={skip} disabled={submitting} variant="ghost" size="sm" className="w-full text-muted-foreground">
          {c.skip}
        </Button>
      </div>
    </div>
  );
}
