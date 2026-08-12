// Config del quiz di onboarding (editabile dall'Account Manager, mostrato agli utenti).
export type QuizQuestionType = "single" | "multi" | "number" | "text";

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  key: string; // chiave che mappa ai dati del sistema (goal, level, equipment, days, diet, notes…)
  title: string; // copy mostrato all'utente
  help?: string;
  type: QuizQuestionType;
  options?: QuizOption[];
  min?: number;
  max?: number;
  required?: boolean;
}

export interface QuizConfig {
  questions: QuizQuestion[];
}

export const FITNESS_GOALS = ["LOSE_WEIGHT", "BUILD_MUSCLE", "ENDURANCE", "FLEXIBILITY", "GENERAL_FITNESS", "ATHLETIC_PERFORMANCE"] as const;
export const FITNESS_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ATHLETE"] as const;
export const EQUIPMENTS = ["NONE", "DUMBBELLS", "BARBELL", "MACHINE", "RESISTANCE_BANDS", "PULL_UP_BAR", "BENCH", "KETTLEBELL", "CABLES", "FULL_GYM"] as const;

// Chiavi "di sistema": collegano una domanda a un dato dell'utente. L'admin può cambiare
// copy/opzioni; se cambia una chiave in qualcosa di non riconosciuto, la risposta non viene mappata.
export const SYSTEM_KEYS = ["goal", "level", "place", "equipment", "days", "time", "diet", "notes"] as const;

export const DEFAULT_QUIZ: QuizConfig = {
  questions: [
    {
      key: "goal", title: "Qual è il tuo obiettivo principale?", type: "single", required: true,
      options: [
        { value: "LOSE_WEIGHT", label: "Perdere peso" },
        { value: "BUILD_MUSCLE", label: "Aumentare la massa" },
        { value: "ENDURANCE", label: "Migliorare la resistenza" },
        { value: "FLEXIBILITY", label: "Mobilità e flessibilità" },
        { value: "GENERAL_FITNESS", label: "Restare in forma" },
        { value: "ATHLETIC_PERFORMANCE", label: "Performance sportiva" },
      ],
    },
    {
      key: "level", title: "Come descriveresti il tuo livello?", type: "single", required: true,
      options: [
        { value: "BEGINNER", label: "Principiante" },
        { value: "INTERMEDIATE", label: "Intermedio" },
        { value: "ADVANCED", label: "Avanzato" },
        { value: "ATHLETE", label: "Atleta" },
      ],
    },
    {
      key: "place", title: "Dove ti alleni di solito?", type: "single", required: true,
      options: [
        { value: "home", label: "A casa" },
        { value: "gym", label: "In palestra" },
        { value: "outdoor", label: "All'aperto" },
      ],
    },
    {
      key: "equipment", title: "Che attrezzatura hai a disposizione?", type: "multi",
      options: [
        { value: "NONE", label: "Nessuna (corpo libero)" },
        { value: "DUMBBELLS", label: "Manubri" },
        { value: "RESISTANCE_BANDS", label: "Elastici" },
        { value: "KETTLEBELL", label: "Kettlebell" },
        { value: "PULL_UP_BAR", label: "Sbarra trazioni" },
        { value: "BENCH", label: "Panca" },
        { value: "BARBELL", label: "Bilanciere" },
        { value: "MACHINE", label: "Macchinari" },
        { value: "CABLES", label: "Cavi" },
        { value: "FULL_GYM", label: "Palestra completa" },
      ],
    },
    { key: "days", title: "Quanti giorni a settimana vuoi allenarti?", type: "number", min: 2, max: 6, required: true },
    {
      key: "time", title: "Quanto tempo hai per sessione?", type: "single",
      options: [
        { value: "20", label: "~20 min" },
        { value: "30", label: "~30 min" },
        { value: "45", label: "~45 min" },
        { value: "60", label: "60+ min" },
      ],
    },
    {
      key: "diet", title: "Segui un'alimentazione particolare?", type: "single",
      options: [
        { value: "onnivora", label: "Onnivora" },
        { value: "vegetariana", label: "Vegetariana" },
        { value: "vegana", label: "Vegana" },
        { value: "chetogenica", label: "Chetogenica" },
        { value: "mediterranea", label: "Mediterranea" },
        { value: "altro", label: "Altro" },
      ],
    },
    {
      key: "notes", title: "C'è qualcosa di cui tenere conto? (infortuni, condizioni)",
      help: "Facoltativo. Solo per adattare l'allenamento, non è un consulto medico.", type: "text",
    },
  ],
};

export interface UserUpdateFromQuiz {
  primaryGoal?: (typeof FITNESS_GOALS)[number];
  fitnessLevel?: (typeof FITNESS_LEVELS)[number];
  weeklyWorkoutDays?: number;
  availableEquipment?: (typeof EQUIPMENTS)[number][];
  dietType?: string;
  medicalNotes?: string;
}

// Traduce le risposte del quiz nei campi dell'utente (solo chiavi di sistema riconosciute).
export function mapAnswersToUser(answers: Record<string, unknown>): UserUpdateFromQuiz {
  const out: UserUpdateFromQuiz = {};

  const goal = answers.goal;
  if (typeof goal === "string" && (FITNESS_GOALS as readonly string[]).includes(goal)) out.primaryGoal = goal as UserUpdateFromQuiz["primaryGoal"];

  const level = answers.level;
  if (typeof level === "string" && (FITNESS_LEVELS as readonly string[]).includes(level)) out.fitnessLevel = level as UserUpdateFromQuiz["fitnessLevel"];

  const daysN = typeof answers.days === "number" ? answers.days : Number(answers.days);
  if (Number.isFinite(daysN) && daysN >= 1 && daysN <= 7) out.weeklyWorkoutDays = Math.round(daysN);

  const eq = answers.equipment;
  if (Array.isArray(eq)) {
    const valid = eq.filter((e): e is (typeof EQUIPMENTS)[number] => typeof e === "string" && (EQUIPMENTS as readonly string[]).includes(e));
    if (valid.length) out.availableEquipment = valid;
  }

  const diet = answers.diet;
  if (typeof diet === "string" && diet.trim()) out.dietType = diet.trim().slice(0, 40);

  const notes = answers.notes;
  if (typeof notes === "string" && notes.trim()) out.medicalNotes = notes.trim().slice(0, 2000);

  return out;
}
