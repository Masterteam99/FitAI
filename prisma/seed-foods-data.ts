// File: prisma/seed-foods-data.ts
//
// Pool alimenti di partenza per il diario nutrizionale (grammatura → calcolo
// automatico di calorie/macro). Valori per 100g, standard di riferimento
// generici (stile USDA / tabelle di composizione degli alimenti), non legati
// a un brand specifico. Estendibile/correggibile da Admin → Alimenti.

export interface FoodSeedItem {
  name: string;
  category:
    | "cereali"
    | "carne"
    | "pesce"
    | "uova_latticini"
    | "legumi"
    | "verdura"
    | "frutta"
    | "grassi_oli"
    | "dolci_snack"
    | "bevande";
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export const FOOD_SEED_DATA: FoodSeedItem[] = [
  // ── Cereali, pane, pasta ──────────────────────────────────────────────
  { name: "Pasta di semola (cruda)", category: "cereali", kcal: 353, protein: 12.5, carbs: 71.2, fat: 1.5, fiber: 2.7 },
  { name: "Pasta integrale (cruda)", category: "cereali", kcal: 337, protein: 13.4, carbs: 66.2, fat: 2.5, fiber: 8.3 },
  { name: "Riso bianco (crudo)", category: "cereali", kcal: 332, protein: 6.7, carbs: 74.6, fat: 0.6, fiber: 1 },
  { name: "Riso integrale (crudo)", category: "cereali", kcal: 337, protein: 7.5, carbs: 71.9, fat: 2.7, fiber: 3.5 },
  { name: "Pane bianco", category: "cereali", kcal: 271, protein: 8.6, carbs: 54.5, fat: 1.1, fiber: 2.5 },
  { name: "Pane integrale", category: "cereali", kcal: 253, protein: 9.6, carbs: 46, fat: 2, fiber: 6.5 },
  { name: "Pane di segale", category: "cereali", kcal: 219, protein: 6.3, carbs: 42.5, fat: 1.2, fiber: 5.8 },
  { name: "Fette biscottate", category: "cereali", kcal: 408, protein: 10.6, carbs: 74.9, fat: 6.9, fiber: 3.5 },
  { name: "Farina 00", category: "cereali", kcal: 340, protein: 11, carbs: 74.5, fat: 1, fiber: 2.2 },
  { name: "Farina integrale", category: "cereali", kcal: 319, protein: 12.6, carbs: 61.9, fat: 2.5, fiber: 9 },
  { name: "Avena (fiocchi)", category: "cereali", kcal: 372, protein: 13.5, carbs: 59.8, fat: 6.5, fiber: 10 },
  { name: "Mais (chicchi)", category: "cereali", kcal: 86, protein: 3.3, carbs: 19, fat: 1.2, fiber: 2.7 },
  { name: "Cous cous (crudo)", category: "cereali", kcal: 376, protein: 12.8, carbs: 77.4, fat: 0.6, fiber: 5 },
  { name: "Quinoa (cruda)", category: "cereali", kcal: 368, protein: 14.1, carbs: 64.2, fat: 6.1, fiber: 7 },
  { name: "Orzo perlato (crudo)", category: "cereali", kcal: 354, protein: 10.4, carbs: 73.5, fat: 1.2, fiber: 9.8 },
  { name: "Farro (crudo)", category: "cereali", kcal: 335, protein: 15, carbs: 67, fat: 2.5, fiber: 8 },
  { name: "Cracker", category: "cereali", kcal: 430, protein: 10, carbs: 68, fat: 13, fiber: 3 },
  { name: "Grissini", category: "cereali", kcal: 415, protein: 11.7, carbs: 71.5, fat: 9, fiber: 3 },
  { name: "Pizza margherita", category: "cereali", kcal: 271, protein: 11, carbs: 33, fat: 10, fiber: 2 },
  { name: "Patate (bollite)", category: "verdura", kcal: 87, protein: 1.9, carbs: 20.1, fat: 0.1, fiber: 1.6 },
  { name: "Patate (crude)", category: "verdura", kcal: 77, protein: 2, carbs: 17.5, fat: 0.1, fiber: 2.1 },

  // ── Carne ──────────────────────────────────────────────────────────────
  { name: "Petto di pollo (crudo)", category: "carne", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Petto di pollo (alla griglia)", category: "carne", kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Coscia di pollo (senza pelle)", category: "carne", kcal: 172, protein: 24, carbs: 0, fat: 8 },
  { name: "Petto di tacchino (crudo)", category: "carne", kcal: 135, protein: 29, carbs: 0, fat: 1.5 },
  { name: "Manzo magro (fesa, crudo)", category: "carne", kcal: 137, protein: 22.5, carbs: 0, fat: 5 },
  { name: "Manzo macinato (crudo)", category: "carne", kcal: 217, protein: 20, carbs: 0, fat: 15 },
  { name: "Vitello (fesa, crudo)", category: "carne", kcal: 109, protein: 21.3, carbs: 0, fat: 2.4 },
  { name: "Maiale (lonza, crudo)", category: "carne", kcal: 143, protein: 21.5, carbs: 0, fat: 6 },
  { name: "Prosciutto cotto", category: "carne", kcal: 132, protein: 18, carbs: 1.5, fat: 6 },
  { name: "Prosciutto crudo", category: "carne", kcal: 268, protein: 28, carbs: 0.3, fat: 17 },
  { name: "Bresaola", category: "carne", kcal: 151, protein: 32, carbs: 0.5, fat: 2.6 },
  { name: "Salame", category: "carne", kcal: 380, protein: 24, carbs: 1, fat: 31 },
  { name: "Bistecca di manzo (magra)", category: "carne", kcal: 158, protein: 26, carbs: 0, fat: 6 },
  { name: "Agnello (crudo)", category: "carne", kcal: 203, protein: 19, carbs: 0, fat: 14 },
  { name: "Coniglio (crudo)", category: "carne", kcal: 136, protein: 21, carbs: 0, fat: 5.5 },

  // ── Pesce ──────────────────────────────────────────────────────────────
  { name: "Salmone (crudo)", category: "pesce", kcal: 208, protein: 20.4, carbs: 0, fat: 13.4 },
  { name: "Tonno fresco (crudo)", category: "pesce", kcal: 144, protein: 23.3, carbs: 0, fat: 4.9 },
  { name: "Tonno in scatola (al naturale)", category: "pesce", kcal: 116, protein: 25.5, carbs: 0, fat: 0.8 },
  { name: "Merluzzo/Nasello (crudo)", category: "pesce", kcal: 82, protein: 17.8, carbs: 0, fat: 0.7 },
  { name: "Orata (cruda)", category: "pesce", kcal: 121, protein: 20, carbs: 0, fat: 4.5 },
  { name: "Branzino (crudo)", category: "pesce", kcal: 97, protein: 18.4, carbs: 0, fat: 2.5 },
  { name: "Sogliola (cruda)", category: "pesce", kcal: 84, protein: 17.5, carbs: 0, fat: 1.4 },
  { name: "Gamberi/Gamberetti (crudi)", category: "pesce", kcal: 71, protein: 17, carbs: 0.9, fat: 0.5 },
  { name: "Calamari (crudi)", category: "pesce", kcal: 68, protein: 15, carbs: 1.4, fat: 0.9 },
  { name: "Cozze (crude)", category: "pesce", kcal: 62, protein: 11.9, carbs: 2.2, fat: 1.5 },
  { name: "Sgombro (crudo)", category: "pesce", kcal: 205, protein: 19, carbs: 0, fat: 14 },
  { name: "Alici/Acciughe (crude)", category: "pesce", kcal: 96, protein: 20, carbs: 0, fat: 1.5 },

  // ── Uova e latticini ───────────────────────────────────────────────────
  { name: "Uovo di gallina (intero)", category: "uova_latticini", kcal: 143, protein: 12.6, carbs: 0.7, fat: 9.9 },
  { name: "Albume d'uovo", category: "uova_latticini", kcal: 48, protein: 10.9, carbs: 0.7, fat: 0.2 },
  { name: "Latte intero", category: "uova_latticini", kcal: 64, protein: 3.3, carbs: 4.9, fat: 3.6 },
  { name: "Latte parzialmente scremato", category: "uova_latticini", kcal: 46, protein: 3.4, carbs: 4.9, fat: 1.6 },
  { name: "Latte scremato", category: "uova_latticini", kcal: 35, protein: 3.4, carbs: 5, fat: 0.2 },
  { name: "Yogurt bianco intero", category: "uova_latticini", kcal: 66, protein: 3.6, carbs: 4.5, fat: 3.6 },
  { name: "Yogurt greco (0%)", category: "uova_latticini", kcal: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { name: "Yogurt greco intero", category: "uova_latticini", kcal: 97, protein: 9, carbs: 4, fat: 5 },
  { name: "Mozzarella", category: "uova_latticini", kcal: 253, protein: 18.7, carbs: 0.7, fat: 19.5 },
  { name: "Mozzarella light", category: "uova_latticini", kcal: 174, protein: 22, carbs: 1, fat: 9 },
  { name: "Parmigiano Reggiano", category: "uova_latticini", kcal: 392, protein: 33, carbs: 0, fat: 28 },
  { name: "Ricotta", category: "uova_latticini", kcal: 146, protein: 8.8, carbs: 3.5, fat: 10.9 },
  { name: "Fiocchi di latte magro", category: "uova_latticini", kcal: 78, protein: 13, carbs: 3.5, fat: 1.5 },
  { name: "Grana Padano", category: "uova_latticini", kcal: 384, protein: 33, carbs: 0, fat: 28 },
  { name: "Philadelphia/formaggio spalmabile", category: "uova_latticini", kcal: 253, protein: 5.5, carbs: 4, fat: 24 },
  { name: "Provola/Scamorza", category: "uova_latticini", kcal: 315, protein: 25, carbs: 1, fat: 24 },

  // ── Legumi ─────────────────────────────────────────────────────────────
  { name: "Ceci (cotti)", category: "legumi", kcal: 164, protein: 8.9, carbs: 27.4, fat: 2.6, fiber: 7.6 },
  { name: "Ceci (secchi)", category: "legumi", kcal: 316, protein: 20, carbs: 54, fat: 5, fiber: 15 },
  { name: "Lenticchie (cotte)", category: "legumi", kcal: 116, protein: 9, carbs: 20, fat: 0.4, fiber: 7.9 },
  { name: "Lenticchie (secche)", category: "legumi", kcal: 291, protein: 23, carbs: 52, fat: 1, fiber: 11 },
  { name: "Fagioli borlotti (cotti)", category: "legumi", kcal: 127, protein: 9.7, carbs: 19.3, fat: 0.6, fiber: 6.7 },
  { name: "Fagioli cannellini (cotti)", category: "legumi", kcal: 125, protein: 8.7, carbs: 20, fat: 0.5, fiber: 6.5 },
  { name: "Piselli (cotti)", category: "legumi", kcal: 81, protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.1 },
  { name: "Fave (cotte)", category: "legumi", kcal: 88, protein: 6.9, carbs: 15, fat: 0.5, fiber: 5.4 },
  { name: "Soia (semi cotti)", category: "legumi", kcal: 173, protein: 16.6, carbs: 9.9, fat: 9, fiber: 6 },
  { name: "Tofu", category: "legumi", kcal: 76, protein: 8, carbs: 1.9, fat: 4.8 },
  { name: "Edamame (cotti)", category: "legumi", kcal: 121, protein: 12, carbs: 9.9, fat: 5, fiber: 5.2 },

  // ── Verdura ────────────────────────────────────────────────────────────
  { name: "Pomodoro", category: "verdura", kcal: 19, protein: 1, carbs: 3.5, fat: 0.2, fiber: 1.2 },
  { name: "Zucchine", category: "verdura", kcal: 11, protein: 1.3, carbs: 1.4, fat: 0.2, fiber: 1.2 },
  { name: "Melanzane", category: "verdura", kcal: 18, protein: 1.2, carbs: 2.6, fat: 0.2, fiber: 2.6 },
  { name: "Peperoni", category: "verdura", kcal: 22, protein: 1, carbs: 3.5, fat: 0.4, fiber: 2.1 },
  { name: "Carote", category: "verdura", kcal: 35, protein: 1.1, carbs: 7.6, fat: 0.2, fiber: 3.1 },
  { name: "Insalata/Lattuga", category: "verdura", kcal: 15, protein: 1.4, carbs: 2.2, fat: 0.3, fiber: 1.5 },
  { name: "Spinaci", category: "verdura", kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { name: "Broccoli", category: "verdura", kcal: 27, protein: 3, carbs: 3.1, fat: 0.4, fiber: 2.6 },
  { name: "Cavolfiore", category: "verdura", kcal: 25, protein: 3.1, carbs: 2.7, fat: 0.3, fiber: 2.4 },
  { name: "Broccoletti/Cime di rapa", category: "verdura", kcal: 22, protein: 3.2, carbs: 1.8, fat: 0.5, fiber: 2.9 },
  { name: "Finocchi", category: "verdura", kcal: 9, protein: 1.2, carbs: 1.5, fat: 0.2, fiber: 2.2 },
  { name: "Cetrioli", category: "verdura", kcal: 12, protein: 0.7, carbs: 1.8, fat: 0.1, fiber: 0.8 },
  { name: "Cipolle", category: "verdura", kcal: 26, protein: 1.1, carbs: 5.7, fat: 0.1, fiber: 1.3 },
  { name: "Funghi champignon", category: "verdura", kcal: 20, protein: 3.1, carbs: 1.7, fat: 0.3, fiber: 1.9 },
  { name: "Zucca", category: "verdura", kcal: 18, protein: 1.1, carbs: 3.5, fat: 0.1, fiber: 1.5 },
  { name: "Asparagi", category: "verdura", kcal: 24, protein: 2.3, carbs: 3.3, fat: 0.2, fiber: 2.1 },
  { name: "Sedano", category: "verdura", kcal: 20, protein: 0.9, carbs: 3, fat: 0.2, fiber: 1.6 },
  { name: "Rucola", category: "verdura", kcal: 25, protein: 2.6, carbs: 2.1, fat: 0.7, fiber: 1.6 },
  { name: "Cavolo verza", category: "verdura", kcal: 27, protein: 2, carbs: 4.3, fat: 0.2, fiber: 2.5 },
  { name: "Aglio", category: "verdura", kcal: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 4.1 },

  // ── Frutta ─────────────────────────────────────────────────────────────
  { name: "Mela", category: "frutta", kcal: 52, protein: 0.3, carbs: 13.8, fat: 0.2, fiber: 2.4 },
  { name: "Banana", category: "frutta", kcal: 89, protein: 1.1, carbs: 22.8, fat: 0.3, fiber: 2.6 },
  { name: "Arancia", category: "frutta", kcal: 47, protein: 0.9, carbs: 11.8, fat: 0.1, fiber: 2.4 },
  { name: "Pera", category: "frutta", kcal: 57, protein: 0.4, carbs: 15.2, fat: 0.1, fiber: 3.1 },
  { name: "Kiwi", category: "frutta", kcal: 61, protein: 1.1, carbs: 14.7, fat: 0.5, fiber: 3 },
  { name: "Fragole", category: "frutta", kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2 },
  { name: "Uva", category: "frutta", kcal: 69, protein: 0.7, carbs: 18.1, fat: 0.2, fiber: 0.9 },
  { name: "Ananas", category: "frutta", kcal: 50, protein: 0.5, carbs: 13.1, fat: 0.1, fiber: 1.4 },
  { name: "Pesca", category: "frutta", kcal: 39, protein: 0.9, carbs: 9.5, fat: 0.3, fiber: 1.5 },
  { name: "Albicocca", category: "frutta", kcal: 48, protein: 1.4, carbs: 11.1, fat: 0.4, fiber: 2 },
  { name: "Mandarino/Clementina", category: "frutta", kcal: 53, protein: 0.8, carbs: 13.3, fat: 0.3, fiber: 1.8 },
  { name: "Melone", category: "frutta", kcal: 34, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 0.9 },
  { name: "Anguria", category: "frutta", kcal: 30, protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4 },
  { name: "Ciliegie", category: "frutta", kcal: 63, protein: 1.1, carbs: 14.3, fat: 0.2, fiber: 2.1 },
  { name: "Mirtilli", category: "frutta", kcal: 57, protein: 0.7, carbs: 14.5, fat: 0.3, fiber: 2.4 },
  { name: "Avocado", category: "frutta", kcal: 160, protein: 2, carbs: 8.5, fat: 14.7, fiber: 6.7 },
  { name: "Limone", category: "frutta", kcal: 29, protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8 },
  { name: "Frutti di bosco (misti)", category: "frutta", kcal: 43, protein: 0.8, carbs: 9.7, fat: 0.4, fiber: 3 },

  // ── Grassi, oli, frutta secca ──────────────────────────────────────────
  { name: "Olio extravergine d'oliva", category: "grassi_oli", kcal: 899, protein: 0, carbs: 0, fat: 100 },
  { name: "Burro", category: "grassi_oli", kcal: 717, protein: 0.9, carbs: 0.1, fat: 81.1 },
  { name: "Mandorle", category: "grassi_oli", kcal: 579, protein: 21.2, carbs: 21.6, fat: 49.9, fiber: 12.5 },
  { name: "Noci", category: "grassi_oli", kcal: 654, protein: 15.2, carbs: 13.7, fat: 65.2, fiber: 6.7 },
  { name: "Nocciole", category: "grassi_oli", kcal: 628, protein: 15, carbs: 16.7, fat: 60.8, fiber: 9.7 },
  { name: "Anacardi", category: "grassi_oli", kcal: 553, protein: 18.2, carbs: 30.2, fat: 43.9, fiber: 3.3 },
  { name: "Pistacchi", category: "grassi_oli", kcal: 562, protein: 20.3, carbs: 27.5, fat: 45.4, fiber: 10.3 },
  { name: "Arachidi", category: "grassi_oli", kcal: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },
  { name: "Burro di arachidi", category: "grassi_oli", kcal: 588, protein: 25, carbs: 20, fat: 50, fiber: 6 },
  { name: "Semi di chia", category: "grassi_oli", kcal: 486, protein: 16.5, carbs: 42.1, fat: 30.7, fiber: 34.4 },
  { name: "Semi di lino", category: "grassi_oli", kcal: 534, protein: 18.3, carbs: 28.9, fat: 42.2, fiber: 27.3 },

  // ── Dolci, snack, condimenti ───────────────────────────────────────────
  { name: "Zucchero bianco", category: "dolci_snack", kcal: 400, protein: 0, carbs: 100, fat: 0 },
  { name: "Miele", category: "dolci_snack", kcal: 304, protein: 0.3, carbs: 82.4, fat: 0 },
  { name: "Cioccolato fondente (70%)", category: "dolci_snack", kcal: 546, protein: 7.8, carbs: 45.9, fat: 34.5, fiber: 10.9 },
  { name: "Cioccolato al latte", category: "dolci_snack", kcal: 535, protein: 7.7, carbs: 57, fat: 30 },
  { name: "Nutella/crema spalmabile alle nocciole", category: "dolci_snack", kcal: 539, protein: 6.3, carbs: 57.5, fat: 30.9 },
  { name: "Marmellata", category: "dolci_snack", kcal: 250, protein: 0.4, carbs: 63, fat: 0.1 },
  { name: "Biscotti frollini", category: "dolci_snack", kcal: 450, protein: 6.5, carbs: 68, fat: 16 },
  { name: "Gelato alla crema", category: "dolci_snack", kcal: 216, protein: 3.9, carbs: 24, fat: 11 },
  { name: "Patatine fritte confezionate", category: "dolci_snack", kcal: 536, protein: 6.6, carbs: 53, fat: 34 },
  { name: "Barretta ai cereali", category: "dolci_snack", kcal: 400, protein: 7, carbs: 65, fat: 12, fiber: 4 },
  { name: "Maionese", category: "dolci_snack", kcal: 680, protein: 1.1, carbs: 2.5, fat: 75 },
  { name: "Ketchup", category: "dolci_snack", kcal: 101, protein: 1.7, carbs: 24, fat: 0.3 },

  // ── Bevande ────────────────────────────────────────────────────────────
  { name: "Succo d'arancia (100%)", category: "bevande", kcal: 45, protein: 0.7, carbs: 10.4, fat: 0.2 },
  { name: "Bevanda di soia", category: "bevande", kcal: 33, protein: 3.3, carbs: 1, fat: 1.8 },
  { name: "Bevanda di mandorla (non zuccherata)", category: "bevande", kcal: 15, protein: 0.5, carbs: 0.3, fat: 1.2 },
  { name: "Birra chiara", category: "bevande", kcal: 43, protein: 0.5, carbs: 3.6, fat: 0 },
  { name: "Vino rosso", category: "bevande", kcal: 85, protein: 0.1, carbs: 0.3, fat: 0 },
  { name: "Bevanda gassata zuccherata (cola)", category: "bevande", kcal: 42, protein: 0, carbs: 10.6, fat: 0 },
];
