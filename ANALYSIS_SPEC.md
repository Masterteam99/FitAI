# FitAI — Specifica Analisi Tripartita

*Versione 2.1 — aggiornata 22 luglio 2026 (pesi allineati all'implementazione)*

*Documento autoritativo per il **disegno** dell'analisi (obiettivi, struttura dei dati, pipeline).
Per i **valori numerici e il comportamento a runtime** la fonte di verità è il codice:
`src/services/analysis/weights.ts` (pesi), `src/services/biomechanical/` (L1),
`src/services/ai/` (L2/L3 e report). In caso di divergenza, vince il codice.*

---

## 1. Panoramica del flusso utente

```
1. Registrazione + questionario (obiettivi, antropometria, problematiche, dieta)
2. Sistema genera piano allenamento + nutrizionale (AI + DB piani PT pro)
3. Utente apre sessione giornaliera → vede lista esercizi
4. Click esercizio → schermata esercizio:
   - mostra VIDEO_RIF_1 (PT pro, da Exercise.videoUrl)
   - mostra descrizione + note tecniche
   - bottone "Inizia"
5. Bottone "Inizia" → camera attivata (webcam o mobile)
6. Countdown 15s (preparazione utente)
7. Registrazione 15-25s video utente (durata da Exercise.recordingDurationSeconds)
8. Stop registrazione automatico
9. Upload video → triplice analisi parallela
10. Visualizzazione feedback ponderato unico (target: ≤2 minuti)
```

**Differenza critica vs versione precedente:** durante l'esecuzione **NON c'è feedback in tempo reale** (no skeleton overlay, no voce). L'analisi è interamente **post-acquisizione**.

---

## 2. La Triplice Analisi

### Pesi e tempo target

| Logica | Peso | Tempo max |
|---|---|---|
| L1 — Biomeccanica deterministica | **50%** | <5s |
| L2 — AI Expert (vision) | **30%** | ~30s |
| L3 — Confronto video utente vs PT pro | **20%** | ~60s |
| **Totale dall'upload al feedback** | | **≤120s** |

> **Pesi aggiornati (M12).** I pesi originali di questa spec erano 34/33/33; l'implementazione li ha portati a **50/30/20** — L1 (biomeccanica oggettiva) domina, L2 e L3 sono advisory. Fonte di verità unica: `src/services/analysis/weights.ts` (`ANALYSIS_WEIGHTS`). Senza video PT il peso di L3 è ridistribuito su L1/L2 → **62,5% / 37,5%**.

### Logica 1 — Biomeccanica Deterministica (50%)

**Obiettivo:** analisi numerica oggettiva basata su regole.

**Pipeline:**
```
video utente (15-25s)
  → MediaPipe Pose Landmarker (worldLandmarks 3D + landmarks 2D)
  → estrazione angoli articolari per ogni frame
  → state machine fase movimento (eccentric/concentric/isometric/top/bottom)
  → matching frame con fase corrente
  → applicazione trigger ESERCIZIO_SPEC[exerciseSlug] per fase
  → output: lista trigger attivati + feedback associati + score
```

**Schema dati per esercizio (ESERCIZIO_SPEC):**
```typescript
interface ExerciseBiomechanicalSpec {
  exerciseSlug: string;
  movements: MovementSpec[];
}

interface MovementSpec {
  joint: "left_knee" | "right_knee" | "left_elbow" | ...;
  movementType: "flessione" | "estensione" | "abduzione" | "rotazione" | "inclinazione";
  phases: PhaseTrigger[];
}

interface PhaseTrigger {
  phase: "eccentric" | "concentric" | "isometric" | "top" | "bottom" | "throughout";
  acceptableRange: { min: number; max: number };  // angolo in gradi
  triggers: TriggerCondition[];
}

interface TriggerCondition {
  condition: "below_min" | "above_max" | "out_of_range";
  severity: "WARNING" | "ERROR" | "CRITICAL";
  feedback: string;        // testo italiano da mostrare all'utente
  injuryRisk: boolean;     // se true, contribuisce all'alert infortuni
}
```

**Esempio (squat):**
```json
{
  "exerciseSlug": "squat",
  "movements": [
    {
      "joint": "left_knee",
      "movementType": "flessione",
      "phases": [
        {
          "phase": "bottom",
          "acceptableRange": { "min": 70, "max": 110 },
          "triggers": [
            {
              "condition": "above_max",
              "severity": "ERROR",
              "feedback": "Il ginocchio sinistro è troppo avanzato rispetto alla punta del piede. Porta il peso sui talloni.",
              "injuryRisk": true
            },
            {
              "condition": "below_min",
              "severity": "WARNING",
              "feedback": "Stai scendendo troppo: rischio sovraccarico sul ginocchio.",
              "injuryRisk": true
            }
          ]
        },
        {
          "phase": "eccentric",
          "acceptableRange": { "min": 110, "max": 170 },
          "triggers": [...]
        }
      ]
    },
    {
      "joint": "spine",
      "movementType": "inclinazione",
      "phases": [
        {
          "phase": "throughout",
          "acceptableRange": { "min": 0, "max": 35 },
          "triggers": [...]
        }
      ]
    }
  ]
}
```

**State machine fase movimento:**
- Identificazione automatica fasi tramite analisi temporale degli angoli chiave
- Es. squat: `bottom` = frame con `min(leftKnee, rightKnee)`, `top` = frame con `max(leftKnee, rightKnee)`, `eccentric` = transizione top→bottom, `concentric` = bottom→top, `throughout` = tutto il video
- Soglia minima persistenza violazione: 5 frame consecutivi (~200ms a 25fps) per evitare falsi positivi da jitter MediaPipe

**Score:** `100 - Σ(severity_weight × persistence_factor) / total_phases`

**Output L1:**
```typescript
interface L1Result {
  score: number;
  triggeredFeedback: { feedback: string; severity: string; injuryRisk: boolean }[];
  detectedPhases: { phase: string; durationFrames: number }[];
  rawAngles: AngleTimeSeries;  // serie temporali per debug
}
```

### Logica 2 — AI Expert Vision (30%)

**Obiettivo:** valutazione qualitativa di un PT professionista che guarda il video.

**Pipeline:**
```
video utente (15-25s)
  → estrazione 6-8 frame chiave (1 ogni ~3s + bottom/top automatici)
  → invio a Claude Sonnet 4.6 con messaggio multimodale (immagini + testo)
  → prompt: "Sei un PT esperto, valuta questa esecuzione di {exerciseName}"
  → Claude analizza visivamente postura, simmetria, fluidità, controllo
  → output JSON strutturato
```

**Sostituisce l'attuale `analyzeExerciseWithAI`** che vede solo numeri testuali.

**Tecnologia:** Anthropic SDK supporta input vision con `image` content blocks (base64 o URL). Va richiesto a Claude di **non duplicare** l'analisi numerica di L1 ma di concentrarsi su aspetti visivi che L1 non può cogliere (timing, controllo del peso, espressioni di sforzo, breathing pattern, asimmetrie sottili).

**Output L2:**
```typescript
interface L2Result {
  score: number;
  qualitativeAnalysis: string;   // ~150 parole
  visualObservations: string[];  // 3-5 osservazioni visive
  injuryRiskFlags: string[];
}
```

### Logica 3 — Confronto Video Utente vs PT Pro (20%)

**Obiettivo:** misurare quanto l'esecuzione si discosta dal modello professionale.

**Pipeline:**
```
video utente (15-25s) + VIDEO_RIF_1 (Exercise.videoUrl)
  → estrai 6 frame allineati per fase da entrambi (es. bottom dell'utente vs bottom del PT)
  → invio a Claude Sonnet 4.6 con messaggio multimodale (12 immagini totali, etichettate)
  → prompt: "Confronta queste 6 coppie utente/professionista per {exerciseName}"
  → Claude evidenzia differenze postura/timing/range
  → output JSON strutturato
```

**Allineamento per fase:** per confrontare frame omologhi serve identificare la stessa fase nei due video (es. il momento di massima flessione del ginocchio in entrambi). La state machine di L1 fornisce gli indici frame della fase `bottom` e `top`.

**Output L3:**
```typescript
interface L3Result {
  score: number;
  comparisonFeedback: string;     // ~150 parole
  keyDifferences: { aspect: string; user: string; pro: string }[];
}
```

### Feedback Ponderato Finale

Le 3 logiche girano in parallelo. Quando tutte e 3 sono pronte:

```typescript
// Implementazione reale: src/services/analysis/weights.ts
combinedScore = round(L1.score * 0.50 + L2.score * 0.30 + L3.score * 0.20)   // con video PT
combinedScore = round(L1.score * 0.625 + L2.score * 0.375)                    // senza video PT
```

Un **quarto step Claude** (Haiku 4.5, veloce) riceve i 3 output e produce il **giudizio sintetico finale**:

```typescript
interface FinalReport {
  combinedScore: number;
  overallJudgment: string;          // 100 parole, narrativa unica
  prioritizedImprovements: string[]; // 3-5 punti, ordinati per impatto
  injuryRiskAlert: {
    level: "BASSO" | "MEDIO" | "ALTO";
    explanation: string;
    affectedAreas: string[];
  };
  positiveAspects: string[];
}
```

Il prompt del 4° step istruisce Claude di:
- Dare priorità ai trigger CRITICAL di L1 nel giudizio
- Riconciliare contraddizioni (es. L1 dice score 90 ma L2 dice "ginocchio instabile") prediligendo L2 su aspetti visivi e L1 su aspetti numerici
- Combinare gli `injuryRisk` di L1 e gli `injuryRiskFlags` di L2 in un unico alert

---

## 3. Modello dati richiesto

### Modifiche allo schema Prisma

**Nuovi modelli:**
```prisma
model ExerciseBiomechanicalSpec {
  id              String    @id @default(cuid())
  exerciseId      String    @unique
  exercise        Exercise  @relation(fields: [exerciseId], references: [id])
  movements       ExerciseMovement[]
}

model ExerciseMovement {
  id              String    @id @default(cuid())
  specId          String
  spec            ExerciseBiomechanicalSpec @relation(fields: [specId], references: [id])
  joint           String    // left_knee, spine, etc.
  movementType    String    // flessione, estensione, etc.
  phases          MovementPhase[]
}

model MovementPhase {
  id              String    @id @default(cuid())
  movementId      String
  movement        ExerciseMovement @relation(fields: [movementId], references: [id])
  phase           String    // eccentric, concentric, top, bottom, throughout
  minAngle        Float
  maxAngle        Float
  triggers        PhaseTrigger[]
}

model PhaseTrigger {
  id              String    @id @default(cuid())
  phaseId         String
  phase           MovementPhase @relation(fields: [phaseId], references: [id])
  condition       String    // below_min, above_max, out_of_range
  severity        String    // WARNING, ERROR, CRITICAL
  feedback        String
  injuryRisk      Boolean
}
```

**Modifiche a `Exercise`:**
```prisma
model Exercise {
  // campi esistenti...
  recordingDurationSeconds Int @default(20)  // 15-25s
}
```

**Modifiche a `AnalysisSession`:**
```prisma
model AnalysisSession {
  // campi esistenti...
  userVideoUrl       String?  // URL Supabase Storage del video acquisito
  l1Result           Json?
  l2Result           Json?
  l3Result           Json?
  finalReport        Json?
}
```

### Cleanup
- ❌ Eliminare `BiomechanicalThreshold` (sostituito dalla nuova gerarchia)
- ❌ Rimuovere il vecchio `frameHistory` payload da `/api/analysis/complete` (i frame vengono estratti server-side dal video)

---

## 4. Constraint tecnici

### Acquisizione video
- Durata fissa per esercizio: 15-25s, default 20s
- Codec: WebM (browser nativo) o MP4
- Risoluzione: max 720p per limitare upload
- Storage: Supabase Storage bucket `analysis-videos` (già configurato in `lib/supabase.ts`)

### Pose detection server-side
- L'analisi MediaPipe per L1 può rimanere client-side (real-time durante registrazione, salvata silenziosamente) **OPPURE** server-side (più affidabile). Decisione: **client-side ma silenziosa** (no UI durante l'esecuzione), invio frameHistory + video al backend.

### Vision API (L2 + L3)
- Modello: Claude Sonnet 4.6 per analisi sostantive
- Modello: Claude Haiku 4.5 per il finalReport (più veloce)
- Estrazione frame: server-side via `ffmpeg` o lib JS (`@ffmpeg/ffmpeg` WebAssembly)
- Limit immagini per richiesta: max 20 (Anthropic limit), 6-8 frame chiave sono sufficienti

### Tempo target
- Upload video (10MB tipico, mobile 4G): ~10-15s
- L1 (calcolo locale + DB query): <5s
- L2 (Claude vision con 8 immagini): ~25-40s
- L3 (Claude vision con 12 immagini): ~40-60s
- Final report (Haiku con 3 testi): ~5-10s
- **Totale: 90-130s** (stretto per il target 1-2 min, ma fattibile con parallelizzazione L1+L2+L3)
