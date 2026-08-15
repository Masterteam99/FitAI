> ## ⚠️ STATO REALE — aggiornato 2026-08-15
> **Fonte autorevole dello stato di avanzamento: i due diari `COSE_FATTE_IN_SESSIONE.md` + `COSE_DA_FARE.md`.** In caso di conflitto con questo documento, **valgono i diari** (qui sotto possono esserci sezioni storiche o superate).
>
> **Snapshot codice (15 ago 2026):** in Sessione 6 chiuso l'intero piano "Sessione/Nutrizione/Analisi"
> (10 fasi, vedi `DOCUMENTAZIONE_FLUSSI.md` (§7-8-10, §14bis) e `COSE_FATTE_IN_SESSIONE.md` (Sessione 6)) + MVP polish (toast, validazione form,
> cambio email/password, sistema notifiche reminder da zero, fix filtri Libreria). Branch
> **`feature/mvp-launch-polish`**, non ancora in `main`. Dettagli in `STATO_PROGETTO.md`.
> **Aperti:** integrare i branch in `main` · verificare switch fotocamera/analisi inline con hardware
> reale · env VAPID/CRON su Vercel prima del deploy · resto invariato (vedi `STATO_PROGETTO.md`).

---

# FitAI — Roadmap Esecutiva (Analisi v2 + Estensioni)

*Versione 3.0 — 13 luglio 2026 (M0–M12 chiuse + redesign "wow" confluito su origin/main; typecheck 0 errori, 54/54 unit test verdi)*

> **⏱️ AGGIORNAMENTO 12 ago 2026:** dopo la v3.0, il **restyling Motion Insight** è stato **merged su `main`** (`af8fdac`) ed è stata costruita/committata su `origin/main` un'intera fase nuova — **Area Utente v2** (7 sezioni), **Account Manager** (admin editabile) e **Motore** (quiz + target nutrizionali). Il tracking per-task qui sotto resta come **registro storico** dell'Analisi v2; per lo stato attuale usa `STATO_PROGETTO.md` → "Aggiornamento 12 ago 2026" e `MOTION_INSIGHT_PROSSIMI_STEP.md` per i residui.

> **🎉 STATO ATTUALE (13 lug 2026)**: Fasi 1–5 chiuse e funzionanti, DB setup completato, **M0–M12 tutte chiuse** su `Masterteam99/FitAI` (`origin/main`) + intero **redesign visivo "wow"**. Vedi `STATO_PROGETTO.md` per la sintesi dettagliata per milestone (M9 admin video PT, M10 admin hub, M11 visual layer, M12 production confidence, redesign wow). Verificato: `npx tsc --noEmit` 0 errori, `npx vitest run` 54/54 verdi; suite E2E 16 file spec. **Nota branch**: `main` è il canonico; `redesign-wow` (già in main) e `m10-admin-hub` (versione parallela superata dal commit squashato `a7fb614`) sono obsoleti e candidati alla cancellazione.
>
> **[Storico ≤ 22 maggio]** Tutte le fasi 1–5 chiuse. **Sessione 8 (15 maggio)**: avviato master plan M0–M5 (`~/.claude/plans/cosa-manca-da-fare-swirling-puzzle.md`). **M0 done** (error boundaries, PWA icons, CORS doc). **M1 done**: Playwright 19 test verdi; fixato bug profilo PATCH (`weight`/`height` → `weightKg`/`heightCm`) + `aria-label` Send AI Coach. **Sessione 11 (22 maggio)**: M8 Daily Mission chiusa + verifica E2E.

> Questo documento è il tracking esecutivo delle task per la rifondazione dell'Analisi v2 e le estensioni correlate. È pensato per essere usato da **agent multipli** (Claude Code per i refactor architetturali, Antigravity AI per le task ripetitive/dataset). Aggiornare lo stato di ogni task quando completata.

> **Spec autoritativa Analisi v2**: `ANALYSIS_SPEC.md` (root) — leggere PRIMA di toccare il flusso analisi.
> **Documentazione flussi (TUTTA l'app)**: `DOCUMENTAZIONE_FLUSSI.md` (root) — entry point per nuovi sviluppatori.
> **Stato globale**: `STATO_PROGETTO.md`
> **Master plan storico**: `~/.claude/plans/ok-ora-che-ho-quizzical-kernighan.md`

---

## Legenda

- 🤖 **Claude Code**: task che richiede contesto profondo del codebase, refactor architetturale, vision API, prompt engineering, decisioni di design
- 🌊 **Antigravity AI**: task ripetitiva, compilazione dataset, seed strutturati, componenti UI documentati, test manuali su flussi esistenti
- 🔁 **Collaborativa**: una parte va bene per Antigravity (es. componenti UI con design specificato), una parte richiede Claude Code (integrazione)
- ⏸ **Bloccata**: ha dipendenze esterne (credenziali utente, decisione utente, altra task)

Ogni task ha:
- **ID** univoco
- **Titolo**
- **Owner** (Claude Code / Antigravity / Collaborativa)
- **Stato**: TODO / IN_PROGRESS / DONE / BLOCKED
- **File critici**
- **Note esecutive**

---

## FASE 1 — Modello dati e migrazione

### 1.1 🤖 Schema Prisma v2

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 3, 30 aprile 2026)
- **File critici**: `prisma/schema.prisma`, `prisma.config.ts`
- **Cosa è stato fatto**:
  - ✅ Aggiunti modelli: `ExerciseBiomechanicalSpec`, `ExerciseMovement`, `MovementPhase`, `PhaseTrigger`
  - ✅ Aggiunto enum `TriggerCondition` (BELOW_MIN, ABOVE_MAX, OUT_OF_RANGE)
  - ✅ Aggiunto valore enum `ExercisePhase.ISOMETRIC`
  - ✅ Aggiunto a `Exercise`: `recordingDurationSeconds Int @default(20)` + commento documentale `videoUrl` come VIDEO_RIF_1
  - ✅ Aggiunto a `Exercise`: relazione `biomechanicalSpec ExerciseBiomechanicalSpec?`
  - ✅ Aggiunto a `AnalysisSession`: `l1Result Json?`, `l2Result Json?`, `l3Result Json?`, `finalReport Json?`
  - ✅ Mantenuto `BiomechanicalThreshold` + campi legacy v1 in AnalysisSession (eliminazione rinviata a fase 5.1)
  - ✅ **Bonus fix Prisma 7**: spostato `url`/`directUrl` da `schema.prisma` → `prisma.config.ts` (Prisma 7 ha cambiato API). Lo schema ora passa `prisma validate ✓`
- **Comando per attivare a setup completato**: `npx prisma migrate dev --name analysis_v2_schema`

### 1.2 🤖 API endpoint upload video utente

- **Owner**: Claude Code
- **Stato**: ✅ **DONE**
- **File critici**: `src/app/api/analysis/upload-video/route.ts`
- **Note**:
  - POST riceve un Blob video (multipart/form-data o base64), salva su Supabase Storage bucket `analysis-videos`
  - Usare helper esistente `src/lib/supabase.ts::uploadFile`
  - Auth check (`auth()` da `src/lib/auth.ts`) + rate limit (`analysisRatelimit` da `src/lib/redis.ts`)
  - Path file: `{userId}/{analysisSessionId}/{timestamp}.webm`
  - Ritorna URL firmato a 24h
  - Aggiornare `AnalysisSession.videoUrl` con l'URL ricevuto

### 1.3 🌊 Dataset spec biomeccaniche per ~20 esercizi

- **Owner**: Antigravity
- **Stato**: ✅ **DONE** (30 aprile 2026)
- **File critici**: `prisma/seed-biomechanical-specs.ts` (nuovo)
- **Note esecutive**:
  - Esercizi target (slug come da seed.ts esistente): squat, stacco-da-terra, panca-piana, trazioni, military-press, affondi, rematore-bilanciere, curl-bicipiti, push-up, plank, romanian-deadlift, lateral-raise, tricipiti-cavi, hip-thrust, crunch, goblet-squat, bulgarian-split-squat, plank-laterale, face-pull, leg-press
  - Per ogni esercizio compilare struttura come da esempio in `ANALYSIS_SPEC.md` sez. "Esempio (squat)"
  - Joint disponibili (da `src/lib/pose.ts::KEYPOINT_NAMES`): left_knee, right_knee, left_elbow, right_elbow, left_shoulder, right_shoulder, left_hip, right_hip, spine
  - Movimenti: flessione, estensione, abduzione, adduzione, rotazione, inclinazione, neutrale, cerniera
  - Fasi (enum Prisma): CONCENTRIC, ECCENTRIC, TOP, BOTTOM, THROUGHOUT
  - Severità: WARNING (svista correggibile), ERROR (errore tecnico), CRITICAL (rischio infortunio)
  - Feedback: italiano, max 30 parole, tono PT professionale ma accessibile (rif. stile esistente in `src/services/ai/promptTemplates.ts`)
  - `injuryRisk: true` se la violazione contribuisce direttamente a un rischio (es. hyperextension lombare, ginocchio in valgo)
  - Riferimenti tecnici: NSCA Essentials of Personal Training, ACSM Guidelines for Exercise Testing
  - **Output format esempio**:
    ```typescript
    export const BIOMECHANICAL_SPECS: Record<string, ExerciseBiomechanicalSpec> = {
      "squat": {
        movements: [
          {
            joint: "left_knee",
            movementType: "flessione",
            phases: [
              { phase: "BOTTOM", minAngle: 70, maxAngle: 110, triggers: [...] }
            ]
          },
          ...
        ]
      },
      ...
    };
    ```
  - Questa task richiede ~4-6 ore di compilazione attenta, è perfetta per Antigravity

### 1.4 🌊 Aggiornamento `prisma/seed.ts`

- **Owner**: Antigravity
- **Stato**: ✅ **DONE** (30 aprile 2026)
- **File critici**: `prisma/seed.ts`
- **Note**:
  - Importare `BIOMECHANICAL_SPECS` da `seed-biomechanical-specs.ts`
  - Sostituire il blocco `prisma.biomechanicalThreshold.create()` con creazione gerarchia `ExerciseBiomechanicalSpec → ExerciseMovement → MovementPhase → PhaseTrigger`
  - Aggiungere `recordingDurationSeconds` per ciascun esercizio nel data block:
    - 25s: plank, plank-laterale, hip-thrust (esercizi a tempo)
    - 20s (default): squat, stacco-da-terra, panca-piana, military-press, affondi, rematore-bilanciere, push-up, romanian-deadlift, bulgarian-split-squat, leg-press, goblet-squat
    - 15s: curl-bicipiti, lateral-raise, tricipiti-cavi, face-pull, crunch, trazioni (esercizi rapidi/limitanti)

---

## FASE 2 — Acquisizione video e UI

### 2.1 🤖 Riscrittura `usePoseDetection` modalità silenziosa

- **Owner**: Claude Code
- **Stato**: ✅ **DONE**
- **File critici**: `src/hooks/usePoseDetection.ts`, `src/lib/pose.ts`
- **Note**:
  - Rimuovere `drawSkeleton` durante recording (passare flag `silent: true`)
  - Rimuovere chiamate `addFrame` con violations (lasciare solo storage frameHistory + worldFrameHistory)
  - **Aggiungere `mapWorldLandmarks(worldLandmarks): Keypoint[]`** in `lib/pose.ts` (coordinate in metri, no de-normalizzazione necessaria)
  - Esporre worldLandmarks nel `FrameAnalysis` type
  - Mantenere `frameCount` per FPS monitoring

### 2.2 🤖 Riscrittura pagina sessione analisi

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 4, 1 maggio 2026)
- **Note implementative**: state machine `IDLE → COUNTDOWN → RECORDING → UPLOADING → ANALYZING → ERROR`. Usa `MediaRecorder` (vp9/vp8/webm fallback). Estrae 8 snapshot frame uniformi del video utente lato client e li manda come `userFrames` base64 a `/api/analysis/complete`. **Pro frames** (estrazione dal video PT) non implementati → L3 cade in fallback bilanciato (vedi 3.7).
- **File critici**: `src/app/(app)/analisi/sessione/page.tsx` (riscrittura totale)
- **Note**:
  - State machine: `IDLE → COUNTDOWN_15S → RECORDING → UPLOADING → ANALYZING → COMPLETED | ERROR`
  - Usare `MediaRecorder` API per registrazione webm (max 720p, ~30fps)
  - Eliminare `useVoiceCoach` da questa pagina (ma non eliminare il hook in fase 5.1 — verificare se usato altrove)
  - In `RECORDING` state: niente skeleton, niente feedback live, solo indicatore REC + countdown durata
  - Su stop registrazione: chiamare `/api/analysis/upload-video` con il blob, poi `/api/analysis/complete` con `{ analysisSessionId, videoUrl, frameHistory, worldFrameHistory }`
  - Polling stato analisi (`GET /api/analysis/[id]/status`) ogni 5s durante ANALYZING (oppure usare websocket/SSE se Vercel free tier non lo permette)
  - Su COMPLETED: redirect a `/analisi/report/{id}`

### 2.3 🌊 Componenti UI riutilizzabili countdown/progress

- **Owner**: Antigravity (può usare `frontend-design` skill se installata)
- **Stato**: ✅ **DONE** (30 aprile 2026)
- **File critici**: `src/components/analisi/CountdownCircle.tsx`, `src/components/analisi/RecordingIndicator.tsx`, `src/components/analisi/AnalysisProgress.tsx`
- **Note**:
  - **CountdownCircle**: SVG circle con animazione `stroke-dashoffset`, secondi al centro, props `seconds: number, onComplete: () => void`
  - **RecordingIndicator**: badge rosso pulsante "REC" + progress bar lineare con `elapsedSeconds / durationSeconds`, props `durationSeconds, elapsedSeconds`
  - **AnalysisProgress**: 3 step orizzontali con icone, mostra current step animato, props `steps: string[], currentStep: number`
  - Stile: coerente con design system esistente (Tailwind + Radix UI)
  - Niente dipendenze nuove

---

## FASE 3 — Logiche di analisi

### 3.1 🤖 L1 — State machine fase movimento

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 4)
- **Implementato in**: `src/services/biomechanical/phaseDetector.ts` (`detectPhases`, `findRepresentativeFrames`). Map `EXERCISE_PHASE_CONFIG` per 20 esercizi. Plank/plank-laterale → THROUGHOUT statico. Smoothing window 5 frame, persistenza minima 5 frame, soglia BOTTOM/TOP a 18% del range.
- **File critici**: `src/services/biomechanical/phaseDetector.ts` (nuovo)
- **Note**:
  - Algoritmo: identifica picchi/valli sugli angoli chiave per esercizio
  - Esempio squat: detect bottom = frame con min(leftKnee, rightKnee), top = frame con max(...); transition top→bottom = ECCENTRIC, bottom→top = CONCENTRIC
  - Per esercizi a posizione tenuta (plank): `THROUGHOUT` su tutta la durata
  - Output: `{ frameIndex: number; phase: ExercisePhase }[]` per ogni frame
  - Anti-jitter: smoothing degli angoli con moving average window 3-5 frame prima di detection picchi
  - Persistenza minima fase: 5 frame consecutivi (~200ms a 25fps) per validare cambio fase

### 3.2 🤖 L1 — Spec evaluator phase-aware

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 4)
- **Implementato in**: `src/services/biomechanical/specEvaluator.ts` (`evaluateExerciseSpec`). Score `100 - (penalty / movements) * 10`, severity weight 1/3/10, persistence factor count/phaseFrames, soglia minima 5 frame consecutivi.
- **File critici**: `src/services/biomechanical/specEvaluator.ts` (nuovo, sostituisce `poseAnalyzer.ts`)
- **Note**:
  - Nuova funzione: `evaluateExerciseSpec(frames, spec, phaseTimeline) → L1Result`
  - Per ogni frame, recuperare fase corrente da phaseTimeline, applicare solo trigger della fase corrispondente
  - Score: `100 - Σ(severity_weight × persistence_factor) / total_movements_evaluated`
    - severity_weight: WARNING=1, ERROR=3, CRITICAL=10
    - persistence_factor: durata violazione / durata fase (0-1)
  - Output L1Result type definito in `ANALYSIS_SPEC.md` sez. 2

### 3.3 🤖 L1 — Angoli 3D worldLandmarks

- **Owner**: Claude Code
- **Stato**: ✅ **DONE**
- **Implementato in**: `src/lib/pose.ts::calculateAngle` (dot product 3D quando z disponibile, fallback 2D). `usePoseDetection.ts` usa `mapWorldLandmarks` e calcola angoli sui worldKeypoints.
- **File critici**: `src/services/biomechanical/angleCalculator.ts`
- **Note**:
  - Estendere `computeJointAngles` per accettare optional `worldKeypoints`
  - Se 3D disponibili: calcolare angolo via vettori 3D (dot product / magnitude product)
  - Fallback 2D se worldKeypoints assente
  - Test: validare che angolo 3D di una flessione gomito = ~90° indipendentemente dall'angolazione camera

### 3.4 🤖 L2 — Vision API utente

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 4)
- **Implementato in**: `src/services/ai/visionAnalyzer.ts::analyzeUserVideoVision`. Sonnet 4.6 con 8 immagini base64 client-extracted. Prompt-cache ephemeral su system prompt PT.
- **File critici**: `src/services/ai/visionAnalyzer.ts` (nuovo), `src/services/ai/promptTemplates.ts`
- **Note**:
  - Funzione: `analyzeUserVideoVision({ videoUrl, exerciseName, exerciseSlug, professionalNotes, phaseTimeline })`
  - Estrazione frame chiave: 1 per fase rilevata + 2-3 distribuiti uniformemente (totale 6-8)
  - Estrazione frame: TBD client-side (preferito, più semplice + niente ffmpeg in serverless) — il client manda i frame base64 al backend insieme al video
  - Modello: Claude Sonnet 4.6 con `image` content blocks
  - Prompt: nuovo `buildVisionAnalysisPrompt` che istruisce Claude come PT visivo, focalizzato su aspetti che L1 non coglie (controllo, simmetria, breathing pattern, espressione di sforzo)
  - Output JSON L2Result (ANALYSIS_SPEC.md sez. 2)
  - Cache prompt-caching ephemeral su system prompt PT

### 3.5 🤖 L3 — Confronto vision utente vs PT

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 4, pro frames aggiunti)
- **Implementato in**: `src/services/ai/visionAnalyzer.ts::compareVideoVision` + estrazione lato client `extractProFrames` in `analisi/sessione/page.tsx`. 6 frame uniformi dal `Exercise.videoUrl` estratti durante il countdown 15s in parallelo (best-effort, fallback graceful su CORS error → `complete/route.ts` redistribuisce i pesi a media(L1, L2)).
- **File critici**: `src/services/ai/visionAnalyzer.ts` (continua)
- **Note**:
  - Funzione: `compareVideoVision({ userFrames, proVideoUrl, exerciseName })`
  - Estrazione 6 frame uniformi dal video PT (Opzione B del piano)
  - Invio 12 immagini etichettate (USER/PRO × 6 fasi) a Claude Sonnet 4.6
  - Prompt focalizzato su differenze postura, timing relativo, range di movimento
  - Output JSON L3Result (ANALYSIS_SPEC.md sez. 2)

### 3.6 🤖 Final report sintesi

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 4)
- **Implementato in**: `src/services/ai/finalReportGenerator.ts::generateFinalReport`. Haiku 4.5. Calcola `combinedScore = L1*0.34 + L2*0.33 + L3*0.33`. Fallback robusto con sintesi locale se Claude non risponde JSON valido.
- **File critici**: `src/services/ai/finalReportGenerator.ts` (nuovo)
- **Note**:
  - Funzione: `generateFinalReport({ l1Result, l2Result, l3Result, exerciseName }) → FinalReport`
  - Modello: Claude Haiku 4.5 (veloce, costo basso, sufficient per sintesi)
  - Prompt: dare priorità a CRITICAL di L1 nel `injuryRiskAlert`, riconciliare contraddizioni L1/L2 (numeri vs visivo), unificare `injuryRisk` di L1 + `injuryRiskFlags` di L2
  - Output FinalReport (ANALYSIS_SPEC.md sez. 2)

### 3.7 🤖 Riscrittura `/api/analysis/complete`

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 4)
- **Implementato in**: `src/app/api/analysis/complete/route.ts`. `Promise.allSettled([L1, L2, L3])`, fallback per ogni livello, sintesi finale. `maxDuration = 120`. Persiste `l1Result/l2Result/l3Result/finalReport` come Json + popola anche i campi legacy v1 per retrocompatibilità report page.
- **File critici**: `src/app/api/analysis/complete/route.ts` (riscrittura)
- **Note**:
  - Input nuovo: `{ analysisSessionId, videoUrl, frameHistory, worldFrameHistory }`
  - Step 1: detect phases (`phaseDetector.detectPhases`)
  - Step 2: `Promise.allSettled([L1, L2, L3])` con fallback per ogni task fallita (score 0 + messaggio errore in feedback)
  - Step 3: `generateFinalReport`
  - Step 4: persist tutto in `AnalysisSession`, status COMPLETED
  - Gestione errori: se >=2 task falliscono, status ERROR + messaggio
  - Timeout interno: 110s (margine sotto i 120s target)

---

## FASE 4 — UI Report finale

### 4.1 🤖 Pagina report ridisegnata

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 5, 2 maggio 2026)
- **Implementato**:
  - Hero anello SVG (r=45, stroke-dashoffset proporzionale al combinedScore) con punteggio centrato
  - `<AnalysisDetails l1l2l3 />` (`src/components/analisi/AnalysisDetails.tsx`): client component con `<details>` espandibile + tab interni L1/L2/L3 mostrando score, fasi rilevate, trigger attivati con severity color, osservazioni vision, differenze chiave PT
  - `<VideoSyncPlayer />` (`src/components/analisi/VideoSyncPlayer.tsx`): client component con 2 video element, play/pause sincronizzati, restart
  - Banner injuryRiskAlert colorato (MEDIO/ALTO) + Giudizio del Coach (overallJudgment di finalReport)
- **File critici**: `src/app/(app)/analisi/report/[id]/page.tsx`
- **Note**:
  - Hero: `combinedScore` grande con anello SVG + label
  - Card "Giudizio del Coach" con `overallJudgment` (testo narrativo)
  - Alert sicurezza solo se `injuryRiskAlert.level !== "BASSO"` (banner colorato)
  - Sezione "Migliora prima di tutto": lista numerata `prioritizedImprovements`
  - Sezione "Punti di forza": lista con check icon `positiveAspects`
  - Tab espandibile "Dettagli tecnici" con tre sotto-tab L1/L2/L3 (per utenti tecnici, default chiuso)
  - Sezione "Confronto video": player video utente + player video PT side-by-side, sync play
  - Mobile-first: stack verticale, video uno sotto l'altro

### 4.2 🌊 Empty states + skeleton loading

- **Owner**: Antigravity
- **Stato**: ✅ **DONE** (30 aprile 2026)
- **File critici**: stessi della 4.1, oppure `src/components/analisi/ReportSkeleton.tsx`
- **Note**:
  - Skeleton: anelli/card vuoti shimmer per i 3-5s che la pagina impiega a caricare
  - Empty state errore: card centrale con icona warning, testo "Analisi fallita: {dettagli}", bottone "Riprova"
  - Empty state se `combinedScore === null` (analisi in corso): polling stato + AnalysisProgress component (vedi 2.3)

---

## FASE 5 — Cleanup e onboarding esteso

### 5.1 🤖 Pulizia codice obsoleto

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 6, 12 maggio 2026)
- **File critici**: vari
- **Lavoro effettuato**:
  - Migrate le query UI/API da `BiomechanicalThreshold` a `ExerciseBiomechanicalSpec` in: `api/exercises/route.ts`, `(app)/analisi/page.tsx`, `(app)/esercizi/page.tsx`, `(app)/esercizi/[slug]/page.tsx`.
  - Report page `(app)/analisi/report/[id]/page.tsx` ora legge esclusivamente da `l1Result`/`l2Result`/`l3Result`/`finalReport` JSON (rimossi `biomechanicalScore`, `aiExpertScore`, `videoComparisonScore`, `aiExpertFeedback`, `improvementAreas`, `positiveAspects`, `videoComparisonFeedback`, `biomechanicalFeedback` come accessi diretti su `report.*`).
  - Rimossi 9 campi DEPRECATED dal modello `AnalysisSession` in `prisma/schema.prisma`.
  - Rimosso blocco "campi legacy" da `api/analysis/complete/route.ts`.
  - Eliminato modello `BiomechanicalThreshold` e relazione `Exercise.biomechanicalThresholds`.
  - Eliminati file orfani: `services/ai/exerciseAnalyzer.ts`, `services/biomechanical/poseAnalyzer.ts`, `hooks/useVoiceCoach.ts`, endpoint orfano `api/analysis/biomechanical/route.ts`.
  - Pulite interfacce TS obsolete da `src/types/analysis.ts`: `ThresholdViolation`, `BiomechanicalReport`, `AIExpertReport`, `VideoComparisonReport`, `CombinedReport`, `LiveFeedback`. Rimosso `violations?` da `FrameAnalysis`.
  - Pulito `prisma/seed.ts`: rimossi array `thresholds: [...]` dai literal esercizi (la spec autoritativa è ora `BIOMECHANICAL_SPECS`) e rimosso il loop `prisma.biomechanicalThreshold.deleteMany/create`.
  - Rimossa colonna morta `User.healthConditions` (sostituita da `pastInjuries`).
- **Nota migrazione DB**: alla prossima esecuzione, `npx prisma migrate dev --name drop_biomechanical_threshold_and_legacy_fields` produrrà drop su `biomechanical_thresholds` + 9 colonne in `analysis_sessions` + `health_conditions`.

### 5.2 🌊 Estensione questionario onboarding

- **Owner**: Antigravity
- **Stato**: ✅ **DONE** (30 aprile 2026)
- **File critici**: `src/app/(auth)/onboarding/step{3,4}/page.tsx`, `prisma/schema.prisma`, `src/app/api/onboarding/route.ts`
- **Note**:
  - Aggiungere a step3 sezioni:
    - Dieta attuale (select: onnivora, vegetariana, vegana, chetogenica, mediterranea, altro)
    - Problematiche fisiche (textarea libera, esempi: dolore lombare, problemi ginocchia)
    - Sport pregresso (multi-select: nessuno, calcio, pallavolo, basket, nuoto, corsa, ciclismo, palestra, arti marziali, altro)
  - Aggiornare `User` model con campi: `dietType String?`, `pastInjuries String[]`, `pastSports String[]`
  - Aggiornare `/api/onboarding` Zod schema + saving
  - Aggiornare `buildPlanGeneratorPrompt` in `services/ai/promptTemplates.ts` per includere queste info
  - Migrazione: `npx prisma migrate dev --name onboarding_extended`

### 5.3 🤖 DB piani PT pro come template

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 5, 2 maggio 2026)
- **Implementato**: nuovo modello `WorkoutPlanTemplate` (Prisma) + 10 template seed in `prisma/seed-workout-templates.ts` (generato esternamente seguendo `DATA_AUTHORING_GUIDE.md`). `/api/ai/generate-plan` query 2-3 template matching per `difficulty + targetGoals` e li passa come few-shot examples al prompt Claude.
- **File critici**: `prisma/schema.prisma`, `prisma/seed.ts`, `src/app/api/ai/generate-plan/route.ts`
- **Note**:
  - Nuovo modello: `WorkoutPlanTemplate` con `userId: null`, structure simile a WorkoutPlan ma destinato come template
  - Seed con 5-10 piani realistici (es. "Forza principianti 4 settimane", "Massa intermedio 6 settimane", "Ricomposizione corporea avanzato")
  - Aggiornare `/api/ai/generate-plan` per passare 2-3 template come few-shot examples nel prompt Claude
  - Costo: pochi token in più per chiamata, ma qualità output significativamente migliore

### 5.4 🤖 Generazione piano nutrizionale AI

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 5, 2 maggio 2026)
- **Implementato**: nuovo endpoint `/api/ai/generate-nutrition-plan` con calcolo TDEE Mifflin-St Jeor (fattori attività + adjustment per obiettivo). Modello `NutritionPlanTemplate` + 5 template seed (un dietType ciascuno: onnivora/vegetariana/vegana/chetogenica/mediterranea). Few-shot per matching `dietType + targetGoal`. Output salvato su `User.nutritionPlanJson` (Json).
- **File critici**: `src/app/api/ai/generate-nutrition-plan/route.ts` (nuovo), `prisma/schema.prisma`
- **Note**:
  - Nuovo endpoint POST: input dati questionario (peso, altezza, età, dieta, obiettivo), output piano settimanale
  - Output structure: `{ targetMacros: {kcal, proteinG, carbsG, fatG}, weeklyPlan: { lunedi: { breakfast, lunch, dinner, snacks }, ... } }`
  - Nuovo modello: `NutritionPlan` (oppure `User.nutritionPlanJson Json?` per semplicità)
  - Integrazione step4 onboarding: chiamata in parallelo con `generate-plan` allenamento

---

## FASE 6 — Verifica finale

### 6.1 🤖 Test E2E flusso completo

- **Owner**: Claude Code
- **Stato**: ✅ **DONE** (sessione 11, 22 maggio 2026 — 50/50 verdi, 2.6 min, su `npm run test:e2e`)
- **Pre-requisiti soddisfatti**: setup DB completato (12 maggio), tutte le fasi 1–5 DONE.
- **Lavoro effettuato**: copertura via Playwright (`tests/e2e/`) di 13 spec file → 50 test. Include il giro completo onboarding → genera piano AI mockato → save → dashboard, oltre a workout, analisi, nutrizione, coach, progressi/profilo, password reset, community/GDPR, billing M4, tour/insights M7, daily mission M8 e smoke.
- **Bug residuo di stabilità chiuso in sessione 11**: il test "flusso completo 4 step → onboardingCompleted=true" timeout-ava al cold compile di Turbopack su `/onboarding/step*`. Fix: alzati `test.setTimeout` a 60s e `waitForURL` a 30s su step1→step3 (commit `c4e77fc`).
- **Note**:
  - Eseguire il giro completo: registrazione → login → onboarding 4-step → genera piano AI → vai a `/allenamento/{id}` → "Inizia sessione" → completa serie → PATCH session → achievement unlock → `/analisi` → seleziona esercizio → registra video 15–25s → upload → orchestrazione L1+L2+L3 → vedi `/analisi/report/{id}` con anello SVG e dettagli → `/progressi` verifica stats → `/profilo` verifica streak.
  - Validare graceful degradation L3 (se proFrames non disponibili per CORS → score sentinella → redistribuzione `(L1+L2)/2`).
  - Validare rate limit `analysisRatelimit` (5/h) NON triggera in un giro normale.
  - Validare `/api/ai/generate-nutrition-plan` separatamente e check `User.nutritionPlanJson` popolato.

### 6.2 🌊 Documentazione utente

- **Owner**: Antigravity
- **Stato**: ✅ **DONE** (30 aprile 2026)
- **File critici**: `README.md`
- **Note**:
  - Sezione "Come funziona l'analisi" con step user-facing
  - Spiegazione livelli severity (warning/error/critical)
  - Cosa fare se compare alert injury

---

## Task ancora aperte da progetto v1 (priorità inferiore)

| Task | Stato | Note |
|---|---|---|
| ~~BUG #6 — ripristinare `prisma.ts`~~ | ✅ DONE (sessione 6) | Prisma 7 usa `@/generated/prisma` con adapter, no `require()` |
| ~~Setup `.env.local` con credenziali reali~~ | ✅ DONE (sessione 6) | Supabase eu-west-3, pooler IPv4 |
| ~~Error boundaries globali + toast~~ | ✅ DONE (M0.1, sess. 8) | `(app)/error.tsx`, `global-error.tsx`, `not-found.tsx` (root + app) creati con `unstable_retry` Next 16 |
| PWA service worker offline | TODO (M3 o M5) | `public/sw.js`, registrazione in `app/providers.tsx` |
| ~~PWA icons 192/512 PNG~~ | ✅ DONE (M0.2, sess. 8) | `public/icon-192.png` + `icon-512.png` + `apple-icon.png` generati da `public/icon.svg` via `npm run generate:icons` |
| Community feed | TODO (M3) | `(app)/community/page.tsx` (placeholder); schema DB pronto. Scope: feed read-only MVP |
| Grafici progressi avanzati | PARZIALE | BarChart settimanale + LineChart 30gg già attivi; trend peso/foto sono extra |
| ~~CORS bucket `exercise-videos`~~ | DOC READY (M0.3, sess. 8) | Procedura completa in `CHECKLIST_DEPLOY.md`. Azione manuale utente sul dashboard Supabase |
| Vercel deploy | DOC READY (M5) | Codice production-ready, procedura passo-passo in `CHECKLIST_DEPLOY.md`. Azione utente: push GitHub + import Vercel + env vars |

---

## ROADMAP M0–M5 (verso produzione full)

Master plan: `~/.claude/plans/cosa-manca-da-fare-swirling-puzzle.md`. Scope scelto dall'utente in sessione 8: produzione full con monetizzazione + Community MVP read-only + suite test completa + email/reset password.

| Milestone | Scope | Stato |
|---|---|---|
| **M0** Quick wins | error boundaries, PWA icons, CORS doc, roadmap update | ✅ DONE |
| **M1** Test E2E suite completa | Playwright + 19 test (auth, onboarding, workout, analisi, nutrizione, coach, progressi, profilo, smoke) | ✅ DONE — 19/19 passed in 1.2 min |
| **M2** Email + reset password + verify email | Resend wrapper (dev fallback), token tables, 4 API, 3 pagine UI, hook signup, 6 test E2E | ✅ DONE — 25/25 passed |
| **M3** Sentry + GDPR + Community MVP + PWA SW | observability wrapper, privacy/terms, cookie banner, data export/delete, profileVisibility, feed read-only, SW offline, 7 test | ✅ DONE — 32/32 passed |
| **M4** Stripe + piani free/premium | schema Subscription+UsageCounter, stripe wrapper, gating, 4 API (checkout/portal/webhook/status), pagina /abbonamento, navbar, 7 test | ✅ DONE — 39/39 passed |
| **M5** Vercel deploy + analytics + go-live | vercel.json, .env.example, Vercel Analytics, health endpoint, build production verified, procedura 11 step in CHECKLIST | ✅ DONE (code-side) — 40/40 passed |
| **M6** Bug fixes residui | nutrizione macros (proteinG/carbsG/fatG corretti), pagina /allenamento/nuovo creata, 1 test E2E | ✅ DONE |
| **M7** Welcome tour + Insights dashboard | WelcomeTour modal 5 step su /dashboard, API progressi estesa (daysActive30, weeklyVolume 8sett, avgFeeling), card "I tuoi insight" + bar chart settimanale, 4 test | ✅ DONE — 45/45 passed |
| **M8** Daily Mission dashboard hero | Modello `DailyCheckin` + getDailyMission server fn, POST `/api/daily-checkin`, componente `DailyMissionCard` hero (3 task adattivi: workout di oggi, nutrizione 3 pasti, check-in mood 5 emoji), dashboard rimontata con header compresso streak/punti, 5 test E2E + 2 commit di stabilizzazione (timeout onboarding, script reset-quota utility) | ✅ DONE — 50/50 passed (sessione 11, 22 maggio 2026, push `0dc3720..ea86037` su origin/main) |

---

## Convenzioni per agent

### Quando aggiornare questo file
- Marca task come `IN_PROGRESS` quando inizi
- Marca come `DONE` quando hai verificato che funziona (no errori TS, smoke test ok)
- Se trovi nuove task durante l'esecuzione, aggiungile in fondo alla fase pertinente
- Se cambi approccio (es. opzione B → opzione A), aggiorna le note esecutive

### Cosa NON fare
- ❌ Non modificare `ANALYSIS_SPEC.md` senza approvazione utente (è la spec autoritativa)
- ❌ Non eliminare `BiomechanicalThreshold` prima di Fase 5.1 (rompe migrazione)
- ❌ Non commitare codice con errori TS sui file modificati (gli errori `any` impliciti pre-esistenti restano fino a Prisma generate)
- ❌ Non disinstallare pacchetti senza grep esaustivo prima
- ❌ Non aggiungere dipendenze nuove senza giustificazione (preferire builtin)

### File mai da toccare senza ragione
- `prisma/migrations/` — generati automaticamente
- `node_modules/`, `.next/`, `tsbuildinfo`
- `package-lock.json` — solo `npm install/uninstall` lo modifica

---

## Coordinamento Claude Code ↔ Antigravity

Quando Claude Code finisce una sessione e Antigravity prende in carico (o viceversa):
1. Aggiornare lo stato delle task in questo file
2. Aggiornare la memoria `~/.claude/projects/.../memory/project_fitai_state.md` con le novità
3. Se è stata presa una decisione di design importante, aggiungerla a `STATO_PROGETTO.md` sezione "Note tecniche"
4. Se sono cambiati i nomi di funzioni/file critici, aggiornare la tabella "File critici" del master plan

L'obiettivo è che chiunque (Claude Code in nuova sessione, Antigravity, l'utente stesso) possa **partire da zero leggendo solo questi 5 documenti**:
- `DOCUMENTAZIONE_FLUSSI.md` — **entry point sviluppatori**: come funziona tutta l'app, sezione per sezione, con `path:line`
- `ANALYSIS_SPEC.md` — cosa deve fare il sistema di analisi (spec dettagliata I/O dei 3 livelli)
- `ROADMAP.md` (questo file) — cosa è ancora da fare e in che ordine
- `STATO_PROGETTO.md` — overview e stato
- `~/.claude/plans/ok-ora-che-ho-quizzical-kernighan.md` — master plan implementativo storico (riferimento)
