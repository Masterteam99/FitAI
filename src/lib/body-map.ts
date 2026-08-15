import { prisma } from "./prisma";
import type { MuscleGroup } from "@/generated/prisma";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const TRACKED_MUSCLES: MuscleGroup[] = [
  "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "FOREARMS",
  "CORE", "QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES",
];

export type VolumeMap = Record<MuscleGroup, number>;
export type RecoveryMap = Record<MuscleGroup, { hoursSinceLast: number | null; recoveryPct: number }>;
export type ImbalanceItem = { muscle: MuscleGroup; deficitPct: number; daysSinceLast: number | null; message: string };

function emptyMap(): VolumeMap {
  return TRACKED_MUSCLES.reduce((acc, m) => ({ ...acc, [m]: 0 }), {} as VolumeMap);
}

/**
 * Volume heatmap: numero di esercizi per muscolo completati negli ultimi `days` giorni,
 * normalizzato 0-1 sul valore massimo.
 */
export async function computeVolumeHeatmap(userId: string, days = 30): Promise<{
  raw: VolumeMap;
  normalized: VolumeMap;
}> {
  const since = new Date(Date.now() - days * DAY_MS);

  const sessions = await prisma.workoutSession.findMany({
    where: { userId, status: "COMPLETED", completedAt: { gte: since } },
    select: {
      exercises: {
        select: {
          completedSets: true,
          exercise: { select: { muscleGroupPrimary: true } },
        },
      },
    },
  });

  const raw = emptyMap();
  for (const s of sessions) {
    for (const ex of s.exercises) {
      const muscle = ex.exercise.muscleGroupPrimary;
      if (muscle === "FULL_BODY") {
        for (const m of TRACKED_MUSCLES) raw[m] += 0.5;
      } else if (TRACKED_MUSCLES.includes(muscle)) {
        const sets = Array.isArray(ex.completedSets) ? ex.completedSets.length : 1;
        raw[muscle] += Math.max(1, sets);
      }
    }
  }

  const max = Math.max(1, ...Object.values(raw));
  const normalized = emptyMap();
  for (const m of TRACKED_MUSCLES) normalized[m] = raw[m] / max;

  return { raw, normalized };
}

/**
 * Recovery: per ogni muscolo calcola ore dall'ultimo allenamento e una % di recovery (48h = 100%).
 */
export async function computeRecovery(userId: string): Promise<RecoveryMap> {
  const since = new Date(Date.now() - 14 * DAY_MS);
  const sessions = await prisma.workoutSession.findMany({
    where: { userId, status: "COMPLETED", completedAt: { gte: since } },
    select: {
      completedAt: true,
      exercises: {
        select: { exercise: { select: { muscleGroupPrimary: true } } },
      },
    },
    orderBy: { completedAt: "desc" },
  });

  const lastByMuscle = new Map<MuscleGroup, Date>();
  for (const s of sessions) {
    if (!s.completedAt) continue;
    for (const ex of s.exercises) {
      const muscle = ex.exercise.muscleGroupPrimary;
      if (muscle === "FULL_BODY") {
        for (const m of TRACKED_MUSCLES) {
          if (!lastByMuscle.has(m)) lastByMuscle.set(m, s.completedAt);
        }
      } else if (TRACKED_MUSCLES.includes(muscle) && !lastByMuscle.has(muscle)) {
        lastByMuscle.set(muscle, s.completedAt);
      }
    }
  }

  const result = {} as RecoveryMap;
  const now = Date.now();
  for (const m of TRACKED_MUSCLES) {
    const last = lastByMuscle.get(m);
    if (!last) {
      result[m] = { hoursSinceLast: null, recoveryPct: 100 };
    } else {
      const hours = (now - last.getTime()) / HOUR_MS;
      const pct = Math.min(100, Math.round((hours / 48) * 100));
      result[m] = { hoursSinceLast: Math.round(hours), recoveryPct: pct };
    }
  }
  return result;
}

/**
 * Imbalances: muscoli con deficit > 50% rispetto alla media nei giorni di riferimento.
 */
export async function computeImbalances(userId: string, days = 30): Promise<ImbalanceItem[]> {
  const { raw } = await computeVolumeHeatmap(userId, days);
  const values = Object.values(raw);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  // Nessun volume registrato in assoluto (account nuovo, mai allenato): non ci
  // sono dati su cui calcolare uno squilibrio relativo, quindi non ne mostriamo
  // nessuno — mostrare "100% deficit ovunque" sarebbe un falso segnale.
  if (avg === 0) return [];

  const recovery = await computeRecovery(userId);
  const items: ImbalanceItem[] = [];
  for (const muscle of TRACKED_MUSCLES) {
    const v = raw[muscle];
    const deficit = avg > 0 ? Math.round(((avg - v) / avg) * 100) : 0;
    if (deficit > 50) {
      const hours = recovery[muscle].hoursSinceLast;
      const daysSinceLast = hours === null ? null : Math.round(hours / 24);
      const label = muscleLabel(muscle);
      const message = daysSinceLast === null
        ? `${label}: mai allenato di recente`
        : `${label}: non alleni da ${daysSinceLast} ${daysSinceLast === 1 ? "giorno" : "giorni"}`;
      items.push({ muscle, deficitPct: deficit, daysSinceLast, message });
    }
  }
  return items.sort((a, b) => b.deficitPct - a.deficitPct);
}

export function muscleLabel(m: MuscleGroup): string {
  const map: Record<MuscleGroup, string> = {
    CHEST: "Petto",
    BACK: "Schiena",
    SHOULDERS: "Spalle",
    BICEPS: "Bicipiti",
    TRICEPS: "Tricipiti",
    FOREARMS: "Avambracci",
    CORE: "Core",
    QUADRICEPS: "Quadricipiti",
    HAMSTRINGS: "Femorali",
    GLUTES: "Glutei",
    CALVES: "Polpacci",
    FULL_BODY: "Full body",
  };
  return map[m] ?? m;
}
