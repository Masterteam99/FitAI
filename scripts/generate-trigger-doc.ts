// Genera docs/revisione-trigger-biomeccanici.md a partire dai dati reali del seed
// (prisma/seed-biomechanical-specs.ts) e dalla configurazione fasi del detector.
// Eseguire con: npx tsx scripts/generate-trigger-doc.ts
// Il documento è pensato per la revisione da parte di un esperto di biomeccanica.

import { writeFileSync } from "node:fs";
import { BIOMECHANICAL_SPECS } from "../prisma/seed-biomechanical-specs";
import { EXERCISE_PHASE_CONFIG } from "../src/services/biomechanical/phaseDetector";

const JOINT_LABELS: Record<string, string> = {
  left_knee: "Ginocchio sx",
  right_knee: "Ginocchio dx",
  left_elbow: "Gomito sx",
  right_elbow: "Gomito dx",
  left_shoulder: "Spalla sx",
  right_shoulder: "Spalla dx",
  left_hip: "Anca sx",
  right_hip: "Anca dx",
  spine: "Colonna",
};

const JOINT_MEASURE: Record<string, string> = {
  left_knee: "angolo interno anca–ginocchio–caviglia (180° = gamba tesa)",
  right_knee: "angolo interno anca–ginocchio–caviglia (180° = gamba tesa)",
  left_elbow: "angolo interno polso–gomito–spalla (180° = braccio teso)",
  right_elbow: "angolo interno polso–gomito–spalla (180° = braccio teso)",
  left_shoulder: "angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead)",
  right_shoulder: "angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead)",
  left_hip: "angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa)",
  right_hip: "angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa)",
  spine: "inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili)",
};

const CONDITION_LABELS: Record<string, string> = {
  BELOW_MIN: "angolo SOTTO il minimo",
  ABOVE_MAX: "angolo SOPRA il massimo",
  OUT_OF_RANGE: "angolo FUORI dall'intervallo",
};

const lines: string[] = [];

lines.push("# Revisione trigger biomeccanici — catalogo completo (52 esercizi)");
lines.push("");
lines.push("> Documento generato automaticamente da `scripts/generate-trigger-doc.ts` a partire");
lines.push("> dai dati reali in `prisma/seed-biomechanical-specs.ts`. NON modificare a mano:");
lines.push("> correggere i dati del seed e rigenerare.");
lines.push("");
lines.push(`Data generazione: ${new Date().toISOString().slice(0, 10)}`);
lines.push("");
lines.push("## A chi è rivolto");
lines.push("");
lines.push("A un esperto di biomeccanica/chinesiologia che debba validare: (1) le soglie angolari,");
lines.push("(2) la severità assegnata a ogni violazione, (3) i testi di feedback mostrati all'utente.");
lines.push("");
lines.push("## Come funziona il sistema (leggere prima di valutare)");
lines.push("");
lines.push("L'app riprende l'utente con la webcam/fotocamera (vista laterale consigliata) e stima");
lines.push("33 punti del corpo con MediaPipe BlazePose. Da questi calcola **angoli 2D** per frame:");
lines.push("");
for (const [joint, desc] of Object.entries(JOINT_MEASURE)) {
  if (joint.startsWith("right_")) continue;
  lines.push(`- **${JOINT_LABELS[joint].replace(" sx", "")}**: ${desc}`);
}
lines.push("");
lines.push("**Limiti strutturali della misura 2D** (vincolano cosa può essere controllato):");
lines.push("");
lines.push("- Gli angoli sono limitati a 0–180°: l'iperestensione oltre i 180° NON è rilevabile.");
lines.push("- Rotazioni (es. rotazione del busto o della spalla) NON sono misurabili.");
lines.push("- L'arrotondamento della colonna è approssimato dall'inclinazione del busto: non distingue");
lines.push("  una schiena flessa da una neutra molto inclinata.");
lines.push("- Negli esercizi a corpo orizzontale (sdraiati, plank, quadrupedia) l'inclinazione della");
lines.push("  colonna parte da ~90°, non da 0°: i range tengono conto della posizione.");
lines.push("");
lines.push("**Fasi del movimento**: il sistema individua le fasi osservando l'angolo-chiave");
lines.push("dell'esercizio: la fase `BOTTOM`/`TOP` è la finestra in cui l'angolo è vicino al");
lines.push("minimo/massimo osservato (per gli esercizi di tirata le etichette sono invertite, così");
lines.push("`TOP` = posizione contratta). `THROUGHOUT` = il controllo vale su tutto il movimento;");
lines.push("`ISOMETRIC` = tenuta statica. Un trigger definito su BOTTOM/TOP viene valutato solo nei");
lines.push("frame di quella fase.");
lines.push("");
lines.push("**Penalità**: una violazione conta solo se persiste ≥200 ms consecutivi. Peso per severità:");
lines.push("WARNING=1, ERROR=3, CRITICAL=10, moltiplicato per la persistenza (frazione di frame in");
lines.push("violazione nella fase). `injuryRisk` evidenzia il feedback come rischio infortunio nell'UI.");
lines.push("");
lines.push("## Cosa validare, riga per riga");
lines.push("");
lines.push("1. La **soglia** (min/max) è anatomicamente sensata per l'esercizio e per il modo in cui");
lines.push("   l'angolo è misurato (vedi sopra)?");
lines.push("2. La **severità** è proporzionata (CRITICAL = potenziale danno acuto)?");
lines.push("3. Il **feedback** è corretto, chiaro e sicuro per un utente non esperto?");
lines.push("");
lines.push("---");
lines.push("");

const slugs = Object.keys(BIOMECHANICAL_SPECS).sort();
let triggerCount = 0;
let criticalCount = 0;
let injuryCount = 0;

for (const slug of slugs) {
  const spec = BIOMECHANICAL_SPECS[slug];
  const config = EXERCISE_PHASE_CONFIG[slug] as { static?: boolean; invert?: boolean; keyAngle?: unknown } | undefined;

  lines.push(`### ${slug}`);
  lines.push("");
  if (config?.static) {
    lines.push("_Rilevamento fasi: esercizio statico (tutte le fasi THROUGHOUT)._");
  } else if (config?.keyAngle) {
    lines.push(
      `_Rilevamento fasi: attivo${config.invert ? " (etichette invertite: TOP = posizione contratta)" : ""}._`
    );
  } else {
    lines.push("_Rilevamento fasi: non configurato (volutamente: la spec usa solo THROUGHOUT)._");
  }
  lines.push("");
  lines.push("| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |");
  lines.push("|---|---|---|---|---|---|---|---|");

  for (const movement of spec.movements) {
    for (const phase of movement.phases) {
      for (const trigger of phase.triggers) {
        triggerCount++;
        if (trigger.severity === "CRITICAL") criticalCount++;
        if (trigger.injuryRisk) injuryCount++;
        lines.push(
          `| ${JOINT_LABELS[movement.joint] ?? movement.joint} (${movement.movementType}) ` +
          `| ${JOINT_MEASURE[movement.joint] ?? ""} ` +
          `| ${phase.phase} ` +
          `| ${phase.minAngle}–${phase.maxAngle}° ` +
          `| ${CONDITION_LABELS[trigger.condition] ?? trigger.condition} ` +
          `| ${trigger.severity} ` +
          `| ${trigger.injuryRisk ? "⚠️ sì" : "no"} ` +
          `| ${trigger.feedback} |`
        );
      }
    }
  }
  lines.push("");
}

lines.push("---");
lines.push("");
lines.push("## Riepilogo");
lines.push("");
lines.push(`- Esercizi: **${slugs.length}**`);
lines.push(`- Trigger totali: **${triggerCount}**`);
lines.push(`- Trigger CRITICAL: **${criticalCount}**`);
lines.push(`- Trigger con rischio infortunio: **${injuryCount}**`);
lines.push("");

const doc = lines.join("\n") + "\n";
writeFileSync("docs/revisione-trigger-biomeccanici.md", doc, "utf8");
console.log(`✅ docs/revisione-trigger-biomeccanici.md generato: ${slugs.length} esercizi, ${triggerCount} trigger (${criticalCount} CRITICAL, ${injuryCount} injuryRisk)`);
