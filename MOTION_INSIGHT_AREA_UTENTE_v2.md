> ## ⚠️ STATO REALE — aggiornato 2026-08-19 (Sessione 11)
> **Fonte autorevole dello stato di avanzamento: i due diari `COSE_FATTE_IN_SESSIONE.md` + `COSE_DA_FARE.md`.** In caso di conflitto con questo documento, **valgono i diari** (qui sotto possono esserci sezioni storiche o superate).
>
> **Snapshot codice (19 ago 2026):** oltre a tutto quanto già descritto (area utente v2 + Account
> Manager + estensioni Sessioni 6-10), in Sessione 11: editor design esteso a tutte le pagine
> marketing (prima solo Prezzi), all'onboarding, e a **tutta l'area utente autenticata** (dashboard,
> allenamento, nutrizione, profilo, esercizi, progressi, community, leaderboard — solo copy statico
> editabile, mai i dati reali), fix bug "Ripristina default". `main` è **in produzione** fino a
> Sessione 10; Sessione 11 non ancora committata.
> **Aperti:** switch fotocamera e flusso analisi inline non testabili con hardware reale in questo
> ambiente · sezione Prezzi + analisi costo AI (in attesa risposte utente) · asset 3D per il
> personaggio animato da procurare · abilitare la preview iframe per l'onboarding · resto invariato,
> vedi `STATO_PROGETTO.md`.

---

# Motion Insight — AREA UTENTE v2 (spec di lavoro)

> **Cos'è questo file:** la specifica della nuova area utente (web **e** mobile: sono identiche,
> quindi ogni voce vale per entrambe). Base di partenza = **codice attuale** (più aggiornato alla
> visione), a cui applichiamo la struttura e le funzioni descritte in `Aggiornameni possibili.md`
> (sezione "Aggiornamenti area utente e mobile").
>
> **Come si legge:** `✅ ESISTE` già nel codice (riuso) · `➕ NUOVO` da costruire ·
> `♻️ SPOSTA/MODIFICA` esiste ma va cambiato/spostato · `🔴/🟡/🟢` sforzo alto/medio/basso ·
> `⚠️` nota legale/di attenzione · `❓` decisione aperta.
>
> **Riferimenti:** mappa dello stato attuale del codice = analisi in chat; landing = `MOTION_INSIGHT_COPY_FINALE.md`.
> **Ultimo aggiornamento:** 2026-08-12 — v2 implementata e committata su `origin/main` (`5ad7b41`, `0f391cc`, `14b79b6`, `a4188de`); verifica loggata ancora da fare.

---

## Struttura / navigazione (7 sezioni)

`Dashboard · La tua sessione · Il tuo piano nutrizionale · Libreria · Progressi · Community · Profilo`

- **Analisi** non è più un tab: vive come **"Attiva analisi avanzata"** dentro *La tua sessione* e *Libreria* (il flusso tecnico esistente `/analisi/sessione` viene richiamato da lì).
- **AI Coach** → ❌ **rimosso dalla navigazione** (per scelta: non incluso in questa fase). Il codice e l'endpoint (`/api/ai/chat`, pagina `/ai-coach`) esistono ancora ma non sono linkati nell'area utente v2.
- **Abbonamento** (`/abbonamento`) → dentro **Profilo**.
- **Community** → **confermata come sezione**, posizionata **prima di Profilo**.
- ✅ **Tab-bar mobile (confermato):** i **5 principali** in basso (Dashboard · La tua sessione · Il tuo piano nutrizionale · Libreria · Progressi); **Community** e **Profilo** dentro un **menu ☰** (tre stanghette). Su desktop tutte e 7 nella sidebar.
- ✅ **Parità web ↔ PWA:** l'area utente web deve essere il **corrispettivo esatto** della PWA mobile (stesso contenuto e funzioni, layout responsive).

---

## STATO IMPLEMENTAZIONE (codice) — aggiornato 2026-08-11

**Fase 1 (fondamenta) — ✅ FATTO**
- Nav: 5 tab (Dashboard · Sessione · Nutrizione · Libreria · Progressi) + menu ☰ (Community, Profilo).
- Titoli allineati (La tua sessione / Il tuo piano nutrizionale / Libreria).
- AI Coach rimosso (nav, Premium, quick action dashboard).
- Profilo: card Abbonamento + Guida "Come funziona" + Note mediche (campo testo).

**Fase 2 (La tua sessione) — ✅ FATTO**
- Il tab "La tua sessione" mostra la **sessione attiva** (giorni + "Inizia").
- **"Analisi avanzata"** per esercizio (dettaglio) + **toggle** nella sessione live (ON = analisi, OFF = esegui e basta).
- Pannello **"Il tuo stato"** (heatmap + rischio + suggerimento) nel dettaglio.
- **Richiesta di revisione manuale** (Sessione + Nutrizione) → salvata in DB (modello `RevisionRequest`).

**⚠️ Richiede `npx prisma db push`:** `medicalNotes` + tabella `revision_requests` + campo `explanationVideoUrl`.

**Account Manager (admin) — ✅ FATTO**
- Coda **revisioni** (`/admin/revisions`).
- Editor **tag esercizi** (`/admin/exercises/tags`) — usa `tags`/`professionalNotes` esistenti (no DB push).
- **Pool piani nutrizionali** (`/admin/nutrition-plans`) — crea/elimina `NutritionPlanTemplate` (no DB push).
- **Nuovo esercizio** (`/admin/exercises/new`) — form completo: video PT esecuzione + video PT spiegazione, copy, muscoli/difficoltà/categoria/attrezzatura, durate, tag e **trigger biomeccanici (JSON → spec nidificata)**.

**Completamenti recenti — ✅ FATTO (no DB push)**
- Progressi: **trend Form Score** nel tempo (`/api/progressi` + grafico).
- Nutrizione: **target personalizzati** (Mifflin-St Jeor su peso/altezza/età/obiettivo) al posto dei 2000 kcal fissi.
- Libreria: **filtro per tag** (chip `#tag`) agganciato ai tag dell'Account Manager.

**Motore di pianificazione — quiz ✅ FATTO**
- **Quiz editabile dall'Account Manager** (`/admin/quiz`): copy, opzioni, tipo, aggiungi/elimina/riordina domande → salva = quiz mostrato agli utenti.
- **Quiz utente** (`/onboarding/quiz`): renderizzato dalla config, all'invio mappa le risposte ai dati utente (obiettivo, livello, giorni, attrezzatura, dieta, note) e completa l'onboarding.
- Config in DB (`quiz_config`), default in `src/lib/quiz.ts`.

**Completamenti recenti — ✅ FATTO**
- Quiz: **auto-mostrato al primo accesso** (redirect `/onboarding/quiz`), **skippabile**, **ripetibile dal Profilo**.
- Libreria dettaglio: **doppio video PT** (esecuzione + consigli) + "Attiva analisi avanzata" diretta sull'esercizio.
- Community: **creazione post + like + commenti** (nuovo modello `SocialComment`).
- Motore: **abbinamento nutrizionale** deterministico dal pool (obiettivo+dieta) → card "Piano consigliato per te".

**Completamenti recenti — ✅ FATTO**
- Motore: il generatore AI usa **tag + note PT** degli esercizi (Account Manager → prompt).
- Nutrizione: **ricette AI** ("Genera ricette") + **piano abbinato dal pool**.
- Progressi: **peso e misure** (grafico + aggiunta, modello `UserProgress`).
- Profilo: **upload documenti** fitness/nutrizione (Supabase, modello `UserDocument`).

**Da fare (residui reali — aggiornato 12 ago 2026)**
- Nutrizione: **adattamento automatico dei piani dal documento caricato** (serve parsing/AI del file — l'upload c'è, la lettura no).
- Progressi: **trend carichi aggregato** (il 1RM per esercizio è già nel dettaglio esercizio).
- ⚙️ Infra (runtime, non codice): eseguire `npx prisma db push` e creare il bucket Supabase **`user-documents`** perché upload/schema funzionino.
- ⚙️ Verifica funzionale **loggata** dei flussi (mai fatta finora).

> ✅ **Già completati** (erano elencati qui come "da fare", ora fatti e committati su `main`): ricette AI,
> doppio video PT nel dettaglio libreria + anteprima/micro-sezioni, peso/misure in Progressi,
> upload documenti nel Profilo, creazione post/like/commenti in Community.

---

## MOTORE DI PIANIFICAZIONE (Quiz → Obiettivi → Piano fitness + Piano nutrizionale)  🔴 `➕ NUOVO`

> Questo è il "cervello" che alimenta *La tua sessione* (U2) e *Il tuo piano nutrizionale* (U3).
> Collega **area utente** e **Account Manager (admin)**.

**1. Quiz (screening iniziale)** — l'onboarding fa da quiz: raccoglie situazione dell'utente
(cosa ha fatto in passato, cosa vuole ora, vincoli). Da qui il sistema deriva **risultati e obiettivi**.
- `✅ ESISTE` in parte: onboarding a step (`/onboarding/step1-4`, `/piano`). Da collegare come sorgente ufficiale degli obiettivi.

**2. Piano fitness (lato Sessione)** — un **sistema AI compone il piano** scegliendo dalla libreria
**quali** esercizi, **in che ordine** e **con quale modalità**, in linea con gli obiettivi del quiz.
- Presupposto: la **Libreria** popolata di tutti gli esercizi analizzabili (U4).
- Presupposto: nell'**Account Manager (admin)**, un professionista tagga **ogni esercizio** con le
  informazioni che servono all'AI per la composizione (obiettivo/i, zona, difficoltà, prerequisiti,
  controindicazioni, ecc.). `➕ NUOVO — lato admin.`

**3. Piano nutrizionale (lato Nutrizione)** — nell'**Account Manager** vive un **pool di piani
nutrizionali creati da professionisti**, ciascuno con metadati (per chi è, a cosa serve, quale
funzione ha). L'**AI analizza il pool e abbina** il piano più coerente con gli obiettivi del quiz
dell'utente. `➕ NUOVO — lato admin + AI matching.`

**4. Revisione manuale (entrambi i piani)** — a fine sezione (sia Fitness che Nutrizione) l'utente,
se non soddisfatto, può inviare una **richiesta di revisione manuale** a un professionista, con un
**campo di testo** per spiegare cosa vuole cambiare. `➕ NUOVO.`

**Note trasversali del motore**
- `⚠️` I piani sono **suggerimenti di allenamento/alimentazione**, non prescrizioni mediche.
- `❓` Stack AI da definire (usiamo lo stesso approccio Claude già presente in `generate-plan` e `AiNutritionPlan`).
- `➕` Serve estendere l'**Account Manager (admin)**: editor tag esercizi (per composizione AI) + gestione pool piani nutrizionali con metadati.

---

## U1 — DASHBOARD  🟢 `♻️ rinomina + ➕ navigazione`
**Scopo:** riepilogo/hub di lancio verso tutta l'area utente.
> **Nota:** una prima bozza della nav era stata scritta nel codice e poi **annullata (revert)** per completare prima l'intero blueprint. La specifica resta qui sotto, da implementare in fase codice.
> **Tab (breve) → titolo interno:** Dashboard · Sessione→"La tua sessione" · Nutrizione→"Il tuo piano nutrizionale" · Libreria · Progressi; menu ☰: Community, Profilo.
- `✅ ESISTE` (da mantenere): Form Score ultima analisi, statband (allenamenti/streak/punti), missione giornaliera, piano attivo, heatmap costanza, sessioni recenti, gauge settimanale, achievement.
- `♻️ SPOSTA`: la **mappa squilibri corpo** e i dettagli tecnici si spostano/duplicano in *La tua sessione* (qui resta al massimo un riepilogo sintetico).
- `➕ NUOVO`: **pulsanti di navigazione rapida** verso tutte le sezioni (Dashboard è un cruscotto: da qui si va ovunque — Sessione, Nutrizione, Libreria, Progressi, Community, Profilo).
- **Rinomina tab:** "Home" → **Dashboard**.

## U2 — LA TUA SESSIONE  🔴 `♻️ merge Allena + sessione + analisi + insight`  `[DETTAGLIATA]`
**Scopo:** l'unico posto dove l'utente **vede il piano, esegue l'allenamento e attiva l'analisi**, con tutti gli insight sul proprio stato.

### Riuso dal codice (`✅ ESISTE`)
Piano attivo/piani (`/allenamento`), sessione live (`/allenamento/[id]/sessione`), flusso analisi (`/analisi/sessione`: countdown 15s, pose detection, video, 8 frame utente + 6 frame PT, upload, confronto), report (`/analisi/report/[id]`), mappa squilibri (`AdaptiveBodyMap`), `injuryRiskAlert` nel report, Form Score.

### Struttura schermata (dall'alto)

**A) Testata sessione**
- Nome piano attivo + **giorno/sessione corrente** (es. "Sessione 3 · Parte inferiore · forza").
- **Navigazione ⟨ precedente / successiva ⟩** tra le sessioni del piano.
- Stato: *da fare / in corso / completata*.
- `➕ NUOVO` la navigazione prev/next; `✅` il piano esiste.

**B) Esercizi della sessione di oggi** (lista in base al piano generato dal Motore)
Per ogni esercizio:
- Nome · serie×reps o durata · mini-anteprima (video pro dalla Libreria).
- **Flag "Analisi avanzata"** — mini-toggle/quadratino **sopra l'esercizio** (`➕ NUOVO`):
  - **ON** → eseguendo l'esercizio parte l'**analisi strutturata** (registrazione + confronto col professionista + riscontro tecnico), come già stabilita.
  - **OFF** → l'utente **esegue solo l'esercizio** come lo vede, **senza** riscontro tecnico (per chi non vuole l'analisi).
- Pulsante **"Esegui"** → apre la **sessione live** (riuso). Se il flag è ON, si attiva anche il flusso di analisi (`/analisi/sessione`).
- `⚠️` **NON** c'è accettazione/rifiuto dell'esercizio: eventuali modifiche al piano passano dalla **richiesta di revisione** (vedi F).
- Copy microtesto: *"Vuoi il riscontro tecnico? Attiva l'analisi avanzata su questo esercizio."*

**C) Esecuzione (riuso sessione live)**
- Esercizio in corso, serie, timer recupero, log carico×reps (già esistente). Al termine → possibilità immediata di **analisi avanzata**.

**D) Analisi avanzata (riuso flusso esistente)**
- Preparazione → registrazione (telefono **o webcam**) → elaborazione → report (punteggio, confronto PT, rischi, priorità). Il report confluisce nei dati di sezione (E) e in Progressi (U5).

**E) Pannello "Il tuo stato"** (consolidato qui, oggi sparso tra dashboard/report)
- **Heatmap del corpo** (squilibri/aree lavorate).
- **Form Score** e sintesi ultima analisi.
- **Suggerimenti** (cosa curare) e **avvisi di rischio infortunio** legati ai dati analizzati e allo stato dell'utente.
- `⚠️` Sempre **avvisi di allenamento**, mai diagnosi.

**F) Origine del piano + revisione**
- Nota: piano composto dal **Motore di pianificazione** (AI su libreria taggata + obiettivi del quiz).
- **Richiesta di revisione manuale** a fine sezione: campo di testo → invio a un professionista per modificare il piano fitness. `➕ NUOVO`.

### Copy chiave (bozza)
- Titolo sezione: **La tua sessione**
- Empty state (nessun piano): *"Non hai ancora un piano. Rispondi al quiz e te ne creiamo uno su misura."* → CTA *Crea il mio piano*.
- CTA esecuzione: **Esegui** · CTA analisi: **Attiva analisi avanzata**
- Revisione: *"Il piano non ti convince? Chiedi una revisione a un nostro professionista."* → campo testo + **Invia richiesta**.

## U3 — IL TUO PIANO NUTRIZIONALE  🟡 `♻️ amplia Nutrizione`  `[DETTAGLIATA]`
**Scopo:** il posto dove l'utente vede il **piano abbinato**, **registra ciò che mangia** e trova **ricette** su misura.

### Riuso dal codice (`✅ ESISTE`)
Diario alimenti per giorno (aggiungi/elimina, grammatura→kcal), gauge calorie, macro, generatore piano settimanale AI (`AiNutritionPlan`), navigazione data.

### Struttura schermata (dall'alto)

**A) Testata piano**
- Piano nutrizionale **abbinato** all'utente (nome, per chi/obiettivo) dal **pool professionale** via Motore (obiettivi del quiz).
- **Target personalizzati**: kcal + macro calcolati su peso/altezza/età/obiettivo. `♻️ MODIFICA` (oggi fissi a 2000 kcal).

**B) Il piano di oggi / della settimana**
- Pasti previsti dal piano (colazione · pranzo · cena · spuntini), con porzioni. `➕ NUOVO` (il piano in evidenza, non solo diario).
- Navigazione giorno/settimana.

**C) Diario — cosa ho mangiato** (riuso, da collegare al piano)
- Inserimento **alimenti + grammatura** → il sistema calcola le **kcal assunte** e le confronta col target (gauge + macro).
- Vista pasti con totali. `✅ ESISTE`, da integrare col piano di (B).

**D) Ricette suggerite** `➕ NUOVO (AI)`
- Sezione finale con **ricette adatte alla situazione nutrizionale** dell'utente (obiettivo, target, preferenze).
- `⚠️` niente indicazioni per patologie: solo ricette generiche coerenti col piano.

**E) Adattamento & revisione**
- **Adattamento** del piano se l'utente ha caricato la **scheda di un nutrizionista** (da U6 → documenti nutrizionali).
- **Richiesta di revisione manuale** (campo di testo) se il piano non soddisfa → invio a un professionista. `➕ NUOVO`.

### Copy chiave (bozza)
- Titolo sezione: **Il tuo piano nutrizionale**
- Empty state: *"Il tuo piano arriva dal quiz. Completa il profilo e te ne proponiamo uno."*
- Diario CTA: **Aggiungi alimento** · Ricette: **Ricette per te**
- Revisione: *"Vuoi aggiustare qualcosa? Chiedi una revisione al nostro nutrizionista."* → campo testo + **Invia richiesta**.
- `⚠️` Disclaimer: *"Indicazioni alimentari a scopo di benessere, non sostituiscono un parere medico o dietologico."*

## U4 — LIBRERIA  🟡 `♻️ amplia Esercizi`  `[DETTAGLIATA]`
**Scopo:** catalogo esercizi ricco, con anteprime, schede tecniche e accesso a esecuzione/analisi.

### Riuso dal codice (`✅ ESISTE`)
Catalogo con filtri (muscolo/difficoltà/ricerca), badge "🎯 AI", card con media (`ExerciseCardMedia`), dettaglio `/esercizi/[slug]` (descrizione, esecuzione, muscoli, `biomechanicalSpec`).

### Struttura schermata

**A) Griglia esercizi**
- Card con **anteprima video del professionista** (mini-riquadro in loop/hover: es. il pro che esegue lo squat, prima del click). `➕ NUOVO`.
- **Filtri per tag**: ✅ set = **obiettivo · zona del corpo · attrezzatura · difficoltà · luogo** (oltre a muscolo/difficoltà già presenti). *(Gli stessi tag alimentano il Motore per comporre il piano fitness.)*

**B) Dettaglio esercizio** (`/esercizi/[slug]`)
- Micro-sezioni separate (mini-elenco): **Descrizione** · **Modalità di esecuzione** · **Accorgimenti tecnici del professionista**.
- **Due riquadri video**:
  1. **Esecuzione del pro** — con box **"Attiva analisi avanzata"** (lancia il flusso di analisi su quell'esercizio).
  2. **Video-consigli del pro** — breve clip su come eseguirlo e cosa curare.
- **Pulsante finale "Esegui questo esercizio"** con le funzionalità già create per le varie situazioni.

### Copy chiave (bozza)
- Titolo sezione: **Libreria**
- Filtri: *Obiettivo · Zona del corpo · Attrezzatura · Difficoltà · Luogo*
- CTA: **Esegui questo esercizio** · **Attiva analisi avanzata**

### Asset / dipendenze
- `🧩 ASSET`: **video del professionista** per esercizio (esecuzione + consigli). Oggi `videoUrl`/`thumbnailUrl` esistono ma vanno popolati.
- `➕ DATI`: schema **tag** per esercizio (compilati in Account Manager).

## U5 — PROGRESSI  🟢/🟡 `♻️ amplia`  `[DETTAGLIATA]` *(contenuti scelti da me, come richiesto)*
**Scopo:** mostrare il miglioramento **reale** nel tempo, collegato a *La tua sessione*.

### Riuso dal codice (`✅ ESISTE`)
Grafici frequenza/minuti, insights (giorni attivi, media min/sessione e /settimana, feeling), volume settimanale, timeline achievement (API `/api/progressi`).

### Struttura schermata

**A) Qualità del movimento (in cima)**
- **Trend Form Score nel tempo** — il dato differenziante: linea del `combinedScore` delle analisi + delta ("+12 in 6 settimane"). `➕ NUOVO` (dati già in DB).
- **Mappa corpo** collegata a Sessione (stessa `AdaptiveBodyMap`, vista d'insieme).

**B) Forza & volume**
- **Trend carichi per esercizio** (loggati in sessione, oggi non graficati). `➕ NUOVO`.
- Volume/minuti e frequenza — `✅ ESISTE`, mantenuti.

**C) Corpo & costanza**
- **Storico peso e misure** (facoltativo). `➕ NUOVO`.
- **Costanza** (heatmap/settimane) e **achievement** — `✅ ESISTE`.

### Principio
I progressi seguono la **qualità** dei movimenti, non solo minuti/frequenza. Empty state guida alla prima analisi/allenamento.

## U6 — PROFILO  🔴 `♻️ amplia + ➕ documenti + ➕ note mediche testuali`  `[DETTAGLIATA]`
**Scopo:** profilo "standard" + impostazioni + documenti + privacy.

### Riuso dal codice (`✅ ESISTE`)
Stat, account, modifica (nome/età/peso/altezza), visibilità pubblico/privato, **export dati GDPR**, **elimina account**, logout.

### Struttura schermata

**A) Testata profilo** — avatar, nome, dati sintetici (età, dove si allena, frequenza), CTA *Modifica*.

**B) Dati e obiettivi** — dati fisici + obiettivo (dal quiz), modificabili.

**C) Impostazioni** `➕ NUOVO` — **lingua**, **unità di misura**, **promemoria/notifiche**, **tema**.

**D) Abbonamento** `♻️` — integrato qui (oggi pagina separata `/abbonamento`): stato, gestione, upgrade.

**E) Documenti** `➕ NUOVO`
- Upload **SOLO nutrizionali e fitness** (schede di un professionista). Il sistema li **rileva, analizza e adatta** le sezioni collegate (piano nutrizionale U3, piano fitness U2). `⚠️ NIENTE file medici.`

**F) Note mediche (testo)** `➕ NUOVO`
- Campo di **testo facoltativo**: l'utente può **scrivere** eventuali problematiche diagnosticate; il sistema ne tiene conto per **adattare** i piani. Nessun upload di documenti sanitari.
- `⚠️` Dato sensibile: consenso esplicito, uso solo per adattare l'allenamento (mai consigli/diagnosi), cancellabile.

**G) Privacy & GDPR** — non divulgazione dei video, **gestione/cancellazione video registrati**, export/elimina dati (già esistenti).

**H) Guida — come funziona l'app** `➕ NUOVO`
- Micro-sezione con **cosa si può fare** nell'app e le **mini-regole di funzionamento** (come si registra un'analisi, come si legge il punteggio, come si esegue una sessione, come chiedere una revisione, ecc.).
- Serve all'utente in dubbio per capire funzioni e utilizzo senza uscire dall'app.
- Formato: mini-elenco / FAQ interna, in linguaggio semplice.

### Copy chiave (bozza)
- Titolo: **Profilo**
- Documenti: *"Carica la scheda del tuo trainer o nutrizionista: adattiamo i tuoi piani."* (solo fitness/nutrizione)
- Note mediche: *"Hai condizioni di cui tenere conto? Scrivicele qui (facoltativo). Le useremo solo per rendere l'allenamento più adatto a te."*

---

## COMMUNITY  🟡 `♻️ amplia (oggi passiva)`  `[DETTAGLIATA]`
**Scopo:** feed sociale della community (posizionata prima di Profilo nella nav).
- `✅ ESISTE`: feed in **sola lettura** (`/community`, `/api/community/feed`) con tipi post (workout share, achievement, foto progressi, sfide), like count, paginazione.
- `➕ NUOVO` (da valutare in fase codice): **creazione post**, **like/commenti reali**, eventuali **sfide/classifiche**.
- ❓ Priorità più bassa rispetto a Sessione/Nutrizione/Libreria: attiva ma potenziata dopo.

---

## ACCOUNT MANAGER (ADMIN) — estensione richiesta dal Motore  🔴 `➕ NUOVO`
**Scopo:** dove i professionisti curano i dati che alimentano il Motore di pianificazione. Non è un tab dell'area utente, ma è il **presupposto** di U2 e U3.
- `✅ ESISTE`: area admin (`/admin/*`: users, subscriptions, stats, exercises, ai-usage, activity, admins).
- `➕ NUOVO`:
  - **Editor tag esercizi**: per ogni esercizio il professionista imposta obiettivo/zona/attrezzatura/difficoltà/luogo + info per l'AI (prerequisiti, controindicazioni, ordine consigliato) → alimenta la composizione del **piano fitness**.
  - **Pool piani nutrizionali**: catalogo di piani creati da professionisti con metadati (per chi, obiettivo, funzione) → l'AI **abbina** al quiz dell'utente.
  - **Coda revisioni manuali**: le richieste inviate da Sessione (U2) e Nutrizione (U3) arrivano qui per la revisione del professionista.
- `⚠️` Senza questi dati, composizione AI del piano fitness e matching nutrizionale non funzionano.

---

## Note trasversali
- **Parità web/mobile:** ogni sezione va progettata identica nelle due viste (contenuto uguale, layout responsive).
- **Empty state / primo accesso:** tutte le sezioni oggi presumono un utente "ricco"; va progettato lo stato iniziale a vuoto (prima analisi, primo piano, nessun dato).
- **Coerenza "analisi avanzata":** stesso identico flusso ovunque venga richiamata (Sessione, Libreria).
- **Rischi/consigli:** sempre avvisi di allenamento, mai diagnosi.

## Decisioni prese
- ✅ Community: sezione confermata, prima di Profilo.
- ✅ AI Coach: **rimosso per ora** dal sito/area utente. Abbonamento: dentro Profilo.
- ✅ Piano fitness e nutrizionale: generati dal **Motore di pianificazione** (quiz → obiettivi → AI su libreria taggata / pool piani pro), con **revisione manuale** su richiesta.
- ✅ Documenti utente: solo **fitness/nutrizione**; condizioni mediche solo come **testo** facoltativo.
- ✅ Tab-bar mobile: 5 principali + Community/Profilo nel menu ☰. Parità web↔PWA.
- ✅ Tag Libreria: obiettivo · zona del corpo · attrezzatura · difficoltà · luogo.

## Decisioni aperte (da confermare)
1. ❓ **Account Manager (admin)**: confermi che estendiamo l'area admin con editor tag esercizi + pool piani nutrizionali? (È presupposto del Motore.)
2. ❓ **Stack AI** del Motore: riusiamo l'approccio Claude già presente (`generate-plan`, `AiNutritionPlan`)?
