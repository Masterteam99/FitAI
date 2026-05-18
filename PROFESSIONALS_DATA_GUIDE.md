# FitAI — Guida all'autoraggio dei dati (per professionisti)

*Versione 1.0 — 14 maggio 2026*

Documento di riferimento per **chiunque debba inserire o modificare contenuti professionali** in FitAI tramite il formato Excel/CSV: esercizi, regole biomeccaniche, piani di allenamento e nutrizione, video dimostrativi. Pensato per i **professionisti del settore** (personal trainer, nutrizionisti, fisioterapisti) ai quali può essere mandata la sola sezione di pertinenza con il relativo template Excel.

> **Documento gemello tecnico**: `DATA_AUTHORING_GUIDE.md` — pensato per chi scrive direttamente i file TypeScript del seed. Questo documento (`PROFESSIONALS_DATA_GUIDE.md`) è il *layer* a monte: i professionisti compilano CSV → il dev converte i CSV nei file `.ts` seguendo `DATA_AUTHORING_GUIDE.md`.

---

## Indice

1. [Panoramica: cosa sono i "dati" del software e dove vivono](#1-panoramica)
2. [Workflow completo: dal CSV al database](#2-workflow-completo)
3. [Esercizi](#3-esercizi)
4. [Regole biomeccaniche per i trigger](#4-regole-biomeccaniche)
5. [Piani di allenamento (workout templates)](#5-piani-di-allenamento)
6. [Piani nutrizionali](#6-piani-nutrizionali)
7. [Video PT di riferimento](#7-video-pt-di-riferimento)
8. [Brief per i professionisti (testo da inoltrare)](#8-brief-per-i-professionisti)
9. [Checklist di qualità prima dell'import](#9-checklist-di-qualità)

---

## 1. Panoramica

FitAI conserva **tre categorie di dati professionali**:

| Categoria | A cosa serve | Chi la compila |
|---|---|---|
| **Esercizi** | Catalogo base: nome, descrizione, istruzioni, muscoli, attrezzatura | Personal trainer |
| **Regole biomeccaniche** | Range angolari attesi per ogni articolazione/fase + feedback se l'utente esce dal range. Alimenta l'analisi L1 (la parte deterministica del sistema di analisi video) | Personal trainer / fisioterapista |
| **Video PT** | URL del video "fatto bene" da cui il sistema estrae i frame per il confronto L3 (utente vs PT) | Personal trainer (riprese in studio) |
| **Workout templates** | Esempi di piano di allenamento usati come *few-shot examples* per Claude AI. Più ce ne sono e meglio sono fatti, più qualitativi sono i piani che l'AI genera per gli utenti | Personal trainer |
| **Nutrition templates** | Idem ma per piani alimentari settimanali | Nutrizionista |

Tutti questi dati vivono in **`prisma/seed-*.ts`** e vengono caricati nel database PostgreSQL quando il dev lancia `npm run seed`. Per i professionisti che non scrivono TypeScript, il flusso è:

```
Excel/CSV (compilato dal professionista)
         │
         ▼
Conversione manuale in TypeScript (fatta dal dev seguendo DATA_AUTHORING_GUIDE.md)
         │
         ▼
File prisma/seed-*.ts
         │
         ▼
npm run seed → dati nel database → visibili nell'app
```

Tutti i template Excel/CSV stanno in **`data-templates/`** nella root del progetto.

---

## 2. Workflow completo

### Per il professionista

1. Riceve via mail (o cartella condivisa) i file `.csv` rilevanti dalla cartella `data-templates/`.
2. Li apre in Excel / Google Sheets / Numbers.
3. Compila le righe seguendo lo schema descritto in questo documento.
4. Rispetta i **valori validi** (sono colonne con dropdown limitato — non inventare).
5. Salva sempre come **CSV UTF-8** (in Excel: "Salva con nome" → CSV UTF-8 (delimitato dalle virgole)).
6. Restituisce i file compilati.

### Per il dev

1. Riceve i CSV compilati.
2. Apre il foglio in Excel e fa un controllo veloce (vedi [Checklist §9](#9-checklist-di-qualità)).
3. Converte i CSV in TypeScript inserendo i dati negli array degli appositi file `prisma/seed-*.ts`, seguendo le strutture di tipo descritte in `DATA_AUTHORING_GUIDE.md`.
4. Lancia `npm run seed` per popolare il DB.
5. Verifica visivamente con `npx prisma studio` e nell'app (`/esercizi/[slug]`).

> **Nota**: la conversione CSV→TypeScript può essere fatta a mano oppure delegata a Claude Code (legge i CSV e produce i file `.ts` automaticamente). In entrambi i casi, `DATA_AUTHORING_GUIDE.md` resta la fonte di verità sui tipi.

---

## 3. Esercizi

**File template**: `data-templates/01-exercises.csv`
**File destinazione codice**: `prisma/seed.ts` array `exercises` (riga 38+)
**Tabella DB**: `Exercise`

### Schema colonne

| Colonna | Obbligatorio | Tipo | Valori validi / esempi | Descrizione |
|---|---|---|---|---|
| `slug` | ✅ | string kebab-case | `squat`, `stacco-da-terra`, `panca-piana` | Identificatore univoco, solo minuscole + trattini. Usato come riferimento ovunque (nei template, nelle regole biomeccaniche, nelle URL). **Non cambiare mai uno slug dopo che è in produzione.** |
| `name` | ✅ | string | "Squat", "Stacco da Terra" | Nome visualizzato all'utente |
| `description` | ✅ | string lunga | "Il re degli esercizi per le gambe…" | 1-2 frasi che spiegano l'esercizio |
| `instructions` | ✅ | lista separata da `\|` | "Piedi alla larghezza spalle\|Petto aperto\|Scendi…" | 5-7 passi numerati di esecuzione corretta. Separatore: pipe `\|` (verticale) |
| `muscleGroupPrimary` | ✅ | enum | `CHEST, BACK, SHOULDERS, BICEPS, TRICEPS, FOREARMS, CORE, QUADRICEPS, HAMSTRINGS, GLUTES, CALVES, FULL_BODY` | Muscolo principale lavorato |
| `muscleGroupsSecondary` | ❌ | lista separata da `\|` | `GLUTES\|HAMSTRINGS\|CORE` | Muscoli secondari (stessi valori di sopra) |
| `difficulty` | ✅ | enum | `BEGINNER, INTERMEDIATE, ADVANCED` | Livello richiesto |
| `equipment` | ✅ | lista separata da `\|` | `NONE\|DUMBBELLS\|BARBELL\|MACHINE\|RESISTANCE_BANDS\|PULL_UP_BAR\|BENCH\|KETTLEBELL\|CABLES\|FULL_GYM` | Attrezzatura necessaria. Se non serve niente: `NONE` |
| `category` | ✅ | enum | `STRENGTH, CARDIO, FLEXIBILITY, BALANCE, PLYOMETRIC, FUNCTIONAL` | Categoria dell'esercizio |
| `caloriesPerMinute` | ✅ | numero | `5` – `12` | Stima kcal bruciate al minuto (per un soggetto medio) |
| `recordingDurationSeconds` | ✅ | numero | `15`, `20`, `25` | Durata della registrazione video per l'analisi. 15s = esercizi rapidi/limitanti (curl, lateral raise); 20s = default (squat, panca); 25s = esercizi a tempo (plank) |
| `professionalNotes` | ❌ | string lunga | "Errori comuni: valgismo delle ginocchia…" | Note tecniche libere, errori comuni, riferimenti |
| `tags` | ❌ | lista separata da `\|` | `fondamentale\|gambe\|compound` | Tag liberi per ricerca e categorizzazione |

### Esempio compilato (riga)

```
squat,Squat,Il re degli esercizi per le gambe...,"Piedi alla larghezza delle spalle|Petto aperto|Inizia la discesa|Le ginocchia seguono le punte|Scendi al parallelo|Risali spingendo coi talloni",QUADRICEPS,GLUTES|HAMSTRINGS|CORE,INTERMEDIATE,NONE,STRENGTH,8,20,"Errori comuni: valgismo delle ginocchia. Angolo ginocchio ottimale: 90-110°.",fondamentale|gambe|compound
```

### Linee guida editoriali

- **Slug**: solo lowercase + trattini, no spazi, no caratteri speciali, no accenti. Es: `affondi-bulgari`, `face-pull`.
- **Description**: max 2 frasi. Spiega cosa fa l'esercizio e a chi è utile.
- **Instructions**: passi sequenziali, ognuno una frase corta. 5–7 passi è il sweet spot. Vista user-friendly.
- **professionalNotes**: qui puoi essere più tecnico. Vengono passate al modello AI per generare prompt più contestuali e aiutano la generazione del feedback.

---

## 4. Regole biomeccaniche

**File template**: `data-templates/02-biomechanical-triggers.csv`
**File destinazione codice**: `prisma/seed-biomechanical-specs.ts` oggetto `BIOMECHANICAL_SPECS`
**Tabelle DB**: `ExerciseBiomechanicalSpec` → `ExerciseMovement` → `MovementPhase` → `PhaseTrigger`

> Questa è la sezione **più importante** del sistema. Ogni regola che inserisci qui contribuisce al feedback automatico che gli utenti riceveranno dopo l'analisi video. **Più regole inserisci, più il sistema diventa preciso e utile.**

### Modello concettuale

La gerarchia è a 4 livelli:

```
Esercizio (es. "squat")
   └─ Movimenti (uno per ogni articolazione monitorata: left_knee, right_knee, spine, …)
        └─ Fasi (BOTTOM, TOP, CONCENTRIC, ECCENTRIC, ISOMETRIC, THROUGHOUT)
             └─ Trigger (cosa scatta se l'angolo esce dal range)
```

Per facilitare la compilazione Excel, abbiamo "appiattito" la gerarchia: **una riga = un trigger**. Le colonne di sinistra ripetono il contesto (esercizio, joint, fase, range) per dare a ogni riga senso da sola.

### Schema colonne

| Colonna | Obbligatorio | Tipo | Valori validi | Descrizione |
|---|---|---|---|---|
| `exerciseSlug` | ✅ | string | slug di un esercizio esistente (es. `squat`) | A quale esercizio si riferisce questa regola |
| `joint` | ✅ | enum | `left_knee, right_knee, left_elbow, right_elbow, left_shoulder, right_shoulder, left_hip, right_hip, spine` | Articolazione monitorata. **Per esercizi simmetrici devi inserire DUE righe**, una per left e una per right (es. left_knee + right_knee con stessi parametri) |
| `movementType` | ✅ | enum | `flessione, estensione, abduzione, adduzione, rotazione, inclinazione, iperestensione, neutrale` | Tipo di movimento articolare in quella fase |
| `phase` | ✅ | enum | `BOTTOM, TOP, CONCENTRIC, ECCENTRIC, ISOMETRIC, THROUGHOUT` | In quale fase del movimento la regola si applica. `THROUGHOUT` = sempre. `ISOMETRIC` = esercizi statici (plank). |
| `minAngle` | ✅ | numero (gradi) | 0–180 | Estremo inferiore del range angolare atteso |
| `maxAngle` | ✅ | numero (gradi) | 0–180 | Estremo superiore del range angolare atteso |
| `condition` | ✅ | enum | `BELOW_MIN, ABOVE_MAX, OUT_OF_RANGE` | Quale violazione scatena questo trigger. `BELOW_MIN` = scatta se l'angolo è sotto `minAngle`. `ABOVE_MAX` = scatta se sopra `maxAngle`. `OUT_OF_RANGE` = scatta in entrambi i casi. |
| `severity` | ✅ | enum | `WARNING, ERROR, CRITICAL` | Gravità. `WARNING` 🟡 = svista correggibile. `ERROR` 🟠 = errore tecnico. `CRITICAL` 🔴 = rischio infortunio |
| `feedback` | ✅ | string | testo libero, max 30 parole | Il messaggio che vedrà l'utente. Tono PT professionale ma accessibile. Italiano. Es: "Profondità insufficiente: il ginocchio non raggiunge il parallelo. Scendi finché la coscia è parallela al pavimento." |
| `injuryRisk` | ✅ | boolean | `true`, `false` | `true` se la violazione comporta rischio di infortunio (es. iperestensione lombare, ginocchio in valgo). Contribuisce al `injuryRiskAlert` finale |

### Esempio: squat (estratto, 3 righe su decine)

```
exerciseSlug,joint,movementType,phase,minAngle,maxAngle,condition,severity,feedback,injuryRisk
squat,left_knee,flessione,BOTTOM,70,110,ABOVE_MAX,ERROR,"Profondità insufficiente: il ginocchio non raggiunge il parallelo. Scendi finché la coscia è parallela al pavimento.",false
squat,left_knee,flessione,BOTTOM,70,110,BELOW_MIN,CRITICAL,"Discesa eccessiva sotto il parallelo. Rischio di stress capsulare sul ginocchio. Ferma la discesa al parallelo.",true
squat,spine,neutrale,THROUGHOUT,160,180,BELOW_MIN,CRITICAL,"Schiena arrotondata: rischio elevato di ernia lombare. Mantieni la colonna neutra durante tutta l'esecuzione.",true
```

### Linee guida per chi compila

- **Range realistici**: usa fonti autorevoli (NSCA Essentials of Personal Training, ACSM Guidelines). Evita di inventare valori.
- **Almeno 2-3 trigger per articolazione chiave**: tipicamente uno `BELOW_MIN` (es. profondità insufficiente) + uno `ABOVE_MAX` (es. iperestensione) + eventualmente un terzo specifico
- **Simmetria L/R**: per ogni regola su `left_X` devi duplicare con `right_X` (con identici parametri)
- **Feedback breve ma istruttivo**: dice **cosa non va** e **come correggere**. Niente generico tipo "fai meglio"
- **injuryRisk = true solo se è VERAMENTE pericoloso**: non inflazionarlo. Esempi reali di `true`: ginocchio in valgo, schiena arrotondata sotto carico, gomito iperesteso in panca, spalla addotta nel military press
- **Articolazioni disponibili**: solo quelle elencate (limite di MediaPipe BlazePose). Non puoi tracciare polsi/caviglie con precisione angolare. Per il rachide cervicale tendi ad usare `spine`

### Quante regole servono per esercizio?

Riferimento indicativo:

- Esercizi composti complessi (squat, stacco, panca): 8–15 trigger
- Esercizi composti semplici (push-up, military press): 5–10
- Isolamento (curl bicipiti, lateral raise): 3–6
- Esercizi statici (plank): 2–4 (con `THROUGHOUT`)

---

## 5. Piani di allenamento (workout templates)

**File template**: `data-templates/03-workout-templates.csv` + `data-templates/04-workout-templates-exercises.csv`
**File destinazione codice**: `prisma/seed-workout-templates.ts` array `WORKOUT_TEMPLATES`
**Tabella DB**: `WorkoutPlanTemplate` (con `daysJson` come blob JSON)

> Questi template **non sono usati direttamente dagli utenti**. Sono *few-shot examples* che vengono iniettati nel prompt di Claude quando un utente chiede un piano AI. Più sono variati e ben rationalizzati, meglio l'AI lavora.

### Tabella A — Info template (1 riga per template)

File: `03-workout-templates.csv`

| Colonna | Obbligatorio | Tipo | Valori validi | Descrizione |
|---|---|---|---|---|
| `templateId` | ✅ | string univoco | `wt-001`, `wt-002`, … | ID locale per legare i giorni/esercizi alla tabella esercizi. Non finisce nel DB. |
| `name` | ✅ | string | "Forza Principianti Full-Body 4 Settimane" | Nome leggibile del piano |
| `description` | ✅ | string lunga | "Piano introduttivo per chi inizia in palestra…" | 1-3 frasi su cosa fa il piano e per chi è |
| `difficulty` | ✅ | enum | `BEGINNER, INTERMEDIATE, ADVANCED` | A quale livello è destinato |
| `targetGoals` | ✅ | lista `\|` separata | `LOSE_WEIGHT, BUILD_MUSCLE, ENDURANCE, FLEXIBILITY, GENERAL_FITNESS, ATHLETIC_PERFORMANCE` | Quali obiettivi soddisfa. Multipli ammessi |
| `requiredEquipment` | ✅ | lista `\|` separata | stessi valori di `Equipment` (vedi §3) | Attrezzatura richiesta complessivamente |
| `durationWeeks` | ✅ | numero | 2–16 | Durata totale del piano in settimane |
| `workoutsPerWeek` | ✅ | numero | 1–7 | Sedute per settimana |
| `rationale` | ✅ | string lunga | "Frequenza 3x/sett full-body per…" | **CRUCIALE**: spiegazione tecnica del razionale del piano (frequenza, volume, scelta esercizi). Viene letta da Claude per imparare. Sii esplicito |

### Tabella B — Esercizi per giorno (1 riga per esercizio)

File: `04-workout-templates-exercises.csv`

| Colonna | Obbligatorio | Tipo | Valori validi | Descrizione |
|---|---|---|---|---|
| `templateId` | ✅ | string | `wt-001` | Stesso ID della tabella A |
| `dayNumber` | ✅ | numero | 1–7 | Quale giorno della settimana del piano (1 = primo giorno) |
| `dayName` | ✅ | string | "Giorno A - Full Body", "Lunedì - Petto e Tricipiti" | Nome leggibile del giorno |
| `restDay` | ✅ | boolean | `true`, `false` | Se `true` il giorno è di riposo e non ci sono esercizi |
| `exerciseOrder` | ✅ se non rest | numero | 1, 2, 3, … | Ordine di esecuzione dell'esercizio nel giorno |
| `exerciseSlug` | ✅ se non rest | string | slug esistente | Riferimento esercizio (deve esistere in `01-exercises.csv`) |
| `sets` | ✅ se non rest | numero | 1–10 | Numero di serie |
| `reps` | ❌ | numero | 1–100 | Ripetizioni per serie. Lascia vuoto se è un esercizio a tempo |
| `durationSeconds` | ❌ | numero | 10–300 | Durata in secondi (per esercizi isometrici come plank). Mutualmente esclusivo con reps |
| `restSeconds` | ✅ se non rest | numero | 30–300 | Riposo tra le serie. Tipicamente 60 (isolamento), 90 (composti medi), 120-180 (forza pesante) |
| `notes` | ❌ | string | "Concentrati sulla profondità" | Note specifiche per quell'esercizio in quel piano |

### Esempio compilato

`03-workout-templates.csv`:
```
templateId,name,description,difficulty,targetGoals,requiredEquipment,durationWeeks,workoutsPerWeek,rationale
wt-001,"Forza Principianti Full-Body 4 Settimane","Piano introduttivo per chi inizia in palestra...",BEGINNER,GENERAL_FITNESS|BUILD_MUSCLE,BARBELL|BENCH|DUMBBELLS,4,3,"Frequenza 3x/sett full-body per massimizzare l'apprendimento motorio. Volume conservativo (3 set per esercizio)..."
```

`04-workout-templates-exercises.csv`:
```
templateId,dayNumber,dayName,restDay,exerciseOrder,exerciseSlug,sets,reps,durationSeconds,restSeconds,notes
wt-001,1,"Giorno A - Full Body",false,1,squat,3,10,,120,"Concentrati sulla profondità e la verticalità del busto."
wt-001,1,"Giorno A - Full Body",false,2,panca-piana,3,10,,120,
wt-001,1,"Giorno A - Full Body",false,3,rematore-bilanciere,3,10,,120,
wt-001,2,"Giorno Riposo",true,,,,,,,
wt-001,3,"Giorno B - Full Body",false,1,stacco-da-terra,3,8,,150,"Mantieni la schiena neutra in ogni rep."
...
```

### Linee guida

- **Varietà**: punta a coprire combinazioni diverse di `difficulty × targetGoals × requiredEquipment`. Esempio set: 3 BEGINNER (uno per goal principale) + 4 INTERMEDIATE + 3 ADVANCED
- **Rationale ricco**: scrivi il perché del piano in modo verboso (3-5 frasi). Claude usa questo testo per generare piani simili. Es. *"Split push/pull/legs per principianti avanzati. Volume settimanale 12-15 set per muscolo grande. Riposo 48-72h tra stimolazioni stesso muscolo per consentire la supercompensazione…"*
- **Coerenza esercizi-equipment**: se metti `requiredEquipment: NONE`, non usare esercizi con barbell. Il sistema poi userà questa combinazione per filtrare il match con il profilo utente
- **Almeno 1 giorno di riposo a settimana** per piani BEGINNER

---

## 6. Piani nutrizionali

**File template**: `data-templates/05-nutrition-templates.csv` + `data-templates/06-nutrition-meals.csv` + `data-templates/07-nutrition-ingredients.csv`
**File destinazione codice**: `prisma/seed-nutrition-templates.ts` array `NUTRITION_TEMPLATES`
**Tabella DB**: `NutritionPlanTemplate` (con `weeklyPlanJson` come blob)

> Stesso ruolo dei workout templates: few-shot per Claude. Servono almeno 5 template (uno per `dietType`: onnivora, vegetariana, vegana, chetogenica, mediterranea).

### Tabella A — Info template (1 riga per template)

File: `05-nutrition-templates.csv`

| Colonna | Obbligatorio | Tipo | Valori validi | Descrizione |
|---|---|---|---|---|
| `templateId` | ✅ | string | `nt-001`, `nt-002` | ID locale |
| `name` | ✅ | string | "Mediterranea — mantenimento donna 65kg" | Nome leggibile |
| `description` | ✅ | string lunga | "Piano alimentare bilanciato in stile mediterraneo…" | 2-3 frasi descrittive |
| `dietType` | ✅ | enum | `onnivora, vegetariana, vegana, chetogenica, mediterranea, altro` | Tipo di dieta |
| `targetGoal` | ✅ | enum | `LOSE_WEIGHT, BUILD_MUSCLE, ENDURANCE, FLEXIBILITY, GENERAL_FITNESS, ATHLETIC_PERFORMANCE` | Obiettivo a cui è adatto |
| `profile_weightKg` | ✅ | numero | 40–150 | Peso del profilo-tipo di riferimento per cui il piano è calibrato |
| `profile_heightCm` | ✅ | numero | 140–210 | Altezza profilo-tipo |
| `profile_age` | ✅ | numero | 18–80 | Età profilo-tipo |
| `profile_gender` | ✅ | enum | `M, F` | Sesso profilo-tipo |
| `profile_activityLevel` | ✅ | enum | `sedentario, leggero, moderato, intenso` | Livello attività profilo-tipo |
| `target_kcal` | ✅ | numero | 1200–4000 | Kcal totali giornaliere target |
| `target_proteinG` | ✅ | numero | 50–250 | Proteine in grammi giornaliere |
| `target_carbsG` | ✅ | numero | 30–500 | Carboidrati in grammi giornaliere |
| `target_fatG` | ✅ | numero | 30–200 | Grassi in grammi giornaliere |
| `rationale` | ✅ | string lunga | "Distribuzione 25/45/30 con focus su…" | **CRUCIALE**: spiegazione tecnica delle scelte alimentari per Claude |

### Tabella B — Pasti per giorno (1 riga per pasto)

File: `06-nutrition-meals.csv`

| Colonna | Obbligatorio | Tipo | Valori validi | Descrizione |
|---|---|---|---|---|
| `templateId` | ✅ | string | `nt-001` | ID dal template |
| `day` | ✅ | enum | `lunedi, martedi, mercoledi, giovedi, venerdi, sabato, domenica` | Giorno della settimana (lowercase, niente accenti) |
| `mealType` | ✅ | enum | `breakfast, lunch, dinner, snack` | Tipo di pasto. Per i snack ci possono essere più righe nello stesso giorno (snack1, snack2 con stessa label `snack`) |
| `mealOrder` | ❌ | numero | 1, 2 | Solo per snack: se ci sono 2 snack nello stesso giorno, distingui con 1 e 2. Per breakfast/lunch/dinner lascia vuoto |
| `mealName` | ✅ | string | "Yogurt greco con frutti di bosco e granola" | Nome del piatto |
| `estimatedKcal` | ✅ | numero | 100–1500 | Kcal del pasto |
| `estimatedProteinG` | ✅ | numero | 0–80 | Proteine del pasto |
| `estimatedCarbsG` | ✅ | numero | 0–150 | Carboidrati del pasto |
| `estimatedFatG` | ✅ | numero | 0–60 | Grassi del pasto |
| `preparationNotes` | ❌ | string | "Tostare la granola 5 minuti in padella" | Note preparative, opzionali |

### Tabella C — Ingredienti per pasto (1 riga per ingrediente)

File: `07-nutrition-ingredients.csv`

| Colonna | Obbligatorio | Tipo | Valori validi | Descrizione |
|---|---|---|---|---|
| `templateId` | ✅ | string | `nt-001` | ID dal template |
| `day` | ✅ | enum | come sopra | Giorno |
| `mealType` | ✅ | enum | come sopra | Tipo di pasto |
| `mealOrder` | ❌ | numero | 1, 2 | Come sopra (per snack multipli) |
| `food` | ✅ | string | "Yogurt greco 0%", "Petto di pollo" | Nome alimento in italiano comune |
| `quantityG` | ✅ | numero | 5–600 | Quantità in grammi (anche per liquidi usa grammi, 1ml ≈ 1g per acqua/latte) |

### Esempio

`05-nutrition-templates.csv`:
```
templateId,name,description,dietType,targetGoal,profile_weightKg,profile_heightCm,profile_age,profile_gender,profile_activityLevel,target_kcal,target_proteinG,target_carbsG,target_fatG,rationale
nt-001,"Mediterranea - mantenimento donna 65kg","Piano alimentare in stile mediterraneo per donna sedentaria/moderata...",mediterranea,GENERAL_FITNESS,65,168,32,F,moderato,2000,110,240,65,"Distribuzione 22/48/29 kcal proteine/carbo/grassi. Focus su cereali integrali, legumi, pesce 2-3 volte settimana..."
```

`06-nutrition-meals.csv`:
```
templateId,day,mealType,mealOrder,mealName,estimatedKcal,estimatedProteinG,estimatedCarbsG,estimatedFatG,preparationNotes
nt-001,lunedi,breakfast,,"Yogurt greco con frutti di bosco e granola",380,25,45,8,
nt-001,lunedi,lunch,,"Insalata di farro con pollo e verdure grigliate",520,38,55,12,"Far raffreddare il farro prima di condire"
nt-001,lunedi,dinner,,"Salmone al forno con patate dolci e broccoli",560,42,38,22,
nt-001,lunedi,snack,1,"Mela e mandorle",180,5,25,8,
nt-001,martedi,breakfast,,"Toast integrale con avocado e uova",450,22,40,22,
...
```

`07-nutrition-ingredients.csv`:
```
templateId,day,mealType,mealOrder,food,quantityG
nt-001,lunedi,breakfast,,"Yogurt greco 0%",200
nt-001,lunedi,breakfast,,"Mirtilli",80
nt-001,lunedi,breakfast,,"Granola",40
nt-001,lunedi,breakfast,,"Miele",5
nt-001,lunedi,lunch,,"Farro perlato",80
nt-001,lunedi,lunch,,"Petto di pollo",120
...
```

### Linee guida nutrizionali

- **Coerenza calorica**: la somma dei kcal dei pasti deve avvicinarsi al `target_kcal` (±10%). Il sistema verifica questo durante la generazione AI
- **Distribuzione macros**: rispetta i target macro (anche qui ±10%). Le proteine spesso sono sotto-stimate dai non-nutrizionisti — attenzione
- **Cibi reali italiani**: usa nomi comuni ("riso basmati" non "Oryza sativa varietà…"). Quantità realistiche
- **Variabilità settimanale**: non ripetere lo stesso pasto più di 2 volte a settimana. Ruota le proteine (carne, pesce, legumi, uova)
- **Almeno uno per ogni dietType**: copri tutti e 5 i dietType. Più obiettivi per dietType = meglio
- **Considera intolleranze comuni**: nelle versioni vegetariane/vegane evita ingredienti animali nascosti (gelatina, lardo nei lieviti, ecc.)

---

## 7. Video PT di riferimento

**File template**: `data-templates/08-pt-videos.csv`
**Tabella DB**: campi `videoUrl` e `thumbnailUrl` su `Exercise`

I video PT sono i "video perfetti" che il sistema mostra all'utente come riferimento e da cui estrae i frame per l'analisi L3 (confronto).

### Specifiche tecniche per la ripresa

| Parametro | Specifica | Motivo |
|---|---|---|
| **Durata** | 15–25 secondi (esattamente come `recordingDurationSeconds` dell'esercizio) | Le fasi devono allinearsi a quelle dell'utente |
| **Risoluzione** | 720p minimo (1280×720), preferibile 1080p | Qualità sufficiente per estrazione frame |
| **Frame rate** | 30 fps | Standard, compatibile con MediaRecorder client |
| **Inquadratura** | Camera fissa, persona inquadrata a figura intera (testa ai piedi visibili) | MediaPipe ha bisogno di vedere tutti i 33 keypoint |
| **Angolazione** | Frontale o 3/4. Evita laterale puro (occlude metà del corpo) | Massimizza i keypoint visibili |
| **Sfondo** | Neutro, uniforme, ben illuminato. No sfondi vetrosi o riflettenti | Migliora la pose detection |
| **Vestiti** | Aderenti, contrastanti rispetto allo sfondo. No felpe XXL o pantaloni larghi | I landmark articolari devono essere ben rilevabili |
| **Esecuzione** | Movimento standard, tempo normale, **2-4 ripetizioni complete** nell'arco dei 15-25s. No pause | L'analisi L3 confronta fasi, servono ripetizioni complete |
| **Formato file** | `.mp4` (h.264) | Massima compatibilità browser |
| **Peso file** | <20 MB | Ridurre per CDN/Supabase |

### Workflow upload

1. Il PT registra i video seguendo le specifiche
2. Tu li carichi nel bucket Supabase **`exercise-videos`** (dashboard Supabase → Storage → Upload)
3. Ottieni l'URL pubblico di ogni file
4. Compili `08-pt-videos.csv` con lo slug esercizio + URL + URL thumbnail (puoi generare la thumbnail come frame estratto a metà video o fornire un'immagine separata `.jpg`)
5. Lo script di seed aggiorna i campi `Exercise.videoUrl` e `Exercise.thumbnailUrl`

### Schema colonne

| Colonna | Obbligatorio | Tipo | Esempio | Descrizione |
|---|---|---|---|---|
| `exerciseSlug` | ✅ | string | `squat` | Esercizio a cui appartiene il video |
| `videoUrl` | ✅ | URL https | `https://xxx.supabase.co/storage/v1/object/public/exercise-videos/squat.mp4` | URL del video. Deve essere pubblico o con signed URL stabile |
| `thumbnailUrl` | ❌ | URL https | `https://xxx.supabase.co/.../squat-thumb.jpg` | Thumbnail per la card esercizio |

### ⚠️ Configurazione CORS bucket

Per attivare L3 in modo affidabile, **una tantum** vai sul dashboard Supabase:
- Storage → bucket `exercise-videos` → Configuration → CORS
- Allowed Origins: aggiungi `http://localhost:3000` (dev) + `https://tuo-dominio-vercel.app` (prod)
- Allowed Methods: `GET, HEAD`

Senza questo, il client riceve `CORS error` quando tenta di estrarre i frame dal video PT e L3 viene skippato (con fallback graceful, ma perdi la qualità analisi).

---

## 8. Brief per i professionisti

Testo pronto da inoltrare a chi compilerà i dati.

### 8.1 Brief Personal Trainer (esercizi + regole biomeccaniche)

> **Ciao [Nome],**
>
> Ti chiedo aiuto per popolare il database tecnico di una app di fitness AI che stiamo sviluppando. Il sistema analizza in tempo reale i movimenti degli utenti e dà feedback automatico se l'esecuzione tecnica non è corretta. Per farlo abbiamo bisogno della tua expertise.
>
> **Ti mando 2 file Excel:**
>
> 1. **`01-exercises.csv`** — il catalogo esercizi. Per ogni esercizio servono: nome, slug (un identificatore in minuscolo con trattini, es. `squat`, `panca-piana`), descrizione breve, 5-7 passi di esecuzione corretta, muscoli coinvolti, livello di difficoltà, attrezzatura. Compila pensando a ciò che servirebbe a un cliente alle prime armi.
>
> 2. **`02-biomechanical-triggers.csv`** — le regole per i feedback automatici. Per ogni esercizio definisci quali articolazioni monitorare (es. ginocchio sinistro/destro nello squat), il range angolare atteso in ogni fase (es. flessione 70-110° in BOTTOM), e cosa dire all'utente se esce dal range (es. "Profondità insufficiente, il ginocchio non raggiunge il parallelo"). Ogni regola ha una severità: WARNING (svista), ERROR (errore tecnico), CRITICAL (rischio infortunio).
>
> **Il documento `PROFESSIONALS_DATA_GUIDE.md` (allegato) ha tutti i dettagli, valori validi ed esempi compilati.** Inizia leggendo solo le sezioni 3 (Esercizi) e 4 (Regole biomeccaniche).
>
> **Stima tempo**: 4-6 ore per coprire 15-20 esercizi compounds + isolamento, con buona granularità sui trigger.
>
> Quando hai finito mi rimandi i CSV compilati. Grazie!

### 8.2 Brief Nutrizionista (piani alimentari)

> **Ciao [Nome],**
>
> Sto sviluppando una app di fitness AI che genera piani nutrizionali personalizzati con l'intelligenza artificiale. Per fare in modo che l'AI generi piani di qualità professionale, ho bisogno di **template di esempio** scritti da un nutrizionista vero — la macchina impara dai tuoi piani e replica lo stile.
>
> **Ti mando 3 file Excel:**
>
> 1. **`05-nutrition-templates.csv`** — l'anagrafica dei piani (1 riga per piano). Compila ~5 piani diversi, almeno uno per ciascun tipo di dieta (onnivora, vegetariana, vegana, chetogenica, mediterranea). Per ogni piano specifica il profilo-tipo di riferimento (es. donna 65kg moderatamente attiva) e i target macro/calorici.
>
> 2. **`06-nutrition-meals.csv`** — i pasti di ogni giorno (7 giorni × 4-5 pasti = ~30 righe per piano). Per ogni pasto: nome del piatto + kcal/proteine/carbo/grassi stimati.
>
> 3. **`07-nutrition-ingredients.csv`** — gli ingredienti di ogni pasto (con quantità in grammi).
>
> **Il documento `PROFESSIONALS_DATA_GUIDE.md` (allegato) ha schema, valori validi ed esempi compilati.** Sezione 6 — Piani nutrizionali.
>
> **Cose importanti:**
> - I cibi devono essere quelli comuni in Italia (nomi italiani: "petto di pollo", "farro perlato", "yogurt greco")
> - La somma kcal dei pasti deve restare entro ±10% dal `target_kcal` giornaliero
> - Massima variabilità: stesso pasto ripetuto max 2 volte a settimana
> - Nel campo `rationale` scrivi la logica nutrizionale del piano (perché quella distribuzione di macros, perché quegli alimenti) — è la parte che l'AI legge per imparare il tuo stile
>
> **Stima tempo**: 8-12 ore per 5 template completi (7 giorni × pasti).
>
> Grazie mille!

### 8.3 Brief Operatore Riprese Video PT

> Servono video tecnici "perfetti" di ogni esercizio.
>
> **Specifiche di ripresa** (vedi sezione 7 del `PROFESSIONALS_DATA_GUIDE.md`):
>
> - Durata: 15-25 secondi (variabile per esercizio — ti darò una lista con la durata esatta per ognuno)
> - Camera fissa, persona inquadrata a figura intera
> - Angolazione frontale o 3/4 (NON laterale puro)
> - Sfondo neutro ben illuminato
> - Vestiti aderenti e contrastanti
> - 2-4 ripetizioni complete nell'arco del tempo richiesto, esecuzione tecnica impeccabile
> - Output: .mp4 720p o 1080p, <20MB
>
> Per ogni esercizio mi servono **video + 1 thumbnail .jpg** (puoi estrarre la thumbnail da un frame a metà video).
>
> Quando hai i file, te li scarico dal tuo cloud e li carico io sul sistema.

---

## 9. Checklist di qualità

Prima di lanciare il seed sui CSV compilati, verifica:

### Esercizi (`01-exercises.csv`)
- [ ] Tutti gli `slug` sono univoci e in formato kebab-case (solo `a-z`, numeri, trattini)
- [ ] Tutti i valori enum sono **esattamente** come da schema (case-sensitive, `BEGINNER` ≠ `Beginner`)
- [ ] `instructions` contiene 5-7 passi separati da `|`
- [ ] `recordingDurationSeconds` è uno tra 15, 20, 25

### Regole biomeccaniche (`02-biomechanical-triggers.csv`)
- [ ] Ogni `exerciseSlug` corrisponde a un esercizio in `01-exercises.csv`
- [ ] `minAngle < maxAngle` sempre
- [ ] `joint` usa solo i nomi ammessi (left_knee, right_knee, …)
- [ ] Le regole con `injuryRisk: true` sono **realmente** rischi di infortunio
- [ ] Per movimenti simmetrici esistono righe sia `left_X` che `right_X`
- [ ] `feedback` è in italiano e max 30 parole

### Workout templates (`03-` + `04-`)
- [ ] Ogni `templateId` in tabella esercizi esiste in tabella info
- [ ] `exerciseSlug` corrisponde a esercizi reali
- [ ] La somma di esercizi per ogni giorno è ragionevole (4-8 per allenamento standard)
- [ ] I giorni di riposo hanno `restDay: true` e nessun esercizio
- [ ] `rationale` spiega il "perché" del piano (non solo "perché funziona")

### Nutrition templates (`05-` + `06-` + `07-`)
- [ ] Ogni `templateId` esiste in tutte e 3 le tabelle
- [ ] Per ogni `(templateId, day, mealType)` esiste sia il pasto che gli ingredienti
- [ ] Somma `estimatedKcal` × 7 giorni ÷ 7 ≈ `target_kcal` (±10%)
- [ ] `dietType` è scritto in lowercase italiano (onnivora, vegana, …)
- [ ] Niente carne/pesce/derivati animali nei piani `vegana`
- [ ] Niente carne/pesce nei piani `vegetariana` (ma uova e latticini sì)

### Video PT (`08-pt-videos.csv`)
- [ ] Ogni `videoUrl` apre effettivamente un .mp4 valido in browser
- [ ] La durata del video coincide con `recordingDurationSeconds` dell'esercizio
- [ ] La persona è inquadrata a figura intera per tutto il video
- [ ] CORS configurato sul bucket Supabase

---

## Riferimenti incrociati

- **Schema TypeScript autoritativo** per chi converte CSV → seed.ts: `DATA_AUTHORING_GUIDE.md`
- **Convenzioni nomi** (slug, enum) → `DOCUMENTAZIONE_FLUSSI.md` §16
- **Schema Prisma completo** → `DOCUMENTAZIONE_FLUSSI.md` §2 e `prisma/schema.prisma`
- **Cosa fa ogni livello dell'analisi** → `DOCUMENTAZIONE_FLUSSI.md` §8 e `ANALYSIS_SPEC.md`
- **Comandi Prisma per applicare i seed** → `npm run seed`

---

*Fine guida. Per dubbi o nuovi esempi di compilazione, integrare questo documento — è il riferimento canonico per il data authoring tramite CSV.*
