"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Dumbbell, Flame, Trophy, Star, Loader2, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { copy } from "@/content/copy";

interface StatsData {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  daysActive30: number;
  weeklyVolume: { weekStart: string; minutes: number }[];
  avgFeeling: number | null;
  recentSessions: { completedAt: string; totalDuration: number; overallFeeling: string | null }[];
  achievements: { achievement: { name: string; icon: string; rarity: string }; unlockedAt: string }[];
}

const RARITY_COLORS: Record<string, string> = {
  COMMON: "text-muted-foreground",
  UNCOMMON: "text-green-400",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-yellow-400",
};

export default function ProgressiPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progressi")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  // Build weekly workout frequency chart
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, "yyyy-MM-dd");
    const sessions = stats.recentSessions.filter((s) => s.completedAt?.startsWith(dateStr));
    return {
      date: format(date, "dd/MM"),
      sessioni: sessions.length,
      minuti: sessions.reduce((a, s) => a + (s.totalDuration ?? 0), 0),
    };
  });

  // Last 7 days for display
  const last7Days = last30Days.slice(-7);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-primary" />
          {copy.progressi.title}
        </h1>
        <p className="text-muted-foreground">{copy.progressi.subtitle}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Dumbbell, label: copy.progressi.stats.totalSessions, value: stats.totalSessions, color: "text-primary" },
          { icon: Calendar, label: copy.progressi.stats.totalMinutes, value: stats.totalMinutes, color: "text-blue-400" },
          { icon: Flame, label: copy.progressi.stats.currentStreak, value: `${stats.currentStreak}🔥`, color: "text-orange-400" },
          { icon: Trophy, label: copy.progressi.stats.totalPoints, value: stats.totalPoints, color: "text-yellow-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <Icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
                <div className="text-2xl font-bold">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{copy.progressi.weeklyChartTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last7Days}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v) => [copy.progressi.sessionsTooltip(Number(v ?? 0)), ""]}
              />
              <Bar dataKey="sessioni" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Minutes trend */}
      {stats.totalSessions >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.progressi.minutesTrendTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={last30Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={6} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v) => [copy.progressi.minutesTooltip(Number(v ?? 0)), ""]}
                />
                <Line type="monotone" dataKey="minuti" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Insights aggregate */}
      {stats.totalSessions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.progressi.insightsTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.daysActive30}</div>
                <p className="text-xs text-muted-foreground mt-0.5">{copy.progressi.insightDaysActive}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {stats.totalSessions > 0 ? Math.round(stats.totalMinutes / stats.totalSessions) : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{copy.progressi.insightAvgMinPerSession}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">
                  {stats.weeklyVolume.length > 0
                    ? Math.round(stats.weeklyVolume.reduce((a, w) => a + w.minutes, 0) / stats.weeklyVolume.length)
                    : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{copy.progressi.insightAvgMinPerWeek}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {stats.avgFeeling != null ? stats.avgFeeling.toFixed(1) : "—"}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{copy.progressi.insightAvgFeeling}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly volume chart */}
      {stats.weeklyVolume.some((w) => w.minutes > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.progressi.weeklyVolumeTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.weeklyVolume.map((w) => ({
                label: format(parseISO(w.weekStart), "dd MMM", { locale: it }),
                minuti: w.minutes,
              }))}>
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(v) => [copy.progressi.minutesTooltip(Number(v ?? 0)), ""]}
                />
                <Bar dataKey="minuti" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      {stats.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              {copy.progressi.achievementsTitle(stats.achievements.length)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stats.achievements.map((ua) => (
                <div key={ua.achievement.name} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                  <span className="text-2xl">{ua.achievement.icon}</span>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${RARITY_COLORS[ua.achievement.rarity] ?? ""}`}>{ua.achievement.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {format(parseISO(ua.unlockedAt), "d MMM yyyy", { locale: it })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stats.totalSessions === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center space-y-3">
            <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">{copy.progressi.emptyState}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
