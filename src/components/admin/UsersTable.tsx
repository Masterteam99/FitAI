"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConfirmActionButton } from "./ConfirmActionButton";
import { AdminMetricCard } from "./AdminMetricCard";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { copy } from "@/content/copy";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  premiumGrantedUntil: string | null;
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
  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
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
      alert(copy.adminUsers.table.actionFailed(successLabel, data.error ?? copy.adminUsers.table.unknownError));
    }
  };

  if (!data) return <div className="text-sm text-muted-foreground">{copy.adminUsers.table.loading}</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <AdminMetricCard label={copy.adminUsers.table.metricTotal} value={data.counters.total} />
        <AdminMetricCard label={copy.adminUsers.table.metricPremium} value={data.counters.premium} tone="premium" />
        <AdminMetricCard label={copy.adminUsers.table.metricAdmin} value={data.counters.admin} tone="success" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={onSearch} className="flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={copy.adminUsers.table.searchPlaceholder}
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
              {copy.adminUsers.table.filters[f]}
            </Button>
          ))}
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">{copy.adminUsers.table.updating}</div>}

      <div className="space-y-2">
        {data.users.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span className="truncate">{u.name ?? copy.adminUsers.table.noName}</span>
                  {u.isAdmin && <Badge className="bg-green-600 text-white">{copy.adminUsers.table.badgeAdmin}</Badge>}
                  {(u.subscriptionStatus === "ACTIVE" || u.subscriptionStatus === "TRIALING") && (
                    <Badge className="bg-amber-500 text-white">{copy.adminUsers.table.badgePremium}</Badge>
                  )}
                  {u.premiumGrantedUntil && (
                    <Badge className="bg-violet-600 text-white">{copy.adminUsers.table.badgeGranted}</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {u.email} · {copy.adminUsers.table.meta(new Date(u.createdAt).toLocaleDateString("it-IT"), u.sessionsCount)}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap shrink-0">
                {u.isAdmin ? (
                  <ConfirmActionButton
                    label={copy.adminUsers.table.revokeAdmin}
                    tone="danger"
                    onConfirm={() => handleAction(`/api/admin/users/${u.id}/admin`, "DELETE", copy.adminUsers.table.revokeAdminLabel)}
                  />
                ) : (
                  <ConfirmActionButton
                    label={copy.adminUsers.table.makeAdmin}
                    tone="success"
                    onConfirm={() => handleAction(`/api/admin/users/${u.id}/admin`, "POST", copy.adminUsers.table.promoteAdminLabel)}
                  />
                )}
                {u.subscriptionStatus === "FREE" && (
                  <ConfirmActionButton
                    label={copy.adminUsers.table.grantPremium}
                    tone="warning"
                    onConfirm={() => handleAction(`/api/admin/users/${u.id}/grant-premium`, "POST", copy.adminUsers.table.grantPremiumLabel)}
                  />
                )}
                <Button size="sm" variant="outline" onClick={() => setDrawerUserId(u.id)}>
                  {copy.adminUsers.table.detail}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {drawerUserId && <UserDetailDrawer userId={drawerUserId} onClose={() => setDrawerUserId(null)} />}

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{copy.adminUsers.table.pageInfo(data.page, data.totalPages)}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>{copy.adminUsers.table.prev}</Button>
          <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>{copy.adminUsers.table.next}</Button>
        </div>
      </div>
    </div>
  );
}
