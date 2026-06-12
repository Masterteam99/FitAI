// Carica in bulk i video PT dalla cartella "VIDEO PT PER APP/" su Supabase
// Storage (bucket exercise-videos, path pt/{slug}.{ext}) e aggiorna
// Exercise.videoUrl, replicando la convenzione della route admin
// src/app/api/admin/exercises/[id]/pt-video/route.ts.
//
// Uso: npx tsx scripts/upload-pt-videos.ts [--dry-run]
//
// Abbinamento file → esercizio: il nome file (senza estensione e senza
// suffisso " PT") viene normalizzato e risolto in ordine con:
//   1. mappa alias esplicita (nomi italiani → slug)
//   2. match diretto sullo slug
//   3. match case-insensitive su Exercise.name
// Riusabile: aggiungi nuovi video nella cartella e rilancia.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const VIDEO_DIR = "VIDEO PT PER APP";
const BUCKET = "exercise-videos";
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const MIME_BY_EXT: Record<string, string> = {
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

// Nomi file italiani → slug esercizio (estendere qui per nuovi video)
const SLUG_ALIASES: Record<string, string> = {
  "piegamenti": "push-up",
  "push-up": "push-up",
  "flessioni": "push-up",
  "stacco": "stacco-da-terra",
  "stacchi-rumeni": "romanian-deadlift",
  "stacco-rumeno": "romanian-deadlift",
  "panca": "panca-piana",
  "trazioni-sbarra": "trazioni",
  "rematore": "rematore-bilanciere",
  "curl": "curl-bicipiti",
  "curl-bicipiti-manubri": "curl-bicipiti",
  "bulgarian-squat": "bulgarian-split-squat",
  "alzate-laterali": "lateral-raise",
  "alzate-frontali": "front-raise",
  "croci": "chest-fly",
  "french-press": "skull-crusher",
  "lat-machine": "lat-pulldown",
  "pulley": "seated-cable-row",
};

// Normalizza il nome file: toglie estensione, suffisso " PT" ed eventuale
// variante "#N". Ritorna anche il flag variante: i "#2" sono take alternativi
// dello stesso esercizio e vengono ignorati (un solo videoUrl per esercizio).
function normalize(filename: string): { key: string; isVariant: boolean } {
  const base = basename(filename, extname(filename)).toLowerCase().trim();
  const variantMatch = base.match(/#\s*\d+\s*$/);
  const cleaned = base
    .replace(/#\s*\d+\s*$/, "")
    .replace(/\s+pt\s*$/i, "")
    .trim()
    .replace(/\s+/g, "-");
  return { key: cleaned, isVariant: !!variantMatch };
}

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} non configurato`);
  return value;
}

const supabase = createClient(
  requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function resolveExercise(key: string) {
  const slug = SLUG_ALIASES[key] ?? key;
  const bySlug = await prisma.exercise.findUnique({ where: { slug }, select: { id: true, slug: true, name: true, videoUrl: true } });
  if (bySlug) return bySlug;
  return prisma.exercise.findFirst({
    where: { name: { equals: key.replace(/-/g, " "), mode: "insensitive" } },
    select: { id: true, slug: true, name: true, videoUrl: true },
  });
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const files = readdirSync(VIDEO_DIR).filter((f) => MIME_BY_EXT[extname(f).toLowerCase()]);
  if (files.length === 0) {
    console.log(`Nessun video (.mp4/.webm/.mov) trovato in "${VIDEO_DIR}/"`);
    return;
  }

  console.log(`🎬 ${files.length} video in "${VIDEO_DIR}/"${dryRun ? " (dry-run)" : ""}\n`);
  const uploaded: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const file of files) {
    const fullPath = join(VIDEO_DIR, file);
    const { key, isVariant } = normalize(file);
    const ext = extname(file).toLowerCase();
    const sizeMb = statSync(fullPath).size / 1024 / 1024;

    if (isVariant) {
      console.log(`  ⏭️ ${file}: variante "#N" ignorata (un solo video per esercizio; per usarla, rinomina il file senza #N)`);
      skipped.push(file);
      continue;
    }

    if (statSync(fullPath).size > MAX_VIDEO_BYTES) {
      console.log(`  ❌ ${file}: ${sizeMb.toFixed(1)}MB oltre il limite di 50MB`);
      failed.push(file);
      continue;
    }

    const exercise = await resolveExercise(key);
    if (!exercise) {
      console.log(`  ⚠️ ${file}: nessun esercizio per "${key}" (aggiungi un alias in SLUG_ALIASES)`);
      skipped.push(file);
      continue;
    }

    const storagePath = `pt/${exercise.slug}${ext === ".mov" ? ".mov" : ext}`;
    console.log(`  ⬆️ ${file} (${sizeMb.toFixed(1)}MB) → ${exercise.name} [${exercise.slug}] → ${storagePath}${exercise.videoUrl ? " (sostituisce video esistente)" : ""}`);
    if (dryRun) continue;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, readFileSync(fullPath), { upsert: true, contentType: MIME_BY_EXT[ext] });
    if (uploadError) {
      console.log(`  ❌ ${file}: errore upload — ${uploadError.message}`);
      failed.push(file);
      continue;
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    await prisma.exercise.update({ where: { id: exercise.id }, data: { videoUrl: pub.publicUrl } });
    console.log(`     ✅ videoUrl aggiornato: ${pub.publicUrl}`);
    uploaded.push(file);
  }

  console.log(`\n📊 Risultato: ${uploaded.length} caricati · ${skipped.length} non abbinati · ${failed.length} falliti`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
