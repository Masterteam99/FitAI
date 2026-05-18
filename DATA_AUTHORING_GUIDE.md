# FitAI — Guida alla redazione dei dataset dati (TypeScript)

*Versione 1.0 — 1 maggio 2026*
*Documento autoritativo per chi (umano o AI) produce i dataset di contenuti tecnici dell'app **direttamente in TypeScript**.*

> **Documento gemello per non-sviluppatori**: `PROFESSIONALS_DATA_GUIDE.md` (root) — guida pensata per PT, nutrizionisti e fisioterapisti che compilano i dati via **CSV/Excel**. I CSV templates stanno in `data-templates/`. Workflow: il professionista compila i CSV → il dev (o Claude Code) li converte nei `.ts` seguendo *questa* guida → `npm run seed`.

---

## 0. Come usare questa guida

Sei un'AI generativa (o un operatore umano) incaricato di produrre i file di dati che alimentano FitAI. Questa guida è **prescrittiva**: ogni vincolo qui descritto è applicato dal codice e da Prisma. Disattenderlo significa rompere il seed o far scattare errori a runtime.

Per ogni documento devi produrre:
1. Un file TypeScript valido nel path indicato
2. Strutture conformi agli schemi nelle sezioni dedicate
3. Stringhe user-facing in **italiano**
4. Valori enumerativi presi solo dalle whitelist riportate

Alla fine, esegui mentalmente la **checklist finale** (sez. 8). Se manca anche un solo punto, riscrivi il documento.

---

## 1. Cosa devi produrre

| # | Documento | File output | Scopo |
|---|---|---|---|
| 1 | Specifiche biomeccaniche per esercizio | `prisma/seed-biomechanical-specs.ts` | Definire range angolari e trigger di errore per ciascuno dei 20 esercizi. Alimenta L1 (analisi biomeccanica deterministica). |
| 2 | Template piani di allenamento | `prisma/seed-workout-templates.ts` | 8-10 piani realistici usati come **few-shot examples** nel prompt Claude per `generate-plan`. |
| 3 | Template piani nutrizionali | `prisma/seed-nutrition-templates.ts` | 5 piani settimanali realistici usati come few-shot nel prompt Claude per `generate-nutrition-plan`. |

Nota: il documento 1 è già stato creato in v0 da un agente precedente (Antigravity). Se ti viene richiesto di rivederlo, applica gli stessi vincoli di questa guida.

---

## 2. Stack di riferimento

### File che consumano i dataset
- `prisma/seed.ts` — orchestrator del seed; importa i 3 file e crea le righe DB
- `src/services/biomechanical/specEvaluator.ts` — consuma le specs biomeccaniche
- `src/services/biomechanical/phaseDetector.ts` — calcola fase del movimento prima di applicare le specs
- `src/app/api/ai/generate-plan/route.ts` — usa template allenamento come few-shot
- `src/app/api/ai/generate-nutrition-plan/route.ts` — usa template nutrizionali come few-shot

### Modelli Prisma rilevanti
- `Exercise`, `ExerciseBiomechanicalSpec`, `ExerciseMovement`, `MovementPhase`, `PhaseTrigger`
- `WorkoutPlanTemplate` (NUOVO, da creare con migrazione)
- `NutritionPlanTemplate` (NUOVO, da creare con migrazione)

### Convenzioni di codice
- TypeScript strict mode attivo
- Nomi file in `kebab-case.ts`
- Export `const` con nome costante in SCREAMING_SNAKE_CASE
- Niente import esterni dal repo (solo tipi inline)
- Niente dipendenze runtime (i dataset sono dichiarativi puri)

---

## 3. DOCUMENTO 1 — Specifiche biomeccaniche

### 3.1 Inquadramento funzionale

Le specs biomeccaniche descrivono **come deve essere eseguito un esercizio in modo corretto**, in termini di angoli articolari per fase del movimento. Il sistema di analisi (L1) confronta gli angoli osservati con questi range e fa scattare i **trigger** di errore quando l'utente esce dai range.

Pipeline di consumo:
```
video utente
  → MediaPipe pose detection (33 punti, 2D + 3D)
  → angleCalculator: calcola gli angoli di interesse per ogni frame
  → phaseDetector: classifica ogni frame in BOTTOM / TOP / CONCENTRIC / ECCENTRIC / ISOMETRIC / THROUGHOUT
  → specEvaluator: per ogni frame applica i trigger del joint+phase corrente,
                   accumula penalty pesata (severity × persistence × movements)
  → L1Result.score (0-100) + L1Result.triggeredFeedback
```

Il sistema **applica i trigger SOLO se il frame è nella fase corretta**: una violazione di "ginocchio troppo in avanti" definita per la fase BOTTOM non scatterà mai durante l'ECCENTRIC, anche se l'angolo numericamente lo sarebbe. Questo richiede grande cura nello scegliere la fase corretta.

### 3.2 Schema TypeScript autoritativo

```typescript
// File: prisma/seed-biomechanical-specs.ts

export interface BiomechanicalSpecData {
  movements: MovementData[];
}

export interface MovementData {
  joint: JointName;
  movementType: MovementType;
  phases: MovementPhaseData[];
}

export interface MovementPhaseData {
  phase: ExercisePhase;
  minAngle: number;       // gradi, 0-180
  maxAngle: number;       // gradi, 0-180; deve essere > minAngle
  triggers: PhaseTriggerData[];
}

export interface PhaseTriggerData {
  condition: TriggerCondition;
  severity: Severity;
  feedback: string;       // italiano, max 30 parole
  injuryRisk: boolean;
}

type JointName =
  | "left_knee" | "right_knee"
  | "left_elbow" | "right_elbow"
  | "left_shoulder" | "right_shoulder"
  | "left_hip" | "right_hip"
  | "spine";

type MovementType =
  | "flessione" | "estensione"
  | "abduzione" | "adduzione"
  | "rotazione" | "inclinazione"
  | "iperestensione" | "neutrale";

type ExercisePhase = "BOTTOM" | "TOP" | "CONCENTRIC" | "ECCENTRIC" | "ISOMETRIC" | "THROUGHOUT";

type TriggerCondition = "BELOW_MIN" | "ABOVE_MAX" | "OUT_OF_RANGE";

type Severity = "WARNING" | "ERROR" | "CRITICAL";

export const BIOMECHANICAL_SPECS: Record<string, BiomechanicalSpecData> = {
  /* esercizi qui */
};
```

I tipi `JointName`, `MovementType`, `ExercisePhase`, `TriggerCondition`, `Severity` sono **chiusi**: non aggiungere valori nuovi — il codice consumatore non li riconoscerebbe.

### 3.3 Vocabolario controllato

#### 3.3.1 Joint (whitelist)
| Valore | Significato | Calcolato da (3 keypoint) |
|---|---|---|
| `left_knee` / `right_knee` | Angolo ginocchio | anca-ginocchio-caviglia |
| `left_elbow` / `right_elbow` | Angolo gomito | spalla-gomito-polso |
| `left_shoulder` / `right_shoulder` | Angolo spalla (abd/flex) | gomito-spalla-anca |
| `left_hip` / `right_hip` | Angolo anca | spalla-anca-ginocchio |
| `spine` | Inclinazione tronco vs verticale | mediaSpalle-mediaAnche-verticale |

⚠️ Solo questi valori. NON usare `wrist`, `ankle`, `neck` ecc. — non sono calcolati.

#### 3.3.2 MovementType (whitelist)
| Valore | Quando usarlo |
|---|---|
| `flessione` | Riduzione angolo articolare (squat → flessione ginocchio) |
| `estensione` | Aumento angolo articolare verso 180° (lockout stacco) |
| `abduzione` | Allontanamento dal piano sagittale (lateral raise braccio) |
| `adduzione` | Avvicinamento al piano sagittale |
| `rotazione` | Movimento rotatorio attorno asse (busto, spalla intra/extra) |
| `inclinazione` | Tilt tronco vs verticale (tipicamente per `spine`) |
| `iperestensione` | Estensione oltre range fisiologico (semantica negativa, usato per CRITICAL su spine in stacco) |
| `neutrale` | L'articolazione NON deve mostrare attivazione significativa (es. spine in hip thrust = mantenere posizione neutra) |

#### 3.3.3 ExercisePhase (whitelist)
| Valore | Definizione operativa |
|---|---|
| `BOTTOM` | Punto di massima flessione del joint chiave dell'esercizio (es. squat = ginocchio più flesso, panca = gomito più flesso al petto) |
| `TOP` | Punto di massima estensione/abduzione del joint chiave (es. squat = in piedi, lateral raise = braccia in alto) |
| `ECCENTRIC` | Fase di lunghezza muscolare in aumento (descent in squat, lower in panca) |
| `CONCENTRIC` | Fase di lunghezza muscolare in diminuzione (ascent in squat, push-up) |
| `ISOMETRIC` | Hold senza cambio significativo di lunghezza (top di un curl mantenuto) |
| `THROUGHOUT` | Applicabile a tutta la durata, indipendente dalla fase |

**Regole d'uso**:
- Esercizi STATICI (`plank`, `plank-laterale`): usa **solo `THROUGHOUT`**.
- Esercizi DINAMICI: per ogni movement, definisci tipicamente 2-3 fasi (es. BOTTOM e TOP, oppure BOTTOM ed ECCENTRIC).
- Per il joint `spine` su esercizi dinamici, spesso si usa `THROUGHOUT` perché il vincolo posturale vale durante tutta l'esecuzione.

#### 3.3.4 TriggerCondition
| Valore | Logica trigger | Esempio |
|---|---|---|
| `BELOW_MIN` | Scatta se `angle < minAngle` | Squat BOTTOM, minAngle=70: ginocchio sceso a 50° → trigger (troppo basso) |
| `ABOVE_MAX` | Scatta se `angle > maxAngle` | Squat BOTTOM, maxAngle=110: ginocchio a 130° → trigger (troppo poco profondo) |
| `OUT_OF_RANGE` | Scatta se `angle < minAngle OR angle > maxAngle` | Generico, da usare quando entrambi i lati del range hanno la stessa criticità |

Quasi sempre vorrai DUE trigger separati (uno BELOW_MIN, uno ABOVE_MAX) con feedback DIVERSI, non un singolo OUT_OF_RANGE generico. La differenziazione del feedback è la maggior parte del valore della spec.

#### 3.3.5 Severity (whitelist)
| Valore | Peso nello score | Quando usarla |
|---|---|---|
| `WARNING` | 1× | Errore tecnico minore, svista correggibile (es. asimmetria minore) |
| `ERROR` | 3× | Errore tecnico evidente, range fuori target (es. profondità sbagliata) |
| `CRITICAL` | 10× | Rischio infortunio o errore grave (es. ginocchio in valgo, hyperextension lombare sotto carico) |

Lo score si calcola: `100 - (Σ severity_weight × persistence_factor) / total_movements * 10`.
Quindi un singolo CRITICAL persistente può abbassare lo score di 10 punti, mentre un WARNING fugace pesa pochissimo.

### 3.4 Range angolari di riferimento

Usa questi valori come baseline. Adatta entro ±10° in base al body type "medio".

**Ginocchio in flessione (squat-family)**
- TOP (in piedi): 165-180°
- BOTTOM (parallelo): 70-110° (sub-parallel < 70° → CRITICAL injuryRisk se sotto 60°)

**Ginocchio in flessione (lunge-family: affondi, bulgarian split)**
- BOTTOM (gamba avanti): 80-110° (90° = ottimale)
- BOTTOM (gamba dietro): 80-100°

**Gomito in flessione (panca, push-up)**
- TOP (lockout): 160-180° (sopra 175° con peso = iperestensione → CRITICAL)
- BOTTOM (al petto): 70-110°

**Gomito in flessione (curl)**
- TOP (concentric peak): 30-60°
- BOTTOM (esteso): 160-180°

**Spalla in abduzione (lateral raise)**
- TOP (parallel al suolo): 80-100° (sopra 110° = sopra parallelo, generalmente WARNING)
- BOTTOM (braccia ai fianchi): 0-15°

**Spalla in flessione (military press)**
- TOP (lockout sopra testa): 160-180°
- BOTTOM (spalla altezza orecchi): 80-100°

**Anca in flessione (squat, stacco)**
- TOP (in piedi): 165-180°
- BOTTOM squat: 60-100°
- BOTTOM stacco: 75-115° (più anca che ginocchio)

**Anca in estensione (hip thrust, glute bridge)**
- TOP (lockout): 170-180° (sopra 180° = iperestensione → CRITICAL injuryRisk)
- BOTTOM: 90-130°

**Spina (inclinazione tronco vs verticale)**
| Esercizio | Range tipico | Limite CRITICAL |
|---|---|---|
| Squat | 0-35° forward lean | > 50° = CRITICAL (rischio lombare) |
| Stacco | 0-50° (più aggressivo) | > 70° = CRITICAL |
| Hip thrust | 0-15° (neutrale) | > 25° = ERROR (compensazione) |
| Plank | 0-15° (allineato) | > 20° = ERROR (collasso lombare o tetto-tenda) |
| Crunch | 30-90° (movimento attivo) | < 0° = ERROR (estensione lombare) |
| Curl bicipiti | 0-15° (no momentum) | > 25° = WARNING (cheat reps) |

### 3.5 Linee guida per il feedback

**Lingua**: italiano. Sempre. Anche per termini tecnici comuni.

**Lunghezza**: max 30 parole. Idealmente 15-25.

**Tono**: PT professionale ma accessibile. Diretto e prescrittivo. Niente "potresti", "forse", "se vuoi". Niente disclaimer medici (li gestisce il finalReport).

**Struttura suggerita** (3 elementi):
1. Diagnosi: cosa sta succedendo, in 1 frase
2. Impatto: rischio o conseguenza tecnica (1 sintagma)
3. Correzione: indicazione concreta e azionabile (1 frase)

**Esempi GOOD**:
- "Il ginocchio sinistro supera la punta del piede e va in valgo. Sposta il peso sui talloni e mantieni la verticalità della tibia."
- "Schiena curva nella discesa dello stacco. Mantieni il petto alto e attiva i dorsali per fissare la colonna in posizione neutra."
- "Spalle che salgono verso le orecchie nel lateral raise. Abbassa attivamente le scapole prima di iniziare il movimento."
- "Discesa eccessiva nel squat: il ginocchio scende sotto il parallelo creando stress capsulare. Ferma la discesa al parallelo o appena sotto."

**Esempi BAD**:
- ❌ "Forse dovresti pensare di sistemare la posizione del ginocchio se possibile per evitare problemi che potrebbero verificarsi in futuro." (verbose, indeciso, vago)
- ❌ "Knee valgus detected, compensatory pattern observed." (anglicismo, gergo medico)
- ❌ "Bravo, però attenzione al ginocchio." (troppo soft, non azionabile)
- ❌ "Il tuo ginocchio non sta andando bene, sistema la postura." (vago, niente correzione)

**Divieti**:
- Niente emoji
- Niente formule di cortesia ("ottimo", "bravo")
- Niente disclaimer medici ("consulta un medico")
- Niente riferimenti al "video": l'utente non vede frame numerati
- Niente unità di misura ("80 gradi"): l'utente non ha angoli a video. Usa termini visivi ("profondità eccessiva", "tronco quasi orizzontale")

### 3.6 InjuryRisk: criteri decisionali

Imposta `injuryRisk: true` SE E SOLO SE la violazione contribuisce direttamente a uno di questi pattern:
- Compressione articolare anomala sotto carico (ginocchio valgo, gomito iperesteso in panca)
- Stress sui legamenti (rotazione spalla in trazione, hyperextension lombare)
- Pattern lesivi documentati (rounded back in stacco, butt wink sotto parallelo, knee tracking errato)
- Carico off-axis su colonna (rotazione su squat, hip-thrust con bacino dis-allineato)

Imposta `injuryRisk: false` per errori puramente tecnici/efficaci ma non lesivi:
- Profondità sub-ottimale ma sicura (squat un po' alto)
- Squilibrio sinistra/destra modesto (< 15% delta angolo)
- Velocità non ottimale (troppo veloce/lenta)
- Posizione mani inappropriata
- Range parziale conservativo

Il `injuryRisk: true` alimenta direttamente l'`injuryRiskAlert` del report finale (BASSO/MEDIO/ALTO).

### 3.7 Lista esercizi target (slug whitelist)

Devi coprire **tutti e 20** questi esercizi. Lo slug è la chiave del Record `BIOMECHANICAL_SPECS`. Non inventare slug nuovi: rompono la foreign key con `Exercise.slug` del seed esistente.

| Slug | Categoria | recordingDurationSeconds (info, già nel seed) |
|---|---|---|
| `squat` | gambe | 20 |
| `stacco-da-terra` | full body | 20 |
| `panca-piana` | petto | 20 |
| `trazioni` | dorso | 15 |
| `military-press` | spalle | 20 |
| `affondi` | gambe | 20 |
| `rematore-bilanciere` | dorso | 20 |
| `curl-bicipiti` | bicipiti | 15 |
| `push-up` | petto | 20 |
| `plank` | core | 25 |
| `romanian-deadlift` | gambe/glutei | 20 |
| `lateral-raise` | spalle | 15 |
| `tricipiti-cavi` | tricipiti | 15 |
| `hip-thrust` | glutei | 25 |
| `crunch` | core | 15 |
| `goblet-squat` | gambe | 20 |
| `bulgarian-split-squat` | gambe | 20 |
| `plank-laterale` | core | 25 |
| `face-pull` | spalle | 15 |
| `leg-press` | gambe | 20 |

Per ciascuno definisci tra 2 e 5 `MovementData`. Per esercizi statici basta 1-2 movement, tutti con phase `THROUGHOUT`.

### 3.8 Esempio completo: Squat (modello da imitare)

```typescript
"squat": {
  movements: [
    {
      joint: "left_knee",
      movementType: "flessione",
      phases: [
        {
          phase: "BOTTOM",
          minAngle: 70,
          maxAngle: 110,
          triggers: [
            {
              condition: "ABOVE_MAX",
              severity: "ERROR",
              feedback: "Profondità insufficiente: il ginocchio non raggiunge il parallelo. Scendi finché la coscia è parallela al pavimento.",
              injuryRisk: false,
            },
            {
              condition: "BELOW_MIN",
              severity: "WARNING",
              feedback: "Discesa eccessiva sotto il parallelo. Ferma il movimento al parallelo per ridurre lo stress sulle ginocchia.",
              injuryRisk: true,
            },
          ],
        },
        {
          phase: "TOP",
          minAngle: 160,
          maxAngle: 180,
          triggers: [
            {
              condition: "BELOW_MIN",
              severity: "WARNING",
              feedback: "Lockout incompleto in piedi. Estendi completamente le gambe tra una ripetizione e l'altra.",
              injuryRisk: false,
            },
          ],
        },
      ],
    },
    {
      joint: "right_knee",
      movementType: "flessione",
      phases: [
        // analoghi a left_knee
      ],
    },
    {
      joint: "spine",
      movementType: "inclinazione",
      phases: [
        {
          phase: "THROUGHOUT",
          minAngle: 0,
          maxAngle: 35,
          triggers: [
            {
              condition: "ABOVE_MAX",
              severity: "ERROR",
              feedback: "Inclinazione del tronco eccessiva in avanti. Mantieni il petto alto e attiva il core per stabilizzare la colonna.",
              injuryRisk: true,
            },
          ],
        },
      ],
    },
    {
      joint: "left_hip",
      movementType: "flessione",
      phases: [
        {
          phase: "BOTTOM",
          minAngle: 60,
          maxAngle: 100,
          triggers: [
            {
              condition: "ABOVE_MAX",
              severity: "WARNING",
              feedback: "L'anca si flette poco: stai scendendo solo con le ginocchia. Spingi i glutei indietro come per sederti.",
              injuryRisk: false,
            },
          ],
        },
      ],
    },
  ],
},
```

### 3.9 Validation checklist (Documento 1)

Prima di consegnare, verifica:
- [ ] Tutti i 20 slug presenti come chiavi del Record
- [ ] Per ogni slug, almeno 2 `MovementData` (eccezioni: plank/plank-laterale possono averne 1-2)
- [ ] `plank` e `plank-laterale` usano **solo** phase `THROUGHOUT`
- [ ] Per ogni `MovementPhaseData`: `minAngle < maxAngle`, entrambi tra 0 e 180
- [ ] Per ogni `PhaseTriggerData.feedback`: italiano, ≤30 parole, niente emoji né disclaimer medici
- [ ] Almeno 1 trigger CRITICAL con `injuryRisk: true` su squat/stacco/panca/military-press/romanian-deadlift/hip-thrust
- [ ] Joint usato esiste nella whitelist (no `ankle`, `wrist`, ecc.)
- [ ] MovementType nella whitelist
- [ ] Phase nella whitelist (BOTTOM/TOP/CONCENTRIC/ECCENTRIC/ISOMETRIC/THROUGHOUT)
- [ ] Nessun feedback duplicato testualmente identico tra esercizi diversi
- [ ] Il file compila come TypeScript valido (`tsc --noEmit`)

---

## 4. DOCUMENTO 2 — Template piani di allenamento

### 4.1 Inquadramento funzionale

Quando l'utente completa l'onboarding e chiede un piano di allenamento, l'endpoint `/api/ai/generate-plan` invoca Claude con il profilo utente (obiettivi, livello, attrezzatura, giorni, infortuni, sport pregresso, dieta) e gli **fornisce 2-3 template realistici come few-shot examples** estratti dal DB.

Più i template few-shot sono realistici e ben strutturati, migliore sarà il piano generato. Il modello impara da questi esempi:
- Bilanciamento gruppi muscolari nella settimana
- Volume tipico per livello
- Naming dei giorni
- Logica progressiva
- Stile descrittivo

### 4.2 Schema TypeScript autoritativo

```typescript
// File: prisma/seed-workout-templates.ts

export type WorkoutDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type FitnessGoal =
  | "LOSE_WEIGHT" | "BUILD_MUSCLE" | "ENDURANCE"
  | "FLEXIBILITY" | "GENERAL_FITNESS" | "ATHLETIC_PERFORMANCE";

export type Equipment =
  | "NONE" | "DUMBBELLS" | "BARBELL" | "MACHINE" | "RESISTANCE_BANDS"
  | "PULL_UP_BAR" | "BENCH" | "KETTLEBELL" | "CABLES" | "FULL_GYM";

export interface WorkoutPlanTemplateData {
  name: string;                  // 4-8 parole, descrittivo
  description: string;           // 1-2 frasi, ~30 parole
  difficulty: WorkoutDifficulty;
  targetGoals: FitnessGoal[];    // 1-3 elementi
  requiredEquipment: Equipment[]; // attrezzatura minima richiesta
  durationWeeks: number;         // 4 / 6 / 8 / 12
  workoutsPerWeek: number;       // 2-6
  rationale: string;             // 2-3 frasi sul perché di questa progressione
  days: WorkoutDayData[];        // length === workoutsPerWeek + restDays (di solito 7 totali)
}

export interface WorkoutDayData {
  dayNumber: number;             // 1-7
  name: string;                  // "Giorno A - Parte Alta", "Riposo attivo"
  restDay: boolean;
  exercises: WorkoutExerciseData[]; // vuoto se restDay
}

export interface WorkoutExerciseData {
  exerciseSlug: string;          // DEVE corrispondere a uno dei 20 slug del seed
  sets: number;                  // 1-6
  reps?: number;                 // per esercizi a ripetizione
  durationSeconds?: number;      // per esercizi isometrici (plank). Esattamente uno tra reps/durationSeconds.
  restSeconds: number;           // 30-300
  notes?: string;                // opzionale, max 25 parole, suggerimento tecnico
}

export const WORKOUT_TEMPLATES: WorkoutPlanTemplateData[] = [
  /* template qui */
];
```

### 4.3 Linee guida programmatiche

**Durata standard per livello**:
- BEGINNER: 4 settimane
- INTERMEDIATE: 6-8 settimane
- ADVANCED: 8-12 settimane

**Volume per livello (per sessione)**:
- BEGINNER: 2-3 set per esercizio, 8-12 reps, esercizi composti prevalenti, 4-6 esercizi/sessione
- INTERMEDIATE: 3-4 set, 6-12 reps, mix composti+isolati, 5-7 esercizi/sessione
- ADVANCED: 3-5 set, 4-15 reps con variazione, 6-9 esercizi/sessione

**Rest tra serie**:
- Composti pesanti (squat, stacco, panca): 120-180s
- Isolati (curl, lateral raise): 45-90s
- Plank/isometrici: 30-60s
- Cardio/circuit: 15-45s

**reps vs durationSeconds**: usa SEMPRE esattamente uno dei due:
- `reps`: per push-up, squat, curl, ecc. (esercizi dinamici)
- `durationSeconds`: per plank, plank-laterale, hold isometrici (esercizi a tempo)
- Mai entrambi, mai nessuno.

**Bilanciamento settimanale**:
- Mai stesso gruppo muscolare 2 giorni consecutivi
- In split 4x/sett: tipicamente Upper-Lower-Upper-Lower o Push-Pull-Legs+1
- Gambe e glutei: max 2-3x/settimana per BEGINNER, fino 3x per ADVANCED
- Core può apparire ogni sessione (volume basso)

**restDay**: quando `restDay: true`, l'array `exercises` deve essere `[]`. Il `name` può essere "Riposo" o "Riposo attivo / Cardio leggero".

### 4.4 Convenzioni linguistiche

- `name`: italiano, conciso, max 8 parole. Es: `"Forza Principianti Full-Body 4 Settimane"`, `"Massa Intermedio Push-Pull-Legs"`.
- `description`: 1-2 frasi che spiegano focus e target utente. Es: `"Piano introduttivo per chi inizia in palestra. Costruisce le basi tecniche sui movimenti composti con volume moderato."`
- `rationale`: 2-3 frasi sul perché di queste scelte. Spiega progressione, frequenze, scelte di esercizi. Es: `"Frequenza 3x/sett full-body per massimizzare l'apprendimento motorio nei principianti. Volume conservativo per ridurre rischio overtraining. Esercizi composti prioritizzati per il rapporto stimolo/tempo."`
- `day.name`: descrittivo. Es: `"Giorno A - Parte Alta"`, `"Giorno B - Gambe e Core"`, `"Giorno C - Push (Petto/Spalle/Tricipiti)"`.
- `exercise.notes`: opzionale, max 25 parole. Es: `"Esegui con cadenza 2-1-2 (eccentrica controllata)."`, `"Usa carico tale da arrivare a fatica nelle ultime 2 reps."`. Niente note ovvie come "Fai 3 serie da 10 reps".

### 4.5 Profili template da coprire (8-10 template)

Almeno questi profili devono essere coperti:

| # | Profilo | difficulty | targetGoals | freq | equipment |
|---|---|---|---|---|---|
| 1 | Forza principianti full-body 4 sett | BEGINNER | GENERAL_FITNESS, BUILD_MUSCLE | 3 | BARBELL, BENCH |
| 2 | Massa intermedio split 6 sett | INTERMEDIATE | BUILD_MUSCLE | 4 | FULL_GYM |
| 3 | Dimagrimento HIIT principianti | BEGINNER | LOSE_WEIGHT, GENERAL_FITNESS | 3 | DUMBBELLS, NONE |
| 4 | Ricomposizione corporea avanzato | ADVANCED | BUILD_MUSCLE, LOSE_WEIGHT | 5 | FULL_GYM |
| 5 | Forza powerlifting 8 sett | ADVANCED | ATHLETIC_PERFORMANCE | 4 | BARBELL, BENCH, PULL_UP_BAR |
| 6 | Casa senza attrezzi | BEGINNER | GENERAL_FITNESS, FLEXIBILITY | 3 | NONE |
| 7 | Body recomp donne intermedio | INTERMEDIATE | BUILD_MUSCLE, LOSE_WEIGHT | 4 | DUMBBELLS, BENCH |
| 8 | Endurance circuit intermedio | INTERMEDIATE | ENDURANCE, GENERAL_FITNESS | 4 | DUMBBELLS, KETTLEBELL |
| 9 | Mobility & core | INTERMEDIATE | FLEXIBILITY, GENERAL_FITNESS | 3 | NONE, RESISTANCE_BANDS |
| 10 | Mass minimal equipment | INTERMEDIATE | BUILD_MUSCLE | 4 | DUMBBELLS, PULL_UP_BAR, BENCH |

Vincolo: tutti gli `exerciseSlug` referenziati devono appartenere alla lista 20 esercizi (sez. 3.7). Se un template non ha esercizi adatti dalla lista (es. molto specifico), riscrivilo o ometti.

### 4.6 Esempio completo: template #1 (Forza Principianti)

```typescript
{
  name: "Forza Principianti Full-Body 4 Settimane",
  description: "Piano introduttivo per chi inizia in palestra. Costruisce le basi tecniche sui movimenti composti con volume moderato e progressione graduale del carico.",
  difficulty: "BEGINNER",
  targetGoals: ["GENERAL_FITNESS", "BUILD_MUSCLE"],
  requiredEquipment: ["BARBELL", "BENCH", "DUMBBELLS"],
  durationWeeks: 4,
  workoutsPerWeek: 3,
  rationale: "Frequenza 3x/sett full-body per massimizzare l'apprendimento motorio. Volume conservativo (3 set per esercizio) per ridurre il rischio overtraining nei principianti. Esercizi composti prioritizzati per il rapporto stimolo/tempo: squat, panca piana, stacco rumeno, military press.",
  days: [
    {
      dayNumber: 1,
      name: "Giorno A - Full Body",
      restDay: false,
      exercises: [
        { exerciseSlug: "squat", sets: 3, reps: 10, restSeconds: 120, notes: "Concentrati sulla profondità e la verticalità del busto." },
        { exerciseSlug: "panca-piana", sets: 3, reps: 10, restSeconds: 120 },
        { exerciseSlug: "rematore-bilanciere", sets: 3, reps: 10, restSeconds: 90 },
        { exerciseSlug: "plank", sets: 3, durationSeconds: 30, restSeconds: 45 },
      ],
    },
    {
      dayNumber: 2,
      name: "Riposo",
      restDay: true,
      exercises: [],
    },
    {
      dayNumber: 3,
      name: "Giorno B - Full Body",
      restDay: false,
      exercises: [
        { exerciseSlug: "stacco-da-terra", sets: 3, reps: 8, restSeconds: 150, notes: "Mantieni la schiena neutra durante tutta la salita." },
        { exerciseSlug: "military-press", sets: 3, reps: 10, restSeconds: 90 },
        { exerciseSlug: "trazioni", sets: 3, reps: 6, restSeconds: 120, notes: "Se non riesci, usa le trazioni assistite o invertite." },
        { exerciseSlug: "crunch", sets: 3, reps: 15, restSeconds: 45 },
      ],
    },
    {
      dayNumber: 4,
      name: "Riposo",
      restDay: true,
      exercises: [],
    },
    {
      dayNumber: 5,
      name: "Giorno C - Full Body",
      restDay: false,
      exercises: [
        { exerciseSlug: "goblet-squat", sets: 3, reps: 12, restSeconds: 90 },
        { exerciseSlug: "push-up", sets: 3, reps: 10, restSeconds: 60, notes: "Su ginocchia se non riesci a tenere la forma." },
        { exerciseSlug: "romanian-deadlift", sets: 3, reps: 10, restSeconds: 120 },
        { exerciseSlug: "curl-bicipiti", sets: 3, reps: 12, restSeconds: 60 },
        { exerciseSlug: "plank-laterale", sets: 2, durationSeconds: 25, restSeconds: 30 },
      ],
    },
    { dayNumber: 6, name: "Riposo", restDay: true, exercises: [] },
    { dayNumber: 7, name: "Riposo attivo / Camminata 30 min", restDay: true, exercises: [] },
  ],
},
```

### 4.7 Validation checklist (Documento 2)

- [ ] Almeno 8 template, idealmente 10
- [ ] Ogni template copre uno dei profili della tabella 4.5
- [ ] Tutti i `targetGoals` dalla whitelist
- [ ] Tutti i `requiredEquipment` dalla whitelist
- [ ] Tutti gli `exerciseSlug` corrispondono a uno dei 20 slug
- [ ] `days.length === 7` (anche con restDay)
- [ ] `workoutsPerWeek` = numero di giorni con `restDay: false`
- [ ] Per ogni `WorkoutExerciseData`: esattamente uno tra `reps` e `durationSeconds` definito
- [ ] `sets` tra 1 e 6, `restSeconds` tra 30 e 300
- [ ] Nessun gruppo muscolare lo stesso 2 giorni consecutivi
- [ ] Volume coerente con `difficulty` (vedi 4.3)
- [ ] Tutti i campi italiani user-facing in italiano
- [ ] Compila come TypeScript valido

---

## 5. DOCUMENTO 3 — Template piani nutrizionali

### 5.1 Inquadramento funzionale

Servono 5 template realistici di piani nutrizionali settimanali, usati come few-shot nell'endpoint `/api/ai/generate-nutrition-plan`. Devono coprire stili dietetici diversi (onnivoro, vegetariano, vegano, chetogenico, mediterraneo) e profili calorici diversi.

### 5.2 Schema TypeScript autoritativo

```typescript
// File: prisma/seed-nutrition-templates.ts

export type DietType = "onnivora" | "vegetariana" | "vegana" | "chetogenica" | "mediterranea" | "altro";
export type FitnessGoal =
  | "LOSE_WEIGHT" | "BUILD_MUSCLE" | "ENDURANCE"
  | "FLEXIBILITY" | "GENERAL_FITNESS" | "ATHLETIC_PERFORMANCE";

export type DayName = "lunedi" | "martedi" | "mercoledi" | "giovedi" | "venerdi" | "sabato" | "domenica";

export interface MacroTargets {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface IngredientData {
  food: string;        // nome italiano comune
  quantityG: number;   // grammi (specificare se cotti/crudi nelle preparationNotes se ambiguo)
}

export interface MealData {
  name: string;                      // descrittivo, max 10 parole
  ingredients: IngredientData[];     // 2-6 ingredienti
  preparationNotes?: string;         // opzionale, max 30 parole
  estimatedKcal: number;
  estimatedProteinG: number;
  estimatedCarbsG: number;
  estimatedFatG: number;
}

export interface DailyMealsData {
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
  snacks: MealData[];                // 0-3 snacks
}

export interface NutritionTemplateData {
  name: string;                                           // es. "Mediterraneo Mantenimento 2200 kcal"
  description: string;                                    // 1-2 frasi
  dietType: DietType;
  targetGoal: FitnessGoal;
  estimatedTargetProfile: {
    weightKg: number;     // peso utente target di esempio
    heightCm: number;
    age: number;
    gender: "M" | "F";
    activityLevel: "sedentario" | "leggero" | "moderato" | "intenso";
  };
  targetMacros: MacroTargets;
  weeklyPlan: Record<DayName, DailyMealsData>;
  rationale: string;                                      // 2-3 frasi sul ragionamento nutrizionale
  notes?: string;                                          // opzionale, ulteriori note (es. cycling carbo, ricarica)
}

export const NUTRITION_TEMPLATES: NutritionTemplateData[] = [
  /* template qui */
];
```

### 5.3 Linee guida nutrizionali

**Calcolo macro target (formula Mifflin-St Jeor)**:
```
BMR uomo = 10 × peso(kg) + 6.25 × altezza(cm) − 5 × età + 5
BMR donna = 10 × peso(kg) + 6.25 × altezza(cm) − 5 × età − 161

TDEE = BMR × fattore attività
  sedentario   = 1.2
  leggero      = 1.375
  moderato     = 1.55
  intenso      = 1.725

Calorie target per obiettivo:
  LOSE_WEIGHT          = TDEE × 0.80    (deficit 20%)
  BUILD_MUSCLE         = TDEE × 1.10    (surplus 10%)
  GENERAL_FITNESS      = TDEE
  ENDURANCE            = TDEE × 1.05
  ATHLETIC_PERFORMANCE = TDEE × 1.10
  FLEXIBILITY          = TDEE
```

**Distribuzione macro**:
- Proteine: 1.6-2.2 g/kg (più alto per BUILD_MUSCLE)
- Grassi: 0.8-1.2 g/kg, minimo 20% kcal totali
- Carboidrati: rimanente, mai sotto 50g/giorno (eccetto chetogenica → max 50g/giorno)

**Distribuzione kcal nei pasti**:
- Colazione: 25-30%
- Pranzo: 30-35%
- Cena: 25-30%
- Snacks (totale): 10-20%

**Coerenza con `dietType`**:
- `onnivora`: tutto incluso
- `vegetariana`: no carne né pesce, sì uova/latticini
- `vegana`: solo vegetale, no animal-derived (no miele, gelatina, ecc.)
- `chetogenica`: <50g carbo/giorno, alto grassi (60-70% kcal), proteine moderate
- `mediterranea`: focus pesce, olio EVO, legumi, cereali integrali, verdure stagionali
- `altro`: trattare come onnivora con nota

**Coerenza con `pastInjuries`** (nota): se l'utente ha problematiche metaboliche/diabete (info non disponibile nei template ma verrà passata dal prompt), il modello AI dovrà adattare. Nei template puoi non considerarlo.

### 5.4 Convenzioni linguistiche

- `food`: nome italiano comune. Niente brand. Es: `"petto di pollo"`, `"riso integrale"`, `"olio extravergine d'oliva"`, `"yogurt greco bianco"`, `"avena in fiocchi"`. NON `"Chicken breast (Aia)"`, NON `"oats"`.
- `quantityG`: in grammi. Per cibi che cambiano peso con la cottura, specifica nelle `preparationNotes` (es. "100g di riso secco = ~280g cotto").
- `name` del pasto: descrittivo dell'idea, non clinico. Es: `"Riso integrale con pollo grigliato e verdure"`, `"Yogurt greco con granola e frutti rossi"`. NON `"Meal #1: Pasto post-allenamento HIGH-PROTEIN"`.
- `preparationNotes`: opzionale, max 30 parole. Es: `"Cuoci il riso in acqua salata, griglia il pollo con un filo d'olio. Verdure al vapore o saltate in padella."`
- `rationale`: 2-3 frasi tecniche sul ragionamento. Es: `"Surplus calorico moderato (+10%) per facilitare ipertrofia. Distribuzione proteica 2g/kg ripartita su 5 pasti per ottimizzare la sintesi proteica. Carbo concentrati pre/post allenamento."`

### 5.5 Template suggeriti (5 base)

| # | Profilo | dietType | targetGoal | kcal | utente esempio |
|---|---|---|---|---|---|
| 1 | Mediterraneo mantenimento | mediterranea | GENERAL_FITNESS | 2200 | Uomo 30a, 75kg, 175cm, leggero |
| 2 | Vegano massa | vegana | BUILD_MUSCLE | 2800 | Uomo 28a, 78kg, 180cm, moderato |
| 3 | Chetogenica dimagrimento | chetogenica | LOSE_WEIGHT | 1700 | Donna 35a, 70kg, 165cm, sedentario |
| 4 | Vegetariano fitness | vegetariana | GENERAL_FITNESS | 2000 | Donna 28a, 60kg, 168cm, moderato |
| 5 | Onnivoro performance | onnivora | ATHLETIC_PERFORMANCE | 3200 | Uomo 25a, 85kg, 185cm, intenso |

### 5.6 Esempio (1 giorno per il template #1)

```typescript
{
  name: "Mediterraneo Mantenimento 2200 kcal",
  description: "Piano mediterraneo bilanciato per uomo medio con attività lavorativa leggera. Focus su pesce, olio EVO, legumi, cereali integrali, frutta e verdura stagionale.",
  dietType: "mediterranea",
  targetGoal: "GENERAL_FITNESS",
  estimatedTargetProfile: {
    weightKg: 75, heightCm: 175, age: 30, gender: "M", activityLevel: "leggero",
  },
  targetMacros: { kcal: 2200, proteinG: 130, carbsG: 250, fatG: 80 },
  weeklyPlan: {
    lunedi: {
      breakfast: {
        name: "Yogurt greco con avena, miele e frutti di bosco",
        ingredients: [
          { food: "yogurt greco bianco 0%", quantityG: 200 },
          { food: "avena in fiocchi", quantityG: 50 },
          { food: "miele", quantityG: 15 },
          { food: "mirtilli freschi", quantityG: 80 },
          { food: "mandorle a lamelle", quantityG: 15 },
        ],
        preparationNotes: "Mescola yogurt e avena, lascia riposare 5 minuti. Aggiungi miele, mirtilli e mandorle.",
        estimatedKcal: 540, estimatedProteinG: 28, estimatedCarbsG: 70, estimatedFatG: 14,
      },
      lunch: {
        name: "Pasta integrale al pomodoro con tonno e olive",
        ingredients: [
          { food: "pasta integrale", quantityG: 90 },
          { food: "tonno al naturale (sgocciolato)", quantityG: 100 },
          { food: "pomodori pelati", quantityG: 200 },
          { food: "olive nere", quantityG: 30 },
          { food: "olio extravergine d'oliva", quantityG: 15 },
          { food: "basilico fresco", quantityG: 5 },
        ],
        preparationNotes: "Cuoci la pasta al dente. In padella scalda i pomodori con olio, tonno e olive 8 min. Manteca e completa con basilico.",
        estimatedKcal: 720, estimatedProteinG: 38, estimatedCarbsG: 85, estimatedFatG: 24,
      },
      dinner: {
        name: "Salmone al forno con patate e verdure miste",
        ingredients: [
          { food: "filetto di salmone", quantityG: 150 },
          { food: "patate", quantityG: 200 },
          { food: "zucchine", quantityG: 150 },
          { food: "olio extravergine d'oliva", quantityG: 10 },
          { food: "rosmarino", quantityG: 2 },
        ],
        preparationNotes: "Inforna patate a tocchetti 25 min a 200°C. Aggiungi salmone e zucchine, cuoci altri 15 min.",
        estimatedKcal: 620, estimatedProteinG: 40, estimatedCarbsG: 50, estimatedFatG: 26,
      },
      snacks: [
        {
          name: "Mela e mandorle",
          ingredients: [
            { food: "mela", quantityG: 180 },
            { food: "mandorle", quantityG: 25 },
          ],
          estimatedKcal: 240, estimatedProteinG: 6, estimatedCarbsG: 28, estimatedFatG: 14,
        },
        // facoltativo secondo snack
      ],
    },
    martedi: { /* ... 7 giorni totali ... */ },
    // mercoledi, giovedi, venerdi, sabato, domenica obbligatori
  },
  rationale: "Calorie a mantenimento (TDEE) per uomo 75kg attività leggera (~2200 kcal). Distribuzione macro mediterranea: 24% proteine, 45% carbo, 31% grassi (di cui 20%+ da olio EVO e frutta secca). Focus su pesce 2-3 volte/settimana, legumi 2-3 volte, carne rossa max 1 volta.",
},
```

### 5.7 Validation checklist (Documento 3)

- [ ] 5 template, uno per ciascun `dietType` principale
- [ ] Tutti i 7 giorni della settimana (lunedi-domenica) presenti
- [ ] Per ogni giorno: breakfast, lunch, dinner obbligatori; snacks 0-3
- [ ] Coerenza dietType → ingredienti (no pesce in vegana, no carbo in cheto)
- [ ] Somma kcal giornaliere ±10% dal `targetMacros.kcal`
- [ ] Somma proteine/carbo/grassi giornaliere ±15% dai target
- [ ] Tutti i nomi cibi in italiano comune, niente brand
- [ ] Tutti i campi user-facing in italiano
- [ ] `preparationNotes` (se presenti) ≤30 parole
- [ ] `name` del pasto ≤10 parole, descrittivo
- [ ] Compila come TypeScript valido

---

## 6. Stile generale & qualità

### 6.1 Lingua
**Italiano sempre per tutto ciò che è user-facing**: feedback, name, description, rationale, notes, food names, preparationNotes.

Eccezioni (rimangono in inglese, sono enum/identifier):
- `slug` esercizi (squat, push-up, ecc.)
- `joint` names (left_knee, ecc.) — sono identificatori tecnici di MediaPipe
- Enum values (BOTTOM, CRITICAL, BUILD_MUSCLE, ecc.)

### 6.2 Tono
PT professionale, accessibile, prescrittivo. Diretto come un coach in palestra. Niente disclaimer medici, niente esitazioni, niente formule di cortesia, niente emoji.

### 6.3 Riferimenti tecnici
Per la stesura biomeccanica usa come riferimento:
- NSCA — Essentials of Personal Training (3rd ed.)
- ACSM's Guidelines for Exercise Testing and Prescription (11th ed.)
- Schoenfeld — The Science and Development of Muscle Hypertrophy (2nd ed.)

Per la stesura nutrizionale:
- LARN (Livelli di Assunzione Raccomandati di Nutrienti per la popolazione italiana, SINU)
- Mifflin-St Jeor 1990 (BMR)
- ISSN Position Stand: Diets and Body Composition (Aragon et al.)

### 6.4 Anti-pattern da evitare
- ❌ Generare `slug` nuovi non presenti nel seed → rompe foreign key
- ❌ Usare valori enum non in whitelist → typecheck error
- ❌ Feedback identici testualmente tra esercizi diversi → povera UX
- ❌ Range angolari biologicamente impossibili (-10° flessione gomito, 200° abduzione spalla)
- ❌ Quantità nutrizionali assurde (5g/kg proteine, 2000 kcal in un solo pasto)
- ❌ Riferimenti incrociati tra giorni ("vedi pasto di lunedì") → scrivi sempre esplicitamente
- ❌ Brand di prodotti commerciali (Whey Optimum, Aia, Barilla, ecc.)
- ❌ Campi vuoti senza giustificazione (`description: ""`)

---

## 7. File deliverable e collocazione

| Documento | Path output | Owner export |
|---|---|---|
| Specifiche biomeccaniche | `prisma/seed-biomechanical-specs.ts` | `BIOMECHANICAL_SPECS` |
| Template allenamento | `prisma/seed-workout-templates.ts` | `WORKOUT_TEMPLATES` |
| Template nutrizione | `prisma/seed-nutrition-templates.ts` | `NUTRITION_TEMPLATES` |

Ogni file deve essere **TypeScript valido autonomo**: tipi inline o import da `@/types/...`, nessuna dipendenza runtime.

Dopo la consegna, l'integrazione la fa il codice: `prisma/seed.ts` importerà i tre file e popolerà il DB. Endpoint `/api/ai/generate-plan` e `/api/ai/generate-nutrition-plan` leggeranno i template come few-shot.

---

## 8. Checklist finale per l'AI redattrice

Prima di considerare il lavoro chiuso, conferma:

**Per ogni file**:
- [ ] Path corretto (`prisma/seed-*.ts`)
- [ ] Tipi TypeScript dichiarati e coerenti con questa guida
- [ ] Tutti i valori enum dalla whitelist
- [ ] Tutte le stringhe user-facing in italiano
- [ ] Nessun import esterno alla repo
- [ ] Compila con `tsc --noEmit` senza errori

**Documento 1 (biomeccanica)**:
- [ ] Tutti i 20 slug presenti
- [ ] Almeno 1 trigger CRITICAL+injuryRisk per i top 6 esercizi composti
- [ ] Plank/plank-laterale → solo phase THROUGHOUT
- [ ] Range angolari plausibili
- [ ] Feedback ≤30 parole

**Documento 2 (allenamento)**:
- [ ] Almeno 8 template
- [ ] Tutti gli `exerciseSlug` validi
- [ ] `days.length === 7` per ogni template
- [ ] reps O durationSeconds per ogni esercizio (mai entrambi)
- [ ] Bilanciamento muscolare verificato

**Documento 3 (nutrizione)**:
- [ ] 5 template, uno per dietType
- [ ] Tutti i 7 giorni per ogni template
- [ ] Somma kcal e macro coerenti con `targetMacros` (±10/15%)
- [ ] Coerenza dietType ↔ ingredienti

Se anche un solo punto non è soddisfatto, rivedi prima della consegna.

---

*Fine guida. Per dubbi sul codice consumatore vedi `ANALYSIS_SPEC.md`, `ROADMAP.md`, e i file in `src/services/biomechanical/` e `src/services/ai/`.*
