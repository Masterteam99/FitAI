# Brief completo per Claude Design — Motion Insight (sito + web app + mobile)

> Sostituisce e amplia l'handoff precedente. Copre **tutte le superfici**: landing multi-pagina, area utente (desktop + mobile), onboarding/auth, admin, legali.
> **Il codice è la fonte di verità**: l'app esiste già e funziona (49 pagine). Il design deve *elevare* ciò che c'è, non reinventare la struttura.

---

## 0. PRIMA DI PROGETTARE — leggi questi documenti

| Documento | Cosa contiene | Perché ti serve |
|---|---|---|
| `DOCUMENTAZIONE_FLUSSI.md` (root) | Mappa completa dell'app: ogni sezione, flusso end-to-end, cosa fa ogni schermata, modello dati | **Il più importante**: ti dice cosa esiste davvero e come funziona |
| `docs/landing-design-spec-claude-design.md` | Design system, animazioni disponibili, immagini open-source, copy pagina per pagina | Token, motion, asset |
| `src/content/copy.ts` | **Tutti i testi dell'app** (47 blocchi), fonte unica | Il copy è già scritto: usalo, non inventarlo |
| `STATO_PROGETTO.md` + `AGGIORNAMENTI.md` | Stato attuale e changelog | Cosa è fatto e cosa manca |

**Riassunto del prodotto in 3 righe:** Motion Insight è un personal trainer AI che, con la **fotocamera**, legge 33 punti del corpo, valuta la tecnica (angoli, allineamento, profondità) e restituisce un **Form Score 0-100** con le correzioni. Genera piani di allenamento e nutrizione su misura che si adattano ai progressi. L'elaborazione video avviene **sul dispositivo**.

---

## 1. DUE ERRORI DA CORREGGERE NELL'HANDOFF ATTUALE

### Errore 1 — È una one-page, deve essere un sito multi-pagina
Nell'handoff tutti i link sono **àncore** (`#come-funziona`, `#prezzi`), **11 link non hanno destinazione**, e la voce **"Risorse" punta a `#faq`**. Mancano `/per-chi`, `/scarica`, `/chi-siamo`.
→ Servono **pagine reali con URL dedicati** (elenco alla sezione 3) e **un mockup per pagina**, non una pagina unica.

### Errore 2 — Il copy della Home è la versione superata
L'handoff mostra l'hero *"L'AI che vede gli errori…"* e **non contiene** due sezioni obbligatorie: **"Da dove vuoi partire?"** e **"Ti suona familiare?"**.
→ Usa le **9 sezioni** della sezione 4 di questo documento.

---

## 2. DESIGN SYSTEM (non negoziabile)

- **Brand:** Motion Insight (due parole, mai "FitAI").
- **Palette:** navy `#16213E` (base scura/enfasi) · **coral `#E94560` SOLO azioni/CTA — una sola per schermata** · teal `#0F9E99` (link, evidenze nei titoli) · lime `#C6F135` (stati positivi, Form Score alto) · neutri `#F4F7FB` / `#EAF1F8` · testo `#1B1B1B` / `#555555`.
- **Tipografia:** display **Sora** (bold, tracking stretto) · corpo **Inter** (16-18px min).
- **Forme:** card radius 18-24px, bottoni pill, ombre morbide.
- **Mobile-first** (75% del traffico), **WCAG AA**, feedback non solo a colore, touch ≥44px.
- **Componenti chiave:** anello **Form Score**, **overlay scheletro** (33 nodi, verde/rosso), mappa corporea, heatmap costanza, grafici puliti.

---

## 3. INVENTARIO COMPLETO — 49 pagine da progettare

### 3.1 Landing / marketing pubblico (11) — *esistono, vanno elevate*
| URL | Contenuto | Note per il design |
|---|---|---|
| `/` | Home, 9 sezioni | Vedi §4 |
| `/come-funziona` | Come l'AI vede la tecnica | **Aggiungi:** tabella *YouTube vs Motion Insight*; sezione *"Cosa vede l'AI"* con overlay scheletro annotato (angolo ginocchio, allineamento schiena, profondità, simmetria) |
| `/funzionalita` | Tutte le funzioni | **"Correzione forma in tempo reale" prima e più grande** (è il differenziale) |
| `/per-chi` | 6 segmenti | **Una foto reale per segmento** |
| `/prezzi` | Free / Premium €9,90 / Annuale €79,90 | **Aggiungi:** tabella comparativa con spunte, sezione **B2B** (welfare aziendale), FAQ pricing |
| `/storie` | Testimonianze | Stato **"in arrivo"** onesto ora; progetta **anche** il layout futuro (foto, nome, città, sport, risultato, prima/dopo Form Score) |
| `/risorse` | Indice blog + filtro categorie (Tecnica/Allenamento/Nutrizione/Prevenzione) | Card articolo |
| `/risorse/[slug]` | Articolo | Hero immagine, corpo leggibile, CTA finale |
| `/faq` | 7 domande (privacy, camera, principianti, disdetta, disclaimer medico) | Accordion |
| `/chi-siamo` | Missione + 3 valori | Tono umano |
| `/scarica` | Installazione PWA | Istruzioni iOS/Android + bottone "Installa ora" |
| `/privacy`, `/terms` | Legali | Sobrie, leggibili |

### 3.2 Onboarding & Auth (9) — *il funnel di conversione*
| URL | Cosa fa | Note per il design |
|---|---|---|
| `/onboarding/step1` | **Quiz** — obiettivo + livello | **Un passo per schermata**, barra avanzamento, risposte come **grandi card toccabili** |
| `/onboarding/step2` | Quiz — attrezzatura | idem |
| `/onboarding/step3` | Quiz — dati fisici, giorni/settimana, infortuni | idem |
| `/onboarding/piano` | **"Ecco il tuo piano"** — anteprima personalizzata **prima** della registrazione | Momento chiave: mostra il valore, poi CTA *"Salva il mio piano"* |
| `/registrati` | Registrazione | **Google e Apple in evidenza** (logo ufficiali), poi email/password; consenso GDPR |
| `/login` | Accesso | idem + "Password dimenticata" |
| `/forgot-password`, `/reset-password`, `/verify-email` | Recupero/verifica | Stati chiari (inviato, scaduto, errore) |
| `/onboarding/step4` | Salvataggio piano + generazione AI | Schermata di attesa "il tuo piano si sta costruendo" |

**Da progettare ex-novo (non ancora esistenti):** schermata di **priming permesso camera** (spiega perché serve + badge privacy, con opzione "Più tardi" → modalità senza camera) e **calibrazione + primo Form Score** (il primo "wow" entro 60 secondi).

### 3.3 Area utente — web app desktop **e** mobile (17) — *cuore del prodotto*
Navigazione: **5 tab** — Home · Allena · Nutrizione · Progressi · Profilo (**barra in basso su mobile**, **sidebar su desktop** con upsell Premium).

| URL | Cosa fa | Note per il design |
|---|---|---|
| `/dashboard` | **Home "Oggi"** | Top bar (data, saluto, streak) · prompt **"Come ti senti oggi?"** (Energico/Stanco/Poco tempo → banner "Ho ridotto il volume del 15%") · **Form Score protagonista** (anello, verdetto, correzione prioritaria, sotto-punteggi) · bottone gigante **INIZIA** con l'allenamento del giorno · riepilogo settimana · costanza · equilibrio muscolare. **Stato vuoto**: primo accesso guidato |
| `/allenamento` | Lista piani | Card piano, progressi |
| `/allenamento/[id]` | Dettaglio piano | Giorni, esercizi |
| `/allenamento/[id]/sessione` | **Allenamento attivo** | **Alto contrasto, numeri GIGANTI** (rep, recupero) leggibili a 2-3 m · pulsanti enormi (Pausa/Salta/Fine serie) · coach vocale · a fine serie suggerimento carico ("+2 kg") · a fine workout riepilogo con Form Score |
| `/allenamento/genera-ai` | Generazione piano AI | Streaming, attesa "viva" |
| `/allenamento/nuovo` | Piano manuale | Form |
| `/analisi` | Scelta esercizio da analizzare | Griglia |
| `/analisi/sessione` | **Ripresa video** | Countdown 15s a tutto schermo · registrazione · **overlay scheletro 33 punti** · stati: permesso negato, luce insufficiente, senza camera · schermata di elaborazione |
| `/analisi/report/[id]` | **Report analisi** | Form Score grande · correzioni prioritarie · alert infortunio · "tecnica ricostruita" · confronto col PT |
| `/esercizi` | Catalogo esercizi | Filtri, card con preview video |
| `/esercizi/[slug]` | Dettaglio esercizio | Biomeccanica, video PT, curva 1RM |
| `/nutrizione` | Piano del giorno | Macro/calorie (gauge) · diario rapido · **da progettare:** "Sostituisci ingrediente", **"Svuota-Frigo"**, lista spesa |
| `/progressi` | Progressi | **Form Score nel tempo in cima** (KPI differenziante) · carichi e 1RM · traguardi/badge · proiezione AI |
| `/profilo` | Profilo | Dati/obiettivi · **abbonamento** · permessi (camera, notifiche, wearable) · **privacy/GDPR** (esporta/elimina) · preferenze coach vocale |
| `/ai-coach` | Chat AI contestuale | Bolle, streaming |
| `/community` | Feed sociale (MVP) | Card post |
| `/abbonamento` | Piani e gestione | Upgrade, portale Stripe |

**Principi area utente:** minimo inserimento manuale · primo valore entro 60s · **stati vuoti sempre progettati** · feedback immediato ad ogni azione · naming "Home", mai "Dashboard/Pannello".

### 3.4 Admin (8) — *backoffice, priorità bassa*
`/admin/users` · `/admin/subscriptions` · `/admin/exercises` · `/admin/stats` · `/admin/admins` · `/admin/ai-usage` · `/admin/activity`
Tabelle dense, filtri, drawer di dettaglio, metriche. Stile sobrio, stessa palette.

---

## 4. HOME — le 9 sezioni con il copy definitivo

1. **HERO** — H1: *"Alleni da solo? Ora hai un **occhio esperto** che ti guarda."*
   Sub: *"Motion Insight usa la fotocamera per vedere la tua tecnica e correggerti in tempo reale — così migliori davvero, senza farti male."*
   CTA coral **"Trova il tuo percorso"** · secondario "Guarda la demo" · micro *"Gratis · nessuna carta · 2 minuti"* · badge *"🔒 Il video resta sul tuo telefono."* · 3 badge: Nessun attrezzo · In tempo reale · In italiano
2. **PER CHI SEI** *(manca nell'handoff)* — *"Da dove vuoi **partire**?"* / *"Ogni corpo e ogni obiettivo hanno il loro percorso. Scegli il tuo."*
   6 card: Corro · Mi alleno a casa · Vado in palestra · Riparto dopo un infortunio · Ho superato i 50 · Torno in forma dopo la gravidanza
3. **TI RICONOSCI?** *(manca nell'handoff)* — *"Ti suona **familiare**?"* / *"Non è colpa tua: nessuno ti ha mai detto cosa stavi sbagliando."*
   4 frasi: *"Faccio gli esercizi ma non sono sicuro di farli bene."* · *"Ho un fastidio ricorrente a schiena, ginocchia o spalle."* · *"Mi alleno da mesi ma i risultati non arrivano."* · *"Un personal trainer costa troppo per seguirmi sempre."*
4. **COME FUNZIONA** — *"Dalla fotocamera al **consiglio**, in un attimo."* — 4 step: Inquadra e muoviti → L'AI legge **33 punti** (30 volte al secondo) → Ricevi la correzione → Il piano si adatta
5. **IL TUO FORM SCORE** — *"La qualità dei tuoi movimenti, finalmente **misurabile**."* — punteggio 0-100 + grafico "+18% questo mese"
6. **SICUREZZA & PRIVACY** — *"La tua privacy è **sacra**. La tua sicurezza anche."* — on-device, nessun filmato salvato; esercizi adatti al livello
7. **STORIE** — *"Le prime storie stanno **arrivando**."* — nota di onestà
8. **PREZZI** — *"Un piano per **ogni obiettivo**."* — 3 piani + *"Prova 7 giorni gratis · Disdici quando vuoi · Rimborso entro 30 giorni."*
9. **CTA FINALE** — *"Pronto a **migliorare davvero**?"* — una sola CTA coral

**De-duplicazione obbligatoria:** i **33 punti** solo nella sez. 4 · **Form Score/+18%** solo nella sez. 5 · **on-device** solo hero + sez. 6 (e FAQ) · una sola barra statistiche in pagina.

---

## 5. CONSEGNA ATTESA

Mockup **desktop + mobile** per ogni schermata, con **stati** (vuoto / pieno / caricamento / errore) dove rilevante.

**Ordine di priorità:**
1. **Home** (9 sezioni) + header/footer
2. **Area utente: Home "Oggi"** e **Allenamento attivo** (i due schermi che fanno restare gli utenti)
3. **Quiz onboarding** + "Ecco il tuo piano" + registrazione
4. **Analisi**: ripresa video + report Form Score
5. Prezzi, Come funziona, Funzionalità, Per chi
6. Nutrizione, Progressi, Profilo
7. Storie, Risorse, FAQ, Chi siamo, Scarica, legali
8. Admin

Se una scelta di leggibilità richiede una deviazione dai token, segnalala.
