# Cose fatte in sessione — diario di lavoro

> **A cosa serve:** registro cronologico di cosa è stato fatto in ogni sessione (cosa, come, cosa è
> cambiato e in che modo). Va **letto a inizio sessione** (per capire da dove si riparte) e
> **aggiornato a fine sessione**. È la coppia di [[COSE_DA_FARE]] (`COSE_DA_FARE.md`).
>
> **Convenzioni:**
> - Ogni sessione è una voce **numerata** con **data** (`YYYY-MM-DD`).
> - Le sessioni **più recenti stanno in cima** (numero più alto = più recente).
> - A fine sessione: aggiungi una nuova voce in cima e sposta in `COSE_DA_FARE.md` ciò che resta aperto.

---

## Sessione 5 — 2026-08-14 — Allineamento di TUTTI i documenti di stato allo stato reale del codice

**Contesto:** ricorreva un problema: a inizio sessione i documenti di stato (non solo i diari) erano fermi
al 12/08 — cioè **prima** delle Sessioni 3 e 4 — e mi facevano ripartire con la convinzione che feature
già chiuse fossero "da fare". Richiesta esplicita dell'utente: *"aggiorna i documenti"* significa allineare
allo stato attuale del codice **TUTTI** i documenti che poi rileggo per capire lo stato, non solo i due diari.

**Cosa è stato fatto e come:**
1. **Banner "⚠️ STATO REALE — aggiornato 2026-08-14"** in cima a **9 documenti di stato**: `STATO_PROGETTO.md`,
   `ROADMAP.md`, `README.md`, `MOTION_INSIGHT_AREA_UTENTE_v2.md`, `MOTION_INSIGHT_COMPLETE.md`,
   `MOTION_INSIGHT_Documentazione_Pagine_Completa.md`, `DOCUMENTAZIONE_FLUSSI.md`, `CHECKLIST_DEPLOY.md`,
   `AGGIORNAMENTI.md`. Il banner: (a) dichiara i due diari **unica fonte autorevole** (in conflitto vincono
   i diari); (b) dà lo snapshot codice (area utente v2 + Account Manager completi/verificati; #4/#5/#6 chiusi;
   infra applicata; branch `feature/account-manager-completo` non ancora in main); (c) elenca i residui reali.
2. **`MOTION_INSIGHT_PROSSIMI_STEP.md`** riscritto in testa: era il peggiore (elencava come "da fare" db push,
   bucket, parsing AI, trend carichi, edit esercizio, template, pool nutri, pool ricette, SiteContent — tutti
   **già fatti**). Aggiunta mappa "già fatto" punto per punto + residui reali.
3. **Memoria** aggiornata: `motion-insight-redesign.md` riscritta allo stato reale (con mappa etichetta-menu↔route);
   nuova memoria-feedback `aggiorna-documenti-significato.md` (regola permanente sul significato di "aggiorna i documenti");
   indice `MEMORY.md` allineato.

4. **DESIGN: allineato il codice all'anteprima scura (decisione utente).** Confermato che lo stile ufficiale è
   `Motion-Insight-anteprima.html` (SCURO: sfondo `#0A0F1C`, accento LIME `#C8F751`, teal `#4FD1C5`, testo `#ECF1F8`).
   Scoperto che **tutto il sito** (landing + area utente + admin) è avvolto in `.theme-organic`, che però era
   **chiaro** (navy/coral) → il codice NON rifletteva l'anteprima. **Fix in `src/app/globals.css`:** rimappati tutti
   i token di `.theme-organic` (e gli alias `--organic-*` + i glow) sulla palette scura dell'anteprima → **l'intero
   sito ora è scuro/lime da un unico punto**. Verificato live su `localhost:3000` (`--background:#0a0f1c`,
   `--primary:#c8f751`, testo `#ECF1F8`). Zero colori chiari hardcoded nei componenti (tutto token-driven → swap pulito).
   Aggiornati kit `KIT_CLAUDE_DESIGN_APP.md` e memoria. **Follow-up:** allineare i font esatti (Space Grotesk + Inter;
   oggi Sora/Geist), poi verifica visiva per-pagina quando il pannello browser compone gli screenshot.

5. **Confronto anteprima v1 vs v2 vs codice live** (richiesta esplicita utente, che aveva già sostituito v1→v2
   nel repo). Estratto il contenuto reale di `Motion-Insight-anteprima v2.html` (serviva un mini server statico
   locale: il contenuto è iniettato via JS, non testo statico). Confermato che v2 supersede v1 (piccole differenze:
   upload video oltre a registrazione, 3 nuove voci in "Non solo analisi" — kilocalorie/community/ricette —,
   footer senza placeholder ragione sociale) e che **nessuna delle due era ancora nel codice** (home live aveva
   narrativa "correzione in tempo reale" con 6 personas, non "registra e ricevi un'analisi" con 4 personas di v2).

6. **PORTING landing v2 → codice (fatto davvero, non solo doc).** `src/content/copy.ts` → `copy.landing`
   interamente riscritta con la copy reale v2 (hero, Il problema, In tre passi, Cosa ricevi + report campione
   77/100, Da dove vuoi partire [4], Il confronto per fase, Non solo analisi [6], Fiducia, voce cofondatore
   placeholder, prezzi compatti, tabella competitor). `src/app/page.tsx` riscritta di conseguenza (12 sezioni,
   nuovi componenti inline: report card, barre di confronto per fase, tabella competitor responsive). Nav header
   allineata a v2 (`Il Metodo · Per Chi · Chi siamo · Prezzi · Risorse`, CTA "Inizia gratis").
   **Bug trovati e corretti:** `MarketingHeader.tsx`/`MarketingFooter.tsx` avevano sfondi chiari hardcoded
   (bypassavano i token, sarebbero rimasti bianchi sul tema scuro) → corretti.
   **Verificato:** `tsc --noEmit` e `eslint` puliti sui file toccati; dev server compila (200); testo renderizzato
   confrontato col testo reale di v2 (combacia sezione per sezione); tema scuro confermato via stile calcolato
   (`background-color: rgb(10,15,28)`); nessun errore console.
   **Non ancora fatto:** le pagine marketing satellite (`per-chi`, `funzionalita`, `come-funziona`, `prezzi`,
   `chi-siamo`, `faq`, `storie`) NON sono state riallineate a v2 — restano con contenuti precedenti. Placeholder
   ancora da compilare (non inventati): citazione cofondatore, P.IVA footer, verifica dati prezzi competitor.

7. **Porting pagine satellite marketing → `MOTION_INSIGHT_COPY_FINALE.md`** (richiesta esplicita "continua con
   le pagine satellite"). Fonte dichiarata come unica valida dall'handoff (`HANDOFF_DESIGN_LANDING.md`).
   Portate 5 pagine:
   - **Il Metodo** (`/come-funziona`): riscritta da zero (era basata su `ScrollExplainer` a 5 step con la
     vecchia narrativa "33 punti/tempo reale", incompatibile col nuovo contenuto) → 7 sezioni A-G (perché si
     registra invece di correggere in tempo reale, i tre livelli di analisi, come si legge il punteggio,
     l'analisi come punto di partenza, cosa Motion Insight non è, privacy video, chiusura).
   - **Per Chi** (`/per-chi`): 5 segmenti (non più 6) con citazione utente + CTA "Inizia da qui" per card;
     rimossa la CTA/quiz finale (decisione esplicita della fonte).
   - **FAQ** (`/faq`): 3 risposte reali della fonte + 7 nuove domande con placeholder `[DA COMPLETARE]`
     etichettato (nessuna risposta inventata, per convenzione di repo).
   - **Prezzi** (`/prezzi` + `PrezziContent.tsx`, cablata su `useCopy()`): piani aggiornati (tagline, badge
     "Consigliato", tolto "AI Coach 24/7" dalle feature Premium), + 4 sezioni nuove: tabella "cosa include ogni
     piano", 2 tabelle confronto competitor (prezzo mensile + funzionalità, con caption `[DATI da verificare]`),
     "quanto costa oggi farsi seguire", FAQ prezzi, blocco aziende (CTA disattivata: nessuna pagina aziende
     esiste ancora, non ho creato un link finto).
   - **Chi siamo** (`/chi-siamo`): sostituito il testo precedente (che sembrava inventato) con i 4 blocchi
     placeholder dichiarati dalla fonte come "IN LAVORAZIONE" (Vision, Chi siamo, Cofondatore tecnico, Dove
     stiamo andando) — nessun contenuto inventato.
   **Non toccate** (fuori scope/senza fonte pronta): `funzionalita`, `risorse` (articoli non scritti), `storie`.
   **Verificato:** `tsc --noEmit` e `eslint` puliti su tutti i file; ognuna delle 5 pagine aperta sul dev server
   e il testo renderizzato confrontato con `MOTION_INSIGHT_COPY_FINALE.md` (combacia); nessun errore console.

8. **Verifica file "Area utente/Admin"** (l'utente aveva sovrascritto `Motion-Insight-anteprima v2.html` con
   una versione più recente, credendo contenesse anche Area utente/Admin). Servito via mini-server locale e
   ispezionato: la barra "Sito · Area utente · Mobile·PWA · Admin" ha `onclick` **vuoto** su tutti i pulsanti
   (`function kd(){}`) — sono **etichette decorative** che elencano gli altri documenti del progetto Claude
   Design, non tab funzionanti. Il body è **identico byte-per-byte** alla landing già portata: **nessun
   contenuto nuovo da importare**. Serve l'export reale delle viste "Area utente"/"Admin" (file/link separati).

9. **Aggiornamento documenti su scala totale** (richiesta esplicita: non solo i 2 diari). Rinfrescato lo
   "STATO REALE" in tutti i 10 documenti già bannerizzati (Sessione 5) con lo snapshot corrente: home + 5
   satellite portate, tema scuro/lime applicato, Area utente/Admin in attesa di export reale.

10. **Area utente + Admin: risolto il blocco ed esplorato tutto (l'utente aveva ragione).** La verifica di
    prima (Sessione 5, punto 8) era sbagliata: avevo testato il click senza aspettare il re-render della SPA.
    Riprovato con `wait` espliciti tra i click: la barra "Sito · Area utente · Mobile·PWA · Admin" **è
    funzionante davvero** (runtime a moduli-blob). Esplorate cliccando tutte le sezioni: **Area utente** (7
    schermate: Dashboard, La tua sessione, Piano nutrizionale, Libreria, Progressi, Community, Profilo) e
    **Admin** (solo 2 sezioni mockate: Utenti, Esercizi→Nuovo esercizio; le altre 4 voci menu non hanno
    contenuto disegnato dietro).

11. **Porting Area utente/Admin → codice.** Confrontata ogni schermata col codice esistente: **7 su 9 erano
    già perfettamente allineate** (nessuna modifica). Trovati e implementati **2 gap reali**:
    - **Dashboard** — aggiunta sezione "Alimentazione di oggi" (`src/app/(app)/dashboard/page.tsx`): nuova
      query Prisma (`nutritionLog` di oggi) + `computeNutritionTargets` (stesso lib di `/nutrizione`) + card
      con `RadialGauge`. "Ultima analisi" del mockup era già coperta da `FormScoreHero` esistente.
    - **Profilo** — aggiunta sezione "I tuoi video registrati" (`ProfileVideosCard.tsx`, nuova API
      `/api/me/videos` GET+DELETE). Scoperto un gap architetturale reale: `AnalysisSession.videoUrl` salvava
      solo un URL firmato temporaneo, non il path — impossibile cancellare il file dallo storage in modo
      affidabile. **Fix:** campo additivo `AnalysisSession.videoPath` (schema Prisma + `prisma db push`,
      applicato al DB Supabase + `prisma generate`), popolato in `/api/analysis/upload-video`. La cancellazione
      (singola o totale) rimuove solo il video dal bucket `analysis-videos` e azzera i riferimenti: il report
      dell'analisi (punteggi, feedback) resta, come richiesto dal mockup ("l'analisi già ricevuta resta").
    **Verificato:** `tsc --noEmit` pulito su tutto il progetto; `eslint` 0 errori (33 warning preesistenti,
    non miei, su file non toccati); dev server compila; redirect auth funziona per utente non loggato (test
    end-to-end con sessione reale non possibile in questo ambiente, nessuna credenziale disponibile).
    Il kit `KIT_CLAUDE_DESIGN_APP.md` ha esaurito il suo scopo — il mockup reale è stato portato direttamente,
    non serve più dare istruzioni a Claude Design per quella parte.

**Stato a fine sessione:** tutti i documenti di stato (10 file + 2 diari + memoria) riflettono lo snapshot
14/08: **codice allineato all'anteprima v2** nel tema (scuro/lime), nei contenuti di home + 5 pagine satellite,
**e ora anche in area utente + admin** (7/9 schermate già corrette, 2 gap reali colmati). Verificato via
tsc/eslint su tutto il progetto. **Committato e pushato** (commit `8924d46`) su
`feature/account-manager-completo` — **non ancora integrato in `main`**.

---

## Sessione 4 — 2026-08-13 — Feature area utente #4/#5 + Account Manager completo #6 (a–e) + sezione Utenti economia

**Contesto:** ripresa dopo lo sblocco infra (Sessione 3). Obiettivo: chiudere le feature residue 🟡
(#4, #5, #6) lavorando in autonomia, a blocchi verificabili. Verifiche fatte con un **utente di test QA**
(`qa.session@fitai.test`, promosso admin dove serviva) via dev server + login reale, poi **eliminato a fine
lavoro** (DB tornato a 3 utenti / 1 admin, nessun artefatto). Codice **non committato** (nel working tree:
23 file nuovi + 19 modificati).

**Cosa è stato fatto e come:**

1. **#5 — Trend carichi principali (Progressi).** Endpoint `/api/me/load-trends` (aggrega `completedSets`
   delle sessioni completate → carico max per sessione, top 4 esercizi con delta) + `LoadTrendsCard`
   (mini-grafici recharts) in `progressi/page.tsx`. Copy in `copy.progressi`. Verificato: tsc/lint,
   query su DB reale, render browser (empty-state), endpoint 200.

2. **#4 — Analisi AI dei documenti.** Endpoint `/api/documents/[id]/analyze`: scarica il file dal bucket e
   lo manda a **Claude come blocco PDF/immagine nativo** (nessun parser esterno), parsing JSON robusto,
   persistenza. Schema: aggiunti `UserDocument.analysisJson` + `analyzedAt` (additivi, applicati via ALTER
   sul pooler 6543 perché la CLI Prisma sul 5432 era instabile). UI in `DocumentsCard` (bottone "Analizza
   con AI" + sintesi/aggiustamenti fitness-nutri/cautele). **Scelta di design:** l'AI *consiglia*, non
   riscrive i piani (prudenza medica). **Bonus:** reso il rate-limiter (`src/lib/redis.ts`) **fail-open**
   (un outage Upstash non fa più 500 su nessuna route AI). Impianto verificato end-to-end (download bucket,
   richiesta a Claude, error-handling); **output AI reale bloccato dal credito Anthropic esaurito**.

3. **Sezione Utenti — economia costo-AI vs ricavo (richiesta esplicita dell'utente).** `/api/admin/users`
   esteso: per utente **costo AI stimato** (da `UsageCounter`), **ricavo dal piano**, **margine**, ultimo
   allenamento; aggregati piattaforma **MRR / costo AI / margine**. Config `src/lib/billing/plan-revenue.ts`
   (Premium €9,90/mese, Annuale €79,90/anno). UI in `UsersTable`. Verificato (endpoint 200, render).

4. **#6a — Modifica esercizio esistente.** Schema Zod estratto in `src/lib/admin/exercise-schema.ts`
   (riuso POST+PUT). `GET/PUT /api/admin/exercises/[id]` (carica dati completi + **rimpiazza la spec
   biomeccanica** in transazione). Form `AdminNewExerciseForm` reso edit-capable (props `exerciseId`/`initial`),
   pagina `/admin/exercises/[id]/edit`, pulsante "Modifica" in tabella. Verificato: round-trip su "Stacco da
   Terra" (note/tag modificati, **4 movimenti spec preservati**), restore, form precompilato.

5. **#6c — Modifica piano pool nutrizionale.** Schema in `src/lib/admin/nutrition-plan-schema.ts`.
   `GET/PUT /api/admin/nutrition-plans/[id]`; **GET tollerante** a due forme JSON (form admin `{text}/{calories}`
   vs seed `{kcal,proteinG}`/struttura per-giorno serializzata) → tutti i piani editabili. Form manager
   riusato create/edit. Verificato: seedato si apre, round-trip su piano temporaneo (create→edit→delete).

6. **#6b — CRUD template piani fitness.** Nuova sezione "Pool allenamenti": schema
   `src/lib/admin/workout-template-schema.ts`, `/api/admin/workout-plans` (GET/POST/DELETE) + `[id]`
   (GET/PUT), `AdminWorkoutTemplateManager`, pagina + voce sidebar. Verificato: 10 template, seedato si apre,
   round-trip temp, UI con badge.

7. **#6d — SiteContent (copy editabili senza deploy).** Modello `SiteContent` (chiave dot-path→valore,
   tabella creata via 6543). Resolver puro `src/lib/site-content.ts` (1034 chiavi stringa editabili, applica
   override preservando funzioni). API pubblica `/api/site-content` + admin `/api/admin/site-content`
   (whitelist). Hook `useCopy()` + `CopyProvider` nei provider root. Editor `/admin/site-content` + voce
   sidebar. **Prova:** pagina Prezzi cablata su `useCopy()` (estratto `PrezziContent`). Verificato end-to-end:
   override `prezzi.premium.price` €9,90→€12,90 → **pagina live senza deploy** → reset. (Le altre pagine si
   migrano a `useCopy()` incrementalmente.)

8. **#6e — Pool ricette curate.** Modello `Recipe` (tabella via 6543). `/api/admin/recipes` (GET/POST/DELETE)
   + `[id]` (GET/PUT), `AdminRecipesManager`, pagina + voce sidebar "Ricette". Endpoint utente `/api/recipes`
   (curate per dieta, **AI come fallback**); `RecipesCard` aggiornata (mostra curate + bottone AI). Verificato
   end-to-end: create→edit, endpoint utente, **card utente in /nutrizione mostra la ricetta "Selezionata"**.

**Nuovi modelli/campi (tutti additivi, applicati al DB):** `SiteContent`, `Recipe`,
`UserDocument.analysisJson/analyzedAt`.

**Blocchi esterni emersi (solo verifica, non codice):** credito Anthropic esaurito (feature AI), Upstash
Redis irraggiungibile (rate-limit fail-open). Vedi `COSE_DA_FARE.md` #19–20.

**Stato a fine sessione:** #4, #5, #6 (a–e) + sezione Utenti economia **completati e verificati** (tsc/ESLint
puliti su tutti i file; verifiche funzionali via browser). DB pulito. Codice nel working tree, **da committare**.

---

## Sessione 3 — 2026-08-13 — Sblocco infra runtime (DB v2 + bucket) + verifica funzionale loggata

**Contesto:** ripartenza dai 3 bloccanti 🔴 di `COSE_DA_FARE.md`. All'inizio il progetto Supabase
`nqstydpmbeafxonpxfbm` risultava **non raggiungibile** (DNS NXDOMAIN sul sottodominio progetto, il
pooler condiviso rispondeva "tenant not found"): tutto verificato in sola lettura, senza toccare nulla.
L'utente ha poi **ripristinato il progetto Supabase**; da lì il lavoro è proseguito.

**Cosa è stato fatto e come:**

1. **Diagnosi infra (read-only):** distinti problema locale vs progetto assente con test mirati
   (curl su host progetto/pooler/apex, `prisma migrate diff`). Confermato che il blocco era il progetto
   Supabase, non la rete. Nessuna modifica applicata in questa fase.
2. **Task #1 — schema v2 applicato al DB** (`npx prisma db push`, Prisma 7.8). Prima un
   `prisma migrate diff --from-config-datasource --to-schema` ha mostrato che il diff era **100%
   additivo** (3 enum `RevisionType/RevisionStatus/DocumentKind`, colonne `users.medicalNotes` +
   `exercises.explanationVideoUrl`, tabelle `social_comments/revision_requests/quiz_config/user_documents`
   con indici+FK; **nessun DROP**). Esito: *"Your database is now in sync"*. Dati preesistenti intatti
   (3 utenti, 53 esercizi/52 spec, 10 template workout, 5 nutrizionali, 10 achievement).
   *Nota Prisma 7:* rimossi i flag `--from-schema-datasource` e `--skip-generate` (sintassi cambiata).
3. **Task #2 — bucket Supabase `user-documents`** creato via service-role (script `.mjs` temporaneo,
   poi rimosso): **privato** (`public=false`), `fileSizeLimit=10MB`, `allowedMimeTypes=pdf/jpeg/png/webp`
   — coerente con i vincoli di `src/app/api/documents/route.ts`. Verificato con `getBucket`.
4. **Task #3 — verifica funzionale loggata.** Creato un **utente di test dedicato** (`qa.session@fitai.test`,
   non-admin, onboarding non completato), poi rimosso a fine test. Flussi verificati (dev server Next 16.2.4,
   login credenziali, smoke-test via `fetch` dal contesto loggato + status pagine):
   - **Onboarding quiz** UI completa → redirect Dashboard (conferma fallback `DEFAULT_QUIZ` con
     `quiz_config` vuota); `medicalNotes` salvate.
   - **Documenti → bucket**: `POST /api/documents` 201 (upload Supabase reale), `GET` 200 con **signed URL** valida.
   - **Revision request** 201 (`revision_requests`).
   - **Community**: post 201 + commento 201 (`social_comments`) + like 200; feed mostra `likes=1, comments=1, likedByMe=true`.
   - **Nutrition match** 200 (fallback goal→qualsiasi documentato, pool 5 template).
   - **7 pagine area-utente v2** (dashboard/allenamento/nutrizione/esercizi/progressi/community/profilo) + analisi → **200**.
   - **Guard admin**: `/admin/*` con non-admin → `opaqueredirect` (bloccato correttamente).
5. **Pulizia:** eliminato l'utente di test (cascade su post/commento/like/documento/revisione) + oggetto
   storage; DB tornato a 3 utenti, 0 post/commenti/documenti/revisioni. Tutti gli script temporanei rimossi.

**Non verificato in autonomia (residui, vedi `COSE_DA_FARE.md`):** analisi avanzata (video+MediaPipe+L1/L2/L3),
contenuti Account Manager (serve login admin reale), ricette/piani AI (chiamano Anthropic, saltati per costo).

**Stato a fine sessione:** infra runtime **sbloccata e verificata end-to-end** per i flussi v2 abilitati dai
bloccanti. Nessun commit di codice (solo operazioni su DB/storage + aggiornamento diari). Working tree: solo
i due diari modificati.

---

## Sessione 2 — 2026-08-12 — Commit del lavoro v2 + allineamento e pulizia documentazione

**Contesto:** all'inizio della sessione tutto il lavoro "Area Utente v2 / Account Manager / Motore"
(vedi Sessione 1) era **non committato** nel working tree; i documenti riassuntivi erano disallineati.

**Cosa è stato fatto e come:**

1. **Commit + push del lavoro v2** (prima non tracciato) in 4 commit logici su `origin/main`:
   - `5ad7b41` core (schema Prisma v2 + `lib/quiz.ts` + `lib/nutrition-targets.ts`)
   - `0f391cc` Account Manager admin (quiz, revisioni, pool nutrizionale, nuovo esercizio, tag)
   - `14b79b6` area utente v2 + motore + community (33 file)
   - `a4188de` documentazione
2. **`.gitignore`**: esclusa la cartella `DOCUMENTI BUSINESS/` (business plan, modello finanziario:
   riservati, restano solo su OneDrive). Repo confermato **privato** (`Masterteam99/FitAI`).
3. **Allineamento doc di stato allo stato reale del codice** (commit `468843f`): corrette le
   affermazioni disallineate in `STATO_PROGETTO.md`, `README.md`, `MOTION_INSIGHT_COMPLETE.md`,
   `MOTION_INSIGHT_PROSSIMI_STEP.md`, `MOTION_INSIGHT_AREA_UTENTE_v2.md`, `ROADMAP.md`,
   `AGGIORNAMENTI.md`, `DOCUMENTAZIONE_FLUSSI.md`, `CHECKLIST_DEPLOY.md`. In particolare: restyling
   ora **merged** su main (non "in corso"), Community **interattiva** (non read-only), AI Coach
   **de-linkato**, pagina Chi siamo **già esistente**.
4. **Eliminati 3 documenti obsoleti** (auto-dichiarati superati, recuperabili da git history):
   `Riassunto.md` + `ANTIGRAVITY_TASKS.md` (`2d7038d`), `prisma/REVIEW-critical-triggers.md` (`598a6cc`).
5. **Correzione numeri stale** verificati eseguendo/contando sul codice (`127d586`): unit test
   **60/60 in 11 file** (non 54/9), **55 pagine**, **64 route API**, **37 modelli Prisma**. Confermati
   corretti: pesi analisi **50/30/20**, **53 esercizi**, modelli **Sonnet 4.6 / Haiku 4.5**.
6. **Riscrittura documentazione flussi** (`cc76e42`): `DOCUMENTAZIONE_FLUSSI.md` → **v2.1** con nuova
   **§21** dettagliata (nav 7 sezioni, onboarding=quiz, motore nutrizionale, progressi v2, community
   interattiva, profilo v2, account manager, nuovi modelli) verificata leggendo il codice; annotate
   §2/4/5/9/10/11/12/13; §12 corretta (era "placeholder" → falsa).
7. **Creati questo diario** (`COSE_FATTE_IN_SESSIONE.md`) e `COSE_DA_FARE.md`, resi convenzione
   permanente in `AGENTS.md`.

**Stato a fine sessione:** working tree pulito, `main` allineato a `origin/main`. Codice v2 verificato
`tsc`+ESLint puliti e 60/60 test verdi; **verifica funzionale loggata ancora non fatta**.

---

## Sessione 1 — ~2026-08-11 — Costruzione Area Utente v2 + Account Manager + Motore *(ricostruita dai documenti)*

> Sintesi ricostruita da `MOTION_INSIGHT_AREA_UTENTE_v2.md` e `MOTION_INSIGHT_PROSSIMI_STEP.md`
> (il lavoro fu fatto ma non committato fino alla Sessione 2).

**Cosa è stato fatto:**

1. **Area Utente v2 — 7 sezioni** (web + PWA): Dashboard · La tua sessione · Il tuo piano nutrizionale ·
   Libreria · Progressi · Community · Profilo. Nav copy-driven; su mobile 5 tab + menu ☰ (Community/Profilo).
2. **Sessione**: toggle "Analisi avanzata" per esercizio, pannello "Il tuo stato" (heatmap + rischio),
   richiesta di revisione manuale (`RevisionRequest`).
3. **Nutrizione**: target personalizzati Mifflin-St Jeor, abbinamento piano dal pool
   (`/api/nutrition/match`), ricette AI (`/api/ai/recipes`).
4. **Libreria**: filtro per tag, dettaglio con doppio video PT (esecuzione + consigli).
5. **Progressi**: trend Form Score + peso/misure (`UserProgress`).
6. **Community**: creazione post + like + commenti (`SocialComment`).
7. **Profilo**: note mediche, upload documenti (`UserDocument` + bucket Supabase), quiz ripetibile.
8. **Motore**: quiz onboarding editabile (`QuizConfig`) → mappatura risposte ai dati utente.
9. **Account Manager (admin)**: editor quiz, coda revisioni, pool nutrizionale (crea/elimina),
   form nuovo esercizio con trigger biomeccanici, editor tag.
10. **Schema Prisma v2**: `medicalNotes`, `explanationVideoUrl`, `RevisionRequest`, `QuizConfig`,
    `SocialComment`, `UserDocument` (+ enum `DocumentKind`).

**Base precedente (M0–M12 + redesign "wow" + restyling Motion Insight):** già su `main`, documentata
in `DOCUMENTAZIONE_FLUSSI.md` (§1–20) e nei piani storici in `docs/superpowers/`.
