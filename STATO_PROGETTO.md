> ## ⚠️ STATO REALE — aggiornato 2026-08-17 (Sessione 9)
> **Fonte autorevole dello stato di avanzamento: i due diari `COSE_FATTE_IN_SESSIONE.md` + `COSE_DA_FARE.md`.** In caso di conflitto con questo documento, **valgono i diari** (qui sotto possono esserci sezioni storiche o superate).
>
> **Snapshot codice (17 ago 2026):** `main` è **in produzione** su Vercel
> (`fit-ai-six-ruddy.vercel.app`).
> - **Sessioni 7-8:** merge in `main`, deploy Vercel live, bug Upstash risolto, verifica end-to-end
>   flussi (3 bug corretti), pagina esercizio ridisegnata, database alimenti, editor trigger
>   biomeccanici, Progressi ristrutturato, Community dietro placeholder "in arrivo".
> - **Sessione 9:** fix contrasto testo esteso (bug reale in 6 file: dashboard, footer, CTA
>   homepage/Il Metodo — testo invisibile su sfondo scuro), CTA sticky in homepage, link "Scarica
>   l'app" in nav + pagina ampliata, layout Nutrizione corretto (form sempre visibile), copy "IA/AI"
>   tolto da bottoni/badge/checkbox (resta nei testi esplicativi). Poi le iniziative grandi da
>   `Aggiornameni possibili.md`: **prova gratuita per ospiti** (`/prova-gratuita`, nessun account,
>   stessa pipeline di analisi a 3 livelli dei Premium, referto via email, una prova completata per
>   email — non un limite giornaliero, tentativi di registrazione illimitati); **personaggio 2D
>   animato** al posto dello sticker a linee nella home (il 3D richiede un asset esterno da procurare —
>   opzioni valutate: DeepMotion, Mixamo, freelance, Spline); **carosello di 3 esempi di referto**
>   nella home; **editor inline "designer" per l'Admin** (bottone "Modifica pagina" sul sito pubblico,
>   clic su un testo → salva → live immediato, oggi attivo solo sulla pagina Prezzi — estendere alle
>   altre pagine richiede migrarle a `useCopy()`, meccanico); **Gamification** (classifica
>   `/leaderboard` per punti, riusa il flag privacy `profileVisibility` già usato per la Community,
>   premi configurabili da Admin per fascia di posizione, sezione informativa in home). Nuovi modelli
>   DB: `GuestAnalysisRequest`, `LeaderboardReward`, `Exercise.availableForFreeTrial`. Tutto verificato
>   dal vivo con account di test (creati e poi cancellati); `tsc`/`eslint` puliti (0 errori). Dettaglio
>   completo: `COSE_FATTE_IN_SESSIONE.md` (Sessione 9).
> **Aperti:** asset 3D per il personaggio animato da procurare/commissionare · estendere l'editor
> inline e `useCopy()` alle altre pagine (oggi solo Prezzi) · env var VAPID da confermare su Vercel ·
> credito Anthropic da ricaricare (scelta dell'utente, rimandato all'ultimo prima del lancio) ·
> verificare switch fotocamera e flusso analisi inline con hardware reale (non testabile in questo
> ambiente di sviluppo) · Libreria macro-filtri (punto da chiarire con l'utente) · Profilo
> impostazioni lingua · i18n completo del copy (rimandata come iniziativa a parte) · pagine
> `funzionalita`/`storie`/`risorse` non allineate · placeholder da compilare (cofondatore, Chi siamo,
> FAQ, P.IVA, dati competitor).

---

# Motion Insight (ex FitAI) — Stato del Progetto
*Aggiornato: 12 agosto 2026 (Area Utente v2 + Account Manager + Motore — committati su `main`; typecheck/ESLint puliti. Verifica funzionale loggata ancora da fare: richiede `prisma db push` + bucket Supabase `user-documents`).*

> **✅ RESTYLING MERGED + AREA UTENTE v2**: il rebrand **Motion Insight** e il restyling sono **confluiti in `main`** (commit `af8fdac merge: restyling Motion Insight in main`). Sopra a quello è stata costruita e **committata** un'intera fase nuova: **Area Utente v2** (7 sezioni), **Account Manager** (admin editabile) e **Motore di pianificazione** (quiz). Sintesi qui sotto in "Aggiornamento 12 ago 2026". Lo storico più in basso (M0–M12 + redesign "wow" + restyling) resta valido come base tecnica.

---

## 🆕 Aggiornamento 12 agosto 2026 — Area Utente v2 + Account Manager + Motore

> Fase costruita sopra al restyling merged. Tutto **committato e pushato su `origin/main`** (commit `5ad7b41` core, `0f391cc` admin, `14b79b6` area-utente, `a4188de` docs). Passa `tsc`+ESLint; **la verifica funzionale loggata NON è ancora stata fatta** (serve `npx prisma db push` + creazione bucket Supabase `user-documents`).

**Area Utente v2 — 7 sezioni** (`Dashboard · La tua sessione · Il tuo piano nutrizionale · Libreria · Progressi · Community · Profilo`; su mobile 5 in tab-bar + Community/Profilo nel menu ☰):
- **Sessione**: toggle "Analisi avanzata" per esercizio; pannello "Il tuo stato" (heatmap + rischio + suggerimento); richiesta di revisione manuale (`RevisionRequest`).
- **Nutrizione**: target personalizzati Mifflin-St Jeor (non più 2000 kcal fissi); abbinamento piano dal pool (`/api/nutrition/match`); ricette AI (`/api/ai/recipes`).
- **Libreria**: filtro per tag; dettaglio con doppio video PT (esecuzione + consigli) + "Attiva analisi avanzata".
- **Progressi**: trend Form Score; peso e misure (`UserProgress`).
- **Community**: creazione post + like + commenti (`SocialComment`) — **non più read-only MVP**.
- **Profilo**: note mediche (testo), upload documenti fitness/nutrizione (`UserDocument` + Supabase), card abbonamento, quiz ripetibile.
- **AI Coach**: codice ed endpoint (`/api/ai/chat`, pagina `/ai-coach`) ancora presenti ma **rimosso dalla navigazione** dell'area utente v2 (scelta di prodotto).

**Account Manager (admin)** — pattern "modifica → salva → si applica a tutti":
- ✅ Quiz onboarding editabile (`/admin/quiz`, `QuizConfig` in DB) → renderizzato in `/onboarding/quiz`.
- ✅ Coda revisioni (`/admin/revisions`), editor tag/note esercizi (`/admin/exercises/tags`), pool piani nutrizionali crea/elimina (`/admin/nutrition-plans`), form "Nuovo esercizio" completo con trigger biomeccanici (`/admin/exercises/new`).

**Schema Prisma v2** (committato in `schema.prisma`, **`db push` ancora da eseguire**): `medicalNotes`, `explanationVideoUrl`, modelli `RevisionRequest`, `QuizConfig`, `SocialComment`, `UserDocument` (+ enum `DocumentKind`), uso di `UserProgress`.

**Residui noti** (vedi `MOTION_INSIGHT_PROSSIMI_STEP.md`): parsing/adattamento AI dei documenti caricati (l'upload c'è, la lettura no); trend carichi aggregato in Progressi; editor "modifica esercizio esistente" e "modifica pool nutrizionale"; template piani fitness CRUD; `SiteContent` per copy editabili senza deploy.

> **⚠️ IMPORTANTE**: l'Analisi v2 è **implementata e funzionante** (Fasi 1–5 chiuse). La spec autoritativa resta in `ANALYSIS_SPEC.md` (root). Per una vista panoramica di TUTTI i flussi dell'app (auth, onboarding, allenamento, analisi, nutrizione, progressi, infrastruttura, daily mission) fare riferimento a **`DOCUMENTAZIONE_FLUSSI.md`** (root), che è il documento di onboarding sviluppatori.

---

## 📌 Stato attuale in una riga

**APP PRODUCTION-READY + repo `Masterteam99/FitAI` (`origin/main`).** Typecheck a zero errori, **60/60 unit test (Vitest) verdi** (11 file, verificato 12 ago 2026), DB Supabase migrato e seedato, Analisi v2 (Fasi 1–5) completa, **milestone M0–M12 chiuse** più l'intero **redesign visivo "wow"** (tema organico + libreria `src/components/wow`). CI GitHub Actions (typecheck+lint+unit+E2E su Postgres) attiva, Sentry reale integrato. Resta l'azione utente di deploy su Vercel (CHECKLIST_DEPLOY.md).

> **⚠️ Nota branch (13 lug 2026)**: `main` è il branch canonico e più avanzato. `redesign-wow` è **interamente confluito in main** (0 commit avanti) → obsoleto. `m10-admin-hub` è una **versione parallela più vecchia** dell'admin hub: quel lavoro è già su main in forma squashata (commit `a7fb614`), ma il branch è ormai divergente e indietro di 100+ commit → obsoleto. Entrambi i branch sono candidati alla cancellazione; nessun lavoro unico da recuperare.

---

## 🎨 Restyling Motion Insight (✅ confluito in `main` — commit `af8fdac`)

> **Nota (12 ago 2026):** questo restyling è ora **merged su `main`**; la sezione sotto resta come registro delle 6 fasi eseguite. Sopra al restyling è stata poi costruita l'**Area Utente v2** (vedi sezione "Aggiornamento 12 ago 2026" in cima).

Restyling completo secondo `DOCUMENTI BUSINESS/ISTRUZIONI_CLAUDE_CODE.md` (6 fasi). Direzione: **navy `#16213E` / coral `#E94560` (solo azioni) / teal / lime**, base chiara, display **Sora** + Inter, brand **Motion Insight**.

| Fase | Stato |
|---|---|
| 1 — Bug React #231 | ✅ non presente nel codice (era nel prototipo di design) |
| 2 — Landing multi-pagina | ✅ header sticky nav 5 voci, `/scarica`, footer + P.IVA (placeholder), barra CTA mobile |
| 3 — Home 9 sezioni | ✅ nuovo copy (hero "Alleni da solo?…", Per Chi Sei, Ti riconosci?, Form Score, ecc.), de-dup verificata |
| 4 — Onboarding & Login | 🟡 **parte sicura**: quiz pubblico + `/onboarding/piano` ("Ecco il tuo piano") + CTA→quiz + restyle registrazione (Google+Apple predisposto). Auth-sensibili rimandate |
| 5 — Area utente | 🟡 nav **5 tab** (Home/Allena/Nutrizione/Progressi/Profilo) + barra tab mobile; Home con prompt "Come ti senti oggi?" + FormScoreHero. Schermate profonde (Allena/Nutrizione) da rifinire loggato |
| 6 — PWA | ✅ manifest/icone/themeColor rebrandizzati Motion Insight, bottone "Installa ora" su `/scarica` |

**Verifica**: typecheck 0 errori, lint 0 errori. Landing/quiz/scarica verificati via DOM (screenshot non disponibili nell'ambiente). Area utente **da verificare loggati**.

**In sospeso** (richiedono utente): P.IVA reale, testimonianze reali per Storie, Apple OAuth, salvataggio post-registrazione, priming camera + primo Form Score, ricalcolo workout reale, install PWA su produzione, e i **click admin** per estrarre i 18 profili PT (branch separato `feat/pt-reference-biomeccanico`, migrazione già applicata al DB).

---

## ✅ COMPLETATO DOPO M8 (sessioni 12+, mag→lug 2026) — non documentato prima

> 105 commit su `main` dopo la chiusura di M8 (`ea86037`). Sintesi per milestone.

### M9 — Admin: upload video PT
- `User.isAdmin` + helper admin con bootstrap da env (`9bc3e99`).
- API admin upload/delete video PT per esercizio (`adc5b4f`), pagina `/admin/exercises` con dialog upload + E2E (`b3a8d32`).
- Script bulk upload video PT (18 video caricati) + script cleanup utenti con keep-list.

### M10 — Admin hub completo
- Design + piano (17 task) poi implementazione: hub `/admin` con tab **Utenti** (tabella filtrata + drawer dettaglio + grant premium / reset quota), **Abbonamenti** (MRR/churn), **Statistiche** (MAU/DAU/charts/top esercizi), **Gestione admin** (promote/revoke con lockout), **Uso AI** (costo stimato + breakdown), **Audit log** (`/admin/activity`). Modello `AdminActionLog` + `logAdminAction` helper.
- Consegnato su `main` come commit squashato `a7fb614`. **NB**: esiste un branch parallelo `m10-admin-hub` con la storia granulare (18 commit) ora divergente/obsoleto.
- Refactor trasversale: `src/content/copy.ts` come single source of truth per tutte le stringhe (marketing, auth, app, admin, legali).

### M11 — Visual layer (PR #1 `m11-visual-layer`)
- Token OKLCH "energy" (cool/warm/hot/cold) + utility gradient, font display Bowlby One SC.
- `framer-motion` + primitive motion (NumberPunch, SlideUp, RevealMask, MagneticHover).
- **StreakHeatmap** (GitHub-style 52w) + API `/api/me/streak-history`, **BodyMap** 3 modalità (volume/recovery/balance) + API `/api/me/body-map` + helper `src/lib/body-map.ts`, **GradientMesh** animato CSS.
- Sessione workout immersiva fullscreen phase-reactive, **AchievementUnlock** provider con confetti.

### M12 — Production confidence
- **Vitest** + config + smoke test; copertura unit su biomeccanica (angoli/fasi/spec evaluator), analysis weights, vision/final-report orchestration → **54 test**.
- **Sentry reale** (Next 16), attivo solo con DSN.
- **CI GitHub Actions**: typecheck + lint + unit + E2E con Postgres; E2E contro build di produzione (`next start`), migrazione baseline, route resilienti a servizi esterni assenti.
- Pesi analisi 50/30/20 via `computeCombinedScore` puro; gate persistenza trigger biomeccanici su run consecutiva in ms.

### Redesign "wow" (Track A + libreria wow, giu→lug 2026)
- **Tema organico** applicato a landing/marketing, area app loggata (mix organico+atletico), auth/onboarding/legali.
- **Libreria `src/components/wow`**: logica heat condivisa testata, primitive AnimatedRing/RadialGauge/AnimatedArea/AnimatedBars, `AdaptiveBodyMap` (pulse muscoli carenti), **ExerciseFormPlayer** (motore di pose testato squat/hinge, evidenziazione errore reale), **ScrollExplainer** scroll-driven; primitive motion `ParallaxLayer`/`DrawPath`/`useScrollStep`.
- **Applicazioni con dato reale**: dashboard (heatmap squilibri + obiettivo settimanale con RadialGauge 7gg), esercizi (curva 1RM Epley con AnimatedArea + preview video card), nutrizione (gauge calorie giornaliere), progressi (timeline record personali + contatori CountUp), analisi report ("tecnica ricostruita" con ExerciseFormPlayer su errore reale), onboarding (indicatore progresso animato 4 step), prezzi (card Premium sollevata).
- Marketing pre-login: pagine funzionalità, come-funziona (scroll-driven), prezzi, chi-siamo, FAQ; SEO (robots, sitemap, JSON-LD, metadataBase); a11y aria su widget custom; skeleton di caricamento.
- Hardening billing (dispute Stripe nel webhook, premium manuale separato da stato Stripe), 32 nuovi esercizi con tag + spec biomeccaniche, generazione piani tag-driven.

### Stato verificato (13 lug 2026)
- `npx tsc --noEmit` → **0 errori**.
- `npx vitest run` → **54/54 verdi** (9 file, ~0.8s).
- Suite E2E: 16 file spec presenti (non rieseguita in questa sessione di allineamento; richiede DB + dev server).

---

## ✅ COMPLETATO IN QUESTA SESSIONE (sessione 11, 22 maggio 2026)

### M8 Daily Mission — verifica e stabilizzazione
- Build production verificato (`npm run build` → 52 pagine, zero errori).
- Suite E2E completa eseguita: **50/50 verdi in 2.6 min** (45 esistenti + 5 nuovi M8).
- Fix di stabilità: alzati i timeout del test `onboarding.spec.ts:27 "flusso completo 4 step"` (`test.setTimeout(60_000)` + `waitForURL` a 30s su step1→step3). Causa: cold compile di Turbopack su `/onboarding/step*` la prima volta che il test li tocca, sforava i 15s default.
- Committato `scripts/reset-quota.mjs`: script utility per cancellare `UsageCounter` di un utente per il mese corrente UTC (testing del gating M4 senza aspettare il rollover mensile).
- Push su `origin/main` (`0dc3720..ea86037`): include i 2 commit di oggi (test fix + script utility) sopra ai 6 commit M8 già pushati a fine sessione 10.

### Lezione operativa (Turbopack persistence cache)
- Bug critico scoperto: dev server zombi multipli (PID 16844, 19376 da sessioni precedenti mai chiuse pulitamente) lockavano la persistence directory di Turbopack (`.next/dev/cache/turbopack/<hash>/`), causando un errore criptico "Failed to open database / Loading persistence directory failed / invalid digit found in string" al riavvio.
- **Soluzione**: `taskkill /F /PID <zombie>` su tutti i node Next.js residui prima di avviare `npm run dev` o `npm run test:e2e`. Se persiste, `rm -rf .next/dev/cache/turbopack` (forza rigenerazione cache LSM).
- **Causa di fondo**: Playwright termina il `webServer` con SIGKILL (Windows `taskkill /F`) → Turbopack non flush della LSM-cache → corruzione al boot successivo. È un loop strutturale: ogni volta che si interrompe brutalmente il dev server può lasciare zombi.

## ✅ COMPLETATO IN SESSIONI PRECEDENTI

### Sessione 7 (14 maggio 2026) — Documentazione sviluppatori
- Creato **`DOCUMENTAZIONE_FLUSSI.md`** (root, ~5400 parole): documento di riferimento navigabile (TOC + 16 sezioni) che descrive ogni parte dell'app — panoramica, schema dati completo, auth, onboarding, dashboard, esercizi, allenamento, **analisi v2** (con il dettaglio dei 3 livelli L1/L2/L3 + final report), AI coach, nutrizione, progressi, community, profilo, infrastruttura supportiva, riepilogo modelli AI per endpoint, errori noti e convenzioni nomi.
- Pensato come "point of entry" per chiunque (nuovo agente, nuovo sviluppatore, l'utente stesso che torna dopo settimane).

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
| AI Coach chat streaming (endpoint presente, ma de-linkato dalla nav area utente v2) | ⚠️ |
| Catalogo esercizi (filtri + dettaglio biomeccanico) | ✅ |
| Profilo (edit + logout) + GDPR export/delete | ✅ |
| Community (post + like + commenti — non più read-only) | ✅ |
| **Area Utente v2 (7 sezioni web+PWA)** | ✅ |
| **Account Manager: quiz editabile / revisioni / pool nutrizionale / nuovo esercizio+tag** | ✅ |
| **Motore: quiz onboarding + target Mifflin-St Jeor + abbinamento pool + ricette AI** | ✅ |
| **Profilo: note mediche + upload documenti (`UserDocument`)** | ✅ (parsing/adattamento AI ⏳) |
| **Progressi: trend Form Score + peso/misure** | ✅ (trend carichi aggregato ⏳) |
| PWA offline + icons | ✅ |
| Error UX globale (boundary + toast) | ✅ |
| Email transactional + reset password + verify email | ✅ |
| Sentry + GDPR (privacy/terms, cookie banner) | ✅ |
| Stripe billing (free/premium + gating + checkout/portal/webhook) | ✅ |
| Welcome tour + Insights dashboard | ✅ |
| **Daily Mission dashboard hero (workout/nutrition/check-in)** | ✅ |
| **M9 — Admin: upload video PT per esercizio** | ✅ |
| **M10 — Admin hub (utenti/abbonamenti/statistiche/admin/uso AI/audit log)** | ✅ |
| **M11 — Visual layer (StreakHeatmap, BodyMap 3 modi, GradientMesh, motion)** | ✅ |
| **M12 — Production confidence (Vitest 54 test, Sentry reale, CI Actions)** | ✅ |
| **Redesign "wow" (tema organico + libreria wow con dato reale)** | ✅ |
| **Copy centralizzato in `src/content/copy.ts`** | ✅ |
| **SEO (robots/sitemap/JSON-LD) + marketing pre-login** | ✅ |
| Test unit (Vitest 60/60, 11 file) + E2E (16 file spec) | ✅ |
| Deploy prod (Vercel) | ⏸ azione utente (CHECKLIST_DEPLOY.md) |

**Copertura complessiva**: **100% v1 + 100% v2 analisi + M0–M12 chiuse + redesign wow completo**. Resta solo l'azione utente di deploy Vercel.

---

*Tutti i bug bloccanti sono chiusi. Analisi v2 completa, M0–M12 chiuse, redesign "wow" + Area Utente v2 confluiti su main. Typecheck 0 errori, 60/60 unit test verdi (11 file, verificato 12 ago 2026). Prossimo step: infra runtime (`prisma db push` + bucket `user-documents`), verifica funzionale loggata, poi deploy Vercel.*
