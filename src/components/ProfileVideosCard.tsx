"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Trash2, Loader2, ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { copy } from "@/content/copy";

interface VideoItem {
  id: string;
  exerciseName: string;
  completedAt: string | null;
}

export function ProfileVideosCard() {
  const c = copy.profilo.videos;
  const [items, setItems] = useState<VideoItem[] | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAll, setBusyAll] = useState(false);

  useEffect(() => {
    fetch("/api/me/videos")
      .then((r) => r.json())
      .then((d: { items: VideoItem[] }) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  async function deleteOne(id: string) {
    setBusyId(id);
    await fetch(`/api/me/videos?id=${id}`, { method: "DELETE" });
    setItems((prev) => (prev ?? []).filter((v) => v.id !== id));
    setBusyId(null);
  }

  async function deleteAll() {
    if (!confirm(c.confirmDeleteAll)) return;
    setBusyAll(true);
    await fetch("/api/me/videos?all=1", { method: "DELETE" });
    setItems([]);
    setBusyAll(false);
  }

  if (items === null) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          {c.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{items.length > 0 ? c.countLabel(items.length) : c.empty}</p>

        {items.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)} className="gap-2">
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
              {c.manage}
            </Button>
            <Button variant="destructive" size="sm" onClick={deleteAll} disabled={busyAll} className="gap-2">
              {busyAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {c.deleteAll}
            </Button>
          </div>
        )}

        {expanded && items.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            {items.map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-3 text-sm p-2 rounded-lg bg-secondary/40">
                <div className="min-w-0">
                  <p className="font-medium truncate">{v.exerciseName}</p>
                  {v.completedAt && <p className="text-xs text-muted-foreground">{formatDate(new Date(v.completedAt))}</p>}
                </div>
                <button onClick={() => deleteOne(v.id)} disabled={busyId === v.id} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                  {busyId === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
