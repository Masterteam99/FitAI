# Daily Mission — Dashboard Hero — Design Spec

**Data**: 2026-05-20
**Tipo**: feature UX
**Stato**: design approvato, pronto per implementazione

## Context

L'utente ha valutato la dashboard FitAI come "fredda" al primo accesso: numeri a zero, mancanza di un focus chiaro su "cosa fare ADESSO". Le 4 stat-card in alto mostrano dati motivazionali (streak, punti, settimana, record) ma non guidano l'azione del giorno corrente.

Soluzione scelta dopo brainstorming: introdurre una **Daily Mission card** come elemento hero della dashboard, che mostra 3 task adattivi giornalieri derivati dal piano dell'utente. La card sostituisce le 4 stat-card grandi attuali; streak e punti si comprimono in linea con il saluto.

Outcome atteso: l'utente che apre la dashboard vede in 2 secondi "cosa devo fare oggi" e ha una CTA chiara. Stesso pattern usato con successo da Duolingo (daily goal) e Strava (daily activity).

## Approccio

**Approccio A — Mission hero, dashboard pulita** (scelto):
- Mission card grande in alto, 3 task verticali
- Stats compressi accanto al saluto (`🔥 5gg · 320 pt`)
- Resto della dashboard invariato (piano attivo, sessioni recenti, sidebar, achievements)

Scartati:
- Approccio B (mission aggiunta in cima senza rimuovere stat): meno focus, dashboard più lunga
- Approccio C (refactor completo + cambio estetica): troppo lavoro per un'iterazione, rischio regressioni su flussi che funzionano

## Composizione dei 3 task

I task hanno struttura fissa ma contenuto dinamico in base al piano dell'utente.

### Task 1 — Allenamento di oggi
- **Sorgente**: piano attivo (`WorkoutPlan` con `isActive=true`) + sessioni completate per calcolare il prossimo `WorkoutPlanDay`
- **Logica**: il prossimo giorno del piano da fare. Conteggio sessioni completate `mod workoutsPerWeek` → indice del prossimo `dayNumber`. Se quel giorno ha `restDay=true`, mostra "Oggi riposo".
- **Label**: `"Day 2 — Petto e Spalle (45 min)"` oppure `"Day 3 — Riposo attivo"`
- **CTA**: link a `/allenamento` (porta al piano con il giorno in evidenza)
- **Completato quando**: esiste una `WorkoutSession` con `status='COMPLETED'`, `planDayId` del giorno target, `completedAt` con stessa data ISO (UTC) di oggi. Per rest day: **auto-completato** (no click necessario, conteggio del task è "done" lato server).
- **Empty state**: se nessun `WorkoutPlan` attivo → label "Crea il tuo piano AI", CTA a `/allenamento/genera-ai`.

### Task 2 — Nutrizione del giorno
- **Sorgente**: `NutritionLog` con `date` di oggi
- **Logica**: conta i log della data corrente; soglia "completato" = ≥ 3 pasti loggati (configurabile come costante `NUTRITION_TASK_THRESHOLD = 3` in `src/lib/dailyMission.ts`)
- **Label**: `"Pasti loggati: 1/3"` (in corso), `"Pasti loggati: 3/3"` (done)
- **CTA**: link a `/nutrizione`
- **Completato quando**: `count(NutritionLog where userId=X and date=today) >= 3`
- **Empty state**: utente senza piano nutrizionale (`user.nutritionPlanJson IS NULL`) → CTA generica a `/nutrizione` (in fase di implementazione, verificare se esiste già un trigger per `POST /api/ai/generate-nutrition-plan` da UI; se no, lo aggiungiamo lì)

### Task 3 — Check-in giornaliero (NUOVO)
- **Sorgente**: nuovo modello `DailyCheckin`
- **Logica**: 5 emoji corrispondenti a mood 1-5 (`😩 😕 😐 🙂 💪`); 1-tap salva
- **Label**: `"Come ti senti oggi?"` (pending) → `"Oggi ti senti 💪"` (done)
- **CTA**: nessuna navigation, interazione inline nella card (5 bottoni emoji)
- **Completato quando**: esiste `DailyCheckin` con `userId=X` e `date=today`
- **Bonus**: dati alimentano l'AI Coach in futuro per consigli mirati (out-of-scope per questo spec)

## Modello dati

### Nuovo modello Prisma

```prisma
model DailyCheckin {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      DateTime // store a UTC midnight di oggi
  mood      Int      // 1-5
  note      String?
  createdAt DateTime @default(now())

  @@unique([userId, date])
  @@index([userId, date])
}
```

Aggiornare `User` con back-relation `dailyCheckins DailyCheckin[]`.

Migration: `npx prisma migrate dev --name add_daily_checkin` (per dev). In production: `prisma db push` come fatto per altri schema changes.

## Architettura componenti

### `src/lib/dailyMission.ts` — pure server function

```ts
export type MissionTaskStatus = "pending" | "in_progress" | "done";

export type WorkoutMissionTask = {
  kind: "workout";
  status: MissionTaskStatus;
  label: string;
  ctaHref: string;
  restDay: boolean;
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
  selectedMood: number | null; // 1-5 se done, null se pending
};

export type DailyMission = {
  date: string; // ISO date "2026-05-20"
  workout: WorkoutMissionTask;
  nutrition: NutritionMissionTask;
  checkin: CheckinMissionTask;
  completedCount: number; // 0-3
};

export async function getDailyMission(userId: string): Promise<DailyMission> { /* ... */ }
```

Usa `prisma` direttamente. Calcola la data UTC di oggi una sola volta a inizio funzione. Esegue 4 query in parallelo (`Promise.all`): activePlan, nutritionLogsCount, checkin, lastSession.

### `src/components/dashboard/DailyMissionCard.tsx` — client component

Props: `mission: DailyMission`, `streak: number`, `totalPoints: number`.
- Renderizza header + 3 righe task
- Gestisce stato locale `mood` per check-in optimistico
- Quando l'utente clicca emoji → `POST /api/daily-checkin { mood }` + update locale ottimistico → on success refresh via `router.refresh()`
- Animazione "tutti completati": classe condizionale + transizione CSS, niente librerie esterne

### `src/app/api/daily-checkin/route.ts` — POST endpoint

- `POST { mood: 1-5 }` con `auth()`, rate limit `aiRatelimit` riusato (3 richieste/min basta per check-in)
- Upsert su `(userId, date=todayUtc)`. Risponde `{ ok: true, mood }`
- Tutto wrappato in try/catch JSON-safe come pattern stabilito nei route AI

### `src/app/(app)/dashboard/page.tsx` — modifiche

- Rimuovere il blocco "Stats row" (righe 39-60 attuale)
- Spostare `streak`, `totalPoints` accanto al saluto: `Ciao, Marco 👋  🔥 5gg · 320 pt`
- Inserire `<DailyMissionCard mission={await getDailyMission(userId)} streak={user.currentStreak} totalPoints={user.totalPoints} />` come primo elemento sotto l'header
- Resto del layout invariato

## Edge cases & errors

| Caso | Comportamento |
|---|---|
| Nessun piano attivo | Task 1 → empty state con CTA "Crea piano AI" |
| Rest day del piano | Task 1 → auto-completato, label "Oggi riposo — recupera bene" |
| Nessun piano nutrizionale | Task 2 → empty state con CTA "Crea piano nutrizionale" |
| Check-in già fatto | Mostra emoji selezionata, riga compressa; click su altra emoji = update mood |
| Errore getDailyMission (DB down) | Catch nel page server component → mostra fallback: stat card classiche (regressione UX ma non rotta) |
| Errore POST check-in | Toast errore, rollback ottimistico |
| Cambio fuso orario | Usiamo UTC midnight per la chiave `date` — semplice e consistente; potenziale issue per utenti in `Europe/Rome` se cliccano dopo mezzanotte locale ma prima di mezzanotte UTC. Documentato come accettabile per V1. |

## Testing

E2E `tests/e2e/m8-daily-mission.spec.ts`:

1. **Render base**: dashboard di un utente con piano attivo → vedo la mission card con 3 task in stato pending
2. **Workout done**: completo una WorkoutSession via API direct → refresh → task 1 mostra "done"
3. **Nutrition progress**: log 1 pasto via API → vedo "1/3 in corso"; log altri 2 → vedo "3/3 done"
4. **Check-in flow**: click emoji 💪 → riga diventa "Oggi ti senti 💪" + dot 3/3 verde
5. **Empty state**: nuovo utente senza piano → task 1 mostra CTA "Crea piano AI"

Mantenere i 45/45 test esistenti verdi (nessuna regressione).

## Out-of-scope (esplicito)

- Idratazione tracking (richiede nuovo flusso utente, non parte del 80/20 di questo round)
- Customizzazione task da parte dell'utente (Premium feature futura)
- Notifiche push "ricorda di completare la mission" (richiede SW push + token, fuori scope)
- Achievement specifico "30 giorni mission completa" (può venire dopo, schema esistente lo supporta)
- AI Coach che usa dati check-in (futuro, dati raccolti ora)

## File da modificare/creare

| File | Tipo | Modifica |
|---|---|---|
| `prisma/schema.prisma` | mod | aggiungere modello `DailyCheckin` + back-relation su `User` |
| `prisma/migrations/.../migration.sql` | new | migration add_daily_checkin |
| `src/lib/dailyMission.ts` | new | server function `getDailyMission` + tipi |
| `src/components/dashboard/DailyMissionCard.tsx` | new | client component card |
| `src/app/api/daily-checkin/route.ts` | new | POST endpoint upsert |
| `src/app/(app)/dashboard/page.tsx` | mod | rimuovi stat row grosse, monta Mission card, sposta streak/punti in header |
| `tests/e2e/m8-daily-mission.spec.ts` | new | 5 test E2E |

## Verifica end-to-end

1. Build + typecheck puliti.
2. `npm run test:e2e` → 50/50 (45 esistenti + 5 nuovi) verdi.
3. Test manuale locale: dashboard renderizza mission card, ogni task interagibile, check-in salvato.
4. Commit + push → Vercel preview.
5. Smoke test su preview: login, dashboard, completa check-in, verifica refresh status.
