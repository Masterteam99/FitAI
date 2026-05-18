import { config } from "dotenv";
config({ path: ".env.local" });

const { PrismaClient } = await import("../src/generated/prisma/default.js");
const { PrismaPg } = await import("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const exs = await prisma.exercise.findMany({
  where: { slug: { in: ["squat", "push-up"] } },
  select: { slug: true, id: true, isActive: true },
});
console.log(JSON.stringify(exs, null, 2));
console.log("Total active:", await prisma.exercise.count({ where: { isActive: true } }));
await prisma.$disconnect();
