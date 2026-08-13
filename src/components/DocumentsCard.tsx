"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, Loader2, FileText, ExternalLink, Sparkles, Dumbbell, Apple, AlertTriangle } from "lucide-react";
import { copy } from "@/content/copy";

interface DocAnalysis {
  summary: string;
  fitnessAdjustments: string[];
  nutritionAdjustments: string[];
  cautions: string[];
}
interface Doc {
  id: string;
  kind: "FITNESS" | "NUTRITION";
  name: string;
  createdAt: string;
  url: string | null;
  analysis: DocAnalysis | null;
  analyzedAt: string | null;
}

export function DocumentsCard() {
  const c = copy.profilo.documenti;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [kind, setKind] = useState<"FITNESS" | "NUTRITION">("FITNESS");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analyzeError, setAnalyzeError] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((d: { items: Doc[] }) => setDocs(d.items ?? []))
      .catch(() => {});
  }, []);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("kind", kind);
    fd.append("file", file);
    const res = await fetch("/api/documents", { method: "POST", body: fd });
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!res.ok) {
      setError(c.error);
      return;
    }
    const doc: Doc = await res.json();
    setDocs((prev) => [doc, ...prev]);
  }

  async function remove(id: string) {
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  async function analyze(id: string) {
    setAnalyzingId(id);
    setAnalyzeError((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch(`/api/documents/${id}/analyze`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setAnalyzeError((prev) => ({ ...prev, [id]: body.error ?? c.analyzeError }));
        return;
      }
      setDocs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, analysis: body.analysis, analyzedAt: body.analyzedAt } : d)),
      );
    } catch {
      setAnalyzeError((prev) => ({ ...prev, [id]: c.analyzeError }));
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{c.title}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{c.desc}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "FITNESS" | "NUTRITION")}
            className="h-9 px-3 rounded-lg border border-border bg-input text-sm"
          >
            <option value="FITNESS">{c.kindFitness}</option>
            <option value="NUTRITION">{c.kindNutrition}</option>
          </select>
          <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={onFile} className="hidden" id="doc-upload" />
          <Button asChild variant="outline" size="sm" className="gap-2">
            <label htmlFor="doc-upload" className="cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? c.uploading : c.upload}
            </label>
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {docs.length === 0 ? (
          <p className="text-xs text-muted-foreground">{c.empty}</p>
        ) : (
          <div className="space-y-3">
            {docs.map((d) => {
              const busy = analyzingId === d.id;
              return (
                <div key={d.id} className="rounded-lg bg-secondary/40 p-2 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 truncate">{d.name}</span>
                    <Badge variant="secondary" className="text-xs">{d.kind === "FITNESS" ? c.kindFitness : c.kindNutrition}</Badge>
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => remove(d.id)} aria-label={c.deleteAria} className="text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button variant="outline" size="sm" className="gap-2 h-7" disabled={busy} onClick={() => analyze(d.id)}>
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {busy ? c.analyzing : d.analysis ? c.reanalyze : c.analyze}
                    </Button>
                    {analyzeError[d.id] && <span className="text-xs text-destructive">{analyzeError[d.id]}</span>}
                  </div>

                  {d.analysis && (
                    <div className="rounded-lg border border-border/60 bg-background/60 p-3 space-y-3 text-sm">
                      {d.analysis.summary && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{c.analysisSummary}</p>
                          <p>{d.analysis.summary}</p>
                        </div>
                      )}
                      {d.analysis.fitnessAdjustments.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-1"><Dumbbell className="w-3.5 h-3.5" />{c.analysisFitness}</p>
                          <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                            {d.analysis.fitnessAdjustments.map((a, i) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                      {d.analysis.nutritionAdjustments.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 mb-1"><Apple className="w-3.5 h-3.5" />{c.analysisNutrition}</p>
                          <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                            {d.analysis.nutritionAdjustments.map((a, i) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                      {d.analysis.cautions.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1 mb-1"><AlertTriangle className="w-3.5 h-3.5" />{c.analysisCautions}</p>
                          <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                            {d.analysis.cautions.map((a, i) => <li key={i}>{a}</li>)}
                          </ul>
                        </div>
                      )}
                      <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">{c.analysisDisclaimer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
