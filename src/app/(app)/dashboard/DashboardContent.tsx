"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Dumbbell, Brain, Target, Clock, ChevronRight, Plus, Activity } from "lucide-react";
import { WelcomeTour } from "@/components/onboarding/WelcomeTour";
import { DailyMissionCard } from "@/components/dashboard/DailyMissionCard";
import type { DailyMission } from "@/lib/dailyMission-shared";
import { FormScoreHero } from "@/components/dashboard/FormScoreHero";
import { MoodPrompt } from "@/components/dashboard/MoodPrompt";
import { AdaptiveBodyMap, RadialGauge } from "@/components/wow";
import { StreakHeatmap } from "@/components/visualizations/StreakHeatmap";
import { FadeIn, Stagger, StaggerItem, CardHover, CountUp, PageTransition } from "@/components/motion/MotionPrimitives";
import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

interface HeroStat { label: string; value: string }

interface ActivePlanDay {
  id: string;
  dayNumber: number;
  name: string;
  restDay: boolean;
  exercisesCount: number;
}

interface ActivePlan {
  name: string;
  workoutsPerWeek: number;
  durationWeeks: number;
  days: ActivePlanDay[];
}

interface RecentSession {
  id: string;
  name: string | null;
  completedAtFormatted: string;
  durationFormatted: string | null;
}

interface Imbalance { muscle: string; deficitPct: number }
interface TopImbalance { muscle: string; label: string; daysSinceLast: number | null }

interface Achievement { id: string; icon: string; name: string; points: number }

export interface DashboardContentProps {
  today: string;
  firstName: string | null;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  totalSessions: number;
  weeklySessions: number;
  weeklyTarget: number;
  weeklyRemaining: number;
  heroExercise: string | null;
  heroContextLabel: string | undefined;
  heroScore: number;
  heroVerdict: string;
  heroNote: string | undefined;
  heroCorrection: string | undefined;
  heroStats: HeroStat[];
  hasAnalysis: boolean;
  activePlan: ActivePlan | null;
  recentSessionsProgressCount: number;
  recentSessions: RecentSession[];
  streakData: { date: string; count: number }[];
  nutritionTargetCalories: number;
  nutritionTotals: { calories: number; protein: number; carbs: number; fat: number };
  imbalances: Imbalance[];
  topImbalances: TopImbalance[];
  achievements: Achievement[];
  mission: DailyMission;
}

export function DashboardContent(props: DashboardContentProps) {
  const copy = useCopy();
  const {
    today, firstName, currentStreak, longestStreak, totalPoints, totalSessions, weeklySessions,
    weeklyTarget, weeklyRemaining, heroExercise, heroContextLabel, heroScore, heroVerdict, heroNote,
    heroCorrection, heroStats, hasAnalysis, activePlan, recentSessionsProgressCount, recentSessions,
    streakData, nutritionTargetCalories, nutritionTotals, imbalances, topImbalances, achievements, mission,
  } = props;

  return (
    <PageTransition>
      <div className="space-y-6">
        <WelcomeTour />

        <FadeIn>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{today}</p>
              <h1 className="font-display text-3xl mt-1">
                {copy.dashboard.greeting(firstName ?? copy.dashboard.greetingFallback)} <span className="inline-block animate-wave">👋</span>
              </h1>
            </div>
            {currentStreak > 0 && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full" style={{ background: "rgba(233,69,96,.10)", color: "var(--organic-terracotta)" }}>
                🔥 {currentStreak} giorni streak
              </span>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.03}>
          <MoodPrompt />
        </FadeIn>

        <FadeIn delay={0.04}>
          <FormScoreHero
            exercise={heroExercise ?? "La tua tecnica"}
            contextLabel={heroContextLabel}
            score={heroScore}
            verdict={heroVerdict}
            note={heroNote}
            correction={heroCorrection}
            stats={heroStats}
            emptyLabel={hasAnalysis ? undefined : "Fai la tua prima analisi della forma per vedere qui il tuo Form Score."}
          />
        </FadeIn>

        {/* Statband mix: contatori oversize su fondo espresso (dir-mix-dashboard) */}
        <FadeIn delay={0.03}>
          <div className="relative overflow-hidden rounded-[28px] p-1.5" style={{ background: "var(--organic-espresso, #1a1a1a)" }}>
            <div
              className="pointer-events-none absolute w-80 h-80 rounded-full blur-[70px] -top-36 -right-14 opacity-20"
              style={{ background: "var(--organic-terracotta, #3fae5a)" }}
            />
            <div className="relative z-[2] grid sm:grid-cols-3">
              {[
                { value: totalSessions, unit: null as string | null, label: copy.dashboard.statband.workouts, path: "dashboard.statband.workouts", delta: null as string | null, icon: Dumbbell },
                { value: currentStreak, unit: copy.dashboard.statband.streakUnit, label: copy.dashboard.statband.streak, path: "dashboard.statband.streak", delta: copy.dashboard.statband.streakRecord(longestStreak), icon: Flame },
                { value: totalPoints, unit: copy.dashboard.statband.pointsUnit, label: copy.dashboard.statband.points, path: "dashboard.statband.points", delta: null, icon: Target },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className={`relative p-7 ${i < 2 ? "sm:border-r" : ""} ${i > 0 ? "max-sm:border-t" : ""}`}
                    style={{ borderColor: "rgba(232,241,226,.12)" }}
                  >
                    {s.delta && (
                      <span className="absolute top-7 right-7 text-[11px] font-bold tracking-wide" style={{ color: "#cdd9bf" }}>
                        {s.delta}
                      </span>
                    )}
                    <div
                      className="w-10 h-10 rounded-xl grid place-items-center mb-5"
                      style={{ background: "rgba(232,241,226,.08)", color: "var(--organic-terracotta-soft, #7fd194)" }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="font-display text-6xl leading-[.85] tracking-tight flex items-baseline gap-1.5" style={{ color: "var(--foreground, #f1f6ed)" }}>
                      <CountUp value={s.value} />
                      {s.unit && (
                        <span className="text-base font-bold tracking-wide font-sans" style={{ color: "var(--organic-terracotta-soft, #7fd194)" }}>
                          {s.unit}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.14em] mt-3.5" style={{ color: "rgba(232,241,226,.62)" }}>
                      <EditableText path={s.path}>{s.label}</EditableText>
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
                    <CardTitle><EditableText path="dashboard.activePlanTitle">{copy.dashboard.activePlanTitle}</EditableText></CardTitle>
                    <Link href="/allenamento"><Button size="sm"><EditableText path="dashboard.goToWorkout">{copy.dashboard.goToWorkout}</EditableText> <ChevronRight className="w-4 h-4" /></Button></Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {activePlan ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{activePlan.name}</span>
                          <Badge variant="secondary">{activePlan.workoutsPerWeek}<EditableText path="dashboard.workoutsPerWeekSuffix">{copy.dashboard.workoutsPerWeekSuffix}</EditableText></Badge>
                        </div>
                        <Progress value={Math.round((recentSessionsProgressCount / (activePlan.durationWeeks * activePlan.workoutsPerWeek)) * 100)} />
                        <p className="text-xs text-muted-foreground mt-1">{copy.dashboard.sessionsCompleted(recentSessionsProgressCount)}</p>
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
                                <p className="text-xs text-muted-foreground">{day.restDay ? <EditableText path="dashboard.restDay">{copy.dashboard.restDay}</EditableText> : copy.dashboard.exercisesCount(day.exercisesCount)}</p>
                              </div>
                            </div>
                          </StaggerItem>
                        ))}
                      </Stagger>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-3">
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-muted-foreground"><EditableText path="dashboard.noActivePlan">{copy.dashboard.noActivePlan}</EditableText></p>
                      <Link href="/allenamento"><Button><Plus className="w-4 h-4" /><EditableText path="dashboard.createPlanAi">{copy.dashboard.createPlanAi}</EditableText></Button></Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.15}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base"><EditableText path="dashboard.consistencyTitle">{copy.dashboard.consistencyTitle}</EditableText></CardTitle>
                    <Link href="/progressi" className="text-xs text-muted-foreground hover:text-primary">
                      <EditableText path="dashboard.seeAll">{copy.dashboard.seeAll}</EditableText>
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
                  <CardTitle className="text-base"><EditableText path="dashboard.recentSessionsTitle">{copy.dashboard.recentSessionsTitle}</EditableText></CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4"><EditableText path="dashboard.noSessions">{copy.dashboard.noSessions}</EditableText></p>
                  ) : (
                    recentSessions.map((s) => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors">
                        <Dumbbell className="w-5 h-5 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.name ?? copy.dashboard.freeSession}</p>
                          <p className="text-xs text-muted-foreground">{s.completedAtFormatted}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          {s.durationFormatted && <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.durationFormatted}</div>}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          <div className="space-y-4">
            <FadeIn delay={0.08}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Questa settimana</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-5">
                  <RadialGauge value={weeklySessions} max={weeklyTarget} size={104} color="#3fae5a" label={`su ${weeklyTarget}`} />
                  <p className="text-sm text-muted-foreground">
                    {weeklyRemaining === 0
                      ? "Obiettivo settimanale raggiunto. Ottimo ritmo."
                      : `Ti manca${weeklyRemaining === 1 ? "" : "no"} ${weeklyRemaining} allenament${weeklyRemaining === 1 ? "o" : "i"} per l'obiettivo di questa settimana.`}
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.09}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base"><EditableText path="dashboard.nutritionTitle">{copy.dashboard.nutritionTitle}</EditableText></CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-5">
                  <RadialGauge value={Math.round(nutritionTotals.calories)} max={nutritionTargetCalories} size={104} color="#3fae5a" label={copy.dashboard.nutritionTargetSuffix} />
                  <div className="text-sm space-y-1">
                    <p className="text-muted-foreground">{Math.round(nutritionTotals.protein)}g proteine · {Math.round(nutritionTotals.carbs)}g carboidrati · {Math.round(nutritionTotals.fat)}g grassi</p>
                    <Link href="/nutrizione" className="text-xs text-muted-foreground hover:text-primary"><EditableText path="dashboard.nutritionCta">{copy.dashboard.nutritionCta}</EditableText></Link>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Activity className="w-4 h-4 text-energy-hot" />
                      <EditableText path="dashboard.imbalancesTitle">{copy.dashboard.imbalancesTitle}</EditableText>
                    </CardTitle>
                    <Link href="/progressi" className="text-xs text-muted-foreground hover:text-primary">
                      <EditableText path="dashboard.mapLink">{copy.dashboard.mapLink}</EditableText>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="max-w-[180px] mx-auto">
                    <AdaptiveBodyMap
                      mode="balance"
                      data={imbalances.map((i) => ({ muscle: i.muscle, deficitPct: i.deficitPct }))}
                      view="front"
                      showToggle={false}
                    />
                  </div>
                  {topImbalances.length === 0 ? (
                    <p className="text-xs text-center text-muted-foreground">
                      {totalSessions === 0 ? <EditableText path="dashboard.noImbalanceData">{copy.dashboard.noImbalanceData}</EditableText> : <EditableText path="dashboard.goodBalance">{copy.dashboard.goodBalance}</EditableText>}
                    </p>
                  ) : (
                    <ul className="space-y-1.5 text-xs">
                      {topImbalances.map((i) => (
                        <li key={i.muscle} className="flex items-center gap-2 text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-energy-hot animate-pulse" />
                          {i.label}
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
                <CardHeader className="pb-2"><CardTitle className="text-base"><EditableText path="dashboard.quickActionsTitle">{copy.dashboard.quickActionsTitle}</EditableText></CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { href: "/analisi", icon: Brain },
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
                  <CardHeader className="pb-2"><CardTitle className="text-base"><EditableText path="dashboard.lastAchievementsTitle">{copy.dashboard.lastAchievementsTitle}</EditableText></CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {achievements.map((ua) => (
                      <div key={ua.id} className="flex items-center gap-3">
                        <span className="text-2xl">{ua.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{ua.name}</p>
                          <p className="text-xs text-muted-foreground">{copy.dashboard.pointsLabel(ua.points)}</p>
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
