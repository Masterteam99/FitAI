import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { BIOMECHANICAL_SPECS } from "./seed-biomechanical-specs";
import { WORKOUT_TEMPLATES } from "./seed-workout-templates";
import { NUTRITION_TEMPLATES } from "./seed-nutrition-templates";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding FitAI database...");

  // ─── Achievements ────────────────────────────────────────────────────────────
  const achievements = [
    { key: "first_workout", name: "Prima Sessione", description: "Hai completato il tuo primo allenamento!", icon: "🏋️", category: "milestone", points: 50, rarity: "COMMON", condition: { type: "workout_count", value: 1 } },
    { key: "week_streak", name: "Settimana di Fuoco", description: "7 giorni consecutivi di allenamento", icon: "🔥", category: "streak", points: 100, rarity: "RARE", condition: { type: "streak", value: 7 } },
    { key: "ten_workouts", name: "In Forma", description: "10 allenamenti completati", icon: "💪", category: "milestone", points: 75, rarity: "COMMON", condition: { type: "workout_count", value: 10 } },
    { key: "fifty_workouts", name: "Dedicato", description: "50 allenamenti completati", icon: "🥇", category: "milestone", points: 200, rarity: "RARE", condition: { type: "workout_count", value: 50 } },
    { key: "first_analysis", name: "Sotto Analisi", description: "Prima analisi video completata", icon: "🎥", category: "analysis", points: 75, rarity: "COMMON", condition: { type: "analysis_count", value: 1 } },
    { key: "perfect_form", name: "Forma Perfetta", description: "Score analisi superiore a 90", icon: "⭐", category: "analysis", points: 150, rarity: "EPIC", condition: { type: "analysis_score", value: 90 } },
    { key: "ai_plan", name: "Piano AI", description: "Primo piano generato con AI", icon: "🤖", category: "ai", points: 50, rarity: "COMMON", condition: { type: "ai_plans", value: 1 } },
    { key: "month_streak", name: "Guerriero del Mese", description: "30 giorni consecutivi di allenamento", icon: "🏆", category: "streak", points: 500, rarity: "LEGENDARY", condition: { type: "streak", value: 30 } },
    { key: "early_bird", name: "Mattiniero", description: "Allenamento completato prima delle 7:00", icon: "🌅", category: "special", points: 30, rarity: "COMMON", condition: { type: "workout_time", value: 7 } },
    { key: "nutrition_tracker", name: "Nutrizionista", description: "Prima settimana di tracking nutrizionale", icon: "🥗", category: "nutrition", points: 50, rarity: "COMMON", condition: { type: "nutrition_days", value: 7 } },
  ];

  for (const a of achievements) {
    await prisma.achievement.upsert({ where: { key: a.key }, update: {}, create: a as never });
  }
  console.log(`✅ ${achievements.length} achievements`);

  // ─── Esercizi ─────────────────────────────────────────────────────────────────
  // I parametri biomeccanici granulari (movements/phases/triggers) sono in BIOMECHANICAL_SPECS.
  const exercises = [
    {
      name: "Squat", slug: "squat",
      description: "Il re degli esercizi per le gambe. Coinvolge quadricipiti, glutei, femorali e core in modo sinergico.",
      instructions: ["Piedi alla larghezza delle spalle, punte leggermente verso l'esterno", "Petto aperto, spalle indietro, sguardo in avanti", "Inizia la discesa portando i fianchi indietro e in basso", "Le ginocchia seguono la direzione delle punte", "Scendi fino a quando le cosce sono parallele al suolo", "Risali spingendo con i talloni"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","HAMSTRINGS","CORE"],
      difficulty: "INTERMEDIATE", equipment: ["NONE"], category: "STRENGTH", caloriesPerMinute: 8,
      professionalNotes: "Errori comuni: valgismo delle ginocchia, talloni sollevati, eccessiva inclinazione del busto. Angolo ginocchio ottimale: 90-110°.",
      tags: ["fondamentale","gambe","glutei","compound"],
    },
    {
      name: "Stacco da Terra", slug: "stacco-da-terra",
      description: "Esercizio fondamentale per la forza totale. Coinvolge schiena, femorali, glutei e praticamente ogni muscolo del corpo.",
      instructions: ["Piedi alla larghezza dei fianchi, bilanciere sopra il centro del piede", "Fletti le ginocchia e afferra il bilanciere con schiena piatta", "Porta le scapole sopra il bilanciere, petto aperto", "Inspira, crea tensione in tutto il corpo", "Spingi il pavimento lontano, estendi ginocchia e fianchi simultaneamente", "In cima: spalle indietro, fianchi completamente estesi"],
      muscleGroupPrimary: "BACK", muscleGroupsSecondary: ["HAMSTRINGS","GLUTES","QUADRICEPS","CORE"],
      difficulty: "ADVANCED", equipment: ["BARBELL"], category: "STRENGTH", caloriesPerMinute: 10,
      professionalNotes: "La schiena arrotondata è il principale rischio. Colonna neutra in tutte le fasi. Il bilanciere deve restare vicino alle gambe.",
      tags: ["fondamentale","schiena","compound","forza totale"],
    },
    {
      name: "Panca Piana", slug: "panca-piana",
      description: "L'esercizio fondamentale per il petto. Lavora prevalentemente il grande pettorale con tricipiti e deltoide anteriore.",
      instructions: ["Sdraiati sulla panca, occhi sotto il bilanciere", "Piedi piatti sul pavimento", "Retrarre le scapole verso il basso e indietro", "Afferra il bilanciere leggermente più largo delle spalle", "Scendi il bilanciere verso la parte bassa del petto, gomiti a 45-75°", "Tocca il petto e risali"],
      muscleGroupPrimary: "CHEST", muscleGroupsSecondary: ["TRICEPS","SHOULDERS"],
      difficulty: "INTERMEDIATE", equipment: ["BARBELL","BENCH"], category: "STRENGTH", caloriesPerMinute: 7,
      professionalNotes: "Gomiti a 90° aumentano il rischio di lesioni. Angolo ideale 45-75°. Scapole retratte durante tutto il movimento.",
      tags: ["petto","fondamentale","compound","parte alta"],
    },
    {
      name: "Trazioni", slug: "trazioni",
      description: "Il miglior esercizio per la larghezza della schiena. Lavora gran dorsale, bicipiti e muscoli della schiena con il peso corporeo.",
      instructions: ["Afferra la sbarra con presa pronata alla larghezza delle spalle", "Inizia con braccia completamente estese", "Deprimi e retrarre le scapole prima di tirare", "Tira il corpo verso l'alto portando il mento sopra la sbarra", "Gomiti verso il basso e i lati", "Scendi lentamente controllando la fase eccentrica"],
      muscleGroupPrimary: "BACK", muscleGroupsSecondary: ["BICEPS","SHOULDERS","CORE"],
      difficulty: "ADVANCED", equipment: ["PULL_UP_BAR"], category: "STRENGTH", caloriesPerMinute: 9,
      professionalNotes: "Depressione e retrazione scapolare prima di tirare. Corpo stabile senza oscillazione. Range completo fondamentale.",
      tags: ["schiena","fondamentale","peso corporeo","parte alta"],
    },
    {
      name: "Military Press", slug: "military-press",
      description: "L'esercizio fondamentale per le spalle. Lavora il deltoide in tutte le sue porzioni con tricipiti e trapezio superiore.",
      instructions: ["In piedi o seduto, bilanciere alle clavicole", "Presa leggermente più larga delle spalle", "Tensione addominale e glutei contratti", "Spingi il bilanciere verso l'alto in linea retta", "Porta la testa leggermente indietro", "In cima: braccia completamente estese"],
      muscleGroupPrimary: "SHOULDERS", muscleGroupsSecondary: ["TRICEPS","CORE"],
      difficulty: "INTERMEDIATE", equipment: ["BARBELL"], category: "STRENGTH", caloriesPerMinute: 7,
      professionalNotes: "Iperestensione lombare è l'errore principale. Contrarre l'addome. Traiettoria del bilanciere deve essere verticale.",
      tags: ["spalle","fondamentale","parte alta","compound"],
    },
    {
      name: "Affondi", slug: "affondi",
      description: "Esercizio unilaterale per gambe e glutei. Migliora forza, equilibrio e stabilità della caviglia.",
      instructions: ["Piedi alla larghezza dei fianchi", "Fai un passo lungo in avanti", "Scendi abbassando il ginocchio posteriore", "Ginocchio anteriore rimane sopra la caviglia", "Scendi fino a 2-3 cm dal suolo", "Risali spingendo con il piede anteriore"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","HAMSTRINGS","CALVES"],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "STRENGTH", caloriesPerMinute: 7,
      professionalNotes: "Valgismo del ginocchio è l'errore più comune. Busto eretto durante tutto il movimento.",
      tags: ["gambe","unilaterale","equilibrio","glutei"],
    },
    {
      name: "Rematore con Bilanciere", slug: "rematore-bilanciere",
      description: "Esercizio fondamentale per lo spessore della schiena. Lavora gran dorsale, romboidi, trapezio medio e bicipiti.",
      instructions: ["Piedi alla larghezza dei fianchi", "Inclinati in avanti a circa 45° con schiena piatta", "Afferra il bilanciere", "Tira verso l'ombelico portando i gomiti indietro", "In cima: scapole completamente retratte", "Scendi controllato"],
      muscleGroupPrimary: "BACK", muscleGroupsSecondary: ["BICEPS","SHOULDERS"],
      difficulty: "INTERMEDIATE", equipment: ["BARBELL"], category: "STRENGTH", caloriesPerMinute: 7,
      professionalNotes: "Angolo del busto deve rimanere costante (45°). Lo slancio riduce l'efficacia. Schiena arrotondata è errore grave.",
      tags: ["schiena","compound","spessore","fondamentale"],
    },
    {
      name: "Curl Bicipiti", slug: "curl-bicipiti",
      description: "L'esercizio di isolamento classico per i bicipiti. Lavora il capo lungo e corto del bicipite brachiale.",
      instructions: ["In piedi con manubri lungo i fianchi, palmi verso l'esterno", "Tieni i gomiti fissi ai fianchi", "Fletti le braccia portando i manubri verso le spalle", "Contrai i bicipiti in cima", "Scendi lentamente"],
      muscleGroupPrimary: "BICEPS", muscleGroupsSecondary: ["FOREARMS"],
      difficulty: "BEGINNER", equipment: ["DUMBBELLS"], category: "STRENGTH", caloriesPerMinute: 5,
      professionalNotes: "Movimento solo dalla flessione del gomito. Gomiti fissi ai fianchi. Range completo fondamentale per l'ipertrofia.",
      tags: ["bicipiti","isolamento","braccia"],
    },
    {
      name: "Push-Up", slug: "push-up",
      description: "L'esercizio a corpo libero fondamentale per il petto. Lavora pettorali, tricipiti e deltoide anteriore senza attrezzatura.",
      instructions: ["Posizione di plank con mani leggermente più larghe delle spalle", "Corpo in linea retta, core contratto", "Scendi flettendo i gomiti a 45-75°", "Porta il petto quasi al suolo", "Risali mantenendo il corpo rigido"],
      muscleGroupPrimary: "CHEST", muscleGroupsSecondary: ["TRICEPS","SHOULDERS","CORE"],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "STRENGTH", caloriesPerMinute: 8,
      professionalNotes: "Corpo deve formare una linea retta. Fianchi non devono abbassarsi né alzarsi. Gomiti a 45-75°.",
      tags: ["petto","peso corporeo","fondamentale","parte alta"],
    },
    {
      name: "Plank", slug: "plank",
      description: "L'esercizio fondamentale per il core. Stabilizza tutta la catena cinetica e lavora addome, obliqui e muscoli profondi.",
      instructions: ["Posizionati sui gomiti, piedi alla larghezza dei fianchi", "Gomiti direttamente sotto le spalle", "Corpo in linea retta dalla testa ai talloni", "Contrai addome, glutei e quadricipiti", "Respira normalmente"],
      muscleGroupPrimary: "CORE", muscleGroupsSecondary: ["SHOULDERS","GLUTES"],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "FUNCTIONAL", caloriesPerMinute: 4,
      professionalNotes: "Fianchi che si abbassano aumentano il carico sulla colonna lombare. Gomiti direttamente sotto le spalle.",
      tags: ["core","peso corporeo","isometrico","fondamentale"],
    },
    {
      name: "Romanian Deadlift", slug: "romanian-deadlift",
      description: "Esercizio di eccellenza per femorali e glutei. Insegna la cerniera dell'anca e lavora il posterior chain.",
      instructions: ["In piedi con piedi alla larghezza dei fianchi", "Spingi i fianchi indietro mantenendo le ginocchia quasi estese", "Il bilanciere scende lungo le cosce", "Scendi fino a sentire lo stretch nei femorali", "Risali spingendo i fianchi in avanti"],
      muscleGroupPrimary: "HAMSTRINGS", muscleGroupsSecondary: ["GLUTES","BACK"],
      difficulty: "INTERMEDIATE", equipment: ["BARBELL","DUMBBELLS"], category: "STRENGTH", caloriesPerMinute: 7,
      professionalNotes: "La cerniera dell'anca è il movimento chiave: fianchi indietro, non in basso. Ginocchia quasi estese. Schiena piatta fondamentale.",
      tags: ["femorali","glutei","cerniera anca","compound"],
    },
    {
      name: "Alzate Laterali", slug: "lateral-raise",
      description: "Esercizio di isolamento per il deltoide mediale. Sviluppa la larghezza delle spalle.",
      instructions: ["In piedi con manubri lungo i fianchi", "Leggera flessione dei gomiti (15-20°)", "Alza le braccia lateralmente", "Porta i manubri all'altezza delle spalle (non oltre)", "Scendi lentamente"],
      muscleGroupPrimary: "SHOULDERS", muscleGroupsSecondary: [],
      difficulty: "BEGINNER", equipment: ["DUMBBELLS"], category: "STRENGTH", caloriesPerMinute: 4,
      professionalNotes: "Alzare oltre 90° può causare impingement. Usare carichi leggeri per mantenere l'isolamento del deltoide mediale.",
      tags: ["spalle","isolamento","deltoide mediale"],
    },
    {
      name: "Tricipiti ai Cavi", slug: "tricipiti-cavi",
      description: "Esercizio di isolamento per i tricipiti. I cavi mantengono tensione costante durante tutto il range.",
      instructions: ["Stai di fronte al cavo alto", "Gomiti fissi ai fianchi, avambracci paralleli al suolo", "Spingi verso il basso estendendo completamente i gomiti", "Tricipiti completamente contratti in basso", "Risali lentamente"],
      muscleGroupPrimary: "TRICEPS", muscleGroupsSecondary: [],
      difficulty: "BEGINNER", equipment: ["CABLES"], category: "STRENGTH", caloriesPerMinute: 4,
      professionalNotes: "Spostare i gomiti dal corpo trasforma il movimento. Gomiti fissi. Completa estensione importante per il capo lungo.",
      tags: ["tricipiti","isolamento","braccia"],
    },
    {
      name: "Hip Thrust", slug: "hip-thrust",
      description: "Il miglior esercizio per i glutei. Permette di lavorarli nel range di massima contrazione.",
      instructions: ["Schiena appoggiata alla panca, bilanciere sul bacino (usa un pad)", "Piedi piatti, ginocchia a 90° nella posizione alta", "Spingi i fianchi verso l'alto contraendo i glutei", "Posizione alta: corpo orizzontale, glutei completamente contratti", "Scendi senza toccare il suolo con i fianchi"],
      muscleGroupPrimary: "GLUTES", muscleGroupsSecondary: ["HAMSTRINGS","QUADRICEPS"],
      difficulty: "INTERMEDIATE", equipment: ["BARBELL","BENCH"], category: "STRENGTH", caloriesPerMinute: 6,
      professionalNotes: "Iperestensione lombare nella posizione alta è errore comune. Schiena neutra. Completa estensione dell'anca fondamentale.",
      tags: ["glutei","isolamento","femorali"],
    },
    {
      name: "Face Pull", slug: "face-pull",
      description: "Esercizio fondamentale per la salute delle spalle. Rinforza rotatori esterni e deltoide posteriore.",
      instructions: ["Cavo all'altezza della faccia", "Afferra la corda con presa neutra", "Tira verso il viso con gomiti all'altezza delle spalle", "In finale: gomiti alti, mani aperte verso l'esterno", "Concentrati sulla rotazione esterna delle spalle"],
      muscleGroupPrimary: "SHOULDERS", muscleGroupsSecondary: ["BACK"],
      difficulty: "BEGINNER", equipment: ["CABLES"], category: "STRENGTH", caloriesPerMinute: 4,
      professionalNotes: "Fondamentale per bilanciare la cuffia dei rotatori. Gomiti all'altezza o sopra le spalle. Rotazione esterna è l'aspetto più importante.",
      tags: ["spalle posteriori","salute spalle","rotatori","preventivo"],
    },
    {
      name: "Crunch", slug: "crunch",
      description: "Esercizio fondamentale per il retto addominale attraverso la flessione della colonna.",
      instructions: ["Sdraiati con ginocchia flesse a 90°", "Mani dietro la testa o incrociate sul petto", "Contrai l'addome e porta le scapole dal suolo", "La zona lombare rimane a contatto con il suolo", "Scendi lentamente"],
      muscleGroupPrimary: "CORE", muscleGroupsSecondary: [],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "STRENGTH", caloriesPerMinute: 4,
      professionalNotes: "Movimento dalla flessione della colonna, non dall'impulso con il collo. Mani non devono tirare la testa.",
      tags: ["core","addome","peso corporeo"],
    },
    {
      name: "Goblet Squat", slug: "goblet-squat",
      description: "Variante dello squat ideale per principianti. Promuove postura più eretta e lavora eccellentemente i quadricipiti.",
      instructions: ["Reggi un manubrio verticalmente all'altezza del petto", "Piedi leggermente più larghi delle spalle, punte verso l'esterno", "Usa il peso come contrappeso per mantenere il petto aperto", "Scendi con i gomiti che passano dentro le ginocchia", "Scendi il più in basso possibile", "Risali spingendo con i talloni"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","CORE"],
      difficulty: "BEGINNER", equipment: ["DUMBBELLS","KETTLEBELL"], category: "STRENGTH", caloriesPerMinute: 7,
      professionalNotes: "Eccellente per insegnare la meccanica dello squat. Il peso davanti permette una postura più verticale. I gomiti spingono le ginocchia verso l'esterno.",
      tags: ["gambe","principianti","tecnica","mobilità"],
    },
    {
      name: "Bulgarian Split Squat", slug: "bulgarian-split-squat",
      description: "Uno degli esercizi unilaterali più efficaci. Lavora intensamente quadricipiti, glutei e femorali.",
      instructions: ["Piede posteriore su una panca o rialzo", "Piede anteriore abbastanza avanti da permettere al ginocchio posteriore di scendere", "Busto eretto durante tutto il movimento", "Scendi abbassando il ginocchio posteriore verso il suolo", "Fermati a 2-5 cm dal suolo", "Risali spingendo con il piede anteriore"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","HAMSTRINGS"],
      difficulty: "ADVANCED", equipment: ["NONE","DUMBBELLS"], category: "STRENGTH", caloriesPerMinute: 9,
      professionalNotes: "Posizione del piede anteriore cruciale. Iniziare senza peso per padroneggiare l'equilibrio.",
      tags: ["gambe","unilaterale","avanzato","glutei"],
    },
    {
      name: "Plank Laterale", slug: "plank-laterale",
      description: "Variante del plank per gli obliqui. Essenziale per la stabilità laterale della colonna e la prevenzione della lombalgia.",
      instructions: ["Sdraiati su un fianco con peso sul gomito", "Gomito direttamente sotto la spalla", "Solleva i fianchi creando una linea retta dalla testa ai piedi", "Il corpo non deve ruotare né abbassarsi", "Mantieni la posizione, poi ripeti dall'altro lato"],
      muscleGroupPrimary: "CORE", muscleGroupsSecondary: ["SHOULDERS"],
      difficulty: "INTERMEDIATE", equipment: ["NONE"], category: "FUNCTIONAL", caloriesPerMinute: 4,
      professionalNotes: "Fianchi che si abbassano riducono l'attivazione degli obliqui. Il gomito deve essere direttamente sotto la spalla.",
      tags: ["core","obliqui","peso corporeo","prevenzione"],
    },
    {
      name: "Leg Press", slug: "leg-press",
      description: "Esercizio fondamentale per i quadricipiti con macchina. Permette carichi elevati in sicurezza.",
      instructions: ["Siediti con la schiena aderente allo schienale", "Piedi alla larghezza delle spalle sulla piattaforma", "Rimuovi i fermi di sicurezza", "Scendi piegando le ginocchia a 90°", "Le ginocchia seguono la direzione delle punte", "Spingi tornando quasi alla completa estensione (senza bloccare)"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","HAMSTRINGS"],
      difficulty: "INTERMEDIATE", equipment: ["MACHINE"], category: "STRENGTH", caloriesPerMinute: 8,
      professionalNotes: "Schiena sempre aderente allo schienale. Non scendere oltre i 90° senza adeguata mobilità. Non bloccare le ginocchia.",
      tags: ["gambe","macchina","quadricipiti","ipertrofia"],
    },
  ];

  const durations: Record<string, number> = {
    "plank": 25, "plank-laterale": 25, "hip-thrust": 25,
    "curl-bicipiti": 15, "lateral-raise": 15, "tricipiti-cavi": 15, "face-pull": 15, "crunch": 15, "trazioni": 15
  };

  for (const ex of exercises) {
    const { muscleGroupsSecondary, equipment, ...data } = ex;
    const recDur = durations[ex.slug] || 20;

    const exercise = await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: {
        recordingDurationSeconds: recDur
      },
      create: {
        ...data,
        muscleGroupPrimary: data.muscleGroupPrimary as never,
        difficulty: data.difficulty as never,
        category: data.category as never,
        muscleGroupsSecondary: muscleGroupsSecondary as never,
        equipment: equipment as never,
        recordingDurationSeconds: recDur,
      },
    });

    const specData = BIOMECHANICAL_SPECS[ex.slug];
    if (specData) {
      await prisma.exerciseBiomechanicalSpec.deleteMany({
        where: { exerciseId: exercise.id }
      });

      const spec = await prisma.exerciseBiomechanicalSpec.create({
        data: { exerciseId: exercise.id }
      });

      for (const movement of specData.movements) {
        const movementRecord = await prisma.exerciseMovement.create({
          data: {
            specId: spec.id,
            joint: movement.joint,
            movementType: movement.movementType,
          }
        });

        for (const phase of movement.phases) {
          const phaseRecord = await prisma.movementPhase.create({
            data: {
              movementId: movementRecord.id,
              phase: phase.phase as never,
              minAngle: phase.minAngle,
              maxAngle: phase.maxAngle,
            }
          });

          for (const trigger of phase.triggers) {
            await prisma.phaseTrigger.create({
              data: {
                phaseId: phaseRecord.id,
                condition: trigger.condition as never,
                severity: trigger.severity as never,
                feedback: trigger.feedback,
                injuryRisk: trigger.injuryRisk,
              }
            });
          }
        }
      }
    }

    console.log(`  📌 ${ex.name}`);
  }

  // Workout plan templates (few-shot per /api/ai/generate-plan)
  console.log("\n📋 Seeding workout plan templates...");
  await prisma.workoutPlanTemplate.deleteMany({});
  for (const t of WORKOUT_TEMPLATES) {
    await prisma.workoutPlanTemplate.create({
      data: {
        name: t.name,
        description: t.description,
        difficulty: t.difficulty as never,
        targetGoals: t.targetGoals as never,
        requiredEquipment: t.requiredEquipment as never,
        durationWeeks: t.durationWeeks,
        workoutsPerWeek: t.workoutsPerWeek,
        rationale: t.rationale,
        daysJson: t.days as object,
      },
    });
    console.log(`  📋 ${t.name}`);
  }

  // Nutrition plan templates (few-shot per /api/ai/generate-nutrition-plan)
  console.log("\n🥗 Seeding nutrition plan templates...");
  await prisma.nutritionPlanTemplate.deleteMany({});
  for (const t of NUTRITION_TEMPLATES) {
    await prisma.nutritionPlanTemplate.create({
      data: {
        name: t.name,
        description: t.description,
        dietType: t.dietType,
        targetGoal: t.targetGoal as never,
        estimatedProfileJson: t.estimatedTargetProfile as object,
        targetMacrosJson: t.targetMacros as object,
        weeklyPlanJson: t.weeklyPlan as object,
        rationale: t.rationale,
      },
    });
    console.log(`  🥗 ${t.name}`);
  }

  console.log(`\n✅ Seed completato: ${exercises.length} esercizi, ${achievements.length} achievements, ${WORKOUT_TEMPLATES.length} template allenamento, ${NUTRITION_TEMPLATES.length} template nutrizione`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
