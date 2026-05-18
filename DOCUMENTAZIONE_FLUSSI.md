# FitAI — Documentazione Flussi e Architettura

*Versione 1.0 — 14 maggio 2026 (sessione 7)*

Documento di riferimento per sviluppatori e nuovi agenti che entrano nel progetto. Mappa ogni sezione dell'app, le sue funzionalità e i flussi end-to-end. Per ogni claim sono indicati i path dei sorgenti.

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
15. [Riepilogo modelli AI per endpoint](#15-riepilogo-modelli-ai-per-endpoint)
16. [Errori noti, limitazioni, TODO](#16-errori-noti-limitazioni-todo)

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
| `AnalysisSession` | Sessione di analisi video (`l1Result/l2Result/l3Result/finalReport` Json + `combinedScore`) |
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

### Dashboard

`src/app/(app)/dashboard/page.tsx` — server component. Carica in parallelo:

```typescript
const [user, activePlan, recentSessions, achievements] = await Promise.all([
  prisma.user.findUnique({ select: { name, currentStreak, totalPoints, longestStreak } }),
  prisma.workoutPlan.findFirst({ where: { userId, isActive: true }, include: { days: { include: { exercises } } } }),
  prisma.workoutSession.findMany({ where: { userId, status: "COMPLETED" }, take: 5 }),
  prisma.userAchievement.findMany({ where: { userId }, take: 3 }),
]);
```

UI mostra:
- **Stats grid 4 colonne**: streak, sessioni questa settimana, punti totali, record streak
- **Piano attivo**: card con progress bar settimanale + primi 3 giorni
- **Sessioni recenti**: ultime 5 con data + durata
- **Quick actions 3 link**: `/analisi`, `/ai-coach`, `/esercizi`
- **Achievement recenti**: ultimi 3 con punti

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

### 7.3 Dettaglio piano

`src/app/(app)/allenamento/[id]/page.tsx` — server component. Carica con `prisma.workoutPlan.findFirst` + include giorni + esercizi ordinati. Mostra:

- Metadati: nome, badge Attivo/AI, durata, workouts/week, tempo stimato (~4 min per esercizio)
- Lista giorni: dayNumber, name, badge restDay
- Per ogni giorno: esercizi numerati con muscolo primario, sets×reps (o durationSeconds), restSeconds, badge difficoltà
- Pulsante "Inizia" → `/allenamento/{id}/sessione?day={dayId}`

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

---

## 8. Analisi v2 — il flusso centrale

Il cuore tecnico di FitAI. Il sistema analizza un video di 15–25s dell'utente con **3 livelli paralleli** (biomeccanica locale + 2 vision AI), e produce un report unico ponderato.

### 8.1 Pagina sessione

`src/app/(app)/analisi/sessione/page.tsx` — state machine:

```
IDLE → COUNTDOWN_15S → RECORDING → UPLOADING → ANALYZING → COMPLETED | ERROR
```

- **IDLE**: carica metadata esercizio via `/api/analysis/start`, mostra video PT + camera, button "Inizia"
- **COUNTDOWN (15s)**: `CountdownCircle` SVG; **in parallelo** chiama `extractProFrames(exercise.videoUrl, 6)` che usa un canvas off-screen per estrarre 6 frame dal video PT (operazione best-effort, fallisce silenziosamente su CORS)
- **RECORDING**: 
  - `MediaRecorder` con codec `video/webm;codecs=vp9` → fallback vp8 → fallback webm puro
  - Durata `exercise.recordingDurationSeconds` (15/20/25s a seconda dell'esercizio)
  - Intervallo `(duration * 1000) / 8` ms: ogni tick estrae uno snapshot via canvas `captureFrame(video)` → JPEG base64 → push in `userFramesRef` con label `t=Xs`
  - `usePoseDetection({ enabled: true, silent: true })` accumula `frameHistory` e `worldFrameHistory` in store (no skeleton, no voce, no feedback live)
- **UPLOADING**: stop MediaRecorder → Blob → `FormData` con `video` + `analysisSessionId` → `POST /api/analysis/upload-video` → riceve `{ videoUrl, path }`
- **ANALYZING**: `POST /api/analysis/complete` con `{ analysisSessionId, frameHistory, userFrames, proFrames, durationSeconds }`. Polling stato durante l'attesa.
- **COMPLETED**: `router.push('/analisi/report/{id}')`

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

`src/app/(app)/analisi/report/[id]/page.tsx`. Server component.

- Hero: anello SVG `r=45` con `stroke-dashoffset = 282.74 * (1 - combined/100)`, score grande al centro
- Card "Giudizio del Coach" (overallJudgment)
- Banner `injuryRiskAlert` colorato (solo se level ≠ BASSO)
- Lista numerata "Migliora prima di tutto" (prioritizedImprovements)
- Lista check "Punti di forza" (positiveAspects)
- Componente `<AnalysisDetails>` espandibile con 3 tabs interni (L1 score+trigger, L2 osservazioni vision, L3 differenze chiave)
- Componente `<VideoSyncPlayer>` con play/pause sincronizzati utente vs PT

Empty states gestiti da `<ReportSkeleton>` (durante PROCESSING) e `<ReportError>` (se status=ERROR).

---

## 9. AI Coach (chat)

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

`src/app/(app)/community/page.tsx` — **placeholder**. Card con Construction icon + testo "Prossimamente — Feed social, sfide, classifiche e condivisione progressi in arrivo!".

Schema DB pronto per implementazione futura:
- `SocialPost` con types: WORKOUT_SHARE, ACHIEVEMENT, PROGRESS_PHOTO, CHALLENGE_COMPLETION
- `SocialLike` (unique su `[postId, userId]`)
- `Challenge` con `target` Json + `reward` Json
- `ChallengeParticipant` con `currentProgress` Json

---

## 13. Profilo

`src/app/(app)/profilo/page.tsx` — client component. `GET /api/profilo` ritorna:

```typescript
{
  name, email,
  fitnessLevel, primaryGoal,
  age, weightKg, heightCm,
  totalPoints, currentStreak, longestStreak
}
```

UI:
- Stats 3 card (punti / streak / record streak)
- Account info (avatar, nome, email, badges level + goal)
- Edit form: name, age (10–99), weight (30–300), height (100–250) → `PATCH /api/profilo`
- Logout button → `signOut({ callbackUrl: "/" })`

`PATCH` con Zod accetta solo i campi modificabili (anche `fitnessLevel`/`primaryGoal`).

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

## 15. Riepilogo modelli AI per endpoint

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

## 16. Errori noti, limitazioni, TODO

### 🔴 Bloccante per consegna

- **Test E2E (Fase 6.1)** — flusso completo *onboarding → genera piano → workout → analisi → report* mai eseguito end-to-end con DB up.

### 🟡 Polishing v1 non bloccanti

- **Community feed**: `(app)/community/page.tsx` è placeholder. Schema DB pronto.
- **Grafici progressi**: `(app)/progressi/page.tsx` ha già BarChart e LineChart con recharts. Eventuali estensioni (peso corporeo trend, foto progressi) sono TODO.
- **PWA icons**: `public/icon-192.png`, `public/icon-512.png` mancanti.
- **Error boundary globale**: `src/app/(app)/error.tsx` non esiste. Toaster ok.
- **Service worker offline**: `public/sw.js` da creare + registrazione in `providers.tsx`.
- **Deploy Vercel**: bloccato da account utente + env vars.

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

## Documenti di riferimento collegati

- `ANALYSIS_SPEC.md` — spec autoritativa Analisi v2 (formato I/O dei 3 livelli, esempi struttura `BiomechanicalSpec`)
- `ROADMAP.md` — task tracking esecutivo (Fase 1–6, owner Claude Code / Antigravity)
- `STATO_PROGETTO.md` — overview con timeline sessioni
- `README.md` — documentazione utente
- `~/.claude/projects/.../memory/MEMORY.md` — memoria di progetto autoaggiornata

---

*Fine documento. Per domande specifiche su un flusso, partire dal file `path:line` riferito e leggere il codice — gli snippet qui sono distillati per leggibilità ma il sorgente resta l'autorità.*
