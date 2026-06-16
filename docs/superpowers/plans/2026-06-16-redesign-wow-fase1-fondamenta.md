# Redesign wow — Fase 1 (Fondamenta) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Costruire la libreria di componenti `wow` riutilizzabili (logica heat testata + primitive data-viz animate + AdaptiveBodyMap + estensioni motion) che sblocca il redesign di landing e dashboard.

**Architecture:** Logica pura estratta in moduli `.ts` testati con vitest (environment `node`, come gli altri test del progetto). Componenti presentazionali SVG/React in `src/components/wow/` verificati visivamente via preview tool. Si riusa l'anatomia SVG esistente (`AnatomyFront/Back`, che già fanno `transition-colors`) e `framer-motion` già in dipendenze. Nessuna nuova dipendenza.

**Tech Stack:** Next.js 16, React 19, Tailwind v4 (`@theme`), framer-motion 12, vitest (node).

---

## Riferimenti dallo spec

Spec: `docs/superpowers/specs/2026-06-16-redesign-wow-fitai-design.md`.
Questo piano copre la **Fase 1 (Fondamenta)** + le primitive data-viz e `AdaptiveBodyMap`.
Fuori da questo piano (piani dedicati successivi):
- `ExerciseFormPlayer` (4 archetipi movimento) — piano Fase 1b.
- `ScrollExplainer`, `StatBadge`, `LiveMetric` — piano Fase 1b.
- Integrazione nelle pagine (landing/dashboard/…) — piani Fasi 2–5.

## Vincoli di test (importante)

- vitest gira con `environment: "node"` e `include: ["src/**/*.test.ts"]` (solo `.ts`).
- Non esiste harness per componenti React (niente jsdom/testing-library) e **non lo aggiungiamo** in questa fase.
- Quindi: TDD reale solo sui moduli di **logica pura** (`.ts`). I componenti `.tsx` si verificano via **preview tool** (avvio dev server, snapshot/console).
- Comando test unit: `npm run test:unit` (alias di `vitest run`). Per un singolo file: `npx vitest run src/path/file.test.ts`.

## File Structure

```
src/components/wow/
  heat/heatScale.ts          # logica pura: dati -> classi energy/heat (TESTATO)
  heat/heatScale.test.ts     # test vitest (node)
  AdaptiveBodyMap.tsx        # wrapper animato di BodyMap (usa heatScale + Anatomy)
  charts/AnimatedRing.tsx    # anello gauge con draw-on + count-up
  charts/RadialGauge.tsx     # gauge radiale (macro/calorie)
  charts/AnimatedArea.tsx    # area chart SVG con path draw-on
  charts/AnimatedBars.tsx    # barre con stagger + count-up
  index.ts                   # barrel export
src/components/motion/MotionPrimitives.tsx   # +ParallaxLayer, +DrawPath, +ScrollProgress
src/app/globals.css                          # +keyframe .wow-pulse
```

---

## Task 1: Logica heat pura (`heatScale.ts`) — TDD

Estrae e centralizza la mappatura dati→classe colore oggi duplicata in
`src/components/visualizations/BodyMap/BodyMap.tsx` (DRY). Stesse soglie.

**Files:**
- Create: `src/components/wow/heat/heatScale.ts`
- Test: `src/components/wow/heat/heatScale.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/components/wow/heat/heatScale.test.ts
import { describe, it, expect } from "vitest";
import {
  volumeEnergyClass,
  recoveryEnergyClass,
  muscleClassesFromVolume,
  muscleClassesFromRecovery,
  deficitMuscles,
  MUSCLE_KEYS,
} from "./heatScale";

describe("volumeEnergyClass", () => {
  it("mappa le soglie volume sulle classi energy", () => {
    expect(volumeEnergyClass(0)).toBe("fill-energy-cold/30");
    expect(volumeEnergyClass(0.05)).toBe("fill-energy-cold/30");
    expect(volumeEnergyClass(0.2)).toBe("fill-energy-cool/60");
    expect(volumeEnergyClass(0.3)).toBe("fill-energy-cool/60");
    expect(volumeEnergyClass(0.5)).toBe("fill-energy-cool");
    expect(volumeEnergyClass(0.6)).toBe("fill-energy-cool");
    expect(volumeEnergyClass(0.8)).toBe("fill-energy-warm");
    expect(volumeEnergyClass(0.85)).toBe("fill-energy-warm");
    expect(volumeEnergyClass(0.95)).toBe("fill-energy-hot");
    expect(volumeEnergyClass(1)).toBe("fill-energy-hot");
  });
});

describe("recoveryEnergyClass", () => {
  it("mappa le soglie recovery sulle classi energy", () => {
    expect(recoveryEnergyClass(0)).toBe("fill-energy-hot");
    expect(recoveryEnergyClass(24)).toBe("fill-energy-hot");
    expect(recoveryEnergyClass(25)).toBe("fill-energy-warm");
    expect(recoveryEnergyClass(49)).toBe("fill-energy-warm");
    expect(recoveryEnergyClass(50)).toBe("fill-energy-cool/70");
    expect(recoveryEnergyClass(74)).toBe("fill-energy-cool/70");
    expect(recoveryEnergyClass(75)).toBe("fill-energy-cool");
    expect(recoveryEnergyClass(100)).toBe("fill-energy-cool");
  });
});

describe("muscleClassesFromVolume", () => {
  it("costruisce la mappa muscolo->classe", () => {
    const out = muscleClassesFromVolume({ CHEST: 0.9, CORE: 0.1 });
    expect(out.CHEST).toBe("fill-energy-hot");
    expect(out.CORE).toBe("fill-energy-cool/60");
  });
});

describe("muscleClassesFromRecovery", () => {
  it("usa recoveryPct per ciascun muscolo", () => {
    const out = muscleClassesFromRecovery({
      QUADRICEPS: { recoveryPct: 10 },
      CALVES: { recoveryPct: 90 },
    });
    expect(out.QUADRICEPS).toBe("fill-energy-hot");
    expect(out.CALVES).toBe("fill-energy-cool");
  });
});

describe("deficitMuscles", () => {
  it("ritorna i muscoli con deficit oltre soglia (default 50)", () => {
    const list = deficitMuscles([
      { muscle: "GLUTES", deficitPct: 70 },
      { muscle: "CORE", deficitPct: 30 },
    ]);
    expect(list).toEqual(["GLUTES"]);
  });
  it("soglia configurabile", () => {
    const list = deficitMuscles([{ muscle: "CORE", deficitPct: 30 }], 20);
    expect(list).toEqual(["CORE"]);
  });
});

describe("MUSCLE_KEYS", () => {
  it("contiene gli 11 gruppi muscolari", () => {
    expect(MUSCLE_KEYS).toHaveLength(11);
    expect(MUSCLE_KEYS).toContain("CHEST");
    expect(MUSCLE_KEYS).toContain("CALVES");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/wow/heat/heatScale.test.ts`
Expected: FAIL — `Failed to resolve import "./heatScale"` (file non esiste).

- [ ] **Step 3: Write minimal implementation**

```ts
// src/components/wow/heat/heatScale.ts
export const MUSCLE_KEYS = [
  "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "FOREARMS",
  "CORE", "QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES",
] as const;

export type MuscleKey = (typeof MUSCLE_KEYS)[number];

export type VolumeData = Record<string, number>; // 0..1 normalizzato
export type RecoveryData = Record<string, { recoveryPct: number }>;
export type ImbalanceData = Array<{ muscle: string; deficitPct: number }>;

export function volumeEnergyClass(value: number): string {
  if (value <= 0.05) return "fill-energy-cold/30";
  if (value <= 0.3) return "fill-energy-cool/60";
  if (value <= 0.6) return "fill-energy-cool";
  if (value <= 0.85) return "fill-energy-warm";
  return "fill-energy-hot";
}

export function recoveryEnergyClass(pct: number): string {
  if (pct < 25) return "fill-energy-hot";
  if (pct < 50) return "fill-energy-warm";
  if (pct < 75) return "fill-energy-cool/70";
  return "fill-energy-cool";
}

export function muscleClassesFromVolume(data: VolumeData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [muscle, value] of Object.entries(data)) {
    out[muscle] = volumeEnergyClass(value);
  }
  return out;
}

export function muscleClassesFromRecovery(data: RecoveryData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [muscle, info] of Object.entries(data)) {
    out[muscle] = recoveryEnergyClass(info.recoveryPct);
  }
  return out;
}

export function deficitMuscles(data: ImbalanceData, threshold = 50): string[] {
  return data.filter((i) => i.deficitPct > threshold).map((i) => i.muscle);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/wow/heat/heatScale.test.ts`
Expected: PASS (tutti i blocchi describe verdi).

- [ ] **Step 5: Commit**

```bash
git add src/components/wow/heat/heatScale.ts src/components/wow/heat/heatScale.test.ts
git commit -m "feat(wow): logica heat condivisa testata"
```

---

## Task 2: Estensioni motion (`ParallaxLayer`, `DrawPath`, `ScrollProgress`)

Aggiunge primitive di motion al file esistente, stesso pattern reduced-motion.

**Files:**
- Modify: `src/components/motion/MotionPrimitives.tsx` (append in fondo, prima dell'EOF)

- [ ] **Step 1: Aggiungere gli import necessari in cima al file**

In `src/components/motion/MotionPrimitives.tsx`, riga 3, sostituire l'import esistente:

```tsx
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
```

(Aggiunge `useScroll`, `useTransform`, `useRef` agli import già presenti.)

- [ ] **Step 2: Appendere i tre componenti in fondo al file**

```tsx
export function ParallaxLayer({
  children,
  speed = 0.2,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * 100, speed * -100]);
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}

export function DrawPath({
  d,
  stroke = "currentColor",
  strokeWidth = 2,
  duration = 1.4,
  delay = 0,
  className,
}: {
  d: string;
  stroke?: string;
  strokeWidth?: number;
  duration?: number;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.path
      className={className}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      initial={reduced ? false : { pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: reduced ? 0 : duration, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : delay }}
    />
  );
}

export function useScrollStep(steps: number): number {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const [active, setActive] = useState(0);
  useEffect(() => {
    return scrollYProgress.on("change", (p) => {
      setActive(Math.min(steps - 1, Math.floor(p * steps)));
    });
  }, [scrollYProgress, steps]);
  return active;
}
```

- [ ] **Step 3: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore introdotto da `MotionPrimitives.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/components/motion/MotionPrimitives.tsx
git commit -m "feat(motion): ParallaxLayer, DrawPath, useScrollStep"
```

---

## Task 3: `AnimatedRing` + `RadialGauge`

Primitive gauge ad anello (riusa il pattern di `OrganicHeroVisual`).

**Files:**
- Create: `src/components/wow/charts/AnimatedRing.tsx`
- Create: `src/components/wow/charts/RadialGauge.tsx`

- [ ] **Step 1: Scrivere `AnimatedRing.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/MotionPrimitives";
import { clamp } from "@/lib/utils";

export function AnimatedRing({
  value,
  max = 100,
  size = 140,
  thickness = 12,
  label,
  trackColor = "var(--organic-line)",
  from = "#8a9a7b",
  to = "#3fae5a",
}: {
  value: number;
  max?: number;
  size?: number;
  thickness?: number;
  label?: string;
  trackColor?: string;
  from?: string;
  to?: string;
}) {
  const reduced = useReducedMotion();
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const pct = clamp(value / max, 0, 1);
  const gid = `ring-${Math.round(value)}-${size}`;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={thickness} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduced ? c * (1 - pct) : c }}
          whileInView={{ strokeDashoffset: c * (1 - pct) }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: reduced ? 0 : 1.4, ease: [0.2, 0.8, 0.2, 1] }}
        />
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={from} />
            <stop offset="1" stopColor={to} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl leading-none" style={{ color: "var(--organic-espresso)" }}>
          <CountUp value={value} />
        </span>
        {label && <small className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</small>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Scrivere `RadialGauge.tsx`**

Arco a 270° per metriche tipo macro/calorie.

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/MotionPrimitives";
import { clamp } from "@/lib/utils";

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polar(cx, cy, r, endDeg);
  const e = polar(cx, cy, r, startDeg);
  const large = endDeg - startDeg <= 180 ? "0" : "1";
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}

export function RadialGauge({
  value,
  max,
  unit,
  color = "#3fae5a",
  size = 120,
  label,
}: {
  value: number;
  max: number;
  unit?: string;
  color?: string;
  size?: number;
  label?: string;
}) {
  const reduced = useReducedMotion();
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const start = -135;
  const end = 135;
  const pct = clamp(value / max, 0, 1);
  const valueEnd = start + (end - start) * pct;
  const len = Math.PI * r * 1.5;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <path d={arcPath(cx, cy, r, start, end)} fill="none" stroke="var(--organic-line)" strokeWidth="9" strokeLinecap="round" />
        <motion.path
          d={arcPath(cx, cy, r, start, valueEnd)}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={len}
          initial={{ strokeDashoffset: reduced ? 0 : len }}
          whileInView={{ strokeDashoffset: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: reduced ? 0 : 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl leading-none" style={{ color: "var(--organic-espresso)" }}>
          <CountUp value={value} />{unit && <small className="text-xs font-sans">{unit}</small>}
        </span>
        {label && <small className="text-[10px] text-muted-foreground mt-0.5">{label}</small>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore nei due nuovi file.

- [ ] **Step 4: Commit**

```bash
git add src/components/wow/charts/AnimatedRing.tsx src/components/wow/charts/RadialGauge.tsx
git commit -m "feat(wow): primitive AnimatedRing e RadialGauge"
```

---

## Task 4: `AnimatedArea` + `AnimatedBars`

**Files:**
- Create: `src/components/wow/charts/AnimatedArea.tsx`
- Create: `src/components/wow/charts/AnimatedBars.tsx`

- [ ] **Step 1: Scrivere `AnimatedArea.tsx`**

Area chart SVG da una serie di numeri; linea che si disegna + area in fade.

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

function buildPath(values: number[], w: number, h: number, pad: number) {
  if (values.length === 0) return { line: "", area: "" };
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = (w - pad * 2) / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => {
    const x = pad + i * step;
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${h - pad} L${pts[0][0].toFixed(1)},${h - pad} Z`;
  return { line, area };
}

export function AnimatedArea({
  values,
  width = 300,
  height = 150,
  pad = 6,
  color = "#3fae5a",
  className,
}: {
  values: number[];
  width?: number;
  height?: number;
  pad?: number;
  color?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { line, area } = buildPath(values, width, height, pad);
  const gid = `area-${values.length}-${Math.round(values[0] ?? 0)}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.4" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gid})`}
        initial={reduced ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reduced ? 0 : 0.8, delay: 0.3 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reduced ? 0 : 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
```

- [ ] **Step 2: Scrivere `AnimatedBars.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedBars({
  data,
  color = "#3fae5a",
  className,
}: {
  data: Array<{ label: string; value: number }>;
  color?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={className}>
      {data.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3 py-1.5">
          <span className="text-xs text-muted-foreground w-20 shrink-0 truncate">{d.label}</span>
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--organic-line)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: color, transformOrigin: "left" }}
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: d.value / max }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: reduced ? 0 : 0.8, ease: [0.22, 1, 0.36, 1], delay: reduced ? 0 : i * 0.06 }}
            />
          </div>
          <span className="text-xs font-semibold w-8 text-right tabular-nums">{Math.round(d.value)}</span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore nei due nuovi file.

- [ ] **Step 4: Commit**

```bash
git add src/components/wow/charts/AnimatedArea.tsx src/components/wow/charts/AnimatedBars.tsx
git commit -m "feat(wow): primitive AnimatedArea e AnimatedBars"
```

---

## Task 5: keyframe `.wow-pulse` + `AdaptiveBodyMap`

`AdaptiveBodyMap` riusa `AnatomyFront/Back` (che già fanno `transition-colors duration-300`,
quindi i cambi di heat sono già animati) e aggiunge pulse sui muscoli carenti + reveal d'entrata.

**Files:**
- Modify: `src/app/globals.css` (aggiungere keyframe nel blocco `@layer utilities`)
- Create: `src/components/wow/AdaptiveBodyMap.tsx`

- [ ] **Step 1: Aggiungere il keyframe pulse in `globals.css`**

Dentro `@layer utilities { ... }` (es. dopo il blocco `.organic-floaty`, intorno alla riga 246), aggiungere:

```css
  @keyframes wow-muscle-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
  }
  .wow-pulse { animation: wow-muscle-pulse 1.8s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .wow-pulse { animation: none !important; }
  }
```

- [ ] **Step 2: Scrivere `AdaptiveBodyMap.tsx`**

```tsx
"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AnatomyFront } from "@/components/visualizations/BodyMap/AnatomyFront";
import { AnatomyBack } from "@/components/visualizations/BodyMap/AnatomyBack";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  muscleClassesFromVolume,
  muscleClassesFromRecovery,
  deficitMuscles,
  MUSCLE_KEYS,
  type VolumeData,
  type RecoveryData,
  type ImbalanceData,
} from "./heat/heatScale";

type View = "front" | "back" | "both";

type Props =
  | { mode: "volume"; data: VolumeData; view?: View; className?: string; showToggle?: boolean }
  | { mode: "recovery"; data: RecoveryData; view?: View; className?: string; showToggle?: boolean }
  | { mode: "balance"; data: ImbalanceData; view?: View; className?: string; showToggle?: boolean };

function classesFor(props: Props): Record<string, string> {
  if (props.mode === "volume") return muscleClassesFromVolume(props.data);
  if (props.mode === "recovery") return muscleClassesFromRecovery(props.data);
  const deficit = new Set(deficitMuscles(props.data));
  const out: Record<string, string> = {};
  for (const m of MUSCLE_KEYS) {
    out[m] = deficit.has(m) ? "fill-energy-hot/80 wow-pulse" : "fill-muted-foreground/15";
  }
  return out;
}

export function AdaptiveBodyMap(props: Props) {
  const reduced = useReducedMotion();
  const initialView: View = props.view ?? "front";
  const [view, setView] = useState<View>(initialView);
  const muscleClasses = classesFor(props);
  const showToggle = props.showToggle ?? true;

  return (
    <motion.div
      className={cn("w-full space-y-3", props.className)}
      initial={reduced ? false : { opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: reduced ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {showToggle && (
        <div className="flex gap-1">
          {(["front", "back", "both"] as const).map((v) => (
            <Button key={v} size="sm" variant={view === v ? "default" : "outline"} onClick={() => setView(v)}>
              {v === "front" ? "Fronte" : v === "back" ? "Retro" : "Entrambi"}
            </Button>
          ))}
        </div>
      )}
      <div className={cn("grid gap-4", view === "both" ? "grid-cols-2" : "grid-cols-1")}>
        {(view === "front" || view === "both") && (
          <div className="flex justify-center max-w-[260px] mx-auto">
            <AnatomyFront muscleClasses={muscleClasses} />
          </div>
        )}
        {(view === "back" || view === "both") && (
          <div className="flex justify-center max-w-[260px] mx-auto">
            <AnatomyBack muscleClasses={muscleClasses} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Verifica typecheck**

Run: `npx tsc --noEmit`
Expected: nessun errore. (Nota: `AnatomyFront`/`AnatomyBack` accettano `muscleClasses` come `Partial<Record<...>>`; passare un `Record<string,string>` è compatibile a runtime — se tsc segnala incompatibilità di indice, tipizzare il parametro `muscleClasses` come `Record<string, string>` nei due componenti Anatomy senza cambiarne la logica.)

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/components/wow/AdaptiveBodyMap.tsx
git commit -m "feat(wow): AdaptiveBodyMap con pulse sui muscoli carenti"
```

---

## Task 6: Barrel export + verifica visiva su pagina sandbox

**Files:**
- Create: `src/components/wow/index.ts`
- Create (temporaneo): `src/app/(app)/_wow-sandbox/page.tsx` — pagina di verifica, rimossa a fine fase.

- [ ] **Step 1: Scrivere il barrel `index.ts`**

```ts
export { AdaptiveBodyMap } from "./AdaptiveBodyMap";
export { AnimatedRing } from "./charts/AnimatedRing";
export { RadialGauge } from "./charts/RadialGauge";
export { AnimatedArea } from "./charts/AnimatedArea";
export { AnimatedBars } from "./charts/AnimatedBars";
export * from "./heat/heatScale";
```

- [ ] **Step 2: Creare la pagina sandbox di verifica**

```tsx
import { AdaptiveBodyMap, AnimatedRing, RadialGauge, AnimatedArea, AnimatedBars } from "@/components/wow";

export default function WowSandbox() {
  return (
    <div className="theme-organic min-h-screen bg-background text-foreground p-10 space-y-10">
      <div className="grid md:grid-cols-3 gap-8 items-start">
        <AdaptiveBodyMap mode="balance" data={[{ muscle: "GLUTES", deficitPct: 70 }, { muscle: "CALVES", deficitPct: 60 }]} />
        <AnimatedRing value={82} label="form score" />
        <RadialGauge value={1840} max={2400} unit=" kcal" label="oggi" color="#3fae5a" />
      </div>
      <div className="max-w-[420px]">
        <AnimatedArea values={[20, 28, 24, 35, 33, 48, 60]} color="#3fae5a" className="w-full h-[150px]" />
      </div>
      <div className="max-w-[420px]">
        <AnimatedBars data={[{ label: "Petto", value: 18 }, { label: "Schiena", value: 22 }, { label: "Gambe", value: 30 }]} />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verifica visiva via preview tool**

- Avviare il dev server (`preview_start`).
- Aprire `/_wow-sandbox`.
- `preview_console_logs`: nessun errore.
- `preview_snapshot`: i 5 componenti sono presenti.
- `preview_screenshot`: confermare anelli/gauge animati, heatmap con pulse sui carenti, area e barre.
- Se emergono errori, correggere il sorgente del componente e ripetere.

- [ ] **Step 4: Rimuovere la sandbox e committare**

```bash
git rm -r "src/app/(app)/_wow-sandbox"
git add src/components/wow/index.ts
git commit -m "feat(wow): barrel export libreria wow"
```

---

## Self-Review (eseguita)

- **Copertura spec (Fase 1):** heatScale (logica) ✓, AdaptiveBodyMap ✓, AnimatedRing/RadialGauge/AnimatedArea/AnimatedBars ✓, estensioni motion (ParallaxLayer/DrawPath/useScrollStep) ✓. `ExerciseFormPlayer`, `ScrollExplainer`, `StatBadge`, `LiveMetric` esplicitamente rinviati a piano Fase 1b.
- **Placeholder:** nessun TBD/TODO; ogni step ha codice o comando concreto.
- **Coerenza tipi:** `VolumeData`/`RecoveryData`/`ImbalanceData` definiti in Task 1 e riusati in Task 5; `MUSCLE_KEYS`, `deficitMuscles`, `muscleClassesFrom*` coerenti tra task; `clamp` importato da `@/lib/utils` (esistente). Lo `useScrollStep` esportato è coerente con il nome usato.
- **Vincolo test:** TDD applicato solo a `.ts` (heatScale); componenti `.tsx` verificati via preview, come da setup vitest `node`.
