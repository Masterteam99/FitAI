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
  minAngle: number;
  maxAngle: number;
  triggers: PhaseTriggerData[];
}

export interface PhaseTriggerData {
  condition: TriggerCondition;
  severity: Severity;
  feedback: string;
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
                severity: "CRITICAL",
                feedback: "Discesa eccessiva sotto il parallelo. Rischio di stress capsulare sul ginocchio. Ferma la discesa al parallelo.",
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
                feedback: "Lockout incompleto. Estendi completamente le gambe tra una ripetizione e l'altra.",
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
          {
            phase: "BOTTOM",
            minAngle: 70,
            maxAngle: 110,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Profondità insufficiente sul lato destro. Lavora sulla mobilità dell'anca e della caviglia per scendere più in basso.",
                injuryRisk: false,
              },
              {
                condition: "BELOW_MIN",
                severity: "CRITICAL",
                feedback: "Ginocchio destro eccessivamente flesso oltre il range sicuro. Riduci la profondità della discesa.",
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
                feedback: "Lockout incompleto sulla gamba destra. Stendi completamente il ginocchio prima di iniziare la ripetizione successiva.",
                injuryRisk: false,
              },
            ],
          },
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
                severity: "CRITICAL",
                feedback: "Tronco troppo inclinato in avanti. Rischio lombare sotto carico. Mantieni il petto alto e attiva il core.",
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

  "stacco-da-terra": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 50,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "CRITICAL",
                feedback: "Schiena arrotondata durante lo stacco. Rischio di ernia discale. Mantieni il petto alto e attiva i dorsali per fissare la colonna.",
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
            minAngle: 75,
            maxAngle: 115,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Posizione di partenza troppo bassa: stai caricando la schiena come uno squat. Alza il bacino per creare tensione sugli ischiocrurali.",
                injuryRisk: true,
              },
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Posizione di partenza troppo alta: l'anca parte già quasi estesa. Abbassa il bacino per attivare le gambe nella spinta.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "TOP",
            minAngle: 165,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Lockout incompleto: l'anca non si estende completamente in cima. Spingi i fianchi in avanti e contrai i glutei.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 80,
            maxAngle: 130,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Ginocchia troppo flesse nella partenza: stai eseguendo uno squat, non uno stacco. Raddrizza le gambe e porta le ginocchia leggermente indietro.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "right_hip",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 75,
            maxAngle: 115,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Asimmetria del bacino nella partenza: lato destro troppo basso. Livella i fianchi prima di staccare il bilanciere.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
    ],
  },

  "panca-piana": {
    movements: [
      {
        joint: "left_elbow",
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
                feedback: "Discesa troppo corta: il bilanciere non arriva al petto. Abbassa fino al contatto con lo sterno.",
                injuryRisk: false,
              },
              {
                condition: "BELOW_MIN",
                severity: "CRITICAL",
                feedback: "Gomito oltre il range di sicurezza nella discesa. Rischio di stress sulla cuffia dei rotatori. Ferma la discesa al petto.",
                injuryRisk: true,
              },
            ],
          },
          {
            phase: "TOP",
            minAngle: 160,
            maxAngle: 175,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Lockout incompleto in cima. Estendi i gomiti senza iperestenderli per completare la ripetizione.",
                injuryRisk: false,
              },
              {
                condition: "ABOVE_MAX",
                severity: "CRITICAL",
                feedback: "Gomiti iperestesi in chiusura: rischio articolare. Mantieni una leggera flessione residua nei gomiti al lockout.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "right_elbow",
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
                feedback: "Gomito destro non raggiunge la profondità corretta. Abbassa il bilanciere simmetricamente fino al petto.",
                injuryRisk: false,
              },
              {
                condition: "BELOW_MIN",
                severity: "CRITICAL",
                feedback: "Gomito destro troppo aperto: pressione anomala sulla capsula articolare. Riduci la discesa.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "left_shoulder",
        movementType: "abduzione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 40,
            maxAngle: 75,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "CRITICAL",
                feedback: "Gomiti troppo aperti a 90°. Stress eccessivo sulla spalla. Porta i gomiti a 45-75° rispetto al busto.",
                injuryRisk: true,
              },
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Gomiti troppo stretti al busto: attiveresti più i tricipiti che il petto. Allarga leggermente i gomiti.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "trazioni": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 30,
            maxAngle: 70,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Non stai salendo abbastanza: il mento non supera la sbarra. Aumenta la trazione con le braccia e contrai i dorsali.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 155,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Discesa incompleta: le braccia non si estendono del tutto. Scendi fino al completo allungamento per ogni ripetizione.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "right_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 30,
            maxAngle: 70,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Il lato destro non arriva in cima. Verifica l'asimmetria nella forza di trazione: lavora sull'equilibrio dorsale.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 20,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Tronco troppo inclinato all'indietro durante la trazione. Mantieni il corpo quasi verticale e tira con i gomiti verso i fianchi.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "left_shoulder",
        movementType: "abduzione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 60,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Spalle che salgono verso le orecchie durante la trazione. Deprimì attivamente le scapole prima di tirare.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "military-press": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 80,
            maxAngle: 100,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Posizione di partenza troppo alta: il bilanciere non è all'altezza delle orecchie. Abbassa il bilanciere alla clavicola.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "TOP",
            minAngle: 160,
            maxAngle: 178,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Lockout incompleto sopra la testa. Estendi completamente le braccia in cima senza iperestendere i gomiti.",
                injuryRisk: false,
              },
              {
                condition: "ABOVE_MAX",
                severity: "CRITICAL",
                feedback: "Gomiti iperestesi al lockout aereo: rischio tendineo. Mantieni minima flessione residua a braccia tese.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "right_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 80,
            maxAngle: 100,
            triggers: [
              {
                condition: "OUT_OF_RANGE",
                severity: "WARNING",
                feedback: "Asimmetria nella posizione di partenza: il gomito destro non è allineato con il sinistro. Correggi la presa.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 10,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "CRITICAL",
                feedback: "Iperlordosi lombare durante la spinta: rischio discale sotto carico aereo. Attiva l'addome e non estendere la schiena.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "left_shoulder",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 160,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "La spalla sinistra non completa la flessione sopra la testa. Lavora sulla mobilità toracica e della cuffia.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "affondi": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 80,
            maxAngle: 110,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Affondo troppo corto: il ginocchio anteriore non raggiunge i 90°. Aumenta il passo e scendi più in basso.",
                injuryRisk: false,
              },
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Affondo eccessivo: il ginocchio anteriore oltre la sicurezza. Ferma la discesa al parallelo con il pavimento.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "right_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 80,
            maxAngle: 110,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Affondo troppo corto sul lato destro. Porta il ginocchio posteriore quasi a terra nella discesa.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Busto inclinato in avanti nell'affondo. Mantieni il tronco verticale e le spalle sopra i fianchi.",
                injuryRisk: false,
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
            minAngle: 85,
            maxAngle: 115,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Passo troppo corto: l'anca non si abbassa abbastanza. Aumenta la lunghezza del passo per un affondo completo.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "rematore-bilanciere": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 30,
            maxAngle: 60,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Busto troppo verticale: stai eseguendo quasi uno shrug. Inclina il tronco a 45° con i fianchi spinti indietro.",
                injuryRisk: false,
              },
              {
                condition: "ABOVE_MAX",
                severity: "CRITICAL",
                feedback: "Schiena quasi orizzontale con carico: stress discale elevato. Raddrizza il busto a 45° e attiva il core.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 50,
            maxAngle: 80,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Il bilanciere non sale abbastanza: non stai completando la trazione. Porta i gomiti oltre il piano della schiena.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 155,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Le braccia non si allungano completamente nella fase di discesa. Estendi i gomiti per allungare completamente i dorsali.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "left_shoulder",
        movementType: "abduzione",
        phases: [
          {
            phase: "TOP",
            minAngle: 0,
            maxAngle: 30,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Gomiti troppo aperti: stai attivando il deltoide posteriore invece dei dorsali. Porta i gomiti vicini al corpo.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "curl-bicipiti": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 30,
            maxAngle: 60,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Il gomito non sale abbastanza in cima: la contrazione del bicipite è incompleta. Porta il bilanciere verso le spalle.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 160,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Discesa parziale: il bicipite non si allunga completamente. Estendi le braccia fino al quasi-lockout nella fase bassa.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "right_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 30,
            maxAngle: 60,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Contrazione incompleta sul gomito destro. Porta il manubrio destro fino alle spalle senza oscillare il busto.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Stai usando il busto per sollevare il peso. Riduci il carico e tieni la schiena verticale per isolare il bicipite.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "push-up": {
    movements: [
      {
        joint: "left_elbow",
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
                feedback: "Push-up troppo corto: il petto non sfiora il pavimento. Abbassa il corpo finché il petto quasi tocca terra.",
                injuryRisk: false,
              },
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Scendi troppo in basso rispetto alle spalle. Ferma la discesa quando il gomito raggiunge i 90° o appena sotto.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "TOP",
            minAngle: 155,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Lockout incompleto in cima. Estendi completamente le braccia alla fine di ogni ripetizione.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Fianchi che cadono verso il basso o si alzano verso l'alto. Mantieni il corpo come una tavola rigida dal tallone alla testa.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "left_shoulder",
        movementType: "abduzione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 30,
            maxAngle: 65,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Gomiti troppo aperti a 90°: carico eccessivo sulla cuffia. Porta i gomiti a 45° rispetto al busto.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
    ],
  },

  "plank": {
    movements: [
      {
        joint: "spine",
        movementType: "neutrale",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Fianchi che scendono o si alzano: il corpo perde l'allineamento. Attiva l'addome e i glutei per mantenere la posizione orizzontale.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "left_hip",
        movementType: "neutrale",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 165,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "L'anca si flette durante il plank: il bacino scende. Spingi i talloni indietro e tieni i fianchi sollevati.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "romanian-deadlift": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 45,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "CRITICAL",
                feedback: "Schiena arrotondata nella discesa del rumeno: rischio di lesione lombare. Mantieni la curva lombare naturale e il petto alto.",
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
            minAngle: 50,
            maxAngle: 90,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Range di movimento corto: gli ischiocrurali non si allungano abbastanza. Scendi più in basso mantenendo la schiena neutra.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "TOP",
            minAngle: 165,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Estensione dell'anca incompleta in cima. Spingi i fianchi in avanti e contrai i glutei al lockout.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 145,
            maxAngle: 175,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Ginocchia troppo piegate: stai eseguendo un mezzo stacco, non un rumeno. Mantieni le gambe quasi tese durante tutto il movimento.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "lateral-raise": {
    movements: [
      {
        joint: "left_shoulder",
        movementType: "abduzione",
        phases: [
          {
            phase: "TOP",
            minAngle: 80,
            maxAngle: 110,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Alzata troppo bassa: il braccio non raggiunge la parallela. Solleva il manubrio fino all'altezza della spalla.",
                injuryRisk: false,
              },
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Braccio alzato oltre la parallela: attivi i trapezi. Ferma il movimento quando il braccio è parallelo al pavimento.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Manubrio non torna alla posizione di partenza: perdi il range completo di movimento. Abbassa il braccio fino ai fianchi.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "right_shoulder",
        movementType: "abduzione",
        phases: [
          {
            phase: "TOP",
            minAngle: 80,
            maxAngle: 110,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Il braccio destro non raggiunge la parallela. Porta il manubrio all'altezza della spalla con movimento controllato.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 10,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Stai oscillando il busto per sollevare il peso. Riduci il carico e mantieni il tronco verticale.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "tricipiti-cavi": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "estensione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 160,
            maxAngle: 178,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Estensione incompleta del tricipite: il gomito non si raddrizza. Porta la corda fino in fondo a ogni ripetizione.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "TOP",
            minAngle: 60,
            maxAngle: 90,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Gomito troppo aperto nella fase alta: perdi tensione sul tricipite. Mantieni il gomito a circa 90° nella posizione alta.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "right_elbow",
        movementType: "estensione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 160,
            maxAngle: 178,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Estensione incompleta sul lato destro. Porta il manico giù simmetricamente fino al lockout del gomito.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Busto che si inclina in avanti durante il push-down. Rimani verticale e tieni i gomiti fissi ai fianchi.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "hip-thrust": {
    movements: [
      {
        joint: "left_hip",
        movementType: "estensione",
        phases: [
          {
            phase: "TOP",
            minAngle: 170,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Estensione dell'anca incompleta in cima. Spingi i fianchi verso il soffitto e contrai i glutei al massimo.",
                injuryRisk: false,
              },
              {
                condition: "ABOVE_MAX",
                severity: "CRITICAL",
                feedback: "Iperestensione del bacino: il rachide lombare si inarca eccessivamente. Ferma il movimento prima di superare la linea neutra.",
                injuryRisk: true,
              },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 90,
            maxAngle: 130,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Discesa eccessiva: il bacino tocca terra. Mantieni una leggera tensione nei glutei anche nella fase bassa.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "neutrale",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Il bacino ruota eccessivamente: compensazione che riduce l'attivazione del gluteo. Mantieni il core attivo e la pelvi in posizione neutra.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 80,
            maxAngle: 100,
            triggers: [
              {
                condition: "OUT_OF_RANGE",
                severity: "WARNING",
                feedback: "Angolo del ginocchio sbagliato al lockout: il piede è posizionato in modo errato. Regola la distanza dal banco finché il ginocchio è a 90° in cima.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "crunch": {
    movements: [
      {
        joint: "spine",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 30,
            maxAngle: 80,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Flessione troppo ridotta: il crunch è parziale. Contrai l'addome e porta le spalle a staccarsi completamente dal pavimento.",
                injuryRisk: false,
              },
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Ci alzi troppo in su: non è più un crunch ma un sit-up. Ferma il movimento dove senti la massima contrazione addominale.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 0,
            maxAngle: 10,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Non torni abbastanza alla posizione di partenza. Abbassa le spalle quasi a terra tra una ripetizione e l'altra.",
                injuryRisk: false,
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
            phase: "THROUGHOUT",
            minAngle: 80,
            maxAngle: 100,
            triggers: [
              {
                condition: "OUT_OF_RANGE",
                severity: "WARNING",
                feedback: "Le ginocchia non sono a 90°: la posizione di partenza non è corretta. Sistema le gambe prima di iniziare.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "goblet-squat": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 70,
            maxAngle: 115,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Profondità insufficiente nel goblet squat. Scendi più in basso: il peso frontale ti aiuta a bilanciare. Porta la coscia sotto la parallela.",
                injuryRisk: false,
              },
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Discesa oltre il range sicuro nel goblet squat. Mantieni il controllo e fermati al parallelo o poco sotto.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 25,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Busto troppo inclinato in avanti nel goblet squat. Il peso frontale deve aiutarti a stare eretto: sollevalo al petto.",
                injuryRisk: false,
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
            maxAngle: 105,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Anca troppo poco flessa: stai facendo uno squat alto. Lascia che il kettlebell ti aiuti a sederti più in basso.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "bulgarian-split-squat": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 80,
            maxAngle: 110,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Profondità insufficiente: il ginocchio anteriore non raggiunge i 90°. Abbassa il bacino fino al parallelo della coscia con il pavimento.",
                injuryRisk: false,
              },
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Discesa eccessiva sulla gamba anteriore. Controlla la discesa e fermati quando la coscia è parallela.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "right_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 80,
            maxAngle: 105,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Ginocchio posteriore che tocca il pavimento con troppa forza. Controlla la discesa nella fase eccentrica.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 20,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Busto inclinato in avanti nel bulgaro. Rimani verticale: il peso del busto non deve spostarsi in avanti.",
                injuryRisk: false,
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
            minAngle: 85,
            maxAngle: 120,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Passo anteriore troppo corto: l'anca non scende abbastanza. Porta il piede anteriore più avanti per permettere una discesa completa.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "plank-laterale": {
    movements: [
      {
        joint: "spine",
        movementType: "neutrale",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Il fianco cede verso il basso durante il plank laterale. Attiva l'obliquo e spingi il bacino verso l'alto per allineare il corpo.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "left_hip",
        movementType: "abduzione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 160,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Il bacino non è allineato con le spalle e le caviglie. Solleva i fianchi per creare una linea retta dal capo ai piedi.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "face-pull": {
    movements: [
      {
        joint: "left_shoulder",
        movementType: "abduzione",
        phases: [
          {
            phase: "TOP",
            minAngle: 80,
            maxAngle: 110,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Le braccia non si aprono abbastanza nel face pull. Porta i polsi all'altezza delle orecchie per attivare completamente il deltoide posteriore.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "right_shoulder",
        movementType: "abduzione",
        phases: [
          {
            phase: "TOP",
            minAngle: 80,
            maxAngle: 110,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "ERROR",
                feedback: "Il braccio destro non si apre abbastanza. Porta entrambi i polsi all'altezza delle orecchie in modo simmetrico.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 70,
            maxAngle: 100,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "I gomiti si aprono troppo nella fase di trazione. Mantieni i gomiti all'altezza delle spalle durante il pull.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 10,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "WARNING",
                feedback: "Stai inclinando il busto all'indietro per tirare il cavo. Rimani verticale e lavora solo con le braccia e le spalle.",
                injuryRisk: false,
              },
            ],
          },
        ],
      },
    ],
  },

  "leg-press": {
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
                feedback: "Profondità insufficiente al leg press. Piega le ginocchia almeno a 90° per attivare completamente quadricipiti e glutei.",
                injuryRisk: false,
              },
              {
                condition: "BELOW_MIN",
                severity: "CRITICAL",
                feedback: "Ginocchio piegato oltre il range sicuro al leg press. Rischio di stress sulla rotula. Regola il fermo della macchina per limitare la discesa.",
                injuryRisk: true,
              },
            ],
          },
          {
            phase: "TOP",
            minAngle: 155,
            maxAngle: 175,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Lockout incompleto al leg press: le ginocchia rimangono piegate. Estendi le gambe quasi completamente tra ogni ripetizione.",
                injuryRisk: false,
              },
              {
                condition: "ABOVE_MAX",
                severity: "CRITICAL",
                feedback: "Ginocchia iperestese al lockout del leg press: rischio articolare. Non bloccare completamente le ginocchia: mantieni una lieve flessione.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
      {
        joint: "right_knee",
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
                feedback: "Gamba destra non scende abbastanza al leg press. Controlla che il piede destro sia posizionato simmetricamente sulla piattaforma.",
                injuryRisk: false,
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
            minAngle: 70,
            maxAngle: 110,
            triggers: [
              {
                condition: "BELOW_MIN",
                severity: "CRITICAL",
                feedback: "Il bacino si stacca dalla seduta nella discesa: il rachide lombare si flette sotto carico. Riduci il range di movimento.",
                injuryRisk: true,
              },
            ],
          },
        ],
      },
    ],
  },

};
