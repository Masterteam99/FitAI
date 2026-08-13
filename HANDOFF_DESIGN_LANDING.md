# Handoff — Aggiungere pagine + copy alla LANDING (NON toccare il design)

> Brief operativo per la sessione dedicata al copy/contenuti del sito. Da leggere per primo.

## ⛔ Vincolo #1 — NON modificare il design attuale
Il design attuale **piace e va mantenuto così com'è**. **NON** fare redesign, **NON** cambiare stile,
colori, tipografia, spaziature o layout esistenti. **Riusa** i componenti, le classi e i pattern già
presenti nel progetto. L'obiettivo è **solo aggiungere le pagine e i contenuti mancanti** e mettere il
**copy v2** nelle sezioni corrette, con **lo stesso identico linguaggio visivo** già in uso.

## Obiettivo
- **Aggiungere/completare** le pagine e le sezioni marketing previste dal copy v2, dove mancano.
- **Inserire il copy corretto** nelle sezioni giuste.
- Quando una sezione non esiste ancora, **crearla riusando i componenti/stili esistenti** (stesse Card,
  stessi titoli/eyebrow, stessa griglia) — **senza inventare una nuova estetica**.

## Fonte di verità (COPY)
- ✅ **USA SOLO:** `MOTION_INSIGHT_COPY_FINALE.md` — copy v2, con le decisioni aggiornate.
- 🚫 **IGNORA:** `MOTION_INSIGHT_DESIGN_COPY_MASTER.md` — versione vecchia e contraddittoria.

## Dove vive il copy nel codice
- Testi in **`src/content/copy.ts`** (oggetto `copy`). Pagine marketing in **`src/app/(marketing)/`**.
- Prima di creare una sezione nuova, **guarda come sono fatte le sezioni esistenti** (es. la home) e
  **riusa gli stessi componenti** (`Card`, `SlideUp`/`FadeIn`, classi tipografiche `text-display-*`, ecc.).
- Esiste il sistema **SiteContent** (`useCopy()`, `src/content/CopyProvider.tsx`), per ora cablato solo su
  Prezzi (`src/app/(marketing)/prezzi/PrezziContent.tsx`). Facoltativo estenderlo; se lo fai, non cambiare
  la resa visiva.

## Regola sui contenuti "in lavorazione"
Crea **tutte le sezioni** previste. Dove il contenuto è marcato `[✍️ IN LAVORAZIONE]` o `[🧩 DATI]`,
**crea comunque la sezione** (con lo stile esistente) e metti un **placeholder etichettato** `[DA COMPLETARE]`.
**NON inventare** bio, storie o prezzi.

| Pagina | Struttura | Cosa lasciare come placeholder |
|--------|-----------|--------------------------------|
| **Prezzi** | Completa (2 tabelle competitor incluse) | Verifica numeri competitor → `[DATI da verificare]` |
| **FAQ** | Completa (7 titoli nuove domande elencati) | Le **risposte** alle 7 domande → `[DA COMPLETARE]` |
| **Chi siamo** | Scheletro (Vision → Chi siamo → Focus cofondatore → chiusura) | **Tutto il testo** → 4 blocchi `[DA COMPLETARE — dati dal team]` |

## Convenzioni di progetto (obbligatorie)
- Leggi **`AGENTS.md`**: questo Next.js ha breaking changes — consulta `node_modules/next/dist/docs/`
  prima di scrivere codice. Aggiorna i diari (`COSE_FATTE_IN_SESSIONE.md`, `COSE_DA_FARE.md`) a fine sessione.
- Il lavoro recente è sul branch **`feature/account-manager-completo`** (pushato, non in `main`).
  **Prima** integralo (merge in `main` o parti da lì), poi lavora.

## Definition of done
- Pagine/sezioni marketing mancanti aggiunte, copy `COPY_FINALE` al posto giusto, **design invariato**.
- 3 buchi come placeholder etichettati (niente contenuti inventati).
- `tsc` + ESLint puliti; verifica visiva nel browser (deve assomigliare al design attuale).
- Diari aggiornati.
