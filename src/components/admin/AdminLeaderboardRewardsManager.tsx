"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, AlertTriangle } from "lucide-react";
import { copy } from "@/content/copy";

interface Reward {
  id: string;
  rankFrom: number;
  rankTo: number;
  title: string;
  description: string | null;
  isActive: boolean;
}

export function AdminLeaderboardRewardsManager() {
  const c = copy.adminLeaderboardRewards;
  const [rewards, setRewards] = useState<Reward[] | null>(null);
  const [rankFrom, setRankFrom] = useState("1");
  const [rankTo, setRankTo] = useState("3");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/leaderboard-rewards")
      .then((r) => r.json())
      .then((d) => setRewards(d.rewards ?? []))
      .catch(() => setRewards([]));
  }
  useEffect(load, []);

  async function add() {
    setError(null);
    if (title.trim().length < 2) {
      setError(c.error);
      return;
    }
    setAdding(true);
    const res = await fetch("/api/admin/leaderboard-rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rankFrom: Number(rankFrom) || 1,
        rankTo: Number(rankTo) || Number(rankFrom) || 1,
        title: title.trim(),
        description: description.trim() || undefined,
      }),
    });
    setAdding(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? c.error);
      return;
    }
    setTitle("");
    setDescription("");
    load();
  }

  async function toggleActive(r: Reward) {
    setBusyId(r.id);
    await fetch(`/api/admin/leaderboard-rewards/${r.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !r.isActive }),
    });
    setBusyId(null);
    load();
  }

  async function remove(r: Reward) {
    if (!confirm(c.confirmDelete)) return;
    setBusyId(r.id);
    await fetch(`/api/admin/leaderboard-rewards/${r.id}`, { method: "DELETE" });
    setBusyId(null);
    load();
  }

  if (rewards === null) return <Loader2 className="w-6 h-6 animate-spin text-primary" />;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">{c.rankFromLabel}</label>
              <Input type="number" min={1} value={rankFrom} onChange={(e) => setRankFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">{c.rankToLabel}</label>
              <Input type="number" min={1} value={rankTo} onChange={(e) => setRankTo(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{c.titleLabel}</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Un mese Premium gratis" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{c.descLabel}</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Facoltativa" />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          <Button onClick={add} disabled={adding} className="gap-2">
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {adding ? c.adding : c.add}
          </Button>
        </CardContent>
      </Card>

      {rewards.length === 0 ? (
        <p className="text-sm text-muted-foreground">{c.empty}</p>
      ) : (
        <div className="space-y-2">
          {rewards.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                <span className="font-bold text-sm shrink-0">
                  {r.rankFrom === r.rankTo ? `#${r.rankFrom}` : `#${r.rankFrom}–${r.rankTo}`}
                </span>
                <div className="flex-1 min-w-[160px]">
                  <p className="text-sm font-medium">{r.title}</p>
                  {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                </div>
                <Badge variant={r.isActive ? "default" : "outline"} className={r.isActive ? "" : "text-muted-foreground"}>
                  {r.isActive ? c.activeBadge : c.inactiveBadge}
                </Badge>
                <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => toggleActive(r)}>
                  {r.isActive ? c.deactivate : c.activate}
                </Button>
                <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => remove(r)} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
