# Redesign wow — Fase 1b (ExerciseFormPlayer + ScrollExplainer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Aggiungere alla libreria `wow` i due componenti "wow" più visibili: `ExerciseFormPlayer` (figura stilizzata di profilo che esegue un esercizio in loop con evidenziazione dell'errore) e `ScrollExplainer` (sequenza scroll-driven "come funziona").

**Architecture:** La cinematica è guidata da un motore di pose puro (`poseEngine.ts`) testato con vitest: pose come mappe giunto→punto, interpolazione lineare (lerp) tra posa iniziale e finale, archetipi di movimento. Il player anima un singolo scalare `t` (yoyo 0→1) via requestAnimationFrame e disegna i segmenti del corpo. Si corregge `useScrollStep` (firma `{ ref, active }`) e si costruisce `ScrollExplainer` sopra. Reduced-motion safe. Nessuna nuova dipendenza.

**Tech Stack:** Next.js 16, React 19, framer-motion 12, vitest (node).

---

## Note di contesto

Spec: `docs/superpowers/specs/2026-06-16-redesign-wow-fitai-design.md`.
Dipende da Fase 1 (già su `redesign-wow`): `src/components/wow/` esiste, così come `.wow-pulse` in `globals.css` e `MotionPrimitives.tsx`.
Vincolo test invariato: TDD solo su `.ts` (vitest `node`), `.tsx` verificati via preview tool.
Vista scelta per la figura: **profilo** (laterale), perché rende leggibili gli errori di squat (ginocchia/schiena) e di hinge (schiena tonda).
Archetipi in questo piano: `squat`, `hinge` (i due pattern più distinti e quelli citati dall'utente). `push`/`pull` si aggiungeranno come sole nuove voci dati in un secondo momento.

## File Structure

```
src/components/wow/
  pose/poseEngine.ts        # pose, lerp, archetipi, joint errore (TESTATO)
  pose/poseEngine.test.ts
  ExerciseFormPlayer.tsx    # figura SVG animata (RAF) + marker errore
  ScrollExplainer.tsx       # stepper scroll-driven
  index.ts                  # +export dei due nuovi componenti
src/components/motion/MotionPrimitives.tsx   # fix useScrollStep -> { ref, active }
```

---

## Task 1: `poseEngine.ts` — TDD

**Files:**
- Create: `src/components/wow/pose/poseEngine.ts`
- Test: `src/components/wow/pose/poseEngine.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/wow/pose/poseEngine.test.ts
import { describe, it, expect } from "vitest";
import { lerpPose, errorJoint, ARCHETYPES, SEGMENTS, JOINTS } from "./poseEngine";

describe("lerpPose", () => {
  const a = ARCHETYPES.squat.start;
  const b = ARCHETYPES.squat.end;

  it("a t=0 ritorna la posa iniziale", () => {
    const p = lerpPose(a, b, 0);
    expect(p.hip).toEqual(a.hip);
    expect(p.knee).toEqual(a.knee);
  });
  it("a t=1 ritorna la posa finale", () => {
    const p = lerpPose(a, b, 1);
    expect(p.knee).toEqual(b.knee);
  });
  it("a t=0.5 ritorna il punto medio di ogni giunto", () => {
    const p = lerpPose(a, b, 0.5);
    expect(p.hip[0]).toBeCloseTo((a.hip[0] + b.hip[0]) / 2);
    expect(p.hip[1]).toBeCloseTo((a.hip[1] + b.hip[1]) / 2);
  });
  it("clampa t fuori range", () => {
    expect(lerpPose(a, b, -1).hip).toEqual(a.hip);
    expect(lerpPose(a, b, 2).hip).toEqual(b.hip);
  });
});

describe("errorJoint", () => {
  const pose = ARCHETYPES.squat.end;
  it("'knee' ritorna il punto del ginocchio", () => {
    expect(errorJoint("knee", pose)).toEqual(pose.knee);
  });
  it("'hip' ritorna il punto dell'anca", () => {
    expect(errorJoint("hip", pose)).toEqual(pose.hip);
  });
  it("'back' ritorna il punto medio tra spalla e anca", () => {
    const [x, y] = errorJoint("back", pose);
    expect(x).toBeCloseTo((pose.shoulder[0] + pose.hip[0]) / 2);
    expect(y).toBeCloseTo((pose.shoulder[1] + pose.hip[1]) / 2);
  });
});

describe("dati", () => {
  it("ogni archetipo ha start ed end con tutti i giunti", () => {
    for (const key of Object.keys(ARCHETYPES) as Array<keyof typeof ARCHETYPES>) {
      for (const phase of ["start", "end"] as const) {
        const pose = ARCHETYPES[key][phase];
        for (const j of JOINTS) {
          expect(pose[j], `${key}.${phase}.${j}`).toBeDefined();
          expect(pose[j]).toHaveLength(2);
        }
      }
    }
  });
  it("ogni segmento collega due giunti noti", () => {
    for (const [from, to] of SEGMENTS) {
      expect(JOINTS).toContain(from);
      expect(JOINTS).toContain(to);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/wow/pose/poseEngine.test.ts`
Expected: FAIL — cannot resolve `./poseEngine`.

- [ ] **Step 3: Write the implementation**

```ts
// src/components/wow/pose/poseEngine.ts
export type Point = [number, number];

export const JOINTS = [
  "head", "shoulder", "elbow", "hand", "hip", "knee", "ankle", "foot",
] as const;
export type Joint = (typeof JOINTS)[number];

export type Pose = Record<Joint, Point>;
export type Archetype = "squat" | "hinge";
export type ErrorKey = "knee" | "back" | "hip";

export interface ExercisePoses {
  start: Pose;
  end: Pose;
  defaultError: ErrorKey;
}

// Spazio coordinate viewBox 0 0 200 300, figura di profilo rivolta a destra.
const STANDING: Pose = {
  head: [100, 46],
  shoulder: [100, 70],
  elbow: [108, 108],
  hand: [114, 150],
  hip: [101, 152],
  knee: [100, 212],
  ankle: [100, 266],
  foot: [120, 266],
};

export const ARCHETYPES: Record<Archetype, ExercisePoses> = {
  squat: {
    start: STANDING,
    end: {
      head: [86, 100],
      shoulder: [90, 122],
      elbow: [112, 140],
      hand: [142, 146],
      hip: [96, 176],
      knee: [122, 206],
      ankle: [100, 266],
      foot: [120, 266],
    },
    defaultError: "knee",
  },
  hinge: {
    start: STANDING,
    end: {
      head: [66, 116],
      shoulder: [80, 122],
      elbow: [82, 160],
      hand: [84, 196],
      hip: [120, 150],
      knee: [114, 210],
      ankle: [100, 266],
      foot: [120, 266],
    },
    defaultError: "back",
  },
};

export const SEGMENTS: Array<[Joint, Joint]> = [
  ["head", "shoulder"],
  ["shoulder", "hip"],
  ["shoulder", "elbow"],
  ["elbow", "hand"],
  ["hip", "knee"],
  ["knee", "ankle"],
  ["ankle", "foot"],
];

function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const k = clamp01(t);
  const out = {} as Pose;
  for (const j of JOINTS) {
    out[j] = [
      a[j][0] + (b[j][0] - a[j][0]) * k,
      a[j][1] + (b[j][1] - a[j][1]) * k,
    ];
  }
  return out;
}

export function errorJoint(key: ErrorKey, pose: Pose): Point {
  if (key === "knee") return pose.knee;
  if (key === "hip") return pose.hip;
  return [
    (pose.shoulder[0] + pose.hip[0]) / 2,
    (pose.shoulder[1] + pose.hip[1]) / 2,
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/wow/pose/poseEngine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/wow/pose/poseEngine.ts src/components/wow/pose/poseEngine.test.ts
git commit -m "feat(wow): motore di pose testato (squat, hinge)"
```

---

## Task 2: `ExerciseFormPlayer.tsx`

**Files:**
- Create: `src/components/wow/ExerciseFormPlayer.tsx`

- [ ] **Step 1: Scrivere il componente**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ARCHETYPES,
  SEGMENTS,
  lerpPose,
  errorJoint,
  type Archetype,
  type ErrorKey,
} from "./pose/poseEngine";

export function ExerciseFormPlayer({
  archetype,
  error,
  errorNote,
  showError = true,
  size = 220,
  period = 2.6,
  className,
}: {
  archetype: Archetype;
  error?: ErrorKey;
  errorNote?: string;
  showError?: boolean;
  size?: number;
  period?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [t, setT] = useState(reduced ? 1 : 0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduced) {
      setT(1);
      return;
    }
    const startedAt = performance.now();
    const tick = (now: number) => {
      const elapsed = ((now - startedAt) / 1000) % period;
      const next = 0.5 - 0.5 * Math.cos((2 * Math.PI * elapsed) / period);
      setT(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [reduced, period]);

  const conf = ARCHETYPES[archetype];
  const pose = lerpPose(conf.start, conf.end, t);
  const errKey: ErrorKey = error ?? conf.defaultError;
  const marker = showError ? errorJoint(errKey, pose) : null;

  return (
    <svg
      viewBox="0 0 200 300"
      width={size}
      height={size * 1.5}
      className={className}
      role="img"
      aria-label={`Esecuzione stilizzata: ${archetype}${showError ? `, errore evidenziato su ${errKey}` : ""}`}
    >
      <line x1="40" y1="282" x2="160" y2="282" stroke="var(--organic-line)" strokeWidth="3" strokeLinecap="round" />
      {SEGMENTS.map(([from, to]) => (
        <line
          key={`${from}-${to}`}
          x1={pose[from][0]}
          y1={pose[from][1]}
          x2={pose[to][0]}
          y2={pose[to][1]}
          stroke="var(--organic-espresso)"
          strokeWidth="7"
          strokeLinecap="round"
        />
      ))}
      <circle cx={pose.head[0]} cy={pose.head[1]} r="13" fill="var(--organic-espresso)" />
      {marker && (
        <g>
          <circle cx={marker[0]} cy={marker[1]} r="16" fill="none" stroke="var(--energy-hot, #d85a30)" strokeWidth="3" className="wow-pulse" />
          <circle cx={marker[0]} cy={marker[1]} r="5" fill="var(--energy-hot, #d85a30)" />
          {errorNote && (
            <text x={marker[0] + 22} y={marker[1] + 4} fontSize="12" fontWeight="600" fill="var(--energy-hot, #d85a30)">
              {errorNote}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}
```

- [ ] **Step 2: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore riferito a `ExerciseFormPlayer.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/wow/ExerciseFormPlayer.tsx
git commit -m "feat(wow): ExerciseFormPlayer con evidenziazione errore"
```

---

## Task 3: fix `useScrollStep` + `ScrollExplainer.tsx`

In Fase 1 `useScrollStep` restituiva solo l'indice ma il suo `ref` non era agganciabile dal consumer (traccia uno scroll mai montato). Correggiamo la firma a `{ ref, active }`.

**Files:**
- Modify: `src/components/motion/MotionPrimitives.tsx` (sostituire la funzione `useScrollStep`)
- Create: `src/components/wow/ScrollExplainer.tsx`

- [ ] **Step 1: Sostituire `useScrollStep` in `MotionPrimitives.tsx`**

Trovare la funzione `useScrollStep` esistente (è in fondo al file) e SOSTITUIRLA interamente con:

```tsx
export function useScrollStep<T extends HTMLElement = HTMLDivElement>(
  steps: number,
): { ref: React.RefObject<T | null>; active: number } {
  const ref = useRef<T>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const [active, setActive] = useState(0);
  useEffect(() => {
    return scrollYProgress.on("change", (p) => {
      setActive(Math.min(steps - 1, Math.max(0, Math.floor(p * steps))));
    });
  }, [scrollYProgress, steps]);
  return { ref, active };
}
```

Verificare che `useRef`, `useEffect`, `useState`, `useScroll` siano già importati (lo sono dalla Fase 1). Nessun altro uso di `useScrollStep` esiste ancora, quindi il cambio di firma non rompe consumatori.

- [ ] **Step 2: Creare `ScrollExplainer.tsx`**

```tsx
"use client";

import { useScrollStep } from "@/components/motion/MotionPrimitives";
import { cn } from "@/lib/utils";

export interface ExplainerStep {
  title: string;
  desc: string;
}

export function ScrollExplainer({
  steps,
  className,
  visual,
}: {
  steps: ExplainerStep[];
  className?: string;
  visual?: (activeIndex: number) => React.ReactNode;
}) {
  const { ref, active } = useScrollStep<HTMLDivElement>(steps.length);

  return (
    <div ref={ref} className={cn("relative", className)} style={{ minHeight: `${steps.length * 80}vh` }}>
      <div className="sticky top-0 grid lg:grid-cols-2 gap-10 items-center min-h-[100dvh] py-16">
        <div className="space-y-5">
          {steps.map((s, i) => {
            const isActive = i === active;
            return (
              <div
                key={s.title}
                className="flex gap-4 transition-all duration-500"
                style={{ opacity: isActive ? 1 : 0.35, transform: isActive ? "translateX(0)" : "translateX(-6px)" }}
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-full grid place-items-center font-display text-sm transition-colors duration-500"
                  style={{
                    background: isActive ? "var(--organic-green)" : "var(--organic-line)",
                    color: isActive ? "var(--organic-cream)" : "var(--organic-sage-deep)",
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-display text-xl mb-1">{s.title}</h3>
                  <p className="text-muted-foreground text-sm max-w-[42ch]">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden lg:flex items-center justify-center min-h-[320px]">
          {visual ? visual(active) : null}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore riferito a `MotionPrimitives.tsx` o `ScrollExplainer.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/motion/MotionPrimitives.tsx src/components/wow/ScrollExplainer.tsx
git commit -m "feat(wow): ScrollExplainer + fix firma useScrollStep"
```

---

## Task 4: barrel + verifica preview + cleanup

**Files:**
- Modify: `src/components/wow/index.ts`
- Create (temporaneo): `src/app/wow-sandbox/page.tsx` (rimosso a fine task)

- [ ] **Step 1: Aggiornare il barrel `index.ts`**

Aggiungere queste righe a `src/components/wow/index.ts`:

```ts
export { ExerciseFormPlayer } from "./ExerciseFormPlayer";
export { ScrollExplainer } from "./ScrollExplainer";
export * from "./pose/poseEngine";
```

- [ ] **Step 2: Creare la sandbox di verifica**

```tsx
import { ExerciseFormPlayer, ScrollExplainer } from "@/components/wow";

export default function WowSandbox() {
  return (
    <div className="theme-organic min-h-screen bg-background text-foreground p-10 space-y-16">
      <div className="flex gap-12 flex-wrap">
        <ExerciseFormPlayer archetype="squat" errorNote="ginocchia in avanti" />
        <ExerciseFormPlayer archetype="hinge" errorNote="schiena curva" />
      </div>
      <ScrollExplainer
        steps={[
          { title: "Scansiona", desc: "Carichi un video del tuo set, niente attrezzature." },
          { title: "Analisi AI", desc: "Il modello stima gli angoli articolari fotogramma per fotogramma." },
          { title: "Correggi", desc: "Vedi dove sbagli sulla figura, con una nota sul punto critico." },
          { title: "Adatta", desc: "Il piano si aggiorna sui tuoi punti carenti." },
        ]}
      />
    </div>
  );
}
```

- [ ] **Step 3: Verifica via preview / HTTP**

- Se un dev server è già attivo su :3000, richiedere `http://localhost:3000/wow-sandbox` e verificare HTTP 200 + presenza dei marker testo ("ginocchia in avanti", "schiena curva", "Scansiona", "Analisi AI"). Altrimenti avviare con preview_start e usare snapshot/screenshot.
- Controllare assenza di errori console/log.

- [ ] **Step 4: Rimuovere la sandbox e committare**

```bash
git rm -r src/app/wow-sandbox
git add src/components/wow/index.ts
git commit -m "feat(wow): export ExerciseFormPlayer e ScrollExplainer"
```

---

## Self-Review (eseguita)

- **Copertura spec:** ExerciseFormPlayer (figura + errore) ✓, ScrollExplainer ✓, fix useScrollStep ✓.
- **Placeholder:** nessuno; codice completo per ogni step.
- **Coerenza tipi:** `Archetype`/`ErrorKey`/`Pose`/`Point` definiti in Task 1 e usati in Task 2; `useScrollStep` ritorna `{ ref, active }` (Task 3) e `ScrollExplainer` lo consuma con la stessa forma; barrel coerente coi nomi esportati.
- **Vincolo test:** TDD su `poseEngine.ts` (`.ts`); `.tsx` via preview.
- **Reduced-motion:** player ferma il loop e mostra la posa finale (errore visibile); ScrollExplainer usa transizioni CSS leggere.
