# Motion Insight — COPY FINALE del sito (v2)

> **Cos'è questo file:** il copy **definitivo** del sito, pagina per pagina, sezione per sezione,
> nell'ordine reale. È la **sorgente di verità**: in futuro questo documento guiderà il codice
> (la parte copy, `src/content/copy.ts` + pagine) e, di conseguenza, il design. Non si adatta il
> documento al codice: è l'inverso.
>
> **Come si legge:** `[✅ PRONTO]` sezione completa · `[✍️ IN LAVORAZIONE]` da scrivere insieme ·
> `[🧩 DATI]` serve un dato reale da te · `[🛠️ DEV]` richiede sviluppo, qui c'è solo la specifica ·
> `⚠️` nota di attenzione (legale/coerenza).
>
> **Riferimento storico/stato attuale:** `MOTION_INSIGHT_DESIGN_COPY_MASTER.md`.
> **Ultimo aggiornamento:** 2026-08-11 — v2: pronte Home, Il Metodo, Per Chi, FAQ.

---

## Struttura del sito (v2)

**Menu principale (Sito):** `Il Metodo` · `Per Chi` · `Chi siamo` · `Prezzi` · `Risorse`
*(la pagina "Cosa Fa" è eliminata; le FAQ sono una pagina dedicata)*

| # | Pagina | Stato |
|---|--------|-------|
| 1 | Home (landing) | `[✅ PRONTO]` (salvo dati competitor T4 e testimonianza) |
| 2 | Il Metodo | `[✅ PRONTO]` |
| 3 | Per Chi | `[✅ PRONTO]` (salvo arricchimenti) |
| 4 | Chi siamo e perché | `[✍️ IN LAVORAZIONE]` — T10 (nuova) |
| 5 | Prezzi | `[✅ PRONTO]` (prezzi competitor da verificare) — T8 |
| 6 | Risorse | `[✅ PRONTO]` (struttura + fonti; testi da scrivere) — T11 |
| 7 | Domande frequenti (FAQ) | `[✅ PRONTO]` (struttura; da ampliare ancora) |
| — | Cosa Fa | ❌ **ELIMINATA** (spunti assorbiti in "Il Metodo") |
| A | Area utente (webapp) | invariata per ora — vedi master |
| M | Mobile · PWA | invariata per ora — vedi master |

**Header (tutte le pagine):** logo `Motion Insight` · menu · `Accedi` · `Inizia gratis`
**Footer (tutte le pagine):** menu PRODOTTO aggiornato (senza "Cosa Fa"); `⚠️` chiudere
`[RAGIONE SOCIALE]` e `[P.IVA]`; disclaimer da mantenere: *Motion Insight non è un dispositivo
medico e non fornisce diagnosi.*

---
---

# PAGINA 1 — HOME (Landing)  `[✅ PRONTO]`

> Interventi applicati: **T1** (CTA prova gratuita email-gated), **T2** ("In tre passi" riscritto),
> **T3** (4 segmenti fusi), **T4** (tabelle competitor sotto i prezzi), **T5** (FAQ rimosse dalla landing).

## Sez. 1 — Hero
- `eyebrow`: **ANALISI DEL MOVIMENTO CON INTELLIGENZA ARTIFICIALE**
- **H1:** Alleni da solo. Ma la tua tecnica è corretta?
- **Paragrafo:** Registra venti secondi della tua esecuzione. Motion Insight la analizza e ti restituisce un'analisi completa: cosa funziona, cosa no, e cosa correggere per primo.
- **CTA primaria:** Analizza la tua tecnica → `[🛠️ DEV — T1]` porta al flusso di **prova gratuita**: scegli un esercizio consigliato, inserisci la mail, carichi il video e ricevi **una sola** analisi valutativa gratuita.
- **CTA secondaria:** Come funziona
- `microcopy`: Gratis · nessuna carta richiesta · bastano il telefono e due metri di spazio
- 🖼️ Area visiva hero (analisi tecnica in evidenza).

## Sez. 2 — Il problema
- **H2:** Il problema di allenarsi da soli non è la fatica. È il dubbio.
- **Paragrafo:** Nessuno ti guarda. Nessuno ti dice che la schiena si sta arrotondando, che un ginocchio cede verso l'interno, che stai compensando con le spalle. Così un errore diventa un'abitudine, e un'abitudine diventa un dolore.
- **Pain point (3):** Non sai se lo stai facendo bene. / I fastidi tornano sempre negli stessi punti. / Un professionista che ti segua costa 200-400 € al mese.

## Sez. 3 — In tre passi  *(T2)*
- `eyebrow`: **IN TRE PASSI** — **H2:** Registra. Analizziamo. Sai cosa correggere.
- **1 · Registra** — Appoggi il telefono o accendi la webcam del computer: un conto alla rovescia ti dà il tempo di posizionarti, poi esegui. Venti secondi.
  - 🖼️ `[🛠️ asset]` breve **video mocap** dimostrativo del passo "registra".
- **2 · Analizziamo** — Il movimento viene esaminato su tre livelli diversi e confrontato con l'esecuzione di un professionista.
  - 🖼️ `[🛠️ asset]` **video mocap** che mostra i punti articolari / l'analisi in corso.
- **3 · Ricevi l'analisi** — In un paio di minuti: punteggio, rischi da tenere d'occhio, e i correttivi in ordine di priorità. `[🧩 DATI]` confermare il tempo reale medio (era "meno di due minuti").
  - 🖼️ `[🛠️ asset]` **video mocap** dell'esito/report.
- 🔗 Guarda il metodo nel dettaglio →

## Sez. 4 — Cosa ricevi (esempio report)
- `eyebrow`: **COSA RICEVI** — **H2:** Non un «bravo». Un'analisi dettagliata.
- **Paragrafo:** Alla fine di ogni analisi ricevi un documento leggibile: quanto vale la tua esecuzione, dove si discosta da quella corretta, quali sono i rischi, e da cosa conviene partire per migliorare.
- **Bullet (4):** Punteggio complessivo della forma / Confronto fase per fase con l'esecuzione di un professionista / Avviso sul rischio di infortunio, quando presente / Miglioramenti in ordine di priorità
- 🖼️ **Card report:** **77** su 100 · Squat · 20 secondi · Buona base, due correzioni · badge *Rischio ginocchio destro*
  - **DA CORREGGERE, IN ORDINE:**
    1. Nella fase di discesa il ginocchio destro cede verso l'interno. `⚠️` *(rivedere il claim medico "causa più comune di dolore alla rotula": ammorbidire o citare fonte, per coerenza col disclaimer).*
    2. La schiena si arrotonda negli ultimi centimetri di discesa.
    3. Il ritmo di risalita è irregolare tra una ripetizione e l'altra.

## Sez. 5 — Il confronto
- `eyebrow`: **IL CONFRONTO** — **H2:** Ti misuriamo su chi lo fa di mestiere.
- **Paragrafo:** Per ogni esercizio abbiamo registrato l'esecuzione di un professionista. La tua viene messa a confronto con la sua, fase per fase: è così che l'analisi ti dice non solo che c'è un errore, ma quanto ti allontani da come andrebbe fatto.
- 🖼️ Confronto due colonne: La tua esecuzione / Riferimento professionista
- **SCOSTAMENTO PER FASE:** Discesa **68** · Punto basso **84** · Risalita **71** · Blocco finale **88**

## Sez. 6 — Da dove vuoi partire  *(T3 — 4 card fuse)*
- **H2:** Da dove vuoi partire? — Sottotitolo: Ogni situazione ha il suo percorso.
  1. **Mi alleno a casa (con o senza attrezzi)** — Bastano il telefono e un po' di spazio; se hai manubri o elastici, il carico cresce in modo graduale.
  2. **Vado in palestra** — Perfeziona i movimenti fondamentali sotto carico.
  3. **Riparto dopo uno stop o infortunio** — Progressione graduale, senza forzare.
  4. **Ho superato i 50** — Forza, equilibrio e mobilità, con i tuoi tempi.
- *(Rimosse: gravidanza e running.)*

## Sez. 7 — Non solo analisi (3 feature)
- `eyebrow`: **NON SOLO ANALISI** — **H2:** Attorno all'analisi, tutto quello che serve.
  1. Piano di allenamento su misura — Generato sui tuoi obiettivi, livello e attrezzatura.
  2. Piano alimentare — Calibrato sul tuo fabbisogno reale.
  3. Progressi nel tempo — Come cambia la qualità dei tuoi movimenti, non solo il peso.
- *(Coach AI rimosso per ora — non incluso in questa fase.)*

## Sez. 8 — Perché fidarti (3 blocchi)
- **H2:** Perché puoi fidarti dei numeri che leggi.
  1. Il metodo è dichiarato. — Spieghiamo come funziona l'analisi, cosa misura e quali sono i suoi limiti. — 🔗 Leggi il metodo →
  2. I riferimenti sono di professionisti veri. — Le esecuzioni di confronto sono registrate da professionisti del settore.
  3. Le tue immagini sono trattate con attenzione. — Il tuo video non viene mostrato a nessuno e resta sotto il tuo controllo. — 🔗 Come trattiamo i video →

## Sez. 9 — Testimonianza cofondatore  `[🧩 DATI]`
- `⚠️ PLACEHOLDER` → «[TESTO DA PRODURRE: due righe del cofondatore sul perché è nato Motion Insight]»
- `⚠️ PLACEHOLDER` → [NOME] — [QUALIFICA E ANNI DI ESPERIENZA]

## Sez. 10 — Prezzi (riepilogo) + confronto competitor  *(T4)*
- **H2:** Inizia gratis. Passa a Premium quando ti serve.
- **Free** — €0 · **Premium** — €9,90/mese · **Annuale** −33% — €79,90/anno
- `microcopy`: Prova 7 giorni · Disdici quando vuoi · Rimborso entro 30 giorni

**Tabella (versione breve per la Home) — Cosa ottieni, e a che prezzo**
| | Classi live *(es. Buddyfit)* | App di sola tecnica *(es. FormCheck AI)* | App di soli piani *(es. Fitbod)* | Coach umano *(es. Future)* | **Motion Insight** |
|---|---|---|---|---|---|
| Analisi della *tua* tecnica | — | ✅ | — | parziale | ✅ |
| Piano di allenamento su misura | — *(classi da seguire)* | — | ✅ | ✅ | ✅ |
| Alimentazione | ricette | — | — | limitato | ✅ |
| Prezzo indicativo/mese | 17,99 € | ~12 $ | ~13 $ | 199 $ | **9,90 €** |

- Sintesi: *le classi live ti fanno allenare ma nessuno guarda te; chi fa la tecnica non ti dà il piano; chi ti dà il piano non guarda la tecnica; un coach umano costa venti volte tanto. Motion Insight mette tutto insieme e, soprattutto, guarda la tua esecuzione.*
- 🔗 Confronta i piani nel dettaglio → *(pagina Prezzi)*
- `⚠️ [🧩 DATI]` Prezzi competitor rilevati da fonti pubbliche (mercato USA, in $, agosto 2026): **verificarli e aggiornarli prima della pubblicazione** — variano spesso. Dettaglio e fonti nella pagina Prezzi.

## Sez. 11 — CTA finale
- **H2:** Scopri cosa dice la tua prima esecuzione. — Bastano venti secondi e due metri di spazio. — **CTA:** Analizza la tua tecnica
- *(Le FAQ NON stanno più qui — spostate nella pagina "Domande frequenti", T5.)*

---
---

# PAGINA 2 — IL METODO  `[✅ PRONTO]`

> Interventi applicati (T6): rimosso l'elenco dei 53 esercizi e il blocco "cosa possiamo
> analizzare"; privacy riscritta più forte **ma conforme** (mantenuto il diritto di cancellazione,
> nessun claim "video usati per il training"); assorbito 1 spunto utile da "Cosa Fa".

## Intestazione
- `eyebrow`: **IL METODO**
- **H1:** Come facciamo a sapere se ti stai muovendo bene.
- **Sottotitolo:** Nessuna magia: tre analisi diverse sullo stesso video, e un confronto con chi lo fa di mestiere.

## Sez. A — Perché registriamo invece di correggerti mentre ti muovi
- **H2:** Perché registriamo invece di correggerti mentre ti muovi.
- Un'analisi accurata richiede di guardare l'intero movimento, fase per fase, e di poterlo rivedere più volte. Mentre ti muovi non è possibile: si può solo dare un'indicazione generica, che suona bene ma non misura niente.
- Per questo la registrazione è silenziosa: nessuno scheletro a schermo, nessuna voce che ti interrompe. Tu esegui come faresti da solo — che è esattamente ciò che va misurato. L'analisi arriva dopo, in un paio di minuti.
- **Confronto a due colonne:**
  - *Correzione durante l'esecuzione* — Appariscente, ma superficiale: nessuna misura affidabile in movimento.
  - *Analisi dopo la registrazione* — Il movimento viene riesaminato fase per fase, più volte, con misure ripetibili.

## Sez. B — I tre livelli di analisi
- **H2:** I tre livelli di analisi.
  1. **Geometria del corpo** — Vengono ricostruiti i punti articolari nello spazio e misurati angoli, allineamenti e profondità in ogni fase del movimento.
  2. **Lettura visiva** — I fotogrammi chiave vengono esaminati per cogliere ciò che i soli numeri non dicono: compensi, rigidità, esitazioni.
  3. **Confronto con il professionista** — La tua esecuzione viene messa accanto a quella registrata da un professionista, fase per fase.
- **Nota:** I tre risultati vengono uniti in un unico giudizio, con un punteggio complessivo.

## Sez. C — Come si legge l'analisi
- **H2:** Come si legge l'analisi.
  1. **Il punteggio** — Da 0 a 100, è la sintesi dei tre livelli. Serve a capire a che punto sei, non a darti un voto.
  2. **L'avviso di rischio** — Compare solo quando un movimento può portare a un infortunio. È sempre accompagnato da un'icona e da una spiegazione: non ti affidiamo mai al solo colore.
  3. **Le priorità** — Tre cose da sistemare, in ordine di importanza. Si parte dalla prima: correggere tutto insieme non funziona.

## Sez. D — L'analisi è il punto di partenza, non il traguardo
> *(spunto assorbito da "Cosa Fa")*
- **H2:** L'analisi è il punto di partenza, non il traguardo.
- Il punteggio ti dice dove sei; il resto di Motion Insight lavora perché tu migliori: il piano di allenamento si adatta a ciò che l'analisi rivela e i progressi seguono la **qualità** dei tuoi movimenti nel tempo. L'analisi è il motore di tutto il resto.

## Sez. E — Cosa Motion Insight non è
- **H2:** Cosa Motion Insight non è.
- Dichiarare i limiti fa parte del metodo. Se sai cosa non possiamo fare, puoi fidarti di quello che facciamo.
  - **Non è un dispositivo medico** — È uno strumento di allenamento. Non emette diagnosi e non va usato per decisioni sanitarie.
  - **Non sostituisce un professionista** — Se hai dolore o un infortunio in corso, serve una persona che ti visiti. L'analisi può accompagnare quel percorso, non rimpiazzarlo.
  - **Ha bisogno di condizioni minime** — Buona luce e inquadratura completa. Se il corpo esce dal campo, l'analisi te lo dice invece di indovinare.

## Sez. F — Privacy: i tuoi video restano tuoi
- `eyebrow`: **PRIVACY** — **H2:** I tuoi video restano tuoi.
- Registri immagini di te stesso in casa tua: è giusto sapere esattamente cosa succede, e cosa **non** succede.
  - **Non vengono mostrati a nessuno** — Il video è associato solo al tuo account. Nessun altro utente lo vede.
  - **Non vengono usati per pubblicità** — Non li vendiamo, non li cediamo, non li usiamo per profilarti.
  - **Servono solo alla tua analisi** — Vengono caricati per essere analizzati e per poterli rivedere accanto al risultato. Nient'altro.
  - **Li controlli tu** — Puoi rivederli o eliminarli quando vuoi dal profilo: un singolo video o l'intero storico. L'analisi già ricevuta resta.
- `[🧩 DATI]` `⚠️` Da completare con i dati tecnici reali (fornitore storage, tempi di conservazione, procedura di cancellazione), senza affermazioni non veritiere.
- `⚠️` **Decisione T6:** NON dichiarare l'uso dei video per addestrare il modello e NON rimuovere il diritto di cancellazione (esposizione GDPR). Un eventuale riuso futuro andrà gestito come **consenso opt-in** esplicito.

## Sez. G — Chiusura
- **H2:** Il metodo si giudica sui risultati che ti dà. — **CTA:** Prova con la tua prima esecuzione

---
---

# PAGINA 3 — PER CHI  `[✅ PRONTO]`

> Interventi applicati (T7): rimosse le situazioni running e gravidanza; opzioni **mantenute
> separate** (diversamente dalla Home); rimossa la CTA finale (quiz); predisposti spazi da arricchire.

## Intestazione
- `eyebrow`: **PER CHI**
- **H1:** Situazioni diverse, percorsi diversi.
- **Sottotitolo:** Motion Insight si adatta a dove ti alleni e a da dove parti.

## Blocchi (titolo · citazione · descrizione · CTA `Inizia da qui`)
1. **Mi alleno a casa senza attrezzi** — «Hai un tappetino, due metri di spazio e venti minuti. Nessuno che ti guardi.» — Motion Insight lavora esattamente in queste condizioni: bastano il telefono appoggiato e il corpo libero. Gli esercizi proposti non richiedono attrezzatura, e l'analisi funziona anche in spazi stretti purché l'inquadratura ti contenga tutto.
2. **Mi alleno a casa con manubri o elastici** — «Hai due manubri e un elastico, ma non sai se stai caricando troppo o troppo poco.» — Il piano usa quello che hai davvero e cresce di carico in modo graduale. Le analisi ti dicono se la tecnica tiene quando il peso aumenta: è lì che gli errori si pagano.
3. **Vado in palestra** — «Hai i macchinari e i bilancieri, ma nessuno che ti guardi mentre esegui.» — Registri una serie dei movimenti fondamentali e ricevi l'analisi. Sotto carico la tecnica conta il doppio, e i correttivi arrivano in ordine di priorità invece che tutti insieme.
4. **Riparto dopo uno stop o infortunio** — «Sei fermo da mesi e hai paura di farti male appena ricominci.» — La progressione parte da dove sei, non da dove eri. Gli avvisi sul rischio ti dicono quando un movimento non è ancora pronto per te, così riprendi senza forzare.
5. **Ho superato i 50** — «Vuoi restare forte e stabile, non gareggiare con nessuno.» — Il piano lavora su forza, equilibrio e mobilità, con i tuoi tempi. L'analisi tiene conto della qualità del movimento, che a questa età conta più del carico.

- `[✍️ IN LAVORAZIONE]` **Arricchimenti da valutare** (idee da definire insieme): p. es. *Voglio dimagrire*, *Voglio più forza*, *Mi preparo per uno sport*, *Lavoro tutto il giorno seduto*. → decidere quali aggiungere e con quale copy.

- *(Rimossa la CTA/quiz finale.)*

---
---

# PAGINA 7 — DOMANDE FREQUENTI (FAQ)  `[✅ PRONTO — struttura]`

> Interventi applicati (T5): FAQ spostate qui dalla landing e ampliate. Base pronta, da estendere.

## Intestazione
- `eyebrow`: **DOMANDE FREQUENTI**
- **H1:** Le risposte alle domande più comuni.

## Le domande (base attuale — pronte)
- **L'analisi funziona davvero?** — Si basa su tre misurazioni diverse dello stesso video — geometria del corpo, lettura dei fotogrammi chiave e confronto con l'esecuzione di un professionista — che vengono unite in un unico giudizio. Nella pagina Il Metodo spieghiamo cosa misura e quali sono i suoi limiti.
- **Il video che registro dove finisce?** — Viene caricato per essere analizzato e resta associato solo al tuo account. Non viene mostrato ad altri né usato per pubblicità. Puoi rivederlo o eliminarlo quando vuoi dal profilo.
- **Serve un telefono recente?** — No. Serve una fotocamera (del telefono o la webcam del computer) e una buona luce. Conta di più la posizione: a circa due metri, con tutto il corpo nell'inquadratura.

## Nuove domande da aggiungere  `[✍️ IN LAVORAZIONE]`
Elenco proposto (da confermare/scrivere insieme):
- Che differenza c'è tra Free e Premium?
- Quante analisi posso fare con il piano gratuito?
- Quali esercizi posso far analizzare?
- Come si disdice l'abbonamento?
- Motion Insight va bene se ho avuto un infortunio?
- Funziona anche senza connessione / come PWA?
- I miei dati e i video sono al sicuro? *(rimando a Il Metodo → Privacy)*

---
---

# PAGINA 4 — CHI SIAMO E PERCHÉ  `[✍️ IN LAVORAZIONE]` (nuova, T10)
- Ordine: **Vision** → **Chi siamo (co-creatori)** → **Focus sul cofondatore tecnico** → chiusura.
- `[🧩 DATI]` servono: vision, storia della nascita del progetto, bio del cofondatore tecnico.

---
---

# PAGINA 5 — PREZZI  `[✅ PRONTO — dati da verificare]` (T8)

> Interventi applicati (T8): mantenuti piani, tabella feature interna, blocco "pain economico del
> professionista" e FAQ prezzi; **nessuna CTA**; aggiunte le **tabelle competitor** con dati reali
> raccolti da fonti pubbliche.

## Intestazione
- **H1:** Un prezzo chiaro. Nessuna sorpresa.
- `microcopy`: Prova 7 giorni · Disdici quando vuoi · Rimborso entro 30 giorni

## Piani
- **Free** — €0 — Per capire se fa per te. — **CTA** Inizia gratis
- **Premium** — badge *Consigliato* — €9,90/mese — Tutto illimitato, nessun vincolo. — **CTA** Prova 7 giorni
- **Annuale** — −33% — €79,90/anno — Due mesi in regalo. — **CTA** Passa all'annuale

## Tabella — Cosa include ogni piano
| Funzione | Free | Premium |
|---|---|---|
| Analisi della tecnica | Limitate | Illimitate |
| Catalogo esercizi | Sì | Sì |
| Storico delle analisi | Sì | Sì |
| Confronto con il professionista | — | Sì |
| Piano di allenamento generato | — | Sì |
| Piano alimentare | — | Sì |

## Confronto competitor — Quanto costano gli altri  *(T8)*
> `⚠️ [🧩 DATI]` Valori rilevati da recensioni/comparazioni pubbliche, mercato USA in $, agosto 2026.
> Sono **indicativi e cambiano spesso**: verificare e, dove possibile, convertire/aggiornare prima
> della pubblicazione. Coerente col nostro tono, meglio "a partire da / circa" che un prezzo secco.

**A) Prezzo mensile indicativo**
| Soluzione | Tipo | Prezzo/mese (circa) |
|---|---|---|
| **Buddyfit** *(mercato IT)* | Classi live/on-demand + ricette | **17,99 €** (59,99 €/anno; promo web da ~5 €) |
| FormCheck AI | Analisi tecnica da video | ~12–13 $ (~90 $/anno) |
| Fitbod | Solo piani di allenamento | ~12,99–15,99 $ (79,99 $/anno) |
| Zing Coach | Tracking live + piani | ~18,99 $ (59,99 $/anno) |
| Freeletics | Coach AI, piani | ~8,50–34,99 $ (~79,99 €/anno) |
| Future | **Coach umano** | 199 $ |
| **Motion Insight Premium** | **Analisi + piano + nutrizione** | **9,90 €** |

**B) Cosa offriamo noi vs loro** (rappresentativo per categoria)
| Funzionalità | Buddyfit *(classi live)* | FormCheck AI *(sola tecnica)* | Fitbod *(soli piani)* | Future *(coach umano)* | **Motion Insight** |
|---|---|---|---|---|---|
| Analisi della *tua* tecnica da video | — | ✅ | — | parziale (umano) | ✅ |
| Confronto con un professionista | — | — | — | n/d | ✅ |
| Piano di allenamento su misura | — *(classi da seguire)* | — | ✅ | ✅ | ✅ |
| Alimentazione | ricette | — | — | limitato | ✅ (piano) |
| Progressi sulla qualità del movimento | — | — | — | — | ✅ |
| Prezzo/mese (circa) | 17,99 € | ~12 $ | ~13 $ | 199 $ | **9,90 €** |

- **Messaggio chiave:** *le classi live (come Buddyfit) ti fanno allenare ma nessuno guarda la tua esecuzione; le app di sola tecnica fanno solo quello; quelle di soli piani non guardano come ti muovi; un coach umano fa di più ma costa venti volte tanto. Motion Insight tiene insieme analisi, piano e alimentazione — a 9,90 € — e soprattutto guarda la tua tecnica.*
- `⚠️` Buddyfit è il paragone più vicino per il pubblico italiano: utile metterlo per primo. Nota di correttezza: sono prodotti **diversi** (loro = palestra online di classi; noi = analisi personale del movimento), quindi il confronto va presentato in modo onesto, non come "meglio/peggio" ma come "cosa fa una cosa che l'altra non fa".

## Quanto costa oggi farsi seguire
- Un professionista in presenza fa cose che noi non facciamo: ti mette le mani addosso, ti conosce, adatta tutto mentre sei lì con lui. Motion Insight è complementare, non alternativo — e copre i giorni in cui nessuno ti guarda.
  - Personal trainer in presenza — 200-400 €/mese `[🧩 DATI: indicare fonte/territorio]`
  - Valutazione biomeccanica singola — `[🧩 DATI da verificare]`
  - **Motion Insight Premium** — 9,90 €/mese — Analisi illimitate

## FAQ prezzi (restano in questa pagina)
- **Cosa succede quando finisce la prova?** — Alla fine dei 7 giorni non si attiva niente da solo. Se non confermi, resti sul piano Free e continui a usare Motion Insight con le analisi limitate.
- **Come disdico?** — Dal profilo, in due tocchi, senza scrivere a nessuno. Continui a usare Premium fino alla fine del periodo già pagato.
- **Che differenza c'è tra mensile e annuale?** — Le funzioni sono identiche. L'annuale costa il 33% in meno — due mesi in regalo — ma si paga in una volta.
- **Cosa resta con il piano Free?** — Il catalogo degli esercizi, lo storico delle analisi già fatte e un numero limitato di nuove analisi ogni mese.

## Blocco aziende
- **Sei un'azienda?** — Motion Insight come benessere aziendale, con dati aggregati e anonimi. — **CTA** Vedi la pagina aziende
- *(Nessuna CTA di conversione generica in fondo alla pagina, come deciso.)*

**Fonti competitor (per verifica interna, non pubblicare così):**
- **Buddyfit**: buddyfit.club (pagina prezzi ufficiale), aranzulla.it (come funziona), altroconsumo.it (nota su rinnovo automatico). Prezzi: 17,99 €/mese; 59,99 €/anno; promo web ~4,99–3,99 €/mese; 6 mesi 39,99 €. Feature: 1.000+ workout on-demand, 100+ classi live/settimana, 500+ ricette, mindfulness.
- App di analisi tecnica (FormCheck AI, Zing Coach): sensai.fit — best AI form-check apps 2026.
- Fitbod / Freeletics / Future: sensai.fit, fitbod.me, tomsguide.com.

---
---

# PAGINA 6 — RISORSE  `[✅ PRONTO — struttura + fonti]` (T11)

> Interventi applicati (T11): ampliato a **360°** (non solo allenamento). Ogni articolo ha un
> **àncora autorevole** su cui basare il contenuto. `⚠️` I temi salute/infortuni vanno **validati
> dal cofondatore professionista** prima della pubblicazione. I testi degli articoli sono `[✍️]`.

## Intestazione
- `eyebrow`: **RISORSE**
- **H1:** Capire il movimento, non solo eseguirlo.
- **Sottotitolo:** Guide brevi e affidabili su tecnica, allenamento, alimentazione, recupero e prevenzione — con basi su fonti autorevoli.
- **Filtri categoria:** `Tutte` · `Tecnica` · `Allenamento a casa` · `Prevenzione infortuni` · `Alimentazione` · `Recupero e sonno` · `Mobilità` · `Costanza e motivazione`

## Elenco articoli (categoria · titolo · àncora autorevole)  `[✍️ testi da scrivere]`

**Tecnica**
- Squat: i cinque errori più frequenti e come riconoscerli da soli — *(contenuto proprietario + catalogo)*
- Push-up: come capire se stai davvero lavorando i pettorali — *(proprietario)*
- Quanto deve essere profondo uno squat (dipende da te) — *(proprietario)*
- Come filmarsi bene per analizzare la propria tecnica — *(proprietario)*

**Allenamento a casa**
- Allenarsi a casa senza attrezzi: cosa serve davvero — àncora: **OMS 2020**, attività di rinforzo muscolare ≥2 giorni/settimana.
- Progredire senza pesi: le varianti che aumentano la difficoltà — àncora: principio di sovraccarico progressivo (ACSM).
- Quanto allenarsi a settimana: le linee guida ufficiali — àncora: **OMS 2020**, 150–300 min moderata / 75–150 vigorosa + forza 2+ gg.

**Prevenzione infortuni** `⚠️ validazione professionista`
- Ginocchia che cedono verso l'interno: perché succede e cosa fare — àncora: fonte clinica autorevole (es. NHS / Mayo Clinic) `[🧩 URL da confermare]`.
- Mal di schiena e allenamento: quando fermarsi e quando no — àncora: **NHS / Mayo Clinic** su lombalgia e attività `[🧩 URL da confermare]`.

**Alimentazione**
- Quante proteine servono davvero — àncora: **ISSN Position Stand (protein & exercise)**, 1,4–2,0 g/kg/die.
- Timing delle proteine nell'arco della giornata — àncora: **ISSN Position Stand (nutrient timing)**.

**Recupero e sonno**
- Sonno e recupero muscolare: perché dormire è parte dell'allenamento — àncora: **Sleep Foundation / CDC** `[🧩 URL da confermare]` + ISSN (proteine pre-sonno).

**Mobilità**
- Riscaldamento e mobilità: cosa fare prima di allenarsi — àncora: linee guida ACSM `[🧩 URL da confermare]`.

**Costanza e motivazione**
- Come restare costante quando la motivazione cala — *(proprietario, taglio pratico)*

`⚠️` Nota: tutti i titoli sono proposte; i temi salute/infortuni **non vanno pubblicati** senza
validazione del cofondatore professionista. Le "àncore" servono come base di verità dei contenuti,
non necessariamente da citare testualmente in pagina.
