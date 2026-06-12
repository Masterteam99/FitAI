// Elimina tutti gli account utente TRANNE quelli indicati con --keep.
// Il cascade Prisma su User rimuove anche piani, sessioni, analisi, log
// nutrizionali, achievement e account OAuth collegati (stessa semantica
// del DELETE /api/account).
//
// Uso: npx tsx scripts/cleanup-users.ts --keep email1[,email2] [--dry-run]

import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const keepIdx = process.argv.indexOf("--keep");
  const keepArg = keepIdx !== -1 ? process.argv[keepIdx + 1] : "";
  const keep = keepArg
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (keep.length === 0) {
    console.error("Specifica almeno una email da mantenere: --keep email1[,email2]");
    process.exit(1);
  }

  const all = await prisma.user.findMany({ select: { id: true, email: true, name: true, isAdmin: true } });
  const toKeep = all.filter((u) => keep.includes(u.email.toLowerCase()));
  const toDelete = all.filter((u) => !keep.includes(u.email.toLowerCase()));

  for (const email of keep) {
    if (!toKeep.some((u) => u.email.toLowerCase() === email)) {
      console.error(`⚠️ L'email da mantenere "${email}" NON esiste nel DB: interrompo per sicurezza.`);
      process.exit(1);
    }
  }

  console.log(`👥 ${all.length} utenti a DB — da mantenere: ${toKeep.length}, da eliminare: ${toDelete.length}${dryRun ? " (dry-run)" : ""}\n`);
  for (const u of toKeep) console.log(`  ✅ MANTIENI  ${u.email} (${u.name ?? "senza nome"})${u.isAdmin ? " [admin]" : ""}`);
  for (const u of toDelete) console.log(`  🗑️ ELIMINA   ${u.email} (${u.name ?? "senza nome"})`);

  if (dryRun) {
    console.log("\nDry-run: nessuna modifica effettuata.");
    return;
  }

  const ids = toDelete.map((u) => u.id);
  // AdminActionLog.actorId non ha cascade (l'audit trail sopravvive di norma
  // agli utenti): per una pulizia completa i log degli attori eliminati
  // vengono rimossi esplicitamente prima degli utenti.
  const [logs, result] = await prisma.$transaction([
    prisma.adminActionLog.deleteMany({ where: { actorId: { in: ids } } }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ]);
  console.log(`\n🧹 Eliminati ${result.count} account (con dati collegati via cascade) e ${logs.count} log admin dei rispettivi attori.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
