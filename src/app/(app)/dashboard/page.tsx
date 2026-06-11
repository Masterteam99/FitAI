import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Flame, Dumbbell, Brain, Target, Clock, ChevronRight, Plus, Activity } from "lucide-react";
import { WelcomeTour } from "@/components/onboarding/WelcomeTour";
import { DailyMissionCard } from "@/components/dashboard/DailyMissionCard";
import { getDailyMission } from "@/lib/dailyMission";
import { computeImbalances, muscleLabel } from "@/lib/body-map";
import { BodyMap } from "@/components/visualizations/BodyMap/BodyMap";
import { StreakHeatmap } from "@/components/visualizations/StreakHeatmap";
import { FadeIn, Stagger, StaggerItem, CardHover, CountUp, PageTransition } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";
import type { Metadata } from "next";

export const metadata: Metadata = { title: copy.dashboard.meta.title };

const DAY_MS = 24 * 60 * 60 * 1000;

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const [user, activePlan, recentSessions, achievements, mission, imbalances, streakSessions, totalSessions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, currentStreak: true, totalPoints: true, longestStreak: true } }),
    prisma.workoutPlan.findFirst({ where: { userId, isActive: true }, include: { days: { include: { exercises: { include: { exercise: true } } } } } }),
    prisma.workoutSession.findMany({ where: { userId, status: "COMPLETED" }, orderBy: { completedAt: "desc" }, take: 5, include: { planDay: true } }),
    prisma.userAchievement.findMany({ where: { userId }, include: { achievement: true }, orderBy: { unlockedAt: "desc" }, take: 3 }),
    getDailyMission(userId),
    computeImbalances(userId, 30),
    prisma.workoutSession.findMany({
      where: { userId, status: "COMPLETED", completedAt: { gte: new Date(Date.now() - 90 * DAY_MS) } },
      select: { completedAt: true },
    }),
    prisma.workoutSession.count({ where: { userId, status: "COMPLETED" } }),
  ]);

  // Aggrega streak ultimi 90 giorni
  const streakMap = new Map<string, number>();
  for (const s of streakSessions) {
    if (!s.completedAt) continue;
    const iso = s.completedAt.toISOString().slice(0, 10);
    streakMap.set(iso, (streakMap.get(iso) ?? 0) + 1);
  }
  const streakData = Array.from(streakMap.entries()).map(([date, count]) => ({ date, count }));

  const topImbalances = imbalances.slice(0, 3);

  return (
    <PageTransition>
      <div className="space-y-6">
        <WelcomeTour />

        <FadeIn>
          <div>
            <h1 className="font-display text-4xl">
              {copy.dashboard.greeting(user?.name?.split(" ")[0] ?? copy.dashboard.greetingFallback)} <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-muted-foreground mt-1">{copy.dashboard.subtitle}</p>
          </div>
        </FadeIn>

        {/* Statband mix: contatori oversize su fondo espresso (dir-mix-dashboard) */}
        <FadeIn delay={0.03}>
          <div className="relative overflow-hidden rounded-[28px] p-1.5" style={{ background: "var(--organic-espresso, #1a1a1a)" }}>
            <div
              className="pointer-events-none absolute w-80 h-80 rounded-full blur-[70px] -top-36 -right-14 opacity-20"
              style={{ background: "var(--organic-terracotta, #c66a4a)" }}
            />
            <div className="relative z-[2] grid sm:grid-cols-3">
              {[
                { value: totalSessions, unit: null as string | null, label: copy.dashboard.statband.workouts, delta: null as string | null, icon: Dumbbell },
                { value: user?.currentStreak ?? 0, unit: copy.dashboard.statband.streakUnit, label: copy.dashboard.statband.streak, delta: copy.dashboard.statband.streakRecord(user?.longestStreak ?? 0), icon: Flame },
                { value: user?.totalPoints ?? 0, unit: copy.dashboard.statband.pointsUnit, label: copy.dashboard.statband.points, delta: null, icon: Target },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className={`relative p-7 ${i < 2 ? "sm:border-r" : ""} ${i > 0 ? "max-sm:border-t" : ""}`}
                    style={{ borderColor: "rgba(246,240,231,.12)" }}
                  >
                    {s.delta && (
                      <span className="absolute top-7 right-7 text-[11px] font-bold tracking-wide" style={{ color: "#cdd9bf" }}>
                        {s.delta}
                      </span>
                    )}
                    <div
                      className="w-10 h-10 rounded-xl grid place-items-center mb-5"
                      style={{ background: "rgba(246,240,231,.08)", color: "var(--organic-terracotta-soft, #e4a07e)" }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-display text-6xl leading-[.85] tracking-tight flex items-baseline gap-1.5" style={{ color: "var(--organic-cream, #fbf7f0)" }}>
                      <CountUp value={s.value} />
                      {s.unit && (
                        <span className="text-base font-bold tracking-wide font-sans" style={{ color: "var(--organic-terracotta-soft, #e4a07e)" }}>
                          {s.unit}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.14em] mt-3.5" style={{ color: "rgba(246,240,231,.62)" }}>
                      {s.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.05}>
          <DailyMissionCard mission={mission} />
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <FadeIn delay={0.1}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{copy.dashboard.activePlanTitle}</CardTitle>
                    <Link href="/allenamento"><Button size="sm">{copy.dashboard.goToWorkout} <ChevronRight className="w-4 h-4" /></Button></Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {activePlan ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{activePlan.name}</span>
                          <Badge variant="secondary">{activePlan.workoutsPerWeek}{copy.dashboard.workoutsPerWeekSuffix}</Badge>
                        </div>
                        <Progress value={Math.round((recentSessions.length / (activePlan.durationWeeks * activePlan.workoutsPerWeek)) * 100)} />
                        <p className="text-xs text-muted-foreground mt-1">{copy.dashboard.sessionsCompleted(recentSessions.length)}</p>
                      </div>
                      <Stagger className="space-y-2">
                        {activePlan.days.slice(0, 3).map((day) => (
                          <StaggerItem key={day.id}>
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${day.restDay ? "bg-secondary/30" : "bg-secondary/50"}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${day.restDay ? "bg-border" : "bg-primary/20 text-primary"}`}>
                                {day.dayNumber}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{day.name}</p>
                                <p className="text-xs text-muted-foreground">{day.restDay ? copy.dashboard.restDay : copy.dashboard.exercisesCount(day.exercises.length)}</p>
                              </div>
                            </div>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-3">
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground">{copy.dashboard.noActivePlan}</p>
                      <Link href="/allenamento"><Button><Plus className="w-4 h-4" />{copy.dashboard.createPlanAi}</Button></Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.15}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{copy.dashboard.consistencyTitle}</CardTitle>
                    <Link href="/progressi" className="text-xs text-muted-foreground hover:text-primary">
                      {copy.dashboard.seeAll}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <StreakHeatmap data={streakData} days={90} cellSize={10} cellGap={2} />
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{copy.dashboard.recentSessionsTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">{copy.dashboard.noSessions}</p>
                  ) : (
                    recentSessions.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors">
                        <Dumbbell className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.planDay?.name ?? copy.dashboard.freeSession}</p>
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
            </FadeIn>
          </div>

          <div className="space-y-4">
            <FadeIn delay={0.1}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-4 h-4 text-energy-hot" />
                      {copy.dashboard.imbalancesTitle}
                    </CardTitle>
                    <Link href="/progressi" className="text-xs text-muted-foreground hover:text-primary">
                      {copy.dashboard.mapLink}
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="max-w-[180px] mx-auto">
                    <BodyMap
                      mode="balance"
                      data={imbalances.map((i) => ({ muscle: i.muscle, deficitPct: i.deficitPct, message: i.message }))}
                      view="front"
                      showToggle={false}
                      showLegend={false}
                    />
                  </div>
                  {topImbalances.length === 0 ? (
                    <p className="text-xs text-center text-muted-foreground">{copy.dashboard.goodBalance}</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {topImbalances.map((i) => (
                        <li key={i.muscle} className="flex items-center gap-2 text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-energy-hot animate-pulse" />
                          {muscleLabel(i.muscle as never)}
                          {i.daysSinceLast !== null && (
                            <span className="ml-auto text-[10px] opacity-70">{i.daysSinceLast}g</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.15}>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-base">{copy.dashboard.quickActionsTitle}</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { href: "/analisi", icon: Brain },
                    { href: "/ai-coach", icon: Target },
                    { href: "/esercizi", icon: Dumbbell },
                  ].map((pres, i) => {
                    const a = { ...pres, ...copy.dashboard.quickActions[i] };
                    const Icon = a.icon;
                    return (
                      <CardHover key={a.href}>
                        <Link href={a.href} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{a.label}</p>
                            <p className="text-xs text-muted-foreground">{a.desc}</p>
                          </div>
                        </Link>
                      </CardHover>
                    );
                  })}
                </CardContent>
              </Card>
            </FadeIn>

            {achievements.length > 0 && (
              <FadeIn delay={0.2}>
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">{copy.dashboard.lastAchievementsTitle}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {achievements.map((ua) => (
                      <div key={ua.id} className="flex items-center gap-3">
                        <span className="text-2xl">{ua.achievement.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{ua.achievement.name}</p>
                          <p className="text-xs text-muted-foreground">{copy.dashboard.pointsLabel(ua.achievement.points)}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </FadeIn>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
