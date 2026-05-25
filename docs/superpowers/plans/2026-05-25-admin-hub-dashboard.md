# Admin Hub Dashboard (M10) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere un hub admin a `/admin` con sub-sidebar e 6 tab (utenti, abbonamenti, esercizi, statistiche, gestione admin, AI usage), azioni soft reversibili e audit log persistente.

**Architecture:** Layout server-component `(app)/admin/layout.tsx` protetto da `requireAdmin()`. Sub-sidebar client component a sinistra dell'area admin. Ogni tab è una route Next 16 sotto `/admin/<tab>`. Le mutazioni vengono loggate in `AdminActionLog` via helper `logAdminAction()`. Autorizzazione esclusivamente server-side, niente check client.

**Tech Stack:** Next.js 16, NextAuth v5, Prisma 7.x (adapter-pg), Supabase, Tailwind, shadcn-like components (`Card`/`Button`/`Badge`/`Input`), recharts, lucide-react, Playwright.

**Spec di riferimento:** `docs/superpowers/specs/2026-05-25-admin-hub-dashboard-design.md`.

**Pre-requisiti operativi:**
- Aver già committato i fix Navbar (link "Admin") di sessione 12 — se non lo hai fatto, fallo prima.
- `ADMIN_EMAILS` in `.env.local` settato all'email che userai per testare (default `motion.insight.fitness@gmail.com`).
- `npm run dev` non in esecuzione mentre si modifica `.env.local` o prisma schema (lasciare cache pulita).

---

## File Structure

### Nuovi (28)

**lib/helpers:**
- `src/lib/admin-audit.ts` — helper `logAdminAction()`
- `src/lib/billing/ai-pricing.ts` — costi stimati per modello AI

**layout & redirect:**
- `src/app/(app)/admin/layout.tsx` — protezione + sub-sidebar wrapper
- `src/app/(app)/admin/page.tsx` — redirect a `/admin/users`

**pagine tab:**
- `src/app/(app)/admin/users/page.tsx`
- `src/app/(app)/admin/subscriptions/page.tsx`
- `src/app/(app)/admin/stats/page.tsx`
- `src/app/(app)/admin/admins/page.tsx`
- `src/app/(app)/admin/ai-usage/page.tsx`
- `src/app/(app)/admin/activity/page.tsx`

**API:**
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/admin/users/[id]/admin/route.ts`
- `src/app/api/admin/users/[id]/grant-premium/route.ts`
- `src/app/api/admin/users/[id]/quota/route.ts`
- `src/app/api/admin/exercises/[id]/active/route.ts`
- `src/app/api/admin/subscriptions/route.ts`
- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/admins/route.ts`
- `src/app/api/admin/admins/promote/route.ts`
- `src/app/api/admin/ai-usage/route.ts`
- `src/app/api/admin/activity/route.ts`

**componenti client:**
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/AdminMetricCard.tsx`
- `src/components/admin/ConfirmActionButton.tsx`
- `src/components/admin/UsersTable.tsx`
- `src/components/admin/UserDetailDrawer.tsx`
- `src/components/admin/SubscriptionsTable.tsx`
- `src/components/admin/StatsDashboard.tsx`
- `src/components/admin/AdminsManager.tsx`
- `src/components/admin/AiUsagePanel.tsx`
- `src/components/admin/ActivityLog.tsx`

**test:**
- `tests/e2e/m10-admin-hub.spec.ts` (8 test)

### Modificati (3)

- `prisma/schema.prisma` — aggiunge `AdminActionLog` + enum `AdminActionType` + relation su `User`
- `src/app/(app)/admin/exercises/page.tsx` — rimuove `requireAdmin()` (delegato al layout), header con 3 metriche, toggle isActive
- `src/app/api/admin/exercises/[id]/pt-video/route.ts` — chiama `logAdminAction()` su success
- `CHECKLIST_DEPLOY.md` — nuova sezione M10

---

## Task 1: Schema DB — modello AdminActionLog + migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Aggiungere enum + modello nel schema**

In `prisma/schema.prisma`, sezione enums (dopo l'ultimo enum esistente), aggiungere:

```prisma
enum AdminActionType {
  PROMOTE_ADMIN
  REVOKE_ADMIN
  GRANT_PREMIUM
  RESET_USER_QUOTA
  TOGGLE_EXERCISE_ACTIVE
  UPLOAD_PT_VIDEO
  DELETE_PT_VIDEO
}
```

In sezione modelli (dopo l'ultimo modello), aggiungere:

```prisma
model AdminActionLog {
  id          String           @id @default(cuid())
  actorId     String
  actorEmail  String
  action      AdminActionType
  targetType  String
  targetId    String?
  payload     Json?
  createdAt   DateTime         @default(now())

  actor       User             @relation("AdminActionActor", fields: [actorId], references: [id])

  @@index([actorId])
  @@index([createdAt])
  @@index([action])
}
```

Sul modello `User` (cercare blocco User), aggiungere la relazione inversa (vicino alle altre relazioni):

```prisma
  adminActions  AdminActionLog[]  @relation("AdminActionActor")
```

- [ ] **Step 2: Generare client Prisma**

Run: `npx prisma generate`
Expected: `Generated Prisma Client (...) to ./src/generated/prisma`

- [ ] **Step 3: Applicare migration**

Run: `npx prisma migrate dev --name add_admin_action_log`
Expected: applica la migration, file in `prisma/migrations/<timestamp>_add_admin_action_log/migration.sql`

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(schema): add AdminActionLog model + AdminActionType enum"
```

---

## Task 2: Helper logAdminAction

**Files:**
- Create: `src/lib/admin-audit.ts`

- [ ] **Step 1: Scrivere il file**

```typescript
import { prisma } from "./prisma";
import type { AdminActionType, Prisma } from "@/generated/prisma";

export async function logAdminAction(args: {
  actorId: string;
  actorEmail: string;
  action: AdminActionType;
  targetType: string;
  targetId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.adminActionLog.create({
      data: {
        actorId: args.actorId,
        actorEmail: args.actorEmail,
        action: args.action,
        targetType: args.targetType,
        targetId: args.targetId,
        payload: (args.payload ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("[admin-audit] failed to log action", { action: args.action, err });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin-audit.ts
git commit -m "feat(lib): add logAdminAction helper with non-blocking error handling"
```

---

## Task 3: Layout admin protetto + redirect /admin → /admin/users

**Files:**
- Create: `src/app/(app)/admin/layout.tsx`
- Create: `src/app/(app)/admin/page.tsx`

- [ ] **Step 1: Creare layout.tsx**

```typescript
import { redirect } from "next/navigation";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) {
      redirect(e.status === 401 ? "/login" : "/dashboard");
    }
    throw e;
  }
  return (
    <div className="flex gap-0 min-h-[calc(100vh-3.5rem)] lg:min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0 p-4 lg:p-6">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Creare page.tsx (redirect)**

```typescript
import { redirect } from "next/navigation";

export default function AdminIndex() {
  redirect("/admin/users");
}
```

- [ ] **Step 3: Commit (sarà incompleto: AdminSidebar non ancora esistente, ma serve un commit logico per ordine — committare insieme al sidebar in Task 4)**

Saltare il commit qui, va a Task 4.

---

## Task 4: Componenti admin riusabili (AdminSidebar + AdminMetricCard + ConfirmActionButton)

**Files:**
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/AdminMetricCard.tsx`
- Create: `src/components/admin/ConfirmActionButton.tsx`

- [ ] **Step 1: AdminSidebar.tsx**

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, CreditCard, Dumbbell, BarChart3, ShieldCheck, Bot, History } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_TABS = [
  { href: "/admin/users", label: "Utenti", icon: Users },
  { href: "/admin/subscriptions", label: "Abbonamenti", icon: CreditCard },
  { href: "/admin/exercises", label: "Esercizi & PT", icon: Dumbbell },
  { href: "/admin/stats", label: "Statistiche", icon: BarChart3 },
  { href: "/admin/admins", label: "Gestione admin", icon: ShieldCheck },
  { href: "/admin/ai-usage", label: "AI Usage", icon: Bot },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <>
      <aside className="hidden lg:flex flex-col w-[180px] bg-card border-r border-border p-3 gap-1 shrink-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2">Sezione admin</div>
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
        <Link
          href="/admin/activity"
          className={cn(
            "mt-auto flex items-center gap-2 px-3 py-2 rounded-md text-xs border-t border-border pt-3",
            pathname.startsWith("/admin/activity") ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <History className="w-3.5 h-3.5" />
          Attività recente →
        </Link>
      </aside>

      <div className="lg:hidden flex overflow-x-auto gap-1 px-2 py-2 border-b border-border bg-card sticky top-14 z-10">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium shrink-0 transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-secondary"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}
```

- [ ] **Step 2: AdminMetricCard.tsx**

```typescript
import { cn } from "@/lib/utils";

export function AdminMetricCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info" | "premium";
}) {
  const toneClass = {
    default: "text-foreground",
    success: "text-green-600 dark:text-green-500",
    warning: "text-amber-600 dark:text-amber-500",
    danger: "text-red-600 dark:text-red-500",
    info: "text-cyan-600 dark:text-cyan-500",
    premium: "text-purple-600 dark:text-purple-500",
  }[tone];

  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-2xl font-bold mt-1", toneClass)}>{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
```

- [ ] **Step 3: ConfirmActionButton.tsx**

```typescript
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ConfirmActionButton({
  label,
  confirmLabel,
  onConfirm,
  tone = "default",
  disabled = false,
  className,
}: {
  label: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  tone?: "default" | "success" | "warning" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const toneClass = {
    default: "border-border text-foreground",
    success: "border-green-600 text-green-600",
    warning: "border-amber-600 text-amber-600",
    danger: "border-red-600 text-red-600",
  }[tone];

  if (confirming) {
    return (
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          className={cn("border", toneClass, className)}
          disabled={pending || disabled}
          onClick={() => startTransition(async () => { await onConfirm(); setConfirming(false); })}
        >
          {pending ? "..." : (confirmLabel ?? "Conferma")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
          Annulla
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("border", toneClass, className)}
      disabled={disabled}
      onClick={() => setConfirming(true)}
    >
      {label}
    </Button>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 5: Commit (include Task 3 + 4)**

```bash
git add src/app/\(app\)/admin/layout.tsx src/app/\(app\)/admin/page.tsx src/components/admin/AdminSidebar.tsx src/components/admin/AdminMetricCard.tsx src/components/admin/ConfirmActionButton.tsx
git commit -m "feat(admin): layout protetto + sub-sidebar + componenti riusabili"
```

---

## Task 5: API GET /api/admin/users

**Files:**
- Create: `src/app/api/admin/users/route.ts`

- [ ] **Step 1: Scrivere la route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const q = url.searchParams.get("q")?.trim() ?? "";
  const filter = url.searchParams.get("filter") ?? "all";

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filter === "premium") where.subscriptionStatus = { in: ["ACTIVE", "TRIALING"] };
  else if (filter === "free") where.subscriptionStatus = { equals: "FREE" };
  else if (filter === "admin") where.isAdmin = true;

  const [total, totalPremium, totalAdmin, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: { in: ["ACTIVE", "TRIALING"] } } }),
    prisma.user.count({ where: { isAdmin: true } }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        createdAt: true,
        _count: { select: { workoutSessions: true } },
      },
    }),
  ]);

  const filteredCount = await prisma.user.count({ where });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      isAdmin: u.isAdmin,
      subscriptionStatus: u.subscriptionStatus,
      subscriptionPlan: u.subscriptionPlan,
      createdAt: u.createdAt.toISOString(),
      sessionsCount: u._count.workoutSessions,
    })),
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(filteredCount / PAGE_SIZE) || 1,
    counters: { total, premium: totalPremium, admin: totalAdmin },
  });
}
```

- [ ] **Step 2: Verifica nome relazione**

Run: `grep "workoutSessions" prisma/schema.prisma`
Expected: deve esistere la relazione `workoutSessions WorkoutSession[]` sul modello User. Se il nome è diverso (es. `sessions`), aggiornare il `_count.select` di conseguenza.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 4: Test manuale endpoint**

Run con dev server attivo (`npm run dev` in altra finestra):
```bash
curl http://localhost:3000/api/admin/users -b "next-auth.session-token=<token>"
```
Expected: 401 senza token, 200 con token admin valido. Il browser è più semplice: dopo login admin, visitare http://localhost:3000/api/admin/users.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/users/route.ts
git commit -m "feat(api): GET /api/admin/users paginated con filtri e counters"
```

---

## Task 6: Pagina /admin/users + UsersTable client

**Files:**
- Create: `src/app/(app)/admin/users/page.tsx`
- Create: `src/components/admin/UsersTable.tsx`

- [ ] **Step 1: Page server component**

```typescript
import { UsersTable } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Utenti</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestione utenti registrati, promozioni admin, premium gratuiti.</p>
      </div>
      <UsersTable />
    </div>
  );
}
```

- [ ] **Step 2: UsersTable client component**

```typescript
"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ConfirmActionButton } from "./ConfirmActionButton";
import { AdminMetricCard } from "./AdminMetricCard";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  createdAt: string;
  sessionsCount: number;
};

type Response = {
  users: UserRow[];
  page: number;
  totalPages: number;
  counters: { total: number; premium: number; admin: number };
};

export function UsersTable() {
  const router = useRouter();
  const [data, setData] = useState<Response | null>(null);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "premium" | "free" | "admin">("all");
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const fetchData = async () => {
    setLoading(true);
    const url = `/api/admin/users?page=${page}&q=${encodeURIComponent(q)}&filter=${filter}`;
    const res = await fetch(url);
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, filter]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const handleAction = async (url: string, method: string, successMsg: string) => {
    const res = await fetch(url, { method });
    if (res.ok) {
      startTransition(() => { fetchData(); router.refresh(); });
      // feedback minimale: success silenzioso (refresh visibile). Per errori, alert.
    } else {
      const data = await res.json().catch(() => ({}));
      alert(`${successMsg.replace(/^/, "")} fallita: ${data.error ?? "errore sconosciuto"}`);
    }
  };

  if (!data) return <div className="text-sm text-muted-foreground">Caricamento…</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <AdminMetricCard label="Utenti totali" value={data.counters.total} />
        <AdminMetricCard label="Premium" value={data.counters.premium} tone="premium" />
        <AdminMetricCard label="Admin" value={data.counters.admin} tone="success" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={onSearch} className="flex-1">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca email o nome..."
            className="max-w-md"
          />
        </form>
        <div className="flex gap-1 flex-wrap">
          {(["all", "premium", "free", "admin"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {f === "all" ? "Tutti" : f === "premium" ? "Premium" : f === "free" ? "Free" : "Admin"}
            </Button>
          ))}
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground">Aggiornamento…</div>}

      <div className="space-y-2">
        {data.users.map((u) => (
          <Card key={u.id}>
            <CardContent className="p-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <span className="truncate">{u.name ?? "—"}</span>
                  {u.isAdmin && <Badge className="bg-green-600 text-white">ADMIN</Badge>}
                  {(u.subscriptionStatus === "ACTIVE" || u.subscriptionStatus === "TRIALING") && (
                    <Badge className="bg-amber-500 text-white">PREMIUM</Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {u.email} · iscritto {new Date(u.createdAt).toLocaleDateString("it-IT")} · {u.sessionsCount} sessioni
                </div>
              </div>
              <div className="flex gap-2 flex-wrap shrink-0">
                {u.isAdmin ? (
                  <ConfirmActionButton
                    label="Revoca admin"
                    tone="danger"
                    onConfirm={() => handleAction(`/api/admin/users/${u.id}/admin`, "DELETE", "Admin revocato")}
                  />
                ) : (
                  <ConfirmActionButton
                    label="Rendi admin"
                    tone="success"
                    onConfirm={() => handleAction(`/api/admin/users/${u.id}/admin`, "POST", "Promosso admin")}
                  />
                )}
                {u.subscriptionStatus === "FREE" && (
                  <ConfirmActionButton
                    label="Premium 30g"
                    tone="warning"
                    onConfirm={() => handleAction(`/api/admin/users/${u.id}/grant-premium`, "POST", "Premium 30g attivato")}
                  />
                )}
                {/* TODO Drawer dettaglio in Task 9 */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Pagina {data.page} di {data.totalPages}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
          <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verifica deps**

Nessuna dep extra richiesta. `sonner` non in repo, quindi il feedback usa `alert()` per errori e `router.refresh()` per success. Se in futuro si introduce un toast system, sostituire `alert()` con quello.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori. Eventuali warning su `subscriptionStatus` confrontato con stringa: usare l'enum dal client Prisma se più stretto.

- [ ] **Step 5: Visivo**

Avvia `npm run dev`, login admin, vai a `/admin/users`. Atteso: tabella con utenti, 3 card metriche in alto, filtri funzionanti, paginazione, bottoni azione (azioni 404 perché API ancora da fare in Task 7-8).

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/admin/users/page.tsx src/components/admin/UsersTable.tsx
git commit -m "feat(admin): /admin/users page + UsersTable con filtri e paginazione"
```

---

## Task 7: API promote/revoke admin + Test E2E

**Files:**
- Create: `src/app/api/admin/users/[id]/admin/route.ts`
- Create: `tests/e2e/m10-admin-hub.spec.ts` (primo test)

- [ ] **Step 1: API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";

async function getActor() {
  return await requireAdmin();
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try { actor = await getActor(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, isAdmin: true } });
  if (!target) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  if (target.isAdmin) return NextResponse.json({ ok: true, alreadyAdmin: true });

  await prisma.user.update({ where: { id }, data: { isAdmin: true } });
  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "PROMOTE_ADMIN",
    targetType: "user",
    targetId: id,
    payload: { targetEmail: target.email },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try { actor = await getActor(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  if (id === actor.userId) {
    return NextResponse.json({ error: "Non puoi revocare admin a te stesso" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true, isAdmin: true } });
  if (!target) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
  if (!target.isAdmin) return NextResponse.json({ ok: true, alreadyNotAdmin: true });

  const totalAdmins = await prisma.user.count({ where: { isAdmin: true } });
  if (totalAdmins <= 1) {
    return NextResponse.json({ error: "Non puoi revocare l'ultimo admin" }, { status: 400 });
  }

  await prisma.user.update({ where: { id }, data: { isAdmin: false } });
  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "REVOKE_ADMIN",
    targetType: "user",
    targetId: id,
    payload: { targetEmail: target.email },
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Test E2E base (accesso + redirect)**

Creare `tests/e2e/m10-admin-hub.spec.ts`:

```typescript
import { test, expect } from "./fixtures";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAILS?.split(",")[0]?.trim().toLowerCase() ?? "";

test.describe("M10 admin hub", () => {
  test("non admin → /admin → redirect /dashboard", async ({ authedPage, testUser }) => {
    // testUser non è admin
    await authedPage.goto("/admin");
    await authedPage.waitForURL(/\/dashboard$/);
    expect(authedPage.url()).toMatch(/\/dashboard$/);
  });

  test("admin → /admin → redirect /admin/users e vede tabella", async ({ page, browserName }, testInfo) => {
    test.skip(!ADMIN_EMAIL, "ADMIN_EMAILS env vuota");
    // Login admin via UI (riusa loginViaUI se fixture compatibile)
    // Per semplicità qui faccio fetch diretto: scrivere il bootstrap admin in fixtures
    // Step prefferito: creare un admin fixture in fixtures.ts (Task 17 lo formalizza)
    test.fixme(true, "richiede admin fixture in fixtures.ts — vedi Task 17");
  });
});
```

Nota: il secondo test è marcato `test.fixme` finché Task 17 non aggiunge una fixture admin.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 4: Run il primo test E2E**

Run: `npm run test:e2e -- m10-admin-hub`
Expected: 1 test pass (non-admin redirect), 1 fixme.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/users/\[id\]/admin/route.ts tests/e2e/m10-admin-hub.spec.ts
git commit -m "feat(api): promote/revoke admin con lockout protection + test E2E base"
```

---

## Task 8: API grant-premium + reset-quota

**Files:**
- Create: `src/app/api/admin/users/[id]/grant-premium/route.ts`
- Create: `src/app/api/admin/users/[id]/quota/route.ts`

- [ ] **Step 1: grant-premium**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try { actor = await requireAdmin(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
  if (!target) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await prisma.user.update({
    where: { id },
    data: {
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: "MONTHLY",
      subscriptionCurrentPeriodEnd: periodEnd,
    },
  });

  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "GRANT_PREMIUM",
    targetType: "user",
    targetId: id,
    payload: { targetEmail: target.email, days: 30, periodEnd: periodEnd.toISOString() },
  });

  return NextResponse.json({ ok: true, periodEnd: periodEnd.toISOString() });
}
```

- [ ] **Step 2: quota reset**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try { actor = await requireAdmin(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
  if (!target) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  const now = new Date();
  const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const result = await prisma.usageCounter.deleteMany({ where: { userId: id, period } });

  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "RESET_USER_QUOTA",
    targetType: "user",
    targetId: id,
    payload: { targetEmail: target.email, period, deletedCount: result.count },
  });

  return NextResponse.json({ ok: true, deletedCount: result.count });
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 4: Visivo**

Avvia dev, login admin, vai a `/admin/users`, click "Premium 30g" su un utente FREE, conferma → tabella si refresha, badge PREMIUM appare.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/users/\[id\]/grant-premium/ src/app/api/admin/users/\[id\]/quota/
git commit -m "feat(api): grant-premium 30g + reset-quota mese corrente"
```

---

## Task 9: User detail drawer + API GET /api/admin/users/[id]

**Files:**
- Create: `src/app/api/admin/users/[id]/route.ts`
- Create: `src/components/admin/UserDetailDrawer.tsx`
- Modify: `src/components/admin/UsersTable.tsx` (aggiungere bottone "Dettaglio")

- [ ] **Step 1: API GET dettaglio**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      fitnessLevel: true,
      age: true,
      weightKg: true,
      heightCm: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
      subscriptionCurrentPeriodEnd: true,
      stripeCustomerId: true,
      createdAt: true,
      totalPoints: true,
      currentStreak: true,
      longestStreak: true,
      onboardingCompleted: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  const [recentSessions, recentCheckins] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId: id },
      orderBy: { startedAt: "desc" },
      take: 10,
      select: { id: true, status: true, startedAt: true, completedAt: true, totalSeconds: true, overallFeeling: true },
    }),
    prisma.dailyCheckin.findMany({
      where: { userId: id },
      orderBy: { date: "desc" },
      take: 5,
      select: { id: true, date: true, mood: true, note: true },
    }),
  ]);

  return NextResponse.json({ user, recentSessions, recentCheckins });
}
```

- [ ] **Step 2: UserDetailDrawer**

```typescript
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
```

- [ ] **Step 3: Aggiornare UsersTable per aprire drawer**

In `UsersTable.tsx`, aggiungere `import { UserDetailDrawer } from "./UserDetailDrawer";` in cima, state `const [drawerUserId, setDrawerUserId] = useState<string | null>(null);`, sostituire il commento `{/* TODO Drawer dettaglio in Task 9 */}` con:

```typescript
                <Button size="sm" variant="outline" onClick={() => setDrawerUserId(u.id)}>
                  Dettaglio
                </Button>
```

E in fondo al return, prima del `</div>` finale del component, aggiungere:

```typescript
      {drawerUserId && <UserDetailDrawer userId={drawerUserId} onClose={() => setDrawerUserId(null)} />}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

- [ ] **Step 5: Visivo**

Click "Dettaglio" su utente → drawer si apre da destra con profilo, billing, sessioni, check-in.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/users/\[id\]/route.ts src/components/admin/UserDetailDrawer.tsx src/components/admin/UsersTable.tsx
git commit -m "feat(admin): user detail drawer + API GET /api/admin/users/[id]"
```

---

## Task 10: Tab abbonamenti

**Files:**
- Create: `src/app/api/admin/subscriptions/route.ts`
- Create: `src/app/(app)/admin/subscriptions/page.tsx`
- Create: `src/components/admin/SubscriptionsTable.tsx`

- [ ] **Step 1: API**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;
const PRICE_MONTHLY = Number(process.env.STRIPE_PRICE_MONTHLY_AMOUNT_EUR ?? "9.99");
const PRICE_YEARLY = Number(process.env.STRIPE_PRICE_YEARLY_AMOUNT_EUR ?? "79");

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const status = url.searchParams.get("status") ?? "all";

  const where: Record<string, unknown> = {};
  if (status !== "all") where.subscriptionStatus = status.toUpperCase();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAhead = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [premiumActive, monthlyActive, yearlyActive, canceledLast30, totalActive30dAgo, renewalsNext7, list, totalRows] = await Promise.all([
    prisma.user.count({ where: { subscriptionStatus: { in: ["ACTIVE", "TRIALING"] } } }),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE", subscriptionPlan: "MONTHLY" } }),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE", subscriptionPlan: "YEARLY" } }),
    prisma.user.count({ where: { subscriptionStatus: "CANCELED", updatedAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { subscriptionStatus: { in: ["ACTIVE", "TRIALING"] }, createdAt: { lte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { subscriptionStatus: "ACTIVE", subscriptionCurrentPeriodEnd: { gte: new Date(), lte: sevenDaysAhead } } }),
    prisma.user.findMany({
      where: { subscriptionStatus: { not: "FREE" }, ...where },
      orderBy: { subscriptionCurrentPeriodEnd: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, email: true, subscriptionStatus: true, subscriptionPlan: true, subscriptionCurrentPeriodEnd: true, stripeCustomerId: true },
    }),
    prisma.user.count({ where: { subscriptionStatus: { not: "FREE" }, ...where } }),
  ]);

  const mrr = monthlyActive * PRICE_MONTHLY + yearlyActive * (PRICE_YEARLY / 12);
  const churn = totalActive30dAgo > 0 ? (canceledLast30 / totalActive30dAgo) * 100 : 0;

  return NextResponse.json({
    metrics: {
      premiumActive,
      mrrEur: Math.round(mrr * 100) / 100,
      churn30dPct: Math.round(churn * 10) / 10,
      renewalsNext7d: renewalsNext7,
    },
    list,
    page,
    totalPages: Math.ceil(totalRows / PAGE_SIZE) || 1,
  });
}
```

- [ ] **Step 2: SubscriptionsTable component**

```typescript
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminMetricCard } from "./AdminMetricCard";

type Row = {
  id: string;
  email: string;
  subscriptionStatus: string;
  subscriptionPlan: string | null;
  subscriptionCurrentPeriodEnd: string | null;
  stripeCustomerId: string | null;
};

type Response = {
  metrics: { premiumActive: number; mrrEur: number; churn30dPct: number; renewalsNext7d: number };
  list: Row[];
  page: number;
  totalPages: number;
};

export function SubscriptionsTable() {
  const [data, setData] = useState<Response | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/subscriptions?page=${page}&status=${status}`)
      .then(async (res) => { if (res.ok) setData(await res.json()); })
      .finally(() => setLoading(false));
  }, [page, status]);

  if (!data) return <div className="text-sm text-muted-foreground">Caricamento…</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard label="Premium attivi" value={data.metrics.premiumActive} tone="success" />
        <AdminMetricCard label="MRR stimato" value={`€ ${data.metrics.mrrEur}`} tone="premium" />
        <AdminMetricCard label="Churn 30g" value={`${data.metrics.churn30dPct}%`} tone="danger" />
        <AdminMetricCard label="Rinnovi 7g" value={data.metrics.renewalsNext7d} tone="info" />
      </div>

      <div className="flex gap-1 flex-wrap">
        {["all", "active", "trialing", "past_due", "canceled"].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => { setStatus(s); setPage(1); }}
          >
            {s === "all" ? "Tutti" : s.replace("_", " ")}
          </Button>
        ))}
      </div>

      {loading && <div className="text-sm text-muted-foreground">Aggiornamento…</div>}

      <div className="space-y-2">
        {data.list.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-3 flex justify-between items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate">{s.email}</div>
                <div className="text-xs text-muted-foreground">
                  {s.subscriptionCurrentPeriodEnd && `Periodo fino ${new Date(s.subscriptionCurrentPeriodEnd).toLocaleDateString("it-IT")}`}
                  {s.stripeCustomerId && (
                    <a
                      className="ml-2 text-cyan-600 underline"
                      href={`https://dashboard.stripe.com/customers/${s.stripeCustomerId}`}
                      target="_blank" rel="noopener noreferrer"
                    >
                      Stripe →
                    </a>
                  )}
                </div>
              </div>
              <div className="flex gap-2 items-center shrink-0">
                <Badge variant="outline">{s.subscriptionStatus}</Badge>
                {s.subscriptionPlan && <Badge>{s.subscriptionPlan}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Pagina {data.page} di {data.totalPages}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
          <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Pagina**

```typescript
import { SubscriptionsTable } from "@/components/admin/SubscriptionsTable";

export const dynamic = "force-dynamic";

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Abbonamenti</h1>
        <p className="text-sm text-muted-foreground mt-1">Stato subscription Stripe e metriche aggregate.</p>
      </div>
      <SubscriptionsTable />
    </div>
  );
}
```

- [ ] **Step 4: Typecheck + visivo**

Run: `npx tsc --noEmit` → zero errori.
Vai a `/admin/subscriptions` → 4 metriche card + lista subscription + filtri funzionanti.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/subscriptions/ src/app/\(app\)/admin/subscriptions/ src/components/admin/SubscriptionsTable.tsx
git commit -m "feat(admin): tab Abbonamenti con metriche MRR/churn e lista filtrata"
```

---

## Task 11: Tab Esercizi — toggle isActive + retrofit audit log M9

**Files:**
- Create: `src/app/api/admin/exercises/[id]/active/route.ts`
- Modify: `src/app/api/admin/exercises/[id]/pt-video/route.ts`
- Modify: `src/app/(app)/admin/exercises/page.tsx`
- Modify: `src/components/admin/AdminExercisesTable.tsx`

- [ ] **Step 1: API toggle active**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try { actor = await requireAdmin(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
  const { id } = await params;

  const exercise = await prisma.exercise.findUnique({ where: { id }, select: { id: true, slug: true, isActive: true } });
  if (!exercise) return NextResponse.json({ error: "Esercizio non trovato" }, { status: 404 });

  const newActive = !exercise.isActive;
  await prisma.exercise.update({ where: { id }, data: { isActive: newActive } });
  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "TOGGLE_EXERCISE_ACTIVE",
    targetType: "exercise",
    targetId: id,
    payload: { slug: exercise.slug, from: exercise.isActive, to: newActive },
  });

  return NextResponse.json({ ok: true, isActive: newActive });
}
```

- [ ] **Step 2: Retrofit pt-video con audit log**

Aprire `src/app/api/admin/exercises/[id]/pt-video/route.ts`. Sopra all'export `POST` aggiungere:

```typescript
import { logAdminAction } from "@/lib/admin-audit";
```

Dopo l'aggiornamento `Exercise.videoUrl` (cercare la riga `prisma.exercise.update(...)` nell'handler POST), aggiungere immediatamente dopo:

```typescript
  await logAdminAction({
    actorId: adminInfo.userId,
    actorEmail: adminInfo.email,
    action: "UPLOAD_PT_VIDEO",
    targetType: "exercise",
    targetId: id,
    payload: { slug: exercise.slug, videoUrl: publicUrl },
  });
```

(Nota: `adminInfo` è il return di `requireAdmin()`. Se nel file il nome variabile è diverso, adattare.)

Stessa cosa nell'handler DELETE, dopo `prisma.exercise.update({ data: { videoUrl: null } })`:

```typescript
  await logAdminAction({
    actorId: adminInfo.userId,
    actorEmail: adminInfo.email,
    action: "DELETE_PT_VIDEO",
    targetType: "exercise",
    targetId: id,
    payload: { slug: exercise.slug },
  });
```

- [ ] **Step 3: Rimuovere requireAdmin duplicato da /admin/exercises/page.tsx**

Aprire `src/app/(app)/admin/exercises/page.tsx`. Rimuovere il blocco `try { await requireAdmin(); } catch (...)` con `redirect`. L'auth è ora gestita dal layout admin (Task 3). Mantenere solo le query Prisma e il rendering.

Aggiungere header con 3 metriche (totale, con video PT, attivi):

```typescript
import { AdminMetricCard } from "@/components/admin/AdminMetricCard";

const [total, withVideo, activeCount] = await Promise.all([
  prisma.exercise.count(),
  prisma.exercise.count({ where: { videoUrl: { not: null } } }),
  prisma.exercise.count({ where: { isActive: true } }),
]);
```

E nel JSX, prima di `<AdminExercisesTable exercises={exercises} />`:

```typescript
<div className="grid grid-cols-3 gap-3 mb-4">
  <AdminMetricCard label="Esercizi totali" value={total} />
  <AdminMetricCard label="Con video PT" value={withVideo} tone="success" />
  <AdminMetricCard label="Attivi" value={activeCount} tone="info" />
</div>
```

- [ ] **Step 4: Aggiungere toggle isActive in AdminExercisesTable**

Aprire `src/components/admin/AdminExercisesTable.tsx`. Per ogni riga esercizio nel `.map`, aggiungere accanto al badge "Video PT/Mancante" un secondo badge "Attivo/Disattivo" e un bottone "Attiva/Disattiva":

```typescript
<Badge variant={ex.isActive ? "default" : "outline"}>
  {ex.isActive ? "Attivo" : "Disattivo"}
</Badge>
<Button
  size="sm"
  variant="ghost"
  onClick={async () => {
    const res = await fetch(`/api/admin/exercises/${ex.id}/active`, { method: "PATCH" });
    if (res.ok) router.refresh();
  }}
>
  {ex.isActive ? "Disattiva" : "Attiva"}
</Button>
```

Assicurarsi che il type `Exercise` passato come prop includa `isActive: boolean`.

- [ ] **Step 5: Typecheck + visivo**

Run: `npx tsc --noEmit` → zero errori.
Vai a `/admin/exercises` → 3 metriche, tabella con badge attivo/disattivo, click toggle → aggiorna riga.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/exercises/\[id\]/ src/app/\(app\)/admin/exercises/page.tsx src/components/admin/AdminExercisesTable.tsx
git commit -m "feat(admin): tab Esercizi toggle isActive + retrofit M9 audit log"
```

---

## Task 12: Tab Statistiche

**Files:**
- Create: `src/app/api/admin/stats/route.ts`
- Create: `src/app/(app)/admin/stats/page.tsx`
- Create: `src/components/admin/StatsDashboard.tsx`

- [ ] **Step 1: API stats**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export async function GET(_req: NextRequest) {
  try { await requireAdmin(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [
    totalUsers,
    mauUsers,
    dauUsers,
    workouts30,
    analyses30,
    checkins30,
    newUsersDaily,
    workoutsDaily,
    topExercises,
    fitnessLevelDistRaw,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: { OR: [
        { workoutSessions: { some: { startedAt: { gte: thirtyDaysAgo } } } },
        { analysisSessions: { some: { createdAt: { gte: thirtyDaysAgo } } } },
        { nutritionLogs: { some: { date: { gte: thirtyDaysAgo } } } },
      ] },
    }),
    prisma.user.count({
      where: { OR: [
        { workoutSessions: { some: { startedAt: { gte: todayStart } } } },
        { analysisSessions: { some: { createdAt: { gte: todayStart } } } },
      ] },
    }),
    prisma.workoutSession.count({ where: { status: "COMPLETED", completedAt: { gte: thirtyDaysAgo } } }),
    prisma.analysisSession.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.dailyCheckin.count({ where: { date: { gte: thirtyDaysAgo } } }),
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT DATE_TRUNC('day', "createdAt")::date AS day, COUNT(*)::bigint AS count
      FROM "User"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw<Array<{ day: Date; count: bigint }>>`
      SELECT DATE_TRUNC('day', "completedAt")::date AS day, COUNT(*)::bigint AS count
      FROM "WorkoutSession"
      WHERE "status" = 'COMPLETED' AND "completedAt" >= ${thirtyDaysAgo}
      GROUP BY day
      ORDER BY day ASC
    `,
    prisma.$queryRaw<Array<{ exerciseId: string; name: string; count: bigint }>>`
      SELECT e.id AS "exerciseId", e.name, COUNT(wse.id)::bigint AS count
      FROM "Exercise" e
      JOIN "WorkoutSessionExercise" wse ON wse."exerciseId" = e.id
      JOIN "WorkoutSession" ws ON ws.id = wse."sessionId"
      WHERE ws."status" = 'COMPLETED' AND ws."completedAt" >= ${thirtyDaysAgo}
      GROUP BY e.id, e.name
      ORDER BY count DESC
      LIMIT 10
    `,
    prisma.user.groupBy({
      by: ["fitnessLevel"],
      _count: { _all: true },
      where: { fitnessLevel: { not: null } },
    }),
  ]);

  return NextResponse.json({
    counters: {
      totalUsers,
      mauUsers,
      dauUsers,
      workouts30,
      analyses30,
      checkins30,
    },
    newUsersDaily: newUsersDaily.map((d) => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.count) })),
    workoutsDaily: workoutsDaily.map((d) => ({ day: d.day.toISOString().slice(0, 10), count: Number(d.count) })),
    topExercises: topExercises.map((e) => ({ id: e.exerciseId, name: e.name, count: Number(e.count) })),
    fitnessLevelDistribution: fitnessLevelDistRaw.map((r) => ({ level: r.fitnessLevel, count: r._count._all })),
  });
}
```

**Nota raw query**: assumono nomi tabella `User`, `WorkoutSession`, `WorkoutSessionExercise`, `Exercise` PascalCase. Verificare con `psql` o con `prisma db pull`. Se i nomi reali sono diversi (es. snake_case), aggiornare le query.

- [ ] **Step 2: StatsDashboard component**

```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminMetricCard } from "./AdminMetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

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

  if (!data) return <div className="text-sm text-muted-foreground">Caricamento…</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <AdminMetricCard label="Utenti totali" value={data.counters.totalUsers} />
        <AdminMetricCard label="MAU 30g" value={data.counters.mauUsers} tone="success" />
        <AdminMetricCard label="DAU oggi" value={data.counters.dauUsers} tone="info" />
        <AdminMetricCard label="Workout 30g" value={data.counters.workouts30} tone="warning" />
        <AdminMetricCard label="Analisi 30g" value={data.counters.analyses30} tone="premium" />
        <AdminMetricCard label="Check-in 30g" value={data.counters.checkins30} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader><CardTitle className="text-sm">Nuovi utenti per giorno (30g)</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-sm">Workout completati per giorno (30g)</CardTitle></CardHeader>
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
        <CardHeader><CardTitle className="text-sm">Top 10 esercizi (sessioni completate ultimi 30g)</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.topExercises.length === 0 && <div className="text-muted-foreground">Nessun dato</div>}
          {data.topExercises.map((e) => (
            <div key={e.id} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{e.name}</span>
              <span className="text-muted-foreground">{e.count} sess.</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Distribuzione livello fitness</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.fitnessLevelDistribution.map((d) => (
            <div key={d.level ?? "null"} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{d.level ?? "—"}</span>
              <span className="text-muted-foreground">{d.count} utenti</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Pagina**

```typescript
import { StatsDashboard } from "@/components/admin/StatsDashboard";

export const dynamic = "force-dynamic";

export default function AdminStatsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Statistiche d'uso</h1>
        <p className="text-sm text-muted-foreground mt-1">Aggregati globali sull'utilizzo dell'app.</p>
      </div>
      <StatsDashboard />
    </div>
  );
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errori.

Se le raw query falliscono per nomi tabella diversi, aggiustare. Si può anche temporaneamente sostituirle con `prisma.user.findMany` + group manuale in JS (più lento, ma sicuro): segnalare il fallback nel commit.

- [ ] **Step 5: Visivo**

Vai a `/admin/stats` → 6 card metriche, 2 bar chart, top esercizi, distribuzione livelli.

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/stats/ src/app/\(app\)/admin/stats/ src/components/admin/StatsDashboard.tsx
git commit -m "feat(admin): tab Statistiche con MAU/DAU/charts/top esercizi"
```

---

## Task 13: Tab Gestione admin

**Files:**
- Create: `src/app/api/admin/admins/route.ts`
- Create: `src/app/api/admin/admins/promote/route.ts`
- Create: `src/app/(app)/admin/admins/page.tsx`
- Create: `src/components/admin/AdminsManager.tsx`

- [ ] **Step 1: API GET /api/admin/admins**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError, parseAdminEmails } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  try { await requireAdmin(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const envEmails = parseAdminEmails();
  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    orderBy: { updatedAt: "desc" },
    select: { id: true, email: true, name: true, updatedAt: true, createdAt: true },
  });

  return NextResponse.json({
    envEmails,
    admins: admins.map((a) => ({
      ...a,
      origin: envEmails.includes(a.email.toLowerCase()) ? "auto" : "manual",
      updatedAt: a.updatedAt.toISOString(),
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
```

- [ ] **Step 2: API POST /api/admin/admins/promote**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";

export async function POST(req: NextRequest) {
  let actor;
  try { actor = await requireAdmin(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email mancante" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, isAdmin: true } });
  if (!target) return NextResponse.json({ error: "Utente non trovato — deve registrarsi prima" }, { status: 404 });
  if (target.isAdmin) return NextResponse.json({ ok: true, alreadyAdmin: true });

  await prisma.user.update({ where: { id: target.id }, data: { isAdmin: true } });
  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "PROMOTE_ADMIN",
    targetType: "user",
    targetId: target.id,
    payload: { targetEmail: target.email, via: "admins-page-form" },
  });

  return NextResponse.json({ ok: true, userId: target.id });
}
```

- [ ] **Step 3: AdminsManager component**

```typescript
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
                  <div className="font-semibold">{a.email} {isSelf && <Badge variant="outline">tu</Badge>}</div>
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
```

- [ ] **Step 4: Pagina**

```typescript
import { AdminsManager } from "@/components/admin/AdminsManager";

export const dynamic = "force-dynamic";

export default function AdminAdminsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Gestione admin</h1>
        <p className="text-sm text-muted-foreground mt-1">Chi può accedere all'area admin.</p>
      </div>
      <AdminsManager />
    </div>
  );
}
```

- [ ] **Step 5: Typecheck + visivo**

Run: `npx tsc --noEmit` → zero errori.
Vai a `/admin/admins` → 3 sezioni visibili, form promuovi funzionante (rifiuta se utente inesistente, ok se esiste).

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/admins/ src/app/\(app\)/admin/admins/ src/components/admin/AdminsManager.tsx
git commit -m "feat(admin): tab Gestione admin con env emails + form promote + lockout"
```

---

## Task 14: Tab AI Usage

**Files:**
- Create: `src/lib/billing/ai-pricing.ts`
- Create: `src/app/api/admin/ai-usage/route.ts`
- Create: `src/app/(app)/admin/ai-usage/page.tsx`
- Create: `src/components/admin/AiUsagePanel.tsx`

- [ ] **Step 1: Helper ai-pricing**

```typescript
// Pricing approssimato Anthropic (USD per 1M tokens, aggiornato 2026)
// Da rifinire post-deploy con dati reali. Cambio USD→EUR: 0.92
const USD_TO_EUR = 0.92;

const PRICING_PER_1M_USD = {
  "claude-opus-4-7": { input: 15, output: 75 },
  "claude-sonnet-4-6": { input: 3, output: 15 },
  "claude-haiku-4-5-20251001": { input: 0.25, output: 1.25 },
};

// Stime token medi per chiamata per feature (calibrare con dati reali)
export const FEATURE_TOKEN_ESTIMATES = {
  generate_plan: { input: 2000, output: 3500, model: "claude-sonnet-4-6" },
  generate_nutrition_plan: { input: 1800, output: 3000, model: "claude-sonnet-4-6" },
  ai_chat: { input: 1000, output: 800, model: "claude-sonnet-4-6" },
  analysis_start: { input: 1500, output: 2000, model: "claude-sonnet-4-6" },
} as const;

export type FeatureKey = keyof typeof FEATURE_TOKEN_ESTIMATES;

export function estimateCostEur(callsByFeature: Record<string, number>): number {
  let totalUsd = 0;
  for (const [feature, count] of Object.entries(callsByFeature)) {
    const est = FEATURE_TOKEN_ESTIMATES[feature as FeatureKey];
    if (!est) continue;
    const pricing = PRICING_PER_1M_USD[est.model as keyof typeof PRICING_PER_1M_USD];
    if (!pricing) continue;
    const costPerCall = (est.input / 1_000_000) * pricing.input + (est.output / 1_000_000) * pricing.output;
    totalUsd += costPerCall * count;
  }
  return Math.round(totalUsd * USD_TO_EUR * 100) / 100;
}
```

- [ ] **Step 2: API**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { estimateCostEur, FEATURE_TOKEN_ESTIMATES } from "@/lib/billing/ai-pricing";

const PAGE_SIZE = 6;

function periodCurrent(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

function periodsLastN(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export async function GET(_req: NextRequest) {
  try { await requireAdmin(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const periodNow = periodCurrent();
  const last6 = periodsLastN(PAGE_SIZE);

  const [byFeatureNow, byPeriod, topUsersNow, freeUsersTotal, freeUsersAtLimit] = await Promise.all([
    prisma.usageCounter.groupBy({
      by: ["feature"],
      where: { period: periodNow },
      _sum: { count: true },
    }),
    prisma.usageCounter.groupBy({
      by: ["period"],
      where: { period: { in: last6 } },
      _sum: { count: true },
    }),
    prisma.usageCounter.groupBy({
      by: ["userId"],
      where: { period: periodNow },
      _sum: { count: true },
      orderBy: { _sum: { count: "desc" } },
      take: 10,
    }),
    prisma.user.count({ where: { subscriptionStatus: "FREE" } }),
    // utenti FREE con almeno una quota maxata (count >= 3 per generate_plan o >= 5 per analysis_start)
    prisma.user.count({
      where: {
        subscriptionStatus: "FREE",
        usageCounters: {
          some: {
            period: periodNow,
            OR: [
              { feature: "generate_plan", count: { gte: 3 } },
              { feature: "analysis_start", count: { gte: 5 } },
              { feature: "generate_nutrition_plan", count: { gte: 1 } },
            ],
          },
        },
      },
    }),
  ]);

  const userIds = topUsersNow.map((u) => u.userId);
  const userInfo = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true },
  });
  const userMap = new Map(userInfo.map((u) => [u.id, u.email]));

  const callsThisMonth: Record<string, number> = {};
  for (const r of byFeatureNow) callsThisMonth[r.feature] = r._sum.count ?? 0;

  const costEur = estimateCostEur(callsThisMonth);
  const percentFreeAtLimit = freeUsersTotal > 0 ? Math.round((freeUsersAtLimit / freeUsersTotal) * 1000) / 10 : 0;

  return NextResponse.json({
    costEur,
    percentFreeAtLimit,
    byFeatureNow: Object.entries(callsThisMonth).map(([feature, count]) => ({ feature, count })),
    byPeriod: byPeriod.map((p) => ({ period: p.period, count: p._sum.count ?? 0 })).sort((a, b) => b.period.localeCompare(a.period)),
    topUsers: topUsersNow.map((u) => ({ userId: u.userId, email: userMap.get(u.userId) ?? "?", count: u._sum.count ?? 0 })),
    knownFeatures: Object.keys(FEATURE_TOKEN_ESTIMATES),
  });
}
```

- [ ] **Step 3: AiUsagePanel**

```typescript
"use client";

import { useEffect, useState } from "react";
import { AdminMetricCard } from "./AdminMetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Data = {
  costEur: number;
  percentFreeAtLimit: number;
  byFeatureNow: Array<{ feature: string; count: number }>;
  byPeriod: Array<{ period: string; count: number }>;
  topUsers: Array<{ userId: string; email: string; count: number }>;
  knownFeatures: string[];
};

export function AiUsagePanel() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    fetch("/api/admin/ai-usage").then(async (res) => {
      if (res.ok) setData(await res.json());
    });
  }, []);

  if (!data) return <div className="text-sm text-muted-foreground">Caricamento…</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <AdminMetricCard label="Costo stimato mese" value={`€ ${data.costEur}`} hint="basato su stime token" tone="premium" />
        <AdminMetricCard label="Utenti FREE al limite" value={`${data.percentFreeAtLimit}%`} hint="almeno 1 quota maxata" tone="warning" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-sm">Uso per feature (mese corrente)</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.byFeatureNow.length === 0 && <div className="text-muted-foreground">Nessuna chiamata questo mese</div>}
          {data.byFeatureNow.map((r) => (
            <div key={r.feature} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{r.feature}</span>
              <span className="text-muted-foreground">{r.count} chiamate</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Uso per mese (ultimi 6)</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.byPeriod.map((p) => (
            <div key={p.period} className="flex justify-between border-b border-border py-1 last:border-0">
              <span>{p.period}</span>
              <span className="text-muted-foreground">{p.count} chiamate</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Top 10 utenti per uso AI (mese corrente)</CardTitle></CardHeader>
        <CardContent className="text-xs space-y-1">
          {data.topUsers.map((u) => (
            <div key={u.userId} className="flex justify-between border-b border-border py-1 last:border-0">
              <span className="truncate max-w-[200px]">{u.email}</span>
              <span className="text-muted-foreground">{u.count} chiamate</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Pagina**

```typescript
import { AiUsagePanel } from "@/components/admin/AiUsagePanel";

export const dynamic = "force-dynamic";

export default function AdminAiUsagePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">AI Usage</h1>
        <p className="text-sm text-muted-foreground mt-1">Uso e costi stimati delle feature AI.</p>
      </div>
      <AiUsagePanel />
    </div>
  );
}
```

- [ ] **Step 5: Typecheck + visivo**

Run: `npx tsc --noEmit` → zero errori.
Vai a `/admin/ai-usage` → 2 card metriche, 3 sezioni Card con dati.

- [ ] **Step 6: Commit**

```bash
git add src/lib/billing/ai-pricing.ts src/app/api/admin/ai-usage/ src/app/\(app\)/admin/ai-usage/ src/components/admin/AiUsagePanel.tsx
git commit -m "feat(admin): tab AI Usage con costo stimato + breakdown per feature/mese/utente"
```

---

## Task 15: Activity log page

**Files:**
- Create: `src/app/api/admin/activity/route.ts`
- Create: `src/app/(app)/admin/activity/page.tsx`
- Create: `src/components/admin/ActivityLog.tsx`

- [ ] **Step 1: API**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try { await requireAdmin(); } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const action = url.searchParams.get("action");
  const actorId = url.searchParams.get("actorId");

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (actorId) where.actorId = actorId;

  const [items, total] = await Promise.all([
    prisma.adminActionLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.adminActionLog.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      actorEmail: i.actorEmail,
      action: i.action,
      targetType: i.targetType,
      targetId: i.targetId,
      payload: i.payload,
      createdAt: i.createdAt.toISOString(),
    })),
    page,
    totalPages: Math.ceil(total / PAGE_SIZE) || 1,
  });
}
```

- [ ] **Step 2: ActivityLog component**

```typescript
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Item = {
  id: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  payload: unknown;
  createdAt: string;
};

const ACTION_TONE: Record<string, string> = {
  PROMOTE_ADMIN: "bg-green-600",
  REVOKE_ADMIN: "bg-red-600",
  GRANT_PREMIUM: "bg-amber-500",
  RESET_USER_QUOTA: "bg-cyan-600",
  TOGGLE_EXERCISE_ACTIVE: "bg-blue-500",
  UPLOAD_PT_VIDEO: "bg-purple-500",
  DELETE_PT_VIDEO: "bg-purple-700",
};

export function ActivityLog() {
  const [items, setItems] = useState<Item[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/activity?page=${page}`).then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotalPages(data.totalPages);
      }
    });
  }, [page]);

  return (
    <div className="space-y-2">
      {items.map((i) => (
        <Card key={i.id}>
          <CardContent className="p-3">
            <button
              type="button"
              onClick={() => setExpanded(expanded === i.id ? null : i.id)}
              className="w-full flex justify-between items-center text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={`${ACTION_TONE[i.action] ?? "bg-gray-500"} text-white text-[10px]`}>
                    {i.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(i.createdAt).toLocaleString("it-IT")}
                  </span>
                </div>
                <div className="text-xs truncate">
                  <strong>{i.actorEmail}</strong> → {i.targetType}{i.targetId ? `:${i.targetId}` : ""}
                </div>
              </div>
              <span className="text-xs text-muted-foreground ml-2">{expanded === i.id ? "▾" : "▸"}</span>
            </button>
            {expanded === i.id && (
              <pre className="mt-2 p-2 bg-secondary/50 rounded text-[10px] overflow-x-auto">
                {JSON.stringify(i.payload, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Pagina {page} di {totalPages}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Pagina**

```typescript
import { ActivityLog } from "@/components/admin/ActivityLog";

export const dynamic = "force-dynamic";

export default function AdminActivityPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Attività recente</h1>
        <p className="text-sm text-muted-foreground mt-1">Storico delle azioni admin sul sistema.</p>
      </div>
      <ActivityLog />
    </div>
  );
}
```

- [ ] **Step 4: Typecheck + visivo**

Run: `npx tsc --noEmit` → zero errori.
Vai a `/admin/activity` → lista log con badge action color-coded, click espande payload.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/activity/ src/app/\(app\)/admin/activity/ src/components/admin/ActivityLog.tsx
git commit -m "feat(admin): /admin/activity audit log viewer con expand payload"
```

---

## Task 16: Documentazione deploy + AGENTS notes

**Files:**
- Modify: `CHECKLIST_DEPLOY.md`

- [ ] **Step 1: Aggiungere sezione M10**

Aprire `CHECKLIST_DEPLOY.md`. Trovare la sezione M9 e aggiungere DOPO di essa:

```markdown
## M10 — Admin Hub Dashboard

**Cosa cambia in produzione**:
- Nuova tabella DB `AdminActionLog` + enum `AdminActionType` (migration applicata)
- ~25 nuove route/page sotto `/admin/*` e `/api/admin/*`
- Nessuna nuova env var obbligatoria
- Env opzionali per pricing display:
  - `STRIPE_PRICE_MONTHLY_AMOUNT_EUR` (default `9.99`)
  - `STRIPE_PRICE_YEARLY_AMOUNT_EUR` (default `79`)

**Azioni manuali**:
1. Dopo deploy, applicare migration in produzione:
   ```bash
   npx prisma migrate deploy
   ```
2. Verificare che l'admin con email in `ADMIN_EMAILS` (env Vercel) possa raggiungere `https://tuodominio/admin/users` (login → click "Admin" in sidebar).
3. Promuovere eventuali co-admin via UI: `/admin/admins` → form "Promuovi un utente esistente".
4. Le azioni soft eseguite ora finiscono in `AdminActionLog`. Audit visualizzabile in `/admin/activity`.

**Limiti noti**:
- "Grant Premium 30g" NON crea una subscription Stripe — è solo sblocco gating lato app. Allo scadere il gating ritorna FREE.
- Pricing AI in `/admin/ai-usage` è stimato (token medi per feature). Va calibrato post-deploy con dati reali.
- Nessuna feature di refund Stripe / delete account / export CSV (out of scope MVP).

**Verifica produzione**:
- `/admin` → redirect `/admin/users` con dati reali
- `/admin/stats` → metriche aggregate, chart popolati
- Promuovere un utente test → verifica in `/admin/activity` che il log appaia
```

- [ ] **Step 2: Commit**

```bash
git add CHECKLIST_DEPLOY.md
git commit -m "docs(deploy): sezione M10 admin hub dashboard"
```

---

## Task 17: Suite E2E completa M10

**Files:**
- Modify: `tests/e2e/m10-admin-hub.spec.ts` (rimuove fixme, aggiunge 7 test)
- Modify: `tests/e2e/fixtures.ts` (aggiunge admin fixture)

- [ ] **Step 1: Estendere fixtures.ts con admin fixture**

Aprire `tests/e2e/fixtures.ts`. Aggiungere una nuova fixture `adminUser` che crea un user con `isAdmin=true` direttamente nel DB, salta il bootstrap env:

```typescript
// dentro la export `test.extend({...})`, aggiungere:
  adminUser: async ({}, use) => {
    const email = `e2e-admin+${Date.now()}-${Math.random().toString(36).slice(2,8)}@fitai-test.local`;
    const passwordHash = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: "E2E Admin",
        passwordHash,
        onboardingCompleted: true,
        isAdmin: true,
      },
    });
    await use({ id: user.id, email, password: "password123" });
    try { await prisma.user.delete({ where: { id: user.id } }); } catch {}
  },

  authedAdminPage: async ({ page, adminUser }, use) => {
    await loginViaUI(page, adminUser.email, adminUser.password);
    await use(page);
  },
```

Estendere il type definition di `test` per includere `adminUser` e `authedAdminPage`.

- [ ] **Step 2: Scrivere i 7 test M10**

Sostituire il contenuto attuale di `tests/e2e/m10-admin-hub.spec.ts`:

```typescript
import { test, expect } from "./fixtures";
import { prisma } from "@/lib/prisma";

test.describe("M10 admin hub", () => {
  test("non admin → /admin → redirect /dashboard", async ({ authedPage }) => {
    await authedPage.goto("/admin");
    await authedPage.waitForURL(/\/dashboard$/, { timeout: 10_000 });
    expect(authedPage.url()).toMatch(/\/dashboard$/);
  });

  test("admin → /admin → redirect /admin/users e vede tabella", async ({ authedAdminPage }) => {
    await authedAdminPage.goto("/admin");
    await authedAdminPage.waitForURL(/\/admin\/users$/, { timeout: 10_000 });
    await expect(authedAdminPage.getByRole("heading", { name: "Utenti" })).toBeVisible();
  });

  test("admin → naviga tab Abbonamenti via sidebar", async ({ authedAdminPage }) => {
    await authedAdminPage.goto("/admin/users");
    await authedAdminPage.getByRole("link", { name: /Abbonamenti/i }).first().click();
    await authedAdminPage.waitForURL(/\/admin\/subscriptions$/);
    await expect(authedAdminPage.getByRole("heading", { name: "Abbonamenti" })).toBeVisible();
  });

  test("admin → promuove un user normale → verifica DB + audit log", async ({ authedAdminPage, testUser }) => {
    const resp = await authedAdminPage.request.post(`/api/admin/users/${testUser.id}/admin`);
    expect(resp.status()).toBe(200);
    const dbUser = await prisma.user.findUnique({ where: { id: testUser.id }, select: { isAdmin: true } });
    expect(dbUser?.isAdmin).toBe(true);
    const log = await prisma.adminActionLog.findFirst({ where: { action: "PROMOTE_ADMIN", targetId: testUser.id } });
    expect(log).not.toBeNull();
    // cleanup
    await prisma.adminActionLog.deleteMany({ where: { targetId: testUser.id } });
  });

  test("admin → revoca admin a se stesso → 400 con messaggio", async ({ authedAdminPage, adminUser }) => {
    const resp = await authedAdminPage.request.delete(`/api/admin/users/${adminUser.id}/admin`);
    expect(resp.status()).toBe(400);
    const body = await resp.json();
    expect(body.error).toMatch(/te stesso/i);
  });

  test("admin → grant premium 30g → subscriptionStatus diventa ACTIVE", async ({ authedAdminPage, testUser }) => {
    const resp = await authedAdminPage.request.post(`/api/admin/users/${testUser.id}/grant-premium`);
    expect(resp.status()).toBe(200);
    const dbUser = await prisma.user.findUnique({ where: { id: testUser.id }, select: { subscriptionStatus: true, subscriptionCurrentPeriodEnd: true } });
    expect(dbUser?.subscriptionStatus).toBe("ACTIVE");
    expect(dbUser?.subscriptionCurrentPeriodEnd).not.toBeNull();
    await prisma.adminActionLog.deleteMany({ where: { targetId: testUser.id } });
  });

  test("admin → toggle exercise active → flag flippa + audit log", async ({ authedAdminPage }) => {
    const exercise = await prisma.exercise.findFirst({ where: { isActive: true }, select: { id: true, isActive: true } });
    if (!exercise) test.skip(true, "Nessun esercizio nel DB");
    const resp = await authedAdminPage.request.patch(`/api/admin/exercises/${exercise!.id}/active`);
    expect(resp.status()).toBe(200);
    const updated = await prisma.exercise.findUnique({ where: { id: exercise!.id }, select: { isActive: true } });
    expect(updated?.isActive).toBe(!exercise!.isActive);
    // ripristina
    await prisma.exercise.update({ where: { id: exercise!.id }, data: { isActive: exercise!.isActive } });
    await prisma.adminActionLog.deleteMany({ where: { targetId: exercise!.id } });
  });

  test("admin → /admin/activity → vede log azioni", async ({ authedAdminPage, adminUser }) => {
    // crea un log manualmente
    await prisma.adminActionLog.create({
      data: {
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        action: "PROMOTE_ADMIN",
        targetType: "user",
        targetId: "test",
        payload: { targetEmail: "test@test.com" },
      },
    });
    await authedAdminPage.goto("/admin/activity");
    await expect(authedAdminPage.getByText("PROMOTE_ADMIN").first()).toBeVisible({ timeout: 10_000 });
    await prisma.adminActionLog.deleteMany({ where: { targetId: "test" } });
  });
});
```

- [ ] **Step 3: Verificare imports e tipi**

Eventuali aggiustamenti su `tests/e2e/fixtures.ts`:
- `import bcrypt from "bcryptjs"` se non già presente (alternativo: usare `prisma.user.create` con un passwordHash hardcoded valido se bcryptjs è già la dep). Verifica con `grep bcrypt package.json`.

- [ ] **Step 4: Run suite E2E completa**

Run: `npm run test:e2e -- m10-admin-hub`
Expected: 8 test verdi.

Poi run completo:
Run: `npm run test:e2e`
Expected: 61 test verdi totali (53 esistenti + 8 nuovi M10).

- [ ] **Step 5: Build production check**

Run: `npm run build`
Expected: build completa con ~64 pagine (54 attuali + 10 nuove M10).

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/m10-admin-hub.spec.ts tests/e2e/fixtures.ts
git commit -m "test(e2e): suite M10 admin hub (8 test verdi)"
```

---

## Verifica end-to-end finale

Dopo Task 17:

- [ ] **Typecheck globale**: `npx tsc --noEmit` → zero errori
- [ ] **Build production**: `npm run build` → completata, 64 pagine
- [ ] **Suite E2E completa**: `npm run test:e2e` → 61/61 verdi
- [ ] **Visivo desktop**: login admin, vai a `/admin`, naviga tutte le 6 tab + activity log, prova ogni azione soft (promote, grant premium, toggle exercise) → tutto risponde con feedback chiaro
- [ ] **Visivo mobile**: emulatore mobile DevTools, verifica sub-sidebar diventa barra orizzontale scrollabile in alto
- [ ] **Sicurezza**: logout, registra utente non-admin, login, vai a `/admin` → redirect `/dashboard`; click "Admin" non appare in navbar
- [ ] **Audit log**: verifica che ogni azione soft ha lasciato una riga in `/admin/activity` con payload sensato

## Self-review check

Mentre esegui i task, se trovi:
- Nomi di campo Prisma diversi dai snippet (es. `workoutSessions` vs `sessions`) → aggiorna il task corrente
- Raw SQL che fallisce per nome tabella → sostituire con `prisma.X.findMany` + group manuale in JS, segnalare nel commit message
- Mancanza di componenti UI riusati (es. `Card`, `Button`, `Badge`, `Input`) → controllare `src/components/ui/` e creare se mancano (improbabile)
- `requireAdmin()` ritorna `{ userId, email }` — già verificato in design doc, non cambiare contract

Se trovi inconsistenze tra task (es. signature `logAdminAction()` diversa tra Task 2 e Task 11), correggile inline e procedi.

## Stima

- Task 1-4 (foundation): ~30 min, 4 commit
- Task 5-9 (tab utenti completa): ~90 min, 5 commit
- Task 10-15 (altre 5 tab): ~150 min, 6 commit
- Task 16-17 (docs + test): ~60 min, 2 commit

**Totale**: ~5-6 ore di lavoro effettivo, 17 commit logici, 1 PR (o merge diretto su main).
