# PT Reference Biomeccanico (L3 numerico) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Estrarre una volta sola il profilo biomeccanico del video PT (angoli per giunto/fase), salvarlo su `Exercise`, e usarlo come riferimento numerico deterministico in L3 accanto alla vision.

**Architecture:** Due funzioni pure (`buildReferenceProfile`, `compareToReference`) condivise tra PT e utente per simmetria; estrazione del profilo PT nel browser admin all'upload; persistenza su `Exercise.referenceProfile`; integrazione in `/api/analysis/complete` con L3 = 0.6·numerico + 0.4·vision. L1/L2 invariati, retrocompatibile.

**Tech Stack:** Next.js 16, Prisma 7 (`@/generated/prisma`), Vitest (node env, `src/**/*.test.ts`), MediaPipe `@mediapipe/tasks-vision` (browser), Zod.

**Spec:** `docs/superpowers/specs/2026-07-14-pt-reference-biomeccanico-design.md`

---

### Task 1: Esportare mapping giunto→angolo condiviso

**Files:**
- Modify: `src/services/biomechanical/specEvaluator.ts:54-67`

- [ ] **Step 1: Esporta `jointAngleFor` e la lista giunti**

In `specEvaluator.ts`, cambia la firma di `jointAngleFor` da privata a esportata e aggiungi la costante `SPEC_JOINTS` subito sopra:

```ts
export const SPEC_JOINTS = [
  "left_knee", "right_knee", "left_elbow", "right_elbow",
  "left_shoulder", "right_shoulder", "left_hip", "right_hip", "spine",
] as const;

export function jointAngleFor(joint: string, angles: JointAngles): number | undefined {
  switch (joint) {
    case "left_knee": return angles.leftKnee;
    case "right_knee": return angles.rightKnee;
    case "left_elbow": return angles.leftElbow;
    case "right_elbow": return angles.rightElbow;
    case "left_shoulder": return angles.leftShoulder;
    case "right_shoulder": return angles.rightShoulder;
    case "left_hip": return angles.leftHip;
    case "right_hip": return angles.rightHip;
    case "spine": return angles.spineInclination;
    default: return undefined;
  }
}
```

- [ ] **Step 2: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errori (la funzione era già usata internamente, ora è solo esportata).

- [ ] **Step 3: Commit**

```bash
git add src/services/biomechanical/specEvaluator.ts
git commit -m "refactor(biomech): esporta jointAngleFor + SPEC_JOINTS per riuso"
```

---

### Task 2: Tipi ReferenceProfile + estensione L3Result

**Files:**
- Modify: `src/types/analysis.ts:40-44`

- [ ] **Step 1: Aggiungi i tipi**

In `src/types/analysis.ts`, sostituisci l'interfaccia `L3Result` e aggiungi i nuovi tipi dopo di essa:

```ts
export interface L3Result {
  score: number;
  comparisonFeedback: string;
  keyDifferences: { aspect: string; user: string; pro: string }[];
  numericScore?: number; // 🆕 punteggio del confronto numerico col profilo PT (se disponibile)
}

export interface ReferenceMovement {
  joint: string;   // es. "spine", "left_knee"
  phase: string;   // es. "THROUGHOUT", "BOTTOM"
  minAngle: number;
  maxAngle: number;
  meanAngle: number;
  sampleCount: number;
}

export interface ReferenceProfile {
  movements: ReferenceMovement[];
  meta: { fps: number; totalFrames: number; detectedReps: number };
}
```

- [ ] **Step 2: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errori.

- [ ] **Step 3: Commit**

```bash
git add src/types/analysis.ts
git commit -m "feat(types): ReferenceProfile + L3Result.numericScore"
```

---

### Task 3: `buildReferenceProfile` (funzione pura, TDD)

**Files:**
- Create: `src/services/analysis/referenceProfile.ts`
- Test: `src/services/analysis/referenceProfile.test.ts`

- [ ] **Step 1: Scrivi il test che fallisce**

```ts
// src/services/analysis/referenceProfile.test.ts
import { describe, it, expect } from "vitest";
import { buildReferenceProfile } from "./referenceProfile";
import type { FrameAnalysis } from "@/types/analysis";
import type { PhaseTimeline } from "@/services/biomechanical/phaseDetector";

function frame(ts: number, leftKnee: number, spine: number): FrameAnalysis {
  return { timestamp: ts, keypoints: [], angles: { leftKnee, spineInclination: spine } };
}

describe("buildReferenceProfile", () => {
  it("aggrega min/max/media per (giunto × fase)", () => {
    const frames = [frame(0, 100, 10), frame(100, 80, 20), frame(200, 90, 30)];
    const timeline: PhaseTimeline = {
      framePhases: ["BOTTOM", "BOTTOM", "BOTTOM"],
      detectedPhases: [{ phase: "BOTTOM", durationFrames: 3 }],
    };
    const p = buildReferenceProfile(frames, timeline, { fps: 12 });
    const knee = p.movements.find((m) => m.joint === "left_knee" && m.phase === "BOTTOM");
    expect(knee).toBeDefined();
    expect(knee!.minAngle).toBe(80);
    expect(knee!.maxAngle).toBe(100);
    expect(knee!.meanAngle).toBe(90);
    expect(knee!.sampleCount).toBe(3);
    expect(p.meta.fps).toBe(12);
    expect(p.meta.totalFrames).toBe(3);
  });

  it("ignora i giunti senza angolo e le fasi vuote", () => {
    const frames = [frame(0, 100, 10)];
    const timeline: PhaseTimeline = { framePhases: ["TOP"], detectedPhases: [{ phase: "TOP", durationFrames: 1 }] };
    const p = buildReferenceProfile(frames, timeline);
    expect(p.movements.some((m) => m.joint === "right_knee")).toBe(false);
    expect(p.movements.find((m) => m.joint === "left_knee")!.phase).toBe("TOP");
  });

  it("conta le rep dai BOTTOM in detectedPhases", () => {
    const frames = [frame(0, 100, 10), frame(100, 80, 10)];
    const timeline: PhaseTimeline = {
      framePhases: ["TOP", "BOTTOM"],
      detectedPhases: [{ phase: "TOP", durationFrames: 1 }, { phase: "BOTTOM", durationFrames: 1 }, { phase: "TOP", durationFrames: 0 }, { phase: "BOTTOM", durationFrames: 1 }],
    };
    const p = buildReferenceProfile(frames, timeline);
    expect(p.meta.detectedReps).toBe(2);
  });
});
```

- [ ] **Step 2: Esegui il test (deve fallire)**

Run: `npx vitest run src/services/analysis/referenceProfile.test.ts`
Expected: FAIL — "buildReferenceProfile is not a function" / modulo mancante.

- [ ] **Step 3: Implementa il modulo**

```ts
// src/services/analysis/referenceProfile.ts
import type { FrameAnalysis, ReferenceProfile, ReferenceMovement } from "@/types/analysis";
import type { PhaseTimeline } from "@/services/biomechanical/phaseDetector";
import { SPEC_JOINTS, jointAngleFor } from "@/services/biomechanical/specEvaluator";

export const REFERENCE_PROFILE_VERSION = 1;

interface Acc { min: number; max: number; sum: number; count: number }

export function buildReferenceProfile(
  frames: FrameAnalysis[],
  timeline: PhaseTimeline,
  opts?: { fps?: number }
): ReferenceProfile {
  const byKey = new Map<string, Acc & { joint: string; phase: string }>();

  for (let i = 0; i < frames.length; i++) {
    const phase = timeline.framePhases[i] ?? "THROUGHOUT";
    const angles = frames[i].angles;
    for (const joint of SPEC_JOINTS) {
      const a = jointAngleFor(joint, angles);
      if (typeof a !== "number" || Number.isNaN(a)) continue;
      const key = `${joint}|${phase}`;
      const cur = byKey.get(key);
      if (!cur) byKey.set(key, { joint, phase, min: a, max: a, sum: a, count: 1 });
      else { cur.min = Math.min(cur.min, a); cur.max = Math.max(cur.max, a); cur.sum += a; cur.count++; }
    }
  }

  const movements: ReferenceMovement[] = Array.from(byKey.values()).map((v) => ({
    joint: v.joint,
    phase: v.phase,
    minAngle: Math.round(v.min),
    maxAngle: Math.round(v.max),
    meanAngle: Math.round(v.sum / v.count),
    sampleCount: v.count,
  }));

  const detectedReps = timeline.detectedPhases.filter((p) => p.phase === "BOTTOM").length;

  return {
    movements,
    meta: { fps: opts?.fps ?? 0, totalFrames: frames.length, detectedReps },
  };
}
```

- [ ] **Step 4: Esegui il test (deve passare)**

Run: `npx vitest run src/services/analysis/referenceProfile.test.ts`
Expected: PASS (3 test).

- [ ] **Step 5: Commit**

```bash
git add src/services/analysis/referenceProfile.ts src/services/analysis/referenceProfile.test.ts
git commit -m "feat(analysis): buildReferenceProfile — profilo angoli per giunto/fase"
```

---

### Task 4: `compareToReference` (funzione pura, TDD)

**Files:**
- Modify: `src/services/analysis/referenceProfile.ts` (aggiunta funzione + costanti)
- Test: `src/services/analysis/referenceCompare.test.ts`

- [ ] **Step 1: Scrivi il test che fallisce**

```ts
// src/services/analysis/referenceCompare.test.ts
import { describe, it, expect } from "vitest";
import { compareToReference } from "./referenceProfile";
import type { ReferenceProfile } from "@/types/analysis";

const mv = (joint: string, phase: string, meanAngle: number) =>
  ({ joint, phase, minAngle: meanAngle, maxAngle: meanAngle, meanAngle, sampleCount: 10 });

const profile = (movs: ReturnType<typeof mv>[]): ReferenceProfile =>
  ({ movements: movs, meta: { fps: 12, totalFrames: 100, detectedReps: 3 } });

describe("compareToReference", () => {
  it("dà 100 se l'utente coincide col PT", () => {
    const pt = profile([mv("left_knee", "BOTTOM", 90)]);
    const user = profile([mv("left_knee", "BOTTOM", 90)]);
    const r = compareToReference(user, pt);
    expect(r.numericScore).toBe(100);
    expect(r.keyDifferences).toHaveLength(0);
  });

  it("penalizza la deviazione oltre tolleranza e la riporta", () => {
    const pt = profile([mv("left_hip", "BOTTOM", 90)]);
    const user = profile([mv("left_hip", "BOTTOM", 72)]); // 18° di deviazione, tolleranza 15
    const r = compareToReference(user, pt, { toleranceDeg: 15 });
    expect(r.numericScore).toBeLessThan(100);
    expect(r.keyDifferences[0].aspect).toContain("BOTTOM");
    expect(r.keyDifferences[0].user).toBe("72°");
    expect(r.keyDifferences[0].pro).toBe("90°");
  });

  it("ignora le coppie non presenti in entrambi", () => {
    const pt = profile([mv("spine", "THROUGHOUT", 20)]);
    const user = profile([mv("left_knee", "BOTTOM", 90)]);
    const r = compareToReference(user, pt);
    expect(r.numericScore).toBe(0); // nessuna coppia comune → nessuna aderenza
    expect(r.keyDifferences).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Esegui il test (deve fallire)**

Run: `npx vitest run src/services/analysis/referenceCompare.test.ts`
Expected: FAIL — "compareToReference is not a function".

- [ ] **Step 3: Aggiungi la funzione a `referenceProfile.ts`**

Aggiungi in fondo a `src/services/analysis/referenceProfile.ts`:

```ts
export const DEFAULT_TOLERANCE_DEG = 15;

const JOINT_LABEL_IT: Record<string, string> = {
  left_knee: "ginocchio sx", right_knee: "ginocchio dx",
  left_elbow: "gomito sx", right_elbow: "gomito dx",
  left_shoulder: "spalla sx", right_shoulder: "spalla dx",
  left_hip: "anca sx", right_hip: "anca dx", spine: "schiena",
};

export function compareToReference(
  user: ReferenceProfile,
  pt: ReferenceProfile,
  opts?: { toleranceDeg?: number }
): { numericScore: number; keyDifferences: { aspect: string; user: string; pro: string }[] } {
  const tol = opts?.toleranceDeg ?? DEFAULT_TOLERANCE_DEG;
  const ptByKey = new Map(pt.movements.map((m) => [`${m.joint}|${m.phase}`, m]));

  const adherences: number[] = [];
  const diffs: { aspect: string; user: string; pro: string; dev: number }[] = [];

  for (const um of user.movements) {
    const pm = ptByKey.get(`${um.joint}|${um.phase}`);
    if (!pm) continue;
    const dev = Math.abs(um.meanAngle - pm.meanAngle);
    const adherence = Math.max(0, 1 - dev / (tol * 2)); // 0 quando dev = 2× tolleranza
    adherences.push(adherence);
    if (dev > tol) {
      const label = JOINT_LABEL_IT[um.joint] ?? um.joint;
      diffs.push({
        aspect: `${label} — ${um.phase}`,
        user: `${um.meanAngle}°`,
        pro: `${pm.meanAngle}°`,
        dev,
      });
    }
  }

  const numericScore = adherences.length === 0
    ? 0
    : Math.round((adherences.reduce((s, a) => s + a, 0) / adherences.length) * 100);

  const keyDifferences = diffs
    .sort((a, b) => b.dev - a.dev)
    .slice(0, 5)
    .map(({ aspect, user, pro }) => ({ aspect, user, pro }));

  return { numericScore, keyDifferences };
}
```

- [ ] **Step 4: Esegui i test (devono passare)**

Run: `npx vitest run src/services/analysis/referenceCompare.test.ts`
Expected: PASS (3 test).

- [ ] **Step 5: Commit**

```bash
git add src/services/analysis/referenceProfile.ts src/services/analysis/referenceCompare.test.ts
git commit -m "feat(analysis): compareToReference — score numerico + differenze chiave"
```

---

### Task 5: Schema Prisma + migrazione

**Files:**
- Modify: `prisma/schema.prisma:334-363` (model Exercise)

- [ ] **Step 1: Aggiungi i campi al model Exercise**

Dopo `professionalNotes String? @db.Text` (o vicino a `videoUrl`) aggiungi:

```prisma
  referenceProfile        Json?     // profilo biomeccanico PT (angoli per giunto/fase)
  referenceProfileAt      DateTime? // quando generato
  referenceProfileVersion Int?      // = REFERENCE_PROFILE_VERSION, per invalidazione
```

- [ ] **Step 2: Genera la migrazione**

Run: `npx prisma migrate dev --name exercise_reference_profile`
Expected: crea `prisma/migrations/<ts>_exercise_reference_profile/migration.sql` con 3 `ADD COLUMN`, applica, rigenera il client in `src/generated/prisma`.

- [ ] **Step 3: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errori (il client rigenerato include i nuovi campi).

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat(schema): Exercise.referenceProfile + referenceProfileAt/Version"
```

---

### Task 6: Estrazione profilo PT nel browser admin

**Files:**
- Create: `src/lib/analysis/pt-profile-extract.ts`
- Reference (leggere prima): `src/hooks/usePoseDetection.ts`, `src/lib/pose.ts`

- [ ] **Step 1: Leggi i riferimenti**

Leggi `src/hooks/usePoseDetection.ts` (init `PoseLandmarker`, `WASM_BASE`, `MODEL_URL`, uso di `mapWorldLandmarks`/`mapLandmarksToKeypoints`/`computeJointAngles`) e `src/lib/pose.ts` (firme `mapLandmarksToKeypoints`, `mapWorldLandmarks`). Riusa esattamente quelle firme.

- [ ] **Step 2: Implementa l'estrattore (client-only)**

```ts
// src/lib/analysis/pt-profile-extract.ts
"use client";

import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { computeJointAngles } from "@/services/biomechanical/angleCalculator";
import { mapLandmarksToKeypoints, mapWorldLandmarks } from "@/lib/pose";
import { detectPhases } from "@/services/biomechanical/phaseDetector";
import { buildReferenceProfile } from "@/services/analysis/referenceProfile";
import type { FrameAnalysis, ReferenceProfile } from "@/types/analysis";

const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export const PT_SAMPLE_FPS = 12;

/**
 * Estrae il profilo biomeccanico di riferimento da un video PT.
 * Gira nel browser admin: riproduce il video nascosto, campiona a PT_SAMPLE_FPS,
 * gira MediaPipe frame-per-frame e riduce a un ReferenceProfile.
 */
export async function extractReferenceProfileFromVideo(
  url: string,
  exerciseSlug: string,
  fps: number = PT_SAMPLE_FPS
): Promise<ReferenceProfile> {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
  const landmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false,
  });

  try {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    await new Promise<void>((resolve, reject) => {
      video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      video.addEventListener("error", () => reject(new Error("Video PT non caricabile (CORS/formato)")), { once: true });
    });

    const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    if (duration === 0) throw new Error("Durata video PT non leggibile");

    const step = 1 / fps;
    const frames: FrameAnalysis[] = [];

    for (let t = 0; t < duration; t += step) {
      await new Promise<void>((seekResolve) => {
        const onSeeked = () => { video.removeEventListener("seeked", onSeeked); seekResolve(); };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = Math.min(t, duration - 0.01);
      });
      if (video.videoWidth === 0) continue;
      const result = landmarker.detectForVideo(video, performance.now());
      const landmarks = result.landmarks[0];
      const worldLandmarks = result.worldLandmarks?.[0];
      if (!landmarks || landmarks.length === 0) continue;
      const keypoints = mapLandmarksToKeypoints(landmarks, video.videoWidth, video.videoHeight);
      const worldKeypoints = worldLandmarks ? mapWorldLandmarks(worldLandmarks) : undefined;
      const angles = computeJointAngles(worldKeypoints ?? keypoints);
      frames.push({ timestamp: Math.round(t * 1000), keypoints, worldKeypoints, angles });
    }

    const timeline = detectPhases(frames, exerciseSlug);
    return buildReferenceProfile(frames, timeline, { fps });
  } finally {
    landmarker.close();
  }
}
```

- [ ] **Step 3: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errori.

- [ ] **Step 4: Commit**

```bash
git add src/lib/analysis/pt-profile-extract.ts
git commit -m "feat(analysis): estrazione profilo PT nel browser (MediaPipe)"
```

---

### Task 7: Endpoint admin di persistenza

**Files:**
- Create: `src/app/api/admin/exercises/[id]/reference-profile/route.ts`
- Reference (leggere prima): `src/app/api/admin/exercises/[id]/active/route.ts`, `src/lib/admin-audit.ts`

- [ ] **Step 1: Leggi il pattern esistente**

Leggi `src/app/api/admin/exercises/[id]/active/route.ts` per il pattern `requireAdmin` + `logAdminAction` + params Promise.

- [ ] **Step 2: Implementa la route POST**

```ts
// src/app/api/admin/exercises/[id]/reference-profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, AdminAccessError } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/admin-audit";
import { REFERENCE_PROFILE_VERSION } from "@/services/analysis/referenceProfile";
import { z } from "zod";

const movementSchema = z.object({
  joint: z.string(),
  phase: z.string(),
  minAngle: z.number(),
  maxAngle: z.number(),
  meanAngle: z.number(),
  sampleCount: z.number(),
});
const schema = z.object({
  movements: z.array(movementSchema),
  meta: z.object({ fps: z.number(), totalFrames: z.number(), detectedReps: z.number() }),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let actor;
  try {
    actor = await requireAdmin();
  } catch (e) {
    if (e instanceof AdminAccessError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Profilo non valido" }, { status: 400 });
  if (parsed.data.movements.length === 0) {
    return NextResponse.json({ error: "Nessun movimento rilevato dal video PT" }, { status: 422 });
  }

  const exercise = await prisma.exercise.findUnique({ where: { id }, select: { id: true } });
  if (!exercise) return NextResponse.json({ error: "Esercizio non trovato" }, { status: 404 });

  await prisma.exercise.update({
    where: { id },
    data: {
      referenceProfile: parsed.data as object,
      referenceProfileAt: new Date(),
      referenceProfileVersion: REFERENCE_PROFILE_VERSION,
    },
  });

  await logAdminAction({
    actorId: actor.userId,
    actorEmail: actor.email,
    action: "UPLOAD_PT_VIDEO",
    targetType: "Exercise",
    targetId: id,
    payload: { movements: parsed.data.movements.length, detectedReps: parsed.data.meta.detectedReps },
  });

  return NextResponse.json({ ok: true, movements: parsed.data.movements.length });
}
```

- [ ] **Step 3: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errori.

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/admin/exercises/[id]/reference-profile/route.ts"
git commit -m "feat(api): persistenza referenceProfile per esercizio (admin)"
```

---

### Task 8: Bottone admin "Estrai/Ri-processa profilo PT"

**Files:**
- Reference (leggere prima): `src/app/(app)/admin/exercises/page.tsx`, `src/components/admin/AdminExercisesTable.tsx`
- Modify: `src/components/admin/AdminExercisesTable.tsx`

- [ ] **Step 1: Leggi i componenti**

Leggi `src/components/admin/AdminExercisesTable.tsx` per capire come è resa ogni riga esercizio, dove sta il dialog upload PT video, e quali prop riceve (`id`, `videoUrl`, ecc.).

- [ ] **Step 2: Aggiungi il pulsante e l'handler**

Nel componente riga, aggiungi (accanto all'upload PT video) un pulsante abilitato solo se `videoUrl` è presente. Handler:

```tsx
import { extractReferenceProfileFromVideo } from "@/lib/analysis/pt-profile-extract";

// dentro il componente:
const [profiling, setProfiling] = useState(false);

async function handleBuildProfile() {
  if (!videoUrl) return;
  setProfiling(true);
  try {
    const profile = await extractReferenceProfileFromVideo(videoUrl, slug);
    const res = await fetch(`/api/admin/exercises/${id}/reference-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Errore salvataggio profilo");
    toast.success(`Profilo PT salvato: ${data.movements} movimenti`);
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Estrazione profilo fallita");
  } finally {
    setProfiling(false);
  }
}
```

Bottone: `<Button size="sm" variant="outline" disabled={!videoUrl || profiling} onClick={handleBuildProfile}>{profiling ? "Analisi…" : "Estrai profilo PT"}</Button>`

> Nota: `slug` deve essere disponibile nel componente riga; se la tabella non lo passa, aggiungilo alle prop e alla query della pagina admin. Verifica l'import `toast` già usato altrove (`sonner`).

- [ ] **Step 3: Verifica typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errori.

- [ ] **Step 4: Verifica manuale (browser)**

Avvia il dev server, vai su `/admin/exercises` come admin, su un esercizio con video PT premi "Estrai profilo PT". Attendi, verifica il toast di successo. Controlla in DB che `referenceProfile` sia popolato.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AdminExercisesTable.tsx "src/app/(app)/admin/exercises/page.tsx"
git commit -m "feat(admin): bottone estrai/ri-processa profilo PT"
```

---

### Task 9: Integrazione L3 numerico+vision in complete/route.ts

**Files:**
- Modify: `src/app/api/analysis/complete/route.ts:37-133`

- [ ] **Step 1: Includi referenceProfile nella query e calcola il confronto**

Nella `prisma.analysisSession.findFirst`, l'`include.exercise` carica già tutto il record esercizio? No: usa `include` annidato solo per `biomechanicalSpec`. Aggiungi `referenceProfile` alla selezione assicurandoti che `analysisSession.exercise.referenceProfile` sia disponibile (con `include` l'intero record esercizio è presente, quindi `referenceProfile` c'è già).

Dopo il calcolo di `timeline` (riga ~61) e prima delle promise L1/L2/L3, aggiungi:

```ts
import { buildReferenceProfile, compareToReference } from "@/services/analysis/referenceProfile";
import type { ReferenceProfile } from "@/types/analysis";

// ... dopo: const timeline = detectPhases(frameHistory, exerciseSlug);
const ptProfile = analysisSession.exercise.referenceProfile as ReferenceProfile | null;
const numericL3 = ptProfile && Array.isArray(ptProfile.movements) && ptProfile.movements.length > 0
  ? compareToReference(buildReferenceProfile(frameHistory, timeline), ptProfile)
  : null;
```

- [ ] **Step 2: Combina numerico + vision nella risoluzione L3**

Sostituisci il blocco di normalizzazione L3 (attuale righe ~121-133) con la logica combinata:

```ts
let l3: L3Result = l3Settled.status === "fulfilled" ? l3Settled.value : {
  score: 0,
  comparisonFeedback: "Confronto con video PT fallito.",
  keyDifferences: [],
};

const L3_NUMERIC_WEIGHT = 0.6;
const hasVisionL3 = hasProFrames && l3.score >= 0;

if (numericL3) {
  const visionScore = hasVisionL3 ? l3.score : null;
  const combined = visionScore === null
    ? numericL3.numericScore
    : Math.round(L3_NUMERIC_WEIGHT * numericL3.numericScore + (1 - L3_NUMERIC_WEIGHT) * visionScore);
  l3 = {
    score: combined,
    numericScore: numericL3.numericScore,
    comparisonFeedback: hasVisionL3
      ? l3.comparisonFeedback
      : "Confronto numerico col profilo PT (analisi vision non disponibile).",
    keyDifferences: [...numericL3.keyDifferences, ...(hasVisionL3 ? l3.keyDifferences : [])].slice(0, 6),
  };
} else if (l3.score === -1) {
  // Nessun profilo PT né vision: sentinella → media L1/L2 come oggi.
  l3 = { ...l3, score: Math.round((l1.score + l2.score) / 2) };
}
```

E aggiorna `hasProVideo` passato a `computeCombinedScore`/`generateFinalReport`: L3 ora "conta" se c'è il numerico **o** la vision. Cambia `hasProFrames` in quei due punti con:

```ts
const hasL3 = !!numericL3 || hasProFrames;
// ...generateFinalReport({ ..., hasProVideo: hasL3 })
// ...computeCombinedScore(l1.score, l2.score, l3.score, { hasProVideo: hasL3 })
```

- [ ] **Step 3: Verifica typecheck + unit**

Run: `npx tsc --noEmit && npx vitest run`
Expected: 0 errori TS; tutti gli unit test verdi (incl. i nuovi di Task 3-4).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/analysis/complete/route.ts
git commit -m "feat(analysis): L3 numerico+vision con profilo PT di riferimento"
```

---

### Task 10: Mostra L3 numerico nel report

**Files:**
- Reference (leggere prima): `src/app/(app)/analisi/report/[id]/page.tsx`
- Modify: `src/app/(app)/analisi/report/[id]/page.tsx`

- [ ] **Step 1: Leggi la pagina report**

Leggi come `l3Result` viene già mostrato (sezione confronto PT) e come sono rese le `keyDifferences`.

- [ ] **Step 2: Aggiungi la resa di `numericScore` e differenze chiave**

Dove è mostrato L3, se `l3Result.numericScore` è definito aggiungi un badge/riga:

```tsx
{typeof l3Result?.numericScore === "number" && (
  <div className="text-sm text-muted-foreground">
    Aderenza al modello PT: <span className="font-semibold text-foreground">{l3Result.numericScore}%</span>
  </div>
)}
```

Le `keyDifferences` (`{aspect, user, pro}`) sono già rese dal codice esistente: verifica che mostrino `aspect`, `user` (tu) e `pro` (PT). Se non lo fanno, rendile in una lista:

```tsx
{l3Result?.keyDifferences?.map((d, i) => (
  <li key={i} className="flex justify-between gap-2 text-sm">
    <span>{d.aspect}</span>
    <span className="text-muted-foreground">tu {d.user} · PT {d.pro}</span>
  </li>
))}
```

- [ ] **Step 3: Verifica typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: 0 errori.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/analisi/report/[id]/page.tsx"
git commit -m "feat(report): mostra aderenza numerica al profilo PT + differenze chiave"
```

---

## Verifica finale

- [ ] `npx tsc --noEmit` → 0 errori
- [ ] `npx vitest run` → tutti verdi (54 esistenti + ~6 nuovi)
- [ ] Prova manuale: admin estrae profilo PT su un esercizio → utente esegue l'esercizio → report mostra "Aderenza al modello PT %" + differenze chiave.
- [ ] Esercizio senza profilo PT → nessuna regressione (L3 come prima).

## Note

- I 6 frame PT client (vision L3) restano come sono: il numerico è indipendente.
- Nessuna dipendenza server da MediaPipe: l'estrazione gira nel browser admin, una volta.
- Parametri di taratura: `PT_SAMPLE_FPS=12`, `DEFAULT_TOLERANCE_DEG=15`, `L3_NUMERIC_WEIGHT=0.6`, `REFERENCE_PROFILE_VERSION=1`.
