"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare, CheckCircle2 } from "lucide-react";
import { copy } from "@/content/copy";

interface Item {
  id: string;
  type: "FITNESS" | "NUTRITION";
  message: string;
  status: "PENDING" | "REVIEWED";
  createdAt: string;
  userEmail: string;
  userName: string | null;
}

export default function AdminRevisionsPage() {
  const c = copy.adminRevisions;
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/revisions")
      .then((r) => r.json())
      .then((d: { items?: Item[] }) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function markReviewed(id: string) {
    await fetch("/api/admin/revisions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "REVIEWED" }),
    });
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "REVIEWED" } : i)));
  }

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <h1 className="text-xl font-bold flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        {c.title}
      </h1>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{c.empty}</p>
      ) : (
        items.map((i) => (
          <Card key={i.id} className={i.status === "REVIEWED" ? "opacity-60" : ""}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{i.type === "FITNESS" ? c.typeFitness : c.typeNutrition}</Badge>
                <Badge variant={i.status === "PENDING" ? "default" : "outline"}>
                  {i.status === "PENDING" ? c.statusPending : c.statusReviewed}
                </Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(i.createdAt).toLocaleDateString("it-IT")}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{i.message}</p>
              <p className="text-xs text-muted-foreground">{i.userName ?? "—"} · {i.userEmail}</p>
              {i.status === "PENDING" && (
                <Button size="sm" variant="outline" onClick={() => markReviewed(i.id)} className="gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  {c.markReviewed}
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
