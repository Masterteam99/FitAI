"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { Plus, Loader2 } from "lucide-react";
import { copy } from "@/content/copy";

interface Entry { id: string; date: string; weightKg: number | null; waistCm: number | null; notes?: string | null }

export function WeightMeasuresCard() {
  const c = copy.progressi;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/progress-entries")
      .then((r) => r.json())
      .then((d: { entries: Entry[] }) => setEntries(d.entries ?? []))
      .finally(() => setLoaded(true));
  }, []);

  async function save() {
    const w = weight.trim() === "" ? null : Number(weight);
    const wa = waist.trim() === "" ? null : Number(waist);
    if (w == null && wa == null) return;
    setSaving(true);
    const res = await fetch("/api/progress-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weightKg: w, waistCm: wa }),
    });
    setSaving(false);
    if (res.ok) {
      const e: Entry = await res.json();
      setEntries((prev) => [...prev, e]);
      setWeight(""); setWaist(""); setOpen(false);
    }
  }

  if (!loaded) return null;

  const weightSeries = entries.filter((e) => e.weightKg != null).map((e) => ({ label: format(parseISO(e.date), "dd/MM"), weight: e.weightKg as number }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{c.weightTitle}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)} className="gap-1.5">
            <Plus className="w-4 h-4" />{c.weightAdd}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">{c.weightSubtitle}</p>

        {open && (
          <div className="flex items-end gap-2 flex-wrap">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{c.weightLabel}</label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-28" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">{c.waistLabel}</label>
              <Input type="number" value={waist} onChange={(e) => setWaist(e.target.value)} className="w-28" />
            </div>
            <Button size="sm" onClick={save} disabled={saving || (weight.trim() === "" && waist.trim() === "")} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {c.weightSave}
            </Button>
          </div>
        )}

        {weightSeries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{c.weightEmpty}</p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={["dataMin - 2", "dataMax + 2"]} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v) => [c.weightTooltip(Number(v ?? 0)), ""]}
              />
              <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
