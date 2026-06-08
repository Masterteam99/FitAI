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

    // ─── Esercizi aggiuntivi (espansione tag-driven) ─────────────────────────────
    // TASSONOMIA TAG (slug-style, italiano) usata in Exercise.tags per pilotare la
    // selezione AI tag-driven (vedi /api/ai/generate-plan). Dimensioni:
    //  • obiettivo:        forza, ipertrofia, dimagrimento, resistenza, mobilita, postura, riabilitazione, potenza
    //  • gruppo:           petto, schiena, gambe, spalle, braccia, core, glutei, polpacci, full-body
    //  • attrezzatura:     corpo-libero, manubri, bilanciere, kettlebell, macchina, cavi, elastici, sbarra
    //  • livello:          principiante, intermedio, avanzato
    //  • contesto/fascia:  casa, palestra, riscaldamento, defaticamento, low-impact, hiit
    //  • pattern motorio:  squat, hinge, affondo, spinta-orizzontale, spinta-verticale,
    //                      tirata-orizzontale, tirata-verticale, core-anti-estensione,
    //                      core-anti-rotazione, isolamento, gait, pliometrico
    //  • controindicazioni: evitare-schiena, evitare-ginocchio, evitare-spalla
    {
      name: "Front Squat", slug: "front-squat",
      description: "Squat con bilanciere frontale che enfatizza quadricipiti e core, promuovendo un busto più eretto rispetto al back squat.",
      instructions: ["Bilanciere appoggiato sui deltoidi anteriori, gomiti alti", "Piedi alla larghezza delle spalle, punte leggermente in fuori", "Scendi mantenendo il busto verticale e i gomiti alti", "Cosce sotto il parallelo se la mobilità lo consente", "Risali spingendo con i talloni"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","CORE"],
      difficulty: "ADVANCED", equipment: ["BARBELL"], category: "STRENGTH", caloriesPerMinute: 8,
      professionalNotes: "Gomiti che cadono = bilanciere in avanti e collasso del busto. Richiede buona mobilità di polso e dorsale.",
      tags: ["forza","ipertrofia","gambe","quadricipiti","core","bilanciere","avanzato","palestra","squat","compound","evitare-ginocchio"],
    },
    {
      name: "Overhead Squat", slug: "overhead-squat",
      description: "Squat con carico sopra la testa: massimo test di mobilità, stabilità e controllo del core di tutto il corpo.",
      instructions: ["Bilanciere bloccato sopra la testa con presa larga", "Braccia completamente estese e attive", "Scendi in squat mantenendo il bilanciere sopra la verticale dei piedi", "Busto il più verticale possibile", "Risali controllando l'asta"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["SHOULDERS","CORE"],
      difficulty: "ADVANCED", equipment: ["BARBELL"], category: "STRENGTH", caloriesPerMinute: 8,
      professionalNotes: "Esercizio tecnico avanzato. Iniziare con bastone. Richiede ottima mobilità di spalla, anca e caviglia.",
      tags: ["forza","mobilita","gambe","spalle","core","bilanciere","avanzato","palestra","squat","compound","evitare-spalla"],
    },
    {
      name: "Pistol Squat", slug: "pistol-squat",
      description: "Squat su una gamba sola a corpo libero: forza unilaterale, equilibrio e mobilità estrema.",
      instructions: ["In piedi su una gamba, l'altra distesa in avanti", "Braccia avanti come contrappeso", "Scendi controllato sulla gamba d'appoggio fino in fondo", "Tallone a terra, ginocchio allineato alla punta", "Risali senza slancio"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","CORE"],
      difficulty: "ADVANCED", equipment: ["NONE"], category: "STRENGTH", caloriesPerMinute: 9,
      professionalNotes: "Progressione partendo da rialzo o assistenza. Valgismo e perdita di equilibrio i rischi principali.",
      tags: ["forza","gambe","quadricipiti","glutei","corpo-libero","avanzato","casa","squat","unilaterale","evitare-ginocchio"],
    },
    {
      name: "Leg Extension", slug: "leg-extension",
      description: "Isolamento del quadricipite alla macchina. Tensione costante e ottimo per l'ipertrofia del quadricipite.",
      instructions: ["Siediti con schiena aderente allo schienale", "Cuscinetto sopra i malleoli", "Estendi le ginocchia fino quasi alla completa estensione", "Contrai il quadricipite in cima", "Scendi controllato"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: [],
      difficulty: "BEGINNER", equipment: ["MACHINE"], category: "STRENGTH", caloriesPerMinute: 5,
      professionalNotes: "Evitare di bloccare con strappo. Carichi eccessivi stressano l'articolazione femoro-rotulea.",
      tags: ["ipertrofia","gambe","quadricipiti","macchina","principiante","palestra","isolamento","evitare-ginocchio"],
    },
    {
      name: "Leg Curl", slug: "leg-curl",
      description: "Isolamento dei femorali alla macchina, fondamentale per l'equilibrio muscolare della coscia.",
      instructions: ["Posizionati prono o seduto secondo la macchina", "Cuscinetto sopra i talloni", "Fletti le ginocchia portando i talloni verso i glutei", "Contrai i femorali", "Torna controllato"],
      muscleGroupPrimary: "HAMSTRINGS", muscleGroupsSecondary: ["CALVES"],
      difficulty: "BEGINNER", equipment: ["MACHINE"], category: "STRENGTH", caloriesPerMinute: 5,
      professionalNotes: "Evitare lo slancio del bacino. Movimento controllato in entrambe le fasi.",
      tags: ["ipertrofia","gambe","femorali","macchina","principiante","palestra","isolamento"],
    },
    {
      name: "Calf Raise", slug: "calf-raise",
      description: "Esercizio fondamentale per i polpacci: estensione della caviglia per gastrocnemio e soleo.",
      instructions: ["In piedi, avampiede su un rialzo", "Scendi i talloni sotto il livello dell'avampiede", "Sollevati sulle punte il più in alto possibile", "Contrai i polpacci in cima", "Scendi lentamente per il massimo allungamento"],
      muscleGroupPrimary: "CALVES", muscleGroupsSecondary: [],
      difficulty: "BEGINNER", equipment: ["NONE","DUMBBELLS"], category: "STRENGTH", caloriesPerMinute: 4,
      professionalNotes: "Range completo fondamentale. Pausa in cima per massimizzare la contrazione.",
      tags: ["ipertrofia","polpacci","gambe","corpo-libero","manubri","principiante","casa","isolamento"],
    },
    {
      name: "Panca Inclinata", slug: "incline-bench-press",
      description: "Distensione su panca inclinata che enfatizza la porzione alta del pettorale e il deltoide anteriore.",
      instructions: ["Panca inclinata a 30-45°, occhi sotto il bilanciere", "Scapole retratte, piedi piatti", "Scendi il bilanciere verso la parte alta del petto, gomiti 45-75°", "Tocca e risali in linea", "Estensione completa senza bloccare di scatto"],
      muscleGroupPrimary: "CHEST", muscleGroupsSecondary: ["SHOULDERS","TRICEPS"],
      difficulty: "INTERMEDIATE", equipment: ["BARBELL","BENCH"], category: "STRENGTH", caloriesPerMinute: 7,
      professionalNotes: "Inclinazione eccessiva sposta il lavoro sulle spalle. Gomiti a 90° aumentano il rischio per la cuffia.",
      tags: ["forza","ipertrofia","petto","parte-alta","spalle","bilanciere","intermedio","palestra","spinta-orizzontale","compound","evitare-spalla"],
    },
    {
      name: "Distensioni con Manubri", slug: "dumbbell-bench-press",
      description: "Distensioni su panca con manubri: maggiore range di movimento e attivazione stabilizzatrice rispetto al bilanciere.",
      instructions: ["Sdraiato su panca con un manubrio per mano", "Scapole retratte, piedi piatti", "Scendi i manubri all'altezza del petto, gomiti 45-75°", "Spingi verso l'alto avvicinando i manubri", "Controlla la fase eccentrica"],
      muscleGroupPrimary: "CHEST", muscleGroupsSecondary: ["TRICEPS","SHOULDERS"],
      difficulty: "INTERMEDIATE", equipment: ["DUMBBELLS","BENCH"], category: "STRENGTH", caloriesPerMinute: 7,
      professionalNotes: "Non scendere oltre il comfort della spalla. Maggior controllo richiesto per la stabilizzazione.",
      tags: ["forza","ipertrofia","petto","manubri","intermedio","palestra","casa","spinta-orizzontale","compound","evitare-spalla"],
    },
    {
      name: "Croci con Manubri", slug: "chest-fly",
      description: "Isolamento del pettorale tramite adduzione delle braccia, ottimo per lo stretch e la contrazione del petto.",
      instructions: ["Sdraiato su panca, manubri sopra il petto con leggera flessione dei gomiti", "Apri le braccia ad arco mantenendo l'angolo del gomito fisso", "Scendi fino a sentire l'allungamento del petto", "Riporta i manubri sopra il petto contraendo", "Mantieni il movimento ad arco"],
      muscleGroupPrimary: "CHEST", muscleGroupsSecondary: ["SHOULDERS"],
      difficulty: "BEGINNER", equipment: ["DUMBBELLS","BENCH"], category: "STRENGTH", caloriesPerMinute: 5,
      professionalNotes: "Apertura eccessiva stressa la capsula della spalla. Mantenere sempre la leggera flessione dei gomiti.",
      tags: ["ipertrofia","petto","manubri","principiante","palestra","casa","isolamento","evitare-spalla"],
    },
    {
      name: "Dips alle Parallele", slug: "dips",
      description: "Esercizio a corpo libero per petto basso e tricipiti, uno dei migliori per la forza della parte alta.",
      instructions: ["Sospeso alle parallele, braccia estese", "Leggera inclinazione del busto in avanti per il petto", "Scendi flettendo i gomiti fino a circa 90°", "Spingi verso l'alto estendendo le braccia", "Controlla la discesa"],
      muscleGroupPrimary: "CHEST", muscleGroupsSecondary: ["TRICEPS","SHOULDERS"],
      difficulty: "ADVANCED", equipment: ["NONE"], category: "STRENGTH", caloriesPerMinute: 8,
      professionalNotes: "Scendere troppo sotto i 90° stressa la spalla anteriore. Evitare con problemi di spalla.",
      tags: ["forza","petto","tricipiti","corpo-libero","avanzato","casa","palestra","spinta-verticale","compound","evitare-spalla"],
    },
    {
      name: "Lat Machine", slug: "lat-pulldown",
      description: "Tirata verticale alla macchina per la larghezza del dorso, alternativa accessibile alle trazioni.",
      instructions: ["Seduto con cuscinetti sulle cosce, presa larga pronata", "Deprimi e retrarre le scapole", "Tira la barra verso la parte alta del petto", "Gomiti verso il basso e indietro", "Risali controllando l'allungamento"],
      muscleGroupPrimary: "BACK", muscleGroupsSecondary: ["BICEPS","SHOULDERS"],
      difficulty: "BEGINNER", equipment: ["MACHINE","CABLES"], category: "STRENGTH", caloriesPerMinute: 6,
      professionalNotes: "Evitare di sdraiarsi all'indietro per slancio. Tirare dietro la nuca aumenta il rischio per la spalla.",
      tags: ["ipertrofia","schiena","dorso","macchina","cavi","principiante","palestra","tirata-verticale","compound"],
    },
    {
      name: "Pulley Basso", slug: "seated-cable-row",
      description: "Tirata orizzontale ai cavi per lo spessore del dorso, romboidi e trapezio medio.",
      instructions: ["Seduto, piedi sugli appoggi, schiena neutra", "Afferra l'impugnatura con braccia estese", "Tira verso l'addome retraendo le scapole", "Gomiti vicino al busto", "Torna controllato senza arrotondare la schiena"],
      muscleGroupPrimary: "BACK", muscleGroupsSecondary: ["BICEPS","SHOULDERS"],
      difficulty: "BEGINNER", equipment: ["CABLES","MACHINE"], category: "STRENGTH", caloriesPerMinute: 6,
      professionalNotes: "Lo slancio del busto riduce l'efficacia e stressa la lombare. Mantenere la colonna neutra.",
      tags: ["ipertrofia","schiena","dorso","spessore","cavi","macchina","principiante","palestra","tirata-orizzontale","compound","evitare-schiena"],
    },
    {
      name: "Rematore con Manubrio", slug: "dumbbell-row",
      description: "Tirata orizzontale unilaterale con manubrio, ottima per correggere asimmetrie del dorso.",
      instructions: ["Ginocchio e mano appoggiati alla panca, schiena parallela al suolo", "Manubrio nella mano libera, braccio esteso", "Tira il manubrio verso il fianco portando il gomito indietro", "Retrarre la scapola in cima", "Scendi controllato"],
      muscleGroupPrimary: "BACK", muscleGroupsSecondary: ["BICEPS","SHOULDERS"],
      difficulty: "INTERMEDIATE", equipment: ["DUMBBELLS","BENCH"], category: "STRENGTH", caloriesPerMinute: 6,
      professionalNotes: "Mantenere la schiena piatta e stabile. Evitare la rotazione del busto per slancio.",
      tags: ["ipertrofia","schiena","dorso","unilaterale","manubri","intermedio","palestra","casa","tirata-orizzontale","compound","evitare-schiena"],
    },
    {
      name: "Arnold Press", slug: "arnold-press",
      description: "Distensione sopra la testa con rotazione che coinvolge tutte le porzioni del deltoide.",
      instructions: ["Seduto, manubri davanti alle spalle con palmi verso di te", "Spingi verso l'alto ruotando i palmi in avanti", "Estensione completa sopra la testa", "Inverti la rotazione scendendo", "Controlla il movimento"],
      muscleGroupPrimary: "SHOULDERS", muscleGroupsSecondary: ["TRICEPS"],
      difficulty: "INTERMEDIATE", equipment: ["DUMBBELLS"], category: "STRENGTH", caloriesPerMinute: 6,
      professionalNotes: "Evitare l'iperestensione lombare. Carichi moderati per controllare la rotazione.",
      tags: ["ipertrofia","spalle","manubri","intermedio","palestra","casa","spinta-verticale","compound","evitare-spalla"],
    },
    {
      name: "Alzate Frontali", slug: "front-raise",
      description: "Isolamento del deltoide anteriore tramite flessione della spalla.",
      instructions: ["In piedi, manubri davanti alle cosce", "Leggera flessione dei gomiti", "Solleva un manubrio davanti fino all'altezza della spalla", "Scendi controllato", "Alterna o esegui simultaneamente"],
      muscleGroupPrimary: "SHOULDERS", muscleGroupsSecondary: [],
      difficulty: "BEGINNER", equipment: ["DUMBBELLS"], category: "STRENGTH", caloriesPerMinute: 4,
      professionalNotes: "Evitare lo slancio del busto. Non superare di molto l'altezza della spalla.",
      tags: ["ipertrofia","spalle","deltoide-anteriore","manubri","principiante","casa","isolamento"],
    },
    {
      name: "Hammer Curl", slug: "hammer-curl",
      description: "Curl con presa neutra che lavora bicipite, brachiale e brachioradiale per braccia più spesse.",
      instructions: ["In piedi, manubri con presa neutra (palmi verso il corpo)", "Gomiti fissi ai fianchi", "Fletti le braccia mantenendo la presa neutra", "Contrai in cima", "Scendi lentamente"],
      muscleGroupPrimary: "BICEPS", muscleGroupsSecondary: ["FOREARMS"],
      difficulty: "BEGINNER", equipment: ["DUMBBELLS"], category: "STRENGTH", caloriesPerMinute: 5,
      professionalNotes: "Gomiti fissi. La presa neutra riduce lo stress sul polso rispetto al curl supinato.",
      tags: ["ipertrofia","braccia","bicipiti","avambracci","manubri","principiante","casa","isolamento"],
    },
    {
      name: "French Press", slug: "skull-crusher",
      description: "Estensione dei tricipiti da sdraiato, isolamento efficace per tutti i capi del tricipite.",
      instructions: ["Sdraiato su panca, bilanciere o manubri sopra il petto", "Gomiti puntati verso l'alto, fissi", "Fletti i gomiti portando il peso verso la fronte", "Estendi tornando alla posizione iniziale", "Mantieni i gomiti fermi"],
      muscleGroupPrimary: "TRICEPS", muscleGroupsSecondary: [],
      difficulty: "INTERMEDIATE", equipment: ["BARBELL","DUMBBELLS"], category: "STRENGTH", caloriesPerMinute: 5,
      professionalNotes: "Gomiti che si aprono o si spostano riducono l'isolamento e stressano l'articolazione.",
      tags: ["ipertrofia","braccia","tricipiti","bilanciere","manubri","intermedio","palestra","casa","isolamento"],
    },
    {
      name: "Russian Twist", slug: "russian-twist",
      description: "Esercizio di rotazione per gli obliqui e il core anti-rotazione.",
      instructions: ["Seduto, busto inclinato indietro, piedi sollevati o a terra", "Mani unite o con peso davanti al petto", "Ruota il busto da un lato all'altro", "Controlla il movimento dal torace", "Mantieni la schiena allungata"],
      muscleGroupPrimary: "CORE", muscleGroupsSecondary: [],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "FUNCTIONAL", caloriesPerMinute: 5,
      professionalNotes: "Rotazione di slancio dalla lombare aumenta il rischio. Ruotare in modo controllato dal tronco.",
      tags: ["core","obliqui","addome","corpo-libero","principiante","casa","core-anti-rotazione","evitare-schiena"],
    },
    {
      name: "Mountain Climber", slug: "mountain-climber",
      description: "Esercizio dinamico full-body che combina stabilità del core e lavoro cardiovascolare.",
      instructions: ["Posizione di plank alto, mani sotto le spalle", "Porta alternativamente le ginocchia verso il petto", "Mantieni i fianchi bassi e stabili", "Aumenta il ritmo mantenendo la tecnica", "Core sempre attivo"],
      muscleGroupPrimary: "CORE", muscleGroupsSecondary: ["SHOULDERS","QUADRICEPS"],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "CARDIO", caloriesPerMinute: 10,
      professionalNotes: "I fianchi che si alzano riducono l'attivazione del core. Mantenere la linea del plank.",
      tags: ["dimagrimento","resistenza","core","cardio","corpo-libero","principiante","casa","hiit","core-anti-estensione"],
    },
    {
      name: "Burpee", slug: "burpee",
      description: "Esercizio full-body ad alta intensità che unisce forza, esplosività e capacità cardiovascolare.",
      instructions: ["In piedi, scendi in accosciata e appoggia le mani", "Porta i piedi indietro in posizione di plank", "Esegui un push-up (opzionale)", "Riporta i piedi verso le mani", "Salta in alto con le braccia tese"],
      muscleGroupPrimary: "FULL_BODY", muscleGroupsSecondary: ["CHEST","QUADRICEPS","CORE"],
      difficulty: "INTERMEDIATE", equipment: ["NONE"], category: "CARDIO", caloriesPerMinute: 12,
      professionalNotes: "Mantenere la colonna neutra nel plank e atterrare morbidi. Alto impatto: non adatto a problemi articolari.",
      tags: ["dimagrimento","resistenza","potenza","full-body","cardio","corpo-libero","intermedio","casa","hiit","pliometrico","evitare-ginocchio"],
    },
    {
      name: "Jump Squat", slug: "jump-squat",
      description: "Squat pliometrico per sviluppare potenza esplosiva degli arti inferiori.",
      instructions: ["Squat a corpo libero fino al parallelo", "Esplodi verso l'alto in un salto", "Estensione completa di anca, ginocchio e caviglia in volo", "Atterra morbido riassorbendo in squat", "Concatena le ripetizioni in modo fluido"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","CALVES"],
      difficulty: "INTERMEDIATE", equipment: ["NONE"], category: "PLYOMETRIC", caloriesPerMinute: 10,
      professionalNotes: "Atterraggio rigido o valgismo = rischio per il ginocchio. Ammortizzare sempre l'atterraggio.",
      tags: ["potenza","dimagrimento","gambe","quadricipiti","glutei","corpo-libero","intermedio","casa","squat","pliometrico","hiit","evitare-ginocchio"],
    },
    {
      name: "Box Jump", slug: "box-jump",
      description: "Salto su rialzo per la potenza esplosiva e la coordinazione degli arti inferiori.",
      instructions: ["In piedi davanti a un box stabile", "Carica con un mini squat e oscillazione delle braccia", "Salta atterrando con entrambi i piedi sul box", "Atterra morbido con le ginocchia allineate", "Scendi (non saltare giù) e ripeti"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","CALVES"],
      difficulty: "INTERMEDIATE", equipment: ["NONE"], category: "PLYOMETRIC", caloriesPerMinute: 10,
      professionalNotes: "Scendere a piedi dal box per ridurre l'impatto. Atterraggio rigido o valgismo da evitare.",
      tags: ["potenza","gambe","quadricipiti","glutei","corpo-libero","intermedio","palestra","pliometrico","hiit","evitare-ginocchio"],
    },
    {
      name: "Kettlebell Swing", slug: "kettlebell-swing",
      description: "Movimento balistico di cerniera dell'anca per potenza dei glutei, posterior chain e capacità cardiovascolare.",
      instructions: ["Kettlebell a terra davanti, piedi più larghi delle spalle", "Cerniera d'anca afferrando il kettlebell", "Slancio indietro fra le gambe, poi esplosione d'anca in avanti", "Il kettlebell sale per inerzia fino all'altezza del petto", "Controlla il ritorno facendo cerniera, non squat"],
      muscleGroupPrimary: "GLUTES", muscleGroupsSecondary: ["HAMSTRINGS","BACK","CORE"],
      difficulty: "INTERMEDIATE", equipment: ["KETTLEBELL"], category: "FUNCTIONAL", caloriesPerMinute: 11,
      professionalNotes: "Schiena arrotondata nella cerniera = rischio lombare elevato sotto slancio. La spinta viene dall'anca, non dalle braccia.",
      tags: ["potenza","dimagrimento","resistenza","glutei","femorali","schiena","core","kettlebell","intermedio","palestra","casa","hinge","hiit","evitare-schiena"],
    },
    {
      name: "Goblet Squat con Kettlebell", slug: "kettlebell-goblet-squat",
      description: "Squat frontale con kettlebell al petto, ideale per imparare la meccanica e rinforzare gambe e core.",
      instructions: ["Reggi il kettlebell al petto per le corna", "Piedi poco più larghi delle spalle", "Scendi mantenendo il busto eretto e i gomiti dentro le ginocchia", "Scendi sotto il parallelo se possibile", "Risali spingendo con i talloni"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","CORE"],
      difficulty: "BEGINNER", equipment: ["KETTLEBELL"], category: "STRENGTH", caloriesPerMinute: 7,
      professionalNotes: "Ottimo per insegnare lo squat. Il peso frontale aiuta a mantenere il busto verticale.",
      tags: ["forza","gambe","quadricipiti","glutei","core","kettlebell","principiante","palestra","casa","squat","tecnica"],
    },
    {
      name: "Glute Bridge", slug: "glute-bridge",
      description: "Ponte a corpo libero per attivazione e forza dei glutei, accessibile a tutti i livelli.",
      instructions: ["Sdraiato supino, ginocchia flesse, piedi piatti", "Braccia lungo i fianchi", "Spingi i fianchi verso l'alto contraendo i glutei", "Corpo in linea dalle ginocchia alle spalle", "Scendi controllato senza appoggiare del tutto"],
      muscleGroupPrimary: "GLUTES", muscleGroupsSecondary: ["HAMSTRINGS","CORE"],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "STRENGTH", caloriesPerMinute: 4,
      professionalNotes: "Iperestensione lombare in cima è un errore: l'estensione viene dall'anca, non dalla schiena.",
      tags: ["forza","postura","riabilitazione","glutei","femorali","core","corpo-libero","principiante","casa","low-impact","hinge"],
    },
    {
      name: "Good Morning", slug: "good-morning",
      description: "Cerniera dell'anca con bilanciere sulle spalle per rinforzare femorali, glutei ed erettori spinali.",
      instructions: ["Bilanciere sulle spalle, piedi alla larghezza dei fianchi", "Ginocchia leggermente flesse e fisse", "Fai cerniera d'anca spingendo il bacino indietro", "Scendi mantenendo la schiena neutra fino a circa orizzontale", "Risali contraendo glutei e femorali"],
      muscleGroupPrimary: "HAMSTRINGS", muscleGroupsSecondary: ["GLUTES","BACK"],
      difficulty: "INTERMEDIATE", equipment: ["BARBELL"], category: "STRENGTH", caloriesPerMinute: 6,
      professionalNotes: "Carichi prudenti: la schiena che si arrotonda sotto carico è ad alto rischio lombare.",
      tags: ["forza","gambe","femorali","glutei","schiena","bilanciere","intermedio","palestra","hinge","compound","evitare-schiena"],
    },
    {
      name: "Step-Up", slug: "step-up",
      description: "Salita su rialzo unilaterale per forza funzionale di gambe e glutei e stabilità monopodalica.",
      instructions: ["Davanti a un rialzo stabile, un piede sopra", "Spingi con la gamba sopra per salire", "Porta l'altro ginocchio in alto in cima", "Scendi controllato con la stessa gamba", "Completa le ripetizioni e cambia lato"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES","HAMSTRINGS"],
      difficulty: "BEGINNER", equipment: ["NONE","DUMBBELLS"], category: "FUNCTIONAL", caloriesPerMinute: 7,
      professionalNotes: "Spingere con la gamba sopra, non darsi lo slancio col piede a terra. Ginocchio allineato alla punta.",
      tags: ["forza","gambe","quadricipiti","glutei","corpo-libero","manubri","principiante","casa","affondo","unilaterale","gait"],
    },
    {
      name: "Wall Sit", slug: "wall-sit",
      description: "Isometria contro il muro per resistenza dei quadricipiti e stabilità del ginocchio.",
      instructions: ["Schiena contro il muro, scivola fino a cosce parallele al suolo", "Ginocchia a 90°, sopra le caviglie", "Mantieni la posizione respirando normalmente", "Peso sui talloni", "Esci risalendo lungo il muro"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES"],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "FUNCTIONAL", caloriesPerMinute: 5,
      professionalNotes: "Ginocchia oltre i 90° o disallineate aumentano lo stress femoro-rotuleo.",
      tags: ["resistenza","riabilitazione","gambe","quadricipiti","corpo-libero","principiante","casa","low-impact","isometrico"],
    },
    {
      name: "Bird Dog", slug: "bird-dog",
      description: "Esercizio di stabilità anti-rotazione del core con estensione controllata di braccio e gamba opposti.",
      instructions: ["In quadrupedia, mani sotto le spalle e ginocchia sotto i fianchi", "Estendi contemporaneamente braccio e gamba opposti", "Mantieni il bacino e la colonna stabili e neutri", "Pausa in estensione senza ruotare", "Torna e alterna i lati"],
      muscleGroupPrimary: "CORE", muscleGroupsSecondary: ["GLUTES","BACK"],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "BALANCE", caloriesPerMinute: 3,
      professionalNotes: "La schiena che si inarca o il bacino che ruota annullano il beneficio anti-rotazione. Movimento lento.",
      tags: ["postura","riabilitazione","core","glutei","schiena","corpo-libero","principiante","casa","low-impact","core-anti-rotazione","riscaldamento"],
    },
    {
      name: "Cat-Cow", slug: "cat-cow",
      description: "Mobilizzazione dolce della colonna in flesso-estensione, ideale per riscaldamento e salute della schiena.",
      instructions: ["In quadrupedia, mani sotto le spalle", "Inspira inarcando la schiena e guardando avanti (cow)", "Espira arrotondando la colonna e portando il mento al petto (cat)", "Muoviti lentamente seguendo il respiro", "Mobilizza tutta la colonna"],
      muscleGroupPrimary: "CORE", muscleGroupsSecondary: ["BACK"],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "FLEXIBILITY", caloriesPerMinute: 2,
      professionalNotes: "Movimento dolce e controllato, mai forzato. Ottimo per riscaldamento e defaticamento.",
      tags: ["mobilita","postura","riabilitazione","core","schiena","corpo-libero","principiante","casa","low-impact","riscaldamento","defaticamento"],
    },
    {
      name: "Stretch Flessori dell'Anca", slug: "hip-flexor-stretch",
      description: "Allungamento dei flessori dell'anca, utile contro la rigidità da sedentarietà e per la postura.",
      instructions: ["In affondo con ginocchio posteriore a terra", "Spingi delicatamente il bacino in avanti", "Mantieni il busto eretto", "Senti l'allungamento sulla parte anteriore dell'anca", "Mantieni e cambia lato"],
      muscleGroupPrimary: "QUADRICEPS", muscleGroupsSecondary: ["GLUTES"],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "FLEXIBILITY", caloriesPerMinute: 2,
      professionalNotes: "Allungamento graduale senza rimbalzi. Non forzare oltre la tensione confortevole.",
      tags: ["mobilita","postura","riabilitazione","gambe","corpo-libero","principiante","casa","low-impact","defaticamento"],
    },
    {
      name: "Stretch Ischiocrurali", slug: "hamstring-stretch",
      description: "Allungamento dei femorali per migliorare la flessibilità del posterior chain e ridurre la tensione lombare.",
      instructions: ["Seduto o in piedi, una gamba estesa", "Fai cerniera d'anca portando il busto verso il piede", "Mantieni la colonna il più neutra possibile", "Senti l'allungamento dietro la coscia", "Mantieni senza molleggiare"],
      muscleGroupPrimary: "HAMSTRINGS", muscleGroupsSecondary: ["BACK"],
      difficulty: "BEGINNER", equipment: ["NONE"], category: "FLEXIBILITY", caloriesPerMinute: 2,
      professionalNotes: "Piegare dall'anca, non arrotondando la schiena. Allungamento statico senza rimbalzi.",
      tags: ["mobilita","postura","riabilitazione","femorali","schiena","corpo-libero","principiante","casa","low-impact","defaticamento"],
    },
  ];

  const durations: Record<string, number> = {
    "plank": 25, "plank-laterale": 25, "hip-thrust": 25,
    "curl-bicipiti": 15, "lateral-raise": 15, "tricipiti-cavi": 15, "face-pull": 15, "crunch": 15, "trazioni": 15,
    // Tenute statiche e stretch: finestra di analisi più lunga
    "wall-sit": 30, "glute-bridge": 25, "bird-dog": 25, "cat-cow": 25,
    "hip-flexor-stretch": 30, "hamstring-stretch": 30,
    // Isolamento leggero
    "hammer-curl": 15, "front-raise": 15, "leg-extension": 15, "leg-curl": 15, "calf-raise": 15
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
