# Cose da fare — next step

> **A cosa serve:** elenco dei prossimi passi per la sessione successiva. Va **letto a inizio sessione**
> (per decidere cosa fare) e **aggiornato a fine sessione** (spunta ciò che è stato chiuso, aggiungi il
> nuovo emerso). È la coppia di [[COSE_FATTE_IN_SESSIONE]] (`COSE_FATTE_IN_SESSIONE.md`).
>
> **Convenzioni:**
> - Ogni step è **numerato** e riporta la **data in cui è stato aggiunto** (`[agg. YYYY-MM-DD]`).
> - Quando uno step è completato: **non cancellarlo**, marcalo `✅ FATTO (YYYY-MM-DD)` e spostane la
>   descrizione dettagliata in `COSE_FATTE_IN_SESSIONE.md`.
> - Fonte di dettaglio sui residui: `MOTION_INSIGHT_PROSSIMI_STEP.md`.

---

## ▶️ PARTI DA QUI (prossima sessione) `[agg. 2026-08-13]`

- ✅ **#4, #5 e #6 (a–e) + sezione Utenti (economia)** sono **fatti e verificati** (tsc/ESLint puliti,
  verifiche funzionali via browser). Dettagli in `COSE_FATTE_IN_SESSIONE.md` §Sessione 4.
- ⚠️ **Il codice NON è committato** (≈23 file nuovi + 19 modificati nel working tree). Primo passo consigliato:
  **committare** il lavoro (eventualmente in commit logici per feature).
- 🔴 **Due dipendenze esterne bloccano solo la *verifica*, non il codice** (vedi #19–20):
  **credito Anthropic esaurito** (feature AI) e **Upstash Redis irraggiungibile** (rate-limit fail-open).
  Vanno sistemate dall'utente quando possibile.
- ➡️ **Prossimo lavoro naturale**: la **landing/marketing (#7–13)** — anche sfruttando il nuovo pannello
  `SiteContent` (#6d) per versare i copy senza deploy — e poi il **deploy Vercel (#14–15)**.

---

## 🔴 Bloccanti — infra runtime ✅ RISOLTI (2026-08-13)

1. ✅ **FATTO (2026-08-13)** — `npx prisma db push`: schema v2 applicato al DB Supabase (diff 100% additivo,
   nessuna perdita dati). Dettagli in `COSE_FATTE_IN_SESSIONE.md` §Sessione 3. `[agg. 2026-08-12]`
2. ✅ **FATTO (2026-08-13)** — bucket `user-documents` creato: privato, 10MB, MIME pdf/jpeg/png/webp.
   Verificato upload+signed URL end-to-end. `[agg. 2026-08-12]`
3. ✅ **FATTO parzialmente (2026-08-13)** — verifica funzionale loggata: onboarding quiz, documenti→bucket,
   revision, community post/like/commenti, nutrition match, 7 pagine v2, guard admin → tutti OK. **Residui
   sotto (16–18).** `[agg. 2026-08-12]`

## 🟠 Verifica residua (dalla Sessione 3, non testabile in autonomia)

16. **Analisi avanzata (sessione)** — verifica registrazione video + MediaPipe pose + L1/L2/L3 + report:
    richiede webcam/video reali. La pagina `/analisi` renderizza 200 ma il flusso completo è da provare a mano. `[agg. 2026-08-13]`
17. ✅ **FATTO (2026-08-13)** — Account Manager verificato: tutte le sezioni admin nuove (utenti+economia,
    modifica esercizio, pool nutrizionale edit, pool allenamenti, contenuti sito, ricette) testate via
    utente QA promosso admin (poi eliminato). Quiz/revisioni/tag già esistenti. `[agg. 2026-08-13]`
18. **Ricette AI / generazione piani AI** (`/api/ai/recipes`, `/api/ai/generate-plan`,
    `/api/ai/generate-nutrition-plan`) — impianto ok, output reale da provare quando c'è credito Anthropic (vedi #19). `[agg. 2026-08-13]`

## 🟡 Feature residue (codice) — ✅ TUTTE FATTE (2026-08-13, Sessione 4)

4. ✅ **FATTO (2026-08-13)** — Parsing/adattamento AI documenti: endpoint `/api/documents/[id]/analyze`
   (Claude legge PDF/immagine nativamente → analisi + aggiustamenti fitness/nutri), UI in profilo, campi
   `analysisJson/analyzedAt`. Impianto verificato end-to-end; **l'output AI reale resta da vedere quando
   c'è credito Anthropic** (vedi #19). Reso il rate-limiter fail-open. `[agg. 2026-08-12]`
5. ✅ **FATTO (2026-08-13)** — Progressi trend carichi: `/api/me/load-trends` + `LoadTrendsCard`.
   Verificato (render + query). `[agg. 2026-08-12]`
6. ✅ **FATTO (2026-08-13)** — Account Manager "completo":
   - 6a. ✅ Editor modifica esercizio (GET/PUT `[id]`, form riuso, replace spec biomeccanica). Verificato.
   - 6b. ✅ Modifica piano pool nutrizionale (GET/PUT `[id]`, GET tollerante a forme seed/admin). Verificato.
   - 6c. ✅ Template piani fitness CRUD (`WorkoutPlanTemplate`) — nuova sezione "Pool allenamenti". Verificato.
   - 6d. ✅ Modello `SiteContent` + editor `/admin/site-content` + `useCopy()` (copy editabili senza deploy).
     Pagina Prezzi cablata come prova. Verificato (override live → pagina). `[le altre pagine si migrano a `useCopy()` incrementalmente]`
   - 6e. ✅ Pool ricette curate (`Recipe`) + `/admin/recipes` + `/api/recipes` con fallback AI. Verificato (anche UI utente).
   `[agg. 2026-08-12]`
6bis. ✅ **FATTO (2026-08-13, richiesta esplicita)** — Sezione **Utenti con economia costo-AI vs ricavo/margine**
   per utente e piattaforma (MRR, costo AI stimato, margine). `[agg. 2026-08-13]`

## 🔴 Dipendenze esterne (bloccano solo la verifica, non il codice) — servono azioni dell'utente

19. **Credito Anthropic esaurito** — tutte le feature AI (analisi documenti #4, ricette/piani AI, AI Coach,
    analisi video L2) danno `credit balance` finché non si ricarica dalla console Anthropic. Il codice è pronto. `[agg. 2026-08-13]`
20. **Upstash Redis irraggiungibile** (`quiet-gazelle-99660.upstash.io` NXDOMAIN) — rate-limiting degradato a
    fail-open (app funziona senza limiti). Ripristinare l'istanza o aggiornare `UPSTASH_REDIS_REST_URL/TOKEN`.
    Anche il pooler diretto Supabase 5432 è instabile per la CLI Prisma (workaround: ALTER via pooler 6543). `[agg. 2026-08-13]`

## 🟢 Landing / marketing (da `Aggiornameni possibili.md`, ancora da formalizzare)

7. CTA "analizza la tua tecnica" con **prova analisi gratuita** via inserimento mail. `[agg. 2026-08-12]`
8. Sezione **"in 3 passi"**: cambiare "registri"→"registra", aggiungere webcam/mocap visivi. `[agg. 2026-08-12]`
9. Ridurre le situazioni "Da dove vuoi partire" a **4 voci** (casa, palestra, stop/infortunio, over 50);
   eliminare gravidanza/running anche in "Per chi". `[agg. 2026-08-12]`
10. **Prezzi**: tabella comparativa competitor + funzionalità. `[agg. 2026-08-12]`
11. Spostare le **FAQ** in sezione dedicata (fuori dalla landing) e ampliarle. `[agg. 2026-08-12]`
12. Pagina **"Il metodo"**: rimuovere elenco 53 esercizi; rafforzare messaggio **privacy video**;
    fondere gli spunti utili di "Cosa fa" e poi valutare l'eliminazione di quella pagina. `[agg. 2026-08-12]`
13. **Risorse**: ampliare a 360° (non solo allenamento), da validare col cofondatore. `[agg. 2026-08-12]`

## ⚙️ Deploy (quando i flussi sono verificati)

14. **Deploy Vercel** (setup account + env vars) — vedi `CHECKLIST_DEPLOY.md`. `[agg. 2026-08-12]`
15. **CORS bucket `exercise-videos`** su Supabase per attivare L3 in modo affidabile. `[agg. 2026-08-12]`

---

## ✅ Fatto (storico, per riferimento)

- ✅ Commit + push del lavoro Area Utente v2 / Account Manager / Motore. `(2026-08-12)`
- ✅ Allineamento e pulizia documentazione (stato reale, numeri, flussi §21). `(2026-08-12)`
- ✅ Pagina "Chi siamo" — già esistente e completa. `(verificato 2026-08-12)`
- ✅ Schema v2 applicato al DB (`prisma db push`, additivo). `(2026-08-13)`
- ✅ Bucket `user-documents` creato (privato, 10MB, pdf/jpeg/png/webp). `(2026-08-13)`
- ✅ Verifica funzionale loggata dei flussi v2 (quiz, documenti, revision, community, nutrition, pagine, guard admin). `(2026-08-13)`
- ✅ Feature #4 (analisi AI documenti), #5 (trend carichi), #6a–e (Account Manager completo) + sezione Utenti economia. `(2026-08-13)`
- ✅ Nuovi modelli: `SiteContent`, `Recipe`, campi `UserDocument.analysisJson/analyzedAt` (additivi, applicati al DB). `(2026-08-13)`
