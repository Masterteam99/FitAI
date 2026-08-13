# Handoff — Redesign LANDING + pagine marketing (per sessione "Claude design")

> Brief operativo per la sessione dedicata al design/copy del sito. Da leggere per primo.

## Obiettivo
Ricostruire/rifinire con **alta qualità di design** la **landing e le pagine marketing** di Motion Insight,
applicando il **copy v2 già stabilito**. Mantenere la struttura delle sezioni definita nel documento copy.

## Fonte di verità (COPY)
- ✅ **USA SOLO:** `MOTION_INSIGHT_COPY_FINALE.md` — è il copy v2, con le decisioni aggiornate
  (in-tre-passi, "4 card fuse", confronto competitor, privacy video, ecc.).
- 🚫 **IGNORA:** `MOTION_INSIGHT_DESIGN_COPY_MASTER.md` — è una versione **più vecchia** e in parte
  contraddittoria (6 segmenti, 4 feature, pagina "Cosa fa"). Non usarla come fonte.

## Dove vive il copy nel codice
- I testi stanno in **`src/content/copy.ts`** (oggetto `copy`). Le pagine marketing sono in
  **`src/app/(marketing)/`**.
- Esiste già un sistema **SiteContent** (`useCopy()` in `src/content/CopyProvider.tsx`) per rendere i copy
  editabili da admin senza deploy: **per ora è cablato solo su Prezzi**. Facoltativo estenderlo; se lo fai,
  segui il pattern di `src/app/(marketing)/prezzi/PrezziContent.tsx`.

## Regola sui contenuti "in lavorazione" (IMPORTANTE)
Costruisci **tutte le sezioni** di ogni pagina secondo la struttura di `COPY_FINALE`. Dove il contenuto è
marcato `[✍️ IN LAVORAZIONE]` o `[🧩 DATI]`, **crea comunque la sezione/lo spazio** con un **placeholder
chiaramente etichettato** `[DA COMPLETARE]`. **NON inventare** bio, storie personali o prezzi.

| Pagina | Stato struttura | Cosa lasciare come placeholder |
|--------|-----------------|--------------------------------|
| **Prezzi** | Completa (incl. 2 tabelle competitor) | Solo verifica numeri competitor → nota `[DATI da verificare]` |
| **FAQ** | Completa (7 titoli nuove domande già elencati) | Le **risposte** alle 7 domande → `[DA COMPLETARE]` |
| **Chi siamo** | Solo scheletro (Vision → Chi siamo → Focus cofondatore → chiusura) | **Tutto il testo** → 4 blocchi placeholder `[DA COMPLETARE — dati dal team]` |

## Convenzioni di progetto (obbligatorie)
- Leggi **`AGENTS.md`**: questo Next.js ha breaking changes — **consulta `node_modules/next/dist/docs/`
  prima di scrivere codice**. Rispetta il **diario di sessione** (aggiorna `COSE_FATTE_IN_SESSIONE.md` e
  `COSE_DA_FARE.md` a fine sessione).
- Stato attuale: il lavoro feature è sul branch **`feature/account-manager-completo`** (pushato, non ancora
  in `main`). **Prima di iniziare**, integra quel branch (merge in `main` o parti da lì) per non divergere.
- Usa le skill di design (`frontend-design` / `redesign`) per la qualità visiva; mantieni il verde firma
  `#3fae5a` e lo stile organico esistente.

## Definition of done
- Tutte le pagine marketing costruite/rifinite con il copy `COPY_FINALE`, sezioni al posto giusto.
- I 3 buchi lasciati come placeholder etichettati (niente contenuti inventati).
- `tsc` + ESLint puliti; verifica visiva delle pagine nel browser.
- Diari aggiornati.
