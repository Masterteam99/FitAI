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

## ▶️ PARTI DA QUI (prossima sessione) `[agg. 2026-08-19 — Sessione 11]`

- **Credito Anthropic da ricaricare** `[agg. 2026-08-19]` — confermato con un test reale in questa
  sessione (registrazione utente vera + generazione piano AI): l'errore è gestito bene lato UI
  ("credito esaurito", nessun crash), ma finché non si ricarica nessuna feature AI funziona
  davvero (piani allenamento/nutrizione, ricette AI di supporto, assistente editor). Scelta
  esplicita dell'utente di rimandare al momento del lancio.
- **Chiavi Stripe da configurare** `[agg. 2026-08-19]` — scoperto testando la pagina Abbonamento:
  **nessuna chiave `STRIPE_*` è presente in `.env.local` locale**. La UI gestisce l'assenza in modo
  pulito ("Pagamenti non configurati"), ma senza queste chiavi **nessun pagamento reale è possibile**.
  Da verificare se sono già impostate su Vercel (produzione) — se no, è un blocco vero e proprio per
  il lancio, non solo un test locale mancante. Rimandato su scelta esplicita dell'utente insieme al
  credito Anthropic.
- ✅ **FATTO (2026-08-19, stessa Sessione 11): area utente autenticata estesa all'editor design** —
  tutte le 8 pagine (dashboard, allenamento, nutrizione, profilo, esercizi, progressi, community,
  leaderboard) hanno ora `useCopy()` + `EditableText` sui titoli/label statici. Dashboard ed esercizi
  (Server Component) sono stati splittati in page.tsx (fetch dati) + componente client (rendering).
  Solo copy statico è editabile, mai i dati reali (punteggi, feedback, valori utente) — come richiesto
  esplicitamente. Verificato dal vivo, `tsc`/`eslint` puliti.
- **Onboarding — valutare se abilitare la preview iframe** `[agg. 2026-08-19]` — oggi i testi
  onboarding sono editabili solo tramite "Elenco testi (ricerca)" in `/admin/site-content`, non tramite
  l'iframe visuale: `onboarding/layout.tsx` reindirizza a `/dashboard` chi ha già completato
  l'onboarding (ogni admin), quindi l'iframe mostrerebbe sempre la dashboard. Per abilitare la preview
  visuale servirebbe un modo per far bypassare quel redirect quando `?siteEditor=1` è presente — le
  pagine ricevono `searchParams` ma il layout no (limite di Next.js App Router), quindi la logica
  andrebbe spostata/duplicata nelle singole pagine onboarding. Non fatto perché tocca la logica reale
  di redirect dell'onboarding — da valutare con più attenzione, non è puro lavoro meccanico.
- **Punto 3 di `Aggiornameni possibili.md` (Prezzi — tabelle/struttura)** — l'utente vuole rivederlo
  "con calma", risposte sue attese prima di toccare il codice su: quali competitor mostrare nelle
  tabelle comparative (oggi ci sono dati `[DATI da verificare]` segnaposto), e la struttura generale.
- **Nuovo — analisi costo AI per il pricing** `[agg. 2026-08-18]`: l'utente vuole, come parte del
  lavoro sulla sezione Prezzi, un'**analisi di quanto costa (in token/USD Anthropic) un utente che
  ripete le analisi video più volte al mese** — per capire se il prezzo Premium attuale (9,90€/mese,
  analisi illimitate) copre il costo reale a un utilizzo intensivo, o se serve un limite/tier diverso.
  Base dati già esistente per farla: `services/analysis/weights.ts` (pesi L1/L2/L3), i modelli usati
  in `lib/anthropic.ts` (`MODELS.DEFAULT` = Sonnet), e la sezione Admin → Utenti che già mostra un
  costo AI stimato per utente (verificare come lo calcola oggi, vedi item sotto).
- **Riordino blocchi nell'editor design** — coda del punto 2: oggi l'editor Admin (`/admin/site-content`
  → Editor visuale) modifica testo/colore/dimensione ma non permette di riordinare gli elementi in una
  sezione (drag per cambiare l'ordine tra fratelli, non posizione libera a pixel — quella romperebbe
  il layout responsive). Da progettare: probabilmente serve un array ordinabile persistito per
  sezione, con drag-and-drop lato editor.
- **Asset 3D per il personaggio animato** — punto 2 di `Aggiornameni possibili.md` v1 (sessione 9):
  l'utente vuole il 3D (non il 2D, tenuto come miglioramento interinale). Serve procurare/commissionare
  un asset esterno — opzioni date: DeepMotion (converte un video reale in animazione 3D via AI
  motion-capture), Mixamo (gratuito, personaggio generico), freelance su commissione, Spline (no-code).
  Una volta scelto e ottenuto l'asset, l'integrazione lato codice (React Three Fiber) è da fare.
- **Estendere l'editor design alle altre pagine** — oggi `SiteEditModeProvider` + `EditableText` sono
  attivi solo su `/prezzi` (selezionabile comunque nell'editor visuale Admin, ma senza testi editabili
  wired su quella pagina risulterà vuota). Ogni altra pagina richiede: 1) migrarla da
  `import { copy }` statico a `useCopy()` (se non già client component, serve uno split
  server-shell/client-content come già fatto per Prezzi), 2) avvolgere i testi in `EditableText`.
  Meccanico ma da fare pagina per pagina — non un blocco tecnico, solo tempo.
- **Punto 7 (Profilo, da `Aggiornameni possibili.md` v1) — da fare**: sezione impostazioni con
  selettore lingua (tema chiaro/scuro rimandato: tema chiaro non esiste nel codice, solo scuro/lime).
- **i18n completo (IT/EN) — rimandata come iniziativa a parte**, discussa con l'utente: tutto il copy
  oggi è fisso in italiano in `copy.ts`, nessuna infrastruttura di traduzione. Opzioni valutate:
  traduzione via browser (zero lavoro, ma conflitti DOM noti con React) vs traduzione automatica
  server-side con cache (più lavoro di setup una tantum, risultato professionale). Da pianificare
  come progetto dedicato quando si apre il mercato non italiano.
- **Punto 8 residuo (Admin → Utenti, da `Aggiornameni possibili.md` v1)**: costo AI stimato "€0,06"
  mostrato senza Anthropic attivo — da chiarire con l'utente cosa lo genera prima di poter giudicare se
  è un bug. Probabilmente rilevante anche per la nuova analisi costo AI del punto 3 sopra.
- **VAPID (notifiche push)**: le chiavi sono già generate in `.env.local` locale ma non è stato
  confermato se sono state copiate su Vercel — verificare.
- **Credito Anthropic**: ancora da ricaricare (scelta dell'utente, rimandato all'ultimo prima del
  lancio) — blocca la verifica reale di: generazione piani AI, prova gratuita (analisi vera), e ora
  anche l'assistente IA dell'editor Admin.

---

## ▶️ Storico "parti da qui" — Sessione 9 `[agg. 2026-08-17]`

- Fix rapidi (contrasto, CTA sticky, nav download, layout Nutrizione), copy IA ripulito, prova
  gratuita ospiti, personaggio 2D, carosello report, editor Admin (prima versione), gamification —
  **tutti fatti**, poi ampliati/corretti in Sessione 10 (editor spostato in Admin, prova gratuita
  completata con nome+upload, Libreria, Scarica l'app). Vedi storico sotto per il dettaglio originale.
- I punti "asset 3D", "estendere editor alle altre pagine", "profilo lingua", "i18n", "punto 8 residuo
  Admin Utenti", "VAPID" restavano aperti — **spostati nella sezione "PARTI DA QUI" Sessione 10 in
  cima** (ancora aperti, non chiusi in Sessione 10).

---

## ▶️ Storico "parti da qui" — Sessione 8 `[agg. 2026-08-15 notte]`

- ✅ **FATTO (2026-08-15): push del lavoro di Sessione 8.** Committato e pushato su `main` (commit
  `725d8c1`), deploy Vercel completato senza errori.
- Punto 4/7/8-residuo di `Aggiornameni possibili.md`, VAPID: **spostati nella sezione "PARTI DA QUI"
  Sessione 9 in cima** (restano aperti, non ancora chiusi).

---

## ▶️ Storico "parti da qui" — Sessione 7 `[agg. 2026-08-15 sera]`

- ✅ **FATTO (2026-08-15): merge in `main`.** PR [FitAI#2](https://github.com/Masterteam99/FitAI/pull/2)
  mergiata (commit `ee7e867`) — `feature/mvp-launch-polish` includeva già tutto
  `feature/account-manager-completo`. `main` locale e remoto allineati.
- ✅ **FATTO (2026-08-15): deploy Vercel verificato live e sano.** Progetto `fit-ai`
  (`masterteam99s-projects`) già collegato via Git integration — il push su `main` ha auto-deployato.
  Verificato: `/api/health` 200, home 200, zero runtime error. Alias:
  `fit-ai-six-ruddy.vercel.app` (+ 2 alias masterteam99s-projects).
- ✅ **FATTO (2026-08-15): bug Upstash Redis trovato e risolto in produzione.** Il vecchio database
  era stato eliminato → rate limiter falliva in fail-open (comportamento sicuro ma senza protezione
  reale). Utente ha creato nuovo database + aggiornato env var su Vercel + redeploy → riverificato,
  ora funziona (log puliti, nessun fail-open).
- **Prossimo passo — VAPID (notifiche push):** non ancora verificato se le env var
  `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_SUBJECT` (+ opzionale
  `CRON_SECRET`) sono impostate su Vercel (valori generati sono in `.env.local` locale). Senza, il
  sistema di reminder streak (email+push) costruito in Sessione 6 non invia le push in produzione.
- **Prossimo passo — Anthropic:** scelta esplicita dell'utente di ricaricare il credito solo
  all'ultimo prima del lancio. La env var `ANTHROPIC_API_KEY` risulta già presente su Vercel; da
  verificare/ricaricare quando deciso.
- ⚠️ **Da verificare con hardware reale (non fatto in autonomia, serve dispositivo mobile vero):**
  switch fotocamera anteriore/posteriore (Fase 10) e flusso "analisi inline" end-to-end con
  registrazione video reale (fotocamera bloccata nell'ambiente di sviluppo usato).
- Sotto ancora aperti i residui di Sessione 5 (landing/placeholder) — vedi sezione storica sotto,
  invariata.

---

## ▶️ Storico "parti da qui" — Sessione 5 `[agg. 2026-08-14 sera]`

- Tutto il lavoro **feature #4/#5/#6 (a–e) + sezione Utenti (economia)** è **FATTO, verificato**. Il porting
  completo landing/satellite/area-utente/admin + tema scuro (Sessioni 5-6) è **committato e pushato**
  (commit `8924d46`) sul branch **`feature/account-manager-completo`**, **non ancora integrato in `main`**.
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

1. ✅ **FATTO (2026-08-15):** merge di `feature/mvp-launch-polish` (include già
   `feature/account-manager-completo`) in `main` via [PR #2](https://github.com/Masterteam99/FitAI/pull/2),
   commit `ee7e867`.

2. **Ripristinare le dipendenze esterne:**
   - **Credito Anthropic**: da ricaricare **all'ultimo prima del lancio** (scelta esplicita
     dell'utente, non un blocco). La env var `ANTHROPIC_API_KEY` risulta già su Vercel.
   - ✅ **FATTO (2026-08-15):** **Upstash Redis** — nuovo database creato, `UPSTASH_REDIS_REST_URL/TOKEN`
     aggiornate su Vercel, redeploy fatto, verificato in produzione (log puliti, nessun fail-open).
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
   - 6a. ✅ **FATTO (2026-08-15):** progetto Vercel `fit-ai` collegato via Git, deploy production live
     e verificato (auto-deploy al push su `main`). Residuo: confermare env var VAPID (vedi sopra
     "PARTI DA QUI").
   - 6b. **CORS bucket `exercise-videos`** su Supabase per attivare L3 in modo affidabile.
   `[agg. 2026-08-12]`

7. **(Progressivo) Migrare le altre pagine a `useCopy()`** — così tutti i copy del sito diventano editabili
   dal pannello SiteContent senza deploy. Sessione 9 ha aggiunto anche l'**editor inline "designer"**
   (clic su un testo → modale → salva, non solo il form admin separato) e lo ha applicato a Prezzi
   (15 testi) — resta da estendere alle altre pagine, stesso lavoro di prima. `[agg. 2026-08-17]`

---

## ✅ Fatto (storico, per riferimento)

**Sessione 10 (2026-08-18)** — dettaglio in `COSE_FATTE_IN_SESSIONE.md`:
- ✅ Prova gratuita completata: campo nome, scelta "Registra ora" vs "Carica un video" (riusa
  l'estrazione frame + pose detection esistenti), 6 esercizi di default attivati in produzione. 2 bug
  reali trovati e corretti (video non montato, messaggio errore sbagliato).
- ✅ Editor design spostato **solo dentro Admin** (`/admin/site-content` → Editor visuale, iframe con
  `?siteEditor=1`) — non più sovrapposto alle pagine pubbliche. Nuovo modello `SiteStyleOverride`
  (colore+dimensione). `X-Frame-Options` cambiato da `DENY` a `SAMEORIGIN` per l'iframe.
- ✅ Cronologia modifiche (Annulla/Ripeti) + "Ripristina default" per campo.
- ✅ Assistente IA nell'editor (valutati progetti open source su GitHub, nessuno adatto — costruito
  riusando l'infrastruttura Claude esistente, stesso pattern dell'AI Coach).
- ✅ Libreria: rinominata "Libreria esercizi", filtri principali+"Altri filtri", bottone "Termina
  esercizio", vista registrazione schermo intero + PIP video PT (desktop), chiarito il limite reale sui
  permessi camera/microfono (sicurezza browser, non un bug).
- ✅ Scarica l'app: bottone "Installa ora" sempre visibile (spariva su iOS/al primo caricamento).
- ✅ Tutto verificato dal vivo con account admin di test (creati e cancellati); `tsc`/`eslint` puliti.

**Sessione 9 (2026-08-17)** — dettaglio in `COSE_FATTE_IN_SESSIONE.md`:
- ✅ Fix contrasto testo esteso (6 file), CTA sticky homepage, nav "Scarica l'app" + pagina ampliata,
  layout Nutrizione corretto, copy "IA/AI" ripulito da bottoni/badge/checkbox (13 punti).
- ✅ Prova gratuita ospiti (`/prova-gratuita`): consenso privacy, pipeline analisi condivisa coi
  Premium, referto via email, una prova completata per email a vita (non al giorno).
- ✅ Personaggio 2D animato al posto dello sticker (3D valutato, asset esterno da procurare).
- ✅ Carosello di 3 esempi di referto nella home.
- ✅ Editor inline copy per Admin (oggi su Prezzi).
- ✅ Gamification: classifica (`/leaderboard`), premi configurabili da Admin, teaser in home.
- ✅ Tutto verificato dal vivo con account di test (creati e cancellati); `tsc`/`eslint` puliti.

**Sessione 6 (2026-08-15)** — dettaglio in `COSE_FATTE_IN_SESSIONE.md` e `DOCUMENTAZIONE_FLUSSI.md` (§7-8-10, §14bis):
- ✅ MVP polish: toast coverage, validazione 4 form admin, cambio email/password, sistema notifiche
  reminder streak (email+push, da zero), fix filtri Libreria esercizi.
- ✅ Piano Sessione/Nutrizione/Analisi — 10 fasi + lavoro inline, tutte chiuse e testate dal vivo:
  link schema AnalysisSession↔WorkoutSession, secondo video PT, sessione↔analisi collegate con
  persistenza progresso, recap con analisi, storico feedback per sessione passata, calendario
  settimanale, riepilogo settimana + ultimi feedback + equilibrio muscolare, piano nutrizionale
  con gerarchia unica (+ fix bug persistenza), priorità documento professionista, switch fotocamera,
  analisi mostrata inline senza redirect.
- ⚠️ Switch fotocamera e flusso inline non verificabili con hardware reale in questo ambiente —
  da confermare su dispositivo mobile vero.

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
