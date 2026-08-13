# Cose da fare — next step

> **A cosa serve:** elenco dei prossimi passi per la sessione successiva. Va **letto a inizio sessione**
> (per decidere cosa fare) e **aggiornato a fine sessione** (spunta ciò che è stato chiuso, aggiungi il
> nuovo emerso). È la coppia di [[COSE_FATTE_IN_SESSIONE]] (`COSE_FATTE_IN_SESSIONE.md`).
>
> **Convenzioni:**
> - Gli step aperti stanno in **"🔜 Da fare (in sequenza)"**, numerati e datati (`[agg. YYYY-MM-DD]`).
> - Quando uno step è completato: **non cancellarlo**, spostalo in **"✅ Fatto (storico)"** in fondo.
> - Fonte di dettaglio sui residui: `MOTION_INSIGHT_PROSSIMI_STEP.md`.

---

## ▶️ PARTI DA QUI (prossima sessione) `[agg. 2026-08-13]`

- Tutto il lavoro **feature #4/#5/#6 (a–e) + sezione Utenti (economia)** è **FATTO, verificato, committato
  e pushato** sul branch **`feature/account-manager-completo`** (2 commit: `feat` codice + `docs` diari).
  **Su `main` NON è ancora integrato.**
- **Primo passo:** integrare il branch (PR o merge) → vedi step **1**.
- Poi: sistemare le **2 dipendenze esterne** (credito Anthropic, Upstash Redis) per poter verificare le
  feature AI → step **2–3**.
- Lavoro di sostanza successivo: **landing (step 5)** e **deploy (step 6)**.

---

## 🔜 Da fare (in sequenza)

1. **Integrare il branch `feature/account-manager-completo`** (già pushato su origin).
   Aprire la PR — <https://github.com/Masterteam99/FitAI/pull/new/feature/account-manager-completo> —
   oppure `git checkout main && git merge feature/account-manager-completo`. `[agg. 2026-08-13]`

2. **Ripristinare le dipendenze esterne** (sbloccano la *verifica* delle feature AI; il codice è già pronto):
   - **Credito Anthropic**: ricaricare dalla console (Plans & Billing). Senza, tutte le feature AI
     rispondono `credit balance`.
   - **Upstash Redis**: ripristinare l'istanza o aggiornare `UPSTASH_REDIS_REST_URL/TOKEN` in `.env.local`
     (host `quiet-gazelle-99660.upstash.io` non risolve → rate-limit degradato a fail-open, l'app funziona).
   - *Nota infra:* il pooler diretto Supabase `5432` è instabile per la CLI Prisma → workaround usato:
     applicare gli ALTER via pooler `6543`. `[agg. 2026-08-13]`

3. **Verificare l'output reale delle feature AI** (dopo aver ricaricato il credito allo step 2):
   analisi documenti (`/api/documents/[id]/analyze`), ricette/piani AI (`/api/ai/recipes`,
   `/api/ai/generate-plan`, `/api/ai/generate-nutrition-plan`). L'impianto è già testato fino alla chiamata. `[agg. 2026-08-13]`

4. **Verifica manuale "analisi avanzata" (sessione)** — registrazione video + MediaPipe pose + L1/L2/L3 +
   report. Richiede webcam/video reali (non automatizzabile). La pagina `/analisi` renderizza già. `[agg. 2026-08-13]`

5. **Landing / marketing** (da `Aggiornameni possibili.md`; ora modificabile anche dal pannello
   **SiteContent** `/admin/site-content` senza deploy):
   - 5a. CTA "analizza la tua tecnica" con **prova analisi gratuita** via inserimento mail.
   - 5b. Sezione **"in 3 passi"**: "registri"→"registra", aggiungere webcam/mocap visivi.
   - 5c. Ridurre "Da dove vuoi partire" a **4 voci** (casa, palestra, stop/infortunio, over 50);
     togliere gravidanza/running da "Per chi".
   - 5d. **Prezzi**: tabella comparativa competitor + funzionalità.
   - 5e. **FAQ** in sezione dedicata (fuori dalla landing) e ampliarle.
   - 5f. Pagina **"Il metodo"**: togliere elenco 53 esercizi; rafforzare **privacy video**; fondere gli
     spunti di "Cosa fa" e valutare l'eliminazione della pagina.
   - 5g. **Risorse**: ampliare a 360° (non solo allenamento), da validare col cofondatore.
   `[agg. 2026-08-12]`

6. **Deploy**:
   - 6a. **Deploy Vercel** (account + env vars) — vedi `CHECKLIST_DEPLOY.md`.
   - 6b. **CORS bucket `exercise-videos`** su Supabase per attivare L3 in modo affidabile.
   `[agg. 2026-08-12]`

7. **(Progressivo) Migrare le altre pagine a `useCopy()`** — così tutti i copy del sito diventano editabili
   dal pannello SiteContent senza deploy (oggi è cablata solo la pagina Prezzi come prova). `[agg. 2026-08-13]`

---

## ✅ Fatto (storico, per riferimento)

**Sessione 4 (2026-08-13)** — dettaglio in `COSE_FATTE_IN_SESSIONE.md`:
- ✅ **#4** Analisi AI documenti (`/api/documents/[id]/analyze`, UI profilo, campi `UserDocument.analysisJson/analyzedAt`) + rate-limiter fail-open.
- ✅ **#5** Progressi — trend carichi (`/api/me/load-trends` + `LoadTrendsCard`).
- ✅ **#6a** Modifica esercizio · **#6b** Modifica pool nutrizionale · **#6c** Pool allenamenti (CRUD template) · **#6d** SiteContent (copy editabili) · **#6e** Pool ricette curate (fallback AI).
- ✅ **Sezione Utenti** con economia costo-AI vs ricavo/margine (per utente + piattaforma).
- ✅ Nuovi modelli additivi applicati al DB: `SiteContent`, `Recipe`, `UserDocument.analysisJson/analyzedAt`.
- ✅ Account Manager verificato end-to-end (via utente QA promosso admin, poi eliminato).
- ✅ Lavoro committato (2 commit) e **pushato** sul branch `feature/account-manager-completo`.

**Sessione 3 (2026-08-13):**
- ✅ Schema v2 applicato al DB (`prisma db push`, additivo, nessuna perdita dati).
- ✅ Bucket `user-documents` creato (privato, 10MB, pdf/jpeg/png/webp) — verificato upload+signed URL.
- ✅ Verifica funzionale loggata dei flussi v2 (quiz, documenti→bucket, revision, community, nutrition, 7 pagine, guard admin).

**Sessione 2 (2026-08-12):**
- ✅ Commit + push del lavoro Area Utente v2 / Account Manager / Motore.
- ✅ Allineamento e pulizia documentazione (stato reale, numeri, flussi §21).
- ✅ Pagina "Chi siamo" — già esistente e completa.
