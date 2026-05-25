"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConfirmActionButton } from "./ConfirmActionButton";
import { AdminMetricCard } from "./AdminMetricCard";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  createdAt: string;
  sessionsCount: number;
};

type Response = {
  users: UserRow[];
  page: number;
  totalPages: number;
  counters: { total: number; premium: number; admin: number };
};

export function UsersTable() {
  const router = useRouter();
  const [data, setData] = useState<Response | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "premium" | "free" | "admin">("all");
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const url = `/api/admin/users?page=${page}&q=${encodeURIComponent(q)}&filter=${filter}`;
    const res = await fetch(url);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [page, q, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleAction = async (url: string, method: string, successLabel: string) => {
    const res = await fetch(url, { method });
    if (res.ok) {
      startTransition(() => { fetchData(); router.refresh(); });
    } else {
      const data = await res.json().catch(() => ({}));
      alert(`${successLabel} fallita: ${data.error ?? "errore sconosciuto"}`);
    }
  };

  if (!data) return <div className="text-sm text-muted-foreground">Caricamento…</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <AdminMetricCard label="Utenti totali" value={data.counters.total} />
        <AdminMetricCard label="Premium" value={data.counters.premium} tone="premium" />
        <AdminMetricCard label="Admin" value={data.counters.admin} tone="success" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={onSearch} className="flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca email o nome..."
            className="max-w-md"
          />
        </form>
        <div className="flex gap-1 flex-wrap">
          {(["all", "premium", "free", "admin"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {f === "all" ? "Tutti" : f === "premium" ? "Premium" : f === "free" ? "Free" : "Admin"}
            </Button>
          ))}
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Aggiornamento…</div>}

      <div className="space-y-2">
        {data.users.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span className="truncate">{u.name ?? "—"}</span>
                  {u.isAdmin && <Badge className="bg-green-600 text-white">ADMIN</Badge>}
                  {(u.subscriptionStatus === "ACTIVE" || u.subscriptionStatus === "TRIALING") && (
                    <Badge className="bg-amber-500 text-white">PREMIUM</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {u.email} · iscritto {new Date(u.createdAt).toLocaleDateString("it-IT")} · {u.sessionsCount} sessioni
                </div>
              </div>
              <div className="flex gap-2 flex-wrap shrink-0">
                {u.isAdmin ? (
                  <ConfirmActionButton
                    label="Revoca admin"
                    tone="danger"
                    onConfirm={() => handleAction(`/api/admin/users/${u.id}/admin`, "DELETE", "Revoca admin")}
                  />
                ) : (
                  <ConfirmActionButton
                    label="Rendi admin"
                    tone="success"
                    onConfirm={() => handleAction(`/api/admin/users/${u.id}/admin`, "POST", "Promozione admin")}
                  />
                )}
                {u.subscriptionStatus === "FREE" && (
                  <ConfirmActionButton
                    label="Premium 30g"
                    tone="warning"
                    onConfirm={() => handleAction(`/api/admin/users/${u.id}/grant-premium`, "POST", "Grant Premium 30g")}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Pagina {data.page} di {data.totalPages}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
          <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      </div>
    </div>
  );
}
