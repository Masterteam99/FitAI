# FitAI — Stato del Progetto
*Aggiornato: 14 maggio 2026 (sessione 7 — documentazione flussi completata)*

> **⚠️ IMPORTANTE**: l'Analisi v2 è **implementata e funzionante** (Fasi 1–5 chiuse). La spec autoritativa resta in `ANALYSIS_SPEC.md` (root). Per una vista panoramica di TUTTI i flussi dell'app (auth, onboarding, allenamento, analisi, nutrizione, progressi, infrastruttura) fare riferimento a **`DOCUMENTAZIONE_FLUSSI.md`** (root), che è il documento di onboarding sviluppatori.

---

## 📌 Stato attuale in una riga

**APP FUNZIONANTE su `http://localhost:3000`.** Build clean, typecheck a zero errori, DB Supabase migrato e seedato, tutte le fasi 1–5 della rifondazione Analisi v2 completate. Manca solo il test E2E (Fase 6.1) e il polishing v1 (PWA icons, error boundary, community/progressi UI placeholder, deploy Vercel).

---

## ✅ COMPLETATO IN QUESTA SESSIONE (sessione 7, 14 maggio 2026)

### Documentazione sviluppatori
- Creato **`DOCUMENTAZIONE_FLUSSI.md`** (root, ~5400 parole): documento di riferimento navigabile (TOC + 16 sezioni) che descrive ogni parte dell'app — panoramica, schema dati completo, auth, onboarding, dashboard, esercizi, allenamento, **analisi v2** (con il dettaglio dei 3 livelli L1/L2/L3 + final report), AI coach, nutrizione, progressi, community, profilo, infrastruttura supportiva, riepilogo modelli AI per endpoint, errori noti e convenzioni nomi.
- Pensato come "point of entry" per chiunque (nuovo agente, nuovo sviluppatore, l'utente stesso che torna dopo settimane).

## ✅ COMPLETATO IN SESSIONI PRECEDENTI

### Sessione 6 (12 maggio 2026) — Cleanup Fase 5.1 + setup DB

**Fase 5.1 — Cleanup post Analisi v2:**
- Migrate le query UI/API da `BiomechanicalThreshold` (v1) a `ExerciseBiomechanicalSpec` (v2) in `api/exercises`, `(app)/analisi/page.tsx`, `(app)/esercizi/page.tsx`, `(app)/esercizi/[slug]/page.tsx`.
- Report page `(app)/analisi/report/[id]/page.tsx` ora legge esclusivamente da `l1Result/l2Result/l3Result/finalReport` JSON. Niente più dipendenza da campi legacy.
- Rimossi 9 campi DEPRECATED dal modello `AnalysisSession` + blocco legacy in `api/analysis/complete/route.ts`.
- Eliminato modello Prisma `BiomechanicalThreshold` + relazione su `Exercise`.
- Eliminati file orfani: `services/ai/exerciseAnalyzer.ts`, `services/biomechanical/poseAnalyzer.ts`, `hooks/useVoiceCoach.ts`, endpoint `api/analysis/biomechanical/route.ts`.
- Pulite interfacce TS obsolete in `src/types/analysis.ts`.
- Rimossa colonna morta `User.healthConditions` (rimpiazzata da `pastInjuries`).
- Pulito `prisma/seed.ts` (no più `thresholds:[...]` nei literal, no più loop `biomechanicalThreshold`).

**Setup DB Supabase:**
- Regione progetto: `eu-west-3` (Parigi), pooler IPv4 attivo.
- `.env.local`: `DATABASE_URL` su transaction pooler (port 6543) per runtime, `DIRECT_URL` su session pooler (port 5432) per migrate/seed.
- Migrazione Prisma 7.x: driver adapter `@prisma/adapter-pg` obbligatorio, client generato in `src/generated/prisma/`, URL spostate da `schema.prisma` a `prisma.config.ts`.
- `npx prisma migrate dev` + `npx prisma db seed` eseguiti con successo.
- Typecheck `npx tsc --noEmit` pulito (zero errori). Dev server avviato in <1s.

### Sessioni precedenti (1–5) — Riassunto

### Fix bug critici (sessione 2-3)
- **BUG #1, #2, #3** — `genera-ai/page.tsx`: aggiunto layer di traduzione che fetcha `/api/exercises`, costruisce mappa `slug → id`, e converte ogni `exerciseSlug` in `exerciseId`. Iniettato `primaryGoal` nel payload. Allineati i nomi dei campi a Prisma (`restSeconds`/`durationSeconds`).
- **BUG #4** — Migrato `src/middleware.ts` → `src/proxy.ts` (Next.js 16 ha rinominato `middleware` in `proxy`). Matcher corretto con percorsi reali (no più route group `(app)`).
- **BUG #5** — Aggiunto `const userId = session.user.id as string;` dopo il guard in tutti gli handler di `workout-sessions/route.ts`.
- **Bug nascosto trovato e fixato** — l'API `workout-plans` usava nomi Zod (`restBetweenSets`/`duration`) diversi dai campi Prisma (`restSeconds`/`durationSeconds`). La create Prisma sarebbe fallita a runtime. Allineato tutto a Prisma in: `api/workout-plans/route.ts`, `(app)/allenamento/[id]/page.tsx`, `(app)/allenamento/[id]/sessione/page.tsx`.
- **Bug nascosto FitnessGoal** — `genera-ai/page.tsx` usava valori non presenti nell'enum Prisma (WEIGHT_LOSS, MUSCLE_GAIN, STRENGTH). Sostituiti con `LOSE_WEIGHT`, `BUILD_MUSCLE`, `ATHLETIC_PERFORMANCE`.

### Achievement unlock automatico
- In `api/workout-sessions/route.ts` PATCH, dopo `status: COMPLETED`, viene chiamata `checkAndUnlockAchievements(userId, { currentStreak })`.
- Sblocca automaticamente: `first_workout`, `ten_workouts`, `fifty_workouts`, `week_streak`, `month_streak`, `early_bird` (se < 7:00).
- Incrementa `totalPoints` con la somma dei punti degli achievement sbloccati. Tutto in una transazione.

### Onboarding 4-step
- `src/app/(auth)/onboarding/page.tsx` — redirect a step1
- `src/app/(auth)/onboarding/onboardingState.ts` — helper sessionStorage
- `src/app/(auth)/onboarding/step1/page.tsx` — obiettivo + livello (4 livelli incluso ATHLETE)
- `src/app/(auth)/onboarding/step2/page.tsx` — attrezzatura (10 opzioni allineate enum Prisma)
- `src/app/(auth)/onboarding/step3/page.tsx` — età/peso/altezza/genere/giorni
- `src/app/(auth)/onboarding/step4/page.tsx` — riepilogo + chiama POST `/api/onboarding`, poi streaming generate-plan, poi salva piano e redirect a `/dashboard`
- `src/app/api/onboarding/route.ts` — POST: valida e salva profilo, setta `onboardingCompleted: true`
- `(app)/layout.tsx` — controlla `onboardingCompleted` e redirige a `/onboarding` se false

### Migrazione Next.js 16
- Eliminato `src/middleware.ts`, creato `src/proxy.ts` con `export { auth as proxy }`. Funzione `auth` di NextAuth è agnostica al naming.

### Sessione 3 — sostituzione SDK + cleanup
- **QuickPose → MediaPipe**: installato `@mediapipe/tasks-vision`, rinominato `lib/quickpose.ts` → `lib/pose.ts`, riscritto `usePoseDetection.ts`. Logica biomeccanica invariata.
- **Verificato `api/ai/chat`** funzionante (auth + rate limit + streaming Claude).
- **Cleanup dead code**: rimosso `services/biomechanical/thresholds.ts` (128 righe duplicate del seed). Disinstallato `framer-motion` (mai usato).
- **BUG #7 chiuso** (era già fixato) + cleanup correlati (timer + camera unmount, guard double-stop).

---

## 🐛 BUG/ATTENZIONI APERTI

Tutti i bug critici precedenti sono CHIUSI:

- ~~**BUG #1–5**~~: ✅ chiusi sessione 2–3 (slug→id translation, primaryGoal injection, middleware→proxy, userId guard, workout-plans field naming).
- ~~**BUG #6 (setup)**~~: ✅ chiuso implicitamente con Prisma 7. Il client ora si importa da `@/generated/prisma` con adapter `PrismaPg`; non c'è più alcun `require()` da ripristinare.
- ~~**BUG #7 (minore)**~~: ✅ chiuso sessione 3 (camera unmount + double-stop guard).
- ~~**Pose detection SDK**~~: ✅ chiuso sessione 3. QuickPose sostituito con **MediaPipe Pose Landmarker** (`@mediapipe/tasks-vision`).

**Limitazioni runtime note (by-design, non bug):**
- **L3 silenzioso su CORS**: l'estrazione client-side di 6 frame dal video PT può fallire se il bucket Supabase `exercise-videos` non ha CORS configurato per il dominio attuale. In quel caso L3 è skippato e il combiner ridistribuisce a `(L1+L2)/2`. Documentato in `DOCUMENTAZIONE_FLUSSI.md` §16.
- **Router TIM Telecom H388X (operativo)**: DNS hijacking trasparente con suffix `homenet.telecomitalia.it`. Workaround attuale: hotspot mobile 4G/5G. Fix definitivo: firmware router o DoH (YogaDNS).

---

## 📋 PROSSIMI TASK

> Vedi `ROADMAP.md` per la lista esecutiva completa con suddivisione Claude Code / Antigravity AI.
> Vedi `DOCUMENTAZIONE_FLUSSI.md` per il riferimento sviluppatori su tutti i flussi attualmente implementati.

### 🔴 Priorità Alta — Verifica finale
1. **Fase 6.1 — Test E2E del flusso completo**: ora che il DB è up va eseguito il giro completo *onboarding → genera piano → workout → analisi (record → upload → L1/L2/L3 → report) → progressi → achievement unlock*. Non ancora fatto.

### 🟡 Priorità Media — Polishing UX
2. **Error boundaries globali + toast**: `src/app/(app)/error.tsx` non esiste, da creare. Toaster già configurato in providers.
3. **PWA icons** (192/512 PNG) in `public/`.
4. **PWA service worker offline** (`public/sw.js` + registrazione in `app/providers.tsx`).

### 🟢 Priorità Bassa — Feature v1 ancora placeholder
5. **Community feed UI/API**: `(app)/community/page.tsx` placeholder; schema DB già pronto (`SocialPost`, `SocialLike`, `Challenge`, `ChallengeParticipant`).
6. **Grafici progressi avanzati**: BarChart settimanale e LineChart minuti già attivi. Aggiunte possibili: trend peso corporeo, foto progressi, grafici radar.
7. **Vercel deploy**: bloccato da setup account utente + env vars.
8. **CORS bucket `exercise-videos`** su Supabase per attivare in modo affidabile L3 frame extraction.

---

## 🔧 SETUP INIZIALE (per nuovi sviluppatori)

Il setup è già completato per l'ambiente dell'utente principale. Per un nuovo sviluppatore:

```bash
# 1. Riempire .env.local con credenziali (vedi .env.example)
#    - DATABASE_URL (Supabase transaction pooler 6543)
#    - DIRECT_URL (Supabase session pooler 5432)
#    - NEXTAUTH_URL, NEXTAUTH_SECRET
#    - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
#    - ANTHROPIC_API_KEY
#    - UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
#    - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

# 2. Installare dipendenze
npm install

# 3. Generare client Prisma (in src/generated/prisma/)
npx prisma generate

# 4. Applicare migrazioni
npx prisma migrate dev

# 5. Seed dati (esercizi, achievement, template piani/nutrizione)
npx prisma db seed

# 6. Avvio dev server
npm run dev
# → http://localhost:3000
```

---

## 📐 ARCHITETTURA ANALISI v2 (implementata)

> Vista sintetica. Per il dettaglio completo (path, line, codice) consultare `DOCUMENTAZIONE_FLUSSI.md` §8.

### Analisi triplice — flusso attuale
```
Utente click "Inizia esercizio"
  → camera attivata
  → countdown 15s preparazione (UI fullscreen, no skeleton, no voce)
  → registrazione 15-25s di video (MediaRecorder + MediaPipe silenzioso)
  → upload video → Supabase Storage `analysis-videos`
  → POST /api/analysis/complete

Backend (Promise.allSettled in parallelo):
  L1 (34%): worldLandmarks 3D + state machine fase + ExerciseBiomechanicalSpec → trigger
  L2 (33%): 6-8 frame chiave → Claude Sonnet 4.6 vision
  L3 (33%): 6 coppie frame utente vs VIDEO_RIF_1 (Exercise.videoUrl) → Claude Sonnet 4.6 vision multi-image

Sintesi finale:
  Claude Haiku 4.5 riceve i 3 output → giudizio narrativo unico + alert injury
  combinedScore = L1*0.34 + L2*0.33 + L3*0.33

Target tempo upload→report: 1-2 minuti
```

### Schema dati v2 (vedi ANALYSIS_SPEC.md per dettaglio)
```
Exercise
  ├── recordingDurationSeconds (15-25s)
  ├── videoUrl (= VIDEO_RIF_1)
  └── biomechanicalSpec
        └── movements[]
              └── phases[]
                    └── triggers[] {condition, severity, feedback, injuryRisk}

AnalysisSession
  ├── videoUrl (video utente)
  ├── l1Result, l2Result, l3Result (Json)
  ├── finalReport (Json: overallJudgment, prioritizedImprovements, injuryRiskAlert, ...)
  └── combinedScore
```

### Differenze v2 (attuali) vs v1 (eliminate)
- ❌ ~~Feedback real-time durante esecuzione (skeleton, voce, live feedback)~~ → ✅ solo countdown + recording + analisi post-acquisizione (modalità silenziosa)
- ❌ ~~`BiomechanicalThreshold` flat~~ → ✅ gerarchia `Spec → Movement → Phase → Trigger` con phase-aware checking
- ❌ ~~L2 riceve solo numeri testuali~~ → ✅ L2 riceve 8 frame video reali (vision API)
- ❌ ~~L3 placeholder~~ → ✅ L3 confronto utente vs PT video con 12 frame allineati per fase (best-effort)

### Flusso onboarding (implementato — già esteso con dieta/infortuni/sport)
```
registrati → signIn → /onboarding (redirect /onboarding/step1)
step1 (goal+level) → step2 (equipment) → step3 (dati fisici+dieta+infortuni+sport) → step4
step4: POST /api/onboarding (save profile + onboardingCompleted=true)
       → POST /api/ai/generate-plan (streaming Sonnet 4.6 + few-shot WorkoutPlanTemplate)
       → GET  /api/exercises?limit=100 (slug→id map)
       → POST /api/workout-plans (save piano nested)
       → clearOnboarding() + redirect /dashboard
```

> Il piano nutrizionale AI esiste come endpoint separato `/api/ai/generate-nutrition-plan` (TDEE Mifflin-St Jeor + few-shot `NutritionPlanTemplate`). Attualmente NON è chiamato in automatico in step4; può essere triggerato dall'utente o aggiunto come step5 futuro.

---

## 📊 Copertura funzionale

| Area | Stato |
|---|---|
| Auth (Credentials + Google) + onboarding 4-step esteso | ✅ |
| Generazione piano allenamento AI (streaming + few-shot) | ✅ |
| Generazione piano nutrizionale AI (TDEE + few-shot) | ✅ |
| Esecuzione workout + tracking sessioni + streak | ✅ |
| Achievement unlock automatico | ✅ |
| **Analisi v2 triplice (L1 biomeccanica 3D / L2 vision / L3 PT compare)** | ✅ |
| Report finale con `combinedScore`, `injuryRiskAlert`, `prioritizedImprovements` | ✅ |
| Nutrizione tracking giornaliero (log pasti, macro totals) | ✅ |
| Progressi (stats + BarChart settimanale + LineChart 30gg + achievements grid) | ✅ |
| AI Coach chat streaming | ✅ |
| Catalogo esercizi (filtri + dettaglio biomeccanico) | ✅ |
| Profilo (edit + logout) | ✅ |
| Community feed | ❌ placeholder |
| PWA offline + icons | ❌ |
| Error UX globale (boundary + toast) | ❌ |
| Test E2E | ❌ da eseguire |
| Deploy prod (Vercel) | ❌ |

**Copertura complessiva**: ~90% del v1 + **100% del v2 analisi**. Restano polishing UX e verifica end-to-end.

---

*Tutti i bug bloccanti sono chiusi. La rifondazione Analisi v2 è completa e l'app è funzionante in dev. Prossimo step: test E2E (Fase 6.1) e polishing.*
