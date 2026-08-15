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
import { toast } from "@/components/ui/toaster";
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
  lastWorkoutDate: string | null;
  aiCostEur: number;
  revenueEur: number;
  marginEur: number;
};

type Response = {
  users: UserRow[];
  page: number;
  totalPages: number;
  counters: { total: number; premium: number; admin: number };
  economics: { mrrEur: number; aiCostEur: number; marginEur: number; period: string };
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
      toast({ title: successLabel, variant: "success" });
    } else {
      const data = await res.json().catch(() => ({}));
      toast({
        title: copy.adminUsers.table.actionFailed(successLabel, data.error ?? copy.adminUsers.table.unknownError),
        variant: "destructive",
      });
    }
  };

  if (!data) return <div className="text-sm text-muted-foreground">{copy.adminUsers.table.loading}</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AdminMetricCard label={copy.adminUsers.table.metricTotal} value={data.counters.total} />
        <AdminMetricCard label={copy.adminUsers.table.metricPremium} value={data.counters.premium} tone="premium" />
        <AdminMetricCard label={copy.adminUsers.table.metricAdmin} value={data.counters.admin} tone="success" />
      </div>

      {/* Economia utenti: ricavo (MRR) vs costo AI stimato → margine */}
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <h2 className="text-sm font-semibold">{copy.adminUsers.table.econTitle}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AdminMetricCard label={copy.adminUsers.table.metricMrr} value={copy.adminUsers.table.eur(data.economics.mrrEur)} tone="success" />
          <AdminMetricCard label={copy.adminUsers.table.metricAiCost} value={copy.adminUsers.table.eur(data.economics.aiCostEur)} tone="premium" />
          <AdminMetricCard label={copy.adminUsers.table.metricMargin} value={copy.adminUsers.table.eur(data.economics.marginEur)} tone={data.economics.marginEur >= 0 ? "success" : "danger"} />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">{copy.adminUsers.table.econHint}</p>
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
                  {" · "}
                  {u.lastWorkoutDate
                    ? copy.adminUsers.table.lastWorkout(new Date(u.lastWorkoutDate).toLocaleDateString("it-IT"))
                    : copy.adminUsers.table.lastWorkoutNever}
                </div>
                <div className="flex gap-3 mt-1 text-xs flex-wrap">
                  <span className="text-purple-600 dark:text-purple-500">
                    {copy.adminUsers.table.colCost}: {copy.adminUsers.table.eur(u.aiCostEur)}
                  </span>
                  <span className="text-green-600 dark:text-green-500">
                    {copy.adminUsers.table.colRevenue}: {copy.adminUsers.table.eur(u.revenueEur)}
                  </span>
                  <span className={u.marginEur >= 0 ? "text-green-600 dark:text-green-500 font-medium" : "text-red-600 dark:text-red-500 font-medium"}>
                    {copy.adminUsers.table.colMargin}: {copy.adminUsers.table.eur(u.marginEur)}
                  </span>
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
