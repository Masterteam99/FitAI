# Redesign "wow" del sito FitAI — Design

**Data:** 2026-06-16
**Stato:** approvato (impianto), pronto per la fase di pianificazione

## Obiettivo

Elevare l'intero sito FitAI da "basic" a "wow" aggiungendo animazioni e
visualizzazioni che raccontano la situazione dell'utente e cosa fa l'app:
heatmap corporea adattiva, rappresentazione stilizzata dell'esecuzione degli
esercizi con evidenziazione degli errori, explainer animato della landing,
grafici di progresso cinematici. Restyling **visibile** (non solo rifinitura)
mantenendo lo stack esistente.

## Decisioni prese (durante il brainstorming)

1. **Scope:** tutte le pagine del sito.
2. **Intensità:** restyling visibile (cambio pattern generici, depth/overlap,
   motion più ricco), non semplice rifinitura.
3. **Tecnica animazioni:** animazioni in codice — SVG + CSS + `framer-motion`
   (già in dipendenze). Niente Lottie, niente video reali/3D, niente volti.
4. **Dati:** reali dove esistono già (allenamenti, carichi, streak); dati
   dimostrativi realistici dove il dato non esiste ancora (es. analisi
   posturale dell'esercizio).
5. **Strategia rollout:** Approccio A — libreria di componenti condivisa
   costruita prima, poi cablata pagina per pagina, per fasi con checkpoint.
6. **Livello asset immagine (raster/OG/favicon, taste image-skill):** FUORI
   scope per ora. Le animazioni sono in codice; il raster si valuta dopo.

## Vincoli

- Next.js 16 + React 19, Tailwind v4 (CSS-first `@theme`), `framer-motion` 12.
- Non migrare framework né librerie di styling.
- Non introdurre nuove dipendenze senza necessità (priorità a SVG/CSS/framer).
- Non rompere funzionalità esistenti; testare dopo ogni cambiamento.
- Rispettare `prefers-reduced-motion` (pattern già presente nei MotionPrimitives).
- Tema "organic" verde firma `#3fae5a` come identità (vedi `globals.css`
  `.theme-organic` e scala `--energy-*`).

## Componenti esistenti da riutilizzare/potenziare

- `src/components/visualizations/BodyMap/` — `BodyMap`, `AnatomyFront`,
  `AnatomyBack` (heatmap muscolare statica, 3 modalità, scala `energy`).
- `src/components/visualizations/StreakHeatmap.tsx`, `GradientMesh.tsx`.
- `src/components/motion/MotionPrimitives.tsx` — FadeIn, Stagger(+Item),
  CardHover, PageTransition, ScrollReveal, ScrollStagger, SlideUp, RevealMask,
  MagneticHover, CountUp.
- `src/components/marketing/OrganicHeroVisual.tsx` — anello SVG animato.
- `canvas-confetti` (già in dipendenze) per milestone.
- `recharts` (già in dipendenze) per grafici complessi dove SVG a mano non basta.

## Architettura: libreria componenti `wow`

Nuova cartella `src/components/wow/`. Ogni componente: una responsabilità,
props tipizzate, tema-aware, reduced-motion-safe, testabile in isolamento.

### 1. `AdaptiveBodyMap`
- Evoluzione di `BodyMap`: stesse 3 modalità (`volume` | `recovery` |
  `balance`) e stesse props dati, **retro-compatibile**.
- Aggiunge: transizioni di colore animate sui muscoli (`framer-motion` su
  `fill`/opacity), pulse + ring di evidenziazione sui punti carenti,
  transizione fluida al cambio modalità/vista.
- Dipende da: `AnatomyFront`/`AnatomyBack` (riuso), scala `--energy-*`.

### 2. `ExerciseFormPlayer`
- Figura stilizzata SVG (niente volti) che esegue 1 ripetizione in loop.
- Archetipi per pattern di movimento: `squat`, `hinge`, `push`, `pull`
  (estendibile). Input: pattern + opzionale lista errori da evidenziare.
- Evidenziazione errore (es. valgo del ginocchio, schiena curva) con
  arco/segnale rosso + nota testuale.
- Dati: reali se l'analisi esiste (report analisi), altrimenti demo.

### 3. Primitive data-viz
- `AnimatedRing` (gauge ad anello con count-up + draw-on al view).
- `AnimatedArea` (area chart SVG con path draw-on).
- `AnimatedBars` (barre con stagger + count-up).
- `RadialGauge` (gauge radiale per macro/calorie).
- Estraggono il pattern già usato in `OrganicHeroVisual` e nello showcase
  landing, rendendolo riutilizzabile.

### 4. `ScrollExplainer`
- Sequenza scroll-driven "come funziona": scansiona → piano AI → allena →
  analizza → adatta. Step che si attivano allo scroll (scroll progress).

### 5. Micro-metriche
- `StatBadge` / `LiveMetric` — card metrica compatta con `CountUp` + sparkline.

## Estensione del sistema motion

Aggiunte a `MotionPrimitives.tsx` (stesso file/pattern, niente nuove dipendenze):
- `ParallaxLayer` — depth allo scroll (transform su `y`).
- `StaggerGrid` — griglia con entrata stagger e overlap.
- `DrawPath` — path SVG che si disegna (stroke-dashoffset animato).
- `ScrollProgress` — helper di avanzamento per gli explainer.

Tutte rispettano `useReducedMotion` e usano `transform`/`opacity`
(GPU-friendly), mai `top/left/width/height`.

## Applicazione per pagina (fasi con checkpoint)

### Fase 1 — Fondamenta
Libreria `src/components/wow/` + estensioni `MotionPrimitives`. Nessuna pagina
ancora modificata; componenti verificabili in isolamento.

### Fase 2 — Landing (`/`)
- Hero: `ScrollExplainer` del funzionamento app.
- `AdaptiveBodyMap` interattiva al posto/accanto alla card statica.
- Sezione pilastri: rompere la griglia 3-card simmetrica con depth/overlap.
- Showcase dati: grafici animati (`AnimatedArea`/`AnimatedBars`).
- Prezzi: enfasi sul tier raccomandato con colore, non solo altezza.

### Fase 3 — Dashboard (`(app)/dashboard`)
- Heatmap viva (`AdaptiveBodyMap`).
- Anelli/gauge animati per gli obiettivi (`AnimatedRing`/`RadialGauge`).
- `LiveMetric` con sparkline.
- Stati vuoti curati ("getting started").

### Fase 4 — Allenamento / Progressi / Analisi
- `ExerciseFormPlayer` nella sessione di allenamento e nel report analisi.
- Grafici progressi cinematici: carichi nel tempo, curva forza 1RM, volume
  per muscolo.
- Milestone record personali con `canvas-confetti`.

### Fase 5 — Marketing restante + Auth/Onboarding
- `funzionalita`, `come-funziona`, `prezzi`, `chi-siamo`, `faq`: stessi
  pattern, micro-animazioni, rompere layout generici.
- Onboarding (step 1–4): progress visivo, anteprime, transizioni.

## Grafiche extra in scope (confermate)

Tutte le seguenti, da distribuire nelle fasi pertinenti:
- Silhouette "ghost" progressi (confronto prima/dopo).
- Gauge radiale macro/calorie (pagina nutrizione).
- Timeline record personali con milestone.
- Curva di forza 1RM.
- "Recovery cooldown" per muscolo.
- River/heatmap costanza (potenziamento di `StreakHeatmap`).
- Animazione "thinking" dell'AI coach.
- Metronomo tempo-esecuzione nell'allenamento.

## Accessibilità e performance

- `prefers-reduced-motion`: ogni animazione ha fallback statico.
- Focus ring visibili, navigazione da tastiera preservata.
- Animazioni su `transform`/`opacity`; `min-height: 100dvh` dove serve full-screen.
- SVG con `role`/`title`/`desc` o `aria-hidden` dove decorativo.
- `alt` significativi sulle immagini.

## Testing

- Unit (`vitest`): logica dei componenti wow (mappatura dati→colore/heat,
  selezione archetipo movimento, calcolo progress) testata in isolamento.
- E2E (`playwright`): smoke per pagina ridisegnata — la pagina renderizza,
  niente errori console, elementi chiave presenti, reduced-motion rispettato.
- Verifica visiva via preview tool dopo ogni fase.

## Struttura file (nuova)

```
src/components/wow/
  AdaptiveBodyMap.tsx
  ExerciseFormPlayer.tsx
  charts/AnimatedRing.tsx
  charts/AnimatedArea.tsx
  charts/AnimatedBars.tsx
  charts/RadialGauge.tsx
  ScrollExplainer.tsx
  StatBadge.tsx
  LiveMetric.tsx
```
Estensioni in `src/components/motion/MotionPrimitives.tsx`.

## Non-goals (esplicito)

- Nessuna migrazione di framework/styling.
- Nessun asset raster/Lottie/video/3D in questa iterazione.
- Nessun refactoring non correlato al redesign.
