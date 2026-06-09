"use client";

import { useEffect, useState } from "react";
import { AdminMetricCard } from "./AdminMetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { copy } from "@/content/copy";

type Stats = {
  counters: {
    totalUsers: number; mauUsers: number; dauUsers: number;
    workouts30: number; analyses30: number; checkins30: number;
  };
  newUsersDaily: Array<{ day: string; count: number }>;
  workoutsDaily: Array<{ day: string; count: number }>;
  topExercises: Array<{ id: string; name: string; count: number }>;
  fitnessLevelDistribution: Array<{ level: string | null; count: number }>;
};

export function StatsDashboard() {
  const [data, setData] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then(async (res) => {
      if (res.ok) setData(await res.json());
    });
  }, []);

  if (!data) return <div className="text-sm text-muted-foreground">{copy.adminStats.dashboard.loading}</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <AdminMetricCard label={copy.adminStats.dashboard.metricTotalUsers} value={data.counters.totalUsers} />
        <AdminMetricCard label={copy.adminStats.dashboard.metricMau} value={data.counters.mauUsers} tone="success" />
        <AdminMetricCard label={copy.adminStats.dashboard.metricDau} value={data.counters.dauUsers} tone="info" />
        <AdminMetricCard label={copy.adminStats.dashboard.metricWorkouts} value={data.counters.workouts30} tone="warning" />
        <AdminMetricCard label={copy.adminStats.dashboard.metricAnalyses} value={data.counters.analyses30} tone="premium" />
        <AdminMetricCard label={copy.adminStats.dashboard.metricCheckins} value={data.counters.checkins30} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">{copy.adminStats.dashboard.newUsersChart}</CardTitle></CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.newUsersDaily}>
                <XAxis dataKey="day" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">{copy.adminStats.dashboard.workoutsChart}</CardTitle></CardHeader>
          <CardContent className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.workoutsDaily}>
                <XAxis dataKey="day" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">{copy.adminStats.dashboard.topExercisesTitle}</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.topExercises.length === 0 && <div className="text-muted-foreground">{copy.adminStats.dashboard.noData}</div>}
          {data.topExercises.map((e) => (
            <div key={e.id} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{e.name}</span>
              <span className="text-muted-foreground">{copy.adminStats.dashboard.sessionsUnit(e.count)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">{copy.adminStats.dashboard.fitnessLevelTitle}</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.fitnessLevelDistribution.map((d) => (
            <div key={d.level ?? "null"} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{d.level ?? copy.adminStats.dashboard.levelNull}</span>
              <span className="text-muted-foreground">{copy.adminStats.dashboard.usersUnit(d.count)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
