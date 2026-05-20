import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Flame, Dumbbell, Brain, Target, Clock, ChevronRight, Plus } from "lucide-react";
import { WelcomeTour } from "@/components/onboarding/WelcomeTour";
import { DailyMissionCard } from "@/components/dashboard/DailyMissionCard";
import { getDailyMission } from "@/lib/dailyMission";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const [user, activePlan, recentSessions, achievements, mission] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, currentStreak: true, totalPoints: true, longestStreak: true } }),
    prisma.workoutPlan.findFirst({ where: { userId, isActive: true }, include: { days: { include: { exercises: { include: { exercise: true } } } } } }),
    prisma.workoutSession.findMany({ where: { userId, status: "COMPLETED" }, orderBy: { completedAt: "desc" }, take: 5, include: { planDay: true } }),
    prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true }, orderBy: { unlockedAt: "desc" }, take: 3 }),
    getDailyMission(userId),
  ]);

  return (
    <div className="space-y-6">
      <WelcomeTour />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ciao, {user?.name?.split(" ")[0] ?? "Atleta"} 👋</h1>
          <p className="text-muted-foreground">Pronto per l&apos;allenamento di oggi?</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="font-semibold">{user?.currentStreak ?? 0}gg</span>
            <span className="text-muted-foreground">streak</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-semibold">{user?.totalPoints ?? 0}</span>
            <span className="text-muted-foreground">pt</span>
          </span>
        </div>
      </div>

      <DailyMissionCard mission={mission} />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Piano Attivo</CardTitle>
                <Link href="/allenamento"><Button size="sm">Vai all&apos;allenamento <ChevronRight className="w-4 h-4" /></Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {activePlan ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{activePlan.name}</span>
                      <Badge variant="secondary">{activePlan.workoutsPerWeek}x/sett</Badge>
                    </div>
                    <Progress value={Math.round((recentSessions.length / (activePlan.durationWeeks * activePlan.workoutsPerWeek)) * 100)} />
                    <p className="text-xs text-muted-foreground mt-1">{recentSessions.length} sessioni completate</p>
                  </div>
                  <div className="space-y-2">
                    {activePlan.days.slice(0, 3).map((day) => (
                      <div key={day.id} className={`flex items-center gap-3 p-3 rounded-lg ${day.restDay ? "bg-secondary/30" : "bg-secondary/50"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${day.restDay ? "bg-border" : "bg-primary/20 text-primary"}`}>
                          {day.dayNumber}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{day.name}</p>
                          <p className="text-xs text-muted-foreground">{day.restDay ? "Riposo" : `${day.exercises.length} esercizi`}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Nessun piano attivo</p>
                  <Link href="/allenamento"><Button><Plus className="w-4 h-4" />Crea piano con AI</Button></Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sessioni Recenti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nessuna sessione ancora. Inizia il tuo allenamento!</p>
              ) : (
                recentSessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                    <Dumbbell className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.planDay?.name ?? "Sessione libera"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(s.completedAt!)}</p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {s.totalSeconds && <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(s.totalSeconds)}</div>}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Azioni rapide</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { href: "/analisi", label: "Analizza esercizio", icon: Brain, desc: "Analisi video AI" },
                { href: "/ai-coach", label: "Chiedi all'AI Coach", icon: Target, desc: "Consigli personalizzati" },
                { href: "/esercizi", label: "Sfoglia esercizi", icon: Dumbbell, desc: "Libreria completa" },
              ].map((a) => {
                const Icon = a.icon;
                return (
                  <Link key={a.href} href={a.href} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{a.label}</p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          {achievements.length > 0 && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Ultimi Achievement</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((ua) => (
                  <div key={ua.id} className="flex items-center gap-3">
                    <span className="text-2xl">{ua.achievement.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{ua.achievement.name}</p>
                      <p className="text-xs text-muted-foreground">+{ua.achievement.points} punti</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
