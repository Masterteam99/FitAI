"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";

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
          <h2 className="text-lg font-semibold">{copy.userDetail.title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>{copy.userDetail.close}</Button>
        </div>

        {loading && <div className="text-sm text-muted-foreground">{copy.userDetail.loading}</div>}
        {data && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">{copy.userDetail.profileTitle}</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                <div><strong>{copy.userDetail.labelEmail}</strong>: {data.user.email}</div>
                <div><strong>{copy.userDetail.labelName}</strong>: {data.user.name ?? copy.userDetail.dash}</div>
                <div><strong>{copy.userDetail.labelLevel}</strong>: {data.user.fitnessLevel ?? copy.userDetail.dash} · {copy.userDetail.labelAge} {data.user.age ?? copy.userDetail.dash} · {data.user.weightKg ?? copy.userDetail.dash}{copy.userDetail.weightUnit} / {data.user.heightCm ?? copy.userDetail.dash}{copy.userDetail.heightUnit}</div>
                <div><strong>{copy.userDetail.labelRegistered}</strong>: {new Date(data.user.createdAt).toLocaleString("it-IT")}</div>
                <div className="flex gap-2 mt-2">
                  {data.user.isAdmin && <Badge className="bg-green-600 text-white">{copy.userDetail.badgeAdmin}</Badge>}
                  <Badge variant="outline">{data.user.subscriptionStatus}</Badge>
                  {data.user.subscriptionPlan && <Badge variant="outline">{data.user.subscriptionPlan}</Badge>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">{copy.userDetail.engagementTitle}</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>{copy.userDetail.engagementLine(data.user.totalPoints, data.user.currentStreak, data.user.longestStreak)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">{copy.userDetail.billingTitle}</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                <div>{copy.userDetail.billingStatus(data.user.subscriptionStatus)}</div>
                {data.user.subscriptionCurrentPeriodEnd && (
                  <div>{copy.userDetail.billingPeriod(new Date(data.user.subscriptionCurrentPeriodEnd).toLocaleDateString("it-IT"))}</div>
                )}
                {data.user.stripeCustomerId && (
                  <a
                    className="text-cyan-600 underline"
                    href={`https://dashboard.stripe.com/customers/${data.user.stripeCustomerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {copy.userDetail.stripeLink}
                  </a>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">{copy.userDetail.sessionsTitle}</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                {data.recentSessions.length === 0 && <div className="text-muted-foreground">{copy.userDetail.sessionsEmpty}</div>}
                {data.recentSessions.map((s) => (
                  <div key={s.id} className="flex justify-between border-b border-border py-1 last:border-0">
                    <span>{new Date(s.startedAt).toLocaleDateString("it-IT")}</span>
                    <span className="text-muted-foreground">
                      {s.status} · {s.totalSeconds ? copy.userDetail.sessionDuration(Math.round(s.totalSeconds / 60)) : copy.userDetail.dash}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">{copy.userDetail.checkinsTitle}</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-1">
                {data.recentCheckins.length === 0 && <div className="text-muted-foreground">{copy.userDetail.checkinsEmpty}</div>}
                {data.recentCheckins.map((c) => (
                  <div key={c.id} className="flex justify-between border-b border-border py-1 last:border-0">
                    <span>{new Date(c.date).toLocaleDateString("it-IT")}</span>
                    <span className="text-muted-foreground">{copy.userDetail.mood(c.mood)}</span>
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
