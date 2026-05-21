import { config } from "dotenv";
config({ path: ".env.local" });

const { PrismaClient } = await import("../src/generated/prisma/default.js");
const { PrismaPg } = await import("@prisma/adapter-pg");

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/reset-quota.mjs <email>");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } });
if (!user) {
  console.error(`User not found: ${email}`);
  await prisma.$disconnect();
  process.exit(1);
}

const now = new Date();
const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

const before = await prisma.usageCounter.findMany({
  where: { userId: user.id, period },
  select: { feature: true, count: true, period: true },
});
console.log("Before:", JSON.stringify(before, null, 2));

const deleted = await prisma.usageCounter.deleteMany({
  where: { userId: user.id, period },
});
console.log(`Deleted ${deleted.count} counter rows for user ${user.email} period ${period}`);

await prisma.$disconnect();
