# FitAI — Analisi Riassuntiva del Codice

## Contesto
Documento richiesto dall'utente per avere una vista d'insieme del progetto FitAI: cosa è stato costruito, come si compone, quali sono i flussi operativi e in dettaglio come funziona la **funzionalità principale di analisi** (l'analisi triplice di sessioni di allenamento). Non è un piano di implementazione: è un'analisi del codice esistente, utile come riferimento per le prossime sessioni.

Stato del progetto: ~85% strutturalmente completo. Bug critici chiusi nella sessione del 30 aprile 2026. Il codice è in `C:\Users\maste\OneDrive\File\APP FITNESS CLAUDE CODE`.

---

## 1. Stack tecnologico

**Framework / runtime**
- **Next.js 16.2.4** (App Router, React 19.2.4) — con la breaking change importante: `middleware.ts` è stato rinominato in `proxy.ts`
- **TypeScript 5**, **Tailwind 4**

**Backend / DB**
- **Prisma 7.8** (`prisma/schema.prisma`) su PostgreSQL (Supabase)
- **NextAuth v5 beta.31** con `@auth/prisma-adapter` — JWT session, Google OAuth + Credentials (bcryptjs)
- **Upstash Redis + Ratelimit** per throttling

**AI**
- **Anthropic SDK 0.91.1** — modelli usati: Sonnet 4.6 (default/powerful) e Haiku 4.5 (fast)
- Prompt cache `ephemeral` per i system prompt riutilizzati

**Frontend / state**
- **Zustand 5** — store: `workoutStore`, `analysisStore`
- **React Query 5** — server state
- **React Hook Form + Zod** — form & validazione
- **Radix UI** (~15 componenti) + **Tailwind**, **Framer Motion**, **Recharts**, **Lucide**

**Altro**
- **web-push** (PWA notifications)
- **Pose detection**: hook `usePoseDetection.ts` collegato a QuickPose (deprecato — da sostituire)

---

## 2. Struttura del progetto (App Router)

```
src/app/
├── (auth)/                      # rotte non autenticate
│   ├── login/
│   ├── registrati/
│   └── onboarding/
│       ├── page.tsx             # redirect → step1
│       ├── onboardingState.ts   # helper sessionStorage
│       └── step1..step4/
├── (app)/                       # rotte autenticate (layout fa auth check + redirect onboarding)
│   ├── dashboard/
│   ├── allenamento/
│   │   ├── [id]/                # dettaglio piano + sessione live
│   │   └── genera-ai/           # generazione piano AI
│   ├── analisi/
│   │   ├── page.tsx             # lista analisi
│   │   ├── sessione/page.tsx    # capture video + pose + voice coach
│   │   └── report/[id]/page.tsx # report combinato 3 score
│   ├── esercizi/
│   ├── ai-coach/
│   ├── nutrizione/
│   ├── progressi/
│   ├── profilo/
│   └── community/
└── api/                         # tutti gli endpoint REST
```

---

## 3. API routes (panoramica)

| Endpoint | Metodi | Funzione |
|---|---|---|
| `/api/auth/register` | POST | Registrazione (bcrypt) |
| `/api/auth/[...nextauth]` | * | NextAuth handler |
| `/api/onboarding` | POST | Salva profilo + `onboardingCompleted=true` |
| `/api/exercises` | GET | Lista esercizi (slug→id map) |
| `/api/ai/chat` | POST | Chat streaming (Haiku, RL 10/min) |
| `/api/ai/generate-plan` | POST | Streaming generazione piano (Sonnet + cache) |
| `/api/workout-plans` (+`[id]`) | GET/POST/PATCH/DELETE | CRUD piani |
| `/api/workout-sessions` | POST/PATCH | CRUD sessioni — **PATCH dispatch achievement unlock** |
| `/api/analysis/start` | POST | Crea `AnalysisSession` (RL 5/h) |
| `/api/analysis/biomechanical` | POST | Push frame keypoint |
| `/api/analysis/complete` | POST | **Orchestrazione triplice analisi** |
| `/api/analysis/[id]/report` | GET | Report combinato |
| `/api/gamification/achievements` | GET | Lista + unlock status |
| `/api/progressi` | GET/POST | Misure corporee |
| `/api/nutrition` | GET/POST | Log macro/calorie |
| `/api/profilo` | GET/PATCH | User profile |

**Rate limiting** (`src/lib/redis.ts`): 3 limiter — `aiRatelimit` 10/min, `analysisRatelimit` 5/h, `generalRatelimit` 100/min.

---

## 4. Schema dati (Prisma — punti salienti)

**Enum chiave**
- `FitnessGoal`: LOSE_WEIGHT, BUILD_MUSCLE, ENDURANCE, FLEXIBILITY, GENERAL_FITNESS, ATHLETIC_PERFORMANCE
- `Equipment`: NONE, DUMBBELLS, BARBELL, MACHINE, RESISTANCE_BANDS, PULL_UP_BAR, BENCH, KETTLEBELL, CABLES, FULL_GYM
- `AnalysisStatus`: RECORDING → PROCESSING → COMPLETED / ERROR
- `SessionStatus`: IN_PROGRESS, COMPLETED, CANCELLED
- `AchievementRarity`: COMMON, RARE, EPIC, LEGENDARY

**Model centrali**
- **User** — profilo, metriche (peso/altezza/età), `fitnessLevel`, `primaryGoal`, `streak`, `totalPoints`, `onboardingCompleted`
- **Exercise** — libreria (~25 esercizi seed) con muscoli target, `professionalNotes`, calorie/min, relazione → `BiomechanicalThreshold[]`
- **BiomechanicalThreshold** — `jointName`, `minAngle`, `maxAngle`, `severity` (WARNING/ERROR/CRITICAL), `feedbackOnViolation`
- **WorkoutPlan / WorkoutPlanDay / WorkoutPlanExercise** — gerarchia piano (campi Prisma `restSeconds`, `durationSeconds`)
- **WorkoutSession / WorkoutSessionExercise** — tracking esecuzione
- **AnalysisSession** — il cuore dell'analisi triplice (vedi §5)
- **Achievement / UserAchievement** — gamification (chiavi seed: `first_workout`, `ten_workouts`, `fifty_workouts`, `week_streak`, `month_streak`, `early_bird`, `nutrition_tracker`, `perfect_form`, `ai_plan`, `first_analysis`)
- **UserProgress, NutritionLog, Challenge, SocialPost, Notification, WearableIntegration** — feature secondarie

---

## 5. Funzionalità principale: l'analisi triplice (in dettaglio)

L'utente filma un esercizio (max 90s). Tre pipeline producono ognuna uno score 0–100 e un feedback; alla fine viene calcolato un punteggio combinato pesato.

### 5.1 Flusso end-to-end

```
[Client — pagina /analisi/sessione]
   ├─ camera + video professionale side-by-side
   ├─ POST /api/analysis/start  → crea AnalysisSession (RECORDING)
   │                              risposta include thresholds dell'esercizio
   ├─ requestAnimationFrame loop (30 fps):
   │     QuickPose.detectPose(video) → keypoints
   │     computeJointAngles(keypoints) → angoli giunture
   │     checkThresholds(angles, thresholds) → ThresholdViolation[]
   │     analysisStore.addFrame({ ts, keypoints, angles, violations })
   │     skeleton overlay (giunti rossi se in violazione)
   │     voice coach: speak() top violation
   ├─ stop manuale o timer 90 s
   └─ POST /api/analysis/complete { analysisSessionId, frameHistory, durationSeconds }
                 │
[Server — src/app/api/analysis/complete/route.ts:14]
   ├─ auth + Zod validate (route.ts:15-20)
   ├─ load AnalysisSession + exercise (route.ts:22-26)
   ├─ status PROCESSING (route.ts:28)
   ├─ flatten violations + dedup (route.ts:30-32)
   ├─ Task A — sync, biomeccanica:
   │    bioScore = calculateBiomechanicalScore(violations, frameCount)   route.ts:35
   │    bioFeedback = top-5 messaggi unici                                route.ts:36
   ├─ Task B + Task C — Promise.all (route.ts:39-52):
   │    aiReport = analyzeExerciseWithAI({...})           ← Claude Sonnet
   │    videoReport = analyzeVideoComparison({...})       ← Claude Haiku
   ├─ combinedScore = round(bio*0.33 + ai*0.33 + video*0.34)              route.ts:54
   └─ UPDATE AnalysisSession con tutti i campi → COMPLETED                route.ts:56-72
                 │
[Client] → redirect /analisi/report/[id]
```

### 5.2 Le tre analisi — cosa fa ognuna

**Task A — Biomeccanica** (`src/services/biomechanical/poseAnalyzer.ts`)
- Sincrono, server-side, lavora sui frame già accumulati dal client.
- `calculateBiomechanicalScore(violations, totalFrames)`: pesa CRITICAL=3, ERROR=2, WARNING=1; `score = max(0, 100 − (totalWeight / totalFrames) × 10)`.
- `checkThresholds()` (usata client-side dall'hook) confronta `currentAngle` con `[minAngle, maxAngle]` per ciascun giunto.

**Task B — AI Expert** (`src/services/ai/exerciseAnalyzer.ts → analyzeExerciseWithAI`)
- Modello: **Claude Sonnet 4.6**, prompt system con `cache_control: ephemeral`.
- Sotto-campiona i frame (1 ogni 6 → ~5 fps) e li riassume in angoli articolari medi.
- Input: `exerciseName`, `professionalNotes`, keypointSummary, lista violations.
- Output: `AIExpertReport { score, mainAnalysis, top3Improvements[], strengths[], injuryRisk }`.

**Task C — Video Comparison** (`analyzeVideoComparison`)
- Modello: **Claude Haiku 4.5** (più veloce / economico).
- Input: angoli utente vs angoli professionista per ciascun giunto, calcola delta.
- Output: `VideoComparisonReport { score, feedback, keyDifferences[] }`.
- **Nota**: in `route.ts:49-51` è chiamato con `userAngles: {}, proAngles: {}` — al momento gli angoli pro non sono pre-calcolati nel DB, andrà popolato.

### 5.3 Persistenza (`AnalysisSession`)

Un singolo `prisma.analysisSession.update()` scrive 11 campi (route.ts:56-72):
- `status=COMPLETED`, `completedAt`
- `biomechanicalScore` + `biomechanicalFeedback` (Json[])
- `aiExpertScore` + `aiExpertFeedback` (Text)
- `videoComparisonScore` + `videoComparisonFeedback` (Text)
- `combinedScore` + `combinedReport` (string template)
- `improvementAreas` (top-3 dall'AI Expert)
- `positiveAspects` (strengths dall'AI Expert)

### 5.4 Visualizzazione (report)

`src/app/(app)/analisi/report/[id]/page.tsx`:
- Card principale con `combinedScore` (font 6xl) + breakdown 33/33/34
- Card AI Expert (mainAnalysis)
- Improvement areas (badge gialli) — strengths (check verdi)
- Top-5 violazioni biomeccaniche (badge blu)
- Confronto col professionista

---

## 6. Altri flussi operativi

### 6.1 Onboarding (4 step + generazione piano)

`step4/page.tsx` orchestra in sequenza:
1. `POST /api/onboarding` → salva profilo, set `onboardingCompleted=true`
2. `POST /api/ai/generate-plan` (streaming) → Claude restituisce piano JSON con `exerciseSlug`
3. `GET /api/exercises` → mappa slug→id
4. `POST /api/workout-plans` → salva il piano tradotto (campi Prisma corretti: `restSeconds`, `durationSeconds`)
5. Redirect `/dashboard`

Il layout `(app)/layout.tsx` controlla `onboardingCompleted` e rimanda a `/onboarding` se mancante.

### 6.2 Sessione di allenamento

- `workoutStore` (Zustand): sessionId, esercizio corrente, set completati, rest timer, elapsed.
- Pagina `(app)/allenamento/[id]/sessione/page.tsx` consuma lo store.
- A fine sessione → `PATCH /api/workout-sessions` con `status=COMPLETED` → triggera achievement unlock.

### 6.3 Achievement unlock automatico

In `api/workout-sessions/route.ts` (PATCH), dopo il completamento viene chiamato `checkAndUnlockAchievements(userId, { currentStreak })`:
- Itera le condition JSON degli achievement, sblocca quelli soddisfatti
- Crea `UserAchievement` + incrementa `User.totalPoints`
- Tutto in una transazione Prisma
- Chiavi automatiche: `first_workout`, `ten_workouts`, `fifty_workouts`, `week_streak`, `month_streak`, `early_bird` (sessione iniziata < 7:00).

---

## 7. Auth & sicurezza

- `src/lib/auth.ts` — NextAuth v5: Credentials (bcrypt) + Google OAuth, JWT session, callback arricchisce `session.user.id`.
- `src/proxy.ts` (ex middleware) — `export { auth as proxy }`, matcher su `/dashboard`, `/allenamento`, `/analisi`, ecc.
- Ogni handler API verifica `session?.user?.id` e cast `as string` (fix BUG #5).
- Rate limit Upstash su endpoint AI e analisi.

---

## 8. Cose da sapere prima di metterci mano

**Bug aperti (dal STATO_PROGETTO.md)**
- **BUG #6** — `src/lib/prisma.ts` usa `require()` come workaround; dopo `npx prisma generate` ripristinare `import { PrismaClient } from "@prisma/client"`.
- **BUG #7** — `analisi/sessione/page.tsx` ha closure stale di `stopAnalysis` nel timer → convertire a `useRef`.
- **Pose detection** — `usePoseDetection.ts` importa `@quickpose/quickpose-ts-client` (deprecato). Da sostituire (candidati: MediaPipe Tasks Vision, TensorFlow.js MoveNet/BlazePose).

**Task aperti prioritari**
1. Setup DB: riempire `.env.local`, `npx prisma generate && npx prisma migrate dev --name init && npx prisma db seed`, poi ripristinare `prisma.ts`.
2. Sostituire SDK pose detection.
3. Test E2E: registrazione → onboarding → piano AI → sessione → analisi → report.
4. Fix BUG #7.
5. Verificare che `src/app/api/ai/chat/route.ts` esista e funzioni.
6. PWA icons + Vercel deploy.

**Convenzioni che è facile sbagliare**
- Next.js 16: `middleware.ts` è deprecato → usa `proxy.ts`.
- AGENTS.md ricorda di leggere `node_modules/next/dist/docs/` prima di scrivere codice (Next è custom in questo progetto).
- I campi Prisma per gli esercizi sono `restSeconds` / `durationSeconds` (non `restBetweenSets` / `duration`).
- L'enum `FitnessGoal` usa `LOSE_WEIGHT` / `BUILD_MUSCLE` / `ATHLETIC_PERFORMANCE` (non `WEIGHT_LOSS` / `MUSCLE_GAIN` / `STRENGTH`).
- Il modello `Achievement` ha campi `key` e `points` (non `slug` / `pointsReward`).

---

## 9. File critici da tenere a mente

| Area | File |
|---|---|
| Orchestrazione analisi triplice | `src/app/api/analysis/complete/route.ts` |
| Servizio AI Expert + Video Comparison | `src/services/ai/exerciseAnalyzer.ts` |
| Servizio biomeccanico | `src/services/biomechanical/poseAnalyzer.ts` |
| Hook pose detection (client) | `src/hooks/usePoseDetection.ts` |
| Pagina capture | `src/app/(app)/analisi/sessione/page.tsx` |
| Pagina report | `src/app/(app)/analisi/report/[id]/page.tsx` |
| Schema DB | `prisma/schema.prisma` |
| Seed (esercizi + thresholds + achievement) | `prisma/seed.ts` |
| Onboarding step finale | `src/app/(auth)/onboarding/step4/page.tsx` |
| Generazione piano AI | `src/app/api/ai/generate-plan/route.ts` + `src/app/(app)/allenamento/genera-ai/page.tsx` |
| Achievement engine | `src/lib/achievements.ts` (`checkAndUnlockAchievements`) |
| Auth | `src/lib/auth.ts`, `src/proxy.ts` |
| Rate limiting | `src/lib/redis.ts` |
| Stato attuale + bug | `STATO_PROGETTO.md` |

---

## Verifica

Questo è un documento di analisi: nessun codice da verificare. Per validare il contenuto:
1. Aprire `STATO_PROGETTO.md` per confermare gli stati di avanzamento.
2. Aprire `src/app/api/analysis/complete/route.ts` per riconoscere il flusso descritto in §5.
3. Aprire `prisma/schema.prisma` ai model `AnalysisSession` e `BiomechanicalThreshold` per i campi citati.
