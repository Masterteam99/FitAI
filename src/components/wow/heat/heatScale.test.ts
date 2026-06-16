import { describe, it, expect } from "vitest";
import {
  volumeEnergyClass,
  recoveryEnergyClass,
  muscleClassesFromVolume,
  muscleClassesFromRecovery,
  deficitMuscles,
  MUSCLE_KEYS,
} from "./heatScale";

describe("volumeEnergyClass", () => {
  it("mappa le soglie volume sulle classi energy", () => {
    expect(volumeEnergyClass(0)).toBe("fill-energy-cold/30");
    expect(volumeEnergyClass(0.05)).toBe("fill-energy-cold/30");
    expect(volumeEnergyClass(0.2)).toBe("fill-energy-cool/60");
    expect(volumeEnergyClass(0.3)).toBe("fill-energy-cool/60");
    expect(volumeEnergyClass(0.5)).toBe("fill-energy-cool");
    expect(volumeEnergyClass(0.6)).toBe("fill-energy-cool");
    expect(volumeEnergyClass(0.8)).toBe("fill-energy-warm");
    expect(volumeEnergyClass(0.85)).toBe("fill-energy-warm");
    expect(volumeEnergyClass(0.95)).toBe("fill-energy-hot");
    expect(volumeEnergyClass(1)).toBe("fill-energy-hot");
  });
});

describe("recoveryEnergyClass", () => {
  it("mappa le soglie recovery sulle classi energy", () => {
    expect(recoveryEnergyClass(0)).toBe("fill-energy-hot");
    expect(recoveryEnergyClass(24)).toBe("fill-energy-hot");
    expect(recoveryEnergyClass(25)).toBe("fill-energy-warm");
    expect(recoveryEnergyClass(49)).toBe("fill-energy-warm");
    expect(recoveryEnergyClass(50)).toBe("fill-energy-cool/70");
    expect(recoveryEnergyClass(74)).toBe("fill-energy-cool/70");
    expect(recoveryEnergyClass(75)).toBe("fill-energy-cool");
    expect(recoveryEnergyClass(100)).toBe("fill-energy-cool");
  });
});

describe("muscleClassesFromVolume", () => {
  it("costruisce la mappa muscolo->classe", () => {
    const out = muscleClassesFromVolume({ CHEST: 0.9, CORE: 0.1 });
    expect(out.CHEST).toBe("fill-energy-hot");
    expect(out.CORE).toBe("fill-energy-cool/60");
  });
});

describe("muscleClassesFromRecovery", () => {
  it("usa recoveryPct per ciascun muscolo", () => {
    const out = muscleClassesFromRecovery({
      QUADRICEPS: { recoveryPct: 10 },
      CALVES: { recoveryPct: 90 },
    });
    expect(out.QUADRICEPS).toBe("fill-energy-hot");
    expect(out.CALVES).toBe("fill-energy-cool");
  });
});

describe("deficitMuscles", () => {
  it("ritorna i muscoli con deficit oltre soglia (default 50)", () => {
    const list = deficitMuscles([
      { muscle: "GLUTES", deficitPct: 70 },
      { muscle: "CORE", deficitPct: 30 },
    ]);
    expect(list).toEqual(["GLUTES"]);
  });
  it("soglia configurabile", () => {
    const list = deficitMuscles([{ muscle: "CORE", deficitPct: 30 }], 20);
    expect(list).toEqual(["CORE"]);
  });
});

describe("MUSCLE_KEYS", () => {
  it("contiene gli 11 gruppi muscolari", () => {
    expect(MUSCLE_KEYS).toHaveLength(11);
    expect(MUSCLE_KEYS).toContain("CHEST");
    expect(MUSCLE_KEYS).toContain("CALVES");
  });
});
