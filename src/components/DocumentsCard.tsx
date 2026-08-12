"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Trash2, Loader2, FileText, ExternalLink } from "lucide-react";
import { copy } from "@/content/copy";

interface Doc { id: string; kind: "FITNESS" | "NUTRITION"; name: string; createdAt: string; url: string | null }

export function DocumentsCard() {
  const c = copy.profilo.documenti;
  const [docs, setDocs] = useState<Doc[]>([]);
  const [kind, setKind] = useState<"FITNESS" | "NUTRITION">("FITNESS");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-secondary/40">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
