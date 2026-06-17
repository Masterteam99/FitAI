import { describe, it, expect } from "vitest";
import { exerciseToArchetype, inferErrorMarker } from "./exerciseMapping";

describe("exerciseToArchetype", () => {
  it("riconosce lo squat (slug e nome)", () => {
    expect(exerciseToArchetype({ slug: "back-squat", name: "Back Squat" })).toBe("squat");
    expect(exerciseToArchetype({ name: "Accosciata" })).toBe("squat");
  });
  it("riconosce i pattern hinge", () => {
    expect(exerciseToArchetype({ slug: "stacco-rumeno", name: "Stacco rumeno" })).toBe("hinge");
    expect(exerciseToArchetype({ name: "Romanian Deadlift" })).toBe("hinge");
    expect(exerciseToArchetype({ name: "Hip Thrust" })).toBe("hinge");
  });
  it("ritorna null per esercizi non mappabili", () => {
    expect(exerciseToArchetype({ slug: "panca-piana", name: "Bench Press" })).toBeNull();
    expect(exerciseToArchetype({})).toBeNull();
  });
});

describe("inferErrorMarker", () => {
  it("mappa il ginocchio", () => {
    expect(inferErrorMarker(["Le ginocchia cedono verso l'interno"])?.key).toBe("knee");
  });
  it("mappa la schiena", () => {
    expect(inferErrorMarker(["Mantieni la schiena piu neutra"])?.key).toBe("back");
  });
  it("mappa l'anca", () => {
    expect(inferErrorMarker(["Spingi di piu con l'anca"])?.key).toBe("hip");
  });
  it("salta i testi vuoti e ritorna il primo match", () => {
    expect(inferErrorMarker([null, "", "valgo del ginocchio"])?.key).toBe("knee");
  });
  it("ritorna null senza match", () => {
    expect(inferErrorMarker(["ottimo lavoro", null])).toBeNull();
  });
});
