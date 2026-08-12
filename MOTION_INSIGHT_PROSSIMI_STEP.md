# Motion Insight — Prossimi step

> Documento operativo: cosa resta da fare dopo il grande blocco di implementazione dell'area utente,
> del Motore e dell'Account Manager. Diviso in **residui tecnici** e la **visione "Account Manager
> completo"** (ogni sezione modificabile da un manager, con salvataggio che si adatta a tutti gli utenti).
> Aggiornato: 2026-08-12.
>
> **Nota stato (12 ago 2026):** tutto il lavoro area utente v2 / Account Manager / Motore è ora
> **committato e pushato su `origin/main`** (`5ad7b41`, `0f391cc`, `14b79b6`, `a4188de`). I residui
> qui sotto restano validi; i punti 1–2 (`db push` + bucket) sono azioni **infra runtime**, non codice.

---

## PARTE 1 — Residui tecnici (chiudere il lavoro già impostato)

1. **`npx prisma db push`** — applica le aggiunte di schema fatte in questa fase:
   `medicalNotes`, tabella `revision_requests`, `explanationVideoUrl`, `quiz_config`,
   `social_comments`, `user_documents` (+ enum `DocumentKind`).
2. **Creare il bucket Supabase `user-documents`** — senza, l'upload documenti dà errore a runtime
   (come per il bucket dei video analisi).
3. **Adattamento AI dai documenti caricati** — l'upload c'è; manca la **lettura/parsing** del file
   (PDF/immagine) e l'uso dei contenuti per **adattare** piano fitness/nutrizionale. Richiede:
   estrazione testo (PDF) + prompt AI dedicato → aggiornamento dei piani dell'utente.
4. **Progressi — trend carichi aggregato** — il 1RM per esercizio è già nel dettaglio esercizio;
   manca una vista "carichi principali" nella pagina Progressi (aggregando i log di sessione).
5. ~~**Landing — pagina "Chi siamo"**~~ — ✅ **FATTO**: la pagina esiste
   (`src/app/(marketing)/chi-siamo/page.tsx`) con hero, intro e valori da `copy.chiSiamo`.
   (Resta eventuale rifinitura contenuti vision/bio cofondatore, ma non è più "mancante".)
6. **Verifica visiva/funzionale** — tutto passa `tsc`+ESLint ma NON è stato verificato loggato:
   serve avviare l'app con un account (dopo `db push` + bucket) e testare i flussi.

---

## PARTE 2 — Account Manager "completo" (visione)

**Requisito:** nell'Account Manager deve esistere, per **ogni sezione modificabile**, un pannello dove
un manager può **modificare → salvare → e la modifica si adatta automaticamente a tutti gli utenti**.

**Pattern comune** (già usato per il Quiz, da replicare ovunque):
1. i dati stanno in un **modello/config in DB** (single source of truth);
2. **API admin** protetta (`requireAdmin`) GET/PUT;
3. **editor UI** in `/admin/...`;
4. le pagine utente **leggono dal DB** → ogni modifica si riflette su tutti in tempo reale.

### Sezioni da rendere gestibili

**A. Esercizi** — `parziale`
- Oggi: ✅ creazione nuovo esercizio (con video esecuzione + spiegazione, copy, tag, trigger biomeccanici),
  ✅ editor tag/note, ✅ attiva/disattiva, ✅ upload video PT.
- Da fare: **editor completo di modifica di un esercizio esistente** — scegliere un esercizio dall'elenco
  e modificarne tutto: info (nome/descrizione/istruzioni/muscoli/difficoltà/categoria/attrezzatura),
  **aggiungere/sostituire/rimuovere il video esecuzione e il video spiegazione**, tag, note PT,
  trigger biomeccanici. (Riusare il form "Nuovo esercizio" in modalità edit.)

**B. Piani di allenamento (template)** — `da fare`
- Modello esistente: `WorkoutPlanTemplate`. Oggi non c'è editor admin.
- Da fare: **aggiunta / modifica / eliminazione** dei template fitness (come il pool nutrizionale).

**C. Pool piani nutrizionali** — `parziale`
- Oggi: ✅ creazione + eliminazione.
- Da fare: **modifica** di un piano esistente del pool.

**D. Ricette** — `da decidere`
- Oggi: le ricette sono **generate al volo dall'AI** (non curate da un manager).
- Per renderle "modificabili dal manager": introdurre un **pool di ricette curate** (nuovo modello,
  come i piani nutrizionali) + editor admin; l'utente vede quelle curate (con l'AI come fallback).

**E. Quiz** — ✅ **fatto**
- `/admin/quiz`: modifica copy, opzioni, tipo, aggiungi/elimina/riordina domande → salva → mostrato agli utenti.

**F. Copy / testi delle pagine** — `da fare (architetturale)`
- Oggi i testi stanno in `src/content/copy.ts` (hardcoded nel codice).
- Per renderli editabili da un manager: introdurre un modello **`SiteContent`** (chiave→valore/JSON)
  con override editabili in admin; le pagine leggono "override dal DB, altrimenti default da `copy.ts`".
- Consente di modificare titoli, sottotitoli, CTA, ecc. senza deploy.

**G. Altri elementi editabili** (da mappare quando servono): prezzi/piani, FAQ, risorse,
segmenti "Per Chi", contenuti Community moderabili, ecc. — stesso pattern (modello + API + editor).

### Priorità suggerite
1. **A** (editor modifica esercizi) e **C** (modifica pool nutrizionale) — completano ciò che è già avviato.
2. **B** (template fitness) — sblocca la gestione completa dei piani.
3. **F** (SiteContent per i copy) — grande leva: rende editabile il testo del sito senza deploy.
4. **D** (pool ricette) — se si vuole curare le ricette invece di generarle.

---

## Nota di metodo
Questi step vanno affrontati **a blocchi verificabili** (come fatto finora): per ognuno, `tsc`+ESLint
puliti; la verifica funzionale reale richiede l'app avviata con un account (dopo `db push` + bucket).
