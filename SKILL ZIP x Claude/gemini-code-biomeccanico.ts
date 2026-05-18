// File: prisma/seed-biomechanical-specs.ts

export interface BiomechanicalSpecData {
  movements: MovementData[];
}

export interface MovementData {
  joint: "left_knee" | "right_knee" | "left_elbow" | "right_elbow" | "left_shoulder" | "right_shoulder" | "left_hip" | "right_hip" | "spine";
  movementType: "flessione" | "estensione" | "abduzione" | "adduzione" | "rotazione" | "inclinazione" | "iperestensione" | "neutrale";
  phases: MovementPhaseData[];
}

export interface MovementPhaseData {
  phase: "BOTTOM" | "TOP" | "CONCENTRIC" | "ECCENTRIC" | "ISOMETRIC" | "THROUGHOUT";
  minAngle: number;
  maxAngle: number;
  triggers: PhaseTriggerData[];
}

export interface PhaseTriggerData {
  condition: "BELOW_MIN" | "ABOVE_MAX" | "OUT_OF_RANGE";
  severity: "WARNING" | "ERROR" | "CRITICAL";
  feedback: string;
  injuryRisk: boolean;
}

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
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Profondità insufficiente: il ginocchio non raggiunge il parallelo. Scendi finché la coscia è parallela al pavimento.", injuryRisk: false },
              { condition: "BELOW_MIN", severity: "CRITICAL", feedback: "Discesa eccessiva sotto il parallelo. Il ginocchio scende troppo creando stress capsulare; ferma il movimento al parallelo.", injuryRisk: true }
            ]
          }
        ]
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
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Inclinazione eccessiva del tronco. Mantieni il petto alto e attiva il core per evitare sovraccarichi pericolosi sulla zona lombare.", injuryRisk: true }
            ]
          }
        ]
      }
    ]
  },
  "stacco-da-terra": {
    movements: [
      {
        joint: "spine",
        movementType: "iperestensione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 50,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Schiena curva rilevata. Mantieni la colonna in posizione neutra e petto fiero per evitare gravi infortuni discali.", injuryRisk: true }
            ]
          }
        ]
      }
    ]
  },
  "plank": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Collasso lombare rilevato. Solleva il bacino e contrai glutei e addome per riallineare la colonna.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
  },
  "panca-piana": {
    movements: [
      {
        joint: "left_elbow",
        movementType: "estensione",
        phases: [
          {
            phase: "TOP",
            minAngle: 160,
            maxAngle: 175,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Iperestensione del gomito nel lockout. Mantieni un leggero sblocco articolare per proteggere l'articolazione sotto carico.", injuryRisk: true }
            ]
          }
        ]
      }
    ]
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
            maxAngle: 60,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Chiusura incompleta. Porta il mento sopra la sbarra per massimizzare la contrazione dei dorsali.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
  },
  "military-press": {
    movements: [
      {
        joint: "spine",
        movementType: "iperestensione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Compensazione lombare eccessiva. Non inarcare la schiena; contrai i glutei per stabilizzare il bacino.", injuryRisk: true }
            ]
          }
        ]
      }
    ]
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
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Il ginocchio avanza troppo oltre la punta del piede. Mantieni il peso centrato e la tibia più verticale.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
  },
  "rematore-bilanciere": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 40,
            maxAngle: 60,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Posizione troppo verticale. Inclina maggiormente il busto per caricare correttamente i dorsali e non i trapezi.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
  },
  "curl-bicipiti": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "CONCENTRIC",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Uso del momento rilevato. Evita di oscillare con il tronco per sollevare il peso.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
  },
  "push-up": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 15,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Bacino troppo alto o troppo basso. Mantieni una linea retta tra spalle, fianchi e caviglie.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
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
            maxAngle: 60,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Arrotondamento della schiena. Mantieni il petto aperto e spingi i glutei indietro mantenendo la colonna neutra.", injuryRisk: true }
            ]
          }
        ]
      }
    ]
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
            maxAngle: 100,
            triggers: [
              { condition: "ABOVE_MAX", severity: "WARNING", feedback: "Braccia sollevate oltre il parallelo. Fermati all'altezza delle spalle per evitare l'intervento eccessivo dei trapezi.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
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
            maxAngle: 180,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Estensione incompleta. Distendi completamente il braccio per attivare al massimo il tricipite.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
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
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Iperestensione lombare nel lockout. Fermati quando il bacino è allineato alle ginocchia e contrai i glutei.", injuryRisk: true }
            ]
          }
        ]
      }
    ]
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
            maxAngle: 60,
            triggers: [
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Escursione limitata. Solleva maggiormente le scapole da terra concentrandoti sulla contrazione addominale.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
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
            maxAngle: 110,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Manca profondità. Scendi fino a toccare quasi le ginocchia con i gomiti mantenendo il peso sui talloni.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
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
              { condition: "BELOW_MIN", severity: "WARNING", feedback: "Il ginocchio anteriore supera troppo la punta del piede. Aumenta la distanza tra i piedi.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
  },
  "plank-laterale": {
    movements: [
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [
          {
            phase: "THROUGHOUT",
            minAngle: 0,
            maxAngle: 10,
            triggers: [
              { condition: "ABOVE_MAX", severity: "ERROR", feedback: "Fianco cadente. Spingi il bacino verso l'alto per mantenere il corpo perfettamente allineato.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
  },
  "face-pull": {
    movements: [
      {
        joint: "left_shoulder",
        movementType: "rotazione",
        phases: [
          {
            phase: "TOP",
            minAngle: 80,
            maxAngle: 100,
            triggers: [
              { condition: "BELOW_MIN", severity: "ERROR", feedback: "Mancata rotazione esterna. Tira la corda verso la fronte portando le nocche indietro.", injuryRisk: false }
            ]
          }
        ]
      }
    ]
  },
  "leg-press": {
    movements: [
      {
        joint: "left_knee",
        movementType: "estensione",
        phases: [
          {
            phase: "TOP",
            minAngle: 150,
            maxAngle: 170,
            triggers: [
              { condition: "ABOVE_MAX", severity: "CRITICAL", feedback: "Lockout articolare pericoloso. Non estendere mai completamente le ginocchia sotto carico sulla pressa.", injuryRisk: true }
            ]
          }
        ]
      }
    ]
  }
};