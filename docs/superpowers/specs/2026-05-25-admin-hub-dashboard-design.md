# Admin Hub Dashboard — Design Spec

**Data**: 2026-05-25
**Tipo**: feature admin (M10)
**Stato**: design approvato, pronto per implementazione

## Context

L'admin di FitAI ha oggi un solo strumento operativo: la pagina `/admin/exercises` per gestire i video PT (M9). Non c'è alcuna UI per gli altri compiti tipici di un admin: vedere utenti, controllare abbonamenti, leggere statistiche d'uso, gestire altri admin, monitorare uso AI. Tutte queste operazioni richiedono oggi query SQL dirette al DB Supabase o accesso alla dashboard Stripe, cosa scomoda e poco accessibile.

L'obiettivo è creare un **hub admin** a `/admin` che raccolga in un'unica interfaccia tutto ciò di cui l'admin ha bisogno per gestire l'app. Sicurezza: l'autorizzazione è server-only, già fornita dall'helper `requireAdmin()` (`src/lib/admin.ts:24-46`), invariato.

Outcome atteso: l'admin clicca "Admin" in sidebar (voce già aggiunta in sessione 12), atterra su `/admin/users`, naviga tra 6 tabs via sub-sidebar interna, vede dati in tempo reale e può fare azioni soft (promote, grant premium, toggle exercise active) senza toccare il DB. Le azioni rimangono tracciate in un nuovo audit log.

## Approccio

**Hub admin a `/admin` con sub-sidebar interna e 6 tabs di pari livello.**

Scelte cardine fatte in brainstorming:
- **Accesso**: voce "Admin" già in sidebar app principale (sessione 12). `/admin` redirige a `/admin/users` (prima tab). Nessun toggle in login, nessun redirect post-login differenziato.
- **Layout**: sub-sidebar verticale a sinistra dentro l'area admin, sopra il contenuto. Pattern simile alla sidebar principale ma "annidata".
- **Scope azioni**: livello 2 — solo azioni soft reversibili. Niente delete account, niente refund Stripe, niente cancellazione subscription. Le operazioni distruttive restano SQL/Stripe dashboard.
- **Audit log**: nuovo modello `AdminActionLog`, helper `logAdminAction()` chiamato da ogni API admin che muta DB. Panel "Attività recente" accessibile dalla sub-sidebar.

Scartati:
- Toggle "Utente/Admin" in pagina login → anti-pattern di sicurezza.
- Redirect post-login a `/admin` per admin → confonde il flow utente normale, l'admin spesso vuole anche essere utente.
- Hub single-page senza tabs (tutte le sezioni scrollabili) → 6 aree diventano troppo lunghe, scroll faticoso.
- Tabs orizzontali in alto → buono per ≤4 tab, ma con 6 e label lunghi diventa stretto.
- Azioni hard (delete, refund, audit dettagliato con diff) → fuori scope MVP, alto rischio basso uso reale.

## Architettura

### Route

```
/admin                       → redirect a /admin/users
/admin/users                 → tab Utenti (default landing)
/admin/subscriptions         → tab Abbonamenti
/admin/exercises             → tab Esercizi & Video PT (riusa pagina esistente)
/admin/stats                 → tab Statistiche d'uso
/admin/admins                → tab Gestione admin
/admin/ai-usage              → tab AI Usage
/admin/activity              → drawer/page audit log completo (apribile dal link "Attività recente →")
```

### Layout protetto

Nuovo `src/app/(app)/admin/layout.tsx` (server component) chiama `requireAdmin()` una sola volta. Tutte le pagine sotto `/admin/*` ereditano la protezione. La pagina `/admin/exercises/page.tsx` esistente perde la sua chiamata a `requireAdmin()` (delegata al layout) — riduzione duplicazione.

```typescript
// src/app/(app)/admin/layout.tsx
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
    <div className="flex gap-0">
      <AdminSidebar />
      <div className="flex-1 min-w-0 p-4 lg:p-6">{children}</div>
    </div>
  );
}
```

### Sub-sidebar component

Nuovo `src/components/admin/AdminSidebar.tsx` (client component, usa `usePathname` per evidenziare la voce attiva).

```typescript
const ADMIN_TABS = [
  { href: "/admin/users", label: "Utenti", icon: Users },
  { href: "/admin/subscriptions", label: "Abbonamenti", icon: CreditCard },
  { href: "/admin/exercises", label: "Esercizi & PT", icon: Dumbbell },
  { href: "/admin/stats", label: "Statistiche", icon: BarChart3 },
  { href: "/admin/admins", label: "Gestione admin", icon: ShieldCheck },
  { href: "/admin/ai-usage", label: "AI Usage", icon: Bot },
];
```

Larghezza 180px, sempre visibile su desktop. Su mobile (`<lg`) collassa in un dropdown orizzontale sopra il contenuto (riusa pattern mobile della Navbar principale). In fondo, link "Attività recente →" che porta a `/admin/activity`.

## Schema DB nuovo

Una sola aggiunta: `AdminActionLog` (modello nuovo).

```prisma
model AdminActionLog {
  id          String           @id @default(cuid())
  actorId     String
  actorEmail  String           // denormalizzato per query semplici
  action      AdminActionType
  targetType  String           // "user" | "exercise" | "subscription" | ...
  targetId    String?          // id del record toccato (null se azione globale)
  payload     Json?            // contesto: { from: ..., to: ..., reason: ... }
  createdAt   DateTime         @default(now())

  actor       User             @relation(fields: [actorId], references: [id])

  @@index([actorId])
  @@index([createdAt])
  @@index([action])
}

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

Modifiche su `User`: aggiungere relazione `adminActions AdminActionLog[]` (inverse).

Migration: `prisma db push` (coerente con come sono state aggiunte le altre tabelle in M4/M8) oppure `prisma migrate dev --name add_admin_action_log`. Preferire migrate dev se possibile per avere lo storico.

## Helper audit log

Nuovo `src/lib/admin-audit.ts`:

```typescript
export async function logAdminAction(args: {
  actorId: string;
  actorEmail: string;
  action: AdminActionType;
  targetType: string;
  targetId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  await prisma.adminActionLog.create({
    data: { ...args, payload: args.payload ?? undefined },
  });
}
```

Ogni API admin che muta DB chiama `logAdminAction` DOPO il successo dell'operazione (in try/catch ma non bloccante: se il log fallisce, l'azione principale è già committata).

L'`UPLOAD_PT_VIDEO` e `DELETE_PT_VIDEO` esistenti in `/api/admin/exercises/[id]/pt-video/route.ts` vengono retrofittati per loggare anche loro.

## Contenuto delle 6 tab

### Tab 1 · `/admin/users` — Utenti

**Server component** che fa la query iniziale, passa dati a `<UsersTable>` client.

**Layout**:
- Header: counters (1.247 totali · 89 Premium · 12 admin) + ricerca + filtri (Tutti / Premium / Free / Admin).
- Lista paginata 50 per pagina, righe Card con nome, email, badge stato (PREMIUM amber, ADMIN green, FREE grigio), data iscrizione, n. sessioni totali.
- Bottoni soft per riga: "Rendi admin" (se non admin) / "Revoca admin" (se admin) · "Premium 30g" (se non premium) · "Dettaglio →" (apre drawer).
- Paginazione classica prev/next (no cursor, pages numbered).

**Drawer dettaglio** (`<UserDetailDrawer>`): profilo completo, ultime 10 sessioni workout (data, durata, esercizi), ultimi 5 check-in (data, mood), stato billing con link Stripe.

**API**:
- `GET /api/admin/users?page=1&q=email&filter=premium|free|admin` → `{ users, total, page, totalPages }`
- `GET /api/admin/users/[id]` → dettaglio completo
- `POST /api/admin/users/[id]/admin` → promuove (UPDATE isAdmin=true) + log
- `DELETE /api/admin/users/[id]/admin` → revoca + log (con safety check, vedi Sicurezza)
- `POST /api/admin/users/[id]/grant-premium` → grant 30 giorni Premium FREE (aggiorna `subscriptionStatus=ACTIVE`, `subscriptionPlan=MONTHLY`, `subscriptionCurrentPeriodEnd=now()+30d`) + log

### Tab 2 · `/admin/subscriptions` — Abbonamenti

Server component + client interactivity.

**Layout**:
- 4 metriche card grandi: Premium attivi · MRR stimato · Churn 30g · Rinnovi 7g.
- Filtri status (Tutti / Active / Trialing / Past due / Canceled).
- Lista subscription: email utente, status, piano (MONTHLY/YEARLY), `currentPeriodEnd` formattato, Stripe sub ID (link a `https://dashboard.stripe.com/subscriptions/{id}` in nuova tab).
- Paginazione 50 per pagina.

**Calcoli metriche**:
- MRR = count(active monthly) × 9.99 + count(active yearly) × (79 / 12) — usa env `STRIPE_PRICE_MONTHLY_AMOUNT_EUR` e `STRIPE_PRICE_YEARLY_AMOUNT_EUR` con default 9.99/79.
- Churn 30g = canceled in ultimi 30 giorni / count attivi 30 giorni fa × 100.
- Rinnovi 7g = count subscription con `currentPeriodEnd` nei prossimi 7 giorni.

**API**:
- `GET /api/admin/subscriptions?page=1&status=active|trialing|past_due|canceled` → lista paginata + 4 metriche aggregate.
- Nessuna azione soft (Stripe ops sono livello 3).

### Tab 3 · `/admin/exercises` — Esercizi & Video PT

Pagina già esistente, **riusata** con minime modifiche:
- Toglie `requireAdmin()` interna (delegata al layout).
- Header esteso con 3 metriche (totale, con video PT, attivi).
- `AdminExercisesTable` esistente arricchito con badge "Attivo/Disattivo" e bottone toggle.

**Nuova azione soft**: toggle `Exercise.isActive`.

**API esistenti**:
- `POST/DELETE /api/admin/exercises/[id]/pt-video` (M9) — retrofit con logAdminAction.

**API nuova**:
- `PATCH /api/admin/exercises/[id]/active` → toggle isActive + log.

### Tab 4 · `/admin/stats` — Statistiche d'uso

**Layout**:
- 5+ metriche card piccole: utenti totali, MAU 30g, DAU oggi, workout 30g, analisi v2 30g, daily check-in 30g.
- Bar chart: nuovi utenti per giorno (ultimi 30g) — recharts.
- Bar chart: sessioni workout completate per giorno (ultimi 30g).
- Top 10 esercizi più allenati (lista compatta).
- Distribuzione `FitnessLevel` (mini bar chart o pie).

**Calcoli**:
- MAU 30g = distinct user con almeno una `WorkoutSession`, `Analysis`, o `NutritionLog` negli ultimi 30 giorni.
- DAU oggi = distinct user con activity oggi (UTC).
- Workout 30g = count `WorkoutSession` con `completedAt` in ultimi 30 giorni.

**API**:
- `GET /api/admin/stats` → tutti i numeri in una sola response (object con `counters`, `dailyUsers`, `dailyWorkouts`, `topExercises`, `fitnessLevelDistribution`).

**Cache**: la response è cacheable per 60s lato server (`revalidate: 60`) per non hammerare il DB ad ogni refresh.

Nessuna azione, puramente read.

### Tab 5 · `/admin/admins` — Gestione admin

**Layout**:
- Sezione 1: lista email in `ADMIN_EMAILS` env (read-only, info-only). Mostrato come hint: "queste email diventano admin automaticamente al primo login".
- Sezione 2: lista User con `isAdmin=true`. Per ognuno: nome, email, "Auto-promosso" (se email è in env) o "Promosso manualmente" + data della prima volta isAdmin=true. Bottone "Revoca" per ognuno tranne se stessi.
- Sezione 3: form "Promuovi un utente" → input email + bottone Promuovi. Cerca user con email exact match, lo promuove se trovato, log.

**Sicurezza**:
- Non puoi revocare te stesso (UI disabled + check server).
- Non puoi revocare l'ultimo admin (check server: count(isAdmin=true) > 1 prima di revocare). Se ultimo, ritorna 400 con messaggio.

**API**:
- `GET /api/admin/admins` → `{ envEmails: string[], admins: AdminInfo[] }`. envEmails letti da `parseAdminEmails()`.
- `POST /api/admin/admins/promote` body `{ email: string }` → cerca user, promuove + log. 404 se user non trovato.
- (la revoca usa già `DELETE /api/admin/users/[id]/admin`)

### Tab 6 · `/admin/ai-usage` — AI Usage

**Layout**:
- 2 metriche card: costo stimato 30g (tokens × prezzi modello) · % utenti FREE al limite quota.
- Lista uso per feature mese corrente (da `UsageCounter`): generate_plan, generate_nutrition_plan, ai_chat, analysis_start.
- Top 10 utenti per uso AI (sum of UsageCounter.count del mese corrente).
- **No bar chart trend giornaliero in MVP**: `UsageCounter` ha granularità mensile (campo `period = "YYYY-MM"`), non giornaliera. Per il trend serve un nuovo modello o instrumentazione log Anthropic — fuori scope MVP. Sostituito da una mini-tabella "Uso per mese (ultimi 6)" che aggrega per period.

**Costo stimato**: pricing approssimato hardcoded in `src/lib/billing/ai-pricing.ts`:
- Claude Opus: $15/1M input, $75/1M output
- Claude Sonnet: $3/1M input, $15/1M output
- Token medio per chiamata: stimato (sarà rifinito post-deploy con dati reali).

**API**:
- `GET /api/admin/ai-usage` → `{ costEstimate, percentFreeMaxed, byFeature, topUsers, dailyTrend? }`.

Nessuna azione. Reset quota individuale è in tab Utenti (azione "Reset quota" → `DELETE /api/admin/users/[id]/quota`).

### Tab extra · `/admin/activity` — Audit log completo

**Layout**:
- Lista paginata di `AdminActionLog`, ordinata desc per `createdAt`.
- Per ogni riga: badge tipo action (color-coded), actor email, target description (es. "user mario@example.com" o "exercise:squat"), timestamp relativo (`formatDistanceToNow` IT).
- Click riga → expand JSON payload.
- Filtri: per action type, per actor, per data range.

**API**:
- `GET /api/admin/activity?page=1&action=X&actorId=Y` → paginata.

## Componenti UI nuovi

In `src/components/admin/`:
- `AdminSidebar.tsx` — sub-sidebar verticale (client)
- `UsersTable.tsx` — tabella utenti con azioni soft (client)
- `UserDetailDrawer.tsx` — drawer dettaglio utente (client)
- `SubscriptionsTable.tsx` — tabella abbonamenti (client)
- `StatsDashboard.tsx` — card metriche + chart recharts (client)
- `AdminsManager.tsx` — gestione admin (client)
- `AiUsagePanel.tsx` — uso AI (client)
- `ActivityLog.tsx` — audit log viewer (client)
- `AdminMetricCard.tsx` — card metrica riusabile (server-friendly, no state)
- `ConfirmActionButton.tsx` — bottone con conferma per azioni soft (es. revoca admin)

In `src/components/ui/` (se mancano): nessun nuovo componente generico, riusiamo `Card`, `Button`, `Badge`, `Input` esistenti.

## API endpoints nuovi (riepilogo)

| Endpoint | Metodo | Scopo |
|----------|--------|-------|
| `/api/admin/users` | GET | Lista utenti paginata + counters |
| `/api/admin/users/[id]` | GET | Dettaglio utente |
| `/api/admin/users/[id]/admin` | POST/DELETE | Promuovi/revoca admin |
| `/api/admin/users/[id]/grant-premium` | POST | Grant Premium 30g |
| `/api/admin/users/[id]/quota` | DELETE | Reset quota mensile |
| `/api/admin/subscriptions` | GET | Lista sub paginata + metriche |
| `/api/admin/exercises/[id]/active` | PATCH | Toggle isActive |
| `/api/admin/stats` | GET | Metriche dashboard + dati chart |
| `/api/admin/admins` | GET | Lista admin + email env |
| `/api/admin/admins/promote` | POST | Promuovi by email |
| `/api/admin/ai-usage` | GET | Metriche AI usage |
| `/api/admin/activity` | GET | Audit log paginato |

Tutti gli endpoint sono protetti da `requireAdmin()` server-side (oltre al layout protetto, doppia verifica).

## Sicurezza

- Tutto autorizzazione admin è server-side. Nessun controllo client decide accesso.
- `requireAdmin()` invariato, usa env `ADMIN_EMAILS` + `User.isAdmin`.
- **Lockout protection** sulla revoca admin: API rifiuta se l'utente target è il caller stesso O se è l'unico admin rimasto. Errore 400 con messaggio chiaro.
- **Grant Premium soft**: marca solo i campi `subscriptionStatus`/`subscriptionPlan`/`subscriptionCurrentPeriodEnd` su User. NON tocca Stripe. NON crea una Subscription riga. Allo scadere dei 30g il gating ritorna automaticamente a FREE.
- **Reset quota**: cancella `UsageCounter` del mese corrente per quell'utente. Usa lo stesso pattern di `scripts/reset-quota.mjs` (sessione 11).
- **Audit log** non-bloccante: se il `prisma.adminActionLog.create` fallisce, l'azione principale è già stata committed. Errore loggato in console (Sentry in prod).

## Convenzioni codice riusate

- Pattern server component + client component figlio (come `/admin/exercises/page.tsx` + `AdminExercisesTable.tsx`).
- shadcn-like `Card`, `Button`, `Badge`, `Input` da `src/components/ui/`.
- Charts via recharts (già usato in `/progressi`).
- Icone lucide-react.
- Auth check via `requireAdmin()` esistente.

## Test E2E

Nuovo file `tests/e2e/m10-admin-hub.spec.ts` con ~8 test:

1. Non admin → `/admin` → redirect `/dashboard`
2. Admin → `/admin` → redirect `/admin/users`, vede tabella utenti
3. Admin → navigazione tab (click "Abbonamenti" da sidebar → URL diventa `/admin/subscriptions`, vede metriche)
4. Admin → promote user → utente target diventa admin (verifica DB + audit log creato)
5. Admin → revoca admin a se stesso → 400 con messaggio "non puoi revocare te stesso"
6. Admin → grant premium 30g → `subscriptionStatus` diventa ACTIVE (verifica DB + audit log)
7. Admin → toggle exercise active → flag flippa, audit log creato
8. Admin → /admin/activity → vede log delle azioni precedenti

Test coverage attuale 53/53 → 61/61 post-M10.

## File coinvolti

### Modifica
- `prisma/schema.prisma` — nuovo modello `AdminActionLog`, enum `AdminActionType`, relazione su `User`
- `src/app/(app)/admin/exercises/page.tsx` — rimuove try/catch requireAdmin (delegato al layout)
- `src/app/api/admin/exercises/[id]/pt-video/route.ts` — aggiunge chiamate `logAdminAction()`

### Nuovi file (server)
- `src/app/(app)/admin/layout.tsx`
- `src/app/(app)/admin/page.tsx` (redirect a /admin/users)
- `src/app/(app)/admin/users/page.tsx`
- `src/app/(app)/admin/subscriptions/page.tsx`
- `src/app/(app)/admin/stats/page.tsx`
- `src/app/(app)/admin/admins/page.tsx`
- `src/app/(app)/admin/ai-usage/page.tsx`
- `src/app/(app)/admin/activity/page.tsx`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/admin/users/[id]/admin/route.ts`
- `src/app/api/admin/users/[id]/grant-premium/route.ts`
- `src/app/api/admin/users/[id]/quota/route.ts`
- `src/app/api/admin/subscriptions/route.ts`
- `src/app/api/admin/exercises/[id]/active/route.ts`
- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/admins/route.ts`
- `src/app/api/admin/admins/promote/route.ts`
- `src/app/api/admin/ai-usage/route.ts`
- `src/app/api/admin/activity/route.ts`
- `src/lib/admin-audit.ts`
- `src/lib/billing/ai-pricing.ts`

### Nuovi file (client)
- `src/components/admin/AdminSidebar.tsx`
- `src/components/admin/UsersTable.tsx`
- `src/components/admin/UserDetailDrawer.tsx`
- `src/components/admin/SubscriptionsTable.tsx`
- `src/components/admin/StatsDashboard.tsx`
- `src/components/admin/AdminsManager.tsx`
- `src/components/admin/AiUsagePanel.tsx`
- `src/components/admin/ActivityLog.tsx`
- `src/components/admin/AdminMetricCard.tsx`
- `src/components/admin/ConfirmActionButton.tsx`

### Test
- `tests/e2e/m10-admin-hub.spec.ts`

### Documentazione
- `CHECKLIST_DEPLOY.md` — nuova sezione M10 (no nuove env, ma annotare modello AdminActionLog → migrazione DB su deploy)

## Verifica end-to-end

Dopo implementazione:

1. **Typecheck**: `npx tsc --noEmit` → zero errori.
2. **Build**: `npm run build` → completa, ~64 pagine generate (54 attuali + ~10 nuove).
3. **Migration DB**: `prisma migrate dev --name add_admin_action_log` (oppure `prisma db push`).
4. **Avvio**: `npm run dev`, login come admin (`motion.insight.fitness@gmail.com`), click voce "Admin" in sidebar.
5. **Visivo**: atterri su `/admin/users`. Sub-sidebar a sinistra con 6 voci. Tabella utenti con almeno il tuo account.
6. **Funzionale**: promuovi un secondo utente test → verifica isAdmin in DB e che il log appaia in `/admin/activity`.
7. **Sicurezza**: tenta di revocare te stesso → errore. Logout, login come non-admin, vai a `/admin` → redirect a `/dashboard` silenzioso.
8. **Test E2E**: `npm run test:e2e -- m10-admin-hub` → 8 test verdi.

## Decisioni esplicitamente NON in scope (futuro)

- Refund Stripe manuale → richiede integrazione Stripe API call con sicurezza extra
- Cancel subscription manuale → idem
- Delete account hard → distruttivo, basta SQL su richiesta
- Audit log con diff prima/dopo → overhead non giustificato per MVP
- Export CSV di utenti/subscription → utile ma non bloccante
- Feature flag management → fuori scope
- Rate-limit configuration via UI → fuori scope (env-only)
- Email blast a utenti → fuori scope, va in tool transactional dedicato

## Estimate

~20-25 file nuovi, ~3 file modificati, 1 migration DB, 8 test E2E. Stima 2-3 sessioni di lavoro per implementazione completa con test.
