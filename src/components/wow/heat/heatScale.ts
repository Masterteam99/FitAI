export const MUSCLE_KEYS = [
  "CHEST", "BACK", "SHOULDERS", "BICEPS", "TRICEPS", "FOREARMS",
  "CORE", "QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES",
] as const;

export type MuscleKey = (typeof MUSCLE_KEYS)[number];

export type VolumeData = Record<string, number>; // 0..1 normalizzato
export type RecoveryData = Record<string, { recoveryPct: number; hoursSinceLast?: number | null }>;
export type ImbalanceData = Array<{ muscle: string; deficitPct: number }>;

export function volumeEnergyClass(value: number): string {
  if (value <= 0.05) return "fill-energy-cold/30";
  if (value <= 0.3) return "fill-energy-cool/60";
  if (value <= 0.6) return "fill-energy-cool";
  if (value <= 0.85) return "fill-energy-warm";
  return "fill-energy-hot";
}

export function recoveryEnergyClass(pct: number): string {
  if (pct < 25) return "fill-energy-hot";
  if (pct < 50) return "fill-energy-warm";
  if (pct < 75) return "fill-energy-cool/70";
  return "fill-energy-cool";
}

export function muscleClassesFromVolume(data: VolumeData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [muscle, value] of Object.entries(data)) {
    out[muscle] = volumeEnergyClass(value);
  }
  return out;
}

export function muscleClassesFromRecovery(data: RecoveryData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [muscle, info] of Object.entries(data)) {
    out[muscle] = recoveryEnergyClass(info.recoveryPct);
  }
  return out;
}

export function deficitMuscles(data: ImbalanceData, threshold = 50): string[] {
  return data.filter((i) => i.deficitPct > threshold).map((i) => i.muscle);
}
