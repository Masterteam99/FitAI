"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Item = {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  payload: unknown;
  createdAt: string;
};

const ACTION_TONE: Record<string, string> = {
  PROMOTE_ADMIN: "bg-green-600",
  REVOKE_ADMIN: "bg-red-600",
  GRANT_PREMIUM: "bg-amber-500",
  RESET_USER_QUOTA: "bg-cyan-600",
  TOGGLE_EXERCISE_ACTIVE: "bg-blue-500",
  UPLOAD_PT_VIDEO: "bg-purple-500",
  DELETE_PT_VIDEO: "bg-purple-700",
};

export function ActivityLog() {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/activity?page=${page}`).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotalPages(data.totalPages);
      }
    });
  }, [page]);

  return (
    <div className="space-y-2">
      {items.length === 0 && <div className="text-sm text-muted-foreground">Nessuna azione registrata.</div>}
      {items.map((i) => (
        <Card key={i.id}>
          <CardContent className="p-3">
            <button
              type="button"
              onClick={() => setExpanded(expanded === i.id ? null : i.id)}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${ACTION_TONE[i.action] ?? "bg-gray-500"} text-white text-[10px]`}>
                    {i.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(i.createdAt).toLocaleString("it-IT")}
                  </span>
                </div>
                <div className="text-xs truncate">
                  <strong>{i.actorEmail}</strong> → {i.targetType}{i.targetId ? `:${i.targetId}` : ""}
                </div>
              </div>
              <span className="text-xs text-muted-foreground ml-2">{expanded === i.id ? "▾" : "▸"}</span>
            </button>
            {expanded === i.id && (
              <pre className="mt-2 p-2 bg-secondary/50 rounded text-[10px] overflow-x-auto">
                {JSON.stringify(i.payload, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
        <span>Pagina {page} di {totalPages}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      </div>
    </div>
  );
}
