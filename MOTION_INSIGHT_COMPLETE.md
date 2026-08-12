Motion Insight

App Fitness AI-Driven con Analisi Video della Tecnica

Documentazione Completa --- Stato Produzione

Branch: main \| M0--M12 Completate \| Typecheck: 0 errori \| Test: 54/54
verdi

Indice dei Contenuti

1\. Overview del Progetto

2\. Architettura Analisi v2

3\. Stato Attuale (13 Luglio 2026)

4\. Roadmap Esecutiva

5\. Stack Tecnologico

1\. Overview del Progetto

Stato Attuale

✅ Produzione ready. M0--M12 chiuse, typecheck 0 errori, 54/54 test
verdi.

Feature Principali

Piani AI: generazione streaming con Claude + template professionisti

Analisi v2 tripartita: biomeccanica 50% + vision AI 30% + confronto PT
20%

Tracking: sessioni, streak, achievement, progressi, mappa corporea

Admin hub: utenti, abbonamenti, statistiche, audit log

Pagamenti Stripe: free/premium + gating

PWA: installabile da browser

Sentry reale: osservabilità produzione

Milestone Completate

M0: Setup infra

M1--M5: Flussi core (auth, onboarding, piani, analisi v1)

M6--M8: Analisi v2 completa + daily mission

M9: Admin video PT upload

M10: Admin hub completo

M11: Visual layer (StreakHeatmap, BodyMap, GradientMesh)

M12: Production confidence (Vitest 54 test, Sentry, CI)

Redesign \"wow\": tema organico + libreria wow

2\. Architettura Analisi v2

Flusso Utente

Utente apre sessione → vede lista esercizi

Click esercizio → mostra video PT + descrizione

Click \"Inizia\" → camera attivata

Countdown 15s (preparazione)

Registrazione 15-25s video

Upload video → Supabase Storage

Analisi parallela L1/L2/L3: \~120s totali

Report finale con score 0--100

I Tre Livelli (L1/L2/L3)

L1 --- Biomeccanica (50%, \<5s)

MediaPipe traccia 33 punti → angoli 3D → confronta con
ExerciseBiomechanicalSpec

L2 --- Vision AI (30%, \~30s)

8 frame dell\'utente → Claude Sonnet vision → valutazione qualitativa

L3 --- Confronto PT (20%, \~60s)

Frame utente vs video PT di riferimento → Claude vision multi-image

Schema Dati v2

Exercise:

recordingDurationSeconds --- durata target

videoUrl --- VIDEO\_RIF\_1 (video PT professionale)

biomechanicalSpec --- relazione a ExerciseBiomechanicalSpec

ExerciseBiomechanicalSpec:

movements\[\] --- per articolazione

phases\[\] --- per fase movimento

triggers\[\] --- condizioni + severity + feedback

AnalysisSession:

videoUrl --- video utente caricato

l1Result, l2Result, l3Result --- Json output

finalReport --- report sintetizzato da Claude

combinedScore --- score finale 0--100

3\. Stato Attuale (13 Luglio 2026)

Metriche di Qualità

✅ Typecheck: 0 errori

✅ Unit Test (Vitest): 54/54 verdi

✅ E2E (Playwright): 16 file spec

✅ Branch main: canonico

Restyling Motion Insight (In Corso)

✅ Fase 1--3: Bug React, landing, home

🟡 Fase 4--5: Onboarding, area utente 5 tab

✅ Fase 6: PWA (manifest, icone)

4\. Roadmap Esecutiva

Task Prioritari

🔴 Alta: Deploy Vercel (setup + env)

🔴 Alta: Test E2E Completa

🟡 Media: Merge feat/restyling-motion-insight → main

🟡 Media: Error UX Globale

🟡 Media: Community Feed UI/API

🟡 Media: Grafici Progressi Avanzati

🟡 Media: PT Reference Biomeccanico

🟡 Media: CORS Exercise-Videos

Prossimi Step

1\. Merge feat/restyling-motion-insight → main

2\. Setup Vercel + env

3\. Deploy produzione

4\. Rieseguire E2E suite

5\. Feedback utenti reali

6\. Iterare su feature

5\. Stack Tecnologico

Framework & Runtime

Next.js 16.2.4 --- App Router

TypeScript 5

Tailwind CSS 4

Middleware: src/proxy.ts

Backend & DB

Prisma 7.8 + \@prisma/adapter-pg

PostgreSQL (Supabase eu-west-3)

Client in src/generated/prisma/

Auth & AI & Vision

NextAuth v5 --- Credentials + Google OAuth

Upstash Redis --- rate limiting

Claude SDK --- Sonnet 4.6, Haiku 4.5

MediaPipe Pose Landmarker --- 33 keypoint

Frontend & State

Zustand 5 --- store

React Query 5

React Hook Form + Zod

Radix UI, Lucide, Framer Motion, Recharts

Storage, Pagamenti & Osservabilità

Supabase Storage --- video utente & PT

Web Push --- PWA notifications

Stripe --- free/premium + webhook

Sentry --- osservabilità (DSN-gated)

Test & CI/CD & Deployment

Vitest --- 54 unit test

Playwright --- E2E 16 file spec

GitHub Actions --- CI

Vercel --- deployment

Convenzioni Tecniche Chiave

restSeconds / durationSeconds (Prisma)

FitnessGoal enum

Achievement: key / points

Auth: session?.user?.id as string

Middleware: src/proxy.ts (NON middleware.ts)

Fine Documento
