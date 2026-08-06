# Motion Insight (repo: FitAI)

> **Nota sul nome**: il prodotto è stato rinominato **Motion Insight**. Il codice su `main` usa ancora il naming storico *FitAI* in alcune stringhe e nel nome del pacchetto: il rebrand completo vive sul branch `feat/restyling-motion-insight` (vedi [Stato del progetto](#stato-del-progetto)).

App fitness AI-driven: genera piani di allenamento e nutrizione personalizzati con Claude e **analizza l'esecuzione tecnica degli esercizi dal video**, restituendo un punteggio di forma 0–100 con le correzioni.

## Cosa fa

**Analisi della tecnica ("Analisi v2")** — l'utente registra ~20s di esercizio con la fotocamera; il punteggio combina tre livelli (pesi in `src/services/analysis/weights.ts`):

| Livello | Cosa fa | Peso |
|---|---|---|
| **L1 — biomeccanica** | Locale, senza AI: MediaPipe traccia 33 punti del corpo, si calcolano gli angoli articolari 3D e si confrontano con le soglie per fase del movimento (`ExerciseBiomechanicalSpec → Movement → Phase → Trigger`) | **50%** |
| **L2 — vision AI** | 8 frame dell'utente valutati da Claude | **30%** |
| **L3 — confronto col PT** | Frame dell'utente vs frame del video di riferimento del personal trainer | **20%** |

Senza video PT il peso di L3 viene ridistribuito su L1/L2 (62,5% / 37,5%). Un **report finale** generato da Claude sintetizza giudizio, miglioramenti prioritari e alert sul rischio infortuni.

Oltre all'analisi:
- **Piani AI** di allenamento e nutrizione (streaming, few-shot su template), rigenerabili e adattivi
- **Tracking**: sessioni, carichi, streak, achievement, progressi, mappa corporea degli squilibri
- **Admin hub**: utenti, abbonamenti, statistiche, gestione admin, uso/costo AI, audit log, upload dei video PT

## Stack

| Layer | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router; `src/proxy.ts` sostituisce `middleware.ts`) |
| Auth | NextAuth v5 (JWT) — credenziali + Google |
| DB / ORM | PostgreSQL (Supabase) + Prisma 7 con driver adapter `@prisma/adapter-pg`; client generato in `src/generated/prisma` |
| Storage | Supabase Storage (video utente, video PT) |
| Cache / rate limit | Upstash Redis |
| AI | Anthropic Claude (Sonnet per piani e vision, Haiku per la sintesi) |
| Pose detection | `@mediapipe/tasks-vision` (BlazePose, 33 keypoint) — gira nel browser |
| UI | Tailwind CSS + Radix (shadcn/ui) + Lucide + framer-motion + Recharts |
| Pagamenti | Stripe (free/premium, checkout, portale, webhook) |
| Osservabilità | Sentry (attivo solo con DSN) |
| Test | Vitest (unit) + Playwright (E2E) |

## Struttura

```
src/app/(marketing)/   pagine pubbliche (come funziona, funzionalità, prezzi, per chi, faq, chi siamo)
src/app/(auth)/        login, registrazione, recupero password, onboarding a step
src/app/(app)/         area autenticata: dashboard, allenamento, analisi, nutrizione,
                       progressi, profilo, esercizi, ai-coach, community, abbonamento, admin
src/app/api/           49 route REST
src/components/        ui/, marketing/, dashboard/, analisi/, wow/ (visualizzazioni animate)
src/services/          biomechanical/ (angoli, fasi, valutazione spec), ai/, analysis/
src/content/copy.ts    fonte unica di TUTTI i testi dell'interfaccia
prisma/                schema (33 modelli), migrazioni, seed (53 esercizi con spec biomeccaniche)
tests/e2e/             16 file di test Playwright
```

## Setup

Prerequisiti: Node 20+, un database PostgreSQL, le chiavi dei servizi (vedi `.env.example`).

```bash
npm install
cp .env.example .env.local      # compilare le variabili
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev                     # http://localhost:3000
```

Variabili minime: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_*` + `SUPABASE_SERVICE_ROLE_KEY`. Le altre (Stripe, Upstash, Resend, Sentry) abilitano funzionalità opzionali: le route sono resilienti alla loro assenza.

## Comandi

```bash
npm run dev              # sviluppo
npm run build            # build di produzione
npm run test:unit        # Vitest — 54 test
npm run test:e2e         # Playwright (gira contro la build di produzione)
npm run lint             # ESLint
npm run seed             # popola esercizi, achievement, template
npm run generate:icons   # rigenera le icone PWA da public/icon.svg
```

CI (GitHub Actions): typecheck + lint + unit a ogni push; E2E con Postgres su build di produzione.

## Stato del progetto

**Su `main`**: 42 pagine, 49 route API, 33 modelli Prisma, **54/54 unit test verdi**, typecheck pulito. Milestone M0–M12 chiuse (admin hub, visual layer, CI, Sentry inclusi) più il redesign visivo interno.

**Branch non ancora mergiati:**
- `feat/restyling-motion-insight` — rebrand **Motion Insight** e restyling completo: palette navy/coral, landing multi-pagina (Home a 9 sezioni, Storie, Risorse/blog, Scarica), quiz pubblico prima della registrazione, area utente a 5 tab, PWA rebrandizzata.
- `feat/pt-reference-biomeccanico` — profilo biomeccanico di riferimento estratto **una sola volta** dal video del PT e riusato per un confronto numerico deterministico in L3 (migrazione già applicata al DB).

**Non ancora in produzione**: il deploy su Vercel resta un'azione manuale (`CHECKLIST_DEPLOY.md`).

## Documentazione

| File | Contenuto |
|---|---|
| **[DOCUMENTAZIONE_FLUSSI.md](./DOCUMENTAZIONE_FLUSSI.md)** | **Punto di ingresso**: mappa completa di ogni schermata e flusso, con i path dei sorgenti |
| [ANALYSIS_SPEC.md](./ANALYSIS_SPEC.md) | Spec autoritativa dell'analisi a tre livelli |
| [STATO_PROGETTO.md](./STATO_PROGETTO.md) | Stato per milestone e storico delle sessioni |
| [ROADMAP.md](./ROADMAP.md) | Tracking esecutivo delle task |
| [CHECKLIST_DEPLOY.md](./CHECKLIST_DEPLOY.md) | Passi per il deploy |
| [AGENTS.md](./AGENTS.md) | Note operative per agenti AI che lavorano sul codice |
| [PROFESSIONALS_DATA_GUIDE.md](./PROFESSIONALS_DATA_GUIDE.md) | Guida per PT e nutrizionisti che inseriscono contenuti via CSV/Excel |
| [DATA_AUTHORING_GUIDE.md](./DATA_AUTHORING_GUIDE.md) | Guida tecnica per convertire i CSV in seed TypeScript |
| `docs/` | Spec e piani di design, revisioni dei trigger biomeccanici |

## Sicurezza e limiti

L'analisi è uno strumento di supporto all'allenamento: **non fornisce diagnosi né terapie**. In caso di dolore persistente o patologie, consultare un professionista sanitario. I feedback hanno tre livelli di severità (suggerimento / errore / allerta rischio infortunio): davanti a un'allerta, fermare l'esecuzione e correggere la postura.
