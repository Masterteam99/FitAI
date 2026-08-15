> ## ⚠️ STATO REALE — aggiornato 2026-08-15
> **Fonte autorevole dello stato di avanzamento: i due diari `COSE_FATTE_IN_SESSIONE.md` + `COSE_DA_FARE.md`.** Questo file è un **changelog storico** del restyling (palette navy/coral/Sora SUPERATA dal tema scuro/lime): NON usarlo per lo stato attuale. Snapshot: oltre a quanto già chiuso al 14/08, in Sessione 6 chiuso MVP polish + piano "Sessione/Nutrizione/Analisi" (10 fasi, vedi `DOCUMENTAZIONE_FLUSSI.md` (§7-8-10, §14bis) e `COSE_FATTE_IN_SESSIONE.md` (Sessione 6)); branch **`feature/mvp-launch-polish`** (non ancora in `main`).

---

# Aggiornamenti — Restyling Motion Insight

*Changelog della sessione di restyling. Branch: `feat/restyling-motion-insight` (da `main`).*

> **Nota (12 ago 2026):** questo restyling è stato **merged su `main`** (commit `af8fdac`); il changelog sotto resta come registro storico della sessione. La fase successiva (Area Utente v2 + Account Manager) è descritta in `STATO_PROGETTO.md` e `MOTION_INSIGHT_AREA_UTENTE_v2.md`.

---

## Direzione decisa
- **Brand:** FitAI/FormAI → **Motion Insight**.
- **Palette:** navy `#16213E` (base scura/enfasi), **coral `#E94560` solo azioni/CTA** (una per schermata), teal `#0F9E99` (link/evidenze), lime `#C6F135` (positivi), neutri chiari `#F4F7FB`/`#EAF1F8`.
- **Tipografia:** display **Sora** (geometrico) + corpo **Inter**. Base marketing chiara.
- I mockup "Direzione C" (scuro/verde) sono stati **superati per il colore**; se ne è tenuta solo la **struttura** dell'area utente (analisi-centrica), ristilata navy/coral.

## Fase 1 — Bug React #231
- Verificato: nessun handler evento passato come stringa nel codice; landing carica con console pulita. Il bug era nel prototipo HTML del tool di design, non nell'app. Nessuna modifica al codice.

## Fase 2 — Landing multi-pagina
- Header sticky, **nav 5 voci** (Come funziona · Per chi · Prezzi · Storie · Risorse) + Accedi + **Prova Gratis** (coral).
- Nuova route **`/scarica`**. Footer con **P.IVA** (placeholder "da inserire") + link Scarica; barra CTA fissa mobile e badge on-device già presenti.

## Fase 3 — Home a 9 sezioni
- Home ricostruita: **Hero** ("Alleni da solo? Ora hai un occhio esperto che ti guarda") → **Per Chi Sei** (6 segmenti) → **Ti riconosci?** (4 pain) → **Come Funziona** (33 punti solo qui) → **Il tuo Form Score** (Form Score/+18% solo qui) → **Sicurezza & Privacy** → **Storie** → **Prezzi** (3 piani) → **CTA finale**.
- De-duplicazione dei proof-point verificata via DOM.

## Fase 4 — Onboarding & Login (parte sicura)
- CTA landing "Trova il tuo percorso" → **quiz** (`/onboarding/step1`).
- Nuova schermata **"Ecco il tuo piano"** (`/onboarding/piano`): anteprima personalizzata dai dati del quiz (sessionStorage) **prima** della registrazione; CTA "Salva il mio piano" → `/registrati?from=piano`.
- Registrazione: **Google** in evidenza + **Apple** predisposto ("presto"); redirect post-auth a `step4` se si arriva dal quiz.
- **Rimandato** (auth-sensibile): salvataggio reale post-registrazione, Apple OAuth, priming camera, primo Form Score.

## Fase 5 — Area utente
- Navigazione alle **5 tab del documento**: Home · Allena · Nutrizione · Progressi · Profilo — **barra tab fissa in basso su mobile** + sidebar desktop, logo Motion Insight, upsell Premium, admin condizionale.
- Home: prompt **"Come ti senti oggi?"** (Energico/Stanco/Poco tempo) con banner di adattamento (ricalcolo reale = feature backend).
- Dashboard (da sessione precedente): **FormScoreHero** (Form Score protagonista dall'ultima analisi) + top bar.
- **Rimandato**: Allena (overlay AI/coach vocale/stati), Nutrizione (Svuota-Frigo/sostituzione), stati vuoti, verifica loggati.

## Fase 6 — PWA
- Manifest rebrandizzato **Motion Insight** (theme/background navy, shortcut Home/Analisi forma/Progressi), **icona navy+onda lime**, PNG 192/512/apple rigenerate (script `sharp`), `themeColor` layout navy.
- `/scarica`: bottone **"Installa ora"** (`beforeinstallprompt`) + rilevamento iOS con hint. SW registrato solo in produzione → install reale da provare su deploy.

## Documenti di design prodotti
- `docs/brief-redesign-claude-design.md` — brief per Claude Design.
- `docs/landing-design-spec-claude-design.md` — spec landing (tema, copy, animazioni, immagini open-source).

## Fuori dal restyling — feature PT reference biomeccanico
- Branch separato **`feat/pt-reference-biomeccanico`**: estrazione una-tantum del profilo biomeccanico del video PT (browser admin) + confronto numerico L3. Migrazione `Exercise.referenceProfile` **già applicata al DB**. Mancano i **click admin** per estrarre i 18 profili.

## Stato tecnico
- **Typecheck 0 errori, lint 0 errori** a ogni fase. Verifiche via DOM/console (screenshot non disponibili nell'ambiente).
- Il restyling è su `feat/restyling-motion-insight`, **non ancora su `main`**.
