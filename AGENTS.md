<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Diario di sessione (SEMPRE)

Questo progetto usa due documenti-diario alla radice, da mantenere **ogni sessione**:

- **`COSE_FATTE_IN_SESSIONE.md`** — cosa è stato fatto, come, cosa è cambiato e in che modo.
- **`COSE_DA_FARE.md`** — i next step per la sessione successiva.

**A INIZIO sessione:** leggi entrambi per capire da dove ripartire e cosa fare.

**A FINE sessione:** aggiorna entrambi:
- in `COSE_FATTE_IN_SESSIONE.md` aggiungi **in cima** una nuova voce di sessione **numerata + datata**
  (`## Sessione N — YYYY-MM-DD — titolo`), descrivendo cosa/come/cosa è cambiato (con gli hash dei commit se ci sono);
- in `COSE_DA_FARE.md` spunta ciò che è stato chiuso (`✅ FATTO (YYYY-MM-DD)`, non cancellare) e aggiungi
  i nuovi step **numerati** con la **data di inserimento** (`[agg. YYYY-MM-DD]`).

Le voci di entrambi i file vanno sempre **numerate in ordine e datate**.

## Aggiornare TUTTI i documenti di stato (non solo i due diari)

I due diari sopra sono la fonte autorevole, ma **non sono gli unici documenti da toccare**. Diversi
altri file alla radice portano in cima un banner `⚠️ STATO REALE — aggiornato ...` che riassume lo
stato corrente e rimanda ai diari. Quel banner **va aggiornato ogni sessione insieme ai diari**,
altrimenti quei documenti restano disallineati e diventano fuorvianti per chiunque (umano o agente) li
legga senza passare prima dai diari.

**A FINE sessione**, dopo aver aggiornato i due diari:
1. Trova tutti i file col banner: `grep -rl "STATO REALE" --include="*.md" .`
2. In ognuno, sostituisci il blocco banner in cima (dalla riga `> ## ⚠️ STATO REALE` fino al `---` che
   lo chiude) con una versione aggiornata: nuova data/numero sessione, riassunto di cosa è cambiato in
   questa sessione (poche righe, non serve ripetere tutto il dettaglio: quello sta nei diari), sezione
   "Aperti" aggiornata.
3. Non serve riscrivere il resto del documento (spesso è storico/superato "vedi i diari se in
   conflitto") — solo il banner in cima.

Alla data in cui questa nota è stata scritta i file coinvolti erano: `README.md`, `ROADMAP.md`,
`STATO_PROGETTO.md`, `CHECKLIST_DEPLOY.md`, `DOCUMENTAZIONE_FLUSSI.md`, `AGGIORNAMENTI.md`,
`MOTION_INSIGHT_AREA_UTENTE_v2.md`, `MOTION_INSIGHT_COMPLETE.md`,
`MOTION_INSIGHT_Documentazione_Pagine_Completa.md`, `MOTION_INSIGHT_PROSSIMI_STEP.md` — ma **non
fidarti di questo elenco**, potrebbe cambiare: usa sempre il grep per trovare l'elenco reale.
