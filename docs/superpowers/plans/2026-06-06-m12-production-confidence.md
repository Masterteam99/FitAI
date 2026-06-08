# M12 — Production Confidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere unit test al motore di analisi, ribilanciare i pesi dell'analisi a 50/30/20, installare Sentry reale e una CI GitHub Actions, senza toccare gli E2E esistenti.

**Architecture:** Vitest affiancato a Playwright (runner separati). I pesi dell'analisi diventano una funzione pura `computeCombinedScore` in un modulo unico, coperta da test. Sentry passa da stub a integrazione ufficiale Next 16 mantenendo il wrapper `observability.ts`. La CI gira typecheck+lint+unit (veloce) ed E2E (con Postgres di servizio).

**Tech Stack:** Vitest, @vitest/coverage-v8, @sentry/nextjs, GitHub Actions, Next 16, Prisma 7, Playwright (esistente).

---

## File Structure

- Create: `vitest.config.ts` — config Vitest (env node, alias `@/`, include solo `src/**/*.test.ts`).
- Create: `src/services/analysis/weights.ts` — `ANALYSIS_WEIGHTS` + `computeCombinedScore` (unica fonte di verità dei pesi).
- Create: `src/services/analysis/weights.test.ts` — test della funzione pura.
- Create: `src/services/biomechanical/angleCalculator.test.ts`
- Create: `src/services/biomechanical/phaseDetector.test.ts`
- Create: `src/services/biomechanical/specEvaluator.test.ts`
- Create: `src/services/ai/finalReportGenerator.test.ts`
- Create: `src/services/ai/visionAnalyzer.test.ts`
- Modify: `src/services/ai/finalReportGenerator.ts` — usa `computeCombinedScore`, aggiunge param `hasProVideo`.
- Modify: `src/app/api/analysis/complete/route.ts` — passa `hasProVideo`, rimpiazza i magic number nel fallback.
- Modify: `package.json` — script test:unit, devDep Vitest, dep @sentry/nextjs.
- Create: file di config Sentry (Fase 3, shape esatta da verificare sui doc installati).
- Modify: `src/lib/observability.ts` — integrazione Sentry pulita.
- Create: `.github/workflows/ci.yml` — CI.

---

# FASE 1 — Infra Vitest

## Task 1: Installare e configurare Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/services/biomechanical/angleCalculator.test.ts` (placeholder verde)

- [ ] **Step 1: Installare le dipendenze**

Run: `npm install -D vitest @vitest/coverage-v8`
Expected: pacchetti aggiunti a `devDependencies`, nessun errore.

- [ ] **Step 2: Creare `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

- [ ] **Step 3: Aggiungere gli script a `package.json`**

Dentro `"scripts"`, dopo `"test:e2e:debug"`, aggiungere:

```json
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:coverage": "vitest run --coverage"
```

- [ ] **Step 4: Scrivere un test segnaposto che verifica la pipeline**

```ts
// src/services/biomechanical/angleCalculator.test.ts
import { describe, it, expect } from "vitest";
import { computeJointAngles } from "./angleCalculator";
import type { Keypoint } from "@/lib/pose";

describe("computeJointAngles (smoke)", () => {
  it("ritorna oggetto vuoto se non ci sono keypoint validi", () => {
    const kps: Keypoint[] = [];
    expect(computeJointAngles(kps)).toEqual({});
  });
});
```

- [ ] **Step 5: Eseguire i test**

Run: `npm run test:unit`
Expected: 1 file, 1 test PASS. Nessun file di `tests/e2e/` raccolto.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/services/biomechanical/angleCalculator.test.ts
git commit -m "test(infra): add Vitest + config + smoke test"
```

---

# FASE 2 — Copertura del cuore + nuova ripartizione pesi

## Task 2: Modulo pesi `computeCombinedScore` (TDD)

**Files:**
- Create: `src/services/analysis/weights.test.ts`
- Create: `src/services/analysis/weights.ts`

- [ ] **Step 1: Scrivere il test che fallisce**

```ts
// src/services/analysis/weights.test.ts
import { describe, it, expect } from "vitest";
import { computeCombinedScore, ANALYSIS_WEIGHTS } from "./weights";

describe("computeCombinedScore", () => {
  it("con video PT applica i pesi 50/30/20", () => {
    expect(computeCombinedScore(80, 60, 40, { hasProVideo: true })).toBe(66);
  });

  it("senza video PT applica 62.5/37.5 e ignora L3", () => {
    expect(computeCombinedScore(80, 60, -1, { hasProVideo: false })).toBe(73);
  });

  it("senza video PT il valore di L3 non cambia il risultato", () => {
    const a = computeCombinedScore(80, 60, -1, { hasProVideo: false });
    const b = computeCombinedScore(80, 60, 999, { hasProVideo: false });
    expect(a).toBe(b);
  });

  it("i pesi sono normalizzati", () => {
    const p = ANALYSIS_WEIGHTS.withProVideo;
    expect(p.l1 + p.l2 + p.l3).toBeCloseTo(1);
    const np = ANALYSIS_WEIGHTS.withoutProVideo;
    expect(np.l1 + np.l2).toBeCloseTo(1);
  });
});
```

- [ ] **Step 2: Eseguire il test per verificare che fallisce**

Run: `npm run test:unit -- weights`
Expected: FAIL — `Cannot find module './weights'`.

- [ ] **Step 3: Implementare il modulo**

```ts
// src/services/analysis/weights.ts

// Pesi della triplice analisi. Fonte di verità unica: NON duplicare altrove.
// L1 (biomeccanica oggettiva) domina; L2 (vision AI) e L3 (confronto PT) sono advisory.
export const ANALYSIS_WEIGHTS = {
  withProVideo: { l1: 0.5, l2: 0.3, l3: 0.2 },
  // Senza video PT, il peso di L3 è ridistribuito in proporzione su L1/L2.
  withoutProVideo: { l1: 0.625, l2: 0.375 },
} as const;

export function computeCombinedScore(
  l1Score: number,
  l2Score: number,
  l3Score: number,
  opts: { hasProVideo: boolean }
): number {
  if (opts.hasProVideo) {
    const w = ANALYSIS_WEIGHTS.withProVideo;
    return Math.round(l1Score * w.l1 + l2Score * w.l2 + l3Score * w.l3);
  }
  const w = ANALYSIS_WEIGHTS.withoutProVideo;
  return Math.round(l1Score * w.l1 + l2Score * w.l2);
}
```

- [ ] **Step 4: Eseguire il test per verificare che passa**

Run: `npm run test:unit -- weights`
Expected: 4 test PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/analysis/weights.ts src/services/analysis/weights.test.ts
git commit -m "feat(analysis): ANALYSIS_WEIGHTS 50/30/20 + computeCombinedScore puro"
```

---

## Task 3: Test `computeJointAngles` (angoli)

**Files:**
- Modify: `src/services/biomechanical/angleCalculator.test.ts`

- [ ] **Step 1: Sostituire lo smoke test con casi reali**

```ts
// src/services/biomechanical/angleCalculator.test.ts
import { describe, it, expect } from "vitest";
import { computeJointAngles } from "./angleCalculator";
import type { Keypoint } from "@/lib/pose";

function kp(name: string, x: number, y: number, score = 1): Keypoint {
  return { name, x, y, score };
}

describe("computeJointAngles", () => {
  it("ritorna oggetto vuoto senza keypoint validi", () => {
    expect(computeJointAngles([])).toEqual({});
  });

  it("calcola il gomito sinistro a 90 gradi", () => {
    // vertice = gomito in (0,0); polso in (1,0); spalla in (0,1) => 90°
    const kps = [
      kp("left_wrist", 1, 0),
      kp("left_elbow", 0, 0),
      kp("left_shoulder", 0, 1),
    ];
    const angles = computeJointAngles(kps);
    expect(angles.leftElbow).toBeCloseTo(90, 1);
  });

  it("ignora i keypoint con confidence troppo bassa (<=0.3)", () => {
    const kps = [
      kp("left_wrist", 1, 0, 0.1),
      kp("left_elbow", 0, 0, 0.1),
      kp("left_shoulder", 0, 1, 0.1),
    ];
    expect(computeJointAngles(kps).leftElbow).toBeUndefined();
  });
});
```

- [ ] **Step 2: Eseguire**

Run: `npm run test:unit -- angleCalculator`
Expected: 3 test PASS.

- [ ] **Step 3: Commit**

```bash
git add src/services/biomechanical/angleCalculator.test.ts
git commit -m "test(biomech): copertura computeJointAngles"
```

---

## Task 4: Test `detectPhases`

**Files:**
- Create: `src/services/biomechanical/phaseDetector.test.ts`

- [ ] **Step 1: Scrivere i test**

```ts
// src/services/biomechanical/phaseDetector.test.ts
import { describe, it, expect } from "vitest";
import { detectPhases } from "./phaseDetector";
import type { FrameAnalysis } from "@/types/analysis";

function frameWithKnee(timestamp: number, knee: number): FrameAnalysis {
  return { timestamp, keypoints: [], angles: { leftKnee: knee, rightKnee: knee } };
}

describe("detectPhases", () => {
  it("ritorna timeline vuota senza frame", () => {
    const t = detectPhases([], "squat");
    expect(t.framePhases).toEqual([]);
    expect(t.detectedPhases).toEqual([]);
  });

  it("esercizio statico (plank) => tutte le fasi THROUGHOUT", () => {
    const frames = Array.from({ length: 12 }, (_, i) => frameWithKnee(i, 180));
    const t = detectPhases(frames, "plank");
    expect(t.framePhases.every((p) => p === "THROUGHOUT")).toBe(true);
  });

  it("squat con escursione knee rileva BOTTOM e TOP", () => {
    const pattern = [
      ...Array(10).fill(170),
      ...Array(10).fill(80),
      ...Array(10).fill(170),
    ];
    const frames = pattern.map((k, i) => frameWithKnee(i, k));
    const t = detectPhases(frames, "squat");
    expect(t.framePhases.length).toBe(30);
    const phases = t.detectedPhases.map((d) => d.phase);
    expect(phases).toContain("BOTTOM");
    expect(phases).toContain("TOP");
  });

  it("escursione minima (<15 gradi) => ISOMETRIC", () => {
    const frames = Array.from({ length: 15 }, (_, i) => frameWithKnee(i, 100 + (i % 2)));
    const t = detectPhases(frames, "squat");
    expect(t.framePhases.every((p) => p === "ISOMETRIC")).toBe(true);
  });
});
```

- [ ] **Step 2: Eseguire**

Run: `npm run test:unit -- phaseDetector`
Expected: 4 test PASS.

- [ ] **Step 3: Commit**

```bash
git add src/services/biomechanical/phaseDetector.test.ts
git commit -m "test(biomech): copertura detectPhases (statico/dinamico/isometrico)"
```

---

## Task 5: Test `evaluateExerciseSpec` (scoring L1)

**Files:**
- Create: `src/services/biomechanical/specEvaluator.test.ts`

- [ ] **Step 1: Scrivere i test**

```ts
// src/services/biomechanical/specEvaluator.test.ts
import { describe, it, expect } from "vitest";
import { evaluateExerciseSpec, type BiomechanicalSpecData } from "./specEvaluator";
import type { PhaseTimeline } from "./phaseDetector";
import type { FrameAnalysis } from "@/types/analysis";

const spec: BiomechanicalSpecData = {
  movements: [
    {
      joint: "left_knee",
      movementType: "flexion",
      phases: [
        {
          phase: "THROUGHOUT",
          minAngle: 90,
          maxAngle: 180,
          triggers: [
            { condition: "BELOW_MIN", severity: "ERROR", feedback: "Ginocchia troppo flesse", injuryRisk: false },
          ],
        },
      ],
    },
  ],
};

function framesWithKnee(n: number, knee: number): FrameAnalysis[] {
  return Array.from({ length: n }, (_, i) => ({ timestamp: i, keypoints: [], angles: { leftKnee: knee } }));
}

function throughoutTimeline(n: number): PhaseTimeline {
  return {
    framePhases: Array.from({ length: n }, () => "THROUGHOUT" as const),
    detectedPhases: [{ phase: "THROUGHOUT", durationFrames: n }],
  };
}

describe("evaluateExerciseSpec", () => {
  it("esecuzione pulita (entro range) => score 100, nessun trigger", () => {
    const frames = framesWithKnee(10, 120);
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(10));
    expect(r.score).toBe(100);
    expect(r.triggeredFeedback).toHaveLength(0);
  });

  it("violazione persistente BELOW_MIN ERROR => score 70 con trigger", () => {
    const frames = framesWithKnee(10, 70); // 70 < minAngle 90
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(10));
    expect(r.score).toBe(70);
    expect(r.triggeredFeedback).toHaveLength(1);
    expect(r.triggeredFeedback[0].severity).toBe("ERROR");
    expect(r.triggeredFeedback[0].injuryRisk).toBe(false);
  });

  it("violazione sotto i 5 frame viene ignorata (rumore)", () => {
    const frames = framesWithKnee(4, 70);
    const r = evaluateExerciseSpec(frames, spec, throughoutTimeline(4));
    expect(r.triggeredFeedback).toHaveLength(0);
    expect(r.score).toBe(100);
  });
});
```

- [ ] **Step 2: Eseguire**

Run: `npm run test:unit -- specEvaluator`
Expected: 3 test PASS. (Se un test fallisce per un comportamento inatteso del motore, è un bug latente: fermarsi, capire se il bug è nel test o nel codice, fixare il codice se è un bug genuino, poi committare il fix a parte.)

- [ ] **Step 3: Commit**

```bash
git add src/services/biomechanical/specEvaluator.test.ts
git commit -m "test(biomech): copertura evaluateExerciseSpec (scoring L1)"
```

---

## Task 6: Cablare i pesi in `finalReportGenerator` + `route.ts`

**Files:**
- Modify: `src/services/ai/finalReportGenerator.ts`
- Modify: `src/app/api/analysis/complete/route.ts:120-147`
- Create: `src/services/ai/finalReportGenerator.test.ts`

- [ ] **Step 1: Scrivere il test (Anthropic mockato)**

```ts
// src/services/ai/finalReportGenerator.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/anthropic", () => ({
  anthropic: { messages: { create: vi.fn() } },
  MODELS: { FAST: "m", DEFAULT: "m", POWERFUL: "m" },
}));

import { anthropic } from "@/lib/anthropic";
import { generateFinalReport } from "./finalReportGenerator";
import type { L1Result, L2Result, L3Result } from "@/types/analysis";

const l1: L1Result = { score: 80, triggeredFeedback: [], detectedPhases: [], rawAnglesSampled: [] };
const l2: L2Result = { score: 60, qualitativeAnalysis: "", visualObservations: [], injuryRiskFlags: [] };
const l3: L3Result = { score: 40, comparisonFeedback: "", keyDifferences: [] };

const create = anthropic.messages.create as unknown as ReturnType<typeof vi.fn>;

function mockJson(obj: unknown) {
  create.mockResolvedValue({ content: [{ type: "text", text: JSON.stringify(obj) }] });
}

beforeEach(() => create.mockReset());

describe("generateFinalReport", () => {
  it("combinedScore segue i pesi (50/30/20) e sovrascrive quello dell'AI", async () => {
    mockJson({
      combinedScore: 999,
      overallJudgment: "ok",
      prioritizedImprovements: [],
      injuryRiskAlert: { level: "BASSO", explanation: "", affectedAreas: [] },
      positiveAspects: [],
    });
    const r = await generateFinalReport({ exerciseName: "squat", l1, l2, l3, hasProVideo: true });
    expect(r.combinedScore).toBe(66); // 80*.5 + 60*.3 + 40*.2
  });

  it("senza video PT usa 62.5/37.5", async () => {
    mockJson({
      combinedScore: 0,
      overallJudgment: "ok",
      prioritizedImprovements: [],
      injuryRiskAlert: { level: "BASSO", explanation: "", affectedAreas: [] },
      positiveAspects: [],
    });
    const r = await generateFinalReport({ exerciseName: "squat", l1, l2, l3, hasProVideo: false });
    expect(r.combinedScore).toBe(73); // 80*.625 + 60*.375
  });

  it("fallback robusto se l'AI risponde con testo non-JSON", async () => {
    create.mockResolvedValue({ content: [{ type: "text", text: "non e' json" }] });
    const r = await generateFinalReport({ exerciseName: "squat", l1, l2, l3, hasProVideo: true });
    expect(r.combinedScore).toBe(66);
    expect(typeof r.overallJudgment).toBe("string");
  });
});
```

- [ ] **Step 2: Eseguire per vederlo fallire**

Run: `npm run test:unit -- finalReportGenerator`
Expected: FAIL — `generateFinalReport` non accetta ancora `hasProVideo` e usa i vecchi pesi.

- [ ] **Step 3: Modificare `finalReportGenerator.ts`**

In testa al file, aggiungere l'import:

```ts
import { ANALYSIS_WEIGHTS, computeCombinedScore } from "@/services/analysis/weights";
```

Sostituire la firma di `buildFinalReportPrompt` e le righe dei pesi nel prompt. Cambiare la firma in:

```ts
function buildFinalReportPrompt(
  exerciseName: string,
  l1: L1Result,
  l2: L2Result,
  l3: L3Result,
  combinedScore: number,
  weightsPct: { l1: number; l2: number; l3: number }
): string {
```

E nelle tre righe di intestazione dei livelli, sostituire i `peso 34%/33%/33%` hardcoded con:

```ts
// riga L1:
`L1 — BIOMECCANICA NUMERICA (peso ${weightsPct.l1}%, score ${l1.score}/100)`
// riga L2:
`L2 — VISION ANALYSIS (peso ${weightsPct.l2}%, score ${l2.score}/100)`
// riga L3:
`L3 — CONFRONTO CON PT (peso ${weightsPct.l3}%, score ${l3.score}/100)`
```

Sostituire l'inizio di `generateFinalReport`:

```ts
export async function generateFinalReport(params: {
  exerciseName: string;
  l1: L1Result;
  l2: L2Result;
  l3: L3Result;
  hasProVideo: boolean;
}): Promise<FinalReport> {
  const combinedScore = computeCombinedScore(
    params.l1.score,
    params.l2.score,
    params.l3.score,
    { hasProVideo: params.hasProVideo }
  );

  const weightsPct = params.hasProVideo
    ? {
        l1: Math.round(ANALYSIS_WEIGHTS.withProVideo.l1 * 100),
        l2: Math.round(ANALYSIS_WEIGHTS.withProVideo.l2 * 100),
        l3: Math.round(ANALYSIS_WEIGHTS.withProVideo.l3 * 100),
      }
    : {
        l1: Math.round(ANALYSIS_WEIGHTS.withoutProVideo.l1 * 100),
        l2: Math.round(ANALYSIS_WEIGHTS.withoutProVideo.l2 * 100),
        l3: 0,
      };
```

Aggiornare la chiamata a `buildFinalReportPrompt` passando `weightsPct`:

```ts
        content: buildFinalReportPrompt(params.exerciseName, params.l1, params.l2, params.l3, combinedScore, weightsPct),
```

- [ ] **Step 4: Modificare `complete/route.ts`**

In testa al file aggiungere l'import:

```ts
import { computeCombinedScore } from "@/services/analysis/weights";
```

Alla riga ~141 cambiare la chiamata e il fallback del catch:

```ts
  const finalReport = await generateFinalReport({ exerciseName, l1, l2, l3, hasProVideo: hasProFrames }).catch(() => ({
    combinedScore: computeCombinedScore(l1.score, l2.score, l3.score, { hasProVideo: hasProFrames }),
    overallJudgment: `Esecuzione di ${exerciseName} elaborata. Sintesi finale non disponibile.`,
    prioritizedImprovements: l1.triggeredFeedback.slice(0, 5).map((t) => t.feedback),
    injuryRiskAlert: { level: "BASSO" as const, explanation: "Sintesi non generata.", affectedAreas: [] },
    positiveAspects: l2.visualObservations.slice(0, 3),
  }));
```

Lasciare invariata la riga 127-128 (conversione sentinel `-1` → media): ora serve solo a dare a L3 un valore mostrabile in UI/DB, NON entra più nel calcolo dello score (gestito da `computeCombinedScore` con `hasProVideo: false`). Aggiornare il commento:

```ts
  // Se manca il video PT (L3 sentinel -1), diamo a L3 un valore mostrabile in UI.
  // Il punteggio combinato NON usa L3 in questo caso (vedi computeCombinedScore, hasProVideo:false).
  if (l3.score === -1) {
    l3 = { ...l3, score: Math.round((l1.score + l2.score) / 2) };
  }
```

- [ ] **Step 5: Eseguire i test e il typecheck**

Run: `npm run test:unit -- finalReportGenerator && npx tsc --noEmit`
Expected: 3 test PASS, typecheck pulito.

- [ ] **Step 6: Commit**

```bash
git add src/services/ai/finalReportGenerator.ts src/services/ai/finalReportGenerator.test.ts src/app/api/analysis/complete/route.ts
git commit -m "feat(analysis): pesi 50/30/20 via computeCombinedScore in finalReport + route"
```

---

## Task 7: Test orchestrazione L2/L3 (`visionAnalyzer`)

**Files:**
- Create: `src/services/ai/visionAnalyzer.test.ts`

- [ ] **Step 1: Scrivere i test**

```ts
// src/services/ai/visionAnalyzer.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/anthropic", () => ({
  anthropic: { messages: { create: vi.fn() } },
  MODELS: { FAST: "m", DEFAULT: "m", POWERFUL: "m" },
}));

import { anthropic } from "@/lib/anthropic";
import { analyzeUserVideoVision, compareVideoVision, type VisionFrame } from "./visionAnalyzer";

const create = anthropic.messages.create as unknown as ReturnType<typeof vi.fn>;
const frame: VisionFrame = { base64: "AAAA", mediaType: "image/jpeg", label: "BOTTOM" };

beforeEach(() => create.mockReset());

describe("analyzeUserVideoVision", () => {
  it("ritorna score 0 senza frame (nessuna chiamata AI)", async () => {
    const r = await analyzeUserVideoVision({ exerciseName: "squat", professionalNotes: "", userFrames: [] });
    expect(r.score).toBe(0);
    expect(create).not.toHaveBeenCalled();
  });

  it("parsa il JSON valido dell'AI", async () => {
    create.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ score: 88, qualitativeAnalysis: "ok", visualObservations: ["a"], injuryRiskFlags: [] }) }],
    });
    const r = await analyzeUserVideoVision({ exerciseName: "squat", professionalNotes: "", userFrames: [frame] });
    expect(r.score).toBe(88);
    expect(r.visualObservations).toEqual(["a"]);
  });

  it("fallback score 60 se l'AI risponde con testo non-JSON", async () => {
    create.mockResolvedValue({ content: [{ type: "text", text: "testo libero" }] });
    const r = await analyzeUserVideoVision({ exerciseName: "squat", professionalNotes: "", userFrames: [frame] });
    expect(r.score).toBe(60);
  });
});

describe("compareVideoVision", () => {
  it("ritorna score 0 se mancano i frame PT", async () => {
    const r = await compareVideoVision({ exerciseName: "squat", professionalNotes: "", userFrames: [frame], proFrames: [] });
    expect(r.score).toBe(0);
    expect(create).not.toHaveBeenCalled();
  });

  it("parsa il JSON valido del confronto", async () => {
    create.mockResolvedValue({
      content: [{ type: "text", text: JSON.stringify({ score: 75, comparisonFeedback: "vicino", keyDifferences: [] }) }],
    });
    const r = await compareVideoVision({ exerciseName: "squat", professionalNotes: "", userFrames: [frame], proFrames: [frame] });
    expect(r.score).toBe(75);
  });
});
```

- [ ] **Step 2: Eseguire**

Run: `npm run test:unit -- visionAnalyzer`
Expected: 5 test PASS.

- [ ] **Step 3: Eseguire l'intera suite unit + E2E come regressione**

Run: `npm run test:unit && npm run test:e2e`
Expected: tutti gli unit PASS; suite E2E 53/53 ancora verde (i pesi nuovi non rompono gli E2E perché mockano MediaPipe).

- [ ] **Step 4: Commit**

```bash
git add src/services/ai/visionAnalyzer.test.ts
git commit -m "test(ai): orchestrazione L2/L3 con Anthropic mockato"
```

---

# FASE 3 — Sentry reale

## Task 8: Installare e configurare `@sentry/nextjs` (Next 16)

**Files:**
- Modify: `package.json`
- Create: file di config Sentry (shape esatta dai doc installati)
- Modify: `src/lib/observability.ts`
- Modify: `.env.example`, `CHECKLIST_DEPLOY.md` (sezione M3)

- [ ] **Step 1: Leggere i doc PRIMA di scrivere codice**

Run: `ls node_modules/next/dist/docs/ && ls node_modules/@sentry/nextjs 2>/dev/null || echo "sentry non ancora installato"`
Leggere la guida Next 16 su `instrumentation` e la doc di `@sentry/nextjs` per la versione che verrà installata. Next 16 usa `instrumentation.ts` (`register()`) + `instrumentation-client.ts`, NON i vecchi `sentry.*.config.js`. Confermare i nomi file esatti richiesti dalla versione installata.

- [ ] **Step 2: Installare il pacchetto**

Run: `npm install @sentry/nextjs`
Expected: aggiunto a `dependencies`.

- [ ] **Step 3: Creare i file di config secondo la doc**

Creare i file richiesti dalla versione installata (tipicamente `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `instrumentation-client.ts`), ciascuno guardato da `process.env.SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN`. Esempio `instrumentation.ts`:

```ts
export async function register() {
  if (!process.env.SENTRY_DSN) return;
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
```

Esempio `sentry.server.config.ts`:

```ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

Se la doc richiede `withSentryConfig` in `next.config`, applicarlo mantenendo la config esistente.

- [ ] **Step 4: Semplificare `src/lib/observability.ts`**

Sostituire l'hack del dynamic import con l'import diretto, mantenendo invariata l'API pubblica (`captureError`, `captureMessage`, `setUserContext`). Sentry no-op da solo se non inizializzato, quindi non servono più i guard manuali:

```ts
import * as Sentry from "@sentry/nextjs";

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  console.error("[error]", err, context ?? "");
  Sentry.captureException(err, context ? { extra: context } : undefined);
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  const fn = level === "error" ? console.error : level === "warning" ? console.warn : console.log;
  fn(`[${level}]`, message);
  Sentry.captureMessage(message, level);
}

export function setUserContext(user: { id?: string; email?: string } | null): void {
  Sentry.setUser(user);
}
```

- [ ] **Step 5: Verificare build e dev**

Run: `npx tsc --noEmit && npm run build`
Expected: typecheck pulito, build OK con 50+ pagine. Senza `SENTRY_DSN`, nessun errore e nessuna inizializzazione Sentry.

- [ ] **Step 6: Aggiornare doc env**

In `.env.example` aggiungere (se assenti) `SENTRY_DSN=` e `NEXT_PUBLIC_SENTRY_DSN=` con commento "opzionale, attiva monitoring". In `CHECKLIST_DEPLOY.md` sezione M3 aggiornare i passi reali (crea progetto Sentry, copia DSN).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/lib/observability.ts instrumentation.ts instrumentation-client.ts sentry.server.config.ts sentry.edge.config.ts next.config.* .env.example CHECKLIST_DEPLOY.md
git commit -m "feat(observability): integrazione Sentry reale (Next 16), attiva solo con DSN"
```

---

# FASE 4 — CI GitHub Actions

## Task 9: Workflow CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Creare il workflow**

```yaml
name: CI

on:
  push:
  pull_request:

jobs:
  quality:
    name: Typecheck + Lint + Unit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - run: npx tsc --noEmit
      - run: npm run lint
      - run: npm run test:unit

  e2e:
    name: E2E (Playwright + Postgres)
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: fitai_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U postgres"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/fitai_test
      DIRECT_URL: postgresql://postgres:postgres@localhost:5432/fitai_test
      AUTH_SECRET: ci-test-secret-not-for-prod
      NEXTAUTH_SECRET: ci-test-secret-not-for-prod
      APP_URL: http://localhost:3000
      ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
      - run: npm run seed
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

- [ ] **Step 2: Validare la sintassi YAML**

Run: `npx --yes js-yaml .github/workflows/ci.yml > /dev/null && echo "YAML ok"`
Expected: "YAML ok" (nessun errore di parsing).

- [ ] **Step 3: Commit e push per attivare la CI**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: GitHub Actions typecheck+lint+unit + E2E con Postgres"
git push
```

- [ ] **Step 4: Verificare il primo run e completare i secret**

Run: `gh run list --limit 1` poi `gh run watch`
Expected: job `quality` verde. Per `e2e`: se alcuni test falliscono per env mancanti (es. `ANTHROPIC_API_KEY` o altri servizi), aggiungere i secret necessari con `gh secret set <NOME>`. Candidati possibili da valutare in base ai fallimenti: `ANTHROPIC_API_KEY`. La maggior parte degli E2E mocka l'AI e il gating FREE non chiama Anthropic, quindi il set minimo dovrebbe bastare; confermare dal log del primo run.

---

## Note di chiusura

- Ordine consigliato: Fase 1 → 2 → 3 → 4, ogni task con commit a sé.
- Non toccare i test in `tests/e2e/`: restano la rete di integrazione.
- Se la Fase 2 fa emergere un bug genuino nel motore (specEvaluator/phaseDetector), fixarlo in un commit dedicato `fix(biomech): ...` separato dal commit dei test.
