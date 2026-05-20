# Daily Mission Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire le 4 stat-card grandi nella dashboard con una "Daily Mission" hero card che mostra 3 task adattivi giornalieri (allenamento del piano, nutrizione, check-in mood).

**Architecture:** Server component dashboard chiama una pure server function `getDailyMission(userId)` che ritorna i 3 task con stato calcolato da query Prisma esistenti + nuova tabella `DailyCheckin`. Client component `DailyMissionCard` gestisce solo la micro-interazione del check-in (POST + `router.refresh()`).

**Tech Stack:** Next.js 16, Prisma 7 + adapter-pg, NextAuth v5, Playwright per E2E, Tailwind + shadcn/ui components esistenti (Card, Button, Progress).

**Spec di riferimento:** `docs/superpowers/specs/2026-05-20-daily-mission-dashboard-design.md`

---

## File Structure

**Nuovi**:
- `src/lib/dailyMission.ts` — pure server function `getDailyMission(userId)` + tipi pubblici
- `src/components/dashboard/DailyMissionCard.tsx` — client component (1 file)
- `src/app/api/daily-checkin/route.ts` — POST endpoint upsert
- `tests/e2e/m8-daily-mission.spec.ts` — 5 test E2E

**Modificati**:
- `prisma/schema.prisma` — aggiungere modello `DailyCheckin` + relazione su `User`
- `src/app/(app)/dashboard/page.tsx` — rimuovere stat row, spostare streak/punti in header, montare Mission card

---

## Task 1: Schema Prisma + migration `DailyCheckin`

**Files:**
- Modify: `prisma/schema.prisma` (aggiunta dopo `model NutritionLog`)
- Generated: `prisma/migrations/<timestamp>_add_daily_checkin/migration.sql`

- [ ] **Step 1.1: Aggiungere il modello in schema.prisma**

In `prisma/schema.prisma`, aggiungere dopo `model NutritionLog` (circa riga 556):

```prisma
model DailyCheckin {
  id        String   @id @default(cuid())
  userId    String
  date      DateTime // UTC midnight della data del check-in
  mood      Int      // 1-5
  note      String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
  @@map("daily_checkins")
}
```

Nel `model User` (circa riga 168-220), aggiungere la back-relation tra le altre relations (es. dopo `notifications`):

```prisma
  dailyCheckins         DailyCheckin[]
```

- [ ] **Step 1.2: Generare migration**

Run: `npx prisma migrate dev --name add_daily_checkin`
Expected: nuovo file `prisma/migrations/<timestamp>_add_daily_checkin/migration.sql` creato; output `Already in sync` / `Applied`.

Se in produzione si usa `db push` (come da memoria progetto): `npx prisma db push --accept-data-loss` come fallback.

- [ ] **Step 1.3: Generare Prisma client aggiornato**

Run: `npx prisma generate`
Expected: Generated Prisma Client to `./src/generated/prisma`.

- [ ] **Step 1.4: Verificare typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore (il client ora ha `prisma.dailyCheckin`).

- [ ] **Step 1.5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(schema): add DailyCheckin model + migration"
```

---

## Task 2: Pure server function `getDailyMission`

**Files:**
- Create: `src/lib/dailyMission.ts`

- [ ] **Step 2.1: Implementare tipi e funzione**

Creare `src/lib/dailyMission.ts` con il contenuto seguente:

```ts
import { prisma } from "@/lib/prisma";

export const NUTRITION_TASK_THRESHOLD = 3;
export const CHECKIN_MOODS = [1, 2, 3, 4, 5] as const;
export const MOOD_EMOJI: Record<number, string> = {
  1: "😩",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "💪",
};

export type MissionTaskStatus = "pending" | "in_progress" | "done";

export type WorkoutMissionTask = {
  kind: "workout";
  status: MissionTaskStatus;
  label: string;
  ctaHref: string;
  restDay: boolean;
  hasPlan: boolean;
};

export type NutritionMissionTask = {
  kind: "nutrition";
  status: MissionTaskStatus;
  label: string;
  ctaHref: string;
  loggedCount: number;
  threshold: number;
};

export type CheckinMissionTask = {
  kind: "checkin";
  status: MissionTaskStatus;
  label: string;
  selectedMood: number | null;
};

export type DailyMission = {
  date: string; // ISO date "2026-05-20"
  workout: WorkoutMissionTask;
  nutrition: NutritionMissionTask;
  checkin: CheckinMissionTask;
  completedCount: number;
};

function todayUtcMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function todayUtcRangeEnd(midnight: Date): Date {
  return new Date(midnight.getTime() + 24 * 60 * 60 * 1000);
}

export async function getDailyMission(userId: string): Promise<DailyMission> {
  const today = todayUtcMidnight();
  const tomorrow = todayUtcRangeEnd(today);

  const [activePlan, sessionsCompletedCount, sessionToday, nutritionCount, checkin] = await Promise.all([
    prisma.workoutPlan.findFirst({
      where: { userId, isActive: true },
      include: { days: { orderBy: { dayNumber: "asc" } } },
    }),
    prisma.workoutSession.count({
      where: { userId, status: "COMPLETED" },
    }),
    prisma.workoutSession.findFirst({
      where: {
        userId,
        status: "COMPLETED",
        completedAt: { gte: today, lt: tomorrow },
      },
      select: { id: true, planDayId: true },
    }),
    prisma.nutritionLog.count({
      where: { userId, date: { gte: today, lt: tomorrow } },
    }),
    prisma.dailyCheckin.findUnique({
      where: { userId_date: { userId, date: today } },
    }),
  ]);

  // Workout task
  let workout: WorkoutMissionTask;
  if (!activePlan || activePlan.days.length === 0) {
    workout = {
      kind: "workout",
      status: "pending",
      label: "Crea il tuo piano AI",
      ctaHref: "/allenamento",
      restDay: false,
      hasPlan: false,
    };
  } else {
    const nextIdx = sessionsCompletedCount % activePlan.days.length;
    const targetDay = activePlan.days[nextIdx];
    const isCompletedToday = sessionToday?.planDayId === targetDay.id;
    workout = {
      kind: "workout",
      status: targetDay.restDay
        ? "done"
        : isCompletedToday
          ? "done"
          : "pending",
      label: targetDay.restDay
        ? `${targetDay.name} — Riposo`
        : `Day ${targetDay.dayNumber} — ${targetDay.name}`,
      ctaHref: "/allenamento",
      restDay: targetDay.restDay,
      hasPlan: true,
    };
  }

  // Nutrition task
  const nutritionStatus: MissionTaskStatus =
    nutritionCount >= NUTRITION_TASK_THRESHOLD
      ? "done"
      : nutritionCount > 0
        ? "in_progress"
        : "pending";
  const nutrition: NutritionMissionTask = {
    kind: "nutrition",
    status: nutritionStatus,
    label: `Pasti loggati: ${Math.min(nutritionCount, NUTRITION_TASK_THRESHOLD)}/${NUTRITION_TASK_THRESHOLD}`,
    ctaHref: "/nutrizione",
    loggedCount: nutritionCount,
    threshold: NUTRITION_TASK_THRESHOLD,
  };

  // Check-in task
  const checkinTask: CheckinMissionTask = checkin
    ? {
        kind: "checkin",
        status: "done",
        label: `Oggi ti senti ${MOOD_EMOJI[checkin.mood] ?? ""}`,
        selectedMood: checkin.mood,
      }
    : {
        kind: "checkin",
        status: "pending",
        label: "Come ti senti oggi?",
        selectedMood: null,
      };

  const completedCount = [workout, nutrition, checkinTask].filter((t) => t.status === "done").length;

  return {
    date: today.toISOString().slice(0, 10),
    workout,
    nutrition,
    checkin: checkinTask,
    completedCount,
  };
}
```

- [ ] **Step 2.2: Verificare typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 2.3: Commit**

```bash
git add src/lib/dailyMission.ts
git commit -m "feat(lib): add getDailyMission server function"
```

---

## Task 3: API route POST `/api/daily-checkin`

**Files:**
- Create: `src/app/api/daily-checkin/route.ts`

- [ ] **Step 3.1: Implementare endpoint**

Creare `src/app/api/daily-checkin/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  mood: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
});

function todayUtcMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Dati non validi" }, { status: 400 });

    const userId = session.user.id as string;
    const date = todayUtcMidnight();

    const checkin = await prisma.dailyCheckin.upsert({
      where: { userId_date: { userId, date } },
      create: { userId, date, mood: parsed.data.mood, note: parsed.data.note },
      update: { mood: parsed.data.mood, note: parsed.data.note },
    });

    return NextResponse.json({ ok: true, mood: checkin.mood });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[daily-checkin] handler error", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
```

- [ ] **Step 3.2: Aggiungere route al proxy matcher**

In `src/proxy.ts`, dentro `config.matcher`, aggiungere la stringa `"/api/daily-checkin/:path*"` alla lista (dopo `/api/account/:path*` o altra riga `api/...`):

Edit attuale:
```ts
"/api/account/:path*",
```
Edit nuovo:
```ts
"/api/account/:path*",
"/api/daily-checkin/:path*",
```

- [ ] **Step 3.3: Verificare typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 3.4: Commit**

```bash
git add src/app/api/daily-checkin/route.ts src/proxy.ts
git commit -m "feat(api): add POST /api/daily-checkin endpoint"
```

---

## Task 4: Componente `DailyMissionCard`

**Files:**
- Create: `src/components/dashboard/DailyMissionCard.tsx`

- [ ] **Step 4.1: Implementare client component**

Creare `src/components/dashboard/DailyMissionCard.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Dumbbell, Apple, Heart, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyMission } from "@/lib/dailyMission";
import { MOOD_EMOJI, CHECKIN_MOODS } from "@/lib/dailyMission";

const DATE_FORMATTER = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function DailyMissionCard({ mission }: { mission: DailyMission }) {
  const router = useRouter();
  const [optimisticMood, setOptimisticMood] = useState<number | null>(mission.checkin.selectedMood);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const dateLabel = DATE_FORMATTER.format(new Date(`${mission.date}T00:00:00Z`));
  const allDone = mission.completedCount === 3;

  function handleMood(mood: number) {
    if (pending) return;
    setError("");
    const prev = optimisticMood;
    setOptimisticMood(mood);
    startTransition(async () => {
      const res = await fetch("/api/daily-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });
      if (!res.ok) {
        setOptimisticMood(prev);
        setError("Errore salvataggio check-in");
        return;
      }
      router.refresh();
    });
  }

  const checkinDone = optimisticMood !== null;

  return (
    <Card className={cn("transition-colors", allDone && "border-primary/40 bg-primary/5")}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{dateLabel}</p>
            <h2 className="text-lg font-bold">
              {allDone ? "Missione completata! 🎉" : "La tua missione di oggi"}
            </h2>
          </div>
          <div className="flex items-center gap-1.5" aria-label={`${mission.completedCount} di 3 task completati`}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  i < mission.completedCount ? "bg-primary" : "bg-secondary",
                )}
              />
            ))}
          </div>
        </div>

        {/* Task 1: Workout */}
        <MissionRow
          icon={<Dumbbell className="w-5 h-5" />}
          status={mission.workout.status}
          label={mission.workout.label}
          subtitle={mission.workout.hasPlan ? undefined : "Inizia da qui"}
          action={
            <Link href={mission.workout.ctaHref}>
              <Button size="sm" variant={mission.workout.status === "done" ? "outline" : "default"}>
                {mission.workout.status === "done" ? "Vedi" : mission.workout.hasPlan ? "Inizia" : "Crea"}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          }
        />

        {/* Task 2: Nutrition */}
        <MissionRow
          icon={<Apple className="w-5 h-5" />}
          status={mission.nutrition.status}
          label={mission.nutrition.label}
          action={
            <Link href={mission.nutrition.ctaHref}>
              <Button size="sm" variant={mission.nutrition.status === "done" ? "outline" : "default"}>
                {mission.nutrition.status === "done" ? "Vedi" : "Logga"}
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          }
        />

        {/* Task 3: Check-in */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              checkinDone ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary",
            )}
          >
            {checkinDone ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn("text-sm font-medium", checkinDone && "text-muted-foreground")}>
              {checkinDone ? `Oggi ti senti ${MOOD_EMOJI[optimisticMood!]}` : "Come ti senti oggi?"}
            </p>
            <div className="mt-2 flex gap-1.5">
              {CHECKIN_MOODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-label={`Mood ${m}`}
                  disabled={pending}
                  onClick={() => handleMood(m)}
                  className={cn(
                    "w-9 h-9 rounded-lg text-xl transition-all",
                    optimisticMood === m
                      ? "bg-primary/20 ring-2 ring-primary scale-110"
                      : "bg-background hover:bg-secondary",
                    pending && "opacity-50 cursor-not-allowed",
                  )}
                >
                  {MOOD_EMOJI[m]}
                </button>
              ))}
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MissionRow({
  icon,
  status,
  label,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  status: "pending" | "in_progress" | "done";
  label: string;
  subtitle?: string;
  action: React.ReactNode;
}) {
  const done = status === "done";
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          done ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary",
        )}
      >
        {done ? <Check className="w-4 h-4" /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", done && "line-through text-muted-foreground")}>{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
```

- [ ] **Step 4.2: Verificare typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 4.3: Commit**

```bash
git add src/components/dashboard/DailyMissionCard.tsx
git commit -m "feat(dashboard): add DailyMissionCard client component"
```

---

## Task 5: Modificare `dashboard/page.tsx`

**Files:**
- Modify: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 5.1: Rimuovere stat row + montare DailyMissionCard**

Modificare `src/app/(app)/dashboard/page.tsx`. Il file attuale ha 4 stat-card (righe 39-60) da rimuovere; serve montare la mission card e spostare streak/punti accanto al saluto.

Sostituire l'intero file con:

```tsx
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
        {/* Piano attivo */}
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

          {/* Sessioni recenti */}
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

        {/* Sidebar destra */}
        <div className="space-y-4">
          {/* Quick actions */}
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

          {/* Achievements recenti */}
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
```

Cambi chiave rispetto all'originale:
- Rimossa la variabile locale `weeklyCount` (non usata dopo aver tolto stat-card)
- Rimosso import `TrendingUp` (non più usato)
- Aggiunti import `getDailyMission`, `DailyMissionCard`
- Rimossa la sezione `{/* Stats row */}` con la grid 4 colonne
- Streak + punti compressi accanto al saluto
- Mission card piazzata sotto l'header e sopra la grid `lg:grid-cols-3`

- [ ] **Step 5.2: Verificare typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 5.3: Verificare build**

Run: `npm run build`
Expected: build OK, 54 (o equivalente) pagine generate, nessun errore.

- [ ] **Step 5.4: Commit**

```bash
git add src/app/\(app\)/dashboard/page.tsx
git commit -m "feat(dashboard): mount DailyMissionCard hero, compress stats in header"
```

---

## Task 6: Test E2E

**Files:**
- Create: `tests/e2e/m8-daily-mission.spec.ts`

- [ ] **Step 6.1: Scrivere test E2E**

Creare `tests/e2e/m8-daily-mission.spec.ts`:

```ts
import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

test.describe("M8 — Daily Mission", () => {
  test("render base: dashboard mostra mission card con 3 task", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.waitForURL(/\/dashboard/);
      // chiudi welcome tour se presente
      const skip = page.getByRole("button", { name: /Salta il tour/i });
      if (await skip.isVisible().catch(() => false)) await skip.click();

      await expect(page.getByText(/missione di oggi|missione completata/i)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/Pasti loggati: 0\/3/i)).toBeVisible();
      await expect(page.getByText(/Come ti senti oggi/i)).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("empty state: senza piano attivo, task 1 mostra 'Crea il tuo piano AI'", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const skip = page.getByRole("button", { name: /Salta il tour/i });
      if (await skip.isVisible().catch(() => false)) await skip.click();

      await expect(page.getByText(/Crea il tuo piano AI/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("check-in flow: click emoji salva mood e aggiorna progresso", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const skip = page.getByRole("button", { name: /Salta il tour/i });
      if (await skip.isVisible().catch(() => false)) await skip.click();

      await expect(page.getByText(/Come ti senti oggi/i)).toBeVisible({ timeout: 10_000 });

      // click "Mood 5" (💪)
      await page.getByRole("button", { name: "Mood 5" }).click();

      await expect(page.getByText(/Oggi ti senti 💪/i)).toBeVisible({ timeout: 5_000 });

      // verifica persistenza su DB
      const today = new Date();
      const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const checkin = await prisma.dailyCheckin.findUnique({
        where: { userId_date: { userId: user.id, date: todayUtc } },
      });
      expect(checkin?.mood).toBe(5);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("nutrition progress: dopo 3 NutritionLog di oggi, task 2 risulta done", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        await prisma.nutritionLog.create({
          data: {
            userId: user.id,
            date: now,
            mealType: "BREAKFAST",
            foodName: `Test meal ${i}`,
            quantity: 100,
            unit: "g",
            calories: 200,
          },
        });
      }
      await loginViaUI(page, user.email, user.password);
      const skip = page.getByRole("button", { name: /Salta il tour/i });
      if (await skip.isVisible().catch(() => false)) await skip.click();

      await expect(page.getByText(/Pasti loggati: 3\/3/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("workout done: WorkoutSession COMPLETED oggi marca task 1 come done", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const exercise = await prisma.exercise.findFirst({ where: { isActive: true } });
      if (!exercise) test.skip(true, "Nessun esercizio seedato");

      const plan = await prisma.workoutPlan.create({
        data: {
          userId: user.id, name: "Test Plan",
          durationWeeks: 1, workoutsPerWeek: 1,
          primaryGoal: "GENERAL_FITNESS", isActive: true, generatedByAI: false,
          days: { create: [{
            dayNumber: 1, name: "Petto", restDay: false,
            exercises: { create: [{ exerciseId: exercise!.id, orderIndex: 0, sets: 3, reps: 10, restSeconds: 60 }] },
          }] },
        },
        include: { days: true },
      });
      await prisma.workoutSession.create({
        data: {
          userId: user.id, planId: plan.id, planDayId: plan.days[0].id,
          status: "COMPLETED", totalSeconds: 1800, completedAt: new Date(),
        },
      });

      await loginViaUI(page, user.email, user.password);
      const skip = page.getByRole("button", { name: /Salta il tour/i });
      if (await skip.isVisible().catch(() => false)) await skip.click();

      // Day 1 — Petto deve apparire con line-through (done)
      const row = page.locator("text=/Day 1.*Petto/i").first();
      await expect(row).toBeVisible({ timeout: 10_000 });
      await expect(row).toHaveClass(/line-through/);
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
```

- [ ] **Step 6.2: Avviare dev server (se non già attivo)**

In un terminale separato (o background): `npm run dev`
Expected: `✓ Ready` su `http://localhost:3000`.

Playwright config ha già `webServer` automatico — se test E2E vengono lanciati da zero il server parte da solo.

- [ ] **Step 6.3: Eseguire i test E2E**

Run: `npm run test:e2e -- m8-daily-mission`
Expected: 5 passed.

Se il test "workout done" fallisce per assenza di esercizi seedati, il `test.skip` lo ignora — controllare comunque l'output.

- [ ] **Step 6.4: Eseguire tutta la suite per regressioni**

Run: `npm run test:e2e`
Expected: 50 passed (45 esistenti + 5 nuovi).

Se qualche test esistente fallisce a causa di selettori che cambiano (es. test che cerca le 4 stat-card rimosse), aggiornare quei test. Cercare nei file esistenti:

Run grep manuale prima di committare:
```bash
grep -nE "Streak attuale|Punti totali|Record streak|Questa settimana" tests/e2e/
```

Se trovi match, aggiorna i selettori per cercare gli stessi dati nel nuovo header compresso (es. `1gg` accanto a `Flame` icon).

- [ ] **Step 6.5: Commit**

```bash
git add tests/e2e/m8-daily-mission.spec.ts
git commit -m "test(e2e): add M8 Daily Mission suite (5 tests)"
```

---

## Task 7: Smoke test + push final

- [ ] **Step 7.1: Build production locale**

Run: `npm run build`
Expected: build OK, nessun warning bloccante.

- [ ] **Step 7.2: Aggiornare CHECKLIST_DEPLOY.md o memoria (opzionale)**

Se vuoi tracciare la milestone M8 in `CHECKLIST_DEPLOY.md` aggiungere una sezione breve. Skip se non necessario.

- [ ] **Step 7.3: Push branch**

Run:
```bash
git push origin main
```

Expected: push successful, Vercel triggers preview deploy.

- [ ] **Step 7.4: Smoke test su preview**

Una volta che il deploy Vercel è "Ready":
1. Aprire preview URL → login.
2. Verificare dashboard mostra la Daily Mission card (sostituisce le 4 stat).
3. Cliccare un mood emoji → verificare row diventa "Oggi ti senti X".
4. Verificare streak/punti nell'header (accanto al saluto).

Se qualcosa non funziona in produzione (es. `dailyCheckin` table mancante perché migrate non è girato in prod), eseguire `npx prisma db push --accept-data-loss` sul DB Supabase production come da memoria progetto.

---

## Verifica completa (checklist finale)

- [ ] Schema Prisma: modello `DailyCheckin` presente
- [ ] Migration applicata (locale + production)
- [ ] `src/lib/dailyMission.ts` esporta `getDailyMission` + tipi
- [ ] `POST /api/daily-checkin` risponde 200 con `{ ok: true, mood }`
- [ ] `DailyMissionCard` renderizza correttamente i 3 task
- [ ] Dashboard mostra header con streak/punti + mission card al posto delle stat-card
- [ ] 5 nuovi test E2E passano
- [ ] Suite totale 50/50 verde
- [ ] Build production pulito
- [ ] Deploy Vercel funziona
