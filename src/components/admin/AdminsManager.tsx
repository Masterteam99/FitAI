"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { ConfirmActionButton } from "./ConfirmActionButton";
import { copy } from "@/content/copy";

type Data = {
  envEmails: string[];
  admins: Array<{ id: string; email: string; name: string | null; origin: "auto" | "manual"; createdAt: string }>;
};

export function AdminsManager() {
  const { data: session } = useSession();
  const router = useRouter();
  const [data, setData] = useState<Data | null>(null);
  const [promoteEmail, setPromoteEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = () => fetch("/api/admin/admins").then(async (r) => r.ok && setData(await r.json()));

  useEffect(() => { fetchData(); }, []);

  const promote = async () => {
    setError(null);
    const res = await fetch("/api/admin/admins/promote", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: promoteEmail }),
    });
    if (res.ok) { setPromoteEmail(""); fetchData(); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? copy.adminAdmins.manager.error); }
  };

  const revoke = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}/admin`, { method: "DELETE" });
    if (res.ok) { fetchData(); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? copy.adminAdmins.manager.error); }
  };

  if (!data) return <div className="text-sm text-muted-foreground">{copy.adminAdmins.manager.loading}</div>;

  const selfEmail = (session?.user?.email ?? "").toLowerCase();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">{copy.adminAdmins.manager.envTitle}</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {copy.adminAdmins.manager.envHintPre}<code>{copy.adminAdmins.manager.envHintCode}</code>{copy.adminAdmins.manager.envHintPost}
          <div className="mt-2 space-y-1">
            {data.envEmails.length === 0 && <div>{copy.adminAdmins.manager.envEmpty}</div>}
            {data.envEmails.map((e) => <div key={e} className="font-mono">{e}</div>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">{copy.adminAdmins.manager.currentTitle(data.admins.length)}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.admins.map((a) => {
            const isSelf = a.email.toLowerCase() === selfEmail;
            return (
              <div key={a.id} className="flex justify-between items-center border border-border rounded-md p-2">
                <div className="text-xs">
                  <div className="font-semibold flex items-center gap-2">
                    {a.email}
                    {isSelf && <Badge variant="outline">{copy.adminAdmins.manager.youBadge}</Badge>}
                  </div>
                  <div className="text-muted-foreground">
                    {a.origin === "auto" ? copy.adminAdmins.manager.originAuto : copy.adminAdmins.manager.originManual} · {new Date(a.createdAt).toLocaleDateString("it-IT")}
                  </div>
                </div>
                <ConfirmActionButton
                  label={copy.adminAdmins.manager.revoke}
                  tone="danger"
                  disabled={isSelf}
                  onConfirm={() => revoke(a.id)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">{copy.adminAdmins.manager.promoteTitle}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              placeholder={copy.adminAdmins.manager.promotePlaceholder}
              className="flex-1"
            />
            <Button onClick={promote} disabled={!promoteEmail.trim()}>{copy.adminAdmins.manager.promote}</Button>
          </div>
          {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
