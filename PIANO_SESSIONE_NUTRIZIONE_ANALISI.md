# Piano di lavoro — Sessione, Nutrizione, Flusso analisi esercizio

**Data:** 2026-08-14
**Stato:** proposta, in attesa di conferma priorità prima di iniziare l'implementazione
**Perché questo documento esiste:** l'utente ha chiesto una ristrutturazione di tre aree correlate (area
Sessione, area Nutrizione, flusso di esecuzione/analisi esercizio) e un piano scritto — sia lato codice
sia lato design — prima di toccare il codice, data la dimensione del lavoro.

---

## 0. Scoperta chiave dall'audit (perché questo non è un lavoro piccolo)

Il flusso di **esecuzione sessione allenamento** (`/allenamento/[id]/sessione`) e il flusso di **analisi
video AI** (`/analisi/sessione`) sono oggi **due sistemi paralleli scollegati**:

- La sessione allenamento è un flusso automatico a fasi (esercizio → riposo → esercizio successivo →
  fine), senza camera né analisi integrata. Il tasto "Analisi avanzata" per esercizio, se attivato, **porta
  via** l'utente verso `/analisi/sessione` — un flusso a parte, che poi non torna alla sessione.
- Nello schema del database, `AnalysisSession` (l'analisi video) **non ha alcun collegamento** a
  `WorkoutSession`/`WorkoutSessionExercise` (la sessione di allenamento). Quindi oggi è tecnicamente
  impossibile chiedere "per la sessione di allenamento di martedì, che feedback ho ricevuto sul terzo
  esercizio" — quel dato non esiste come relazione.

Di conseguenza, il flusso che l'utente descrive (un'unica esperienza guidata: piano del giorno → clicca
esercizio → 2 video PT + info → inizia → countdown → camera → analisi → correzioni mostrate lì →
prossimo esercizio → recap finale con analisi → storico consultabile) **richiede sia una modifica di
schema (additiva, sicura) sia una riscrittura del flusso UI**, non solo riorganizzazione visiva.

---

## 1. Area "La tua sessione" — struttura proposta

### 1a. Header: calendario settimanale
Riga di 7 giorni (Lun-Dom) in alto. Ogni giorno mostra:
- Un indicatore se quel giorno ha una sessione pianificata (dal piano attivo, ciclato sulla settimana)
- Stato: fatto (spunta) / oggi (evidenziato) / da fare / riposo
- Click su un giorno passato → apre il recap di quella sessione (se fatta) o resta neutro (se non
  ancora accaduto, il piano è ciclico non calendarizzato per data — vedi nota sotto)

**Nota tecnica:** il piano (`WorkoutPlanDay`) è un **template settimanale ricorrente**, non un calendario
con date fisse per le 4-12 settimane. Il calendario quindi mostra "che giorno della settimana tocca quale
allenamento", non uno storico letterale immutabile — è coerente con come i dati sono modellati oggi, non
richiede di inventare un calendario a date fisse.

### 1b. Pannello "Sessione di oggi"
Sotto il calendario, un pannello unico e prominente:
- Nome del giorno/allenamento di oggi (o "giorno di riposo")
- Elenco esercizi **in ordine**, ciascuno cliccabile, con anteprima: serie × ripetizioni, riposo tra
  serie, carico (se impostato), gruppo muscolare
- Un bottone unico "Inizia la tua sessione" che avvia il flusso guidato (vedi sezione 3)
- Click su un singolo esercizio prima di iniziare → espande i dettagli (non uno start isolato,
  coerente con "cliccando ci si entra dentro e si ha molto più organizzato")

### 1c. Sezioni sotto (proposta mia, come richiesto "valuta tu")
- **Heatmap corpo** con dati aggregati delle analisi (già esiste come componente `AdaptiveBodyMap`,
  oggi confinato nella pagina piano — la porto qui)
- **Riepilogo settimana precedente**: sessioni fatte/pianificate, volume totale, streak
- **Ultimi feedback/analisi ricevuti** (nuova sezione, vedi 3d) — punteggio e correzione principale
  per gli ultimi 3-5 esercizi analizzati, con link al report completo
- Card "Sessioni recenti" e "Prossimo allenamento" già costruite in questa sessione di lavoro restano,
  riposizionate dentro questa nuova struttura invece che separate

---

## 2. Area "Nutrizione" — struttura proposta

Oggi ci sono 3 fonti di piano sovrapposte senza gerarchia (pool admin, generatore AI, log manuale).
Nuova struttura, dall'alto:

### 2a. Piano attivo (uno solo, in cima)
Logica di priorità:
1. Se l'utente ha collegato un piano di un professionista privato (nuova funzionalità — vedi 2d) → quello
2. Altrimenti, se ha un piano generato dal quiz/AI → quello
3. Altrimenti, il match dal pool admin (quello che c'è oggi come `NutritionMatchCard`)
Mostrato in modo strutturato giorno per giorno (riuso del componente `MealRow` già esistente in
`AiNutritionPlan.tsx`, che è già ben fatto — lo estendo anche al piano pool, oggi testo libero).

### 2b. Log pasti con calcolo automatico (esiste già, resta dov'è)
La funzionalità di inserire un alimento con grammatura e vedere le kcal calcolate e sommate **esiste già**
(`/nutrizione`, form "Aggiungi alimento" + totali macro in alto) — nessuna modifica funzionale necessaria
qui, solo riposizionamento sotto il piano attivo nella nuova gerarchia.

### 2c. Ricette
`RecipesCard` esiste già in fondo alla pagina. Da verificare/estendere: che mostri sia le ricette in
linea con il piano attivo dell'utente, sia un più ampio "prendi spunto" (probabilmente già fa questo,
da controllare nel dettaglio in fase di implementazione).

### 2d. Piano di un professionista privato — priorità sul piano AI (chiarito con l'utente 14/08)
Non serve una feature di upload nuova: l'infrastruttura **esiste già** — l'utente può caricare un
documento (PDF/immagine) nella sezione "Documenti" del Profilo, con tipo Allenamento o Nutrizione
(`UserDocument`, `DocumentsCard.tsx`), e già lo si può far analizzare dall'AI (sintesi + aggiustamenti).

Cosa manca: **la logica di priorità**. Oggi quell'analisi resta confinata nel Profilo e non influenza
cosa viene mostrato come "piano attivo" su `/nutrizione` (né su `/allenamento`). Da implementare:

- **Nutrizione**: priorità 1 = documento NUTRITION analizzato (se presente) → mostrato in cima come
  piano attivo (nome file, link al documento, sintesi/aggiustamenti dall'AI); priorità 2 = piano AI
  generato dal quiz (`User.nutritionPlanJson` — **scoperta aggiuntiva**: questo campo viene già scritto
  quando l'utente genera un piano AI, ma la pagina non lo rilegge al caricamento, quindi oggi sparisce
  al refresh — bug da correggere insieme); priorità 3 = match dal pool admin (quello di oggi).
- **Allenamento**: stessa logica, documento FITNESS analizzato ha priorità se presente (da applicare
  quando si lavora sull'area Sessione, fase 6-7).
- Se l'utente non carica nulla, tutto resta come oggi (piano del quiz).

---

## 3. Flusso di esecuzione esercizio (analisi) — struttura proposta

Questo è il pezzo più grande, perché unifica due flussi oggi separati.

### 3a. Schema DB (modifica additiva, sicura — nessuna perdita dati)
Aggiungere a `AnalysisSession`: `workoutSessionId String?` e `workoutSessionExerciseId String?`
(entrambi opzionali, relazione facoltativa) — collega un'analisi video alla specifica sessione di
allenamento e al preciso esercizio di quella sessione. Questo sblocca lo storico per-esercizio (3e) e il
recap con analisi (3d).

### 3b. Dentro un esercizio (schermata singola, non due flussi)
- Due video di riferimento affiancati/impilati: esecuzione del professionista (`videoUrl`, già esiste)
  e spiegazione/consigli (`explanationVideoUrl`, **campo già presente nello schema ma oggi non mostrato
  nella schermata di registrazione** — solo un video dei due viene mostrato)
- Info esercizio (serie, ripetizioni, riposo, note)
- Bottone "Inizia allenamento"

### 3c. Registrazione
- Countdown: **il campo `recordingDurationSeconds` esiste già per esercizio nel database** (impostato
  dall'admin) ma la pagina di analisi usa oggi un valore fisso a 15 secondi, ignorandolo — è un bug da
  correggere, non una feature da costruire da zero
- Switch camera anteriore/posteriore: non esiste, va aggiunto (richiede `facingMode` su `getUserMedia`)
- Vista camera live durante l'esecuzione: **esiste già**

### 3d. Dopo l'esercizio
- Analisi e correzioni mostrate **nella stessa schermata**, non su una pagina separata raggiunta con
  redirect (oggi porta a `/analisi/report/[id]`, una pagina a parte) — il contenuto ricco che c'è già lì
  (punteggio, punti forza, aree miglioramento, confronto video) va riportato inline nel flusso
- Bottone "Esercizio successivo" che avanza nella sessione (oggi l'avanzamento della sessione e
  l'analisi sono due sistemi che non si parlano)
- A fine sessione: recap con TUTTI gli esercizi fatti e il relativo punteggio/feedback (oggi il recap
  esiste ma mostra solo durata/volume, zero dati di analisi)

### 3e. Storico feedback per esercizio (nuovo, richiede 3a)
Aprendo una sessione passata, per ogni esercizio fatto si può vedere il feedback ricevuto in quel momento
— oggi impossibile perché manca il collegamento nello schema (3a lo sblocca).

---

## 4. Fasi di lavoro proposte (ordine consigliato)

| Fase | Contenuto | Rischio/dimensione | Dipende da |
|---|---|---|---|
| **1** | Schema: link `AnalysisSession` ↔ `WorkoutSession`/`WorkoutSessionExercise` | Piccolo, additivo, sicuro | — |
| **2** | Fix countdown non configurabile (usa `recordingDurationSeconds` reale) + secondo video PT nella schermata registrazione | Piccolo | — |
| **3** | Unificare il flusso: analisi dentro la sessione allenamento invece che redirect esterno; risultato mostrato inline; bottone "prossimo esercizio" reale | Grande — riscrittura di `ExerciseView`/`RestView`/flusso analisi | Fase 1, 2 |
| **4** | Recap fine sessione con dati di analisi per ogni esercizio | Medio | Fase 1, 3 |
| **5** | Storico feedback per esercizio su sessioni passate | Medio | Fase 1 |
| **6** | Calendario settimanale + pannello "sessione di oggi" su `/allenamento` | Medio | Nessuna (indipendente, si può fare in parallelo) |
| **7** | Sezioni heatmap/riepilogo/ultimi feedback su `/allenamento` | Piccolo-medio | Fase 5 (per "ultimi feedback") |
| **8** | Nutrizione: gerarchia piano attivo → log → ricette | Piccolo-medio | — |
| **9** | Nutrizione: collegare piano professionista privato | Medio, feature nuova | — |
| **10** | Switch camera anteriore/posteriore | Piccolo | — |

Le fasi 6-10 sono indipendenti tra loro e dalla 1-5: si possono fare in qualsiasi ordine o in parallelo.
Le fasi 1-5 sono in sequenza perché ciascuna si appoggia sulla precedente.

---

## 5bis. Lavoro "inline" (rimandato dalla Fase 3, completato 15/08)

Prima: dopo la registrazione, l'utente veniva reindirizzato a `/analisi/report/[id]`, una pagina
separata — l'analisi "usciva" dalla sessione anche solo visivamente, per poi tornare con un click.

Ora: il risultato (punteggio, tecnica ricostruita, correzioni, confronto video) si mostra **nella
stessa schermata di registrazione**, senza redirect. Refactor fatto:
- Estratto il corpo del report in `AnalysisReportContent` (componente condiviso) e i bottoni finali
  in `AnalysisReportActions` — usati sia dalla pagina standalone `/analisi/report/[id]` (che resta
  raggiungibile com'era, per i link da "Ultimi feedback" ecc.) sia dal flusso inline.
- Nuovo endpoint `GET /api/analysis/[id]` per caricare i dati del report lato client.
- `/analisi/sessione` ha una nuova fase `RESULT`: a fine analisi, invece di `router.push` verso il
  report, i dati vengono caricati e mostrati lì, con lo stesso bottone "Torna alla sessione".

**Verifica**: la fotocamera è bloccata in questo ambiente di test (stesso limite della Fase 10), quindi
non ho potuto simulare la registrazione reale end-to-end. Ho verificato invece: `tsc`/`eslint` puliti;
l'endpoint `/api/analysis/[id]` risponde correttamente; la pagina report standalone (che usa gli
*stessi* componenti condivisi) renderizza identica a prima del refactor, comprese le due varianti
con e senza `wsReturn` — quindi il risultato nella fase inline userà la stessa UI verificata, cambia
solo che non c'è più un redirect di mezzo. Da confermare con una prova reale su un dispositivo con
fotocamera funzionante.

## 5. Decisioni confermate (14/08)

1. **Ordine**: seguo l'ordine del piano (fase 1-2, poi 3-5 a blocchi, poi 6-10).
2. **Fase 9** ridefinita e confermata: non è un upload nuovo, è logica di priorità sul documento già
   caricabile dal Profilo (vedi 2d aggiornato sopra). Da fare quando si arriva a Nutrizione/Sessione
   nell'ordine.
3. **Fase 3**: si procede a blocchi verificabili — implemento un pezzo, lo testo dal vivo con dati
   reali, riporto, poi il pezzo successivo. Non tutto insieme.

## 6. Stato avanzamento

- [x] Fase 1 — schema: link AnalysisSession ↔ WorkoutSession/WorkoutSessionExercise (14/08, `prisma db push` applicato)
- [x] Fase 2 — secondo video PT in registrazione, con tab Esecuzione/Spiegazione + note professionista mostrate (14/08, testato dal vivo).
      **Nota corretta in corsa d'opera:** il countdown pre-registrazione (15s fisso) non era un bug —
      non esiste un campo admin dedicato al countdown, è una scelta di prodotto fissa. `recordingDurationSeconds`
      era già usato correttamente per la durata di REGISTRAZIONE (non il countdown), quindi nessun fix necessario lì.
- [x] Fase 3 (blocco 1) — collegamento reale sessione↔analisi (14/08, testato dal vivo):
      1. `AnalysisSession` creata dal flusso "Analisi avanzata" dentro la sessione ora si collega
         davvero alla `WorkoutSession` (verificato in DB).
      2. Il report, se raggiunto dalla sessione guidata, mostra "Torna alla sessione" come CTA
         primaria (invece delle CTA generiche scollegate di prima).
      3. **Persistenza del progresso** (necessaria per far funzionare il ritorno): la sessione
         guidata salva il progresso in sessionStorage ad ogni serie completata. Prima di questo
         fix, uscire per un'analisi e tornare avrebbe fatto ripartire la sessione da zero
         (bug scoperto durante l'implementazione, non nel piano originale — risolto insieme).
      **Non ancora fatto (prossimi blocchi):** l'analisi resta su una pagina/route separata invece
      di essere "sempre nella stessa sezione" come richiesto — il report ora riporta indietro con
      un click, ma tecnicamente è ancora una navigazione, non uno stato inline della stessa schermata.
- [x] Fase 4 — recap fine sessione con dati analisi (14/08, testato dal vivo): nuovo endpoint
      `GET /api/workout-sessions/[id]/analyses`, sezione "Analisi di questa sessione" in `CompletedView`
      con esercizio, correzione principale e punteggio per ogni analisi fatta durante quella sessione,
      cliccabile per aprire il report completo.
- [x] Fase 5 — storico feedback per esercizio (14/08, testato dal vivo): nuova pagina
      `/allenamento/sessioni/[id]` che mostra, per ogni esercizio di una sessione passata, le serie
      fatte e — se quell'esercizio è stato analizzato — punteggio + correzione principale, con link
      al report completo. Collegata dalle liste "Sessioni recenti" (`/allenamento`) e "Sessioni
      completate in questo piano" (`/allenamento/[id]`), entrambe ora cliccabili.
- [x] Fase 6 — calendario settimanale (15/08, testato dal vivo): striscia Lun-Dom in cima a
      `/allenamento`, sopra il piano attivo. **Nota importante scoperta implementando:** il piano
      NON è ancorato a giorni reali della settimana — è un ciclo ricorrente (`dayNumber` 1..N,
      N = allenamenti/settimana, nessun giorno di riposo esplicito a riempire fino a 7 salvo
      inseriti manualmente). Il calendario quindi **distribuisce** gli N giorni sui 7 slot della
      settimana in modo equidistante (es. 3x/sett → Lun/Mer/Ven) come indicazione visiva, non come
      calendario reale con date fisse — coerente con come "prossimo allenamento" già funziona
      (basato sull'ultima sessione completata, non sul giorno della settimana). Un giorno diventa
      spuntato/cliccabile (→ recap sessione) se c'è una `WorkoutSession` completata questa
      settimana per quel `planDayId`.
      **Non incluso in questo blocco** (già ampiamente coperto altrove, per non duplicare):
      il "pannello sessione di oggi" con elenco esercizi dettagliato — esiste già come
      `ActiveSessionBlock` (sotto il calendario) + pagina piano dettaglio con "Prossimo allenamento".
- [x] Fase 7 — heatmap/riepilogo/ultimi feedback su Sessione (15/08, testato dal vivo): 3 nuove
      card su `/allenamento` sotto il piano attivo — "Questa settimana" (allenamenti fatti/pianificati,
      kg sollevati, streak — riusa `completed-this-week` di Fase 6 + `/api/profilo`), "Ultimi feedback"
      (nuovo endpoint `/api/me/recent-analyses`, ultime 5 analisi con punteggio/correzione, cliccabili),
      "Equilibrio muscolare" (riusa `AdaptiveBodyMap` + `/api/me/body-map?mode=balance`, già esistente
      ma prima confinato alla pagina piano — ora visibile anche qui).
- [x] Fase 8 — nutrizione: gerarchia piano attivo (15/08, testato dal vivo):
      1. **Bug corretto**: il piano AI generato veniva salvato (`User.nutritionPlanJson`) ma non
         riletto al caricamento pagina — spariva dal refresh. Ora `/api/profilo` lo restituisce e
         `/nutrizione` lo ripristina.
      2. **Gerarchia**: ora è visibile un solo "piano attivo" — piano AI se presente, altrimenti
         il match dal pool admin (non più entrambi sovrapposti senza ordine). Verificato dal vivo:
         con piano AI salvato, il piano del pool sparisce automaticamente.
      3. Log pasti (con calcolo automatico kcal) e Ricette restano dove erano, sotto il piano attivo
         — erano già completi, nessuna modifica funzionale necessaria.
      **Fase 9** (priorità al documento professionista caricato) resta da fare a parte.
- [x] Fase 9 — priorità al documento professionista caricato (15/08, testato dal vivo):
      - **Nutrizione**: se esiste un documento NUTRITION analizzato (Profilo → Documenti), sostituisce
        del tutto AI/pool come "piano attivo" — priorità massima confermata dal vivo.
      - **Allenamento**: qui la situazione è diversa e l'ho gestita di conseguenza — un documento
        FITNESS caricato è testo libero analizzato dall'AI (sintesi + consigli), NON dati strutturati
        in giorni/esercizi come richiede il motore della sessione guidata (calendario, "prossimo
        allenamento", bottone Inizia). Non può quindi "sostituire" il piano strutturato senza una
        feature molto più grande (trasformare un PDF in un piano vero, fuori scope). Ho invece
        aggiunto una card "Indicazioni dal tuo professionista" in cima a `/allenamento`, sempre
        visibile (anche senza piano attivo), con gli aggiustamenti e gli avvisi dal documento —
        il piano allenamenti strutturato resta quello impostato, con queste indicazioni accanto.
- [x] Fase 10 — switch camera anteriore/posteriore (15/08): `useCamera` ora espone `facingMode`,
      `canSwitchCamera` (true solo se il dispositivo ha più di una fotocamera — rilevato via
      `enumerateDevices()`) e `switchCamera()`. Bottone dedicato in `RecordingStage` (visibile solo
      con più fotocamere disponibili, nascosto durante la registrazione). **Verifica limitata:**
      l'ambiente di test ha una sola fotocamera virtuale, quindi ho potuto verificare tsc/eslint puliti,
      il flusso non rotto, e la corretta *assenza* del bottone su singola fotocamera — non ho potuto
      testare lo switch effettivo tra due fotocamere reali (serve un dispositivo mobile vero).
