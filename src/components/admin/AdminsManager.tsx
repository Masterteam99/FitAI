"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { ConfirmActionButton } from "./ConfirmActionButton";

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
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); }
  };

  const revoke = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}/admin`, { method: "DELETE" });
    if (res.ok) { fetchData(); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); setError(d.error ?? "Errore"); }
  };

  if (!data) return <div className="text-sm text-muted-foreground">Caricamento…</div>;

  const selfEmail = (session?.user?.email ?? "").toLowerCase();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-sm">Email in ADMIN_EMAILS (env)</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          Queste email vengono promosse automaticamente al primo login. Modifica <code>.env.local</code> e riavvia il server.
          <div className="mt-2 space-y-1">
            {data.envEmails.length === 0 && <div>(nessuna)</div>}
            {data.envEmails.map((e) => <div key={e} className="font-mono">{e}</div>)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Admin attuali ({data.admins.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {data.admins.map((a) => {
            const isSelf = a.email.toLowerCase() === selfEmail;
            return (
              <div key={a.id} className="flex justify-between items-center border border-border rounded-md p-2">
                <div className="text-xs">
                  <div className="font-semibold flex items-center gap-2">
                    {a.email}
                    {isSelf && <Badge variant="outline">tu</Badge>}
                  </div>
                  <div className="text-muted-foreground">
                    {a.origin === "auto" ? "Auto-promosso" : "Promosso manualmente"} · {new Date(a.createdAt).toLocaleDateString("it-IT")}
                  </div>
                </div>
                <ConfirmActionButton
                  label="Revoca"
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
        <CardHeader><CardTitle className="text-sm">Promuovi un utente esistente</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={promoteEmail}
              onChange={(e) => setPromoteEmail(e.target.value)}
              placeholder="email utente registrato..."
              className="flex-1"
            />
            <Button onClick={promote} disabled={!promoteEmail.trim()}>Promuovi</Button>
          </div>
          {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
