"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Detail = {
  user: {
    id: string;
    email: string;
    name: string | null;
    isAdmin: boolean;
    fitnessLevel: string | null;
    age: number | null;
    weightKg: number | null;
    heightCm: number | null;
    subscriptionStatus: string;
    subscriptionPlan: string | null;
    subscriptionCurrentPeriodEnd: string | null;
    stripeCustomerId: string | null;
    createdAt: string;
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
    onboardingCompleted: boolean;
  };
  recentSessions: Array<{
    id: string;
    status: string;
    startedAt: string;
    completedAt: string | null;
    totalSeconds: number | null;
    overallFeeling: number | null;
  }>;
  recentCheckins: Array<{ id: string; date: string; mood: number; note: string | null }>;
};

export function UserDetailDrawer({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}`).then(async (res) => {
      if (res.ok) setData(await res.json());
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 flex justify-end" onClick={onClose}>
      <div
        className="bg-card border-l border-border w-full max-w-md h-full overflow-y-auto p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Dettaglio utente</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </div>

        {loading && <div className="text-sm text-muted-foreground">Caricamento…</div>}
        {data && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Profilo</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                <div><strong>Email</strong>: {data.user.email}</div>
                <div><strong>Nome</strong>: {data.user.name ?? "—"}</div>
                <div><strong>Livello</strong>: {data.user.fitnessLevel ?? "—"} · Età {data.user.age ?? "—"} · {data.user.weightKg ?? "—"}kg / {data.user.heightCm ?? "—"}cm</div>
                <div><strong>Iscritto</strong>: {new Date(data.user.createdAt).toLocaleString("it-IT")}</div>
                <div className="flex gap-2 mt-2">
                  {data.user.isAdmin && <Badge className="bg-green-600 text-white">ADMIN</Badge>}
                  <Badge variant="outline">{data.user.subscriptionStatus}</Badge>
                  {data.user.subscriptionPlan && <Badge variant="outline">{data.user.subscriptionPlan}</Badge>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Engagement</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>Punti: {data.user.totalPoints} · Streak attuale: {data.user.currentStreak} · Max streak: {data.user.longestStreak}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Billing</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>Status: {data.user.subscriptionStatus}</div>
                {data.user.subscriptionCurrentPeriodEnd && (
                  <div>Periodo fino a: {new Date(data.user.subscriptionCurrentPeriodEnd).toLocaleDateString("it-IT")}</div>
                )}
                {data.user.stripeCustomerId && (
                  <a
                    className="text-cyan-600 underline"
                    href={`https://dashboard.stripe.com/customers/${data.user.stripeCustomerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apri in Stripe →
                  </a>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Ultime 10 sessioni workout</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                {data.recentSessions.length === 0 && <div className="text-muted-foreground">Nessuna sessione</div>}
                {data.recentSessions.map((s) => (
                  <div key={s.id} className="flex justify-between border-b border-border py-1 last:border-0">
                    <span>{new Date(s.startedAt).toLocaleDateString("it-IT")}</span>
                    <span className="text-muted-foreground">
                      {s.status} · {s.totalSeconds ? Math.round(s.totalSeconds / 60) + "m" : "—"}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Ultimi 5 check-in</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                {data.recentCheckins.length === 0 && <div className="text-muted-foreground">Nessun check-in</div>}
                {data.recentCheckins.map((c) => (
                  <div key={c.id} className="flex justify-between border-b border-border py-1 last:border-0">
                    <span>{new Date(c.date).toLocaleDateString("it-IT")}</span>
                    <span className="text-muted-foreground">mood {c.mood}/5</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
