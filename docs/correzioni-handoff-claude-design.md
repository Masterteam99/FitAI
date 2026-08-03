# Correzioni all'handoff landing — Motion Insight

> Da consegnare a Claude Design. L'handoff attuale (`design_handoff_landing/landing.html`) va corretto su **due punti strutturali** e **allineato al copy aggiornato**. Il codice dell'app è la fonte di verità: il design deve rispecchiarlo.

---

## ERRORE 1 — È una one-page, deve essere un sito multi-pagina

Nell'handoff tutti i link sono **àncore interne** (`#come-funziona`, `#prezzi`, `#storie`), 11 link sono **senza destinazione**, e la voce **"Risorse" punta a `#faq`** (sbagliata). Mancano del tutto `/per-chi`, `/scarica`, `/chi-siamo`.

**Come deve essere:** un sito con **pagine reali e URL dedicati** (già implementati in produzione):

| Voce di menu | URL reale |
|---|---|
| Logo | `/` |
| Come funziona | `/come-funziona` |
| Per chi | `/per-chi` |
| Prezzi | `/prezzi` |
| Storie | `/storie` |
| Risorse | `/risorse` (indice blog) + `/risorse/[slug]` (articolo) |
| — (nel footer) | `/funzionalita`, `/chi-siamo`, `/faq`, `/scarica` |
| Accedi | `/login` · Prova Gratis → `/registrati` |

**Header (sticky):** logo a sinistra · **5 voci centrali**: Come funziona · Per chi · Prezzi · Storie · Risorse · a destra `Accedi` (outline) + **`Prova Gratis`** (coral pieno). Su mobile: hamburger, ma i 2 bottoni restano visibili + **barra CTA fissa in basso**.

**Consegna attesa:** un mockup **per ogni pagina** (non una pagina unica con sezioni), desktop + mobile.

---

## ERRORE 2 — Il copy della Home è la versione superata

L'handoff mostra l'hero *"L'AI che vede gli errori nella tua tecnica…"* e **non contiene** due sezioni obbligatorie. Questo è il copy **attuale e definitivo** della Home, in quest'ordine esatto (9 sezioni):

1. **HERO** — H1: *"Alleni da solo? Ora hai un **occhio esperto** che ti guarda."*
   Sub: *"Motion Insight usa la fotocamera per vedere la tua tecnica e correggerti in tempo reale — così migliori davvero, senza farti male."*
   CTA coral: **"Trova il tuo percorso"** · secondario: "Guarda la demo"
   Micro: *"Gratis · nessuna carta · 2 minuti"* · Badge: *"🔒 Il video resta sul tuo telefono."*
   3 badge fiducia: "Nessun attrezzo" · "In tempo reale" · "In italiano"

2. **PER CHI SEI** ⟵ *MANCA NELL'HANDOFF* — H2: *"Da dove vuoi **partire**?"* — Sub: *"Ogni corpo e ogni obiettivo hanno il loro percorso. Scegli il tuo."*
   6 card cliccabili: *Corro* · *Mi alleno a casa* · *Vado in palestra* · *Riparto dopo un infortunio* · *Ho superato i 50* · *Torno in forma dopo la gravidanza*

3. **TI RICONOSCI?** ⟵ *MANCA NELL'HANDOFF* — H2: *"Ti suona **familiare**?"* — Sub: *"Non è colpa tua: nessuno ti ha mai detto cosa stavi sbagliando."*
   4 frasi in prima persona: *"Faccio gli esercizi ma non sono sicuro di farli bene."* · *"Ho un fastidio ricorrente a schiena, ginocchia o spalle."* · *"Mi alleno da mesi ma i risultati non arrivano."* · *"Un personal trainer costa troppo per seguirmi sempre."*

4. **COME FUNZIONA** — H2: *"Dalla fotocamera al **consiglio**, in un attimo."*
   4 step: Inquadra e muoviti → L'AI legge **33 punti** del tuo corpo (fino a 30 volte al secondo) → Ricevi la correzione (angoli, allineamento, profondità) → Il piano si adatta

5. **IL TUO FORM SCORE** — H2: *"La qualità dei tuoi movimenti, finalmente **misurabile**."*
   Testo: punteggio oggettivo 0-100 sulla qualità dell'esecuzione, che cresce settimana dopo settimana. Visual: anello Form Score + grafico ("+18% questo mese").

6. **SICUREZZA & PRIVACY** — H2: *"La tua privacy è **sacra**. La tua sicurezza anche."*
   Testo: video elaborato sul telefono, nessun filmato salvato o inviato; esercizi adatti al livello, progressione graduale. Icona lucchetto grande.

7. **STORIE** — H2: *"Le prime storie stanno **arrivando**."* + nota di onestà (testimonianze vere in raccolta) + link a `/storie`.

8. **PREZZI** — H2: *"Un piano per **ogni obiettivo**."*
   **3 piani**: Free €0 · **Premium €9,90/mese** (badge "Più scelto", evidenziato) · Annuale €79,90 (badge "−33%").
   Garanzia: *"Prova 7 giorni gratis · Disdici quando vuoi · Rimborso entro 30 giorni."*

9. **CTA FINALE** — H2: *"Pronto a **migliorare davvero**?"* + **una sola** CTA coral: **"Trova il tuo percorso"**.

---

## REGOLE DA RISPETTARE (erano già nel brief, vanno applicate)

**De-duplicazione — ogni proof-point vive in UN SOLO posto:**
- I **"33 punti"** → solo nella sezione 4 (Come Funziona).
- Il **Form Score** e il **"+18%"** → solo nella sezione 5.
- L'**"on-device"/privacy** → solo nel badge hero + sezione 6 (e nelle FAQ).
- Una sola barra statistiche in tutta la pagina.
- Le sezioni che parlano di correzione usano parole diverse: hero = promessa, sez. 4 = meccanismo, sez. 5 = prova.

**Colore:** una sola azione **coral `#E94560`** per schermata (le CTA). Le evidenze nei titoli sono **teal `#0F9E99`**, mai coral. Navy `#16213E` per i blocchi d'enfasi, lime `#C6F135` per gli stati positivi. Base chiara `#F4F7FB`.

**Tipografia:** display **Sora** (bold, tracking stretto), corpo **Inter**.

**Mobile-first**, contrasto WCAG AA, aree touch ≥44px.

---

## COSA MANCA ANCHE NELLE PAGINE INTERNE (da progettare)

Le pagine esistono già con copy e struttura, ma servono questi blocchi:
- **Come funziona:** tabella confronto **"YouTube vs Motion Insight"**; sezione **"Cosa vede l'AI"** con overlay scheletro annotato (angolo ginocchio, allineamento schiena, profondità, simmetria).
- **Prezzi:** **tabella comparativa** funzionalità con spunte; sezione **B2B** ("Sei un'azienda? Motion Insight per il welfare aziendale"); FAQ pricing.
- **Funzionalità:** la **"Correzione forma in tempo reale" va per prima e più grande** delle altre (è il differenziale).
- **Per chi:** una **foto reale** per ciascuno dei 6 segmenti.

---

## RIEPILOGO DELLA RICHIESTA
1. Trasformare l'handoff da one-page ad **insieme di pagine reali** con gli URL sopra (niente àncore al posto delle rotte, nessun link senza destinazione, "Risorse" → `/risorse`).
2. Aggiornare la Home alle **9 sezioni** con il copy qui sopra, **aggiungendo "Per Chi Sei" e "Ti riconosci?"**.
3. Applicare **de-duplicazione** e **regola del coral unico**.
4. Consegnare mockup **desktop + mobile per ogni pagina**, includendo i blocchi mancanti delle pagine interne.
