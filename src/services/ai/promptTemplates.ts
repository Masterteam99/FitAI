export const SYSTEM_PROMPTS = {
  PLAN_GENERATOR: `Sei un personal trainer certificato e specialista in programmazione dell'allenamento con 15 anni di esperienza.
Crei piani di allenamento personalizzati, scientifici e progressivi basandoti sulle esigenze specifiche dell'utente.
Parla sempre in italiano.
Rispondi SOLO con JSON valido, senza testo aggiuntivo fuori dal JSON.`,

  EXERCISE_ANALYZER: `Sei un fisioterapista e personal trainer con specializzazione in biomeccanica del movimento e 15 anni di esperienza pratica.
Analizzi esecuzioni di esercizi con occhio clinico, identificando errori tecnici, rischi di infortuni e aree di miglioramento.
Sei preciso, professionale ma accessibile. Parla in italiano.
Rispondi SOLO con JSON valido.`,

  AI_COACH: `Sei FitAI Coach, un personal trainer AI disponibile 24/7. Hai competenze in fitness, nutrizione, recupero muscolare e psicologia dello sport.
Sei motivante, empatico e scientifico. Dai consigli pratici e personalizzati.
Parla in italiano, usa un tono amichevole ma professionale.
Rispondi in modo conciso (max 3-4 paragrafi per risposta) a meno che non sia richiesto altrimenti.`,

  ONBOARDING_ANALYZER: `Sei un personal trainer esperto che valuta nuovi clienti attraverso un assessment iniziale.
Analizza le risposte del questionario e crea un profilo fitness personalizzato con raccomandazioni iniziali.
Parla in italiano, rispondi con JSON valido.`,
} as const;

export function buildPlanGeneratorPrompt(params: {
  goals: string[];
  currentLevel: string;
  equipment: string[];
  daysPerWeek: number;
  focusAreas: string[];
  restrictions?: string;
  durationWeeks: number;
  exerciseList: string;
  dietType?: string;
  pastInjuries?: string[];
  pastSports?: string[];
}): string {
  return `Crea un piano di allenamento personalizzato con queste specifiche:

PROFILO UTENTE:
- Obiettivi: ${params.goals.join(", ")}
- Livello attuale: ${params.currentLevel}
- Attrezzatura disponibile: ${params.equipment.join(", ")}
- Giorni di allenamento a settimana: ${params.daysPerWeek}
- Aree da enfatizzare: ${params.focusAreas.join(", ")}
- Durata piano: ${params.durationWeeks} settimane
${params.restrictions ? `- Limitazioni/controindicazioni: ${params.restrictions}` : ""}
${params.pastInjuries && params.pastInjuries.length > 0 ? `- PROBLEMATICHE FISICHE: ${params.pastInjuries.join(", ")} — adatta il piano evitando movimenti che potrebbero peggiorare queste condizioni.` : ""}
${params.pastSports && params.pastSports.length > 0 ? `- ESPERIENZA PREGRESSA: ${params.pastSports.join(", ")} — considera adattamenti motori già acquisiti.` : ""}
${params.dietType ? `- Dieta attuale: ${params.dietType}` : ""}

ESERCIZI DISPONIBILI NEL DATABASE:
${params.exerciseList}

Ogni esercizio riporta dei TAG (obiettivo, gruppo muscolare, attrezzatura, livello, contesto, pattern motorio, eventuali controindicazioni). Sono il tuo strumento principale di selezione.

REGOLE:
1. Usa SOLO esercizi dalla lista sopra (usa il campo "slug" come identificatore).
2. SELEZIONE TAG-DRIVEN: scegli gli esercizi i cui tag combaciano meglio con il profilo utente — obiettivi (${params.goals.join(", ")}), livello (${params.currentLevel}), attrezzatura disponibile (${params.equipment.join(", ")}) e aree da enfatizzare. Preferisci sempre l'esercizio con più tag rilevanti.
3. SICUREZZA: se l'utente ha problematiche fisiche/limitazioni, ESCLUDI gli esercizi con tag di controindicazione corrispondenti e prediligi alternative più sicure.
4. ATTREZZATURA: non proporre esercizi che richiedono attrezzatura non disponibile.
5. Bilancia i gruppi muscolari nell'arco della settimana (no stesso gruppo 2 giorni consecutivi).
6. Inizia con volume conservativo per principianti, progressivo per avanzati.
7. Rispetta i giorni di allenamento richiesti (${params.daysPerWeek} giorni).
8. Assegna nomi descrittivi ai giorni (es: "Giorno A - Parte Alta", "Giorno B - Gambe").
9. Nel campo "rationale" spiega brevemente perché i tag scelti rispondono al profilo dell'utente.

OUTPUT JSON (obbligatorio):
{
  "name": "Nome del piano",
  "description": "Descrizione breve del piano e sua logica",
  "difficulty": "BEGINNER" | "INTERMEDIATE" | "ADVANCED",
  "durationWeeks": ${params.durationWeeks},
  "workoutsPerWeek": ${params.daysPerWeek},
  "rationale": "Spiegazione delle scelte fatte per questo utente specifico",
  "days": [
    {
      "dayNumber": 1,
      "name": "Giorno A - ...",
      "restDay": false,
      "exercises": [
        {
          "exerciseSlug": "squat",
          "sets": 4,
          "reps": 10,
          "durationSeconds": null,
          "restSeconds": 90,
          "notes": "Nota opzionale"
        }
      ]
    }
  ]
}`;
}

export function buildExerciseAnalyzerPrompt(params: {
  exerciseName: string;
  exerciseSlug: string;
  professionalNotes: string;
  keypointSummary: string;
  biomechanicalViolations: string;
}): string {
  return `Analizza questa esecuzione di ${params.exerciseName}:

NOTE TECNICHE DEL PROFESSIONISTA:
${params.professionalNotes}

DATI BIOMECCANICI (angoli articolari misurati nel tempo):
${params.keypointSummary}

VIOLAZIONI RILEVATE DAL SISTEMA BIOMECCANICO:
${params.biomechanicalViolations || "Nessuna violazione rilevata dal sistema automatico."}

Fornisci la tua analisi professionale come se fossi un PT che osserva in diretta l'esecuzione.

OUTPUT JSON:
{
  "score": <numero 0-100>,
  "mainAnalysis": "<analisi principale, max 200 parole>",
  "top3Improvements": [
    { "area": "<articolazione/movimento>", "instruction": "<istruzione correttiva specifica>" },
    { "area": "...", "instruction": "..." },
    { "area": "...", "instruction": "..." }
  ],
  "strengths": ["<punto di forza 1>", "<punto di forza 2>"],
  "injuryRisk": "BASSO" | "MEDIO" | "ALTO",
  "injuryRiskExplanation": "<spiegazione breve del rischio>"
}`;
}

export function buildVideoComparisonPrompt(exerciseName: string, differences: string): string {
  return `Sei un coach specializzato nell'analisi video. Confronta l'esecuzione dell'utente con quella professionale di riferimento per: ${exerciseName}

DIFFERENZE RILEVATE (delta angoli chiave):
${differences}

Genera un feedback specifico e costruttivo sulle differenze visive osservate.

OUTPUT JSON:
{
  "score": <numero 0-100>,
  "feedback": "<feedback principale confronto video, max 150 parole>",
  "keyDifferences": ["<differenza 1>", "<differenza 2>", "<differenza 3>"]
}`;
}

export const NUTRITION_SYSTEM_PROMPT = `Sei un nutrizionista certificato e personal trainer con specializzazione in alimentazione sportiva. Crei piani alimentari settimanali bilanciati, scientificamente fondati e adattati alla dieta dell'utente. Parla sempre in italiano. Rispondi SOLO con JSON valido, senza testo fuori dal JSON.`;

export function buildNutritionPlanPrompt(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: "M" | "F";
  activityLevel: "sedentario" | "leggero" | "moderato" | "intenso";
  dietType: string;
  targetGoal: string;
  pastInjuries?: string[];
  targetMacros: { kcal: number; proteinG: number; carbsG: number; fatG: number };
}): string {
  return `Crea un piano nutrizionale settimanale completo (lunedi-domenica, breakfast/lunch/dinner + snacks).

PROFILO UTENTE:
- ${params.gender === "M" ? "Uomo" : "Donna"}, ${params.age} anni, ${params.weightKg}kg, ${params.heightCm}cm
- Attività: ${params.activityLevel}
- Dieta: ${params.dietType}
- Obiettivo: ${params.targetGoal}
${params.pastInjuries && params.pastInjuries.length > 0 ? `- Problematiche fisiche: ${params.pastInjuries.join(", ")}` : ""}

TARGET MACRO GIORNALIERO (calcolato per questo profilo):
- Calorie: ${params.targetMacros.kcal} kcal
- Proteine: ${params.targetMacros.proteinG}g
- Carboidrati: ${params.targetMacros.carbsG}g
- Grassi: ${params.targetMacros.fatG}g

VINCOLI DIETETICI (rispetta rigorosamente):
- onnivora: tutto incluso
- vegetariana: no carne né pesce, sì uova/latticini
- vegana: solo vegetale (no animal-derived)
- chetogenica: <50g carbo/giorno, alto grassi (60-70% kcal)
- mediterranea: focus pesce, olio EVO, legumi, cereali integrali

REGOLE:
1. Tutti e 7 i giorni popolati (lunedi, martedi, mercoledi, giovedi, venerdi, sabato, domenica)
2. Per ogni giorno: breakfast, lunch, dinner, snacks (1-2 snack)
3. Cibi in italiano comune, niente brand
4. Quantità in grammi
5. Stima kcal/proteine/carbo/grassi per ogni pasto; somma giornaliera ±10% dai target
6. Distribuzione tipica: colazione 25-30%, pranzo 30-35%, cena 25-30%, snacks 10-20%

OUTPUT JSON (obbligatorio):
{
  "name": "<nome del piano>",
  "description": "<breve descrizione>",
  "dietType": "${params.dietType}",
  "targetGoal": "${params.targetGoal}",
  "targetMacros": ${JSON.stringify(params.targetMacros)},
  "weeklyPlan": {
    "lunedi": {
      "breakfast": { "name": "...", "ingredients": [{"food": "...", "quantityG": N}], "preparationNotes": "...", "estimatedKcal": N, "estimatedProteinG": N, "estimatedCarbsG": N, "estimatedFatG": N },
      "lunch": { ... },
      "dinner": { ... },
      "snacks": [{ ... }]
    },
    "martedi": { ... }, "mercoledi": { ... }, "giovedi": { ... }, "venerdi": { ... }, "sabato": { ... }, "domenica": { ... }
  },
  "rationale": "<2-3 frasi sul ragionamento nutrizionale>"
}`;
}
