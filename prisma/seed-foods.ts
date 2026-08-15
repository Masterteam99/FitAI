// File: prisma/seed-foods.ts
// Esegui con: npx tsx prisma/seed-foods.ts

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { FOOD_SEED_DATA } from "./seed-foods-data";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

async function main() {
  console.log(`🌱 Seeding ${FOOD_SEED_DATA.length} alimenti...`);
  let created = 0;
  let updated = 0;

  for (const f of FOOD_SEED_DATA) {
    const nameNormalized = normalize(f.name);
    const data = {
      name: f.name,
      nameNormalized,
      category: f.category,
      caloriesPer100g: f.kcal,
      proteinPer100g: f.protein,
      carbsPer100g: f.carbs,
      fatPer100g: f.fat,
      fiberPer100g: f.fiber ?? 0,
      source: "curated",
    };
    const existing = await prisma.food.findUnique({ where: { nameNormalized } });
    if (existing) {
      await prisma.food.update({ where: { nameNormalized }, data });
      updated++;
    } else {
      await prisma.food.create({ data });
      created++;
    }
  }

  console.log(`✅ Alimenti: ${created} creati, ${updated} aggiornati`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
