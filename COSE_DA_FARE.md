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

## 🔴 Bloccanti — infra runtime (da fare prima di testare l'app loggata)

1. **`npx prisma db push`** — applica lo schema v2 al DB Supabase (`medicalNotes`, `explanationVideoUrl`,
   `RevisionRequest`, `QuizConfig`, `SocialComment`, `UserDocument` + enum `DocumentKind`). `[agg. 2026-08-12]`
2. **Creare il bucket Supabase `user-documents`** (privato) — senza, l'upload documenti dà errore a
   runtime. `[agg. 2026-08-12]`
3. **Verifica funzionale loggata** dei flussi Area Utente v2 (mai eseguita): onboarding quiz → sessione
   con analisi avanzata → nutrizione (match + ricette) → community (post/like/commenti) → profilo
   (documenti + revisione) → account manager. `[agg. 2026-08-12]`

## 🟡 Feature residue (codice)

4. **Parsing/adattamento AI dei documenti caricati** — l'upload c'è, manca lettura PDF/immagine +
   prompt AI per adattare piano fitness/nutrizionale. `[agg. 2026-08-12]`
5. **Progressi — trend carichi aggregato** — vista "carichi principali" aggregando i log di sessione
   (l'ultimo carico per esercizio è già in `/api/me/last-loads`). `[agg. 2026-08-12]`
6. **Account Manager "completo"** — replicare il pattern quiz (DB → API admin → editor → utenti):
   - 6a. Editor **modifica esercizio esistente** (riuso form "Nuovo esercizio" in edit).
   - 6b. **Modifica** di un piano del pool nutrizionale (oggi solo crea/elimina).
   - 6c. **Template piani fitness** CRUD (`WorkoutPlanTemplate`).
   - 6d. Modello **`SiteContent`** per rendere i copy delle pagine editabili senza deploy.
   - 6e. **Pool di ricette curate** (invece di sole ricette AI).
   `[agg. 2026-08-12]`

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
