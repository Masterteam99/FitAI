# M12 — Production Confidence (hardening) — Design

**Data:** 2026-06-06
**Driver:** andare in produzione con la sicurezza che il cuore dell'app funzioni (testing del motore di analisi) e con visibilità sugli errori reali (Sentry) + una rete che blocca i push rotti (CI).
**Scope:** infrastruttura di qualità. Nessuna feature nuova lato utente. Unico cambiamento di comportamento visibile: la nuova ripartizione dei pesi dell'analisi (vedi Fase 2).

## Obiettivo

Oggi il progetto (M0–M11) è maturo ma ha tre buchi che rendono rischioso un go-live:

1. **Zero unit test.** Solo E2E Playwright (53 test), e i pezzi più delicati — il motore di analisi pose — sono *mockati*. La logica di scoring biomeccanica (~400 righe di funzioni pure) non è mai stata verificata da un test.
2. **Nessuna visibilità in produzione.** `src/lib/observability.ts` è uno stub: prova a caricare `@sentry/nextjs` ma il pacchetto non è installato, quindi gli errori utente sono invisibili (solo fallback console).
3. **Nessuna CI.** `.github/workflows/` assente. Ogni push è "a fiducia": niente blocca un commit che rompe build, typecheck o test.

La milestone chiude tutti e tre i buchi in 4 fasi indipendenti e committabili.

## Architettura: la piramide dei test

```
        E2E (Playwright)          <- 53 test esistenti, NON toccati
        integrazione, browser
   ----------------------------
        Unit (Vitest) — NUOVO     <- il livello mancante
        L1 puro + L2/L3 orchestr.
```

Due runner separati che non si pestano:
- **Vitest** — unit test, millisecondi, niente browser/DB/AI. File `*.test.ts` accanto al codice in `src/`.
- **Playwright** — E2E in `tests/e2e/`, invariati.

## Confini (cosa NON facciamo)

- Non tocchiamo gli E2E esistenti.
- Non rifattorizziamo il motore di analisi oltre l'estrazione dei pesi (solo fix mirati se i test scoprono bug veri).
- Niente deploy automatico: la CI **verifica**, non pubblica. Il deploy Vercel resta manuale.
- Sentry non deve rallentare la dev experience: sorgenti attive solo con `SENTRY_DSN` presente.

---

## Fase 1 — Infra Vitest

- Installa `vitest` + `@vitest/coverage-v8` (devDep).
- `vitest.config.ts`: ambiente `node`, alias `@/` allineato a `tsconfig.json`, `include: ['src/**/*.test.ts']` (esclude per costruzione `tests/e2e/`).
- Script `package.json`: `test:unit`, `test:unit:watch`, `test:unit:coverage`.
- Test segnaposto su `angleCalculator` per validare la pipeline (verde).

**Done quando:** `npm run test:unit` gira verde e non raccoglie i file Playwright.

---

## Fase 2 — Copertura del cuore + nuova ripartizione pesi

### 2a. Refactor abilitante: pesi in una costante unica

**Problema attuale:** i pesi `0.34 / 0.33 / 0.33` sono duplicati come magic number in due punti (`src/services/ai/finalReportGenerator.ts` e il fallback in `src/app/api/analysis/complete/route.ts`) e ripetuti come testo nel prompt (`buildFinalReportPrompt`). Possono divergere.

Inoltre la gestione L3-assente è poco onesta: in `complete/route.ts`, se `l3.score === -1` (sentinel, nessun video PT) il codice imposta `l3 = media(l1, l2)` e poi la pesa come un terzo. Diluisce verso la media.

**Soluzione:** nuovo modulo `src/services/analysis/weights.ts`:

```ts
export const ANALYSIS_WEIGHTS = {
  withProVideo: { l1: 0.50, l2: 0.30, l3: 0.20 },
  withoutProVideo: { l1: 0.625, l2: 0.375 }, // L3 ridistribuito in proporzione
} as const;

export function computeCombinedScore(
  l1Score: number,
  l2Score: number,
  l3Score: number,
  opts: { hasProVideo: boolean }
): number;
```

- `hasProVideo = true`  → `round(l1*0.50 + l2*0.30 + l3*0.20)`
- `hasProVideo = false` → `round(l1*0.625 + l2*0.375)` (L3 ignorato, niente fake-average)

`finalReportGenerator.ts` e `complete/route.ts` chiamano questa funzione invece dei magic number. Le stringhe del prompt leggono i pesi dalla costante (percentuali derivate), così non possono più divergere dal calcolo.

**Razionale della ripartizione 50/30/20:**
- **L1 (0.50) = verità oggettiva.** Angoli articolari reali vs soglie dell'esercizio. Deterministico, riproducibile, non allucina. Merita la quota maggioritaria.
- **L2 (0.30) = interpretazione AI della forma utente.** Strato qualitativo prezioso (coglie instabilità che gli angoli non vedono) ma soggettivo.
- **L3 (0.20) = confronto col PT.** Segnale più rumoroso e spesso assente → peso minore.
- Non oltre 0.50 su L1 per non rendere L2/L3 vestigiali. L'override qualitativo di L2 sulla narrativa resta garantito dalle regole del prompt.

### 2b. Test L1 — biomeccanica pura (deterministici)

- **`angleCalculator`**: angoli noti (90°, 180°, collineari), divisione per zero, keypoint mancanti.
- **`phaseDetector`**: sequenze di frame sintetiche → fasi rilevate corrette (CONCENTRIC/ECCENTRIC/TOP/BOTTOM) e `findRepresentativeFrames`.
- **`specEvaluator`** (il vero scoring): rep pulita → score alto, nessun trigger; angolo fuori soglia → trigger giusto con `severity` corretta; flag `injuryRisk`; edge case frame vuoti.

### 2c. Test scoring combinato

- **`computeCombinedScore`**: 50/30/20 con PT; 62.5/37.5 senza PT; arrotondamento; gestione sentinel `-1` via ridistribuzione (non più fake-average).

### 2d. Test L2/L3 — orchestrazione AI (Anthropic mockato)

- `vi.mock('@/lib/anthropic')` → risposte JSON finte. **Zero token, zero rete.**
- Verifica: parsing corretto; fallback quando il JSON è malformato; `analyzeUserVideoVision` / `compareVideoVision` mappano i campi; `generateFinalReport` rispetta i pesi e l'override del `combinedScore`.

**Attesa:** è probabile che `specEvaluator` o la gestione sentinel nascondano 1-2 bug latenti. Se emergono, fix mirato come parte della fase.

**Done quando:** unit test verdi su L1, scoring combinato e orchestrazione L2/L3; pesi nuovi attivi e coperti dai test.

---

## Fase 3 — Sentry reale

- Installa `@sentry/nextjs` (dipendenza vera).
- Configurazione **ufficiale Next 16**: leggere prima `node_modules/next/dist/docs/` e i doc Sentry. Next 16 usa `instrumentation.ts` / `instrumentation-client.ts` + wrapping del config, non i vecchi `sentry.*.config.js`.
- Il wrapper `src/lib/observability.ts` resta l'API dell'app (`captureError/captureMessage/setUserContext`): i call site non cambiano. Si sostituisce l'hack del dynamic import con l'integrazione pulita.
- **Zero impatto in dev:** attivo solo con `SENTRY_DSN` presente; senza DSN, comportamento identico a oggi.
- Aggiorna `.env.example` e la sezione M3 di `CHECKLIST_DEPLOY.md` con i passi reali (creazione progetto Sentry, DSN).

**Done quando:** build pulita con Sentry installato; senza DSN l'app gira come prima; con DSN gli errori arrivano a Sentry.

---

## Fase 4 — CI GitHub Actions

`.github/workflows/ci.yml`, su ogni push e PR:

- **Job veloce (sempre, ~1 min, senza DB):** `tsc --noEmit` + `eslint` + `vitest run`. Gate che blocca subito i commit rotti.
- **Job E2E (con servizio Postgres):** container `postgres:16` come service; `prisma migrate deploy` + `prisma db seed`; `playwright test`. Le env AI non servono (i test mockano l'AI); le poche necessarie vanno nei GitHub Secrets.
- **Caching:** `node_modules` e browser Playwright.
- Retry e timeout generosi sugli E2E (coerente con la fragilità nota di Turbopack; in CI l'ambiente è pulito ogni volta, quindi il problema zombi non si pone).
- **Niente deploy.** La CI verifica, non pubblica.

**Done quando:** il workflow gira verde su un push di prova; un commit che rompe typecheck/unit/E2E viene bloccato.

---

## Sequenza di consegna

Ogni fase è un blocco di commit verde a sé:
1. Infra Vitest → 2. Cuore + pesi → 3. Sentry → 4. CI.

L'ordine mette per prime le fasi che danno valore anche da sole (test del cuore) e chiude con il guardrail (CI) che racchiude tutto il resto.

## Criteri di successo della milestone

- `npm run test:unit` verde, con copertura reale di L1, scoring combinato e orchestrazione L2/L3.
- Nuova ripartizione 50/30/20 (62.5/37.5 senza PT) attiva, definita in un solo punto, coperta da test.
- `@sentry/nextjs` installato e funzionante con DSN; nessun impatto in dev senza DSN.
- CI su GitHub che gira typecheck + lint + unit + E2E ad ogni push e blocca i commit rotti.
- Suite E2E esistente (53 test) ancora verde, invariata.
