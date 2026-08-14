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

## ▶️ PARTI DA QUI (prossima sessione) `[agg. 2026-08-14 sera]`

- Tutto il lavoro **feature #4/#5/#6 (a–e) + sezione Utenti (economia)** è **FATTO, verificato**. Working
  tree ha anche il porting completo landing/satellite/area-utente/admin + tema scuro (Sessioni 5-6),
  **non ancora committato**. Tutto su branch **`feature/account-manager-completo`**, non ancora in `main`.
- **Design ufficiale = anteprima scura/lime** (decisione utente 14/08). Codice **interamente allineato**:
  tema scuro su tutto il sito · home + 5 pagine satellite (Il Metodo, Per Chi, FAQ, Prezzi, Chi siamo) ·
  **area utente (7 schermate) + admin (2 schermate mockate) verificate contro il mockup reale** — trovati e
  colmati 2 gap (Dashboard "Alimentazione di oggi", Profilo "I tuoi video registrati" + fix schema
  `AnalysisSession.videoPath`). ✅ **FATTO (2026-08-14).**
- ⚠️ **Da verificare con sessione reale (non fatto in autonomia, serve login):** che `/api/me/videos` e la
  nuova card Profilo funzionino end-to-end con dati reali (upload → elimina video → report resta); che la
  card "Alimentazione di oggi" in Dashboard mostri numeri corretti con un utente che logga pasti.
- **Primo passo:** integrare il branch (PR o merge) → vedi step **1**.
- Poi: sistemare le **2 dipendenze esterne** (credito Anthropic, Upstash Redis) → step **2–3**.
- Lavoro di sostanza successivo: pagine `funzionalita`/`storie`/`risorse` da allineare, placeholder da
  compilare, **deploy** (step 6).

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

5. **Landing / marketing** — home page portata a v2 il **2026-08-14** (`src/app/page.tsx` + `copy.landing`
   riscritti da `Motion-Insight-anteprima v2.html`; tema scuro/lime applicato a tutto il sito via
   `globals.css` `.theme-organic`). Sotto-step 5c ✅ FATTO (2026-08-14: "Da dove vuoi partire" ridotto a 4 voci,
   gravidanza/corro tolte). Residuo:
   - 5a. CTA "analizza la tua tecnica" con **prova analisi gratuita** via inserimento mail — non ancora fatto.
   - 5d. **Prezzi**: la landing ora linka `/prezzi` per il dettaglio; verificare che la pagina `/prezzi` abbia
     la tabella comparativa competitor (dati `[DATI da verificare]` da confermare prima del lancio).
   - 5e. **FAQ**: link "Tutte le domande frequenti →" già in landing; verificare che `/faq` sia completa.
   - 5f. Pagina **"Il metodo"** (`/come-funziona`): non ancora riallineata a v2 (rimane la vecchia versione
     "correzione in tempo reale/33 punti"); la landing ora la linka come "Guarda il metodo nel dettaglio →" —
     va aggiornata per coerenza con la nuova narrativa "registra e ricevi un'analisi".
   - 5g. **Risorse**: ampliare a 360° (non solo allenamento), da validare col cofondatore.
   - ✅ **FATTO (2026-08-14):** pagine satellite `come-funziona` (Il Metodo), `per-chi`, `faq`, `prezzi`,
     `chi-siamo` riallineate a `MOTION_INSIGHT_COPY_FINALE.md`. Verificato tsc/eslint + lettura dev server.
   - **Ancora aperto:** `funzionalita` e `storie` non toccate (non coperte da COPY_FINALE — da decidere se
     tenerle, fonderle o eliminarle). `risorse`: struttura/categorie pronte in COPY_FINALE ma i testi degli
     articoli non sono scritti (i temi salute/infortuni richiedono validazione del cofondatore prima di
     pubblicare — non generabili in autonomia).
   - **Placeholder da compilare (NON inventare):** citazione cofondatore in home, 4 blocchi "Chi siamo",
     7 risposte FAQ, P.IVA nel footer, verifica prezzi competitor `[DATI da verificare]` (home + prezzi),
     dati tecnici privacy in "Il Metodo" (storage/conservazione/cancellazione), pagina "per le aziende"
     (oggi non esiste: CTA in Prezzi disattivata).
   `[agg. 2026-08-14]`

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
