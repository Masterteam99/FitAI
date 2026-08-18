> ## ⚠️ STATO REALE — aggiornato 2026-08-18 (Sessione 10)
> **Fonte autorevole dello stato di avanzamento: i due diari `COSE_FATTE_IN_SESSIONE.md` + `COSE_DA_FARE.md`.** In caso di conflitto con questo documento, **valgono i diari** (qui sotto possono esserci sezioni storiche o superate).
>
> **Snapshot codice (18 ago 2026):** la Sessione 10 completa la prova gratuita (campo nome, scelta "Registra ora" o
> "Carica un video" oltre alla sola registrazione live, 6 esercizi di default attivati); l'**editor
> design è stato spostato dentro Admin** (`/admin/site-content` → Editor visuale: anteprima iframe con
> `?siteEditor=1`, non più sovrapposto alle pagine pubbliche) con cronologia Annulla/Ripeti, reset per
> campo e un **assistente IA integrato** (linguaggio naturale → modifica applicata, riusa
> l'infrastruttura Claude già usata dall'AI Coach); Libreria rinominata "Libreria esercizi" con filtri
> principali+"Altri filtri", bottone "Termina esercizio", vista di registrazione a schermo intero con
> video PT in un riquadro (PIP, desktop); corretto il bottone "Installa ora" della PWA (spariva su
> iOS/al primo caricamento). Nuovo modello DB `SiteStyleOverride`; `X-Frame-Options` cambiato da `DENY`
> a `SAMEORIGIN` per l'iframe dell'editor. Dettaglio: `COSE_FATTE_IN_SESSIONE.md` (Sessione 10).
> **Aperti:** sezione Prezzi (tabelle/struttura + nuova analisi costo AI per utilizzo intensivo, in
> attesa risposte dell'utente) · riordino blocchi nell'editor design · asset 3D per il personaggio
> animato da procurare · estendere l'editor design alle altre pagine (oggi solo Prezzi) · env var VAPID
> su Vercel da confermare · credito Anthropic da ricaricare (rimandato all'ultimo, scelta dell'utente)
> · resto invariato, vedi `COSE_DA_FARE.md`.

---

# Motion Insight (repo: FitAI)

> **Nota sul nome**: il prodotto è stato rinominato **Motion Insight**. Il rebrand/restyling è ora **confluito in `main`** (commit `af8fdac`); il naming storico *FitAI* resta solo nel nome del repo (`Masterteam99/FitAI`), nel package e in alcune stringhe interne. Sopra al restyling è stata costruita l'**Area Utente v2** + **Account Manager** (vedi `STATO_PROGETTO.md` → "Aggiornamento 12 ago 2026").

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
- **Area Utente v2** (7 sezioni, web + PWA): sessione con analisi avanzata on/off, piano nutrizionale con target personalizzati e ricette AI, libreria filtrabile per tag, progressi (Form Score + peso/misure), community (post/like/commenti), profilo con upload documenti
- **Account Manager**: quiz onboarding editabile, coda revisioni, pool piani nutrizionali, editor tag/nuovo esercizio (modifiche che si applicano a tutti gli utenti)

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
prisma/                schema (37 modelli), migrazioni, seed (53 esercizi con spec biomeccaniche)
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
npm run test:unit        # Vitest — 60 test
npm run test:e2e         # Playwright (gira contro la build di produzione)
npm run lint             # ESLint
npm run seed             # popola esercizi, achievement, template
npm run generate:icons   # rigenera le icone PWA da public/icon.svg
```

CI (GitHub Actions): typecheck + lint + unit a ogni push; E2E con Postgres su build di produzione.

## Stato del progetto

**Su `main`** (verificato 12 ago 2026): 55 pagine, 64 route API, 37 modelli Prisma, **60/60 unit test verdi** (11 file), typecheck pulito. Milestone M0–M12 chiuse (admin hub, visual layer, CI, Sentry inclusi) + redesign "wow" + **Area Utente v2 / Account Manager / Motore**.

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
