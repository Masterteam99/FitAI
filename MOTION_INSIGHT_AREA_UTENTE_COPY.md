# Motion Insight — COPY AREA UTENTE (finale)

> **Cos'è:** il **testo definitivo** delle sezioni dell'area utente (web = PWA mobile), pronto a
> confluire nel codice (`src/content/copy.ts`) e poi a guidare il design.
> Voce: "tu", calda, onesta, concreta, niente hype. Struttura di riferimento: `MOTION_INSIGHT_AREA_UTENTE_v2.md`.
> **Nota:** l'AI Coach è rimosso per ora (nessuna stringa lo menziona).
> **Ultimo aggiornamento:** 2026-08-11.

---

## GLOBAL — Navigazione & elementi ricorrenti

**Tab principali (label breve per mobile → titolo interno):**
- Dashboard → *Dashboard*
- Sessione → *La tua sessione*
- Nutrizione → *Il tuo piano nutrizionale*
- Libreria → *Libreria*
- Progressi → *Progressi*

**Menu ☰:** Community · Profilo · Admin · Esci

**Blocco Premium (sidebar):**
- Titolo: **Premium**
- Descrizione: *Analisi illimitate e piani su misura.*
- CTA: **Passa a Premium**
- *(⚠️ nel codice la descrizione attuale dice "Analisi illimitata e AI Coach 24/7" → aggiornare togliendo il Coach.)*

**Microcopy ricorrente:**
- Salvataggio: *Salvato* / *Salva*
- Caricamento: *Un attimo…*
- Errore generico: *Qualcosa non ha funzionato. Riprova.*
- Conferma invio: *Richiesta inviata. Ti rispondiamo presto.*

---

## DASHBOARD

- Eyebrow: *[giorno, data]* (es. "giovedì 6 agosto")
- Titolo: **Ciao [Nome] 👋**
- Badge streak: **🔥 [n] giorni di fila**
- Intro hub: *Da qui vai ovunque.*
- Pulsanti hub: **La tua sessione** · **Piano nutrizionale** · **Libreria** · **Progressi** · **Profilo**

**Card — Il tuo Form Score**
- Eyebrow: **IL TUO FORM SCORE**
- Verdetti: *Ottima esecuzione* (≥85) · *Buona esecuzione* (≥70) · *Da migliorare* (≥50) · *Attenzione alla tecnica* (<50)
- Etichette dati: *Biomeccanica* · *Analisi AI* · *Confronto PT* · *Rischio infortuni*
- Empty: *Fai la tua prima analisi per vedere qui il tuo Form Score.* → CTA **Analizza un esercizio**

**Statband:** *Allenamenti* · *Streak* (unità: *giorni*) · *Punti* · record: *record [n]*

**Card — Missione di oggi:** titolo **Missione di oggi**

**Card — Il tuo piano**
- Titolo: **Il tuo piano** · CTA **Vai alla sessione**
- Progresso: *[n] sessioni completate*
- Empty: *Non hai ancora un piano. Rispondi al quiz e te ne creiamo uno su misura.* → CTA **Crea il mio piano**

**Card — La tua costanza:** titolo **La tua costanza** · link **Vedi tutto**

**Card — Ultime sessioni:** titolo **Ultime sessioni** · empty *Nessuna sessione ancora. Inizia quando vuoi.*

**Card — Questa settimana:** titolo **Questa settimana** · label gauge *su [n]*
- Pieno: *Obiettivo settimanale raggiunto. Ottimo ritmo.*
- Parziale: *Ti manca[no] [n] allenament[o/i] per l'obiettivo di questa settimana.*

**Card — Il tuo equilibrio:** titolo **Il tuo equilibrio** · link **Mappa** · ok *Tutto in equilibrio, ottimo.*

**Card — Ultimi traguardi:** titolo **Ultimi traguardi** · *[n] punti*

---

## LA TUA SESSIONE

- Titolo: **La tua sessione**
- Testata: **Sessione [n] · [nome giorno]** · stato: *da fare* / *in corso* / *completata*
- Navigazione: **← Precedente** / **Successiva →**

**Lista esercizi**
- Flag: **Analisi avanzata** · tooltip: *Attiva: eseguendo, analizziamo la tua tecnica. Disattiva: esegui e basta.*
- CTA: **Esegui** · **Attiva analisi avanzata**
- Microtesto: *Vuoi il riscontro tecnico? Attiva l'analisi avanzata su questo esercizio.*

**Pannello — Il tuo stato**
- Titolo: **Il tuo stato**
- Sottotitoli: **Rischi da tenere d'occhio** · **Suggerimenti**
- Disclaimer: *Sono indicazioni di allenamento, non diagnosi mediche.*

**Revisione del piano**
- Testo: *Il piano non ti convince? Chiedi una revisione a un nostro professionista.*
- Placeholder: *Scrivi cosa vorresti cambiare…*
- CTA: **Invia richiesta**

**Empty (nessun piano):** *Non hai ancora un piano. Rispondi al quiz e te lo creiamo su misura.* → CTA **Crea il mio piano**

---

## IL TUO PIANO NUTRIZIONALE

- Titolo: **Il tuo piano nutrizionale**
- Testata piano: **Il tuo obiettivo di oggi** · sottotitolo *Calibrato su di te.*
- Target: *[kcal] kcal* · *Proteine [g] g* · *Carboidrati [g] g* · *Grassi [g] g*
- Messaggio target: *Obiettivo di oggi raggiunto.* / *Ti mancano [n] kcal all'obiettivo di oggi.*

**Il piano di oggi:** titolo **Cosa mangiare oggi** · pasti: *Colazione* · *Pranzo* · *Cena* · *Spuntini*

**Diario:** titolo **Cosa ho mangiato** · CTA **Aggiungi alimento**
- Form: *Nome alimento* · *Calorie* · *Proteine* · *Carboidrati* · *Grassi* · CTA **Aggiungi** / **Annulla**
- Empty giorno: *Ancora niente per oggi. Aggiungi cosa hai mangiato.*

**Ricette:** titolo **Ricette per te** · intro *Idee adatte al tuo piano.*

**Adattamento:** *Hai caricato la scheda del tuo nutrizionista: il piano si adatta a quella.*

**Revisione:** *Vuoi aggiustare qualcosa? Chiedi una revisione al nostro nutrizionista.* · placeholder *Scrivi cosa vorresti cambiare…* · CTA **Invia richiesta**

**Empty:** *Il tuo piano arriva dal quiz. Completa il profilo e te lo proponiamo.*

**Disclaimer:** *Indicazioni a scopo di benessere. Non sostituiscono un parere medico o dietologico.*

---

## LIBRERIA

- Titolo: **Libreria**
- Sottotitolo: *Tutti gli esercizi che possiamo analizzare, spiegati bene.*
- Ricerca placeholder: *Cerca un esercizio…*
- Filtri: **Tutti** · **Obiettivo** · **Zona del corpo** · **Attrezzatura** · **Difficoltà** · **Luogo**
- Badge card: **🎯 Analisi AI**
- Empty: *Nessun esercizio con questi filtri.*

**Dettaglio esercizio (micro-sezioni):**
- **Descrizione**
- **Come si esegue**
- **Accorgimenti del professionista**

**Riquadri video:**
- **Esecuzione del professionista** (con box **Attiva analisi avanzata**)
- **Consigli del professionista**

**CTA finale:** **Esegui questo esercizio**

---

## PROGRESSI

- Titolo: **Progressi**
- Sottotitolo: *Come stai migliorando davvero.*

**Qualità dei movimenti:** titolo **Qualità dei tuoi movimenti** · delta es. *+12 in 6 settimane* · nota *Segue la qualità della tecnica, non solo i minuti.*

**Carichi:** titolo **I tuoi carichi**

**Peso e misure:** titolo **Peso e misure** · *Facoltativi. Se non ti interessano, lascia pure vuoto.* · CTA **Aggiungi una misura**

**Costanza:** titolo **La tua costanza**

**Traguardi:** titolo **I tuoi traguardi**

**Empty:** *Ancora nessun dato. Fai un'analisi o un allenamento e qui vedrai i tuoi progressi.*

---

## COMMUNITY

- Titolo: **Community**
- Sottotitolo: *Cosa stanno facendo gli altri.*
- Tipi post (badge): *Allenamento* · *Traguardo* · *Foto progressi* · *Sfida*
- Empty: *Ancora niente qui. Torna presto.*
- CTA: **Carica altri**

---

## PROFILO

- Titolo: **Profilo**
- Testata: nome · *[età] anni · [dove si allena] · [n] sessioni a settimana* · CTA **Modifica**

**Sezioni (voci):**
- **Dati e obiettivi** — *Il tuo obiettivo e i tuoi dati fisici.*
- **Impostazioni** — voci: *Lingua* · *Unità di misura* · *Promemoria* · *Tema*
- **Abbonamento** — *Il tuo piano e la gestione.*
- **Documenti** — *Carica la scheda del tuo trainer o nutrizionista: adattiamo i tuoi piani.* · nota *Solo file di allenamento o nutrizione.* · CTA **Carica documento**
- **Note mediche** — *Hai condizioni di cui tenere conto? Scrivicele qui (facoltativo). Le useremo solo per rendere l'allenamento più adatto a te.* · nota *Bastano poche parole: non inserire referti medici.*
- **Privacy e dati** — *I tuoi video restano tuoi.* · **Gestisci i video** · **Elimina tutti i video** · **Esporta i miei dati** · **Elimina account**
- **Guida** — vedi sotto
- **Esci**

**Modifica dati:** *Nome* · *Età* · *Peso (kg)* · *Altezza (cm)* · CTA **Salva** / **Salvato**

**Visibilità profilo:** *Pubblico* / *Privato* · desc *Scegli se altri possono vedere il tuo profilo nella community.*

**Elimina account:** *Questa azione è definitiva.* · conferma *Scrivi ELIMINA per confermare.* · CTA **Elimina il mio account** / **Annulla**

### Guida — Come funziona Motion Insight
- Titolo: **Come funziona Motion Insight**
- Intro: *Tutto quello che puoi fare, in breve.*
- Voci (domanda → risposta):
  - **Come faccio un'analisi?** — Vai su un esercizio, attiva l'analisi avanzata ed eseguilo per venti secondi davanti alla fotocamera. In un paio di minuti hai il tuo referto.
  - **Come leggo il punteggio?** — È da 0 a 100 e riassume tre analisi diverse del tuo movimento. Serve a capire a che punto sei, non a darti un voto.
  - **Come si esegue una sessione?** — Nella *Tua sessione* trovi gli esercizi del giorno. Premi *Esegui*; se vuoi il riscontro tecnico, attiva prima l'analisi avanzata.
  - **Come chiedo una revisione del piano?** — In fondo alla Sessione o al Piano nutrizionale: scrivi cosa vuoi cambiare e la invii a un professionista.
  - **Dove finiscono i miei video?** — Restano legati solo al tuo account, non li vede nessun altro e li elimini quando vuoi dal Profilo.

---

## NOTE per la fase codice
- Molte etichette esistono già in `src/content/copy.ts` (dashboard, allenamento, nutrizione, progressi, profilo): qui c'è la **versione finale** con cui allinearle, più le **stringhe nuove** (sessione unificata, flag analisi, piano nutrizionale abbinato, libreria estesa, note mediche, guida).
- Togliere ovunque i riferimenti all'**AI Coach** (incluso il blocco Premium).
- I testi con `[…]` sono **placeholder dinamici** (nome, numeri, date) riempiti dal sistema.
