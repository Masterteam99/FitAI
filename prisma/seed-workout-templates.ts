// File: prisma/seed-workout-templates.ts

export type WorkoutDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type FitnessGoal =
  | "LOSE_WEIGHT" | "BUILD_MUSCLE" | "ENDURANCE"
  | "FLEXIBILITY" | "GENERAL_FITNESS" | "ATHLETIC_PERFORMANCE";

export type Equipment =
  | "NONE" | "DUMBBELLS" | "BARBELL" | "MACHINE" | "RESISTANCE_BANDS"
  | "PULL_UP_BAR" | "BENCH" | "KETTLEBELL" | "CABLES" | "FULL_GYM";

export interface WorkoutPlanTemplateData {
  name: string;
  description: string;
  difficulty: WorkoutDifficulty;
  targetGoals: FitnessGoal[];
  requiredEquipment: Equipment[];
  durationWeeks: number;
  workoutsPerWeek: number;
  rationale: string;
  days: WorkoutDayData[];
}

export interface WorkoutDayData {
  dayNumber: number;
  name: string;
  restDay: boolean;
  exercises: WorkoutExerciseData[];
}

export interface WorkoutExerciseData {
  exerciseSlug: string;
  sets: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds: number;
  notes?: string;
}

export const WORKOUT_TEMPLATES: WorkoutPlanTemplateData[] = [

  // ─── TEMPLATE 1 ─── Forza Principianti Full-Body 4 Settimane
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

  // ─── TEMPLATE 2 ─── Massa Intermedio Upper-Lower 6 Settimane
  {
    name: "Massa Intermedio Upper-Lower 6 Settimane",
    description: "Split Upper-Lower 4x/sett per chi ha 6-18 mesi di esperienza. Massimizza il volume settimanale per ogni distretto con recupero ottimale.",
    difficulty: "INTERMEDIATE",
    targetGoals: ["BUILD_MUSCLE"],
    requiredEquipment: ["FULL_GYM"],
    durationWeeks: 6,
    workoutsPerWeek: 4,
    rationale: "Lo split Upper-Lower permette di colpire ogni gruppo muscolare 2 volte a settimana con volume sufficiente per l'ipertrofia. Progressione a doppia progressione: prima aumenta le reps nel range, poi il carico. Mix composti e isolati per stimolo completo.",
    days: [
      {
        dayNumber: 1,
        name: "Parte Alta A - Spinta/Trazione",
        restDay: false,
        exercises: [
          { exerciseSlug: "panca-piana", sets: 4, reps: 8, restSeconds: 150, notes: "Usa il 75-80% del massimale. Cadenza 2-1-2." },
          { exerciseSlug: "rematore-bilanciere", sets: 4, reps: 8, restSeconds: 150 },
          { exerciseSlug: "military-press", sets: 3, reps: 10, restSeconds: 120 },
          { exerciseSlug: "trazioni", sets: 3, reps: 8, restSeconds: 120, notes: "Aggiungere peso se superi le 10 reps con facilità." },
          { exerciseSlug: "curl-bicipiti", sets: 3, reps: 12, restSeconds: 60 },
          { exerciseSlug: "tricipiti-cavi", sets: 3, reps: 12, restSeconds: 60 },
        ],
      },
      {
        dayNumber: 2,
        name: "Parte Bassa A - Quadricipiti/Core",
        restDay: false,
        exercises: [
          { exerciseSlug: "squat", sets: 4, reps: 8, restSeconds: 180, notes: "Lavora a profondità parallela. Aumenta il carico ogni 2 settimane." },
          { exerciseSlug: "leg-press", sets: 3, reps: 12, restSeconds: 120 },
          { exerciseSlug: "affondi", sets: 3, reps: 10, restSeconds: 90 },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 45, restSeconds: 45 },
          { exerciseSlug: "crunch", sets: 3, reps: 20, restSeconds: 45 },
        ],
      },
      {
        dayNumber: 3,
        name: "Riposo",
        restDay: true,
        exercises: [],
      },
      {
        dayNumber: 4,
        name: "Parte Alta B - Ipertrofia",
        restDay: false,
        exercises: [
          { exerciseSlug: "push-up", sets: 4, reps: 15, restSeconds: 60, notes: "Con peso sul dorso per aumentare l'intensità se le normali sono facili." },
          { exerciseSlug: "trazioni", sets: 4, reps: 10, restSeconds: 120 },
          { exerciseSlug: "lateral-raise", sets: 4, reps: 15, restSeconds: 60 },
          { exerciseSlug: "face-pull", sets: 3, reps: 15, restSeconds: 60, notes: "Fondamentale per la salute della cuffia. Non saltarlo." },
          { exerciseSlug: "curl-bicipiti", sets: 3, reps: 15, restSeconds: 60 },
          { exerciseSlug: "tricipiti-cavi", sets: 3, reps: 15, restSeconds: 60 },
        ],
      },
      {
        dayNumber: 5,
        name: "Parte Bassa B - Posteriori/Glutei",
        restDay: false,
        exercises: [
          { exerciseSlug: "romanian-deadlift", sets: 4, reps: 10, restSeconds: 150, notes: "Senti lo stiramento degli ischiocrurali prima di tornare su." },
          { exerciseSlug: "hip-thrust", sets: 4, reps: 12, restSeconds: 120, notes: "Contrai i glutei 1 secondo in cima a ogni ripetizione." },
          { exerciseSlug: "bulgarian-split-squat", sets: 3, reps: 10, restSeconds: 90 },
          { exerciseSlug: "plank-laterale", sets: 3, durationSeconds: 35, restSeconds: 45 },
        ],
      },
      { dayNumber: 6, name: "Riposo", restDay: true, exercises: [] },
      { dayNumber: 7, name: "Riposo attivo / Mobilità", restDay: true, exercises: [] },
    ],
  },

  // ─── TEMPLATE 3 ─── Dimagrimento Principianti Full-Body
  {
    name: "Dimagrimento Principianti Full-Body 4 Settimane",
    description: "Piano per principianti con obiettivo dimagrimento. Circuiti full-body con pesi leggeri e recuperi brevi per massimizzare il dispendio calorico.",
    difficulty: "BEGINNER",
    targetGoals: ["LOSE_WEIGHT", "GENERAL_FITNESS"],
    requiredEquipment: ["DUMBBELLS", "NONE"],
    durationWeeks: 4,
    workoutsPerWeek: 3,
    rationale: "Recuperi brevi (45-60s) per mantenere alta la frequenza cardiaca e aumentare la spesa energetica. Esercizi con bilanciere sostituiti da varianti con manubri o a corpo libero per ridurre la curva tecnica. Progressione sul volume: ogni settimana si aggiunge una serie.",
    days: [
      {
        dayNumber: 1,
        name: "Circuito A - Full Body",
        restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 3, reps: 15, restSeconds: 60 },
          { exerciseSlug: "push-up", sets: 3, reps: 10, restSeconds: 45, notes: "Su ginocchia se necessario per mantenere la forma." },
          { exerciseSlug: "affondi", sets: 3, reps: 12, restSeconds: 60 },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 30, restSeconds: 45 },
          { exerciseSlug: "crunch", sets: 3, reps: 15, restSeconds: 30 },
        ],
      },
      {
        dayNumber: 2,
        name: "Riposo / Cammino leggero",
        restDay: true,
        exercises: [],
      },
      {
        dayNumber: 3,
        name: "Circuito B - Full Body",
        restDay: false,
        exercises: [
          { exerciseSlug: "romanian-deadlift", sets: 3, reps: 12, restSeconds: 60, notes: "Usa manubri leggeri. Priorità alla tecnica sulla schiena neutra." },
          { exerciseSlug: "lateral-raise", sets: 3, reps: 15, restSeconds: 45 },
          { exerciseSlug: "curl-bicipiti", sets: 3, reps: 15, restSeconds: 45 },
          { exerciseSlug: "plank-laterale", sets: 3, durationSeconds: 20, restSeconds: 30 },
          { exerciseSlug: "hip-thrust", sets: 3, reps: 15, restSeconds: 60 },
        ],
      },
      {
        dayNumber: 4,
        name: "Riposo / Cammino leggero",
        restDay: true,
        exercises: [],
      },
      {
        dayNumber: 5,
        name: "Circuito C - Full Body Totale",
        restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 3, reps: 15, restSeconds: 60 },
          { exerciseSlug: "push-up", sets: 3, reps: 12, restSeconds: 45 },
          { exerciseSlug: "romanian-deadlift", sets: 3, reps: 12, restSeconds: 60 },
          { exerciseSlug: "affondi", sets: 3, reps: 12, restSeconds: 60 },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 35, restSeconds: 45 },
        ],
      },
      { dayNumber: 6, name: "Riposo attivo / Camminata o nuoto leggero", restDay: true, exercises: [] },
      { dayNumber: 7, name: "Riposo", restDay: true, exercises: [] },
    ],
  },

  // ─── TEMPLATE 4 ─── Ricomposizione Corporea Avanzato Push-Pull-Legs
  {
    name: "Ricomposizione Corporea Avanzato Push-Pull-Legs",
    description: "Piano Push-Pull-Legs 5x/sett per atleti avanzati con obiettivo di ricomposizione. Alto volume, range di reps variabile, tecniche intensità avanzate.",
    difficulty: "ADVANCED",
    targetGoals: ["BUILD_MUSCLE", "LOSE_WEIGHT"],
    requiredEquipment: ["FULL_GYM"],
    durationWeeks: 8,
    workoutsPerWeek: 5,
    rationale: "Lo split PPL a 5 giorni permette un volume settimanale elevato con recupero adeguato per distretto. Range di reps variabile (4-15) per stimolare sia la forza massimale che l'ipertrofia. Il giorno extra è dedicato a gambe e glutei per compensare l'alto volume del tronco.",
    days: [
      {
        dayNumber: 1,
        name: "Push - Petto/Spalle/Tricipiti",
        restDay: false,
        exercises: [
          { exerciseSlug: "panca-piana", sets: 5, reps: 5, restSeconds: 180, notes: "Primo movimento del giorno. Priorità alla forza: usa il 85% del massimale." },
          { exerciseSlug: "military-press", sets: 4, reps: 8, restSeconds: 150 },
          { exerciseSlug: "push-up", sets: 3, reps: 20, restSeconds: 60, notes: "Come volume aggiuntivo per il petto a fine sessione." },
          { exerciseSlug: "lateral-raise", sets: 4, reps: 15, restSeconds: 60 },
          { exerciseSlug: "tricipiti-cavi", sets: 4, reps: 12, restSeconds: 60 },
        ],
      },
      {
        dayNumber: 2,
        name: "Pull - Dorso/Bicipiti/Spalle Posteriori",
        restDay: false,
        exercises: [
          { exerciseSlug: "stacco-da-terra", sets: 4, reps: 5, restSeconds: 180, notes: "Movimento principale. Esegui con massimo controllo eccentrico." },
          { exerciseSlug: "trazioni", sets: 4, reps: 8, restSeconds: 120, notes: "Aggiungere peso se superi le 10 reps per tutte le serie." },
          { exerciseSlug: "rematore-bilanciere", sets: 4, reps: 8, restSeconds: 150 },
          { exerciseSlug: "face-pull", sets: 3, reps: 15, restSeconds: 60 },
          { exerciseSlug: "curl-bicipiti", sets: 4, reps: 10, restSeconds: 75 },
        ],
      },
      {
        dayNumber: 3,
        name: "Legs - Quadricipiti/Gambe/Core",
        restDay: false,
        exercises: [
          { exerciseSlug: "squat", sets: 5, reps: 5, restSeconds: 180, notes: "Sessione di forza. Usa il 85-90% del massimale." },
          { exerciseSlug: "leg-press", sets: 3, reps: 12, restSeconds: 120 },
          { exerciseSlug: "affondi", sets: 3, reps: 10, restSeconds: 90 },
          { exerciseSlug: "plank", sets: 4, durationSeconds: 60, restSeconds: 45 },
          { exerciseSlug: "crunch", sets: 4, reps: 20, restSeconds: 30 },
        ],
      },
      {
        dayNumber: 4,
        name: "Riposo attivo / Cardio 20-30 min",
        restDay: true,
        exercises: [],
      },
      {
        dayNumber: 5,
        name: "Push Ipertrofia - Petto/Spalle/Tricipiti",
        restDay: false,
        exercises: [
          { exerciseSlug: "push-up", sets: 4, reps: 20, restSeconds: 75, notes: "Con zavorra se superi le 20 reps non a cedimento." },
          { exerciseSlug: "military-press", sets: 4, reps: 12, restSeconds: 90 },
          { exerciseSlug: "lateral-raise", sets: 5, reps: 15, restSeconds: 60, notes: "Drop set sull'ultima serie: riduci il peso e continua fino a cedimento." },
          { exerciseSlug: "tricipiti-cavi", sets: 4, reps: 15, restSeconds: 60 },
        ],
      },
      {
        dayNumber: 6,
        name: "Glutei e Posteriori - Ipertrofia",
        restDay: false,
        exercises: [
          { exerciseSlug: "romanian-deadlift", sets: 4, reps: 10, restSeconds: 150 },
          { exerciseSlug: "hip-thrust", sets: 5, reps: 12, restSeconds: 120, notes: "Contrai i glutei 2 secondi in cima. Focus sull'attivazione gluto-specifica." },
          { exerciseSlug: "bulgarian-split-squat", sets: 4, reps: 10, restSeconds: 90 },
          { exerciseSlug: "plank-laterale", sets: 3, durationSeconds: 45, restSeconds: 45 },
        ],
      },
      { dayNumber: 7, name: "Riposo completo", restDay: true, exercises: [] },
    ],
  },

  // ─── TEMPLATE 5 ─── Forza Powerlifting Avanzato 8 Settimane
  {
    name: "Forza Powerlifting Avanzato 8 Settimane",
    description: "Programma di forza orientato al powerlifting per atleti avanzati. Focus su squat, stacco e panca con programmazione a intensità progressiva.",
    difficulty: "ADVANCED",
    targetGoals: ["ATHLETIC_PERFORMANCE"],
    requiredEquipment: ["BARBELL", "BENCH", "PULL_UP_BAR"],
    durationWeeks: 8,
    workoutsPerWeek: 4,
    rationale: "Struttura a 4 giorni con uno spostamento verso i tre movimenti del powerlifting. Volume accessorio minimo per non compromettere il recupero. Progressione lineare modificata: ogni sessione aumenta l'intensità, con una settimana di scarico ogni 4.",
    days: [
      {
        dayNumber: 1,
        name: "Squat e Accessori Gambe",
        restDay: false,
        exercises: [
          { exerciseSlug: "squat", sets: 5, reps: 5, restSeconds: 240, notes: "Movimento principale. Aggiunta di 2.5 kg ogni sessione se tutte le reps sono pulite." },
          { exerciseSlug: "romanian-deadlift", sets: 3, reps: 8, restSeconds: 150, notes: "Accessorio ischiocrurali. Carico al 60% del max squat." },
          { exerciseSlug: "affondi", sets: 3, reps: 8, restSeconds: 90 },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 45, restSeconds: 45 },
        ],
      },
      {
        dayNumber: 2,
        name: "Panca e Accessori Parte Alta",
        restDay: false,
        exercises: [
          { exerciseSlug: "panca-piana", sets: 5, reps: 5, restSeconds: 240, notes: "Movimento principale. Tocca il petto a ogni ripetizione. Arco naturale nel dorso." },
          { exerciseSlug: "trazioni", sets: 4, reps: 6, restSeconds: 150, notes: "Fondamentale per bilanciare il volume del petto. Aggiungere peso se superi le 8 reps." },
          { exerciseSlug: "military-press", sets: 3, reps: 8, restSeconds: 120 },
          { exerciseSlug: "tricipiti-cavi", sets: 3, reps: 10, restSeconds: 75 },
        ],
      },
      {
        dayNumber: 3,
        name: "Riposo",
        restDay: true,
        exercises: [],
      },
      {
        dayNumber: 4,
        name: "Stacco e Accessori Posteriori",
        restDay: false,
        exercises: [
          { exerciseSlug: "stacco-da-terra", sets: 5, reps: 3, restSeconds: 300, notes: "Movimento principale. Carichi massimali. Recupero pieno tra le serie." },
          { exerciseSlug: "rematore-bilanciere", sets: 4, reps: 8, restSeconds: 150, notes: "Accessorio dorsali. Fondamentale per trasferire forza nel pull dello stacco." },
          { exerciseSlug: "hip-thrust", sets: 3, reps: 10, restSeconds: 120, notes: "Accessorio glutei per migliorare la spinta nella fase di lockout." },
          { exerciseSlug: "crunch", sets: 3, reps: 15, restSeconds: 45 },
        ],
      },
      {
        dayNumber: 5,
        name: "Riposo",
        restDay: true,
        exercises: [],
      },
      {
        dayNumber: 6,
        name: "Volume e Ipertrofia Tecnica",
        restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 4, reps: 12, restSeconds: 90, notes: "Squat tecnico a basso carico. Focus sulla postura e la profondità." },
          { exerciseSlug: "push-up", sets: 4, reps: 15, restSeconds: 60 },
          { exerciseSlug: "trazioni", sets: 4, reps: 8, restSeconds: 120 },
          { exerciseSlug: "face-pull", sets: 4, reps: 15, restSeconds: 60, notes: "Prevenzione rotatori: non saltarlo nelle fasi di alto volume di panca." },
          { exerciseSlug: "plank-laterale", sets: 3, durationSeconds: 40, restSeconds: 40 },
        ],
      },
      { dayNumber: 7, name: "Riposo completo", restDay: true, exercises: [] },
    ],
  },

  // ─── TEMPLATE 6 ─── Casa Senza Attrezzi Principianti
  {
    name: "Casa Senza Attrezzi Principianti 4 Settimane",
    description: "Allenamento a corpo libero per chi inizia da zero a casa. Costruisce forza di base, mobilità e abitudine all'esercizio senza alcuna attrezzatura.",
    difficulty: "BEGINNER",
    targetGoals: ["GENERAL_FITNESS", "FLEXIBILITY"],
    requiredEquipment: ["NONE"],
    durationWeeks: 4,
    workoutsPerWeek: 3,
    rationale: "A corpo libero: la progressione avviene aumentando le reps e riducendo i recuperi. Esercizi scelti per coprire tutti i distretti con movimenti basilari. Nessuna attrezzatura richiesta: plank, push-up, affondi, crunch, goblet squat con oggetto pesante casalingo.",
    days: [
      {
        dayNumber: 1,
        name: "Giorno A - Parte Alta e Core",
        restDay: false,
        exercises: [
          { exerciseSlug: "push-up", sets: 3, reps: 8, restSeconds: 75, notes: "Su ginocchia se non riesci a fare 5 reps a forma. Aumenta 1-2 reps ogni settimana." },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 20, restSeconds: 45 },
          { exerciseSlug: "crunch", sets: 3, reps: 15, restSeconds: 45 },
          { exerciseSlug: "plank-laterale", sets: 2, durationSeconds: 15, restSeconds: 30 },
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
        name: "Giorno B - Gambe e Glutei",
        restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 3, reps: 12, restSeconds: 75, notes: "Usa una bottiglia d'acqua o un oggetto pesante come contrappeso." },
          { exerciseSlug: "affondi", sets: 3, reps: 10, restSeconds: 60, notes: "Tieni le mani sui fianchi per migliorare l'equilibrio." },
          { exerciseSlug: "hip-thrust", sets: 3, reps: 15, restSeconds: 60, notes: "Usa il bordo del divano o del letto come appoggio per la schiena." },
          { exerciseSlug: "plank", sets: 2, durationSeconds: 25, restSeconds: 45 },
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
          { exerciseSlug: "push-up", sets: 3, reps: 10, restSeconds: 60 },
          { exerciseSlug: "goblet-squat", sets: 3, reps: 15, restSeconds: 60 },
          { exerciseSlug: "affondi", sets: 3, reps: 12, restSeconds: 60 },
          { exerciseSlug: "crunch", sets: 3, reps: 20, restSeconds: 45 },
          { exerciseSlug: "plank-laterale", sets: 2, durationSeconds: 20, restSeconds: 30 },
        ],
      },
      { dayNumber: 6, name: "Riposo attivo / Camminata o stretching", restDay: true, exercises: [] },
      { dayNumber: 7, name: "Riposo", restDay: true, exercises: [] },
    ],
  },

  // ─── TEMPLATE 7 ─── Body Recomp Donne Intermedio
  {
    name: "Body Recomp Donne Intermedio 6 Settimane",
    description: "Piano 4x/sett per donne con obiettivo tonificazione e ricomposizione. Enfasi su glutei e parte bassa con volume calibrato per ipertrofia femminile.",
    difficulty: "INTERMEDIATE",
    targetGoals: ["BUILD_MUSCLE", "LOSE_WEIGHT"],
    requiredEquipment: ["DUMBBELLS", "BENCH"],
    durationWeeks: 6,
    workoutsPerWeek: 4,
    rationale: "Frequenza gluto-specifica 3x/sett (hip thrust, split squat, romanian deadlift) per massimizzare l'ipertrofia dei glutei. Upper body 2x/sett con volume moderato. Recuperi variabili: più brevi per gli isolati per aumentare la spesa calorica.",
    days: [
      {
        dayNumber: 1,
        name: "Glutei e Posteriori A",
        restDay: false,
        exercises: [
          { exerciseSlug: "hip-thrust", sets: 4, reps: 12, restSeconds: 120, notes: "Usa manubri sul bacino o una borsa con pesi. Contrai 2 sec in cima." },
          { exerciseSlug: "romanian-deadlift", sets: 4, reps: 10, restSeconds: 120 },
          { exerciseSlug: "bulgarian-split-squat", sets: 3, reps: 10, restSeconds: 90, notes: "Usa manubri. Porta il ginocchio posteriore quasi a terra." },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 40, restSeconds: 45 },
        ],
      },
      {
        dayNumber: 2,
        name: "Parte Alta e Core",
        restDay: false,
        exercises: [
          { exerciseSlug: "push-up", sets: 4, reps: 12, restSeconds: 60, notes: "Su piedi interi se riesci a tenere la forma per 12 reps." },
          { exerciseSlug: "lateral-raise", sets: 4, reps: 15, restSeconds: 60 },
          { exerciseSlug: "curl-bicipiti", sets: 3, reps: 15, restSeconds: 60 },
          { exerciseSlug: "tricipiti-cavi", sets: 3, reps: 15, restSeconds: 60, notes: "Con manubrio o elastico se non hai cavi." },
          { exerciseSlug: "crunch", sets: 3, reps: 20, restSeconds: 30 },
          { exerciseSlug: "plank-laterale", sets: 3, durationSeconds: 30, restSeconds: 30 },
        ],
      },
      {
        dayNumber: 3,
        name: "Riposo / Stretching",
        restDay: true,
        exercises: [],
      },
      {
        dayNumber: 4,
        name: "Glutei e Gambe B",
        restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 4, reps: 15, restSeconds: 90, notes: "Usa un manubrio pesante. Scendi sotto la parallela." },
          { exerciseSlug: "affondi", sets: 4, reps: 12, restSeconds: 75, notes: "Alterna la gamba avanzante per ogni ripetizione." },
          { exerciseSlug: "hip-thrust", sets: 3, reps: 15, restSeconds: 90 },
          { exerciseSlug: "crunch", sets: 3, reps: 20, restSeconds: 30 },
        ],
      },
      {
        dayNumber: 5,
        name: "Full Body Ipertrofia Leggera",
        restDay: false,
        exercises: [
          { exerciseSlug: "romanian-deadlift", sets: 3, reps: 12, restSeconds: 90 },
          { exerciseSlug: "push-up", sets: 3, reps: 15, restSeconds: 60 },
          { exerciseSlug: "lateral-raise", sets: 3, reps: 15, restSeconds: 60 },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 45, restSeconds: 45 },
          { exerciseSlug: "curl-bicipiti", sets: 3, reps: 15, restSeconds: 60 },
        ],
      },
      { dayNumber: 6, name: "Riposo attivo / Cardio leggero 30 min", restDay: true, exercises: [] },
      { dayNumber: 7, name: "Riposo completo", restDay: true, exercises: [] },
    ],
  },

  // ─── TEMPLATE 8 ─── Endurance Circuit Intermedio
  {
    name: "Endurance Circuit Intermedio 6 Settimane",
    description: "Allenamento a circuito 4x/sett per sviluppare resistenza muscolare e cardiovascolare. Recuperi brevi, volume alto, transizioni rapide tra esercizi.",
    difficulty: "INTERMEDIATE",
    targetGoals: ["ENDURANCE", "GENERAL_FITNESS"],
    requiredEquipment: ["DUMBBELLS", "KETTLEBELL"],
    durationWeeks: 6,
    workoutsPerWeek: 4,
    rationale: "Recuperi 30-60s per mantenere la frequenza cardiaca sopra il 65% del massimale. Ogni circuito copre tutti i distretti per massimizzare il dispendio calorico. Progressione sul numero di circuiti: dalla settimana 1 (2 round) alla settimana 6 (4 round).",
    days: [
      {
        dayNumber: 1,
        name: "Circuito A - Forza Resistenza",
        restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 3, reps: 20, restSeconds: 45, notes: "Esegui a ritmo costante. Non fermarti tra le reps." },
          { exerciseSlug: "push-up", sets: 3, reps: 15, restSeconds: 45 },
          { exerciseSlug: "romanian-deadlift", sets: 3, reps: 15, restSeconds: 45 },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 40, restSeconds: 30 },
          { exerciseSlug: "affondi", sets: 3, reps: 15, restSeconds: 45 },
        ],
      },
      {
        dayNumber: 2,
        name: "Circuito B - Parte Alta Resistenza",
        restDay: false,
        exercises: [
          { exerciseSlug: "push-up", sets: 4, reps: 20, restSeconds: 30, notes: "Se arrivi a cedimento prima delle 20 reps, registra e migliora nel tempo." },
          { exerciseSlug: "lateral-raise", sets: 4, reps: 20, restSeconds: 30 },
          { exerciseSlug: "curl-bicipiti", sets: 4, reps: 20, restSeconds: 30 },
          { exerciseSlug: "tricipiti-cavi", sets: 4, reps: 20, restSeconds: 30 },
          { exerciseSlug: "crunch", sets: 4, reps: 25, restSeconds: 30 },
        ],
      },
      {
        dayNumber: 3,
        name: "Riposo attivo / Corsa 20 min",
        restDay: true,
        exercises: [],
      },
      {
        dayNumber: 4,
        name: "Circuito C - Full Body Metabolico",
        restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 4, reps: 20, restSeconds: 30 },
          { exerciseSlug: "push-up", sets: 4, reps: 15, restSeconds: 30 },
          { exerciseSlug: "affondi", sets: 4, reps: 15, restSeconds: 30 },
          { exerciseSlug: "hip-thrust", sets: 4, reps: 20, restSeconds: 30 },
          { exerciseSlug: "plank-laterale", sets: 3, durationSeconds: 30, restSeconds: 30 },
        ],
      },
      {
        dayNumber: 5,
        name: "Circuito D - Resistenza Posteriori",
        restDay: false,
        exercises: [
          { exerciseSlug: "romanian-deadlift", sets: 4, reps: 15, restSeconds: 45 },
          { exerciseSlug: "hip-thrust", sets: 4, reps: 20, restSeconds: 30 },
          { exerciseSlug: "bulgarian-split-squat", sets: 3, reps: 12, restSeconds: 45 },
          { exerciseSlug: "plank", sets: 4, durationSeconds: 45, restSeconds: 30 },
          { exerciseSlug: "crunch", sets: 3, reps: 25, restSeconds: 30 },
        ],
      },
      { dayNumber: 6, name: "Riposo attivo / Nuoto o ciclismo 30 min", restDay: true, exercises: [] },
      { dayNumber: 7, name: "Riposo completo", restDay: true, exercises: [] },
    ],
  },

  // ─── TEMPLATE 9 ─── Mobility e Core Intermedio
  {
    name: "Mobility e Core Intermedio 6 Settimane",
    description: "Piano 3x/sett focalizzato su mobilità, stabilità del core e controllo del movimento. Ideale come complemento a un piano di forza o per recupero attivo.",
    difficulty: "INTERMEDIATE",
    targetGoals: ["FLEXIBILITY", "GENERAL_FITNESS"],
    requiredEquipment: ["NONE", "RESISTANCE_BANDS"],
    durationWeeks: 6,
    workoutsPerWeek: 3,
    rationale: "Volume basso e recuperi moderati per favorire l'apprendimento motorio e la qualità del movimento. Plank progressivi come colonna vertebrale del programma. Esercizi di mobilità dell'anca e della spalla inseriti tra i set principali.",
    days: [
      {
        dayNumber: 1,
        name: "Core Profondo e Stabilità",
        restDay: false,
        exercises: [
          { exerciseSlug: "plank", sets: 4, durationSeconds: 45, restSeconds: 60, notes: "Concentrati sulla respirazione e sulla contrazione dell'addome trasverso." },
          { exerciseSlug: "plank-laterale", sets: 3, durationSeconds: 35, restSeconds: 45, notes: "Mantieni i fianchi allineati. Evita che il bacino scenda." },
          { exerciseSlug: "crunch", sets: 3, reps: 20, restSeconds: 45 },
          { exerciseSlug: "hip-thrust", sets: 3, reps: 15, restSeconds: 60, notes: "Usa solo il peso del corpo. Focus sulla contrazione gluto-lombare." },
        ],
      },
      {
        dayNumber: 2,
        name: "Riposo / Stretching passivo",
        restDay: true,
        exercises: [],
      },
      {
        dayNumber: 3,
        name: "Mobilità Anca e Gambe",
        restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 4, reps: 12, restSeconds: 60, notes: "Pausa di 2 secondi nella posizione più bassa per migliorare la mobilità dell'anca." },
          { exerciseSlug: "affondi", sets: 3, reps: 12, restSeconds: 60, notes: "Esegui lentamente. Mantieni il busto verticale durante tutto il movimento." },
          { exerciseSlug: "romanian-deadlift", sets: 3, reps: 12, restSeconds: 90, notes: "Peso corporeo o con elastico. Focus sullo stiramento degli ischiocrurali." },
          { exerciseSlug: "plank", sets: 3, durationSeconds: 40, restSeconds: 45 },
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
        name: "Mobilità Spalla e Parte Alta",
        restDay: false,
        exercises: [
          { exerciseSlug: "face-pull", sets: 4, reps: 15, restSeconds: 60, notes: "Con elastico. Fondamentale per la salute della cuffia dei rotatori." },
          { exerciseSlug: "push-up", sets: 3, reps: 12, restSeconds: 60, notes: "Cadenza 3-1-2: 3 sec in discesa, pausa 1 sec al basso, 2 sec salita." },
          { exerciseSlug: "lateral-raise", sets: 3, reps: 15, restSeconds: 60, notes: "Con elastico. Movimento lento e controllato." },
          { exerciseSlug: "plank-laterale", sets: 3, durationSeconds: 40, restSeconds: 45 },
          { exerciseSlug: "crunch", sets: 3, reps: 20, restSeconds: 45 },
        ],
      },
      { dayNumber: 6, name: "Riposo attivo / Yoga o cammino", restDay: true, exercises: [] },
      { dayNumber: 7, name: "Riposo", restDay: true, exercises: [] },
    ],
  },

  // ─── TEMPLATE 10 ─── Massa Minimal Equipment Intermedio
  {
    name: "Massa Minimal Equipment Intermedio 8 Settimane",
    description: "Piano ipertrofia 4x/sett con manubri, sbarra e panca. Ottimizzato per chi si allena a casa o in palestra con attrezzatura limitata.",
    difficulty: "INTERMEDIATE",
    targetGoals: ["BUILD_MUSCLE"],
    requiredEquipment: ["DUMBBELLS", "PULL_UP_BAR", "BENCH"],
    durationWeeks: 8,
    workoutsPerWeek: 4,
    rationale: "Le trazioni sostituiscono il rematore e il lat machine per il dorso. I push-up e la panca con manubri coprono il petto. Progressione sul carico dei manubri: aggiungi 1-2 kg ogni volta che superi il limite alto del range di reps per tutte le serie.",
    days: [
      {
        dayNumber: 1,
        name: "Push - Petto e Spalle",
        restDay: false,
        exercises: [
          { exerciseSlug: "push-up", sets: 4, reps: 15, restSeconds: 90, notes: "Con piedi rialzati su panca per più inclinazione sul deltoide anteriore." },
          { exerciseSlug: "military-press", sets: 4, reps: 10, restSeconds: 120, notes: "Con manubri. Controlla la discesa in 3 secondi." },
          { exerciseSlug: "lateral-raise", sets: 4, reps: 15, restSeconds: 75 },
          { exerciseSlug: "tricipiti-cavi", sets: 3, reps: 12, restSeconds: 75, notes: "Con manubrio in french press o elastico se non hai cavi." },
        ],
      },
      {
        dayNumber: 2,
        name: "Pull - Dorso e Bicipiti",
        restDay: false,
        exercises: [
          { exerciseSlug: "trazioni", sets: 4, reps: 8, restSeconds: 150, notes: "Presa prona (pronata) per attivare maggiormente i dorsali." },
          { exerciseSlug: "rematore-bilanciere", sets: 4, reps: 10, restSeconds: 120, notes: "Con manubrio su panca se non hai bilanciere." },
          { exerciseSlug: "face-pull", sets: 3, reps: 15, restSeconds: 75, notes: "Con elastico. Non saltarlo: protegge la cuffia dal volume del push." },
          { exerciseSlug: "curl-bicipiti", sets: 4, reps: 12, restSeconds: 75 },
        ],
      },
      {
        dayNumber: 3,
        name: "Riposo / Cardio leggero",
        restDay: true,
        exercises: [],
      },
      {
        dayNumber: 4,
        name: "Legs - Quadricipiti e Core",
        restDay: false,
        exercises: [
          { exerciseSlug: "goblet-squat", sets: 4, reps: 12, restSeconds: 120, notes: "Usa il manubrio più pesante che hai. Scendi sotto la parallela." },
          { exerciseSlug: "affondi", sets: 4, reps: 10, restSeconds: 90, notes: "Con manubri ai fianchi. Alterna le gambe." },
          { exerciseSlug: "leg-press", sets: 3, reps: 15, restSeconds: 120, notes: "Se non hai la macchina, sostituisci con goblet squat monopodalico." },
          { exerciseSlug: "plank", sets: 4, durationSeconds: 45, restSeconds: 45 },
          { exerciseSlug: "crunch", sets: 3, reps: 20, restSeconds: 30 },
        ],
      },
      {
        dayNumber: 5,
        name: "Glutei e Posteriori",
        restDay: false,
        exercises: [
          { exerciseSlug: "hip-thrust", sets: 4, reps: 12, restSeconds: 120, notes: "Con manubrio sul bacino. Pausa di 1 sec al lockout." },
          { exerciseSlug: "romanian-deadlift", sets: 4, reps: 10, restSeconds: 120, notes: "Con manubri. Focus sull'allungamento degli ischiocrurali." },
          { exerciseSlug: "bulgarian-split-squat", sets: 3, reps: 10, restSeconds: 90, notes: "Con manubri ai fianchi. Piede posteriore sul bordo della panca." },
          { exerciseSlug: "plank-laterale", sets: 3, durationSeconds: 40, restSeconds: 45 },
        ],
      },
      { dayNumber: 6, name: "Riposo attivo / Stretching", restDay: true, exercises: [] },
      { dayNumber: 7, name: "Riposo completo", restDay: true, exercises: [] },
    ],
  },

];
