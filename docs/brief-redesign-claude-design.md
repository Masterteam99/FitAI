# Brief per Claude Design — Redesign Motion Insight (landing + area utente)

> Messaggio pronto da incollare in Claude Design. Consolida lo stato attuale e la direzione decisa.

---

## 1. Prodotto e posizionamento
**Motion Insight** è un personal trainer AI che, tramite la **fotocamera + computer vision**, **vede gli errori di tecnica** e li corregge. Differenziale unico: **correzione della forma** con un **Form Score 0–100** (biomeccanica oggettiva + analisi AI + confronto con video di un PT). Non è "l'ennesima app di schede": il cuore è "l'AI che vede dove sbagli, prima che ti faccia male". Mercato: Italia, tono italiano, mobile-first.

## 2. Direzione visiva DECISA — usare questa
> Nota importante: le esplorazioni precedenti (Direzione A/B/C, **base scura + verde acceso**, brand "FitAI") sono **superate per la parte cromatica**. La direzione definitiva è quella qui sotto. Della vecchia esplorazione si tiene **solo la STRUTTURA dell'area utente** (dashboard analisi-centrica), ma ristilata coi colori qui sotto.

- **Brand:** Motion Insight (non più "FitAI").
- **Palette:**
  - Navy `#16213E` — base scura, header/blocchi d'enfasi, testi forti
  - Coral `#E94560` — **SOLO azioni/CTA** (regola: una sola azione coral per schermata)
  - Teal `#0F9E99` — link, etichette di supporto, evidenze nei titoli
  - Lime `#C6F135` — stati positivi, Form Score alto, micro-accenti
  - Neutri chiari `#F4F7FB` / `#EAF1F8` — sfondi sezioni/card
  - Testo `#1B1B1B` / `#555555`
  - **Base marketing CHIARA** (cloud), con blocchi navy per contrasto ed enfasi.
- **Tipografia:** display geometrico **Sora** (sportivo/tech), corpo **Inter**. Gerarchia netta, numeri (Form Score, rep) grandi e leggibili.
- **Componenti:** bottoni pill (coral pieno / navy / outline), card chiare con ombra morbida e angoli 18–24px, badge/pill, **anello Form Score**, **overlay scheletro** per l'analisi (nodi luminosi, stato verde/rosso), grafici puliti.
- **Icone:** set lineare (Lucide/Phosphor). Foto reali di persone che si allenano (no stock patinato).
- **Regole trasversali:** mobile-first (75%+ del traffico), contrasto WCAG AA, feedback non solo a colore (anche testo/icona), aree touch ≥44px, sottotitoli nei video demo.

## 3. Cosa è GIÀ costruito (allineati, non reinventare la struttura)
Ho già implementato in codice (Next.js), in questa direzione navy/coral:
- **Landing multi-sezione** con header sticky (Home, Come Funziona, Funzionalità, Per Chi, Prezzi, Storie, Risorse, FAQ, Chi Siamo), footer completo, barra CTA mobile, badge privacy "on-device".
- **Home** con 8 blocchi: hero *"L'AI che vede gli errori nella tua tecnica prima che ti facciano male"* + CTA coral *"Calcola il tuo piano gratis"*, barra fiducia, "il problema" (3 pain), 3 pilastri (correzione forma / piano adattivo / nutrizione dinamica), mini-demo, prezzi, CTA finale + FAQ rapida.
- **Risorse/Blog** con filtro categorie + articoli; **Storie** con stato "in arrivo".
- **Area utente**: Dashboard con **Form Score protagonista** (verdetto + correzione + sotto-punteggi + rischio), sidebar a 5 voci (Dashboard/Esercizi/Analisi forma/Progressi/Nutrizione) + upsell Premium.

Serve **elevare la qualità visiva** di queste parti e progettare bene le schermate ancora grezze, restando dentro i token sopra.

## 4. Cosa ridisegnare (schermata per schermata, desktop + mobile, con stati vuoto/pieno)

### Landing
1. **Home** — rendere il differenziale evidente in 5 secondi. Hero con video/loop demo (persona che fa squat + overlay scheletro 33 punti + Form Score live). Gli 8 blocchi sopra.
2. **Come Funziona** — "in 3 passi" (riprendi → l'AI legge 33 punti → ricevi correzione + piano), "cosa vede l'AI" (overlay annotato), YouTube vs Motion Insight, privacy on-device.
3. **Funzionalità** — card, con **"Correzione forma in tempo reale" prima e più grande**.
4. **Per Chi** — segmenti (runner, casa, palestra, post-parto, over 50, post-infortunio).
5. **Prezzi** — Free / Premium €9,90 (evidenziato) / Annuale €79,90 (-33%), tabella comparativa, trust.
6. **Storie** — layout testimonianze (per ora stato "in arrivo").
7. **Risorse/Blog** — indice con categorie + pagina articolo.
8. **FAQ / Chi Siamo** — sobrie, focus privacy/camera.

### Area utente (struttura analisi-centrica dei mockup, ristilata navy/coral)
1. **Dashboard "Oggi"** — top bar (data + saluto + streak), **Form Score protagonista** (anello, verdetto, correzione prioritaria, sotto-punteggi L1/L2/L3, rischio), Volume allenamento, Costanza (heatmap), Equilibrio muscolare (mappa corporea). Naming "Home", non "Dashboard/Pannello".
2. **Allenamento attivo** — alto contrasto, **numeri giganti** (rep/recupero) leggibili a 2–3 m, overlay AI (scheletro + verde/rosso + messaggio breve), bottoni enormi, suggerimento carico successivo, riepilogo sessione con Form Score.
3. **Analisi forma** — flusso ripresa → analisi → report (Form Score, correzioni prioritarie, confronto col PT).
4. **Nutrizione** — piano del giorno + macro, **sostituisci ingrediente**, **Svuota-Frigo**, lista spesa.
5. **Progressi** — **Form Score nel tempo** (KPI principale), 1RM stimato, proiezione AI, traguardi.
6. **Profilo** — dati/obiettivi, abbonamento, permessi camera/notifiche, privacy/GDPR.
7. **Sidebar** — 5 voci + card upsell Premium ("Analisi illimitata e AI Coach 24/7").

## 5. Cosa mi serve indietro
Mockup per **ogni schermata sopra**, **desktop + mobile**, con **stati** (vuoto/pieno/errore) dove rilevante, rispettando i token della sezione 2. Priorità: Home → Dashboard "Oggi" → Allenamento attivo → Prezzi → resto. Se proponi micro-deviazioni dai token per motivi di leggibilità/impatto, segnalale.
