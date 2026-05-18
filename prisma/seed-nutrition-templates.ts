// File: prisma/seed-nutrition-templates.ts

export type DietType = "onnivora" | "vegetariana" | "vegana" | "chetogenica" | "mediterranea" | "altro";

export type FitnessGoal =
  | "LOSE_WEIGHT" | "BUILD_MUSCLE" | "ENDURANCE"
  | "FLEXIBILITY" | "GENERAL_FITNESS" | "ATHLETIC_PERFORMANCE";

export type DayName = "lunedi" | "martedi" | "mercoledi" | "giovedi" | "venerdi" | "sabato" | "domenica";

export interface MacroTargets {
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface IngredientData {
  food: string;
  quantityG: number;
}

export interface MealData {
  name: string;
  ingredients: IngredientData[];
  preparationNotes?: string;
  estimatedKcal: number;
  estimatedProteinG: number;
  estimatedCarbsG: number;
  estimatedFatG: number;
}

export interface DailyMealsData {
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
  snacks: MealData[];
}

export interface NutritionTemplateData {
  name: string;
  description: string;
  dietType: DietType;
  targetGoal: FitnessGoal;
  estimatedTargetProfile: {
    weightKg: number;
    heightCm: number;
    age: number;
    gender: "M" | "F";
    activityLevel: "sedentario" | "leggero" | "moderato" | "intenso";
  };
  targetMacros: MacroTargets;
  weeklyPlan: Record<DayName, DailyMealsData>;
  rationale: string;
  notes?: string;
}

export const NUTRITION_TEMPLATES: NutritionTemplateData[] = [

  // ─── TEMPLATE 1 ─── Mediterraneo Mantenimento 2200 kcal
  // BMR uomo 75kg/175cm/30a = 10×75 + 6.25×175 − 5×30 + 5 = 750+1093.75−150+5 = 1698.75
  // TDEE leggero = 1698.75 × 1.375 = ~2336 → arrotondato a 2200 (mantenimento conservativo)
  // Target: 130g proteine (1.73g/kg), 250g carbo, 80g grassi
  {
    name: "Mediterraneo Mantenimento 2200 kcal",
    description: "Piano mediterraneo bilanciato per uomo medio con attività lavorativa leggera. Focus su pesce, olio EVO, legumi, cereali integrali, frutta e verdura stagionale.",
    dietType: "mediterranea",
    targetGoal: "GENERAL_FITNESS",
    estimatedTargetProfile: {
      weightKg: 75, heightCm: 175, age: 30, gender: "M", activityLevel: "leggero",
    },
    targetMacros: { kcal: 2200, proteinG: 130, carbsG: 250, fatG: 80 },
    weeklyPlan: {
      lunedi: {
        breakfast: {
          name: "Yogurt greco con avena, miele e frutti di bosco",
          ingredients: [
            { food: "yogurt greco bianco 0%", quantityG: 200 },
            { food: "avena in fiocchi", quantityG: 50 },
            { food: "miele", quantityG: 15 },
            { food: "mirtilli freschi", quantityG: 80 },
            { food: "mandorle a lamelle", quantityG: 15 },
          ],
          preparationNotes: "Mescola yogurt e avena, lascia riposare 5 minuti. Aggiungi miele, mirtilli e mandorle.",
          estimatedKcal: 530, estimatedProteinG: 28, estimatedCarbsG: 68, estimatedFatG: 14,
        },
        lunch: {
          name: "Pasta integrale al tonno con pomodori e olive",
          ingredients: [
            { food: "pasta integrale", quantityG: 90 },
            { food: "tonno al naturale sgocciolato", quantityG: 100 },
            { food: "pomodori pelati", quantityG: 200 },
            { food: "olive nere denocciolate", quantityG: 30 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
            { food: "basilico fresco", quantityG: 5 },
          ],
          preparationNotes: "Cuoci la pasta al dente. Scalda pomodori con olio, aggiungi tonno e olive. Manteca e completa con basilico.",
          estimatedKcal: 720, estimatedProteinG: 38, estimatedCarbsG: 85, estimatedFatG: 24,
        },
        dinner: {
          name: "Salmone al forno con patate e zucchine",
          ingredients: [
            { food: "filetto di salmone", quantityG: 150 },
            { food: "patate", quantityG: 200 },
            { food: "zucchine", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
            { food: "rosmarino", quantityG: 2 },
          ],
          preparationNotes: "Inforna patate a tocchetti 25 min a 200°C. Aggiungi salmone e zucchine, cuoci altri 15 minuti.",
          estimatedKcal: 610, estimatedProteinG: 40, estimatedCarbsG: 52, estimatedFatG: 26,
        },
        snacks: [
          {
            name: "Mela e mandorle",
            ingredients: [
              { food: "mela", quantityG: 180 },
              { food: "mandorle", quantityG: 25 },
            ],
            estimatedKcal: 240, estimatedProteinG: 6, estimatedCarbsG: 28, estimatedFatG: 14,
          },
        ],
      },
      martedi: {
        breakfast: {
          name: "Pane integrale con uova strapazzate e pomodoro",
          ingredients: [
            { food: "pane integrale", quantityG: 80 },
            { food: "uova intere", quantityG: 150 },
            { food: "pomodoro a fette", quantityG: 100 },
            { food: "olio extravergine d'oliva", quantityG: 8 },
          ],
          preparationNotes: "Strapazza le uova in padella con un filo d'olio. Servi sul pane con il pomodoro a parte.",
          estimatedKcal: 500, estimatedProteinG: 28, estimatedCarbsG: 45, estimatedFatG: 20,
        },
        lunch: {
          name: "Riso integrale con legumi e verdure grigliate",
          ingredients: [
            { food: "riso integrale", quantityG: 80 },
            { food: "fagioli cannellini lessati", quantityG: 120 },
            { food: "peperone grigliato", quantityG: 120 },
            { food: "melanzane grigliate", quantityG: 100 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 680, estimatedProteinG: 26, estimatedCarbsG: 100, estimatedFatG: 16,
        },
        dinner: {
          name: "Petto di pollo alla griglia con insalata e pane",
          ingredients: [
            { food: "petto di pollo", quantityG: 180 },
            { food: "insalata mista", quantityG: 150 },
            { food: "pane integrale", quantityG: 50 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
            { food: "limone", quantityG: 30 },
          ],
          estimatedKcal: 560, estimatedProteinG: 46, estimatedCarbsG: 32, estimatedFatG: 20,
        },
        snacks: [
          {
            name: "Yogurt greco e noci",
            ingredients: [
              { food: "yogurt greco bianco 0%", quantityG: 150 },
              { food: "noci sgusciate", quantityG: 20 },
            ],
            estimatedKcal: 250, estimatedProteinG: 18, estimatedCarbsG: 8, estimatedFatG: 16,
          },
        ],
      },
      mercoledi: {
        breakfast: {
          name: "Avena con latte, banana e cioccolato fondente",
          ingredients: [
            { food: "avena in fiocchi", quantityG: 60 },
            { food: "latte parzialmente scremato", quantityG: 200 },
            { food: "banana matura", quantityG: 100 },
            { food: "cioccolato fondente 85%", quantityG: 15 },
          ],
          estimatedKcal: 510, estimatedProteinG: 18, estimatedCarbsG: 78, estimatedFatG: 14,
        },
        lunch: {
          name: "Insalata di farro con tonno, cetrioli e pomodori",
          ingredients: [
            { food: "farro perlato cotto", quantityG: 180 },
            { food: "tonno al naturale sgocciolato", quantityG: 100 },
            { food: "pomodori ciliegino", quantityG: 100 },
            { food: "cetriolo", quantityG: 80 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
            { food: "origano essiccato", quantityG: 2 },
          ],
          estimatedKcal: 660, estimatedProteinG: 38, estimatedCarbsG: 80, estimatedFatG: 18,
        },
        dinner: {
          name: "Merluzzo al vapore con lenticchie e spinaci",
          ingredients: [
            { food: "filetto di merluzzo", quantityG: 180 },
            { food: "lenticchie lessate", quantityG: 150 },
            { food: "spinaci freschi", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
            { food: "aglio", quantityG: 5 },
          ],
          preparationNotes: "Cuoci il merluzzo al vapore 12 minuti. Salta gli spinaci con aglio e olio. Servi sulle lenticchie tiepide.",
          estimatedKcal: 580, estimatedProteinG: 50, estimatedCarbsG: 40, estimatedFatG: 16,
        },
        snacks: [
          {
            name: "Frutta secca e fresca mista",
            ingredients: [
              { food: "arancia", quantityG: 200 },
              { food: "pistacchi sgusciati", quantityG: 20 },
            ],
            estimatedKcal: 220, estimatedProteinG: 5, estimatedCarbsG: 30, estimatedFatG: 8,
          },
        ],
      },
      giovedi: {
        breakfast: {
          name: "Ricotta con miele, noci e frutta fresca",
          ingredients: [
            { food: "ricotta vaccina", quantityG: 150 },
            { food: "miele", quantityG: 15 },
            { food: "noci sgusciate", quantityG: 20 },
            { food: "pesca fresca", quantityG: 150 },
          ],
          estimatedKcal: 480, estimatedProteinG: 20, estimatedCarbsG: 45, estimatedFatG: 22,
        },
        lunch: {
          name: "Pasta al pesto con fagiolini e patate",
          ingredients: [
            { food: "pasta di semola", quantityG: 90 },
            { food: "pesto di basilico", quantityG: 30 },
            { food: "fagiolini lessati", quantityG: 100 },
            { food: "patate lesse", quantityG: 80 },
            { food: "parmigiano grattugiato", quantityG: 15 },
          ],
          estimatedKcal: 740, estimatedProteinG: 24, estimatedCarbsG: 98, estimatedFatG: 26,
        },
        dinner: {
          name: "Petto di tacchino alla piastra con verdure e feta",
          ingredients: [
            { food: "petto di tacchino", quantityG: 180 },
            { food: "peperoni misti arrostiti", quantityG: 150 },
            { food: "feta", quantityG: 40 },
            { food: "olio extravergine d'oliva", quantityG: 8 },
          ],
          estimatedKcal: 560, estimatedProteinG: 48, estimatedCarbsG: 14, estimatedFatG: 26,
        },
        snacks: [
          {
            name: "Crackers integrali con hummus",
            ingredients: [
              { food: "crackers integrali", quantityG: 30 },
              { food: "hummus di ceci", quantityG: 80 },
            ],
            estimatedKcal: 250, estimatedProteinG: 8, estimatedCarbsG: 30, estimatedFatG: 10,
          },
        ],
      },
      venerdi: {
        breakfast: {
          name: "Toast integrale con avocado e uovo in camicia",
          ingredients: [
            { food: "pane integrale tostato", quantityG: 80 },
            { food: "avocado maturo", quantityG: 80 },
            { food: "uovo intero", quantityG: 55 },
            { food: "limone", quantityG: 10 },
          ],
          estimatedKcal: 500, estimatedProteinG: 18, estimatedCarbsG: 42, estimatedFatG: 26,
        },
        lunch: {
          name: "Zuppa di legumi misti con pane integrale",
          ingredients: [
            { food: "ceci lessati", quantityG: 100 },
            { food: "fagioli borlotti lessati", quantityG: 80 },
            { food: "lenticchie lessate", quantityG: 80 },
            { food: "pomodori pelati", quantityG: 150 },
            { food: "pane integrale", quantityG: 60 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 670, estimatedProteinG: 30, estimatedCarbsG: 95, estimatedFatG: 16,
        },
        dinner: {
          name: "Orata al forno con patate alle erbe aromatiche",
          ingredients: [
            { food: "orata intera eviscerata", quantityG: 300 },
            { food: "patate", quantityG: 180 },
            { food: "pomodori ciliegino", quantityG: 80 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
            { food: "rosmarino e timo", quantityG: 3 },
          ],
          preparationNotes: "Inforna patate 20 min a 200°C. Aggiungi orata con pomodori e aromi. Cuoci altri 25 minuti.",
          estimatedKcal: 620, estimatedProteinG: 48, estimatedCarbsG: 45, estimatedFatG: 24,
        },
        snacks: [
          {
            name: "Cioccolato fondente e mandorle",
            ingredients: [
              { food: "cioccolato fondente 85%", quantityG: 20 },
              { food: "mandorle", quantityG: 20 },
            ],
            estimatedKcal: 220, estimatedProteinG: 5, estimatedCarbsG: 10, estimatedFatG: 18,
          },
        ],
      },
      sabato: {
        breakfast: {
          name: "Pancakes di avena con frutti rossi e sciroppo d'acero",
          ingredients: [
            { food: "avena in fiocchi", quantityG: 70 },
            { food: "uova intere", quantityG: 100 },
            { food: "latte parzialmente scremato", quantityG: 100 },
            { food: "frutti di bosco misti", quantityG: 100 },
            { food: "sciroppo d'acero", quantityG: 20 },
          ],
          preparationNotes: "Frulla avena, uova e latte. Cuoci i pancakes in padella antiaderente. Servi con frutti di bosco e sciroppo.",
          estimatedKcal: 580, estimatedProteinG: 26, estimatedCarbsG: 80, estimatedFatG: 16,
        },
        lunch: {
          name: "Pizza integrale con mozzarella, pomodoro e verdure",
          ingredients: [
            { food: "base pizza integrale artigianale", quantityG: 150 },
            { food: "mozzarella fior di latte", quantityG: 80 },
            { food: "passata di pomodoro", quantityG: 80 },
            { food: "peperoni e zucchine grigliate", quantityG: 120 },
            { food: "olio extravergine d'oliva", quantityG: 8 },
          ],
          estimatedKcal: 680, estimatedProteinG: 32, estimatedCarbsG: 82, estimatedFatG: 22,
        },
        dinner: {
          name: "Tagliata di manzo con rucola e parmigiano",
          ingredients: [
            { food: "controfiletto di manzo", quantityG: 200 },
            { food: "rucola fresca", quantityG: 60 },
            { food: "parmigiano in scaglie", quantityG: 20 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
            { food: "limone", quantityG: 20 },
          ],
          preparationNotes: "Cuoci il controfiletto alla piastra 3-4 min per lato. Affetta, disponi su rucola e completa con parmigiano e olio.",
          estimatedKcal: 620, estimatedProteinG: 50, estimatedCarbsG: 4, estimatedFatG: 42,
        },
        snacks: [
          {
            name: "Frutta fresca di stagione",
            ingredients: [
              { food: "mela", quantityG: 150 },
              { food: "pera", quantityG: 130 },
            ],
            estimatedKcal: 180, estimatedProteinG: 2, estimatedCarbsG: 44, estimatedFatG: 1,
          },
        ],
      },
      domenica: {
        breakfast: {
          name: "Granola artigianale con yogurt e miele",
          ingredients: [
            { food: "avena tostata con frutta secca", quantityG: 60 },
            { food: "yogurt greco bianco 0%", quantityG: 200 },
            { food: "miele", quantityG: 15 },
            { food: "fragole fresche", quantityG: 100 },
          ],
          estimatedKcal: 510, estimatedProteinG: 24, estimatedCarbsG: 72, estimatedFatG: 12,
        },
        lunch: {
          name: "Risotto ai funghi porcini con prezzemolo",
          ingredients: [
            { food: "riso carnaroli", quantityG: 90 },
            { food: "funghi porcini secchi reidratati", quantityG: 30 },
            { food: "funghi champignon freschi", quantityG: 150 },
            { food: "parmigiano grattugiato", quantityG: 20 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
            { food: "brodo vegetale", quantityG: 300 },
          ],
          preparationNotes: "Toasta il riso, sfuma con poco vino bianco se disponibile. Aggiungi brodo a mestoli. Manteca con parmigiano e olio.",
          estimatedKcal: 680, estimatedProteinG: 22, estimatedCarbsG: 92, estimatedFatG: 20,
        },
        dinner: {
          name: "Trota al vapore con lenticchie e verdure di stagione",
          ingredients: [
            { food: "trota salmonata", quantityG: 200 },
            { food: "lenticchie lessate", quantityG: 150 },
            { food: "carote e sedano saltati", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
          ],
          estimatedKcal: 580, estimatedProteinG: 48, estimatedCarbsG: 35, estimatedFatG: 20,
        },
        snacks: [
          {
            name: "Noci e uva fresca",
            ingredients: [
              { food: "noci sgusciate", quantityG: 25 },
              { food: "uva", quantityG: 120 },
            ],
            estimatedKcal: 240, estimatedProteinG: 5, estimatedCarbsG: 24, estimatedFatG: 14,
          },
        ],
      },
    },
    rationale: "Calorie a mantenimento (TDEE) per uomo 75kg attività leggera (~2200 kcal). Distribuzione macro mediterranea: 24% proteine, 45% carbo, 31% grassi (di cui oltre il 20% da olio EVO e frutta secca). Pesce 3 volte a settimana, legumi 3 volte, carne rossa max 1 volta, cerali integrali come base carboidratica.",
  },

  // ─── TEMPLATE 2 ─── Vegano Massa 2800 kcal
  // BMR uomo 78kg/180cm/28a = 10×78 + 6.25×180 − 5×28 + 5 = 780+1125−140+5 = 1770
  // TDEE moderato = 1770 × 1.55 = 2743.5 → surplus 10% = 3017 → arrotondato a 2800
  // Target: 155g proteine (2.0g/kg), 360g carbo, 85g grassi
  {
    name: "Vegano Massa 2800 kcal",
    description: "Piano vegano ipercalorico per aumento di massa muscolare. Proteine da fonti vegetali combinate: legumi, soia, seitan, frutta secca e cereali integrali.",
    dietType: "vegana",
    targetGoal: "BUILD_MUSCLE",
    estimatedTargetProfile: {
      weightKg: 78, heightCm: 180, age: 28, gender: "M", activityLevel: "moderato",
    },
    targetMacros: { kcal: 2800, proteinG: 155, carbsG: 360, fatG: 85 },
    weeklyPlan: {
      lunedi: {
        breakfast: {
          name: "Smoothie proteico vegano con avena e burro di arachidi",
          ingredients: [
            { food: "avena in fiocchi", quantityG: 80 },
            { food: "latte di soia non zuccherato", quantityG: 300 },
            { food: "burro di arachidi naturale", quantityG: 30 },
            { food: "banana matura", quantityG: 120 },
            { food: "proteine in polvere di pisello", quantityG: 30 },
          ],
          preparationNotes: "Frulla tutti gli ingredienti. Aggiungi cubetti di ghiaccio se vuoi una consistenza più densa.",
          estimatedKcal: 760, estimatedProteinG: 42, estimatedCarbsG: 98, estimatedFatG: 22,
        },
        lunch: {
          name: "Riso integrale con tofu saltato e verdure miste",
          ingredients: [
            { food: "riso integrale cotto", quantityG: 250 },
            { food: "tofu compatto", quantityG: 200 },
            { food: "broccoli", quantityG: 150 },
            { food: "peperone rosso", quantityG: 100 },
            { food: "olio di sesamo", quantityG: 10 },
            { food: "salsa di soia senza glutine", quantityG: 15 },
          ],
          preparationNotes: "Pressa il tofu, taglia a cubetti e saltalo in padella. Aggiungi verdure e salsa di soia. Servi sul riso.",
          estimatedKcal: 760, estimatedProteinG: 40, estimatedCarbsG: 105, estimatedFatG: 18,
        },
        dinner: {
          name: "Seitan alla piastra con lenticchie e spinaci",
          ingredients: [
            { food: "seitan", quantityG: 180 },
            { food: "lenticchie lessate", quantityG: 180 },
            { food: "spinaci freschi", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
            { food: "aglio", quantityG: 5 },
          ],
          estimatedKcal: 680, estimatedProteinG: 52, estimatedCarbsG: 60, estimatedFatG: 16,
        },
        snacks: [
          {
            name: "Edamame e mandorle",
            ingredients: [
              { food: "edamame lessati", quantityG: 120 },
              { food: "mandorle", quantityG: 30 },
            ],
            estimatedKcal: 340, estimatedProteinG: 18, estimatedCarbsG: 20, estimatedFatG: 22,
          },
          {
            name: "Frutta e noci",
            ingredients: [
              { food: "banana", quantityG: 120 },
              { food: "noci sgusciate", quantityG: 20 },
            ],
            estimatedKcal: 240, estimatedProteinG: 4, estimatedCarbsG: 30, estimatedFatG: 12,
          },
        ],
      },
      martedi: {
        breakfast: {
          name: "Avena overnight con latte di avena e frutta secca",
          ingredients: [
            { food: "avena in fiocchi", quantityG: 90 },
            { food: "latte di avena non zuccherato", quantityG: 250 },
            { food: "burro di mandorle", quantityG: 25 },
            { food: "mirtilli freschi", quantityG: 80 },
            { food: "semi di chia", quantityG: 15 },
          ],
          preparationNotes: "La sera precedente, mescola tutti gli ingredienti e riponi in frigo. Al mattino aggiungi i mirtilli freschi.",
          estimatedKcal: 700, estimatedProteinG: 20, estimatedCarbsG: 100, estimatedFatG: 26,
        },
        lunch: {
          name: "Pasta di legumi con ragù di soia e verdure",
          ingredients: [
            { food: "pasta di ceci o lenticchie", quantityG: 100 },
            { food: "granulare di soia reidratato", quantityG: 120 },
            { food: "passata di pomodoro", quantityG: 200 },
            { food: "carote e sedano", quantityG: 100 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 760, estimatedProteinG: 48, estimatedCarbsG: 95, estimatedFatG: 18,
        },
        dinner: {
          name: "Ceci alla mediterranea con riso basmati",
          ingredients: [
            { food: "ceci lessati", quantityG: 200 },
            { food: "riso basmati cotto", quantityG: 180 },
            { food: "pomodori pelati", quantityG: 150 },
            { food: "cipolle", quantityG: 60 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
            { food: "paprika e cumino", quantityG: 3 },
          ],
          estimatedKcal: 680, estimatedProteinG: 28, estimatedCarbsG: 110, estimatedFatG: 16,
        },
        snacks: [
          {
            name: "Proteine di pisello con frutta",
            ingredients: [
              { food: "proteine in polvere di pisello", quantityG: 30 },
              { food: "latte di soia", quantityG: 250 },
              { food: "kiwi", quantityG: 100 },
            ],
            estimatedKcal: 320, estimatedProteinG: 28, estimatedCarbsG: 28, estimatedFatG: 8,
          },
        ],
      },
      mercoledi: {
        breakfast: {
          name: "Toast di pane integrale con avocado e semi",
          ingredients: [
            { food: "pane integrale", quantityG: 100 },
            { food: "avocado maturo", quantityG: 120 },
            { food: "semi di girasole", quantityG: 20 },
            { food: "succo di limone", quantityG: 10 },
            { food: "pomodorini", quantityG: 80 },
          ],
          estimatedKcal: 620, estimatedProteinG: 18, estimatedCarbsG: 72, estimatedFatG: 28,
        },
        lunch: {
          name: "Buddha bowl con quinoa, tofu e verdure",
          ingredients: [
            { food: "quinoa cotta", quantityG: 200 },
            { food: "tofu compatto marinato", quantityG: 180 },
            { food: "ceci arrostiti", quantityG: 80 },
            { food: "spinaci freschi", quantityG: 80 },
            { food: "avocado", quantityG: 60 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
          ],
          estimatedKcal: 780, estimatedProteinG: 44, estimatedCarbsG: 90, estimatedFatG: 26,
        },
        dinner: {
          name: "Zuppa di fagioli neri con mais e tortillas",
          ingredients: [
            { food: "fagioli neri lessati", quantityG: 200 },
            { food: "mais lessato", quantityG: 80 },
            { food: "tortillas di mais", quantityG: 60 },
            { food: "pomodori a dadini", quantityG: 100 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
          ],
          estimatedKcal: 640, estimatedProteinG: 28, estimatedCarbsG: 105, estimatedFatG: 14,
        },
        snacks: [
          {
            name: "Shake di soia con banana",
            ingredients: [
              { food: "latte di soia non zuccherato", quantityG: 300 },
              { food: "banana", quantityG: 120 },
              { food: "cacao in polvere non zuccherato", quantityG: 10 },
            ],
            estimatedKcal: 280, estimatedProteinG: 14, estimatedCarbsG: 42, estimatedFatG: 6,
          },
        ],
      },
      giovedi: {
        breakfast: {
          name: "Porridge proteico con frutta secca e sciroppo d'acero",
          ingredients: [
            { food: "avena in fiocchi", quantityG: 80 },
            { food: "latte di soia non zuccherato", quantityG: 300 },
            { food: "proteine in polvere di pisello", quantityG: 25 },
            { food: "mele a cubetti", quantityG: 100 },
            { food: "sciroppo d'acero", quantityG: 15 },
          ],
          estimatedKcal: 680, estimatedProteinG: 34, estimatedCarbsG: 100, estimatedFatG: 12,
        },
        lunch: {
          name: "Seitan grigliato con farro e caponata di verdure",
          ingredients: [
            { food: "seitan", quantityG: 180 },
            { food: "farro perlato cotto", quantityG: 180 },
            { food: "melanzane", quantityG: 100 },
            { food: "zucchine", quantityG: 80 },
            { food: "pomodori", quantityG: 80 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 760, estimatedProteinG: 46, estimatedCarbsG: 90, estimatedFatG: 18,
        },
        dinner: {
          name: "Tofu in padella con tagliatelle di riso e brodo",
          ingredients: [
            { food: "tofu compatto", quantityG: 200 },
            { food: "tagliatelle di riso", quantityG: 100 },
            { food: "bok choy o cavolo cappuccio", quantityG: 150 },
            { food: "olio di sesamo", quantityG: 10 },
            { food: "salsa di soia", quantityG: 15 },
          ],
          estimatedKcal: 680, estimatedProteinG: 32, estimatedCarbsG: 88, estimatedFatG: 20,
        },
        snacks: [
          {
            name: "Burro di arachidi su pane di segale",
            ingredients: [
              { food: "pane di segale", quantityG: 60 },
              { food: "burro di arachidi naturale", quantityG: 30 },
            ],
            estimatedKcal: 360, estimatedProteinG: 12, estimatedCarbsG: 40, estimatedFatG: 16,
          },
        ],
      },
      venerdi: {
        breakfast: {
          name: "Smoothie bowl di mango con granola e cocco",
          ingredients: [
            { food: "mango surgelato", quantityG: 150 },
            { food: "latte di cocco leggero", quantityG: 100 },
            { food: "avena in fiocchi tostata", quantityG: 60 },
            { food: "cocco grattugiato non zuccherato", quantityG: 15 },
            { food: "semi di zucca", quantityG: 20 },
          ],
          estimatedKcal: 640, estimatedProteinG: 14, estimatedCarbsG: 95, estimatedFatG: 22,
        },
        lunch: {
          name: "Hamburger di legumi con patate al forno",
          ingredients: [
            { food: "hamburger di lenticchie artigianale", quantityG: 180 },
            { food: "pane integrale", quantityG: 80 },
            { food: "patate al forno", quantityG: 200 },
            { food: "lattuga e pomodoro", quantityG: 80 },
            { food: "hummus di ceci", quantityG: 40 },
          ],
          estimatedKcal: 800, estimatedProteinG: 36, estimatedCarbsG: 120, estimatedFatG: 18,
        },
        dinner: {
          name: "Curry di ceci e spinaci con riso basmati",
          ingredients: [
            { food: "ceci lessati", quantityG: 200 },
            { food: "spinaci freschi", quantityG: 120 },
            { food: "latte di cocco leggero", quantityG: 100 },
            { food: "riso basmati cotto", quantityG: 200 },
            { food: "pasta di curry rosso", quantityG: 15 },
            { food: "olio di cocco", quantityG: 8 },
          ],
          estimatedKcal: 720, estimatedProteinG: 28, estimatedCarbsG: 110, estimatedFatG: 18,
        },
        snacks: [
          {
            name: "Mix di frutta secca e semi",
            ingredients: [
              { food: "anacardi", quantityG: 20 },
              { food: "arachidi tostati non salati", quantityG: 20 },
              { food: "uvetta", quantityG: 20 },
            ],
            estimatedKcal: 300, estimatedProteinG: 10, estimatedCarbsG: 28, estimatedFatG: 16,
          },
        ],
      },
      sabato: {
        breakfast: {
          name: "Pancakes vegani di banana con sciroppo e mirtilli",
          ingredients: [
            { food: "avena in fiocchi", quantityG: 80 },
            { food: "banana matura", quantityG: 120 },
            { food: "latte di soia", quantityG: 150 },
            { food: "mirtilli freschi", quantityG: 80 },
            { food: "sciroppo d'acero", quantityG: 20 },
          ],
          preparationNotes: "Frulla avena, banana e latte. Cuoci in padella antiaderente senza olio. Servi con mirtilli e sciroppo.",
          estimatedKcal: 680, estimatedProteinG: 20, estimatedCarbsG: 120, estimatedFatG: 10,
        },
        lunch: {
          name: "Pasta integrale con pesto di pistacchi e tofu",
          ingredients: [
            { food: "pasta integrale", quantityG: 100 },
            { food: "tofu seta", quantityG: 150 },
            { food: "pistacchi", quantityG: 30 },
            { food: "basilico fresco", quantityG: 20 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          preparationNotes: "Frulla pistacchi, basilico, tofu seta e olio per il pesto. Manteca con la pasta e poca acqua di cottura.",
          estimatedKcal: 780, estimatedProteinG: 36, estimatedCarbsG: 100, estimatedFatG: 26,
        },
        dinner: {
          name: "Tempeh alla piastra con taboulé di quinoa",
          ingredients: [
            { food: "tempeh", quantityG: 180 },
            { food: "quinoa cotta", quantityG: 200 },
            { food: "pomodori a dadini", quantityG: 80 },
            { food: "prezzemolo fresco", quantityG: 20 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
            { food: "limone", quantityG: 20 },
          ],
          estimatedKcal: 700, estimatedProteinG: 40, estimatedCarbsG: 75, estimatedFatG: 22,
        },
        snacks: [
          {
            name: "Shake proteico vegano post allenamento",
            ingredients: [
              { food: "proteine in polvere di pisello", quantityG: 35 },
              { food: "latte di riso", quantityG: 300 },
              { food: "banana", quantityG: 80 },
            ],
            estimatedKcal: 360, estimatedProteinG: 30, estimatedCarbsG: 52, estimatedFatG: 4,
          },
        ],
      },
      domenica: {
        breakfast: {
          name: "Chia pudding con latte di mandorla e frutta fresca",
          ingredients: [
            { food: "semi di chia", quantityG: 40 },
            { food: "latte di mandorla non zuccherato", quantityG: 300 },
            { food: "fragole fresche", quantityG: 100 },
            { food: "kiwi", quantityG: 80 },
            { food: "sciroppo d'agave", quantityG: 10 },
          ],
          preparationNotes: "La sera prima mescola chia e latte. Al mattino aggiungi la frutta fresca e il dolcificante.",
          estimatedKcal: 560, estimatedProteinG: 14, estimatedCarbsG: 75, estimatedFatG: 22,
        },
        lunch: {
          name: "Minestrone ricco con farro e fagioli",
          ingredients: [
            { food: "fagioli cannellini lessati", quantityG: 150 },
            { food: "farro perlato", quantityG: 80 },
            { food: "patate", quantityG: 100 },
            { food: "carote", quantityG: 80 },
            { food: "zucchine", quantityG: 80 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 680, estimatedProteinG: 28, estimatedCarbsG: 100, estimatedFatG: 16,
        },
        dinner: {
          name: "Stufato di seitan e verdure invernali",
          ingredients: [
            { food: "seitan", quantityG: 200 },
            { food: "patate dolci", quantityG: 150 },
            { food: "cavolfiore", quantityG: 150 },
            { food: "passata di pomodoro", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 680, estimatedProteinG: 46, estimatedCarbsG: 65, estimatedFatG: 16,
        },
        snacks: [
          {
            name: "Hummus con bastoncini di verdura e pane",
            ingredients: [
              { food: "hummus di ceci", quantityG: 80 },
              { food: "carote e sedano a bastoncini", quantityG: 100 },
              { food: "pane integrale", quantityG: 40 },
            ],
            estimatedKcal: 310, estimatedProteinG: 12, estimatedCarbsG: 40, estimatedFatG: 10,
          },
        ],
      },
    },
    rationale: "Surplus calorico del 10% sul TDEE per supportare l'ipertrofia. Proteine a 2g/kg distribuite su 4-5 momenti della giornata tramite combinazione complementare di legumi, cereali, soia e seitan. Grassi prevalentemente insaturi da frutta secca, olio EVO e avocado.",
    notes: "Integrare con vitamina B12 (almeno 2.5 mcg/die), vitamina D3 vegana e omega-3 da alghe (EPA+DHA). Verificare periodicamente i livelli di ferro e zinco con esami del sangue.",
  },

  // ─── TEMPLATE 3 ─── Chetogenica Dimagrimento 1700 kcal
  // BMR donna 70kg/165cm/35a = 10×70 + 6.25×165 − 5×35 − 161 = 700+1031.25−175−161 = 1395.25
  // TDEE sedentario = 1395.25 × 1.2 = 1674 → deficit 20% = 1339 → arrotondato a 1700 (deficit meno aggressivo)
  // Target cheto: 100g proteine (1.43g/kg), <40g carbo, 130g grassi (~69% kcal da grassi)
  {
    name: "Chetogenica Dimagrimento 1700 kcal",
    description: "Piano chetogenico per donna sedentaria con obiettivo dimagrimento. Carboidrati sotto i 40g/die, grassi di qualità come fonte energetica primaria.",
    dietType: "chetogenica",
    targetGoal: "LOSE_WEIGHT",
    estimatedTargetProfile: {
      weightKg: 70, heightCm: 165, age: 35, gender: "F", activityLevel: "sedentario",
    },
    targetMacros: { kcal: 1700, proteinG: 100, carbsG: 35, fatG: 130 },
    weeklyPlan: {
      lunedi: {
        breakfast: {
          name: "Uova strapazzate con avocado e salmone affumicato",
          ingredients: [
            { food: "uova intere", quantityG: 150 },
            { food: "avocado", quantityG: 100 },
            { food: "salmone affumicato", quantityG: 60 },
            { food: "burro", quantityG: 10 },
          ],
          preparationNotes: "Strapazza le uova nel burro a fuoco basso. Servi con avocado a fette e salmone.",
          estimatedKcal: 530, estimatedProteinG: 32, estimatedCarbsG: 5, estimatedFatG: 42,
        },
        lunch: {
          name: "Insalata di pollo grigliato con noci e formaggio",
          ingredients: [
            { food: "petto di pollo grigliato", quantityG: 160 },
            { food: "insalata mista", quantityG: 150 },
            { food: "noci sgusciate", quantityG: 25 },
            { food: "pecorino stagionato", quantityG: 30 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 590, estimatedProteinG: 44, estimatedCarbsG: 6, estimatedFatG: 42,
        },
        dinner: {
          name: "Salmone al forno con asparagi e burro alle erbe",
          ingredients: [
            { food: "filetto di salmone", quantityG: 180 },
            { food: "asparagi freschi", quantityG: 200 },
            { food: "burro", quantityG: 15 },
            { food: "erbe aromatiche miste", quantityG: 5 },
          ],
          estimatedKcal: 520, estimatedProteinG: 38, estimatedCarbsG: 6, estimatedFatG: 36,
        },
        snacks: [
          {
            name: "Mandorle e formaggio stagionato",
            ingredients: [
              { food: "mandorle", quantityG: 25 },
              { food: "parmigiano a scaglie", quantityG: 20 },
            ],
            estimatedKcal: 230, estimatedProteinG: 10, estimatedCarbsG: 3, estimatedFatG: 20,
          },
        ],
      },
      martedi: {
        breakfast: {
          name: "Frittata con verdure a foglia e formaggio",
          ingredients: [
            { food: "uova intere", quantityG: 150 },
            { food: "spinaci freschi", quantityG: 80 },
            { food: "mozzarella", quantityG: 50 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
          ],
          estimatedKcal: 490, estimatedProteinG: 34, estimatedCarbsG: 4, estimatedFatG: 36,
        },
        lunch: {
          name: "Manzo in padella con zucchine e panna acida",
          ingredients: [
            { food: "fettine di manzo", quantityG: 180 },
            { food: "zucchine", quantityG: 150 },
            { food: "panna acida", quantityG: 50 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 600, estimatedProteinG: 38, estimatedCarbsG: 8, estimatedFatG: 44,
        },
        dinner: {
          name: "Tacchino al forno con cavolfiore gratinato",
          ingredients: [
            { food: "petto di tacchino", quantityG: 180 },
            { food: "cavolfiore", quantityG: 250 },
            { food: "parmigiano grattugiato", quantityG: 30 },
            { food: "burro", quantityG: 12 },
          ],
          preparationNotes: "Inforna tacchino a 180°C per 25 min. Gratina il cavolfiore con parmigiano e burro per 15 minuti.",
          estimatedKcal: 540, estimatedProteinG: 50, estimatedCarbsG: 10, estimatedFatG: 32,
        },
        snacks: [
          {
            name: "Olive e prosciutto crudo",
            ingredients: [
              { food: "olive verdi", quantityG: 50 },
              { food: "prosciutto crudo senza zuccheri aggiunti", quantityG: 40 },
            ],
            estimatedKcal: 170, estimatedProteinG: 8, estimatedCarbsG: 2, estimatedFatG: 14,
          },
        ],
      },
      mercoledi: {
        breakfast: {
          name: "Uova al tegamino con pancetta e funghetti",
          ingredients: [
            { food: "uova intere", quantityG: 120 },
            { food: "pancetta tesa", quantityG: 40 },
            { food: "funghi champignon", quantityG: 80 },
            { food: "burro", quantityG: 8 },
          ],
          estimatedKcal: 460, estimatedProteinG: 28, estimatedCarbsG: 3, estimatedFatG: 36,
        },
        lunch: {
          name: "Tonno con olive, cetrioli e feta",
          ingredients: [
            { food: "tonno al naturale sgocciolato", quantityG: 160 },
            { food: "olive nere denocciolate", quantityG: 40 },
            { food: "cetriolo", quantityG: 150 },
            { food: "feta", quantityG: 60 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 570, estimatedProteinG: 44, estimatedCarbsG: 8, estimatedFatG: 38,
        },
        dinner: {
          name: "Costolette di agnello con insalata di rucola",
          ingredients: [
            { food: "costolette di agnello", quantityG: 200 },
            { food: "rucola fresca", quantityG: 80 },
            { food: "pomodorini ciliegino", quantityG: 60 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 580, estimatedProteinG: 38, estimatedCarbsG: 5, estimatedFatG: 44,
        },
        snacks: [
          {
            name: "Noci e cetriolo con ricotta",
            ingredients: [
              { food: "noci sgusciate", quantityG: 20 },
              { food: "ricotta vaccina", quantityG: 80 },
            ],
            estimatedKcal: 260, estimatedProteinG: 10, estimatedCarbsG: 4, estimatedFatG: 22,
          },
        ],
      },
      giovedi: {
        breakfast: {
          name: "Pancakes di uova e ricotta con frutti di bosco",
          ingredients: [
            { food: "uova intere", quantityG: 120 },
            { food: "ricotta vaccina", quantityG: 80 },
            { food: "burro", quantityG: 8 },
            { food: "mirtilli freschi", quantityG: 40 },
          ],
          preparationNotes: "Frulla uova e ricotta. Cuoci piccoli pancakes nel burro. Servi con mirtilli (pochi per limitare i carboidrati).",
          estimatedKcal: 470, estimatedProteinG: 28, estimatedCarbsG: 8, estimatedFatG: 34,
        },
        lunch: {
          name: "Insalata di polpo con olive e sedano",
          ingredients: [
            { food: "polpo lessato", quantityG: 200 },
            { food: "sedano a cubetti", quantityG: 80 },
            { food: "olive verdi", quantityG: 40 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
            { food: "limone", quantityG: 20 },
          ],
          estimatedKcal: 520, estimatedProteinG: 38, estimatedCarbsG: 8, estimatedFatG: 36,
        },
        dinner: {
          name: "Petto di pollo in crosta di parmigiano con broccoli",
          ingredients: [
            { food: "petto di pollo", quantityG: 200 },
            { food: "parmigiano grattugiato", quantityG: 40 },
            { food: "broccoli", quantityG: 200 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          preparationNotes: "Impana il pollo nel parmigiano, cuoci in forno a 190°C per 20 min. Broccoli al vapore o saltati.",
          estimatedKcal: 560, estimatedProteinG: 54, estimatedCarbsG: 8, estimatedFatG: 34,
        },
        snacks: [
          {
            name: "Uovo sodo e pistacchi",
            ingredients: [
              { food: "uovo sodo", quantityG: 60 },
              { food: "pistacchi sgusciati", quantityG: 20 },
            ],
            estimatedKcal: 200, estimatedProteinG: 10, estimatedCarbsG: 5, estimatedFatG: 14,
          },
        ],
      },
      venerdi: {
        breakfast: {
          name: "Avocado ripieno di uova al forno",
          ingredients: [
            { food: "avocado grande maturo", quantityG: 150 },
            { food: "uova intere", quantityG: 100 },
            { food: "salmone affumicato", quantityG: 40 },
            { food: "erbe fresche", quantityG: 5 },
          ],
          preparationNotes: "Svuota leggermente l'avocado, rompi un uovo in ciascuna metà, inforna a 200°C per 12 minuti. Completa con salmone.",
          estimatedKcal: 500, estimatedProteinG: 26, estimatedCarbsG: 6, estimatedFatG: 40,
        },
        lunch: {
          name: "Bistecca di manzo con spinaci saltati al burro",
          ingredients: [
            { food: "bistecca di manzo", quantityG: 200 },
            { food: "spinaci freschi", quantityG: 200 },
            { food: "burro", quantityG: 15 },
            { food: "aglio", quantityG: 5 },
          ],
          estimatedKcal: 590, estimatedProteinG: 44, estimatedCarbsG: 5, estimatedFatG: 44,
        },
        dinner: {
          name: "Merluzzo con pesto di noci e fagiolini",
          ingredients: [
            { food: "merluzzo fresco", quantityG: 200 },
            { food: "noci sgusciate", quantityG: 25 },
            { food: "fagiolini lessati", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 520, estimatedProteinG: 44, estimatedCarbsG: 10, estimatedFatG: 32,
        },
        snacks: [
          {
            name: "Formaggio e salame di qualità",
            ingredients: [
              { food: "grana padano a cubetti", quantityG: 30 },
              { food: "salame senza zuccheri aggiunti", quantityG: 30 },
            ],
            estimatedKcal: 240, estimatedProteinG: 14, estimatedCarbsG: 1, estimatedFatG: 20,
          },
        ],
      },
      sabato: {
        breakfast: {
          name: "Frittata al forno con verdure e mozzarella",
          ingredients: [
            { food: "uova intere", quantityG: 180 },
            { food: "peperoni", quantityG: 80 },
            { food: "mozzarella", quantityG: 60 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
          ],
          estimatedKcal: 520, estimatedProteinG: 36, estimatedCarbsG: 7, estimatedFatG: 38,
        },
        lunch: {
          name: "Salmone affumicato con avocado e insalata",
          ingredients: [
            { food: "salmone affumicato", quantityG: 120 },
            { food: "avocado", quantityG: 80 },
            { food: "insalata mista", quantityG: 120 },
            { food: "capperi", quantityG: 15 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 540, estimatedProteinG: 30, estimatedCarbsG: 8, estimatedFatG: 42,
        },
        dinner: {
          name: "Pollo intero al forno con rosmarino e verdure",
          ingredients: [
            { food: "coscia di pollo con pelle", quantityG: 250 },
            { food: "cavolfiore", quantityG: 200 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
            { food: "rosmarino e timo", quantityG: 5 },
          ],
          preparationNotes: "Inforna la coscia a 200°C per 35 min. Aggiungi cavolfiore a metà cottura. Rosolarla bene per la pelle croccante.",
          estimatedKcal: 620, estimatedProteinG: 44, estimatedCarbsG: 8, estimatedFatG: 44,
        },
        snacks: [
          {
            name: "Crema di mandorle su sedano",
            ingredients: [
              { food: "burro di mandorle naturale", quantityG: 25 },
              { food: "gambi di sedano", quantityG: 100 },
            ],
            estimatedKcal: 185, estimatedProteinG: 6, estimatedCarbsG: 5, estimatedFatG: 16,
          },
        ],
      },
      domenica: {
        breakfast: {
          name: "Uova strapazzate con funghi e pancetta al forno",
          ingredients: [
            { food: "uova intere", quantityG: 150 },
            { food: "funghi champignon a fette", quantityG: 100 },
            { food: "pancetta affumicata", quantityG: 40 },
            { food: "burro", quantityG: 10 },
          ],
          estimatedKcal: 500, estimatedProteinG: 30, estimatedCarbsG: 4, estimatedFatG: 40,
        },
        lunch: {
          name: "Tagliata di tonno fresco con rucola e capperi",
          ingredients: [
            { food: "tonno fresco", quantityG: 200 },
            { food: "rucola fresca", quantityG: 80 },
            { food: "capperi sotto sale sciacquati", quantityG: 15 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
            { food: "limone", quantityG: 20 },
          ],
          estimatedKcal: 520, estimatedProteinG: 46, estimatedCarbsG: 4, estimatedFatG: 34,
        },
        dinner: {
          name: "Braciole di maiale con peperoni arrostiti",
          ingredients: [
            { food: "braciola di maiale", quantityG: 200 },
            { food: "peperoni misti", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
            { food: "aglio e prezzemolo", quantityG: 8 },
          ],
          estimatedKcal: 560, estimatedProteinG: 40, estimatedCarbsG: 10, estimatedFatG: 40,
        },
        snacks: [
          {
            name: "Noci brasiliane e olive",
            ingredients: [
              { food: "noci brasiliane", quantityG: 20 },
              { food: "olive nere", quantityG: 40 },
            ],
            estimatedKcal: 210, estimatedProteinG: 4, estimatedCarbsG: 4, estimatedFatG: 20,
          },
        ],
      },
    },
    rationale: "Deficit calorico del ~20% sul TDEE per dimagrimento sostenibile. Carboidrati inferiori ai 40g/giorno per indurre e mantenere la chetosi. Proteine a 1.4g/kg per preservare la massa muscolare in regime ipocalorico. Grassi come fonte energetica principale: olio EVO, burro, avocado, frutta secca.",
    notes: "Nelle prime 2 settimane può verificarsi 'keto flu' (stanchezza, cefalea): aumentare l'apporto di sodio, potassio e magnesio. Monitorare i chetoni urinari nelle prime settimane per confermare la chetosi.",
  },

  // ─── TEMPLATE 4 ─── Vegetariano Fitness 2000 kcal
  // BMR donna 60kg/168cm/28a = 10×60 + 6.25×168 − 5×28 − 161 = 600+1050−140−161 = 1349
  // TDEE moderato = 1349 × 1.55 = 2090.9 → GENERAL_FITNESS = TDEE → arrotondato 2000
  // Target: 110g proteine (1.83g/kg), 240g carbo, 70g grassi
  {
    name: "Vegetariano Fitness 2000 kcal",
    description: "Piano vegetariano bilanciato per donna attiva con obiettivo benessere generale. Uova e latticini come fonte proteica principale, cereali integrali e legumi come base.",
    dietType: "vegetariana",
    targetGoal: "GENERAL_FITNESS",
    estimatedTargetProfile: {
      weightKg: 60, heightCm: 168, age: 28, gender: "F", activityLevel: "moderato",
    },
    targetMacros: { kcal: 2000, proteinG: 110, carbsG: 240, fatG: 70 },
    weeklyPlan: {
      lunedi: {
        breakfast: {
          name: "Yogurt greco con granola artigianale e frutti di bosco",
          ingredients: [
            { food: "yogurt greco bianco 2%", quantityG: 200 },
            { food: "avena tostata con miele e frutta secca", quantityG: 40 },
            { food: "fragole fresche", quantityG: 100 },
            { food: "miele", quantityG: 10 },
          ],
          estimatedKcal: 480, estimatedProteinG: 26, estimatedCarbsG: 60, estimatedFatG: 14,
        },
        lunch: {
          name: "Pasta integrale con ricotta, spinaci e noci",
          ingredients: [
            { food: "pasta integrale", quantityG: 80 },
            { food: "ricotta vaccina", quantityG: 120 },
            { food: "spinaci freschi appassiti", quantityG: 150 },
            { food: "noci sgusciate", quantityG: 15 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
          ],
          estimatedKcal: 660, estimatedProteinG: 30, estimatedCarbsG: 78, estimatedFatG: 22,
        },
        dinner: {
          name: "Frittata alle verdure con insalata e pane integrale",
          ingredients: [
            { food: "uova intere", quantityG: 180 },
            { food: "peperoni e zucchine", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
            { food: "pane integrale", quantityG: 50 },
          ],
          estimatedKcal: 580, estimatedProteinG: 30, estimatedCarbsG: 42, estimatedFatG: 28,
        },
        snacks: [
          {
            name: "Mela con burro di mandorle",
            ingredients: [
              { food: "mela", quantityG: 180 },
              { food: "burro di mandorle naturale", quantityG: 15 },
            ],
            estimatedKcal: 220, estimatedProteinG: 4, estimatedCarbsG: 32, estimatedFatG: 8,
          },
        ],
      },
      martedi: {
        breakfast: {
          name: "Pane integrale con uova alla coque e pomodoro",
          ingredients: [
            { food: "pane integrale", quantityG: 80 },
            { food: "uova intere", quantityG: 120 },
            { food: "pomodori maturi", quantityG: 120 },
            { food: "olio extravergine d'oliva", quantityG: 8 },
          ],
          estimatedKcal: 460, estimatedProteinG: 22, estimatedCarbsG: 45, estimatedFatG: 18,
        },
        lunch: {
          name: "Zuppa di lenticchie con pane di segale",
          ingredients: [
            { food: "lenticchie secche", quantityG: 80 },
            { food: "carote e sedano", quantityG: 100 },
            { food: "pomodori pelati", quantityG: 150 },
            { food: "pane di segale", quantityG: 60 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 620, estimatedProteinG: 26, estimatedCarbsG: 90, estimatedFatG: 14,
        },
        dinner: {
          name: "Risotto con asparagi e parmigiano",
          ingredients: [
            { food: "riso carnaroli", quantityG: 80 },
            { food: "asparagi freschi", quantityG: 200 },
            { food: "parmigiano grattugiato", quantityG: 30 },
            { food: "burro", quantityG: 10 },
            { food: "cipolla", quantityG: 40 },
          ],
          preparationNotes: "Prepara il risotto classico con brodo vegetale. Aggiungi gli asparagi a 5 minuti dalla fine. Manteca con burro e parmigiano.",
          estimatedKcal: 620, estimatedProteinG: 22, estimatedCarbsG: 88, estimatedFatG: 18,
        },
        snacks: [
          {
            name: "Yogurt con noci e banana",
            ingredients: [
              { food: "yogurt naturale intero", quantityG: 150 },
              { food: "noci sgusciate", quantityG: 15 },
              { food: "banana", quantityG: 80 },
            ],
            estimatedKcal: 290, estimatedProteinG: 10, estimatedCarbsG: 30, estimatedFatG: 14,
          },
        ],
      },
      mercoledi: {
        breakfast: {
          name: "Avena con latte, cannella e frutta di stagione",
          ingredients: [
            { food: "avena in fiocchi", quantityG: 60 },
            { food: "latte intero", quantityG: 200 },
            { food: "pera a cubetti", quantityG: 120 },
            { food: "cannella in polvere", quantityG: 2 },
            { food: "mandorle", quantityG: 15 },
          ],
          estimatedKcal: 490, estimatedProteinG: 18, estimatedCarbsG: 62, estimatedFatG: 18,
        },
        lunch: {
          name: "Pizza integrale fatta in casa con mozzarella e verdure",
          ingredients: [
            { food: "impasto pizza integrale", quantityG: 150 },
            { food: "mozzarella fior di latte", quantityG: 80 },
            { food: "passata di pomodoro", quantityG: 80 },
            { food: "carciofi sott'olio", quantityG: 60 },
            { food: "olive nere", quantityG: 30 },
          ],
          estimatedKcal: 680, estimatedProteinG: 30, estimatedCarbsG: 80, estimatedFatG: 24,
        },
        dinner: {
          name: "Ceci in umido con polenta integrale",
          ingredients: [
            { food: "ceci lessati", quantityG: 180 },
            { food: "polenta integrale cotta", quantityG: 200 },
            { food: "rosmarino e aglio", quantityG: 5 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 580, estimatedProteinG: 24, estimatedCarbsG: 86, estimatedFatG: 14,
        },
        snacks: [
          {
            name: "Crackers con formaggio fresco",
            ingredients: [
              { food: "crackers integrali", quantityG: 30 },
              { food: "formaggio fresco spalmabile", quantityG: 50 },
            ],
            estimatedKcal: 220, estimatedProteinG: 8, estimatedCarbsG: 24, estimatedFatG: 10,
          },
        ],
      },
      giovedi: {
        breakfast: {
          name: "Frullato proteico con latte, avena e frutti di bosco",
          ingredients: [
            { food: "latte parzialmente scremato", quantityG: 250 },
            { food: "avena in fiocchi", quantityG: 40 },
            { food: "mirtilli surgelati", quantityG: 100 },
            { food: "uovo intero crudo pastorizzato", quantityG: 60 },
          ],
          estimatedKcal: 440, estimatedProteinG: 22, estimatedCarbsG: 52, estimatedFatG: 12,
        },
        lunch: {
          name: "Insalata di quinoa con uova sode e verdure",
          ingredients: [
            { food: "quinoa cotta", quantityG: 180 },
            { food: "uova sode", quantityG: 120 },
            { food: "pomodori ciliegino", quantityG: 100 },
            { food: "cetriolo", quantityG: 80 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 620, estimatedProteinG: 28, estimatedCarbsG: 72, estimatedFatG: 22,
        },
        dinner: {
          name: "Melanzane alla parmigiana con pane integrale",
          ingredients: [
            { food: "melanzane grigliate", quantityG: 300 },
            { food: "passata di pomodoro", quantityG: 150 },
            { food: "mozzarella", quantityG: 80 },
            { food: "parmigiano grattugiato", quantityG: 20 },
            { food: "pane integrale", quantityG: 40 },
          ],
          estimatedKcal: 600, estimatedProteinG: 28, estimatedCarbsG: 54, estimatedFatG: 28,
        },
        snacks: [
          {
            name: "Frutta secca e kiwi",
            ingredients: [
              { food: "pistacchi sgusciati", quantityG: 20 },
              { food: "kiwi", quantityG: 100 },
            ],
            estimatedKcal: 200, estimatedProteinG: 6, estimatedCarbsG: 18, estimatedFatG: 12,
          },
        ],
      },
      venerdi: {
        breakfast: {
          name: "Pancakes con ricotta e sciroppo d'acero",
          ingredients: [
            { food: "ricotta vaccina", quantityG: 100 },
            { food: "uova intere", quantityG: 100 },
            { food: "avena in fiocchi", quantityG: 40 },
            { food: "sciroppo d'acero", quantityG: 15 },
            { food: "frutti di bosco", quantityG: 60 },
          ],
          preparationNotes: "Frulla ricotta, uova e avena. Cuoci in padella antiaderente. Servi con sciroppo e frutti di bosco.",
          estimatedKcal: 480, estimatedProteinG: 26, estimatedCarbsG: 52, estimatedFatG: 16,
        },
        lunch: {
          name: "Fagioli all'uccelletto con uova in camicia",
          ingredients: [
            { food: "fagioli cannellini lessati", quantityG: 200 },
            { food: "uova intere", quantityG: 120 },
            { food: "salvia e aglio", quantityG: 5 },
            { food: "passata di pomodoro", quantityG: 100 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 620, estimatedProteinG: 34, estimatedCarbsG: 68, estimatedFatG: 20,
        },
        dinner: {
          name: "Gnocchi di patate al sugo di pomodoro e basilico",
          ingredients: [
            { food: "gnocchi di patate freschi", quantityG: 200 },
            { food: "passata di pomodoro", quantityG: 200 },
            { food: "parmigiano grattugiato", quantityG: 20 },
            { food: "basilico fresco", quantityG: 5 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
          ],
          estimatedKcal: 560, estimatedProteinG: 16, estimatedCarbsG: 84, estimatedFatG: 16,
        },
        snacks: [
          {
            name: "Budino di latte con cacao",
            ingredients: [
              { food: "latte intero", quantityG: 200 },
              { food: "cacao in polvere non zuccherato", quantityG: 10 },
              { food: "miele", quantityG: 10 },
            ],
            estimatedKcal: 220, estimatedProteinG: 8, estimatedCarbsG: 26, estimatedFatG: 8,
          },
        ],
      },
      sabato: {
        breakfast: {
          name: "Cornetti di segale fatti in casa con marmellata",
          ingredients: [
            { food: "pane di segale", quantityG: 80 },
            { food: "burro", quantityG: 10 },
            { food: "marmellata senza zuccheri aggiunti", quantityG: 30 },
            { food: "latte intero", quantityG: 200 },
          ],
          estimatedKcal: 450, estimatedProteinG: 14, estimatedCarbsG: 62, estimatedFatG: 16,
        },
        lunch: {
          name: "Tagliatelle al ragù di lenticchie rosse",
          ingredients: [
            { food: "tagliatelle all'uovo", quantityG: 100 },
            { food: "lenticchie rosse secche", quantityG: 80 },
            { food: "passata di pomodoro", quantityG: 150 },
            { food: "carote e sedano", quantityG: 80 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 680, estimatedProteinG: 30, estimatedCarbsG: 100, estimatedFatG: 16,
        },
        dinner: {
          name: "Uova in cocotte con spinaci e panna",
          ingredients: [
            { food: "uova intere", quantityG: 150 },
            { food: "spinaci freschi", quantityG: 100 },
            { food: "panna da cucina leggera", quantityG: 50 },
            { food: "parmigiano grattugiato", quantityG: 20 },
            { food: "pane integrale", quantityG: 40 },
          ],
          preparationNotes: "Salta gli spinaci, disponi nelle cocotte. Rompi le uova sopra, aggiungi panna e parmigiano. Cuoci in forno 180°C per 12 minuti.",
          estimatedKcal: 540, estimatedProteinG: 28, estimatedCarbsG: 36, estimatedFatG: 30,
        },
        snacks: [
          {
            name: "Macedonia di frutta fresca",
            ingredients: [
              { food: "arancia", quantityG: 150 },
              { food: "kiwi", quantityG: 80 },
              { food: "banana", quantityG: 80 },
            ],
            estimatedKcal: 220, estimatedProteinG: 4, estimatedCarbsG: 50, estimatedFatG: 1,
          },
        ],
      },
      domenica: {
        breakfast: {
          name: "Omelette dolce con mele e cannella",
          ingredients: [
            { food: "uova intere", quantityG: 150 },
            { food: "mela a cubetti", quantityG: 100 },
            { food: "burro", quantityG: 8 },
            { food: "cannella in polvere", quantityG: 2 },
            { food: "miele", quantityG: 10 },
          ],
          estimatedKcal: 430, estimatedProteinG: 20, estimatedCarbsG: 34, estimatedFatG: 22,
        },
        lunch: {
          name: "Minestrone di verdure con pasta e parmigiano",
          ingredients: [
            { food: "pasta mista corta", quantityG: 70 },
            { food: "verdure miste di stagione", quantityG: 300 },
            { food: "fagioli borlotti lessati", quantityG: 80 },
            { food: "parmigiano grattugiato", quantityG: 20 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 600, estimatedProteinG: 24, estimatedCarbsG: 88, estimatedFatG: 16,
        },
        dinner: {
          name: "Soufflé di formaggio con insalata e crackers",
          ingredients: [
            { food: "uova intere", quantityG: 150 },
            { food: "gruyère o emmental grattugiato", quantityG: 60 },
            { food: "insalata mista", quantityG: 100 },
            { food: "crackers integrali", quantityG: 30 },
            { food: "olio extravergine d'oliva", quantityG: 8 },
          ],
          estimatedKcal: 560, estimatedProteinG: 30, estimatedCarbsG: 24, estimatedFatG: 38,
        },
        snacks: [
          {
            name: "Yogurt con mandorle e mirtilli",
            ingredients: [
              { food: "yogurt greco bianco 2%", quantityG: 150 },
              { food: "mandorle", quantityG: 15 },
              { food: "mirtilli freschi", quantityG: 60 },
            ],
            estimatedKcal: 240, estimatedProteinG: 14, estimatedCarbsG: 18, estimatedFatG: 12,
          },
        ],
      },
    },
    rationale: "Calorie a mantenimento per donna 60kg con attività moderata. Proteine a 1.83g/kg distribuite su colazione, pranzo, cena e uno snack: uova come fonte proteica completa, legumi per fibre e ferro, latticini per calcio. Carboidrati complessi come base energetica con cereali integrali e legumi.",
  },

  // ─── TEMPLATE 5 ─── Onnivoro Performance 3200 kcal
  // BMR uomo 85kg/185cm/25a = 10×85 + 6.25×185 − 5×25 + 5 = 850+1156.25−125+5 = 1886.25
  // TDEE intenso = 1886.25 × 1.725 = 3253.8 → surplus 10% = 3579 → target 3200 (moderato surplus)
  // Target: 190g proteine (2.24g/kg), 420g carbo, 95g grassi
  {
    name: "Onnivoro Performance 3200 kcal",
    description: "Piano ipercalorico per atleta maschio con allenamenti intensi quotidiani. Apporto proteico elevato, carboidrati abbondanti per il recupero, pasti pre e post allenamento ottimizzati.",
    dietType: "onnivora",
    targetGoal: "ATHLETIC_PERFORMANCE",
    estimatedTargetProfile: {
      weightKg: 85, heightCm: 185, age: 25, gender: "M", activityLevel: "intenso",
    },
    targetMacros: { kcal: 3200, proteinG: 190, carbsG: 420, fatG: 95 },
    weeklyPlan: {
      lunedi: {
        breakfast: {
          name: "Porridge proteico con uova e banana pre-allenamento",
          ingredients: [
            { food: "avena in fiocchi", quantityG: 100 },
            { food: "latte intero", quantityG: 300 },
            { food: "uova intere", quantityG: 120 },
            { food: "banana matura", quantityG: 150 },
            { food: "miele", quantityG: 20 },
          ],
          preparationNotes: "Prepara il porridge con latte. Cuoci le uova strapazzate a parte. Mangia entrambi 60-90 min prima dell'allenamento.",
          estimatedKcal: 860, estimatedProteinG: 42, estimatedCarbsG: 118, estimatedFatG: 24,
        },
        lunch: {
          name: "Petto di pollo con riso integrale e broccoli post-allenamento",
          ingredients: [
            { food: "petto di pollo", quantityG: 250 },
            { food: "riso integrale cotto", quantityG: 300 },
            { food: "broccoli", quantityG: 200 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 900, estimatedProteinG: 64, estimatedCarbsG: 110, estimatedFatG: 18,
        },
        dinner: {
          name: "Salmone al forno con pasta integrale e verdure",
          ingredients: [
            { food: "filetto di salmone", quantityG: 200 },
            { food: "pasta integrale", quantityG: 100 },
            { food: "zucchine grigliate", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 880, estimatedProteinG: 54, estimatedCarbsG: 90, estimatedFatG: 28,
        },
        snacks: [
          {
            name: "Shake proteico con latte e frutta",
            ingredients: [
              { food: "proteina del siero di latte in polvere", quantityG: 40 },
              { food: "latte intero", quantityG: 300 },
              { food: "banana", quantityG: 100 },
            ],
            estimatedKcal: 460, estimatedProteinG: 42, estimatedCarbsG: 54, estimatedFatG: 10,
          },
          {
            name: "Nocciole e yogurt greco",
            ingredients: [
              { food: "nocciole sgusciate", quantityG: 25 },
              { food: "yogurt greco 0%", quantityG: 150 },
            ],
            estimatedKcal: 260, estimatedProteinG: 18, estimatedCarbsG: 10, estimatedFatG: 16,
          },
        ],
      },
      martedi: {
        breakfast: {
          name: "Uova strapazzate con avocado, pane e succo d'arancia",
          ingredients: [
            { food: "uova intere", quantityG: 200 },
            { food: "pane integrale", quantityG: 100 },
            { food: "avocado", quantityG: 80 },
            { food: "succo d'arancia fresco", quantityG: 200 },
          ],
          estimatedKcal: 780, estimatedProteinG: 38, estimatedCarbsG: 78, estimatedFatG: 34,
        },
        lunch: {
          name: "Manzo magro con patate al forno e verdure miste",
          ingredients: [
            { food: "filetto di manzo magro", quantityG: 250 },
            { food: "patate al forno", quantityG: 300 },
            { food: "fagiolini lessati", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 900, estimatedProteinG: 60, estimatedCarbsG: 90, estimatedFatG: 26,
        },
        dinner: {
          name: "Risotto con petto di tacchino e funghi",
          ingredients: [
            { food: "riso carnaroli", quantityG: 100 },
            { food: "petto di tacchino a cubetti", quantityG: 200 },
            { food: "funghi champignon", quantityG: 150 },
            { food: "parmigiano grattugiato", quantityG: 25 },
            { food: "brodo di carne", quantityG: 400 },
            { food: "burro", quantityG: 10 },
          ],
          estimatedKcal: 860, estimatedProteinG: 56, estimatedCarbsG: 98, estimatedFatG: 20,
        },
        snacks: [
          {
            name: "Shake post-allenamento con carboidrati",
            ingredients: [
              { food: "proteina del siero di latte in polvere", quantityG: 40 },
              { food: "succo di frutta non zuccherato", quantityG: 300 },
            ],
            estimatedKcal: 340, estimatedProteinG: 34, estimatedCarbsG: 44, estimatedFatG: 2,
          },
          {
            name: "Mandorle e frutta",
            ingredients: [
              { food: "mandorle", quantityG: 25 },
              { food: "pera", quantityG: 150 },
            ],
            estimatedKcal: 230, estimatedProteinG: 6, estimatedCarbsG: 28, estimatedFatG: 12,
          },
        ],
      },
      mercoledi: {
        breakfast: {
          name: "Pancakes proteici con ricotta, uova e frutta secca",
          ingredients: [
            { food: "ricotta vaccina", quantityG: 150 },
            { food: "uova intere", quantityG: 150 },
            { food: "avena in fiocchi", quantityG: 80 },
            { food: "miele", quantityG: 20 },
            { food: "noci sgusciate", quantityG: 20 },
          ],
          preparationNotes: "Frulla ricotta, uova e avena. Cuoci in padella antiaderente. Servi con miele e noci.",
          estimatedKcal: 820, estimatedProteinG: 44, estimatedCarbsG: 80, estimatedFatG: 30,
        },
        lunch: {
          name: "Pasta con tonno, olive e capperi su base pomodoro",
          ingredients: [
            { food: "pasta di semola", quantityG: 120 },
            { food: "tonno al naturale sgocciolato", quantityG: 180 },
            { food: "olive nere", quantityG: 30 },
            { food: "capperi", quantityG: 15 },
            { food: "passata di pomodoro", quantityG: 200 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 880, estimatedProteinG: 58, estimatedCarbsG: 110, estimatedFatG: 18,
        },
        dinner: {
          name: "Cosce di pollo al forno con riso basmati e spinaci",
          ingredients: [
            { food: "coscia di pollo senza pelle", quantityG: 280 },
            { food: "riso basmati cotto", quantityG: 250 },
            { food: "spinaci saltati", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 920, estimatedProteinG: 62, estimatedCarbsG: 100, estimatedFatG: 22,
        },
        snacks: [
          {
            name: "Frullato di latte con avena e burro di arachidi",
            ingredients: [
              { food: "latte intero", quantityG: 300 },
              { food: "avena in fiocchi", quantityG: 40 },
              { food: "burro di arachidi naturale", quantityG: 25 },
            ],
            estimatedKcal: 490, estimatedProteinG: 22, estimatedCarbsG: 56, estimatedFatG: 20,
          },
        ],
      },
      giovedi: {
        breakfast: {
          name: "Bowl proteica con uova, avocado e salmone affumicato",
          ingredients: [
            { food: "uova strapazzate", quantityG: 180 },
            { food: "avocado", quantityG: 100 },
            { food: "salmone affumicato", quantityG: 80 },
            { food: "pane integrale", quantityG: 80 },
          ],
          estimatedKcal: 780, estimatedProteinG: 46, estimatedCarbsG: 44, estimatedFatG: 44,
        },
        lunch: {
          name: "Stinco di vitello con gnocchi di patate al sugo",
          ingredients: [
            { food: "stinco di vitello", quantityG: 250 },
            { food: "gnocchi di patate", quantityG: 200 },
            { food: "passata di pomodoro", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 12 },
          ],
          estimatedKcal: 920, estimatedProteinG: 58, estimatedCarbsG: 100, estimatedFatG: 28,
        },
        dinner: {
          name: "Merluzzo in crosta di erbe con farro e verdure",
          ingredients: [
            { food: "merluzzo fresco", quantityG: 250 },
            { food: "farro perlato cotto", quantityG: 200 },
            { food: "pomodori e peperoni", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
            { food: "erbe miste tritate", quantityG: 10 },
          ],
          estimatedKcal: 860, estimatedProteinG: 58, estimatedCarbsG: 90, estimatedFatG: 20,
        },
        snacks: [
          {
            name: "Shake proteico con latte e banana",
            ingredients: [
              { food: "proteina del siero di latte in polvere", quantityG: 40 },
              { food: "latte intero", quantityG: 250 },
              { food: "banana", quantityG: 120 },
            ],
            estimatedKcal: 450, estimatedProteinG: 38, estimatedCarbsG: 52, estimatedFatG: 10,
          },
          {
            name: "Cracker e formaggio",
            ingredients: [
              { food: "crackers integrali", quantityG: 30 },
              { food: "asiago o fontina", quantityG: 40 },
            ],
            estimatedKcal: 270, estimatedProteinG: 14, estimatedCarbsG: 24, estimatedFatG: 14,
          },
        ],
      },
      venerdi: {
        breakfast: {
          name: "Avena con latte intero, albumi, frutta e miele",
          ingredients: [
            { food: "avena in fiocchi", quantityG: 100 },
            { food: "latte intero", quantityG: 300 },
            { food: "albumi d'uovo", quantityG: 100 },
            { food: "mirtilli freschi", quantityG: 80 },
            { food: "miele", quantityG: 20 },
          ],
          estimatedKcal: 760, estimatedProteinG: 38, estimatedCarbsG: 110, estimatedFatG: 12,
        },
        lunch: {
          name: "Burger di manzo con patate e insalata",
          ingredients: [
            { food: "hamburger di manzo magro", quantityG: 200 },
            { food: "pane per hamburger integrale", quantityG: 80 },
            { food: "patate fritte al forno", quantityG: 200 },
            { food: "lattuga e pomodoro", quantityG: 80 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
          ],
          estimatedKcal: 900, estimatedProteinG: 50, estimatedCarbsG: 100, estimatedFatG: 30,
        },
        dinner: {
          name: "Trancio di tonno alla griglia con quinoa e fagiolini",
          ingredients: [
            { food: "tonno fresco", quantityG: 250 },
            { food: "quinoa cotta", quantityG: 200 },
            { food: "fagiolini lessati", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
            { food: "limone", quantityG: 20 },
          ],
          estimatedKcal: 880, estimatedProteinG: 68, estimatedCarbsG: 80, estimatedFatG: 22,
        },
        snacks: [
          {
            name: "Yogurt greco con granola e frutta secca",
            ingredients: [
              { food: "yogurt greco 0%", quantityG: 200 },
              { food: "avena tostata con frutta secca", quantityG: 40 },
              { food: "mandorle", quantityG: 20 },
            ],
            estimatedKcal: 420, estimatedProteinG: 28, estimatedCarbsG: 42, estimatedFatG: 16,
          },
        ],
      },
      sabato: {
        breakfast: {
          name: "Colazione proteica completa con uova, prosciutto e pane",
          ingredients: [
            { food: "uova intere", quantityG: 200 },
            { food: "prosciutto cotto senza additivi", quantityG: 80 },
            { food: "pane integrale", quantityG: 100 },
            { food: "pomodori", quantityG: 100 },
            { food: "burro", quantityG: 10 },
          ],
          estimatedKcal: 820, estimatedProteinG: 50, estimatedCarbsG: 60, estimatedFatG: 38,
        },
        lunch: {
          name: "Costata di manzo con polenta e funghi trifolati",
          ingredients: [
            { food: "costata di manzo", quantityG: 280 },
            { food: "polenta bramata cotta", quantityG: 250 },
            { food: "funghi porcini o champignon", quantityG: 150 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          preparationNotes: "Cuoci la costata alla brace o piastra 3 min per lato per la media cottura. Trifola i funghi con aglio e olio.",
          estimatedKcal: 1000, estimatedProteinG: 62, estimatedCarbsG: 90, estimatedFatG: 38,
        },
        dinner: {
          name: "Salmone con riso venere e asparagi al vapore",
          ingredients: [
            { food: "filetto di salmone", quantityG: 220 },
            { food: "riso venere cotto", quantityG: 200 },
            { food: "asparagi", quantityG: 200 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 860, estimatedProteinG: 52, estimatedCarbsG: 90, estimatedFatG: 28,
        },
        snacks: [
          {
            name: "Frutta secca mista e cioccolato fondente",
            ingredients: [
              { food: "noci e mandorle miste", quantityG: 30 },
              { food: "cioccolato fondente 85%", quantityG: 20 },
            ],
            estimatedKcal: 290, estimatedProteinG: 8, estimatedCarbsG: 12, estimatedFatG: 24,
          },
        ],
      },
      domenica: {
        breakfast: {
          name: "Frittata proteica con verdure e formaggio fuso",
          ingredients: [
            { food: "uova intere", quantityG: 200 },
            { food: "peperoni e cipolla", quantityG: 100 },
            { food: "emmental grattugiato", quantityG: 40 },
            { food: "olio extravergine d'oliva", quantityG: 10 },
            { food: "pane integrale", quantityG: 80 },
          ],
          estimatedKcal: 780, estimatedProteinG: 46, estimatedCarbsG: 52, estimatedFatG: 38,
        },
        lunch: {
          name: "Arrosto di maiale con patate e rosmarino",
          ingredients: [
            { food: "lonza di maiale", quantityG: 280 },
            { food: "patate a cubetti", quantityG: 300 },
            { food: "rosmarino e aglio", quantityG: 8 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          preparationNotes: "Marina la lonza con aglio e rosmarino. Inforna a 180°C per 40 min con patate intorno. Rosola all'inizio per sigillare i succhi.",
          estimatedKcal: 980, estimatedProteinG: 60, estimatedCarbsG: 80, estimatedFatG: 38,
        },
        dinner: {
          name: "Zuppa di legumi e cereali con pane di campagna",
          ingredients: [
            { food: "fagioli e lenticchie misti lessati", quantityG: 200 },
            { food: "orzo perlato", quantityG: 80 },
            { food: "verdure invernali miste", quantityG: 200 },
            { food: "pane di campagna", quantityG: 80 },
            { food: "olio extravergine d'oliva", quantityG: 15 },
          ],
          estimatedKcal: 760, estimatedProteinG: 34, estimatedCarbsG: 120, estimatedFatG: 16,
        },
        snacks: [
          {
            name: "Shake di recupero domenicale",
            ingredients: [
              { food: "proteina del siero di latte in polvere", quantityG: 40 },
              { food: "latte intero", quantityG: 300 },
              { food: "burro di arachidi naturale", quantityG: 20 },
            ],
            estimatedKcal: 500, estimatedProteinG: 40, estimatedCarbsG: 32, estimatedFatG: 22,
          },
        ],
      },
    },
    rationale: "Surplus calorico moderato (~10%) sul TDEE per atleta in regime di allenamento intenso. Proteine a 2.24g/kg ripartite su 5 momenti per massimizzare la sintesi proteica muscolare. Carboidrati abbondanti con timing specifico: pasto pre-allenamento ricco di amidi, post-allenamento proteine + carbo veloci per il recupero. Grassi di qualità da olio EVO, frutta secca e pesce azzurro.",
    notes: "Adattare il timing dei pasti all'orario dell'allenamento: il pasto principale pre-workout 2 ore prima, lo snack proteico entro 30-60 minuti dal termine. Nei giorni di riposo, ridurre i carboidrati di circa 80-100g mantenendo proteine e grassi invariati.",
  },

];
