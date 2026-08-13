"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RotateCcw, Check } from "lucide-react";
import { copy } from "@/content/copy";

interface Entry {
  key: string;
  default: string;
  override: string | null;
}

const MAX_VISIBLE = 60;

export function SiteContentEditor() {
  const c = copy.adminSiteContent;
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [q, setQ] = useState("");
  const [onlyOverridden, setOnlyOverridden] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/site-content")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => setEntries([]));
  }, []);

  const overriddenCount = useMemo(() => (entries ?? []).filter((e) => e.override !== null).length, [entries]);

  const filtered = useMemo(() => {
    if (!entries) return [];
    const query = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (onlyOverridden && e.override === null) return false;
      if (!query) return true;
      return e.key.toLowerCase().includes(query) || e.default.toLowerCase().includes(query) || (e.override ?? "").toLowerCase().includes(query);
    });
  }, [entries, q, onlyOverridden]);

  const visible = filtered.slice(0, MAX_VISIBLE);

  function valueFor(e: Entry): string {
    return drafts[e.key] ?? e.override ?? e.default;
  }

  async function save(e: Entry, value: string | null) {
    setSavingKey(e.key);
    setErrorKey(null);
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: e.key, value }),
      });
      if (!res.ok) {
        setErrorKey(e.key);
        return;
      }
      const body = await res.json();
      setEntries((prev) => prev?.map((x) => (x.key === e.key ? { ...x, override: body.override } : x)) ?? null);
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[e.key];
        return next;
      });
      setSavedKey(e.key);
      setTimeout(() => setSavedKey((k) => (k === e.key ? null : k)), 2000);
    } catch {
      setErrorKey(e.key);
    } finally {
      setSavingKey(null);
    }
  }

  if (entries === null) return <div className="text-sm text-muted-foreground">{c.loading}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.searchPlaceholder} className="max-w-md" />
        <div className="flex gap-1">
          <Button size="sm" variant={onlyOverridden ? "outline" : "default"} onClick={() => setOnlyOverridden(false)}>{c.all}</Button>
          <Button size="sm" variant={onlyOverridden ? "default" : "outline"} onClick={() => setOnlyOverridden(true)}>{c.onlyOverridden}</Button>
        </div>
        <span className="text-xs text-muted-foreground sm:ml-auto">{c.overriddenCount(overriddenCount)}</span>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{c.empty}</p>
      ) : (
        <div className="space-y-2">
          {visible.map((e) => {
            const val = valueFor(e);
            const dirty = drafts[e.key] !== undefined && drafts[e.key] !== (e.override ?? e.default);
            return (
              <Card key={e.key}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-xs font-mono text-muted-foreground break-all">{e.key}</code>
                    {e.override !== null && <Badge className="bg-amber-500 text-white text-[10px]">{c.overriddenBadge}</Badge>}
                    {savedKey === e.key && <span className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" />{c.saved}</span>}
                    {errorKey === e.key && <span className="text-xs text-destructive">{c.saveError}</span>}
                  </div>
                  <textarea
                    value={val}
                    onChange={(ev) => setDrafts((prev) => ({ ...prev, [e.key]: ev.target.value }))}
                    rows={val.length > 80 ? 3 : 1}
                    className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" className="gap-2 h-7" disabled={savingKey === e.key || !dirty} onClick={() => save(e, drafts[e.key] ?? "")}>
                      {savingKey === e.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      {savingKey === e.key ? c.saving : c.save}
                    </Button>
                    {e.override !== null && (
                      <Button size="sm" variant="outline" className="gap-2 h-7" disabled={savingKey === e.key} onClick={() => save(e, null)}>
                        <RotateCcw className="w-3.5 h-3.5" />
                        {c.reset}
                      </Button>
                    )}
                    {e.override !== null && (
                      <span className="text-[11px] text-muted-foreground truncate">{c.defaultLabel}: {e.default}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length > MAX_VISIBLE && (
            <p className="text-xs text-muted-foreground text-center">+{filtered.length - MAX_VISIBLE} — affina la ricerca per vederne altri.</p>
          )}
        </div>
      )}
    </div>
  );
}
