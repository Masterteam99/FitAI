# Design — Profilo biomeccanico di riferimento del PT (L3 numerico)

*14 luglio 2026*

## Obiettivo

Analizzare biomeccanicamente il video PT di un esercizio **una volta sola** (all'upload admin),
salvare il profilo angoli per `giunto × fase`, e usarlo come **riferimento numerico deterministico**
per confrontare l'esecuzione dell'utente. Il confronto col PT oggi dipende da un'estrazione di 6 frame
ripetuta lato client a ogni sessione (fragile: CORS, formato, costo) e non produce dati numerici.

## Stato attuale (verificato)

- Pose detection MediaPipe gira **solo nel browser** (`src/hooks/usePoseDetection.ts`): WASM + `<video>` dal vivo.
- L1 usa l'intero `frameHistory` (angoli 3D denso) vs soglie **scritte a mano** in `prisma/seed-biomechanical-specs.ts` (52/53 esercizi).
- L2 = Claude vision su 8 frame utente. L3 = Claude vision su 6 frame PT + 8 utente.
- I 6 frame PT sono estratti **lato client a ogni sessione** (`src/lib/analysis/frame-capture.ts::extractProFrames`), non persistiti; `Exercise` salva solo `videoUrl`.
- Pesi: `src/services/analysis/weights.ts` → con PT 50/30/20 (L1/L2/L3), senza PT 62.5/37.5.
- Orchestrazione: `src/app/api/analysis/complete/route.ts` (allSettled, sentinella L3 `-1`, degradazione).

## Decisioni di design (confermate con l'utente)

1. **L1 e L2 restano invariati.** Le soglie di sicurezza scritte a mano restano la fonte degli alert infortunio.
2. **L3 diventa "numerico + vision" affiancati.** Si aggiunge un confronto numerico deterministico; la vision di Claude resta.
3. **Estrazione del profilo PT: nel browser admin, all'upload** (opzione A), riusando la pipeline MediaPipe esistente. Nessuna infrastruttura server nuova.
4. **Una volta e persistente.** Il profilo è salvato su `Exercise` e riusato per sempre; **mai** ri-estratto per-sessione.
5. **Retrocompatibile.** Se il profilo manca, L3 si comporta come oggi (solo vision / sentinella). Zero regressioni.

Fuori scope: feedback in tempo reale (rimosso in v2, resta rimosso); pipeline pose lato server.

## Modello dati

Nuovi campi su `Exercise` (`prisma/schema.prisma`):

```prisma
referenceProfile        Json?      // profilo biomeccanico del PT
referenceProfileAt      DateTime?  // quando generato
referenceProfileVersion Int?       // invalidazione se cambia la pipeline
```

Forma di `referenceProfile` — **simmetrica alla spec L1** (stesse coppie giunto/fase):

```ts
interface ReferenceProfile {
  movements: Array<{
    joint: string;        // es. "spine", "left_knee"
    phase: string;        // es. "THROUGHOUT", "BOTTOM"
    minAngle: number;
    maxAngle: number;
    meanAngle: number;
    sampleCount: number;
  }>;
  meta: { fps: number; totalFrames: number; detectedReps: number };
}
```

Compatto (poche decine di numeri), **non salva frame**. `referenceProfileVersion` = costante `REFERENCE_PROFILE_VERSION`
incrementata se cambia la logica di `buildReferenceProfile`.

## Componenti (unità isolate, testabili)

### 1. `buildReferenceProfile(frameHistory, timeline) → ReferenceProfile`
- **Modulo puro** (no DOM, no React, no rete) → `src/services/analysis/referenceProfile.ts`.
- Input: `FrameAnalysis[]` (angoli per frame) + `timeline` da `detectPhases`.
- Output: per ogni `(giunto × fase)` calcola min/max/media degli angoli campionati.
- **Usato sia per il PT sia per l'utente** → simmetria garantita per costruzione.
- Unit-testabile (vitest node env).

### 2. `compareToReference(userProfile, ptProfile, opts) → { numericScore, keyDifferences[] }`
- **Modulo puro** → stesso file `referenceProfile.ts` o `referenceCompare.ts`.
- Per ogni `(giunto × fase)` presente in entrambi: deviazione `|user.meanAngle − pt.meanAngle|` normalizzata su tolleranza per-giunto (default **±15°**, `DEFAULT_TOLERANCE_DEG`).
- `numericScore` 0–100 = media (o media pesata) delle aderenze per coppia.
- `keyDifferences[]` = coppie ordinate per deviazione decrescente, con testo generato da template (es. *"anca in BOTTOM: 18° più chiusa del riferimento PT"*).
- Unit-testabile.

### 3. Estrazione lato browser admin
- Hook/util `extractReferenceProfileFromVideo(url) → ReferenceProfile` → `src/lib/analysis/pt-profile-extract.ts` (client).
- Riproduce il video PT in un `<video>` nascosto, campiona a **~12 fps** (`PT_SAMPLE_FPS`), per ogni frame gira `PoseLandmarker` → `computeJointAngles` → costruisce `frameHistory`, poi `detectPhases` + `buildReferenceProfile`.
- Riusa `mapWorldLandmarks`/`computeJointAngles` esistenti; NON ridisegna scheletri.
- UI admin: dopo l'upload PT chiama l'estrazione e poi `POST` al nuovo endpoint. Più un'azione **"Ri-processa"** per i video già caricati.

### 4. Endpoint admin di persistenza
- `POST /api/admin/exercises/[id]/reference-profile` (gated `requireAdmin`, audit `AdminActionType.UPLOAD_PT_VIDEO` o nuovo `BUILD_REFERENCE_PROFILE`).
- Body: `ReferenceProfile` (Zod-validato). Salva `referenceProfile`, `referenceProfileAt`, `referenceProfileVersion` su `Exercise`.
- Responso: `{ ok, movements: n }`.

### 5. Integrazione in `complete/route.ts` (L3 combinato)
- Carica `exercise.referenceProfile` (già incluso via `findFirst`).
- Ricostruisce il profilo utente: `buildReferenceProfile(frameHistory, timeline)`.
- Se `referenceProfile` presente → `compareToReference` → `numericScore` + `keyDifferences`.
- Vision L3 invariata (se `proFrames.length > 0`).
- **L3 combinato**: `l3.score = round(0.6·numericScore + 0.4·visionScore)` (`L3_NUMERIC_WEIGHT = 0.6`); se uno manca, l'altro pesa 100%. `l3Result` porta entrambi: `numericScore`, `keyDifferences`, `comparisonFeedback` (vision).
- Sentinella e degradazione allSettled invariate.

## Flusso runtime completo (utente preme "play")

**Precondizione (una volta)**: admin ha caricato il video PT → browser admin ha estratto `referenceProfile` → salvato su `Exercise`.

1. `POST /api/analysis/start` — gating (rate-limit 5/h + quota free) → crea `AnalysisSession` (RECORDING).
2. Countdown 15s → camera on. In parallelo il client estrae 6 frame PT (solo per la **vision** L3, best-effort). Il numerico NON dipende da questo.
3. Registrazione ~20s: MediaRecorder + `usePoseDetection` (frameHistory denso) + 8 frame JPEG (per L2).
4. Upload video → Supabase `analysis-videos`.
5. `POST /api/analysis/complete` con `frameHistory` + 8 frame utente + 6 frame PT + durata:
   - `detectPhases` → timeline utente.
   - **L1** (locale): `evaluateExerciseSpec` vs soglie di sicurezza → alert (es. schiena inclinata). Peso 50%.
   - **L2** (Claude vision, 8 frame): giudizio qualitativo. Peso 30%.
   - **L3** (🆕 numerico + vision): profilo utente via `buildReferenceProfile` → `compareToReference` vs PT (numerico) + vision Claude → combinato 0.6/0.4. Peso 20%.
   - **Report finale** (Haiku): sintesi. `combinedScore = 0.5·L1 + 0.3·L2 + 0.2·L3`.
6. Redirect `/analisi/report/{id}`: L1 (errori sicurezza) + L2 (narrazione) + 🆕 L3 (numeri + differenze chiave + narrazione vision) + alert + "tecnica ricostruita".

**Fallback**: `referenceProfile` vuoto → numerico saltato → L3 come oggi (solo vision / sentinella).

## Parametri di taratura (default)

- `PT_SAMPLE_FPS = 12` — campionamento del video PT.
- `DEFAULT_TOLERANCE_DEG = 15` — tolleranza per-giunto nel confronto numerico.
- `L3_NUMERIC_WEIGHT = 0.6` — peso del numerico dentro L3 (vision 0.4).
- `REFERENCE_PROFILE_VERSION = 1`.

Tutti centralizzati in un unico modulo di config dell'analisi.

## Testing

- **Unit (vitest, node)**: `buildReferenceProfile` (riduzione per-fase corretta su frameHistory sintetico) e `compareToReference` (score/keyDifferences su profili noti, casi limite: coppia mancante, deviazione zero, oltre tolleranza). Deterministici.
- L'estrazione browser e l'integrazione route restano verificabili manualmente / E2E (non node-testabili perché MediaPipe è browser-only).

## Migrazione e retrocompatibilità

- Migrazione Prisma additiva (3 campi nullable) — nessun dato esistente rotto.
- Video PT già caricati: azione admin "Ri-processa" genera i profili on-demand. Finché non ri-processati, L3 resta vision-only (comportamento odierno).

## File toccati (previsti)

- `prisma/schema.prisma` (+migrazione) — 3 campi su `Exercise`.
- `src/services/analysis/referenceProfile.ts` — `buildReferenceProfile`, `compareToReference` (puri) + test.
- `src/services/analysis/config.ts` (o estensione `weights.ts`) — costanti di taratura.
- `src/lib/analysis/pt-profile-extract.ts` — estrazione browser.
- `src/app/api/admin/exercises/[id]/reference-profile/route.ts` — persistenza.
- `src/app/(app)/admin/exercises/page.tsx` + componente admin — bottone estrai/ri-processa.
- `src/app/api/analysis/complete/route.ts` — L3 combinato.
- `src/app/(app)/analisi/report/[id]/page.tsx` — mostrare numeri L3 + differenze chiave.
- `src/types/analysis.ts` — tipi `ReferenceProfile`, estensione `L3Result`.
