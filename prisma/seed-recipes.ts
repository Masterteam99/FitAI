// File: prisma/seed-recipes.ts
//
// Ricette curate a mano per la sezione Nutrizione — pensate per chi si allena e
// vuole aumentare la massa magra a discapito di quella grassa: alte in proteine,
// caloricamente controllate, con grammature reali e passaggi di preparazione.
// Coprono le diverse diete (onnivora, vegetariana, vegana, chetogenica,
// mediterranea) e i pasti principali, con qualche spunto meno scontato oltre ai
// soliti "pollo e riso". Nessuna foto inclusa (vedi nota in COSE_DA_FARE.md):
// il campo `imageUrl` va compilato a mano dall'Admin quando si ha una foto reale
// del piatto, per evitare di usare immagini prese da altri siti senza permesso.

export interface CuratedRecipeSeed {
  title: string;
  description: string;
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | null;
  dietType: "onnivora" | "vegetariana" | "vegana" | "chetogenica" | "mediterranea" | null;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  ingredients: string[];
  steps: string[];
  tags: string[];
}

export const RECIPES: CuratedRecipeSeed[] = [
  {
    title: "Bowl di pollo, quinoa e verdure grigliate",
    description: "Il classico bowl da meal-prep, ma con verdure grigliate al posto del solito vapore: più sapore, stesse macro pulite.",
    mealType: "LUNCH",
    dietType: "onnivora",
    calories: 480, proteinG: 48, carbsG: 35, fatG: 14,
    ingredients: [
      "150g petto di pollo",
      "60g quinoa (peso a crudo)",
      "100g zucchine",
      "100g peperoni misti",
      "1 cucchiaio di olio EVO (10g)",
      "Succo di mezzo limone",
      "Sale, pepe, paprika affumicata q.b.",
    ],
    steps: [
      "Sciacqua la quinoa e cuocila in acqua salata per 12-15 minuti, poi scolala.",
      "Taglia zucchine e peperoni a listarelle e grigliali in padella con un filo d'olio per 6-8 minuti.",
      "Condisci il petto di pollo con paprika, sale e pepe, poi griglialo 5-6 minuti per lato finché è cotto.",
      "Taglia il pollo a fette e componi il bowl con quinoa, verdure e pollo.",
      "Completa con succo di limone e un filo d'olio a crudo.",
    ],
    tags: ["proteica", "meal-prep", "senza glutine"],
  },
  {
    title: "Salmone al forno con patate dolci e broccoli",
    description: "Una teglia unica, pochi passaggi: il salmone resta morbido e le patate dolci danno un tocco più goloso del solito riso.",
    mealType: "DINNER",
    dietType: "mediterranea",
    calories: 520, proteinG: 38, carbsG: 40, fatG: 22,
    ingredients: [
      "150g filetto di salmone",
      "200g patata dolce",
      "150g broccoli",
      "1 cucchiaio di olio EVO (10g)",
      "1 spicchio d'aglio, rosmarino, sale, pepe q.b.",
    ],
    steps: [
      "Scalda il forno a 200°C.",
      "Taglia la patata dolce a cubetti, condiscila con olio, sale e rosmarino e inforna 20 minuti.",
      "Aggiungi alla teglia i broccoli a cimette e il salmone, condisci con sale, pepe e l'aglio schiacciato.",
      "Inforna altri 15 minuti finché il salmone è cotto e le verdure sono morbide.",
    ],
    tags: ["omega-3", "senza glutine", "teglia unica"],
  },
  {
    title: "Frittata di albumi con spinaci e feta",
    description: "Colazione salata ad altissimo contenuto proteico e bassissimo in grassi — la feta basta a dare sapore senza appesantire.",
    mealType: "BREAKFAST",
    dietType: "vegetariana",
    calories: 260, proteinG: 32, carbsG: 5, fatG: 11,
    ingredients: [
      "200g albumi d'uovo (circa 6 albumi)",
      "1 uovo intero",
      "80g spinaci freschi",
      "30g feta sbriciolata",
      "Sale, pepe, origano q.b.",
    ],
    steps: [
      "Salta velocemente gli spinaci in padella antiaderente finché appassiscono.",
      "Sbatti albumi e uovo intero con sale e pepe.",
      "Versa il composto sugli spinaci in padella, aggiungi la feta sbriciolata.",
      "Cuoci a fuoco medio-basso con coperchio per 6-8 minuti finché rappresa.",
    ],
    tags: ["colazione salata", "basso in carboidrati"],
  },
  {
    title: "Tonno scottato con insalata di lenticchie",
    description: "Il tonno scottato (non stracotto) resta morbido e succoso — un'alternativa più \"da ristorante\" al solito tonno in scatola.",
    mealType: "LUNCH",
    dietType: "onnivora",
    calories: 430, proteinG: 44, carbsG: 30, fatG: 15,
    ingredients: [
      "150g tonno fresco (trancio)",
      "150g lenticchie cotte",
      "50g pomodorini",
      "30g rucola",
      "1 cucchiaio di olio EVO (10g)",
      "Succo di limone, sale, pepe q.b.",
    ],
    steps: [
      "Scalda bene una padella antiaderente.",
      "Condisci il tonno con sale e pepe e scottalo 1-2 minuti per lato: deve restare rosa al centro.",
      "In una ciotola unisci lenticchie, pomodorini tagliati e rucola.",
      "Condisci l'insalata con olio e limone, affetta il tonno e adagialo sopra.",
    ],
    tags: ["senza glutine", "ricco di ferro"],
  },
  {
    title: "Bowl di tacchino, riso basmati ed edamame",
    description: "Un bowl in stile asiatico che rompe la monotonia del pollo — zenzero fresco e sesamo cambiano completamente il profilo di gusto.",
    mealType: "LUNCH",
    dietType: "onnivora",
    calories: 490, proteinG: 45, carbsG: 55, fatG: 9,
    ingredients: [
      "150g fesa di tacchino a fettine",
      "70g riso basmati (peso a crudo)",
      "80g edamame sgusciati",
      "50g carote a julienne",
      "1 cucchiaino di salsa di soia (5g)",
      "Zenzero fresco, semi di sesamo q.b.",
    ],
    steps: [
      "Cuoci il riso basmati secondo i tempi indicati in confezione.",
      "Lessa gli edamame per 4-5 minuti in acqua salata.",
      "Taglia il tacchino a listarelle e saltalo in padella con zenzero fresco grattugiato per 6-7 minuti.",
      "Componi il bowl con riso, tacchino, edamame e carote, completa con salsa di soia e semi di sesamo.",
    ],
    tags: ["meal-prep", "ispirazione asiatica"],
  },
  {
    title: "Polpette di manzo magro con purè di cavolfiore",
    description: "Comfort food che sembra una \"cheat meal\" ma non lo è: il purè di cavolfiore al posto della patata taglia i carboidrati senza far rimpiangere nulla.",
    mealType: "DINNER",
    dietType: "onnivora",
    calories: 470, proteinG: 46, carbsG: 14, fatG: 24,
    ingredients: [
      "200g manzo macinato magro (5% grassi)",
      "1 uovo",
      "20g pangrattato",
      "300g cavolfiore",
      "20g parmigiano grattugiato",
      "Prezzemolo, aglio, sale, pepe q.b.",
    ],
    steps: [
      "Cuoci il cavolfiore a vapore per 12-15 minuti finché tenero.",
      "Frulla il cavolfiore con il parmigiano e un filo d'olio fino a ottenere un purè cremoso.",
      "Unisci carne, uovo, pangrattato, prezzemolo e aglio tritato; forma delle polpette.",
      "Cuoci le polpette in padella antiaderente 8-10 minuti, girandole spesso.",
      "Servi le polpette sul purè di cavolfiore.",
    ],
    tags: ["basso in carboidrati", "comfort food"],
  },
  {
    title: "Dal di lenticchie rosse con riso integrale",
    description: "Un piatto unico vegano molto diffuso nella cucina indiana, ricco di proteine e fibre — le spezie lo rendono tutt'altro che \"anonimo\".",
    mealType: "DINNER",
    dietType: "vegana",
    calories: 520, proteinG: 24, carbsG: 78, fatG: 12,
    ingredients: [
      "150g lenticchie rosse decorticate (peso a crudo)",
      "60g riso integrale (peso a crudo)",
      "200ml latte di cocco light",
      "1 cipolla piccola",
      "Curcuma, cumino, zenzero, aglio q.b.",
      "150g spinaci freschi",
    ],
    steps: [
      "Cuoci il riso integrale secondo i tempi indicati in confezione.",
      "Soffriggi cipolla, aglio e zenzero tritati con le spezie per 2 minuti.",
      "Aggiungi le lenticchie sciacquate e il latte di cocco, copri con acqua e cuoci 20 minuti mescolando ogni tanto.",
      "Unisci gli spinaci negli ultimi 3 minuti di cottura finché appassiscono.",
      "Servi il dal ben caldo sul riso integrale.",
    ],
    tags: ["vegana", "ricca di fibre", "speziata"],
  },
  {
    title: "Ceci speziati con yogurt greco e quinoa",
    description: "I ceci saltati in padella con le spezie diventano leggermente croccanti fuori e morbidi dentro — molto più interessanti dei soliti ceci in scatola.",
    mealType: "LUNCH",
    dietType: "vegetariana",
    calories: 450, proteinG: 24, carbsG: 62, fatG: 12,
    ingredients: [
      "200g ceci cotti",
      "60g quinoa (peso a crudo)",
      "100g yogurt greco 0%",
      "50g cetrioli",
      "Cumino, paprika, olio EVO, limone q.b.",
    ],
    steps: [
      "Cuoci la quinoa e lasciala raffreddare.",
      "Scola i ceci, condiscili con cumino, paprika e un filo d'olio e falli saltare in padella 5 minuti finché leggermente croccanti.",
      "Componi il bowl con quinoa, ceci speziati e cetrioli a cubetti.",
      "Completa con una cucchiaiata di yogurt greco e succo di limone.",
    ],
    tags: ["vegetariana", "proteica", "fresca"],
  },
  {
    title: "Tofu strapazzato con verdure e avena salata",
    description: "La curcuma dà al tofu sbriciolato lo stesso colore delle uova strapazzate — un'alternativa vegana che sorprende chi non l'ha mai provata.",
    mealType: "BREAKFAST",
    dietType: "vegana",
    calories: 380, proteinG: 26, carbsG: 35, fatG: 15,
    ingredients: [
      "150g tofu al naturale",
      "50g avena in fiocchi",
      "150ml bevanda vegetale non zuccherata",
      "50g pomodorini",
      "30g spinaci",
      "Curcuma, paprika, sale, pepe q.b.",
    ],
    steps: [
      "Cuoci l'avena nella bevanda vegetale con un pizzico di sale per 5 minuti, come un porridge salato.",
      "Sbriciola il tofu con una forchetta e saltalo in padella con curcuma e paprika per 5 minuti.",
      "Aggiungi pomodorini e spinaci e cuoci altri 3 minuti finché appassiscono.",
      "Servi il tofu strapazzato sull'avena salata.",
    ],
    tags: ["vegana", "colazione salata", "senza lattosio"],
  },
  {
    title: "Buddha bowl di tempeh, quinoa e verdure",
    description: "Il tempeh marinato e grigliato ha una consistenza più \"masticabile\" del tofu — buona base proteica vegana con grassi buoni dall'avocado.",
    mealType: "LUNCH",
    dietType: "vegana",
    calories: 560, proteinG: 32, carbsG: 48, fatG: 28,
    ingredients: [
      "150g tempeh",
      "60g quinoa (peso a crudo)",
      "100g cavolo rosso",
      "100g carote",
      "1/2 avocado",
      "1 cucchiaio di salsa tahina (15g), limone, salsa di soia q.b.",
    ],
    steps: [
      "Cuoci la quinoa e lasciala intiepidire.",
      "Taglia il tempeh a fette e marinalo con salsa di soia per 5 minuti, poi grigliane 3-4 minuti per lato.",
      "Taglia cavolo rosso e carote a julienne fine.",
      "Componi il bowl con quinoa, tempeh, verdure crude e avocado a fette.",
      "Completa con una salsa di tahina, limone e un cucchiaio d'acqua per allungarla.",
    ],
    tags: ["vegana", "bowl colorata", "grassi buoni"],
  },
  {
    title: "Porridge proteico con frutti di bosco e semi di chia",
    description: "Colazione dolce che scalda quanto un porridge classico ma con molte più proteine — ottima anche come spuntino pre-allenamento.",
    mealType: "BREAKFAST",
    dietType: "vegana",
    calories: 390, proteinG: 30, carbsG: 48, fatG: 9,
    ingredients: [
      "50g fiocchi d'avena",
      "1 misurino (25g) di proteine vegetali in polvere, gusto vaniglia",
      "200ml bevanda vegetale non zuccherata",
      "80g frutti di bosco misti",
      "1 cucchiaio di semi di chia (10g)",
    ],
    steps: [
      "Cuoci i fiocchi d'avena nella bevanda vegetale a fuoco basso per 5 minuti, mescolando spesso.",
      "Togli dal fuoco e incorpora le proteine in polvere mescolando bene finché si sciolgono.",
      "Versa in una ciotola e completa con frutti di bosco e semi di chia.",
    ],
    tags: ["vegana", "colazione dolce", "pre-allenamento"],
  },
  {
    title: "Salmone al burro con asparagi e avocado",
    description: "Pochi ingredienti, grassi di qualità, zero carboidrati: un classico keto che non sacrifica il gusto.",
    mealType: "DINNER",
    dietType: "chetogenica",
    calories: 560, proteinG: 36, carbsG: 8, fatG: 42,
    ingredients: [
      "150g filetto di salmone",
      "150g asparagi",
      "1/2 avocado",
      "15g burro",
      "Limone, sale, pepe q.b.",
    ],
    steps: [
      "Cuoci gli asparagi al vapore per 6-7 minuti.",
      "Sciogli il burro in padella e rosola il salmone 4 minuti per lato finché dorato.",
      "Servi il salmone con gli asparagi e mezzo avocado a fette.",
      "Completa con succo di limone, sale e pepe.",
    ],
    tags: ["chetogenica", "basso in carboidrati", "omega-3"],
  },
  {
    title: "Uova strapazzate con pancetta e spinaci",
    description: "La colazione keto per eccellenza — pronta in dieci minuti, sazia a lungo grazie ai grassi.",
    mealType: "BREAKFAST",
    dietType: "chetogenica",
    calories: 430, proteinG: 26, carbsG: 4, fatG: 34,
    ingredients: [
      "3 uova intere",
      "40g pancetta a cubetti",
      "60g spinaci freschi",
      "15g burro",
      "Sale, pepe q.b.",
    ],
    steps: [
      "Rosola la pancetta in padella finché croccante, poi mettila da parte.",
      "Nella stessa padella sciogli il burro e appassisci gli spinaci per 2 minuti.",
      "Sbatti le uova con sale e pepe, versale in padella e strapazzale a fuoco medio-basso.",
      "Unisci di nuovo la pancetta e servi caldo.",
    ],
    tags: ["chetogenica", "colazione salata", "senza carboidrati"],
  },
  {
    title: "Insalata di pollo, ceci, feta e olive",
    description: "Un piatto unico mediterraneo senza cottura extra oltre al pollo — perfetto da preparare la sera prima e portare fuori casa.",
    mealType: "LUNCH",
    dietType: "mediterranea",
    calories: 500, proteinG: 44, carbsG: 35, fatG: 20,
    ingredients: [
      "150g petto di pollo grigliato",
      "150g ceci cotti",
      "40g feta",
      "40g olive taggiasche",
      "50g pomodorini",
      "Origano, 1 cucchiaio di olio EVO (10g), limone q.b.",
    ],
    steps: [
      "Griglia il petto di pollo con origano, sale e pepe, poi taglialo a listarelle.",
      "In una ciotola capiente unisci ceci, pomodorini tagliati a metà e olive.",
      "Aggiungi il pollo e la feta sbriciolata.",
      "Condisci con olio EVO, succo di limone e origano fresco.",
    ],
    tags: ["mediterranea", "meal-prep", "fresca"],
  },
];
