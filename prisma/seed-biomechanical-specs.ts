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
            // Valutato solo nella fase bassa: al lockout il braccio è perpendicolare
            // al busto (~90°) per geometria, non per errore di flare.
            phase: "BOTTOM",
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
      // RIMOSSO il controllo spalla 0-60°: a braccia overhead l'angolo
      // gomito-spalla-anca è sempre >120° e il trigger scattava su ogni frame.
      // L'elevazione delle scapole non è misurabile con i keypoint 2D attuali.
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
        // In posizione di push-up il busto è quasi orizzontale: l'inclinazione
        // della colonna rispetto alla verticale non è utilizzabile. La linea del
        // corpo (fianchi che cadono o si alzano) si misura con l'angolo dell'anca.
        joint: "left_hip",
        movementType: "neutrale",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 160,
            maxAngle: 180,
            triggers: [
              {
                condition: "BELOW_MIN",
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
            // Solo in fase bassa: in alto il braccio è perpendicolare al busto per geometria.
            phase: "BOTTOM",
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
      // RIMOSSO il controllo spine 0-15°: in plank il busto è orizzontale e
      // l'inclinazione rispetto alla verticale è ~80-90° su ogni frame → il
      // trigger scattava sempre. La linea del corpo è già misurata dall'anca.
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
                severity: "ERROR",
                feedback: "Il corpo perde l'allineamento: il bacino scende o si alza. Attiva addome e glutei e spingi i talloni indietro.",
                injuryRisk: true,
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
              // RIMOSSO il trigger ABOVE_MAX (>180°): l'angolo 2D è limitato a 180°,
              // l'iperestensione lombare non è distinguibile con questa misura.
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
      // RIMOSSO il controllo spine 0-15°: con le spalle sulla panca la linea
      // spalla-anca varia per geometria tra ~50° e ~90° durante il movimento,
      // il trigger scattava su ogni frame.
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
        // Sdraiato supino l'inclinazione spalla-anca parte da ~90° (orizzontale)
        // e DIMINUISCE alzando le spalle. TOP (contratto, con invert) = angolo
        // minimo; BOTTOM (disteso) = angolo massimo. Range corretti di conseguenza.
        joint: "spine",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 45,
            maxAngle: 78,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Flessione troppo ridotta: il crunch è parziale. Contrai l'addome e porta le spalle a staccarsi completamente dal pavimento.",
                injuryRisk: false,
              },
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Ti alzi troppo in su: non è più un crunch ma un sit-up. Ferma il movimento dove senti la massima contrazione addominale.",
                injuryRisk: false,
              },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 82,
            maxAngle: 95,
            triggers: [
              {
                condition: "BELOW_MIN",
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
      // RIMOSSO il controllo spine 0-15°: corpo orizzontale → inclinazione ~80-90°
      // su ogni frame, trigger sempre attivo. La linea del corpo è misurata dall'anca.
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
                severity: "ERROR",
                feedback: "Il fianco cede verso il basso: bacino non allineato con spalle e caviglie. Attiva l'obliquo e solleva i fianchi per creare una linea retta.",
                injuryRisk: true,
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

  // ─── Nuovi esercizi (Track B1) ──────────────────────────────────────────────

  "front-squat": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 65,
            maxAngle: 105,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Profondità insufficiente nel front squat: scendi finché la coscia è sotto il parallelo.", injuryRisk: false },
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Discesa eccessiva sotto carico frontale: stress capsulare sul ginocchio. Ferma la discesa al parallelo.", injuryRisk: true },
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
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Busto che collassa in avanti nel front squat: rischio lombare e perdita del bilanciere. Tieni i gomiti alti e il petto eretto.", injuryRisk: true },
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
            minAngle: 55,
            maxAngle: 100,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "L'anca si flette poco: spingi i glutei indietro e in basso per uno squat completo.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "overhead-squat": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 65,
            maxAngle: 105,
            triggers: [
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Discesa eccessiva con carico sopra la testa: instabilità e rischio articolare. Controlla la profondità.", injuryRisk: true },
            ],
          },
        ],
      },
      {
        joint: "left_shoulder",
        movementType: "flessione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 160,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Le braccia cadono in avanti: la spalla non mantiene la flessione overhead. Rischio per cuffia e colonna. Lavora sulla mobilità prima di caricare.", injuryRisk: true },
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
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Tronco troppo inclinato in avanti con carico aereo: stress lombare elevato. Mantieni il busto verticale.", injuryRisk: true },
            ],
          },
        ],
      },
    ],
  },

  "pistol-squat": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 30,
            maxAngle: 70,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Pistol squat parziale: non raggiungi la massima flessione. Scendi in modo controllato fino in fondo.", injuryRisk: false },
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Affondamento incontrollato in fondo: rischio per il ginocchio. Controlla la fase eccentrica.", injuryRisk: true },
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
            maxAngle: 45,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Eccessiva inclinazione del busto per bilanciarti. Lavora sulla mobilità della caviglia per restare più eretto.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "leg-extension": {
    movements: [
      {
        joint: "left_knee",
        movementType: "estensione",
        phases: [
          {
            phase: "TOP",
            minAngle: 160,
            maxAngle: 178,
            triggers: [
              { condition: "BELOW_MIN", severity: "ERROR", feedback: "Estensione incompleta del ginocchio: contrai completamente il quadricipite in cima.", injuryRisk: false },
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Iperestensione del ginocchio al lockout: stress sulla rotula. Non bloccare con strappo.", injuryRisk: true },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 80,
            maxAngle: 100,
            triggers: [
              { condition: "OUT_OF_RANGE", severity: "WARNING", feedback: "Angolo di partenza errato: regola il sedile in modo che il ginocchio parta a circa 90°.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "leg-curl": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 30,
            maxAngle: 60,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Flessione incompleta: porta il tallone più vicino al gluteo per contrarre del tutto gli ischiocrurali.", injuryRisk: false },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 155,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Non allunghi completamente i femorali: estendi la gamba in modo controllato.", injuryRisk: false },
            ],
          },
        ],
      },
      // RIMOSSO il controllo spine 0-15°: da prono sulla macchina la linea
      // spalla-anca è ~80-90° dalla verticale su ogni frame, il trigger
      // scattava sempre. Il sollevamento del bacino non è misurabile in 2D
      // con la baseline attuale.
    ],
  },

  "calf-raise": {
    movements: [
      {
        joint: "left_knee",
        movementType: "estensione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 160,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Le ginocchia si piegano: trasferisci il lavoro dai polpacci ai quadricipiti. Mantieni le gambe tese.", injuryRisk: false },
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
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Oscillazione del busto per slanciare il peso. Mantieni il corpo verticale e il movimento solo alla caviglia.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "incline-bench-press": {
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
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Discesa corta: porta il bilanciere fino alla parte alta del petto.", injuryRisk: false },
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Gomito oltre il range sicuro nella discesa su panca inclinata: stress sulla cuffia. Ferma la discesa al petto.", injuryRisk: true },
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
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Gomito destro troppo aperto: pressione anomala sulla capsula. Riduci la discesa.", injuryRisk: true },
            ],
          },
        ],
      },
      {
        joint: "left_shoulder",
        movementType: "abduzione",
        phases: [
          {
            // Solo in fase bassa: al lockout il braccio è ~90° dal busto per geometria.
            phase: "BOTTOM",
            minAngle: 40,
            maxAngle: 75,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Gomiti a 90° rispetto al busto: stress eccessivo sulla spalla. Porta i gomiti a 45-75°.", injuryRisk: true },
            ],
          },
        ],
      },
    ],
  },

  "dumbbell-bench-press": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 65,
            maxAngle: 105,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Range corto: scendi finché i manubri sono all'altezza del petto.", injuryRisk: false },
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Discesa eccessiva con i manubri: iperallungamento della spalla. Limita la profondità a livello del petto.", injuryRisk: true },
            ],
          },
        ],
      },
      {
        joint: "left_shoulder",
        movementType: "abduzione",
        phases: [
          {
            // Solo in fase bassa: al lockout il braccio è ~90° dal busto per geometria.
            phase: "BOTTOM",
            minAngle: 40,
            maxAngle: 75,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Gomiti troppo aperti: stress sulla cuffia dei rotatori. Mantieni i gomiti a 45-75° dal busto.", injuryRisk: true },
            ],
          },
        ],
      },
    ],
  },

  "chest-fly": {
    movements: [
      {
        // Da supino il braccio chiuso sopra il petto è ~90° dal busto; l'apertura
        // sotto il piano della panca porta l'angolo oltre ~105°. Un solo controllo
        // di sicurezza THROUGHOUT: la "chiusura completa" (~90° anch'essa) non è
        // distinguibile in 2D ed è stata rimossa.
        joint: "left_shoulder",
        movementType: "adduzione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 105,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Apertura eccessiva delle braccia: iperestensione della spalla sotto carico. Limita l'apertura quando senti tensione al petto.", injuryRisk: true },
            ],
          },
        ],
      },
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 140,
            maxAngle: 170,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Gomiti troppo piegati: stai facendo una distensione, non croci. Mantieni una leggera flessione fissa.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "dips": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 70,
            maxAngle: 100,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Discesa parziale: scendi finché la spalla è all'altezza del gomito.", injuryRisk: false },
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Discesa eccessiva: spalla che scende troppo sotto il gomito. Rischio per la capsula gleno-omerale. Ferma la discesa a 90°.", injuryRisk: true },
            ],
          },
          {
            phase: "TOP",
            minAngle: 160,
            maxAngle: 178,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Lockout incompleto: estendi le braccia in cima senza bloccare con strappo.", injuryRisk: false },
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
            maxAngle: 30,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Forte inclinazione del busto sposta il lavoro sul petto: scegli intenzionalmente l'inclinazione in base al target (petto vs tricipiti).", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "lat-pulldown": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 40,
            maxAngle: 70,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Trazione incompleta: porta la barra fino alla parte alta del petto.", injuryRisk: false },
            ],
          },
          {
            phase: "TOP",
            minAngle: 150,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Non allunghi del tutto i dorsali: estendi le braccia in alto controllando il ritorno.", injuryRisk: false },
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
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Eccessiva oscillazione all'indietro per tirare la barra. Limita l'inclinazione del busto e usa i dorsali.", injuryRisk: false },
            ],
          },
        ],
      },
      // RIMOSSO il controllo spalla TOP 0-40°: a braccia overhead l'angolo
      // gomito-spalla-anca è ~160-180° per geometria e il trigger scattava
      // su ogni frame. L'elevazione scapolare non è misurabile in 2D.
    ],
  },

  "seated-cable-row": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 50,
            maxAngle: 80,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Tirata incompleta: porta i gomiti oltre il busto e stringi le scapole.", injuryRisk: false },
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
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Ti sdrai all'indietro per tirare il cavo: usi la schiena come leva. Mantieni il busto quasi verticale.", injuryRisk: true },
              // RIMOSSO il trigger BELOW_MIN: con minAngle 0 non può scattare
              // (l'inclinazione misurata non è mai negativa) e l'arrotondamento
              // in avanti non è distinguibile dall'inclinazione 2D.
            ],
          },
        ],
      },
    ],
  },

  "dumbbell-row": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 25,
            maxAngle: 55,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Busto troppo verticale: inclina di più per coinvolgere i dorsali.", injuryRisk: false },
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Il busto crolla verso l'orizzontale: probabile perdita di neutralità della colonna. Mantieni l'inclinazione costante appoggiandoti alla panca.", injuryRisk: true },
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
            maxAngle: 85,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Il manubrio non sale abbastanza: tira il gomito verso l'alto oltre la linea del busto.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "arnold-press": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 160,
            maxAngle: 178,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Lockout incompleto: estendi le braccia sopra la testa senza iperestendere i gomiti.", injuryRisk: false },
            ],
          },
        ],
      },
      // RIMOSSO il controllo "rotazione" spalla 0-90°: la rotazione interna/esterna
      // non è misurabile con i keypoint 2D (l'angolo gomito-spalla-anca misura solo
      // l'elevazione del braccio e supera 90° in ogni spinta overhead).
      {
        joint: "spine",
        movementType: "iperestensione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 12,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Iperlordosi lombare durante la spinta sopra la testa: rischio discale. Attiva l'addome e non inarcare la schiena.", injuryRisk: true },
            ],
          },
        ],
      },
    ],
  },

  "front-raise": {
    movements: [
      {
        joint: "left_shoulder",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 80,
            maxAngle: 100,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Alzi il braccio oltre la parallela: coinvolgi i trapezi. Ferma all'altezza della spalla.", injuryRisk: false },
              { condition: "BELOW_MIN", severity: "ERROR", feedback: "Alzata troppo bassa: porta il manubrio fino all'altezza della spalla.", injuryRisk: false },
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
            maxAngle: 12,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Oscillazione del busto per slanciare: riduci il carico e mantieni il tronco fermo.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "hammer-curl": {
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
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Contrazione incompleta: porta il manubrio fino alla spalla mantenendo la presa neutra.", injuryRisk: false },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 160,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Discesa parziale: estendi il braccio fino al quasi-lockout per allungare il brachiale.", injuryRisk: false },
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
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Stai usando il busto per slanciare: tieni la schiena verticale e i gomiti fissi.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "skull-crusher": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "estensione",
        phases: [
          {
            phase: "TOP",
            minAngle: 155,
            maxAngle: 175,
            triggers: [
              { condition: "BELOW_MIN", severity: "ERROR", feedback: "Estensione incompleta del tricipite: stendi del tutto il gomito senza spostarlo.", injuryRisk: false },
            ],
          },
          {
            phase: "BOTTOM",
            minAngle: 40,
            maxAngle: 70,
            triggers: [
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Discesa eccessiva del bilanciere verso la fronte con gomiti chiusi: rischio per il gomito. Controlla l'ampiezza e mantieni i gomiti stabili.", injuryRisk: true },
            ],
          },
        ],
      },
      {
        joint: "left_shoulder",
        movementType: "flessione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 75,
            maxAngle: 100,
            triggers: [
              { condition: "OUT_OF_RANGE", severity: "WARNING", feedback: "Le braccia si spostano avanti/indietro: mantieni le braccia perpendicolari al pavimento per isolare i tricipiti.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "russian-twist": {
    movements: [
      {
        // La rotazione del busto NON è misurabile in 2D: questo controllo verifica
        // la POSIZIONE del busto (reclinato ~20-50° indietro), che è il prerequisito
        // di sicurezza dell'esercizio. Feedback riscritti di conseguenza.
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 20,
            maxAngle: 50,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Busto troppo verticale: reclina il tronco a circa 45° per attivare gli obliqui.", injuryRisk: false },
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Busto troppo reclinato all'indietro: la zona lombare va sotto stress. Risali verso i 45° e ruota in modo controllato dal torace.", injuryRisk: true },
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
            maxAngle: 120,
            triggers: [
              { condition: "OUT_OF_RANGE", severity: "WARNING", feedback: "Le gambe oscillano per slancio: tienile ferme e stabili per isolare il core.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "mountain-climber": {
    movements: [
      {
        joint: "left_hip",
        movementType: "flessione",
        phases: [
          {
            phase: "TOP",
            minAngle: 60,
            maxAngle: 100,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Il ginocchio non sale abbastanza verso il petto: aumenta la flessione dell'anca a ogni ripetizione.", injuryRisk: false },
            ],
          },
        ],
      },
      {
        // In posizione di plank alto la linea spalla-anca è ~60-85° dalla verticale:
        // range ricalibrato sulla posizione reale (OUT_OF_RANGE = bacino che sale
        // verso la verticale o che crolla oltre l'orizzontale).
        joint: "spine",
        movementType: "neutrale",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 50,
            maxAngle: 95,
            triggers: [
              { condition: "OUT_OF_RANGE", severity: "ERROR", feedback: "I fianchi salgono o crollano: perdi l'allineamento del plank. Mantieni il bacino stabile e il core attivo.", injuryRisk: true },
            ],
          },
        ],
      },
    ],
  },

  "burpee": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 60,
            maxAngle: 110,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Affondamento incontrollato nello squat del burpee: controlla la discesa per proteggere le ginocchia.", injuryRisk: true },
            ],
          },
        ],
      },
      // RIMOSSO il controllo spine 0-35°: il burpee alterna posizione eretta
      // (~0-20°) e plank (~60-90°), nessun range fisso di inclinazione è valido
      // per tutto il movimento — il trigger scattava in ogni fase di plank.
      {
        joint: "left_elbow",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 70,
            maxAngle: 120,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Crolli a terra nella fase di push-up: controlla la discesa invece di lasciarti cadere.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "jump-squat": {
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
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Atterraggio con ginocchio eccessivamente flesso e rigido: forte impatto articolare. Ammortizza l'atterraggio e controlla la profondità.", injuryRisk: true },
            ],
          },
          {
            phase: "TOP",
            minAngle: 165,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Estensione incompleta nel salto: spingi con forza fino alla completa estensione di anche e ginocchia.", injuryRisk: false },
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
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Busto che collassa in avanti all'atterraggio: rischio lombare sotto impatto. Mantieni il petto alto.", injuryRisk: true },
            ],
          },
        ],
      },
    ],
  },

  "box-jump": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 65,
            maxAngle: 110,
            triggers: [
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Atterraggio rigido sul box con ginocchio molto flesso: rischio articolare e di valgismo. Atterra morbido con le ginocchia allineate alle punte.", injuryRisk: true },
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
            maxAngle: 40,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Eccessiva inclinazione del busto al decollo o all'atterraggio: cerca un atterraggio controllato e composto.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "kettlebell-swing": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 30,
            maxAngle: 65,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Busto oltre il range della cerniera: probabile schiena arrotondata sotto slancio, rischio lombare elevato. Mantieni la colonna neutra e fai cerniera dall'anca.", injuryRisk: true },
            ],
          },
          {
            // L'iperestensione lombare in cima si manifesta come busto che si
            // reclina oltre la verticale (>15° di inclinazione a swing chiuso).
            // Spostata qui dal trigger ABOVE_MAX >180° dell'anca, irraggiungibile in 2D.
            phase: "TOP",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Iperestensione lombare alla fine dello swing: non inarcare la schiena, ferma l'estensione in posizione neutra.", injuryRisk: true },
            ],
          },
        ],
      },
      {
        joint: "left_hip",
        movementType: "estensione",
        phases: [
          {
            phase: "TOP",
            minAngle: 165,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "ERROR", feedback: "Estensione dell'anca incompleta in cima: lo swing è guidato dall'anca, non dalle braccia. Spingi i fianchi avanti e contrai i glutei.", injuryRisk: false },
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
            minAngle: 130,
            maxAngle: 165,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Ginocchia troppo piegate: stai facendo uno squat, non uno swing. La cerniera è all'anca con ginocchia poco flesse.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "kettlebell-goblet-squat": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 65,
            maxAngle: 110,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Profondità insufficiente: usa il kettlebell come contrappeso per scendere sotto il parallelo.", injuryRisk: false },
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Discesa oltre il range controllato: fermati al parallelo o poco sotto.", injuryRisk: true },
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
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Busto troppo inclinato: tieni il kettlebell al petto e resta eretto.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "glute-bridge": {
    movements: [
      {
        joint: "left_hip",
        movementType: "estensione",
        phases: [
          {
            phase: "TOP",
            minAngle: 165,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "ERROR", feedback: "Estensione dell'anca incompleta: spingi i fianchi in alto contraendo i glutei.", injuryRisk: false },
              // RIMOSSO il trigger ABOVE_MAX (>180°): l'angolo 2D è limitato a 180°,
              // l'iperestensione lombare non è misurabile qui.
            ],
          },
        ],
      },
      // RIMOSSO il controllo spine 0-15°: da supino la linea spalla-anca è
      // ~60-90° dalla verticale su ogni frame, il trigger scattava sempre.
    ],
  },

  "good-morning": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            // Nel good morning il busto a fine cerniera è normalmente a 50-80°
            // dalla verticale: il vecchio max 45° segnalava come CRITICAL anche
            // le ripetizioni corrette. Oltre 80° = busto oltre il parallelo.
            phase: "BOTTOM",
            minAngle: 30,
            maxAngle: 80,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Busto oltre il parallelo con bilanciere sulle spalle: rischio lombare molto elevato. Mantieni la colonna neutra e fermati prima dell'orizzontale.", injuryRisk: true },
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
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Cerniera dell'anca insufficiente: spingi i glutei indietro per allungare gli ischiocrurali.", injuryRisk: false },
            ],
          },
          {
            phase: "TOP",
            minAngle: 165,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "ERROR", feedback: "Estensione dell'anca incompleta in cima: porta i fianchi avanti contraendo i glutei.", injuryRisk: false },
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
            minAngle: 150,
            maxAngle: 175,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Ginocchia troppo piegate: mantieni le gambe quasi tese per caricare gli ischiocrurali.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "step-up": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 75,
            maxAngle: 110,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Rialzo troppo basso: scegli un'altezza che porti il ginocchio vicino a 90° per un lavoro completo.", injuryRisk: false },
            ],
          },
          {
            phase: "TOP",
            minAngle: 160,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Estensione incompleta in cima: raddrizza completamente la gamba di appoggio.", injuryRisk: false },
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
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Eccessiva inclinazione in avanti per spingerti su: mantieni il busto eretto e spingi dal tallone.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "wall-sit": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "ISOMETRIC",
            minAngle: 80,
            maxAngle: 100,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Non scendi a 90°: abbassati finché le cosce sono parallele al pavimento.", injuryRisk: false },
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Scendi sotto i 90°: aumenti lo stress sulla rotula. Mantieni le cosce parallele.", injuryRisk: true },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "neutrale",
        phases: [
          {
            phase: "ISOMETRIC",
            minAngle: 0,
            maxAngle: 12,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "La schiena si stacca dal muro: mantieni tutta la colonna a contatto con la parete.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "bird-dog": {
    movements: [
      {
        // In quadrupedia la linea spalla-anca è ~75-100° dalla verticale: range
        // ricalibrato sulla posizione reale (OUT_OF_RANGE = busto che si solleva
        // o bacino che crolla durante l'estensione).
        joint: "spine",
        movementType: "neutrale",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 70,
            maxAngle: 105,
            triggers: [
              { condition: "OUT_OF_RANGE", severity: "ERROR", feedback: "La schiena si inarca o il bacino ruota mentre estendi braccio e gamba: mantieni la colonna neutra e il bacino stabile (anti-rotazione).", injuryRisk: true },
            ],
          },
        ],
      },
      {
        joint: "left_hip",
        movementType: "estensione",
        phases: [
          {
            phase: "TOP",
            minAngle: 160,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "La gamba non si estende del tutto: porta il tallone indietro fino all'allineamento con il busto, senza alzarla oltre.", injuryRisk: false },
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
            minAngle: 150,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Il braccio non si estende del tutto in avanti: portalo all'altezza della spalla mantenendo le scapole stabili.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "cat-cow": {
    movements: [
      {
        joint: "spine",
        movementType: "flessione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 20,
            maxAngle: 60,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Movimento di mobilità troppo ridotto: alterna in modo ampio e fluido flessione (cat) ed estensione (cow) della colonna.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "hip-flexor-stretch": {
    movements: [
      {
        joint: "left_hip",
        movementType: "estensione",
        phases: [
          {
            phase: "ISOMETRIC",
            minAngle: 160,
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Allungamento insufficiente del flessore dell'anca: spingi delicatamente il bacino in avanti mantenendo il busto eretto.", injuryRisk: false },
            ],
          },
        ],
      },
      {
        joint: "spine",
        movementType: "neutrale",
        phases: [
          {
            phase: "ISOMETRIC",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Stai inarcando la zona lombare invece di allungare il flessore: mantieni la pelvi in retroversione e il core attivo.", injuryRisk: false },
            ],
          },
        ],
      },
    ],
  },

  "hamstring-stretch": {
    movements: [
      {
        joint: "left_hip",
        movementType: "flessione",
        phases: [
          {
            phase: "ISOMETRIC",
            minAngle: 60,
            maxAngle: 110,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Allungamento ridotto: aumenta gradualmente la flessione dell'anca senza forzare oltre la tensione confortevole.", injuryRisk: false },
            ],
          },
        ],
      },
      // RIMOSSO il controllo spine 0-40°: in una flessione in avanti profonda
      // l'inclinazione del busto è 50-90° anche con colonna perfettamente neutra —
      // il trigger penalizzava proprio gli allungamenti eseguiti bene.
      // L'arrotondamento della schiena non è distinguibile dall'inclinazione 2D.
    ],
  },

};
