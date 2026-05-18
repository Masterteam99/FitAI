# Data Templates — Istruzioni d'uso

Questa cartella contiene i template CSV per inserire i contenuti professionali del software FitAI. Ogni file ha intestazioni di colonna pre-impostate e 1-2 righe di esempio già compilate.

## File presenti

| File | Cosa contiene | Chi compila |
|---|---|---|
| `01-exercises.csv` | Catalogo esercizi (nome, istruzioni, muscoli, attrezzatura) | Personal trainer |
| `02-biomechanical-triggers.csv` | Regole angolari per i feedback automatici dell'analisi video | Personal trainer / fisioterapista |
| `03-workout-templates.csv` | Anagrafica piani di allenamento template | Personal trainer |
| `04-workout-templates-exercises.csv` | Esercizi giorno per giorno nei template piani | Personal trainer |
| `05-nutrition-templates.csv` | Anagrafica piani nutrizionali template | Nutrizionista |
| `06-nutrition-meals.csv` | Pasti settimanali dei piani nutrizionali | Nutrizionista |
| `07-nutrition-ingredients.csv` | Ingredienti dei pasti con quantità | Nutrizionista |
| `08-pt-videos.csv` | URL dei video PT di riferimento | Tecnico ripresa |

## Come aprirli e modificarli

### In Excel (Windows/Mac)
1. Apri Excel
2. **File → Apri → seleziona il `.csv`**
3. Se Excel chiede il separatore, scegli **virgola** (`,`)
4. Se i caratteri accentati sono strani, seleziona codifica **UTF-8** all'apertura

### In Google Sheets
1. Trascina il file `.csv` nel browser
2. Si apre direttamente come foglio editabile
3. Quando hai finito: **File → Scarica → Valori separati da virgola (.csv)**

### In LibreOffice Calc
1. File → Apri → seleziona il `.csv`
2. Filtra: codifica UTF-8, separatore di campo "Virgola", separatore di testo `"`

## Convenzioni importanti

- **Codifica file**: sempre **UTF-8** (Excel di solito chiede di confermarlo al salvataggio)
- **Separatore**: virgola `,`
- **Wrapping stringhe**: i campi che contengono virgole, accapo o virgolette devono essere racchiusi tra `"..."` (es. `"Concentrati sulla profondità, mantieni il busto verticale"`)
- **Liste multi-valore**: dentro una singola cella usa la pipe `|` come separatore (es. `BARBELL|BENCH|DUMBBELLS`)
- **Valori vuoti opzionali**: lascia la cella vuota (NON scrivere "null" o "N/A")
- **Booleani**: usa esattamente `true` o `false` (minuscolo)
- **Enum**: i valori ammessi (es. `BEGINNER`, `QUADRICEPS`) sono **case-sensitive**. Rispetta maiuscole/minuscole come da schema

## Per il documento completo

Apri **`DATA_AUTHORING_GUIDE.md`** nella root del progetto. Contiene:

- Spiegazione di ogni colonna con valori ammessi
- Esempi compilati per ogni file
- Linee guida editoriali (cosa scrivere, cosa evitare)
- Checklist di qualità prima dell'import
- Brief pronti da inoltrare ai professionisti

## Workflow d'insieme

```
Professionista compila CSV → invia al dev →
  → dev verifica con checklist (DATA_AUTHORING_GUIDE.md §9)
  → dev converte CSV in TypeScript (prisma/seed-*.ts)
  → npm run seed
  → dati caricati nel DB
  → visibili in app (/esercizi, /allenamento, /nutrizione)
```

La conversione CSV → TypeScript può essere fatta a mano dal dev oppure delegata a Claude Code (legge il CSV e produce il file `.ts` automaticamente).
