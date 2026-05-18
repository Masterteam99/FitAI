"use client";

export type OnboardingState = {
  primaryGoal?: string;
  fitnessLevel?: string;
  availableEquipment?: string[];
  age?: number;
  weightKg?: number;
  heightCm?: number;
  gender?: string;
  weeklyWorkoutDays?: number;
  dietType?: string;
  pastInjuries?: string[];
  pastSports?: string[];
};

const KEY = "fitai-onboarding";

export function readOnboarding(): OnboardingState {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as OnboardingState) : {};
  } catch {
    return {};
  }
}

export function writeOnboarding(patch: Partial<OnboardingState>) {
  if (typeof window === "undefined") return;
  const next = { ...readOnboarding(), ...patch };
  sessionStorage.setItem(KEY, JSON.stringify(next));
}

export function clearOnboarding() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
