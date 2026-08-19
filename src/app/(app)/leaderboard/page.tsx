"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Flame, Loader2, Lock, Gift } from "lucide-react";
import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

interface LeaderboardRow {
  rank: number;
  id: string;
  name: string | null;
  avatar: string | null;
  points: number;
  streak: number;
}

interface Reward {
  id: string;
  rankFrom: number;
  rankTo: number;
  title: string;
  description: string | null;
}

interface LeaderboardData {
  top: LeaderboardRow[];
  rewards: Reward[];
  isPublic: boolean;
  myRank: number | null;
  myPoints: number;
}

function rewardLabel(r: Reward): string {
  return r.rankFrom === r.rankTo ? `#${r.rankFrom}` : `#${r.rankFrom}–${r.rankTo}`;
}

function initials(name: string | null): string {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function LeaderboardPage() {
  const c = useCopy().leaderboard;
  const [data, setData] = useState<LeaderboardData | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ top: [], rewards: [], isPublic: false, myRank: null, myPoints: 0 }));
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-7 h-7 text-primary" />
          <EditableText path="leaderboard.title">{c.title}</EditableText>
        </h1>
        <p className="text-muted-foreground"><EditableText path="leaderboard.subtitle">{c.subtitle}</EditableText></p>
      </div>

      {!data.isPublic && (
        <Card className="border-dashed border-2">
          <CardContent className="p-4 flex items-center gap-3 text-sm">
            <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p><EditableText path="leaderboard.privateNotice">{c.privateNotice}</EditableText></p>
            </div>
            <Link href="/profilo" className="text-primary font-semibold shrink-0 hover:underline"><EditableText path="leaderboard.goToProfile">{c.goToProfile}</EditableText></Link>
          </CardContent>
        </Card>
      )}

      {data.isPublic && data.myRank && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="p-4 text-sm font-medium">
            {c.yourRank(data.myRank)} · {data.myPoints} pt
          </CardContent>
        </Card>
      )}

      {data.rewards.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <EditableText path="leaderboard.rewardsTitle">{c.rewardsTitle}</EditableText>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.rewards.map((r) => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/40 text-sm">
                <span className="shrink-0 font-bold text-primary">{rewardLabel(r)}</span>
                <div>
                  <p className="font-medium">{r.title}</p>
                  {r.description && <p className="text-muted-foreground text-xs mt-0.5">{r.description}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {data.top.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground"><EditableText path="leaderboard.empty">{c.empty}</EditableText></p>
          ) : (
            <ul className="divide-y">
              {data.top.map((row) => (
                <li key={row.id} className="flex items-center gap-3 p-3">
                  <span className="w-7 text-center font-bold text-sm text-muted-foreground shrink-0">{row.rank}</span>
                  <div className="w-8 h-8 rounded-full grid place-items-center text-xs font-bold shrink-0" style={{ background: "var(--secondary)", color: "var(--primary)" }}>
                    {initials(row.name)}
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">{row.name ?? "—"}</span>
                  {row.streak > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Flame className="w-3.5 h-3.5" />{row.streak}
                    </span>
                  )}
                  <span className="text-sm font-bold shrink-0">{row.points} pt</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
