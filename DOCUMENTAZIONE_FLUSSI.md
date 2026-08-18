> ## ⚠️ STATO REALE — aggiornato 2026-08-18 (Sessione 10)
> **Fonte autorevole dello stato di avanzamento: i due diari `COSE_FATTE_IN_SESSIONE.md` + `COSE_DA_FARE.md`.** In caso di conflitto con questo documento, **valgono i diari** (qui sotto possono esserci sezioni storiche o superate).
>
> **Snapshot codice (18 ago 2026):** `main` include ora tutto (Sessioni 1-10), pushato e in
> produzione. Rispetto a quanto descritto qui: la pagina esercizio (§ dettaglio Libreria) è stata
> ridisegnata — due video affiancati (spiegazione/esecuzione), parametri biomeccanici tolti dalla
> vista utente, checkbox al posto del vecchio bottone "Attiva analisi avanzata"; la Libreria è
> rinominata "Libreria esercizi" con filtri principali+"Altri filtri"; la sessione guidata ha un
> bottone "Termina esercizio" e in registrazione la fotocamera occupa lo schermo intero con il video
> PT in un riquadro (desktop); il diario nutrizionale usa ricerca alimento + grammatura; Admin ha un
> editor guidato per i trigger biomeccanici, una sezione Alimenti, gestione premi classifica e
> l'**editor design del sito** (testo/colore/dimensione + assistente IA, dentro Admin, non più
> sovrapposto alle pagine pubbliche); Community è dietro un placeholder "in arrivo"; nuova sezione
> pubblica `/prova-gratuita` (analisi senza account, registrazione o upload video) e `/leaderboard`
> (classifica). Dettaglio completo: `COSE_FATTE_IN_SESSIONE.md` (Sessione 10).
> **Aperti:** vedi `STATO_PROGETTO.md`.

---

# FitAI — Documentazione Flussi e Architettura

*Versione 2.1 — 12 agosto 2026 (aggiunta §21 Area Utente v2 + Motore + Account Manager; annotate §2/4/5/9/10/11/12/13). v2.0 era 14 luglio 2026 (M9→M12 + redesign "wow"); v1.0 14 maggio 2026.*

Documento di riferimento per sviluppatori e nuovi agenti che entrano nel progetto. Mappa ogni sezione dell'app, le sue funzionalità e i flussi end-to-end. Per ogni claim sono indicati i path dei sorgenti.

> **Copertura**: questo documento copre l'app fino a **M0–M12 chiuse + intero redesign visivo "wow"** (branch `main`, `origin/main`). Rispetto alla v1.0 sono state aggiunte le sezioni **15 (Marketing pre-login)**, **16 (Admin: video PT + hub)**, **17 (Visual layer & libreria "wow")**, **18 (Testing, CI & Observability)**; le sezioni esistenti 1–14 sono state riviste e annotate con i cambiamenti del redesign dove rilevante. Stato verificato al 14 lug 2026: `tsc --noEmit` 0 errori, `vitest run` 54/54 verdi.

> **🆕 Aggiornamento 12 ago 2026 — Area Utente v2:** dopo la v2.0 sono stati aggiunti — e committati su `origin/main` — il **restyling merged** (`af8fdac`) e un'intera fase nuova: **Area Utente v2** (7 sezioni), **Account Manager**, **Motore** (quiz + target nutrizionali). Questa fase è **documentata in dettaglio nella nuova [§21](#21-area-utente-v2--motore--account-manager-ago-2026)**; le sezioni 4, 5, 9, 10, 11, 12, 13 qui sotto sono state **annotate** con i cambiamenti v2 (in particolare §12 Community non è più un placeholder). ⚠️ Lo schema v2 richiede ancora `npx prisma db push` e il bucket Supabase `user-documents` per funzionare a runtime.

---

## Indice

1. [Panoramica e stack](#1-panoramica-e-stack)
2. [Modello dati (schema Prisma)](#2-modello-dati-schema-prisma)
3. [Autenticazione](#3-autenticazione)
4. [Onboarding 4-step](#4-onboarding-4-step)
5. [Dashboard e navigazione](#5-dashboard-e-navigazione)
6. [Esercizi (catalogo)](#6-esercizi-catalogo)
7. [Allenamento — piani e sessioni](#7-allenamento--piani-e-sessioni)
8. [Analisi v2 — il flusso centrale](#8-analisi-v2--il-flusso-centrale)
9. [AI Coach (chat)](#9-ai-coach-chat)
10. [Nutrizione](#10-nutrizione)
11. [Progressi](#11-progressi)
12. [Community](#12-community)
13. [Profilo](#13-profilo)
14. [Infrastruttura supportiva](#14-infrastruttura-supportiva)
15. [Area Marketing (pagine pre-login)](#15-area-marketing-pagine-pre-login) 🆕
16. [Area Admin (M9 video PT + M10 hub)](#16-area-admin-m9-video-pt--m10-hub) 🆕
17. [Visual layer & libreria "wow" (M11 + redesign)](#17-visual-layer--libreria-wow-m11--redesign) 🆕
18. [Testing, CI & Observability (M12)](#18-testing-ci--observability-m12) 🆕
19. [Riepilogo modelli AI per endpoint](#19-riepilogo-modelli-ai-per-endpoint)
20. [Errori noti, limitazioni, TODO](#20-errori-noti-limitazioni-todo)
21. [Area Utente v2 + Motore + Account Manager (ago 2026)](#21-area-utente-v2--motore--account-manager-ago-2026) 🆕

---

## 1. Panoramica e stack

**FitAI** è un'app fitness AI-driven che genera piani di allenamento e nutrizione personalizzati con Claude, e analizza l'esecuzione tecnica degli esercizi tramite un sistema **triplice** (biomeccanica 3D locale + vision AI utente + confronto vision con video PT).

### Stack tecnologico

| Layer | Tecnologia |
|---|---|
| **Framework** | Next.js 16 (App Router, route groups, server components) |
| **Auth** | NextAuth v5 beta — JWT strategy |
| **ORM/DB** | Prisma 7.x + `@prisma/adapter-pg` (driver-adapter pattern obbligatorio) + PostgreSQL (Supabase) |
| **Storage** | Supabase Storage (4 bucket) |
| **Cache / Rate limit** | Upstash Redis serverless |
| **AI** | Anthropic SDK — `claude-sonnet-4-6` (default) + `claude-haiku-4-5-20251001` (fast) |
| **Pose detection** | `@mediapipe/tasks-vision` v0.10.x (modello BlazePose 33 keypoints da CDN Google) |
| **UI** | Tailwind CSS + Radix UI (shadcn/ui) + Lucide icons |
| **Charts** | Recharts |
| **Validazione** | Zod su tutti gli endpoint |
| **Password hashing** | bcryptjs (salt 12) |
| **Date utils** | date-fns con locale `it` |

### Architettura ad alto livello

```
                          ┌──────────────────┐
                          │   Landing /      │
                          └────────┬─────────┘
                                   │
                          ┌────────▼─────────┐
                          │  (auth) group    │
                          │  /login          │
                          │  /registrati     │
                          │  /onboarding/*   │  ←─── sessionStorage
                          └────────┬─────────┘       ("fitai-onboarding")
                                   │
                          ┌────────▼─────────┐
                          │   (app) group    │ ←── proxy.ts auth check
                          │   layout guard:  │     + onboardingCompleted
                          │   redirect a:    │
                          │   /onboarding    │
                          │   se !completed  │
                          └────────┬─────────┘
                                   │
       ┌───────┬───────┬───────┬───┴───┬───────┬───────┬────────┐
       ▼       ▼       ▼       ▼       ▼       ▼       ▼        ▼
   /dash-  /eser-  /alle-  /anal-  /ai-    /nutri- /comm-   /pro-
   board   cizi    namento isi    coach   zione   unity    fili
                            │
                            └─→ /analisi/sessione → /analisi/report/[id]
```

### Convenzione route groups Next.js

- `src/app/(auth)/` — pagine pubbliche raggruppate logicamente (login, registrati, onboarding). I parentesi non finiscono nel path URL.
- `src/app/(app)/` — pagine protette dietro auth + onboarding guard.
- `src/app/api/` — endpoint REST.
- `src/proxy.ts` — sostituisce `middleware.ts` (rinominato in Next.js 16).

---

## 2. Modello dati (schema Prisma)

File: `prisma/schema.prisma`. Client generato in `src/generated/prisma/` (import: `from "@/generated/prisma"`).

> **🆕 v2 (ago 2026): 37 modelli totali.** Rispetto alla v2.0 lo schema aggiunge: campo `User.medicalNotes`, campo `Exercise.explanationVideoUrl`, e i modelli **`RevisionRequest`**, **`QuizConfig`**, **`SocialComment`**, **`UserDocument`** (+ enum **`DocumentKind`**: FITNESS/NUTRITION); `UserProgress` è ora usato attivamente (peso/misure). ⚠️ Queste aggiunte sono nello schema ma richiedono `npx prisma db push` sul DB. Vedi [§21.8](#218-nuovi-modelli-prisma-v2).

### Enum (17 totali)

| Enum | Valori |
|---|---|
| `FitnessLevel` | BEGINNER, INTERMEDIATE, ADVANCED, **ATHLETE** *(no "EXPERT")* |
| `FitnessGoal` | LOSE_WEIGHT, BUILD_MUSCLE, ENDURANCE, FLEXIBILITY, GENERAL_FITNESS, ATHLETIC_PERFORMANCE |
| `Equipment` | NONE, DUMBBELLS, BARBELL, MACHINE, RESISTANCE_BANDS, PULL_UP_BAR, BENCH, KETTLEBELL, CABLES, FULL_GYM |
| `MuscleGroup` | CHEST, BACK, SHOULDERS, BICEPS, TRICEPS, FOREARMS, CORE, QUADRICEPS, HAMSTRINGS, GLUTES, CALVES, FULL_BODY |
| `ExerciseCategory` | STRENGTH, CARDIO, FLEXIBILITY, BALANCE, PLYOMETRIC, FUNCTIONAL |
| `Difficulty` | BEGINNER, INTERMEDIATE, ADVANCED |
| `SessionStatus` | IN_PROGRESS, COMPLETED, CANCELLED |
| `AnalysisStatus` | RECORDING, PROCESSING, COMPLETED, ERROR |
| `ThresholdSeverity` | WARNING, ERROR, CRITICAL |
| `ExercisePhase` | CONCENTRIC, ECCENTRIC, ISOMETRIC, TOP, BOTTOM, THROUGHOUT |
| `TriggerCondition` | BELOW_MIN, ABOVE_MAX, OUT_OF_RANGE |
| `AchievementRarity` | COMMON, RARE, EPIC, LEGENDARY |
| `MealType` | BREAKFAST, LUNCH, DINNER, SNACK *(no PRE/POST_WORKOUT)* |
| `PostType` | WORKOUT_SHARE, ACHIEVEMENT, PROGRESS_PHOTO, CHALLENGE_COMPLETION |
| `ChallengeType` | STREAK, VOLUME, FREQUENCY, SPECIFIC_EXERCISE |
| `NotificationType` | ACHIEVEMENT, REMINDER, SOCIAL, CHALLENGE, AI_TIP |
| `WearablePlatform` | APPLE_HEALTH, GOOGLE_FIT, FITBIT, GARMIN |

### Model principali

| Model | Scopo |
|---|---|
| `User` | Account + profilo fitness + gamification (streak/punti) + `onboardingCompleted` + `nutritionPlanJson` |
| `Account` | OAuth providers (NextAuth) |
| `AuthSession` | Session storage NextAuth |
| `Exercise` | Esercizio base (slug, video PT, recordingDurationSeconds, professionalNotes) |
| `ExerciseBiomechanicalSpec` | Spec biomeccanica per esercizio (relazione 1:1) |
| `ExerciseMovement` | Movimento su joint specifico (`left_knee`, `right_shoulder`, `spine`…) |
| `MovementPhase` | Range angolare atteso per una fase del movimento |
| `PhaseTrigger` | Regola di violazione (condition + severity + feedback + injuryRisk) |
| `WorkoutPlan` | Piano personalizzato dell'utente (può essere AI-generated) |
| `WorkoutPlanDay` | Giorno del piano (dayNumber 1–7, restDay) |
| `WorkoutPlanExercise` | Esercizio in un giorno (sets, reps, `restSeconds`, `durationSeconds`) |
| `WorkoutSession` | Sessione di allenamento eseguita (status, `totalSeconds`, `totalVolumeKg`) |
| `WorkoutSessionExercise` | Esercizio eseguito (`completedSets` Json) |
| `AnalysisSession` | Sessione di analisi video (`l1Result/l2Result/l3Result/finalReport` Json + `combinedScore`). 🆕 Sessione 6: `workoutSessionId`/`workoutSessionExerciseId` opzionali → collega l'analisi alla `WorkoutSession` in cui è stata fatta (prima nessun link) |
| `PushSubscription` | 🆕 Sessione 6 — sottoscrizione push utente (`endpoint`, `p256dh`, `auth`) per il reminder streak |
| `UserProgress` | Tracking corporeo (peso, misure, foto) |
| `NutritionLog` | Log alimentare (`proteinG/carbsG/fatG/fiberG`) |
| `Achievement` | Template badge sbloccabile |
| `UserAchievement` | Achievement sbloccato da utente |
| `Challenge` | Sfida community |
| `ChallengeParticipant` | Partecipazione a challenge |
| `SocialPost` | Post community |
| `SocialLike` | Like a post |
| `Notification` | Notifica utente |
| `WearableIntegration` | Token wearable |
| `WorkoutPlanTemplate` | Template per few-shot AI (workout) |
| `NutritionPlanTemplate` | Template per few-shot AI (nutrition) |

### Relazioni critiche

```
User
 ├─ WorkoutPlan ─┬─ WorkoutPlanDay ─── WorkoutPlanExercise ── Exercise
 │               └─ WorkoutSession  ─── WorkoutSessionExercise ── Exercise
 ├─ AnalysisSession ── Exercise
 ├─ UserProgress
 ├─ NutritionLog
 ├─ UserAchievement ── Achievement
 └─ SocialPost / Notification / WearableIntegration / ChallengeParticipant

Exercise
 └─ ExerciseBiomechanicalSpec (1:1)
      └─ ExerciseMovement[]      (per joint)
           └─ MovementPhase[]    (CONCENTRIC/ECCENTRIC/TOP/BOTTOM/…)
                └─ PhaseTrigger[] (regole violazione)
```

### Campi Json documentati

| Model | Campo | Struttura |
|---|---|---|
| `User` | `nutritionPlanJson` | `{ targetMacros: {kcal, proteinG, carbsG, fatG}, weeklyPlan: { lunedi:{...}, ... } }` |
| `AnalysisSession` | `l1Result` | `{ score, triggeredFeedback[], detectedPhases[], rawAnglesSampled[] }` |
| `AnalysisSession` | `l2Result` | `{ score, qualitativeAnalysis, visualObservations[], injuryRiskFlags[] }` |
| `AnalysisSession` | `l3Result` | `{ score, comparisonFeedback, keyDifferences[] }` |
| `AnalysisSession` | `finalReport` | `{ combinedScore, overallJudgment, prioritizedImprovements[], injuryRiskAlert{level,explanation,affectedAreas[]}, positiveAspects[] }` |
| `WorkoutSessionExercise` | `completedSets` | `[{ reps, weight, notes }, ...]` |
| `Challenge` | `target` / `reward` | `{ exerciseSlug, targetReps, duration }` / `{ points, badge }` |
| `WorkoutPlanTemplate` | `daysJson` | Stessa struttura di WorkoutPlanDay |
| `NutritionPlanTemplate` | `targetMacrosJson` / `weeklyPlanJson` | Idem |

> **Convenzione nomi**: usa SEMPRE `proteinG/carbsG/fatG/fiberG`, `weightKg/heightCm`, `totalSeconds` (non `protein/carbs/fat`, `weight/height`, `totalDuration`). Vedi `MEMORY.md` per dettaglio.

---

## 3. Autenticazione

### File chiave

- `src/lib/auth.ts` — configurazione centrale NextAuth v5
- `src/app/api/auth/[...nextauth]/route.ts` — re-esporta `handlers` come GET/POST
- `src/proxy.ts` — protezione rotte (ex middleware Next.js 15)
- `src/app/api/auth/register/route.ts` — endpoint registrazione custom

### Configurazione

```typescript
// src/lib/auth.ts
session: { strategy: "jwt" }
adapter: PrismaAdapter(prisma)    // sincronizzazione DB per Google OAuth
providers: [
  GoogleProvider({ clientId, clientSecret }),
  CredentialsProvider({
    authorize: async (creds) => {
      // valida Zod (email + password ≥6)
      // bcrypt.compare con user.passwordHash
    }
  })
]
callbacks: {
  jwt: ({token, user}) => { if (user) token.id = user.id; return token },
  session: ({session, token}) => { session.user.id = token.id; return session }
}
pages: { signIn: "/login", error: "/login" }
```

### Pattern accesso lato server

In qualsiasi server component o API:

```typescript
const session = await auth();
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
const userId = session.user.id as string;
```

Esempio guard nel layout: `src/app/(app)/layout.tsx` controlla session + `onboardingCompleted`.

### Registrazione

`POST /api/auth/register` accetta `{ name, email, password }` (Zod: name ≥2, password ≥8), controlla email duplicata (409), hash con bcryptjs salt 12, crea User. Il client `(auth)/registrati/page.tsx` chiama poi `signIn("credentials", ...)` e redirige a `/onboarding`.

### Rotte protette

`src/proxy.ts` esporta `auth` di NextAuth come `proxy`. Il matcher copre: `/dashboard/*`, `/onboarding/*`, `/allenamento/*`, `/analisi/*`, `/api/workout-plans/*`, `/api/analysis/*`, `/api/ai/*` e tutte le altre rotte private.

---

## 4. Onboarding 4-step

> **🆕 v2 (ago 2026): l'entry point dell'onboarding è ora il QUIZ, non i 4 step.** `src/app/(app)/layout.tsx` reindirizza gli utenti con `onboardingCompleted: false` a **`/onboarding/quiz`** (non più `/onboarding/step1`). Il flusso 4-step descritto qui sotto **esiste ancora nel codice** ma non è più il percorso principale. Dettaglio del quiz in [§21.2](#212-onboarding--quiz).

L'onboarding raccoglie il profilo utente in 4 schermate, conservando lo stato in **sessionStorage** (chiave `fitai-onboarding`) tramite l'helper `onboardingState.ts`. Al termine genera il primo piano AI di allenamento.

### Helper sessionStorage

`src/app/(auth)/onboarding/onboardingState.ts`:

```typescript
type OnboardingState = {
  primaryGoal?: string;
  fitnessLevel?: string;
  availableEquipment?: string[];
  age?: number; weightKg?: number; heightCm?: number;
  gender?: string;
  weeklyWorkoutDays?: number;
  dietType?: string;
  pastInjuries?: string[];
  pastSports?: string[];
};
readOnboarding()   // safe su SSR
writeOnboarding()  // merge
clearOnboarding()  // chiamato dopo redirect a /dashboard
```

### Step 1 — Obiettivo + livello

`(auth)/onboarding/step1/page.tsx`. Due select grid:

- `primaryGoal`: LOSE_WEIGHT, BUILD_MUSCLE, ENDURANCE, FLEXIBILITY, GENERAL_FITNESS, ATHLETIC_PERFORMANCE
- `fitnessLevel`: BEGINNER, INTERMEDIATE, ADVANCED, ATHLETE

### Step 2 — Attrezzatura

`(auth)/onboarding/step2/page.tsx`. Multi-select con 10 opzioni (allineate enum `Equipment` Prisma). Guard: se step1 non completato → redirect step1.

### Step 3 — Dati fisici e dieta

`(auth)/onboarding/step3/page.tsx`. Input:

- `age` (12–100), `weightKg` (30–300), `heightCm` (100–250)
- `gender` (M/F/X)
- `weeklyWorkoutDays` (2–6)
- `dietType` (onnivora / vegetariana / vegana / chetogenica / mediterranea / altro)
- `pastInjuries` (textarea, split per virgola)
- `pastSports` (multi-select; "Nessuno" esclude altri)

### Step 4 — Riepilogo + generazione AI

`(auth)/onboarding/step4/page.tsx`. Flusso:

```
1. Valida tutti i campi (read tutto il sessionStorage)
2. POST /api/onboarding              → salva profilo + onboardingCompleted=true
3. POST /api/ai/generate-plan        → stream Claude Sonnet 4.6
   ├─ legge chunks via reader.getReader()
   └─ aggiorna UI con streaming text in tempo reale
4. Parse JSON (estrae blocco ```json...```)
5. GET  /api/exercises?limit=100     → mappa { exerciseSlug → exerciseId }
6. Costruisce payload con exerciseId reali + sets/reps/restSeconds
7. POST /api/workout-plans           → salva piano nested
8. clearOnboarding() + router.push("/dashboard")
```

### API `/api/onboarding`

`POST` con Zod schema rigoroso (vedi `src/app/api/onboarding/route.ts`):

```typescript
{
  primaryGoal: FitnessGoal,
  fitnessLevel: FitnessLevel,
  availableEquipment: Equipment[],
  age, weightKg, heightCm: number,
  gender: string,
  weeklyWorkoutDays: 1-7,
  dietType, pastInjuries[], pastSports[]: optional
}
```

`prisma.user.update` salva tutti i campi + setta `onboardingCompleted=true`. Response `{ ok: true }`.

### Guard layout app

`src/app/(app)/layout.tsx`:

```typescript
const session = await auth();
if (!session?.user?.id) redirect("/login");

const user = await prisma.user.findUnique({
  where: { id: session.user.id as string },
  select: { onboardingCompleted: true },
});
if (!user?.onboardingCompleted) redirect("/onboarding");
```

---

## 5. Dashboard e navigazione

> **🆕 v2 (ago 2026): la navigazione è cambiata.** La `Navbar` è ora **copy-driven** (`src/content/copy.ts` → `copy.navbar`) con **7 sezioni**: 5 principali (Dashboard, La tua sessione `/allenamento`, Il tuo piano nutrizionale `/nutrizione`, Libreria `/esercizi`, Progressi) in sidebar desktop e bottom tab-bar mobile; **Community** e **Profilo** in coda alla sidebar e nel menu ☰ mobile; **Admin** condizionale (`isAdmin`). Le **quick action** verso `/ai-coach` non ci sono più (AI Coach de-linkato — vedi §9). Struttura completa in [§21.1](#211-navigazione-v2-7-sezioni). Le quick action e il layout dashboard qui sotto restano validi tranne il link AI Coach.

### Dashboard

`src/app/(app)/dashboard/page.tsx` — server component. Carica in parallelo:

```typescript
const [user, activePlan, recentSessions, achievements, mission] = await Promise.all([
  prisma.user.findUnique({ select: { name, currentStreak, totalPoints, longestStreak } }),
  prisma.workoutPlan.findFirst({ where: { userId, isActive: true }, include: { days: { include: { exercises } } } }),
  prisma.workoutSession.findMany({ where: { userId, status: "COMPLETED" }, take: 5 }),
  prisma.userAchievement.findMany({ where: { userId }, take: 3 }),
  getDailyMission(userId),  // M8
]);
```

UI mostra (post M8 — sessione 11):
- **Header compresso**: saluto + streak/punti inline (Flame + Target icon)
- **Daily Mission hero** (`DailyMissionCard`): 3 task adattivi giornalieri (vedi sotto)
- **Piano attivo**: card con progress bar settimanale + primi 3 giorni
- **Sessioni recenti**: ultime 5 con data + durata
- **Quick actions 3 link**: `/analisi`, `/ai-coach`, `/esercizi`
- **Achievement recenti**: ultimi 3 con punti
- **WelcomeTour** (M7): modal 5 step al primo accesso (`localStorage` `fitai-tour-completed`)

### Daily Mission (M8)

Server function `src/lib/dailyMission.ts::getDailyMission(userId)` ritorna 3 task derivati dallo stato dell'utente:

| Task | Sorgente | Done quando |
|---|---|---|
| **Workout** | `WorkoutPlan` attivo + `WorkoutSession` di oggi | sessione COMPLETED oggi sul `planDay` target (calcolato come `sessionsCount % days.length`); rest day → auto-done |
| **Nutrition** | `NutritionLog` `where date di oggi` | `count >= 3` (soglia `NUTRITION_TASK_THRESHOLD`) |
| **Check-in mood** | `DailyCheckin` `where userId_date` | upsert via `POST /api/daily-checkin` (mood 1-5 emoji: 😩 😕 😐 🙂 💪) |

Componente `src/components/dashboard/DailyMissionCard.tsx` (client) gestisce il check-in inline (5 bottoni emoji con `useTransition` + `router.refresh()` per riallineare lo stato server). Stato pending/in_progress/done con check icon, progress dots (1-3), evidenziazione "Missione completata 🎉" se tutti done.

Endpoint `src/app/api/daily-checkin/route.ts` POST upsert con Zod validate (mood int 1-5, note opzionale max 500 char), rate-limit-free per UX fluida.

### Navbar

`src/components/layout/Navbar.tsx`. 8 voci in `NAV_ITEMS`:

| Path | Label |
|---|---|
| `/dashboard` | Dashboard |
| `/esercizi` | Esercizi |
| `/allenamento` | Allenamento |
| `/analisi` | Analisi AI |
| `/ai-coach` | AI Coach |
| `/nutrizione` | Nutrizione |
| `/community` | Community |
| `/progressi` | Progressi |

- **Desktop**: sidebar fissa `w-64` con brand "FitAI", active state per route corrente, sezione profilo in basso
- **Mobile**: header `h-14`, toggle button, overlay menu

---

## 6. Esercizi (catalogo)

### Listing

`src/app/(app)/esercizi/page.tsx` — server component. Filtri da `searchParams`:

```typescript
const exercises = await prisma.exercise.findMany({
  where: {
    isActive: true,
    ...(params.muscolo && { muscleGroupPrimary: params.muscolo }),
    ...(params.difficolta && { difficulty: params.difficolta }),
    ...(params.cerca && { name: { contains: params.cerca, mode: "insensitive" } }),
  },
  include: { biomechanicalSpec: { select: { id: true } } },
  orderBy: { name: "asc" },
});
```

UI: search bar + tabs muscolo + filtro difficoltà + grid cards (thumbnail video, badge difficoltà/muscolo, **badge "AI" se l'esercizio ha biomechanicalSpec**, link `/esercizi/[slug]`).

### Dettaglio

`src/app/(app)/esercizi/[slug]/page.tsx`. Carica esercizio con `include` gerarchia biomeccanica completa (`spec → movements → phases → triggers`).

Sezioni:

1. **Video PT** (videoUrl + thumbnailUrl) o placeholder. Pulsante "Analizza la mia esecuzione" → `/analisi?esercizio={slug}`
2. **Info**: nome, descrizione, badges, kcal/min, equipment, gruppi muscolari
3. **Istruzioni** (array `instructions` numerate)
4. **Parametri Biomeccanici AI**: flatMap della gerarchia spec→movements→phases→triggers, mostra per ogni trigger: severity icon (🔴 CRITICAL, 🟠 ERROR, 🟡 WARNING), joint, movementType, phase, range `[minAngle, maxAngle]°`, feedback testuale
5. **Professional Notes**: card opzionale

### API `/api/exercises`

`GET` con query params `muscolo`, `difficolta`, `cerca`, `limit` (max 100). Ritorna array con `include` biomechanicalSpec completo (usato sia dal listing che dal layer slug→id dell'onboarding).

---

## 7. Allenamento — piani e sessioni

### 7.1 Genera AI manuale

`src/app/(app)/allenamento/genera-ai/page.tsx` — client component. Form:

- **Goal**: 6 opzioni con emoji
- **Level**: BEGINNER / INTERMEDIATE / ADVANCED
- **Days/week**: 2, 3, 4, 5, 6
- **Equipment**: multi-select 8 opzioni
- **Notes**: textarea libera

Generate function:

```typescript
// 1. POST /api/ai/generate-plan
const res = await fetch("/api/ai/generate-plan", { method: "POST", body: JSON.stringify({...}) });

// 2. Stream chunks
const reader = res.body.getReader();
const decoder = new TextDecoder();
let fullText = "";
while (!done) {
  const { value, done: d } = await reader.read();
  fullText += decoder.decode(value);
  setStreamText(fullText);  // UI live update
}

// 3. Parse JSON (estrai blocco ```json```)
const planJson = JSON.parse(fullText.match(/```json\n?([\s\S]*?)\n?```/)[1]);

// 4. Slug→ID translation via /api/exercises?limit=100
// 5. POST /api/workout-plans con exerciseId tradotti
// 6. router.push(`/allenamento/${plan.id}`)
```

### 7.2 Lista piani

`src/app/(app)/allenamento/page.tsx`. Fetch `/api/workout-plans` GET, ordinati per `isActive DESC, createdAt DESC`. PlanCard per ciascun piano con:

- Info: durata, workouts/week, esercizi totali (count su `days.exercises`)
- Badge "Attivo" e "AI" (`generatedByAI`)
- Azioni: "Vai al piano", "Imposta attivo" (toggle), delete

**🆕 v3 (ago 2026, Sessione 6):** sopra al piano attivo, la pagina mostra anche:
- **`ProfessionalNotesCard`**: se l'utente ha un documento FITNESS analizzato in Profilo → Documenti,
  mostra gli aggiustamenti/avvisi suggeriti. Informativa, non sostituisce il piano strutturato (un PDF
  è testo libero, non dati strutturati in giorni/esercizi).
- **`WeeklyCalendarStrip`**: striscia Lun–Dom che distribuisce equamente i giorni del piano (`dayNumber`)
  sui 7 slot settimanali (formula `Math.floor(i * 7 / N)`). **Non è un calendario a date fisse** — il
  piano è un ciclo ricorrente, non ancorato a giorni reali. Un giorno è "fatto" (spuntato, cliccabile →
  `/allenamento/sessioni/{id}`) se c'è una `WorkoutSession COMPLETED` questa settimana con quel `planDayId`
  (`GET /api/workout-plans/{id}/completed-this-week`).
- **`WeekRecapCard`**: allenamenti fatti/pianificati questa settimana, kg totali, streak (`/api/profilo`).
- **`PastSessionsCard`**: ultime sessioni completate (`/api/workout-sessions?limit=6`), righe cliccabili.
- **`RecentFeedbackCard`**: ultime 5 analisi AI ricevute (`/api/me/recent-analyses`), punteggio+correzione.
- **`BodyBalanceCard`**: riuso di `AdaptiveBodyMap` (`/api/me/body-map?mode=balance`) — prima confinato
  solo alla pagina di dettaglio piano.

### 7.3 Dettaglio piano

`src/app/(app)/allenamento/[id]/page.tsx` — server component. Carica con `prisma.workoutPlan.findFirst` + include giorni + esercizi ordinati. Mostra:

- Metadati: nome, badge Attivo/AI, durata, workouts/week, tempo stimato (~4 min per esercizio)
- Lista giorni: dayNumber, name, badge restDay
- Per ogni giorno: esercizi numerati con muscolo primario, sets×reps (o durationSeconds), restSeconds, badge difficoltà
- Pulsante "Inizia" → `/allenamento/{id}/sessione?day={dayId}`

**🆕 v3 (ago 2026, Sessione 6):**
- **Card "Prossimo allenamento"**: calcolata da `WorkoutSession` completate per quel `planId` — trova
  l'ultimo `planDayId` completato, propone il successivo nel ciclo (`workoutDays[(lastIndex+1) % N]`).
  Mostra anche una barra di progresso `completati/pianificati totali` (`workoutDays.length * durationWeeks`)
  e la settimana corrente stimata. Badge "Prossimo" sul giorno corrispondente nell'elenco sotto.
- **Sezione "Sessioni completate in questo piano"**: storico filtrato su questo `planId` (diverso dalla
  lista generale di `/allenamento`), righe cliccabili verso `/allenamento/sessioni/{id}`.

### 7.4 Sessione live

`src/app/(app)/allenamento/[id]/sessione/page.tsx` — client component (Suspense). State:

```typescript
interface SessionState {
  exercises: Exercise[];
  currentExIndex: number;
  currentSet: number;
  phase: "exercise" | "rest" | "completed";
  completedSets: Map<string, number>;
  restSecondsLeft: number;
  sessionId: string | null;
}
```

Flusso:

```
1. fetch /api/workout-plans/{planId}        → carica piano + day
2. POST /api/workout-sessions               → crea sessione (sessionId)
3. Fase "exercise": mostra card + dots progress set
   click "Serie completata" → completeSet()
     ├─ se NON ultima serie: startRest(restSeconds)
     ├─ se ultima serie esercizio: avanza al prossimo
     └─ se ultimo esercizio ultima serie: phase="completed" + PATCH session
4. Fase "rest": countdown timer (useInterval), pausa/riprendi/salta
5. Fase "completed": Trophy icon, sommario, link dashboard/piano
```

**🆕 v3 (ago 2026, Sessione 6):**
- **Persistenza progresso** (`useWorkoutSession.ts`): `sessionId`, `currentExIndex`, `currentSet`,
  `completedSets`, log serie salvati in `sessionStorage` (chiave `motion-insight:workout-session:{dayId}`)
  ad ogni serie completata, ripristinati al mount se presenti. Necessario perché l'utente può uscire
  verso `/analisi/sessione` per un'analisi avanzata e tornare — senza questo, tornare ricreava una
  `WorkoutSession` nuova e faceva ripartire l'esercizio da zero.
- **Toggle "Analisi avanzata"** (`ExerciseView.tsx`): se attivo, il link verso l'analisi include
  `wsId={sessionId}` e `wsReturn={URL della sessione corrente}` — collega l'`AnalysisSession` creata
  alla `WorkoutSession` in corso (vedi §8) e permette il ritorno guidato.
- **Fase "completed"** ora mostra anche, se presenti, le analisi fatte durante la sessione: punteggio +
  correzione principale per esercizio (`GET /api/workout-sessions/{id}/analyses`), cliccabili verso il
  report completo. Prima il recap mostrava solo durata/esercizi/set.

### 7.5 API `/api/workout-sessions`

`POST`: input `{ planId, planDayId }`, crea record `IN_PROGRESS`.

`PATCH`: input `{ id, status, totalDuration, totalSeconds, caloriesBurned, overallFeeling, notes }`. Se `status=COMPLETED`:

```typescript
// Streak logic
const isYesterday = lastWorkoutDate?.toDateString() === yesterday().toDateString();
const newStreak = isYesterday ? user.currentStreak + 1 : 1;
const newLongest = Math.max(user.longestStreak, newStreak);

await prisma.user.update({
  data: {
    currentStreak: newStreak,
    longestStreak: newLongest,
    totalPoints: { increment: 10 },
    lastWorkoutDate: new Date(),
  }
});

// Achievement unlock
await checkAndUnlockAchievements(userId, { currentStreak: newStreak });
```

### 7.6 Achievement unlock

`checkAndUnlockAchievements(userId, ctx)` — funzione interna nello stesso file:

```typescript
const totalCompleted = await prisma.workoutSession.count({...});
const candidates: string[] = [];
if (totalCompleted >= 1)  candidates.push("first_workout");
if (totalCompleted >= 10) candidates.push("ten_workouts");
if (totalCompleted >= 50) candidates.push("fifty_workouts");
if (ctx.currentStreak >= 7)  candidates.push("week_streak");
if (ctx.currentStreak >= 30) candidates.push("month_streak");
if (new Date().getHours() < 7) candidates.push("early_bird");

// Per ogni candidate non già sbloccato:
//   create UserAchievement + increment User.totalPoints by Achievement.points
// Tutto in una transazione
```

### 🆕 7.7 Storico sessione passata (v3, ago 2026, Sessione 6)

`src/app/(app)/allenamento/sessioni/[id]/page.tsx` — server component. Apre una `WorkoutSession`
passata (`prisma.workoutSession.findFirst` + include `exercises.exercise` + `planDay`/`plan`). Per ogni
esercizio fatto mostra le serie completate (reps×peso da `completedSets` JSON) e, se quell'esercizio è
stato analizzato durante quella sessione (join client-side su `AnalysisSession.workoutSessionId` +
`exerciseId`), punteggio + correzione principale con link al report. Collegata da: "Sessioni recenti"
(§7.2), "Sessioni completate in questo piano" (§7.3) — righe rese cliccabili in questa v3.

---

## 8. Analisi v2 — il flusso centrale

Il cuore tecnico di FitAI. Il sistema analizza un video di 15–25s dell'utente con **3 livelli paralleli** (biomeccanica locale + 2 vision AI), e produce un report unico ponderato.

### 8.1 Pagina sessione

`src/app/(app)/analisi/sessione/page.tsx` — state machine:

```
IDLE → COUNTDOWN_15S → RECORDING → UPLOADING → ANALYZING → RESULT | ERROR
```

- **IDLE**: carica metadata esercizio via `/api/analysis/start` (che riceve anche `workoutSessionId`
  opzionale se si arriva dalla sessione guidata — vedi §7.4 — verificato appartenere all'utente e
  salvato su `AnalysisSession.workoutSessionId`). Mostra: due tab **Esecuzione/Spiegazione**
  (`videoUrl`/`explanationVideoUrl` dell'esercizio — 🆕 v3, prima solo un video), note del
  professionista (`professionalNotes`, 🆕 v3, prima non mostrate), camera, button "Inizia".
- **COUNTDOWN (15s, fisso)**: `CountdownCircle` SVG; **in parallelo** chiama `extractProFrames(exercise.videoUrl, 6)` che usa un canvas off-screen per estrarre 6 frame dal video PT (operazione best-effort, fallisce silenziosamente su CORS). Il 15s è una scelta di prodotto fissa, non c'è un
  campo che lo renda configurabile per esercizio (verificato in Sessione 6 — non è un bug).
  🆕 v3: se il device ha più di una fotocamera (`enumerateDevices`), un bottone permette lo switch
  anteriore/posteriore (`useCamera.switchCamera()`) durante IDLE/COUNTDOWN (non durante RECORDING).
- **RECORDING**: 
  - `MediaRecorder` con codec `video/webm;codecs=vp9` → fallback vp8 → fallback webm puro
  - Durata `exercise.recordingDurationSeconds` (15/20/25s a seconda dell'esercizio) — questo campo
    era già usato correttamente prima di Sessione 6, non serviva fix.
  - Intervallo `(duration * 1000) / 8` ms: ogni tick estrae uno snapshot via canvas `captureFrame(video)` → JPEG base64 → push in `userFramesRef` con label `t=Xs`
  - `usePoseDetection({ enabled: true, silent: true })` accumula `frameHistory` e `worldFrameHistory` in store (no skeleton, no voce, no feedback live)
- **UPLOADING**: stop MediaRecorder → Blob → `FormData` con `video` + `analysisSessionId` → `POST /api/analysis/upload-video` → riceve `{ videoUrl, path }`
- **ANALYZING**: `POST /api/analysis/complete` con `{ analysisSessionId, frameHistory, userFrames, proFrames, durationSeconds }`. Polling stato durante l'attesa.
- **RESULT** (🆕 v3, prima era `router.push('/analisi/report/{id}')`): i dati del report vengono
  caricati via `GET /api/analysis/{id}` e mostrati **nella stessa pagina**, senza redirect — stesso
  contenuto della pagina report (§8.9), tramite i componenti condivisi `AnalysisReportContent` +
  `AnalysisReportActions`. Se si arriva dalla sessione guidata (`wsReturn` in query string, validato
  come path interno relativo), il CTA principale è "Torna alla sessione" verso quell'URL.

### 8.2 MediaPipe pose

`src/lib/pose.ts`.

- `KEYPOINT_NAMES`: 33 nomi (nose, left_eye_inner, left_shoulder, … right_foot_index)
- Modello BlazePose caricato da CDN Google
- `mapLandmarksToKeypoints(landmarks, w, h)`: coord normalizzate 0–1 → pixel
- `mapWorldLandmarks(worldLandmarks)`: coordinate **3D in metri**, camera-independent
- `calculateAngle(a, b, c)`:

```typescript
if (a.z !== undefined && b.z !== undefined && c.z !== undefined) {
  // 3D dot product
  const v1 = { x: a.x-b.x, y: a.y-b.y, z: a.z-b.z };
  const v2 = { x: c.x-b.x, y: c.y-b.y, z: c.z-b.z };
  const cos = (v1.x*v2.x + v1.y*v2.y + v1.z*v2.z) / (mag(v1) * mag(v2));
  return Math.acos(cos) * 180 / Math.PI;
}
// Fallback 2D: atan2 difference
```

### 8.3 Upload video

`POST /api/analysis/upload-video`:

```typescript
1. auth check + analysisRatelimit (5/h)
2. file validation:
   - size ≤ 50 MB → 413 altrimenti
   - mime in [video/webm, video/mp4, video/quicktime] → 415 altrimenti
3. path = `${userId}/${analysisSessionId}/${Date.now()}.${ext}`
4. supabaseAdmin.storage.from("analysis-videos").upload(path, file, { upsert: true })
5. createSignedUrl(path, 60*60*24)  // 24h
6. update AnalysisSession.videoUrl + status="PROCESSING"
7. return { videoUrl: signedUrl, path }
```

### 8.4 Orchestrazione `/api/analysis/complete`

```typescript
export const maxDuration = 120;  // 2 minuti timeout

// 1. Fetch session + exercise + biomechanicalSpec gerarchia
// 2. Update status → PROCESSING
// 3. const timeline = detectPhases(frameHistory, exerciseSlug);

// 4. Costruisci promises
const l1Promise = Promise.resolve(
  specData ? evaluateExerciseSpec(frameHistory, specData, timeline) : fallbackL1
);
const l2Promise = analyzeUserVideoVision({ exerciseName, professionalNotes, userFrames });
const l3Promise = hasProFrames
  ? compareVideoVision({ exerciseName, professionalNotes, userFrames, proFrames })
  : Promise.resolve({ score: -1, comparisonFeedback: "...", keyDifferences: [] });  // sentinella

// 5. Esegui in parallelo
const [l1S, l2S, l3S] = await Promise.allSettled([l1Promise, l2Promise, l3Promise]);

// 6. Fallback su rejected
let l1 = l1S.status === "fulfilled" ? l1S.value : { score: 0, ... };
let l2 = l2S.status === "fulfilled" ? l2S.value : { score: 0, ... };
let l3 = l3S.status === "fulfilled" ? l3S.value : { score: 0, ... };

// 7. Redistribuzione pesi se L3 sentinella
if (l3.score === -1) l3.score = Math.round((l1.score + l2.score) / 2);

// 8. Fail-fast se ≥2 livelli rejected
if (failures >= 2) return 500;

// 9. Final report
const finalReport = await generateFinalReport({ exerciseName, l1, l2, l3 })
  .catch(() => fallbackLocalReport(l1, l2, l3));  // fallback locale se Haiku fallisce

// 10. Persist
await prisma.analysisSession.update({
  data: { status: "COMPLETED", l1Result, l2Result, l3Result, finalReport,
          combinedScore: finalReport.combinedScore, completedAt: new Date() }
});
```

### 8.5 L1 — Biomeccanica locale (deterministico, no AI)

`src/services/biomechanical/phaseDetector.ts`:

- Map `EXERCISE_PHASE_CONFIG` per ~20 esercizi → `keyAngle` function (es. squat = avg(leftKnee, rightKnee))
- Per esercizi statici (plank, plank-laterale) → flag `static: true` → THROUGHOUT su tutta la durata
- Algoritmo `detectPhases`:
  1. Estrai sequenza valori `keyAngle` per ogni frame
  2. Smoothing moving average window=5
  3. `minVal`, `maxVal`, `range = maxVal - minVal`
  4. Se `range < 15°` → ISOMETRIC
  5. `bottomThreshold = minVal + range × 0.18`, `topThreshold = maxVal - range × 0.18`
  6. Classifica ogni frame: BOTTOM / TOP / CONCENTRIC / ECCENTRIC / THROUGHOUT
  7. Persistence smoother: run < 5 frame → assorbi (rumore isolato)
- Output: `{ framePhases: ExercisePhase[], detectedPhases: [{phase, durationFrames}] }`

`src/services/biomechanical/specEvaluator.ts`:

```typescript
function evaluateExerciseSpec(frames, spec, timeline) {
  let penaltySum = 0;
  let evaluatedMovements = 0;
  
  for (const movement of spec.movements) {              // joint
    evaluatedMovements++;
    for (const phase of movement.phases) {              // CONCENTRIC, BOTTOM, ...
      const phaseFrames = frames.filter(f =>
        timeline.framePhases[f.index] === phase.phase
      );
      for (const trigger of phase.triggers) {           // BELOW_MIN, ABOVE_MAX, OUT_OF_RANGE
        const violationFrames = phaseFrames.filter(f =>
          isViolated(f.angles[movement.joint], phase.minAngle, phase.maxAngle, trigger.condition)
        );
        if (violationFrames.length >= 5) {              // persistenza minima
          const persistence = Math.min(1, violationFrames.length / phaseFrames.length);
          const weight = { WARNING: 1, ERROR: 3, CRITICAL: 10 }[trigger.severity];
          penaltySum += weight * persistence;
          triggeredFeedback.push({ feedback: trigger.feedback, severity, injuryRisk });
        }
      }
    }
  }
  
  const score = Math.max(0, Math.min(100, Math.round(
    100 - (penaltySum / evaluatedMovements) * 10
  )));
}
```

### 8.6 L2 — Vision utente (Claude Sonnet 4.6)

`src/services/ai/visionAnalyzer.ts::analyzeUserVideoVision`. Input: 8 frame JPEG base64 etichettati `t=X.Xs`.

```typescript
const response = await anthropic.messages.create({
  model: MODELS.DEFAULT,  // claude-sonnet-4-6
  max_tokens: 1024,
  messages: [{ role: "user", content: [
    { type: "text", text: SYSTEM_PROMPTS.EXERCISE_ANALYZER, cache_control: { type: "ephemeral" } },
    { type: "text", text: buildVisionAnalysisPrompt({...}) },
    ...frames.flatMap(f => [
      { type: "image", source: { type: "base64", media_type: f.mediaType, data: f.base64 } },
      { type: "text", text: `Frame: ${f.label}` }
    ])
  ]}]
});
```

Output:

```json
{
  "score": 0-100,
  "qualitativeAnalysis": "max 150 parole",
  "visualObservations": ["..."],
  "injuryRiskFlags": ["..."]
}
```

Il prompt focalizza l'AI sugli aspetti **visivi che L1 non coglie**: controllo, simmetria L/R, pattern respiratorio, espressione di sforzo, compensi sottili.

### 8.7 L3 — Confronto vs PT (Claude Sonnet 4.6)

`compareVideoVision`. Input: 6 user frames + 6 pro frames → 12 immagini alternate USER/PRO ordinate per fase analoga.

Output:

```json
{
  "score": 0-100,                      // 100 = identico al PT
  "comparisonFeedback": "max 150 parole",
  "keyDifferences": [
    { "aspect": "ROM ginocchio", "user": "...", "pro": "..." }
  ]
}
```

Se i pro frames non sono disponibili (estrazione fallita per CORS sul video PT), L3 ritorna sentinella `score: -1` e il combiner ridistribuisce a `(L1+L2)/2`.

### 8.8 Final report (Claude Haiku 4.5)

`src/services/ai/finalReportGenerator.ts::generateFinalReport`. Riceve L1+L2+L3 e produce un report narrativo unificato.

**Regole prompt**:
- Priorità ai trigger CRITICAL di L1 nel `injuryRiskAlert`
- Riconciliare contraddizioni L1/L2 (numeri vs visivo): per aspetti visivi privilegiare L2
- Unificare `injuryRisk` di L1 + `injuryRiskFlags` di L2 → level BASSO/MEDIO/ALTO

**Combined score**: `Math.round(L1*0.34 + L2*0.33 + L3*0.33)`

Output:

```json
{
  "combinedScore": 0-100,
  "overallJudgment": "max 100 parole",
  "prioritizedImprovements": ["3-5 punti"],
  "injuryRiskAlert": {
    "level": "BASSO | MEDIO | ALTO",
    "explanation": "...",
    "affectedAreas": ["..."]
  },
  "positiveAspects": ["2-4 punti"]
}
```

Se Haiku fallisce o ritorna JSON invalido, c'è un **fallback locale** che assembla manualmente combinedScore + improvements da L1.triggeredFeedback.

### 8.9 Pagina report

`src/app/(app)/analisi/report/[id]/page.tsx`. Server component. **🆕 v3 (Sessione 6):** il corpo del
report è stato estratto in due componenti condivisi, riusati anche dalla fase `RESULT` inline (§8.1):

- `AnalysisReportContent` (`src/components/analisi/`): hero con anello SVG `r=45` (`stroke-dashoffset =
  282.74 * (1 - combined/100)`), score grande al centro, card "Giudizio del Coach" (overallJudgment),
  banner `injuryRiskAlert` (solo se level ≠ BASSO), lista "Migliora prima di tutto"
  (prioritizedImprovements), lista "Punti di forza" (positiveAspects), `<AnalysisDetails>` (3 tab
  L1/L2/L3), `<VideoSyncPlayer>` (play/pause sincronizzati utente vs PT).
- `AnalysisReportActions`: CTA finali — se `wsReturn` presente in query string, "Torna alla sessione"
  (primario) + "Ripeti analisi"; altrimenti "Ripeti analisi" (primario) + "Altri esercizi".

Nuovo endpoint `GET /api/analysis/{id}` espone gli stessi dati per il fetch client-side (usato dalla
fase `RESULT` inline). La pagina server resta invariata nel comportamento per chi vi arriva da un link
diretto (es. da "Ultimi feedback", storico sessione).

Empty states gestiti da `<ReportSkeleton>` (durante PROCESSING) e `<ReportError>` (se status=ERROR).

---

## 9. AI Coach (chat)

> **🆕 v2 (ago 2026): AI Coach è de-linkato dalla navigazione.** L'endpoint `POST /api/ai/chat` e la pagina `/ai-coach` **esistono ancora** e funzionano (descritti sotto), ma **non sono raggiungibili** dalla nav dell'Area Utente v2 (scelta di prodotto: escluso da questa fase).

`POST /api/ai/chat` — chat conversazionale streaming. File `src/app/api/ai/chat/route.ts`.

```typescript
const schema = z.object({
  message: z.string().min(1).max(1000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).default([])
});

const stream = await anthropic.messages.stream({
  model: MODELS.DEFAULT,
  max_tokens: 1024,
  system: SYSTEM_PROMPTS.AI_COACH,   // "Sei FitAI Coach, un personal trainer AI..."
  messages: [...history, { role: "user", content: message }]
});

return new Response(new ReadableStream({ async start(c) {
  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      c.enqueue(new TextEncoder().encode(chunk.delta.text));
    }
  }
}}), { headers: { "Content-Type": "text/plain; charset=utf-8" }});
```

Rate limit `aiRatelimit` (10/min). System prompt empatico, scientifico, motivante; risposte concise (3–4 paragrafi max).

---

## 10. Nutrizione

> **🆕 v2 (ago 2026):** aggiunti **target personalizzati** (Mifflin-St Jeor, `src/lib/nutrition-targets.ts` — non più 2000 kcal fissi), **abbinamento piano dal pool** (`GET /api/nutrition/match` → `NutritionPlanTemplate`, card `NutritionMatchCard`) e **ricette AI** (`POST /api/ai/recipes`, card `RecipesCard`). Dettaglio in [§21.3](#213-motore-nutrizionale).
>
> **🆕 v3 (ago 2026, Sessione 6) — gerarchia "piano attivo" unico.** Prima le tre fonti (documento
> professionista, piano AI, match pool) potevano comparire tutte insieme senza ordine. Ora `/nutrizione`
> mostra **una sola** sezione "piano attivo", con priorità:
> 1. **Documento professionista** (`ProfessionalPlanCard`) — se l'utente ha caricato un documento
>    NUTRITION in Profilo → Documenti ed è stato analizzato dall'AI (`GET /api/documents`, filtro
>    `kind==="NUTRITION" && analysis`), mostra sintesi + aggiustamenti + link al file. Sostituisce
>    del tutto AI/pool.
> 2. **Piano AI del quiz** (`AiNutritionPlan`, `User.nutritionPlanJson`) — **bug corretto in Sessione 6**:
>    il piano veniva salvato da `POST /api/ai/generate-nutrition-plan` ma `/api/profilo` non lo
>    restituiva e la pagina non lo rileggeva al mount, quindi spariva al refresh pur restando nel DB.
>    Ora `/api/profilo` include `nutritionPlanJson` e la pagina lo passa come `initialPlan`.
> 3. **Match dal pool** (`NutritionMatchCard`) — fallback se nessuno dei due sopra è presente.
>
> Il log pasti (§10.2) e le ricette restano invariati, solo riposizionati sotto il piano attivo.

### 10.1 Generazione AI piano nutrizionale

`POST /api/ai/generate-nutrition-plan`. File `src/app/api/ai/generate-nutrition-plan/route.ts`.

**Calcolo TDEE (Mifflin-St Jeor)**:

```typescript
// BMR gender-specific
const bmr = gender === "M"
  ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
  : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

// Activity factor
const ACTIVITY = { sedentario: 1.2, leggero: 1.375, moderato: 1.55, intenso: 1.725 };
const tdee = bmr * ACTIVITY[activityLevel];

// Goal kcal adjustment
const GOAL = { LOSE_WEIGHT: 0.80, BUILD_MUSCLE: 1.10, GENERAL_FITNESS: 1.0,
               ENDURANCE: 1.05, ATHLETIC_PERFORMANCE: 1.10, FLEXIBILITY: 1.0 };
const kcal = Math.round(tdee * GOAL[targetGoal]);

// Macros
const proteinPerKg = targetGoal === "BUILD_MUSCLE" ? 2.0 : 1.7;
const proteinG = Math.round(weightKg * proteinPerKg);
const fatG = Math.round((kcal * 0.28) / 9);
const carbsG = Math.round((kcal - proteinG * 4 - fatG * 9) / 4);
```

**Few-shot**: query `NutritionPlanTemplate` filtrando `dietType + targetGoal`, take 2, injection nel prompt.

**Claude Sonnet 4.6** non-streaming, max_tokens 6000, output JSON con `weeklyPlan: { lunedi:{...}, martedi:{...}, ... }` × 7 giorni × {breakfast, lunch, dinner, snacks[]}, ciascuno con ingredients (food + quantityG), preparationNotes, estimated kcal/macros.

Output salvato in `User.nutritionPlanJson`. Response: `{ plan, targetMacros }`.

### 10.2 Tracking giornaliero

`src/app/(app)/nutrizione/page.tsx` — client component. State:

- `date` (default oggi)
- `logs[]` (logs giornalieri)
- `totals` (somme kcal/protein/carbs/fat)
- Form `{ mealType, foodName, calories, protein, carbs, fat }`

Targets default (UI): `2000 kcal / 150g protein / 250g carbs / 65g fat`.

UI: date navigator (frecce ±1 giorno, disabled su today), macro grid 4 colonne con progress bar vs target, form add inline, pasti raggruppati per `mealType` con foodName + macros + delete button.

### 10.3 API `/api/nutrition`

`GET ?date=YYYY-MM-DD`: ritorna `{ logs, totals, date }`.

`POST`: body con Zod schema:

```typescript
{
  date: /^\d{4}-\d{2}-\d{2}$/,
  mealType: BREAKFAST | LUNCH | DINNER | SNACK,
  foodName: string (1-200),
  calories: number (0-9999),
  proteinG, carbsG, fatG, fiberG: number (default 0),
  quantity: number (default 1),
  unit: string (default "g"),
  notes: string optional
}
```

`DELETE ?id={id}`: rimuove log se appartiene all'utente.

---

## 11. Progressi

> **🆕 v2 (ago 2026):** `GET /api/progressi` ora restituisce anche il **trend Form Score** (`formScores` dalle `AnalysisSession` completate) oltre a volume settimanale e achievement; aggiunto **peso e misure** via `GET/POST /api/progress-entries` (modello `UserProgress`: `weightKg`, `measurementWaistCm`, `notes`), card `WeightMeasuresCard`. Residuo: trend carichi aggregato. Dettaglio in [§21.4](#214-progressi-v2).

`src/app/(app)/progressi/page.tsx` + `GET /api/progressi`.

API aggrega in parallelo:

```typescript
const [user, sessions, userAchievements] = await Promise.all([
  prisma.user.findUnique({ select: { totalPoints, currentStreak, longestStreak } }),
  prisma.workoutSession.findMany({
    where: { userId, status: "COMPLETED" },
    select: { completedAt, totalSeconds, overallFeeling },
    orderBy: { completedAt: "desc" },
    take: 100
  }),
  prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: { select: { name, icon, rarity } } },
    orderBy: { unlockedAt: "desc" }
  })
]);

const totalMinutes = Math.round(sessions.reduce((a, s) => a + (s.totalSeconds ?? 0), 0) / 60);
```

UI:

- **Stats grid 4 colonne**: totalSessions, totalMinutes, currentStreak, totalPoints
- **BarChart settimanale** (recharts, 7 giorni) — dataKey="sessioni"
- **LineChart 30 giorni** — minuti per giorno
- **Achievements grid** con icon + nome + rarity color + data unlock

Rarity colors:

```typescript
const RARITY_COLORS = {
  COMMON: "text-muted-foreground",
  RARE: "text-blue-400",
  EPIC: "text-purple-400",
  LEGENDARY: "text-yellow-400"
};
```

Empty state: se `totalSessions === 0` → placeholder "Completa la prima sessione".

---

## 12. Community

> **🆕 v2 (ago 2026): non è più un placeholder — è interattiva.** Dettaglio in [§21.5](#215-community-interattiva).

`src/app/(app)/community/page.tsx` — feed social funzionante:
- **`GET /api/community/feed`** — post degli utenti con `profileVisibility: "PUBLIC"`, ordinati per data desc, paginazione a **cursor** (`limit` max 50), ogni item con `likedByMe` e `commentsCount`.
- **`POST /api/community/posts`** — crea un `SocialPost` (`type: WORKOUT_SHARE`, `content` ≤ 1000 char).
- **Like**: `src/app/api/community/posts/[id]/like/route.ts` (toggle `SocialLike`, unique `[postId, userId]`).
- **Commenti**: `src/app/api/community/posts/[id]/comments/route.ts` → modello **`SocialComment`** (nuovo in v2).

Schema DB (parti ancora non esposte in UI): `Challenge` con `target`/`reward` Json, `ChallengeParticipant` con `currentProgress` Json (sfide/classifiche non ancora implementate).

---

## 13. Profilo

> **🆕 v2 (ago 2026): il Profilo è molto più ricco.** Oltre a stats/edit qui sotto ora include: **note mediche** (`medicalNotes`, via `/api/profilo`), **upload documenti** fitness/nutrizione (`GET/POST/DELETE /api/documents` → `UserDocument` su bucket Supabase `user-documents`, card `DocumentsCard`), **richiesta di revisione manuale** (`POST /api/revision-requests` → `RevisionRequest`, form `RevisionRequestForm`), **card abbonamento** e **quiz ripetibile**. Dettaglio in [§21.6](#216-profilo-v2).
> ~~⚠️ Il parsing/adattamento AI dei documenti caricati NON è implementato~~ — **nota superata**: da
> Sessione 4 esiste `POST /api/documents/{id}/analyze` (Claude legge PDF/immagine nativamente →
> sintesi + aggiustamenti fitness/nutrizione + cautele, salvati in `UserDocument.analysisJson`). Da
> Sessione 6 questa analisi viene anche **usata** per dare priorità al piano del professionista in
> Nutrizione/Allenamento (§10, §7.2).
>
> **🆕 v3 (ago 2026, Sessione 6):**
> - **Cambio email/password**: `POST /api/account/change-email` (richiede password attuale se
>   presente, invia verifica alla nuova email + notifica alla vecchia) e `POST /api/account/change-password`
>   (richiede password attuale, invia notifica di sicurezza). Componenti `ChangeEmailCard`/`ChangePasswordCard`.
> - **Notifiche** (`NotificationsCard`): toggle `User.notifyEmailReminders` (via `PATCH /api/profilo`)
>   e attivazione push (`POST/DELETE /api/push/subscribe`, modello `PushSubscription`) — vedi nuova
>   sezione [§14bis](#14bis-sistema-notifiche-reminder-streak-sessione-6) per l'infrastruttura di invio.

`src/app/(app)/profilo/page.tsx` — client component. `GET /api/profilo` ritorna (base storica):

```typescript
{
  name, email,
  fitnessLevel, primaryGoal,
  age, weightKg, heightCm,
  totalPoints, currentStreak, longestStreak,
  notifyEmailReminders, notifyPush,   // 🆕 Sessione 6
  nutritionPlanJson                    // 🆕 Sessione 6 — ora riletto per il piano AI persistito (§10)
}
```

UI:
- Stats 3 card (punti / streak / record streak)
- Account info (avatar, nome, email, badges level + goal)
- Edit form: name, age (10–99), weight (30–300), height (100–250) → `PATCH /api/profilo`
- Logout button → `signOut({ callbackUrl: "/" })`

`PATCH` con Zod accetta solo i campi modificabili (anche `fitnessLevel`/`primaryGoal`, `notifyEmailReminders`).

### 🆕 14bis. Sistema notifiche reminder streak (Sessione 6)

Costruito da zero (prima non esisteva nessuna infrastruttura di invio):
- **Schema additivo**: `User.notifyEmailReminders`/`notifyPush`, modello `PushSubscription`
  (`endpoint` unique, `p256dh`, `auth`, `userId`).
- **Push**: `src/lib/push.ts` (server, `web-push` + VAPID) e `src/lib/push-client.ts` (client,
  wrapper `Notification`/`PushManager`). Service worker `public/sw.js` con handler `push` e
  `notificationclick`.
- **Cron**: `src/app/api/cron/reminders/route.ts`, schedulato in `vercel.json` (`0 18 * * *`,
  protetto da `CRON_SECRET` se impostato). Trova utenti con `currentStreak > 0` e nessun allenamento
  completato oggi, invia email (`sendReminderEmail`, `src/lib/email.ts`) + push.
- **Env var necessarie in produzione** (non ancora su Vercel): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` (opzionale) — vedi `CHECKLIST_DEPLOY.md`.

---

## 14. Infrastruttura supportiva

### Prisma client

`src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ||
  new PrismaClient({ adapter, log: dev ? ["error","warn"] : ["error"] });

if (!production) globalForPrisma.prisma = prisma;
```

> **Nota**: Prisma 7 richiede SEMPRE l'adapter (`@prisma/adapter-pg`). Lo schema NON contiene più `url`/`directUrl` — quelle vivono in `prisma.config.ts` (dotenv legge `.env.local`).

### Supabase

`src/lib/supabase.ts`:

- `supabase`: client anonimo (uploads pubblici, lettura)
- `getSupabaseAdmin()`: client con `SUPABASE_SERVICE_ROLE_KEY` (no auto-refresh, no persist) — usato server-side per upload privati
- 4 bucket: `exercise-videos`, `analysis-videos`, `user-avatars`, `progress-photos`
- Helper `uploadFile(bucket, path, file, options)`, `getPublicUrl(bucket, path)`, `deleteFile(bucket, path)`

### Redis / Rate limiting

`src/lib/redis.ts`:

```typescript
export const redis = new Redis({ url, token });  // Upstash REST

export const aiRatelimit = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(10, "1 m"), prefix: "rl:ai"
});
export const analysisRatelimit = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:analysis"
});
export const generalRatelimit = new Ratelimit({
  redis, limiter: Ratelimit.slidingWindow(100, "1 m"), prefix: "rl:general"
});
```

### Anthropic

`src/lib/anthropic.ts`:

```typescript
export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
export const MODELS = {
  DEFAULT: "claude-sonnet-4-6",
  FAST: "claude-haiku-4-5-20251001",
};
```

### Design system

`src/components/ui/` (shadcn/ui basato su Radix UI + Tailwind):
- `button.tsx`, `card.tsx`, `badge.tsx`, `input.tsx`, `progress.tsx`, `toaster.tsx`, ...

### Componenti analisi

`src/components/analisi/`:
- `CountdownCircle.tsx` — SVG circle con `stroke-dashoffset` animato, props `{seconds, onComplete}`
- `RecordingIndicator.tsx` — badge REC pulsante + progress bar lineare
- `AnalysisProgress.tsx` — 3 step orizzontali con icone (per polling stato)
- `AnalysisDetails.tsx` — `<details>` espandibile con tabs L1/L2/L3
- `VideoSyncPlayer.tsx` — 2 video element sincronizzati play/pause/restart
- `ReportSkeleton.tsx` — shimmer durante PROCESSING
- `ReportError.tsx` — empty state errore con retry

### Store

**No Zustand**. Stato gestito interamente via React hooks locali + fetch API + server components. L'unico "store" è `frameHistory`/`worldFrameHistory` accumulato in `usePoseDetection.ts` (ref interno, non globale).

---

## 15. Area Marketing (pagine pre-login)

Superficie pubblica non autenticata, sotto il route group **`src/app/(marketing)/`** (layout + `template.tsx` con transizioni), più la landing root `src/app/page.tsx` e le pagine legali `src/app/privacy` / `src/app/terms`. Tutte le stringhe passano da `src/content/copy.ts` (vedi §17). Tema "organico" del redesign; SEO gestito centralmente (robots, sitemap, JSON-LD, `metadataBase`).

| Rotta | File | Cosa mostra | Componenti "wow" usati |
|---|---|---|---|
| `/` (landing) | `src/app/page.tsx` | Hero, "Come funziona" scroll-driven, pilastri asimmetrici, sezione analisi biomeccanica, showcase con area animata, enfasi tier Pro | `ScrollExplainer`, `AnimatedArea`, `AdaptiveBodyMap`, `GradientMesh` |
| `/funzionalita` | `(marketing)/funzionalita/page.tsx` | Vetrina funzionalità con banda "player tecnica + heatmap + progressi" | `ExerciseFormPlayer`, `AdaptiveBodyMap`, `AnimatedArea` |
| `/come-funziona` | `(marketing)/come-funziona/page.tsx` | Spiegazione step-by-step scroll-driven, un visual per step | `ScrollExplainer`, `AdaptiveBodyMap`, `ExerciseFormPlayer`, `AnimatedArea` |
| `/prezzi` | `(marketing)/prezzi/page.tsx` | Tabella piani Free/Premium; card Premium "sollevata" per coerenza con la landing | — (motion base) |
| `/chi-siamo` | `(marketing)/chi-siamo/page.tsx` | Manifesto/brand, solo testo | — |
| `/faq` | `(marketing)/faq/page.tsx` | Domande frequenti | — |

**Quando**: prima del login. Il layout marketing usa `overflow-x-clip` sulla radice (NON `overflow-hidden`: quest'ultimo rompeva lo `sticky` dello `ScrollExplainer` lasciando spazio vuoto — regressione fixata). **Funzione**: acquisizione/marketing; da qui i CTA portano a `/registrati` e `/login`.

---

## 16. Area Admin (M9 video PT + M10 hub)

Backoffice completo sotto **`src/app/(app)/admin/`** (dentro il gruppo `(app)`, quindi protetto anche dall'auth di `proxy.ts`). Non è nella navbar utente normale: è un'area separata con la propria sub-sidebar.

### 16.1 Controllo accessi — `src/lib/admin.ts`
- `requireAdmin()`: legge la sessione; se manca → `AdminAccessError(401)`; carica `User.isAdmin`. **Bootstrap da env**: se l'utente non è admin ma la sua email è in `ADMIN_EMAILS` (CSV), viene promosso automaticamente (`isAdmin = true` persistito) al primo accesso. Se non admin → `AdminAccessError(403)`.
- `admin/layout.tsx` chiama `requireAdmin()` server-side: 401 → redirect `/login`, 403 → redirect `/dashboard`. Rende `AdminSidebar` + contenuto.
- `AdminSidebar` (`src/components/admin/AdminSidebar.tsx`): tab Utenti, Abbonamenti, Esercizi, Statistiche, Gestione admin, Uso AI + link "Audit log" in fondo. `/admin` (index) fa redirect a `/admin/users`.

### 16.2 Audit log — `src/lib/admin-audit.ts` + modello `AdminActionLog`
Ogni azione mutativa admin chiama `logAdminAction({ actorId, actorEmail, action, targetType, targetId?, payload? })`, che scrive un record `AdminActionLog`. **Non bloccante**: se la scrittura fallisce logga in console e non interrompe l'azione. Enum `AdminActionType`: `PROMOTE_ADMIN`, `REVOKE_ADMIN`, `GRANT_PREMIUM`, `RESET_USER_QUOTA`, `TOGGLE_EXERCISE_ACTIVE`, `UPLOAD_PT_VIDEO`, `DELETE_PT_VIDEO`.

### 16.3 Tab e relative API (tutte gated da `requireAdmin`; errore → `{error}` con status 401/403/…)

| Tab / pagina | API | Metodo | Cosa fa / responso |
|---|---|---|---|
| **Utenti** `/admin/users` | `GET /api/admin/users` | GET | Lista paginata (PAGE_SIZE fisso). Query: `page`, `q` (email/nome, case-insensitive), `filter` = `all\|premium\|free\|admin`. Responso: `{ users[], page, pageSize, totalPages, counters{total,premium,admin} }`; ogni user ha `sessionsCount` e `premiumGrantedUntil` (solo se futuro). |
| ⤷ dettaglio utente (drawer) | `GET /api/admin/users/[id]` | GET | Dettaglio singolo utente per `UserDetailDrawer`. |
| ⤷ grant premium | `POST /api/admin/users/[id]/grant-premium` | POST | Concede premium manuale +30 giorni (`premiumGrantedUntil`), **separato** dallo stato Stripe. Responso `{ ok, periodEnd }`. Audit `GRANT_PREMIUM`. |
| ⤷ reset quota | `DELETE /api/admin/users/[id]/quota` | DELETE | Cancella gli `UsageCounter` del mese corrente. Responso `{ ok, deletedCount }`. Audit `RESET_USER_QUOTA`. |
| ⤷ promote/revoke admin | `POST` / `DELETE /api/admin/users/[id]/admin` | POST/DELETE | Rende/revoca admin. **Lockout**: non puoi revocare admin a te stesso (400) né revocare l'ultimo admin (400). Idempotente (`alreadyAdmin`/`alreadyNotAdmin`). Audit `PROMOTE_ADMIN`/`REVOKE_ADMIN`. |
| **Abbonamenti** `/admin/subscriptions` | `GET /api/admin/subscriptions` | GET | Lista filtrata per `status` (`all\|…`) + metriche MRR/churn. Paginata. |
| **Esercizi** `/admin/exercises` | `PATCH /api/admin/exercises/[id]/active` | PATCH | Toggle `isActive`. Responso `{ ok, isActive }`. Audit `TOGGLE_EXERCISE_ACTIVE`. |
| ⤷ video PT (M9) | `POST` / `DELETE /api/admin/exercises/[id]/pt-video` | POST/DELETE | Upload/rimozione VIDEO_RIF_1 (`Exercise.videoUrl`) su Supabase. Validazioni: multipart obbligatorio (400), file presente (400/415 tipo, 413 dimensione), errore upload (500). Responso `{ videoUrl, path, adminEmail }`. Audit `UPLOAD_PT_VIDEO`/`DELETE_PT_VIDEO`. |
| **Statistiche** `/admin/stats` | `GET /api/admin/stats` | GET (`revalidate=60`) | Counters (totalUsers, MAU 30gg, DAU oggi, workouts30, analyses30, checkins30), serie giornaliere nuovi utenti e workout completati (raw SQL `DATE_TRUNC`), top 10 esercizi, distribuzione per `fitnessLevel`. |
| **Gestione admin** `/admin/admins` | `GET /api/admin/admins` + `POST /api/admin/admins/promote` | GET/POST | Lista admin correnti + email da env (`parseAdminEmails`). Promote per email: se utente non registrato → 404 "deve registrarsi prima". Audit `PROMOTE_ADMIN`. |
| **Uso AI** `/admin/ai-usage` | `GET /api/admin/ai-usage` | GET | Costo stimato in € (`estimateCostEur` su `FEATURE_TOKEN_ESTIMATES`, `src/lib/billing/ai-pricing.ts`), % free-user al limite, breakdown per feature (mese corrente), per periodo (ultimi 6 mesi), top 10 utenti per chiamate. |
| **Audit log** `/admin/activity` | `GET /api/admin/activity` | GET | Log azioni paginato, filtri `action` e `actorId`; il viewer (`ActivityLog.tsx`) espande il `payload` JSON. |

**Componenti UI**: `src/components/admin/` — `UsersTable`, `UserDetailDrawer`, `SubscriptionsTable`, `StatsDashboard`, `AdminsManager`, `AiUsagePanel`, `ActivityLog`, `AdminExercisesTable`, `AdminMetricCard`, `ConfirmActionButton`. **Script CLI correlati**: `scripts/` bulk upload video PT (18 video caricati) e cleanup utenti con keep-list.

---

## 17. Visual layer & libreria "wow" (M11 + redesign)

Il redesign "wow" ha introdotto due livelli di componenti visivi, più un design system esteso.

### 17.1 Design system
- **Token OKLCH "energy"** (cool/warm/hot/cold) + utility gradient in `globals.css`; font display **Bowlby One SC** con utility `.text-hero` / `.text-display*`; keyframe `.wow-pulse`.
- **`framer-motion`** installato; primitive centralizzate in `src/components/motion/MotionPrimitives.tsx`: `FadeIn`, `Stagger`/`StaggerItem`, `CardHover`, `PageTransition`, `ScrollReveal`, `ScrollStagger`, `SlideUp`, `RevealMask`, `MagneticHover`, **`CountUp`** (numeri animati), `ParallaxLayer`, `DrawPath`, `useScrollStep` (hook scroll-step). Tutte rispettano `prefers-reduced-motion`.
- **Copy centralizzato**: `src/content/copy.ts` (~1546 righe) è la **single source of truth** per tutte le stringhe UI (marketing, auth, app, admin, legali). Niente più testo hardcoded nei componenti.

### 17.2 Libreria "wow" — `src/components/wow/` (barrel `index.ts`)
Componenti animati in codice puro (SVG/CSS/motion, niente Lottie/video/3D), alimentati da **dati reali** dove esistono:
- **`AdaptiveBodyMap`** — heatmap muscolare "viva" con pulse sui muscoli carenti; **compone** il `BodyMap` di §17.3 (non lo duplica).
- **`ExerciseFormPlayer`** — figura di profilo che esegue l'esercizio con marker sull'errore reale. Motore in `pose/poseEngine.ts` (archetipi testati: squat, hinge; push/pull richiedono nuovi dati pose). Mapping errore→articolazione via `pose/exerciseMapping.ts` (`exerciseToArchetype`, `inferErrorMarker`, `JOINT_LABEL`).
- **`RadialGauge`** / **`AnimatedRing`** — gauge/anelli con draw-on animato.
- **`AnimatedArea`** / **`AnimatedBars`** — grafici area/barre animati.
- **`ScrollExplainer`** — sezione scroll-driven (sticky) che avanza per step.
- **`heat/heatScale.ts`** — logica colore heat condivisa (con test unit `heatScale.test.ts`).

### 17.3 Componenti visualizations — `src/components/visualizations/`
- **`StreakHeatmap`** — heatmap GitHub-style (fino a 52 settimane) con tooltip nativo e legenda; alimentata da `GET /api/me/streak-history` (`{ data, totalDays:365 }`).
- **`BodyMap/`** (`BodyMap.tsx` + `AnatomyFront`/`AnatomyBack`, 12 gruppi muscolari SVG) — 3 modalità **volume / recovery / balance**; alimentata da `GET /api/me/body-map?mode=&days=` (`{ mode, days, data }`; 400 su mode non valido).
- **`GradientMesh`** — background animato solo-CSS.
- **`celebration/AchievementUnlock.tsx`** — provider con `canvas-confetti` per lo sblocco achievement.

### 17.4 Dove è applicato (dati reali)
| Sezione | File | Widget / dato |
|---|---|---|
| Dashboard | `(app)/dashboard/page.tsx` | `StreakHeatmap` (90gg), card "Questa settimana" con `RadialGauge` (sessioni reali su target 7gg), `AdaptiveBodyMap` squilibri, `CountUp` sulle statistiche |
| Esercizi (dettaglio) | `(app)/esercizi/[slug]/page.tsx` | Curva **1RM stimato (Epley)** nel tempo con `AnimatedArea` (record stimato dai carichi loggati) + preview video nelle card libreria |
| Nutrizione | `(app)/nutrizione/page.tsx` | `RadialGauge` calorie giornaliere (dato reale vs target) |
| Progressi | `(app)/progressi/page.tsx` | Contatori `CountUp` + timeline record personali animata |
| Report analisi | `(app)/analisi/report/[id]/page.tsx` | Card "Tecnica ricostruita" con `ExerciseFormPlayer` collegato all'errore reale del report |
| Onboarding | step 1–4 | `OnboardingProgress`: indicatore di progresso animato a 4 step |

### 17.5 Nuove API di supporto (autenticate, non-admin)
| Endpoint | Responso |
|---|---|
| `GET /api/me/streak-history` | `{ data, totalDays: 365 }` — attività aggregata 365gg per la heatmap |
| `GET /api/me/body-map?mode=volume\|recovery\|balance&days=N` | `{ mode, days, data }` (helper `src/lib/body-map.ts`); `days` clampato 1–365; 400 se mode non valido |
| `GET /api/me/last-loads?exerciseIds=a,b,c` | Mappa `exerciseId → ultimo carico`; `{}` se nessun id |
| `POST /api/daily-checkin` | `{ ok, mood }` (Zod-validato; 400 dati non validi) |

---

## 18. Testing, CI & Observability (M12)

### 18.1 Test
- **Unit — Vitest** (`vitest.config.ts`, `environment: node`, include solo `src/**/*.test.ts`): **60 test in 11 file**, verdi (verificato 12 ago 2026; il conteggio è cresciuto da 54/9 con i test su `referenceCompare`/`referenceProfile`). Coprono la logica pura: biomeccanica (`angleCalculator`, `phaseDetector`, `specEvaluator`), pesi analisi (`weights`), orchestrazione vision/final-report (`visionAnalyzer`, `finalReportGenerator` con Anthropic mockato), heat scale. Comandi: `npm run test:unit` (+ `:watch`, `:coverage`).
- **E2E — Playwright** (`playwright.config.ts`): **16 file spec** in `tests/e2e/` (incl. `m10-admin-hub`, `m9-admin-pt-upload`, `smoke`). Girano contro una **build di produzione** (`next start`), non `next dev`. Comandi: `npm run test:e2e` (+ `:ui`, `:headed`, `:debug`).

### 18.2 CI — GitHub Actions (`.github/workflows/ci.yml`)
Su `push` e `pull_request`, due job:
1. **quality**: `npm ci` → `prisma generate` → `tsc --noEmit` → `lint` → `test:unit`.
2. **e2e**: service Postgres 16, `prisma migrate deploy` + `seed` + `build` di produzione, cache browser Playwright, `test:e2e`. Env di test dedicati (secret `ANTHROPIC_API_KEY`). Route rese resilienti a servizi esterni assenti (Upstash/Supabase) per non far cadere gli E2E.

### 18.3 Observability — Sentry (`src/lib/observability.ts`)
API neutra su Sentry, **attiva solo con DSN** (`SENTRY_DSN` server / `NEXT_PUBLIC_SENTRY_DSN` client): senza DSN le chiamate sono no-op e resta il fallback console.
- `captureError(err, context?)`, `captureMessage(message, level)`, `setUserContext(user)`.
- Init in `src/instrumentation.ts` / `src/instrumentation-client.ts` (Next 16). Configurazioni `sentry.*.config.ts`.

---

## 19. Riepilogo modelli AI per endpoint

| Endpoint | Modello | Input | Output | Cache | Rate limit |
|---|---|---|---|---|---|
| `POST /api/ai/generate-plan` | Sonnet 4.6 (stream) | Profilo + few-shot WorkoutPlanTemplate (≤3) + lista esercizi | JSON `{ days[].exercises[] }` | Ephemeral su system prompt | aiRatelimit |
| `POST /api/ai/generate-nutrition-plan` | Sonnet 4.6 | TDEE + macros + few-shot NutritionPlanTemplate (≤2) | JSON `{ weeklyPlan, targetMacros }` | Ephemeral | aiRatelimit |
| `POST /api/ai/chat` | Sonnet 4.6 (stream) | message + history | text streaming | No | aiRatelimit |
| **L1** (locale, no AI) | — | frameHistory + spec + timeline | `{score, triggeredFeedback[], detectedPhases[]}` | — | — |
| **L2** vision utente | Sonnet 4.6 | 8 frame JPEG base64 | `{score, qualitativeAnalysis, visualObservations[], injuryRiskFlags[]}` | Ephemeral | analysisRatelimit |
| **L3** vision compare | Sonnet 4.6 | 12 frame (6 USER + 6 PRO alternati) | `{score, comparisonFeedback, keyDifferences[]}` | Ephemeral | analysisRatelimit |
| **Final report** | Haiku 4.5 | L1+L2+L3 results | `FinalReport` JSON | No | (parte di analysisRatelimit) |
| `POST /api/analysis/upload-video` | — | multipart Blob | `{videoUrl signed 24h, path}` | — | analysisRatelimit (5/h) |

---

## 20. Errori noti, limitazioni, TODO

### ✅ Risolti dopo v1.0 (erano TODO/bloccanti, ora fatti)

- **Test E2E**: suite Playwright presente (16 file spec) e girata in CI contro build di produzione. **Nota**: il singolo giro *manuale* completo *onboarding → piano → workout → analisi → report* con video reale resta la prova consigliata prima del deploy (vedi §8 e "Motion Insight" sotto).
- **Error boundary globale**: `src/app/(app)/error.tsx` **esiste**.
- **PWA**: `public/icon-192.png`, `public/icon-512.png`, `public/manifest.json`, `public/sw.js` **presenti**.
- **Community feed**: ora **interattiva** (post + like + commenti, modello `SocialComment`), non più read-only. Vedi §12 e §21.5.

### 🟡 Ancora aperti / non bloccanti

- **Grafici progressi**: **peso/misure fatti** (`UserProgress` via `/api/progress-entries`) e **trend Form Score** attivo; restano TODO il **trend carichi aggregato** e le foto progressi.
- **Deploy Vercel**: azione utente (account + env vars).
- **`BodyMap.tsx`** ricalcola la logica colore heat invece di importare `wow/heat/heatScale` (micro-refactor).

### ⚠️ Limitazioni runtime note

- **L3 silenzioso su CORS**: l'estrazione client-side di 6 frame dal video PT (`Exercise.videoUrl`) può fallire se il bucket Supabase non ha CORS configurato per `https://your-domain.app`. In quel caso L3 è skippato e il combiner ridistribuisce a `(L1+L2)/2`. Comportamento by-design (graceful degradation), ma riduce l'accuratezza del confronto vs PT.
- **Router TIM Telecom H388X**: fa DNS hijacking trasparente (suffix `homenet.telecomitalia.it`). Workaround: hotspot mobile 4G/5G. Fix definitivo: firmware router o DoH con YogaDNS.
- **Prepared statements pooler**: usare `DIRECT_URL` (session pooler, port 5432) per seed/migrate, `DATABASE_URL` (transaction pooler, port 6543) a runtime. Confondere i due rompe i bulk insert del seed.
- **MediaRecorder codec**: vp9 preferito, ma su Safari macOS può cadere a vp8 o webm puro. Già gestito con catena di fallback.

### Convenzioni nomi che è facile sbagliare

Riportate qui per evitare regressioni:

- **NutritionLog**: `proteinG`/`carbsG`/`fatG`/`fiberG` (NON `protein`/`carbs`/`fat`)
- **User**: `weightKg`/`heightCm` (NON `weight`/`height`)
- **WorkoutSession**: `totalSeconds` (NON `totalDuration`)
- **WorkoutPlanExercise**: `restSeconds`/`durationSeconds` (NON `restBetweenSets`/`duration`)
- **FitnessLevel** ha 4 valori: BEGINNER, INTERMEDIATE, ADVANCED, **ATHLETE** (NON "EXPERT")
- **FitnessGoal**: LOSE_WEIGHT, BUILD_MUSCLE, ATHLETIC_PERFORMANCE (NON WEIGHT_LOSS, MUSCLE_GAIN, STRENGTH)
- **MealType**: solo BREAKFAST/LUNCH/DINNER/SNACK (NON PRE_WORKOUT/POST_WORKOUT)
- **Next.js 16**: `middleware.ts` → `proxy.ts` (export `auth as proxy`)
- **Prisma 7**: importa da `@/generated/prisma` (NON da `@prisma/client`)

---

## 21. Area Utente v2 + Motore + Account Manager (ago 2026)

> Fase costruita sopra al restyling merged (`af8fdac`), committata su `origin/main` (`5ad7b41`, `0f391cc`, `14b79b6`). Passa `tsc`+ESLint; **verifica funzionale loggata non ancora fatta** (richiede `npx prisma db push` + bucket Supabase `user-documents`). Ogni voce sotto è verificata sul codice.

### 21.1 Navigazione v2 (7 sezioni)

`src/components/layout/Navbar.tsx` — nav **copy-driven** da `src/content/copy.ts` (`copy.navbar`):
- **5 principali** (`NAV_ITEMS`): Dashboard (`/dashboard`), La tua sessione (`/allenamento`), Il tuo piano nutrizionale (`/nutrizione`), Libreria (`/esercizi`), Progressi (`/progressi`).
- **Menu** (`MENU_ITEMS`): Community (`/community`), Profilo (`/profilo`).
- **Desktop**: sidebar fissa `w-64` con i 5 principali + separatore + 2 menu + link **Admin** condizionale (`isAdmin`) + card **Premium** (se `!isPremium`) + utente/logout.
- **Mobile**: header con logo + menu ☰ (Community, Profilo, Admin, Esci) + **bottom tab-bar** con i 5 principali.
- **AI Coach non è in nav** (vedi §9).

### 21.2 Onboarding = Quiz

- `src/app/(app)/layout.tsx`: se `!user.onboardingCompleted` → `redirect("/onboarding/quiz")`.
- `src/app/(auth)/onboarding/quiz/page.tsx` renderizza la config da **`GET /api/quiz`** → `QuizConfig` dal DB (`quizConfig`, id `"singleton"`) oppure `DEFAULT_QUIZ` (`src/lib/quiz.ts`, 8 domande: goal, level, place, equipment, days, time, diet, notes).
- All'invio **`POST /api/quiz`** → `mapAnswersToUser()` mappa solo le **chiavi di sistema riconosciute** ai campi utente (`primaryGoal`, `fitnessLevel`, `weeklyWorkoutDays`, `availableEquipment`, `dietType`, `medicalNotes`) + `onboardingCompleted: true`.
- Il vecchio flusso `/onboarding/step1-4` resta nel codice ma non è più l'entry point.

### 21.3 Motore nutrizionale

- **Target**: `src/lib/nutrition-targets.ts` → `computeNutritionTargets()` (Mifflin-St Jeor su `weightKg`/`heightCm`/`age`/`primaryGoal`).
- **Abbinamento pool**: `GET /api/nutrition/match` sceglie un `NutritionPlanTemplate` con priorità **(goal+diet) → goal → qualsiasi**; ritorna nome, descrizione, macro, testo settimanale, rationale. Card `src/app/(app)/nutrizione/NutritionMatchCard.tsx`.
- **Ricette AI**: `POST /api/ai/recipes` (rate-limited via `aiRatelimit`) → Claude `MODELS.DEFAULT` genera 3 ricette in base a goal/diet/target. Card `RecipesCard.tsx`.

### 21.4 Progressi v2

- `GET /api/progressi`: oltre a volume settimanale (8 sett.), sessioni, streak, achievement, ritorna **`formScores`** (trend `combinedScore` dalle `AnalysisSession` completate).
- **Peso/misure**: `GET/POST /api/progress-entries` → modello `UserProgress` (`weightKg`, `measurementWaistCm`, `notes`; POST richiede almeno un valore). Card `WeightMeasuresCard.tsx`.
- Residuo: **trend carichi aggregato** (l'ultimo carico per esercizio è già in `GET /api/me/last-loads`, usato per il prefill in sessione).

### 21.5 Community interattiva

- **`GET /api/community/feed`**: post di utenti `profileVisibility: "PUBLIC"`, ordine desc, **paginazione a cursor** (`limit` max 50); ogni item con `likedByMe` e `commentsCount`.
- **`POST /api/community/posts`**: crea `SocialPost` (`type: WORKOUT_SHARE`, `content` ≤ 1000).
- **Like**: `/api/community/posts/[id]/like` (`SocialLike`). **Commenti**: `/api/community/posts/[id]/comments` (`SocialComment`, nuovo modello v2).
- Non ancora esposti: sfide/classifiche (`Challenge`, `ChallengeParticipant`).

### 21.6 Profilo v2

- **Note mediche**: `medicalNotes` (testo libero) via `/api/profilo`.
- **Documenti**: `GET/POST/DELETE /api/documents` → `UserDocument` (`kind` FITNESS|NUTRITION, max 10MB, PDF/JPEG/PNG/WebP) su bucket Supabase **`user-documents`** (privato, download via **signed URL** 1h lato server). Card `src/components/DocumentsCard.tsx`. ⚠️ Solo storage: **nessun parsing/adattamento AI** del contenuto (residuo).
- **Richiesta revisione**: `POST /api/revision-requests` → `RevisionRequest` (`type` FITNESS|NUTRITION, `message` 3–2000). Form `src/components/RevisionRequestForm.tsx`.
- Card **abbonamento** + **quiz ripetibile**.

### 21.7 Account Manager (admin)

Pattern comune: **config/modello in DB → API admin (`requireAdmin`, `src/lib/admin.ts`) → editor UI in `/admin/...` → le pagine utente leggono dal DB** (una modifica si riflette su tutti).

| Sezione | Pagina | API | Modello |
|---|---|---|---|
| Quiz | `/admin/quiz` | `GET/PUT /api/admin/quiz` | `QuizConfig` (singleton) |
| Revisioni | `/admin/revisions` | `GET/PATCH /api/admin/revisions` (status PENDING/REVIEWED) | `RevisionRequest` |
| Pool nutrizionale | `/admin/nutrition-plans` | `GET/POST/DELETE /api/admin/nutrition-plans` | `NutritionPlanTemplate` |
| Nuovo esercizio | `/admin/exercises/new` | `POST /api/admin/exercises` | `Exercise` + spec biomeccaniche |
| Tag/note esercizi | `/admin/exercises/tags` | `/api/admin/exercises/[id]/tags` | `Exercise.tags`/`professionalNotes` |

Il form "Nuovo esercizio" include **video PT esecuzione + spiegazione** (`videoUrl`/`explanationVideoUrl`), copy, muscoli/difficoltà/categoria/attrezzatura, durate, tag e **trigger biomeccanici** (JSON → spec nidificata `Movement→Phase→Trigger`).

### 21.8 Nuovi modelli Prisma v2

`User.medicalNotes`, `Exercise.explanationVideoUrl`, `RevisionRequest`, `QuizConfig`, `SocialComment`, `UserDocument` (+ enum `DocumentKind`), uso attivo di `UserProgress`. ⚠️ Presenti nello schema ma **richiedono `npx prisma db push`**; l'upload documenti richiede il **bucket Supabase `user-documents`**.

### 21.9 Residui noti (v2)

- Parsing/adattamento AI dei documenti caricati (solo storage oggi).
- Trend carichi aggregato in Progressi.
- Account Manager: editor "modifica esercizio esistente" e "modifica pool nutrizionale"; template piani fitness CRUD; `SiteContent` per copy editabili senza deploy.
- Verifica funzionale loggata di tutti i flussi (mai eseguita).

---

## Documenti di riferimento collegati

- `ANALYSIS_SPEC.md` — spec autoritativa Analisi v2 (formato I/O dei 3 livelli, esempi struttura `BiomechanicalSpec`)
- `ROADMAP.md` — task tracking esecutivo (Fase 1–6, owner Claude Code / Antigravity)
- `STATO_PROGETTO.md` — overview con timeline sessioni
- `README.md` — documentazione utente
- `~/.claude/projects/.../memory/MEMORY.md` — memoria di progetto autoaggiornata

---

*Fine documento. Per domande specifiche su un flusso, partire dal file `path:line` riferito e leggere il codice — gli snippet qui sono distillati per leggibilità ma il sorgente resta l'autorità.*
