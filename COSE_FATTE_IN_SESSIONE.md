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

## Sessione 9 — 2026-08-17 — Fix rapidi + copy IA + 4 iniziative grandi da "Aggiornameni possibili.md" (1,2,3,4,8)

**Contesto:** proseguimento di `Aggiornameni possibili.md`. Prima i punti "chiari" (fix rapidi), poi
le 5 iniziative segnalate come grandi in Sessione 8, affrontate una per una col via libera esplicito
dell'utente per ciascuna.

**Fix rapidi (punti 5, 6, 10):**
- **Bug reale trovato, più esteso del previsto**: la variabile `--organic-sand` (pensata come sfondo
  scuro per le "sezioni alternate") veniva riusata anche come **colore del testo** su schede scure →
  testo invisibile non solo nella CTA finale della home (segnalata dall'utente) ma anche nel footer
  (titoli colonne), nella `FormScoreHero` della dashboard (nome esercizio, statistiche) e nei
  contatori grandi della dashboard (sessioni/streak/punti). Corretto in 6 file usando il vero token
  "testo chiaro" del tema (`--foreground`).
- **CTA sticky** (`StickyAnalyzeCta.tsx`): appare sotto la nav mentre si scorre tra la CTA dell'hero e
  quella finale, si nasconde vicino a entrambe (IntersectionObserver). Non verificabile visivamente in
  questo pannello browser (stesso limite ambientale già noto per scroll/animazioni), verificata la
  logica via calcolo posizioni.
- **Nav "Scarica l'app"**: link aggiunto in nav desktop accanto ad "Accedi" (mancava, solo in footer).
  Pagina `/scarica` ampliata: 4 vantaggi PWA + sezione "perché dal browser e non da App Store/Play
  Store" (fase di test).
- **Layout Nutrizione**: container allargato da `max-w-2xl` a `max-w-4xl` (causa della "metà pagina
  vuota" segnalata); form "nuovo alimento" reso sempre visibile invece che dietro il bottone
  "Aggiungi" (toggle nascosto rimosso).

**Copy — via "IA/AI" dai bottoni (punto 7):** chiarito con l'utente (2 domande mirate): togliere del
tutto "IA/AI" da CTA/bottoni/badge/checkbox, lasciarlo nei testi esplicativi (pagina "Analisi AI in
tempo reale", disclaimer, terminologia interna Admin). Rimosso da 13 etichette azione (copy.ts +
badge hardcoded in `allenamento/page.tsx`), lasciato intatto altrove (nome prodotto "AI Coach",
pricing feature list, meta title, disclaimer di trasparenza).

**Demo (punto 9):** simulazione dal vivo di "La tua sessione" con account di test (creato e poi
eliminato): calendario → piano → giorno → sessione guidata, tutto corrisponde a quanto descritto
dall'utente. Nessuna modifica al codice, solo verifica.

**Punto 1 — Prova gratuita per ospiti** (`/prova-gratuita`): nuovo flusso pubblico senza account —
consenso privacy separato (fotocamera / elaborazione video / contatto email), selezione esercizio tra
quelli curati da Admin (`Exercise.availableForFreeTrial`, nuovo campo), registrazione, **stessa
pipeline di analisi a 3 livelli (L1+L2+L3) usata dai Premium** (routes `/api/guest-analysis/*`
mirror di `/api/analysis/*`, riusano gli stessi services), referto inviato via email (Resend, nuovo
template) + anteprima punteggio a schermo con CTA "crea account". Nuovo modello
`GuestAnalysisRequest`. **Correzione importante fatta in corsa**: il limite anti-abuso iniziale
(3/giorno per IP) era troppo restrittivo secondo l'utente — ridisegnato in due limiti separati: i
*tentativi di registrazione* sono ora praticamente illimitati per un umano (20/giorno per IP, blocca
solo script), mentre il vero limite è **una sola analisi completata per email, a vita** (non al
giorno), verificato via query DB prima di eseguire la pipeline costosa. Il bottone "Analizza la tua
tecnica"/"Prova con la tua prima esecuzione" (hero, CTA finale home, sticky, chiusura "Il Metodo") ora
punta a `/prova-gratuita` invece che al quiz — **copy dei bottoni non toccato**, solo l'href, come
richiesto esplicitamente. Il quiz resta intatto per il funnel Premium.

**Punto 2 — Personaggio 2D animato**: sostituito lo sticker a linee scheletriche (`ExerciseFormPlayer`)
con un nuovo `AnimatedFormCharacter` — stesso motore di pose/interpolazione, ma corpo pieno a capsule
arrotondate (maglietta, pantaloncini, scarpe, volto semplice, fascia colorata brand). Mostrato
all'utente come esempio via widget SVG prima di applicarlo. L'utente ha poi chiesto il **3D**: non
generabile da codice — dategli 4 opzioni (DeepMotion consigliato: converte un video reale in
animazione 3D via AI motion-capture; Mixamo gratuito; freelance su commissione; Spline no-code) più
il piano di integrazione (React Three Fiber) per quando l'asset sarà procurato. Il 2D resta attivo nel
frattempo, netto miglioramento rispetto allo sticker originale.

**Punto 4 — Carosello esempi report**: la card statica "cosa ricevi" nella home sostituita da
`ReportCardCarousel` — 3 esempi reali (punteggio alto/medio/basso, rischi diversi) che ruotano ogni
~5s con indicatori cliccabili.

**Punto 3 — Editor "designer" per l'Admin** (versione scalata, concordata esplicitamente con
l'utente): nuovo `SiteEditModeProvider` + `EditableText` — bottone flottante "Modifica pagina"
visibile solo agli admin sul sito pubblico (verifica riusa l'endpoint admin già esistente, nessun
nuovo controllo d'accesso da mantenere); quando attivo, ogni testo avvolto in `EditableText` diventa
cliccabile → modale (in portale React, per evitare HTML non valido quando il testo è dentro un
bottone) → textarea → salva → **live immediato**, persistito su `SiteContent` (sistema già esistente,
prima usato solo dal form admin separato). Applicato oggi alla pagina Prezzi (15 testi). Verificato
dal vivo con account admin di test: modifica salvata, persiste dopo reload, poi ripristinata e
account eliminato. Estendere alle altre pagine richiede lo stesso trattamento in due passaggi
(migrare a `useCopy()` + avvolgere in `EditableText`), meccanico ma da fare pagina per pagina — non
fatto oggi per scelta di scope.

**Punto 8 — Gamification** (versione scalata): classifica (`/leaderboard`, nuova voce in nav) basata
su `User.totalPoints` (già esistente) filtrato per `profileVisibility=PUBLIC` (**riusa il flag
privacy già esistente della Community come opt-in**, nessun nuovo campo di consenso necessario);
nuovo modello `LeaderboardReward` (fascia di posizione → titolo/descrizione) con CRUD completo in
Admin (`/admin/leaderboard-rewards`); sezione informativa breve nella home. Verificato dal vivo:
account di test promosso admin, punti assegnati via DB, premio creato da Admin, classifica e premio
mostrati correttamente lato utente, poi tutto ripulito.

**Verifica:** `tsc --noEmit` e `eslint` puliti (0 errori, solo warning dello stesso pattern
preesistente già tollerato) su tutto il lavoro della sessione. Ogni feature con backend/DB testata
dal vivo con account usa-e-getta (creati e cancellati subito dopo). Migrazioni DB (`GuestAnalysisRequest`,
`LeaderboardReward`, `Exercise.availableForFreeTrial`) applicate al DB condiviso locale/produzione;
il pooler diretto 5432 è risultato di nuovo instabile per `prisma db push` in un caso — bypassato con
SQL diretto via pooler 6543 (stesso workaround già documentato in sessioni precedenti).

**Stato a fine sessione:** tutto il lavoro sopra committato e pushato su `main` in questa sessione
(vedi hash commit più sotto in `git log`).

---

## Sessione 8 — 2026-08-15 — Fix login/quiz + 4 richieste da "Aggiornameni possibili.md" (1,3,5,8)

**Contesto:** proseguimento diretto della Sessione 7. Prima richiesta: sistemare login/logout e
verificare a fondo tutti i flussi principali (quiz, allenamento, libreria, analisi) navigando l'app
come farebbe un utente vero. Poi l'utente ha scritto `Aggiornameni possibili.md` con 8 punti di
feedback sull'area utente, chiedendo di agire su quelli chiari.

**Verifica flussi (prima del feedback):**
- **Bug reale trovato e corretto**: email non normalizzata (case-sensitive) in login/registrazione/
  recupero password → due account duplicati per lo stesso indirizzo con maiuscole diverse, causa dei
  "password errata" ricorrenti. Corretto in `auth.ts`, `register`, `login-hint`, `forgot-password`.
- **Google ↔ email/password**: aggiunto `allowDangerousEmailAccountLinking` (sicuro, Google verifica
  l'email) + guardia esplicita su `email_verified`, così lo stesso indirizzo email accede allo stesso
  account indipendentemente dal metodo.
- **Bug grave trovato e corretto**: il wizard onboarding step1-3 per un utente già loggato finiva
  sempre sulla pagina di anteprima per ospiti (`/onboarding/piano`), il cui bottone puntava sempre a
  `/registrati` — rimbalzava un utente già registrato alla schermata di creazione account invece di
  generare/salvare il piano. Corretto: la pagina ora riconosce la sessione attiva e va a step4.
- **Bug trovato**: filtro `muscolo`/`difficolta`/`attrezzatura` non valido nella query string della
  Libreria mandava in crash l'intera pagina (Prisma rifiuta valori fuori enum) invece di ignorarlo.
  Corretto con validazione prima della query.
- Verificata l'intera navigazione area utente (7 sezioni) + sito marketing, nessun altro problema.
- Confermato (limite ambientale, non bug): analisi video richiede fotocamera reale, non testabile in
  questo ambiente; upload di un video esterno non è una funzionalità esistente nel prodotto (solo
  registrazione live, i trigger dipendono da pose-landmark calcolati in tempo reale nel browser).

**Punto 1 — Pagina esercizio ridisegnata** (`/esercizi/[slug]` + nuovo `ExerciseStartAction.tsx`):
due video affiancati (Spiegazione/Esecuzione) invece di uno sopra l'altro, parametri biomeccanici
(range angolari) **tolti dalla vista utente** (restano in Admin), note del professionista unite alle
istruzioni, vecchio bottone "Attiva analisi avanzata" sostituito da checkbox + bottone unico "Inizia
esercizio" (nascosto se la checkbox è spenta, con nota che si esegue senza registrazione). Bonus
trovato e corretto: le percentuali del report analisi erano hardcoded sbagliate (34/33/33 invece di
50/30/20 reali da `weights.ts`).

**Punto 2 (dashboard) — bug corretto**: `computeImbalances` in `body-map.ts` restituiva un finto
"100% deficit su ogni muscolo" quando l'utente non aveva mai allenato nulla, invece di nessuno
squilibrio. Corretto (torna `[]`), copy dashboard distingue ora "nessun dato" da "buon equilibrio".

**Punto 3 — Database alimenti**: nuovo modello `Food` (Prisma, applicato al DB), 142 alimenti
caricati da un dataset curato standard (`prisma/seed-foods-data.ts` + `seed-foods.ts`), endpoint
`/api/foods/search`, form "Nuovo alimento" in Nutrizione sostituito da ricerca alimento + sola
grammatura con calcolo automatico macro (`FoodSearchAutocomplete.tsx`), nuova sezione Admin →
Alimenti (CRUD, `/admin/foods` + `AdminFoodsManager.tsx`). Bonus: bottone "+ Aggiungi" che sembrava
non fare nulla → ora scrolla al form (appare sotto piano attivo/calendario, fuori dal viewport).

**Punto 6 — Community**: sostituita con placeholder "Community in arrivo" (`COMMUNITY_COMING_SOON`
flag), codice della feed reale lasciato intatto per riattivarla in futuro.

**Punto 8 — Admin**: testo inglese in Abbonamenti (filtri stato, badge) tradotto in italiano; click
sulla riga in Esercizi apre direttamente il dettaglio; **editor trigger biomeccanici guidato**
(`TriggerSpecEditor.tsx`) sostituisce la textarea JSON grezza — menu chiuso sulle 9 uniche
articolazioni che il motore di analisi comprende davvero (`SPEC_JOINTS`), fasi/condizioni/gravità
tradotte, verificato dal vivo che il round-trip (carica→salva senza modifiche) non perde dati
esistenti (testato su Squat: 4 movimenti/8 regole invariati).

**Punto 5 — Progressi ristrutturato**: "Qualità dei movimenti" ora in stile dashboard (gauge ultima
analisi + trend + mappa equilibrio muscolare, stessi dati/componente della dashboard) + nuovo grafico
"Punteggio medio per esercizio". Bug corretto: il grafico "Andamento minuti" leggeva un campo
(`totalDuration`) che non esisteva mai nella risposta API (il campo reale è `totalSeconds`) → sempre 0.

**Non fatto (rimandato/da chiarire):**
- Punto 4 (Libreria: macro-filtri + pulsante "altri filtri", rimuovere un'icona che l'utente descrive
  ma che non risulta presente nel codice attuale — da chiarire cosa intende).
- Punto 7 (Profilo: sezione impostazioni lingua — tema chiaro/scuro rimandato, tema chiaro non esiste
  nel codice; i18n completo del copy discussa ma rimandata come iniziativa a parte, per costo/scope).
- Punto 8 residuo: costo AI "€0,06" in Admin → Utenti senza Anthropic attivo — da chiarire con l'utente
  cosa lo genera prima di poterlo giudicare bug o meno.

**Verifica:** ogni fix testato dal vivo con account di test usa-e-getta (creati e cancellati subito
dopo, incluso un caso di promozione temporanea ad admin via DB per testare l'editor trigger — mai
toccate le credenziali reali). `tsc --noEmit` ed `eslint` puliti su tutti i file ad ogni fix.
2 bug ambientali documentati (non prodotto): `scrollIntoView({behavior:"smooth"})` e le animazioni
`requestAnimationFrame` (CountUp/RadialGauge) non completano visivamente in questo pannello browser
automatizzato quando non è a schermo — confermato dati reali corretti via rete/DB in entrambi i casi.

**Stato a fine sessione:** tutto il lavoro sopra è ancora **non committato**, seduto sul working tree
di `main` (non su un branch separato stavolta). Il database Supabase è già aggiornato (schema Food +
142 alimenti), condiviso tra locale e produzione — solo il codice manca ancora al sito live.

---

## Sessione 7 — 2026-08-15 — Merge in main + deploy Vercel verificato + fix Upstash

**Contesto:** primo step lasciato aperto da Sessione 6: integrare `feature/mvp-launch-polish` (che
include già tutti i commit di `feature/account-manager-completo`, essendone discendente diretto) in
`main`, poi verificare lo stato reale del deploy Vercel già collegato (progetto **`fit-ai`**, team
`masterteam99s-projects`).

**Cosa è stato fatto:**

1. **Verifica pre-merge:** `tsc --noEmit` pulito, `eslint` 0 errori (37 warning preesistenti, non
   introdotti). Confermato via `git merge-base --is-ancestor` che `feature/mvp-launch-polish` contiene
   già tutto `feature/account-manager-completo` — un solo merge basta.
2. **PR + merge:** aperta [FitAI#2](https://github.com/Masterteam99/FitAI/pull/2)
   (`feature/mvp-launch-polish` → `main`), mergiata con merge commit `ee7e867` (11 commit, 121 file,
   +10871/-1099). `main` locale e remoto allineati.
3. **Deploy Vercel verificato via connettore MCP** (non tramite CLI locale, che aveva un problema di
   pacchetto rotto — `execa` mancante nel bundle npx — e comunque non autenticabile in sessione
   non-interattiva): il progetto **`fit-ai`** ha l'integrazione Git già attiva, quindi il push su
   `main` ha **già triggerato in automatico** il deploy production (`dpl_XeNqyy6WA21GbFkckivLTnKV49Jp`,
   commit `ee7e867`, `READY`). Verificato `/api/health` → 200, home → 200, zero runtime error nelle
   24h precedenti.
4. **Diagnosi Upstash Redis (bug reale trovato in produzione):** il vecchio database Upstash
   (`quiet-gazelle-99660`) risultava eliminato lato utente. Verificato con un test mirato — chiamata
   reale a `POST /api/auth/login-hint` (endpoint pubblico, rate-limited, nessun side-effect) +
   lettura runtime log — che il rate limiter falliva in fail-open con
   `[ratelimit:rl:auth-email] Upstash non raggiungibile, fail-open fetch failed` (comportamento
   corretto per design — l'app non si rompe — ma niente protezione anti-abuso reale).
5. **Fix:** l'utente ha creato un nuovo database Upstash (region vicina a `fra1`) e aggiornato
   `UPSTASH_REDIS_REST_URL`/`TOKEN` su Vercel, poi ha lanciato un redeploy manuale
   (`dpl_6acQfd57x5KvxWZ5oYByv6RmAksZ`). Riverificato con lo stesso test: **errore sparito**, log
   `[info]` pulito → Upstash riconnesso e rate limiting attivo in produzione.
6. **Confine rispettato:** non ho inserito né visto alcuna API key/token/credenziale — l'utente ha
   sempre agito lui stesso su Vercel/Upstash; io ho solo verificato lo stato con chiamate di sola
   lettura + un endpoint pubblico innocuo, e guidato passo-passo dove servivano credenziali.

**Residuo volontariamente lasciato aperto** (scelta esplicita dell'utente): **Anthropic** verrà
ricaricato/attivato solo all'ultimo prima del lancio — la env var `ANTHROPIC_API_KEY` risulta già
presente su Vercel da lavoro precedente, va solo il credito. **VAPID** (notifiche push) non ancora
verificato se impostato su Vercel — vedi `COSE_DA_FARE.md`.

**Stato a fine sessione:** `main` = stato di produzione, entrambi allineati. Deploy live e sano su
`fit-ai-six-ruddy.vercel.app` (+ alias). Upstash funzionante. Anthropic e VAPID da chiudere prima del
lancio pubblico.

---

## Sessione 6 — 2026-08-15 — MVP polish (fix Cowork) + piano Sessione/Nutrizione/Analisi (10 fasi)

**Contesto:** ricevuti documenti da Claude Cowork con una roadmap MVP (scritta per un'app HTML/JS
vanilla generica, non per questo codebase React/Next). Audit ha mostrato che gran parte era già
implementata meglio del previsto. Poi l'utente ha chiesto miglioramenti mirati sull'area "La tua
sessione", "Nutrizione" e sul flusso di analisi video, con piano scritto prima del codice. Lavorato
tutto sul branch **`feature/mvp-launch-polish`** (da `feature/account-manager-completo`).

### Parte 1 — Fix MVP polish (audit-first, solo gap reali)
1. **Toast coverage**: `UsersTable.tsx` usava `alert()` sugli errori, nessun feedback sui successi →
   sostituito col sistema toast esistente, con conferma anche sui successi.
2. **Validazione form admin**: estesa a 4 form (Esercizi, Ricette, Pool nutrizionale, Template
   allenamento) — zod + errori inline per campo, prima solo un gate booleano sul submit.
3. **Cambio email/password**: non esisteva nessuna UI per farlo dal Profilo — creati endpoint
   (`/api/account/change-email`, `/api/account/change-password`) + 2 sezioni Profilo, con notifica
   email di sicurezza.
4. **Sistema notifiche da zero**: nessuna infrastruttura di invio esisteva. Costruiti: modello
   `PushSubscription`, campi `User.notifyEmailReminders/notifyPush` (schema additivo), VAPID keys,
   service worker con `push`/`notificationclick`, cron giornaliero (`vercel.json` → `/api/cron/reminders`)
   che avvisa via email+push chi ha uno streak a rischio, sezione preferenze in Profilo.
5. **Cosmetici responsive**: griglie fisse 3/4 colonne rotte su mobile, sistemate in vari punti admin.
6. **Libreria esercizi**: filtro attrezzatura era importato ma mai collegato (dead code) — attivato;
   combinare più filtri insieme non funzionava (si sovrascrivevano) — corretto con `buildHref()`.

Verificato tutto con `tsc`/`eslint` puliti + test dal vivo nel browser con utenti/dati reali (creati e
rimossi ad ogni test).

### Parte 2 — Prototipo di design (artifact)
Su richiesta di valutazione UX/fitness: pubblicato un artifact con due concept (card "prossimo
allenamento" in evidenza su Sessione, gerarchia CTA landing) — usato per allineare le decisioni prima
di toccare il codice reale, non implementato direttamente.

### Parte 3 — Piano Sessione/Nutrizione/Analisi (10 fasi, tutte chiuse)

**Scoperta chiave:** il flusso "sessione allenamento" e il flusso "analisi video AI" erano due sistemi
completamente scollegati (nessun FK nello schema, navigazione che portava via l'utente senza ritorno).

- **Fase 1** — schema: link `AnalysisSession` ↔ `WorkoutSession`/`WorkoutSessionExercise` (additivo).
- **Fase 2** — secondo video PT (tab Esecuzione/Spiegazione) + note professionista mostrate (prima nel
  DB ma mai renderizzate). Countdown 15s verificato NON essere un bug (nessun campo lo rende
  configurabile, `recordingDurationSeconds` già usato correttamente per la registrazione).
- **Fase 3** — collegamento reale sessione↔analisi: l'AnalysisSession creata durante la sessione
  guidata ora si lega davvero al `workoutSessionId`; report con CTA "Torna alla sessione". **Bug
  scoperto e risolto in corsa**: uscire per un'analisi e tornare faceva ripartire la sessione da zero —
  aggiunta persistenza del progresso in `sessionStorage` (`useWorkoutSession.ts`).
- **Fase 4** — recap fine sessione (`CompletedView.tsx`) ora mostra punteggio+correzione per ogni
  esercizio analizzato (nuovo endpoint `/api/workout-sessions/[id]/analyses`), prima solo durata/set.
- **Fase 5** — nuova pagina `/allenamento/sessioni/[id]`: storico di una sessione passata con feedback
  per esercizio. Collegata da "Sessioni recenti" e "Sessioni completate in questo piano" (ora cliccabili).
- **Fase 6** — calendario settimanale (`WeeklyCalendarStrip.tsx`) su `/allenamento`. Scoperto che il
  piano è un ciclo ricorrente non ancorato a giorni reali → distribuzione equidistante sui 7 giorni
  come guida visiva, coerente con la logica "prossimo allenamento" già esistente.
- **Fase 7** — 3 nuove card su `/allenamento`: "Questa settimana" (allenamenti/kg/streak),
  "Ultimi feedback" (nuovo endpoint `/api/me/recent-analyses`), "Equilibrio muscolare" (riuso di
  `AdaptiveBodyMap`, prima confinato alla pagina piano).
- **Fase 8** — Nutrizione: **bug corretto** — il piano AI generato veniva salvato
  (`User.nutritionPlanJson`) ma mai riletto al caricamento, spariva al refresh. Corretto +
  gerarchia: un solo "piano attivo" visibile (AI ha priorità sul pool), non più sovrapposti.
- **Fase 9** — priorità al documento di un professionista caricato in Profilo (se analizzato):
  lato Nutrizione sostituisce del tutto AI/pool; lato Allenamento — dove non può sostituire il piano
  strutturato per limite tecnico reale (PDF = testo libero, non giorni/esercizi strutturati) — mostra
  invece una card "Indicazioni dal tuo professionista" sempre visibile accanto al piano.
- **Fase 10** — switch fotocamera anteriore/posteriore in `useCamera.ts` (rilevamento multi-camera via
  `enumerateDevices`), bottone in `RecordingStage.tsx`. Non testabile con hardware reale in questo
  ambiente.
- **Lavoro inline finale**: il risultato dell'analisi ora appare nella stessa schermata di
  registrazione invece di un redirect a pagina separata — estratto `AnalysisReportContent` +
  `AnalysisReportActions` come componenti condivisi tra `/analisi/report/[id]` (invariata per i link
  esterni) e la nuova fase `RESULT` in `/analisi/sessione`.

**Verifica:** ogni fase testata dal vivo nel browser con dati reali (utenti/piani/sessioni creati e
poi eliminati), `tsc`+`eslint` puliti su tutto il progetto ad ogni passo. Limiti onesti segnalati:
switch fotocamera e flusso inline non testabili end-to-end con hardware reale in questo ambiente
(fotocamera bloccata nel Browser pane).

**File nuovi principali:** ~15 nuovi componenti/endpoint (dettaglio tecnico in `DOCUMENTAZIONE_FLUSSI.md`
§7-8-10 e §14bis). Il piano di lavoro scritto durante la sessione (`PIANO_SESSIONE_NUTRIZIONE_ANALISI.md`)
è stato smistato in `DOCUMENTAZIONE_FLUSSI.md` a fine sessione e rimosso, per non lasciare un documento
in più da mantenere — questo diario resta la fonte storica di cosa è stato fatto.

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
