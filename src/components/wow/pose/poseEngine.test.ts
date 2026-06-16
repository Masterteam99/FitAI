import { describe, it, expect } from "vitest";
import { lerpPose, errorJoint, ARCHETYPES, SEGMENTS, JOINTS } from "./poseEngine";

describe("lerpPose", () => {
  const a = ARCHETYPES.squat.start;
  const b = ARCHETYPES.squat.end;

  it("a t=0 ritorna la posa iniziale", () => {
    const p = lerpPose(a, b, 0);
    expect(p.hip).toEqual(a.hip);
    expect(p.knee).toEqual(a.knee);
  });
  it("a t=1 ritorna la posa finale", () => {
    const p = lerpPose(a, b, 1);
    expect(p.knee).toEqual(b.knee);
  });
  it("a t=0.5 ritorna il punto medio di ogni giunto", () => {
    const p = lerpPose(a, b, 0.5);
    expect(p.hip[0]).toBeCloseTo((a.hip[0] + b.hip[0]) / 2);
    expect(p.hip[1]).toBeCloseTo((a.hip[1] + b.hip[1]) / 2);
  });
  it("clampa t fuori range", () => {
    expect(lerpPose(a, b, -1).hip).toEqual(a.hip);
    expect(lerpPose(a, b, 2).hip).toEqual(b.hip);
  });
});

describe("errorJoint", () => {
  const pose = ARCHETYPES.squat.end;
  it("'knee' ritorna il punto del ginocchio", () => {
    expect(errorJoint("knee", pose)).toEqual(pose.knee);
  });
  it("'hip' ritorna il punto dell'anca", () => {
    expect(errorJoint("hip", pose)).toEqual(pose.hip);
  });
  it("'back' ritorna il punto medio tra spalla e anca", () => {
    const [x, y] = errorJoint("back", pose);
    expect(x).toBeCloseTo((pose.shoulder[0] + pose.hip[0]) / 2);
    expect(y).toBeCloseTo((pose.shoulder[1] + pose.hip[1]) / 2);
  });
});

describe("dati", () => {
  it("ogni archetipo ha start ed end con tutti i giunti", () => {
    for (const key of Object.keys(ARCHETYPES) as Array<keyof typeof ARCHETYPES>) {
      for (const phase of ["start", "end"] as const) {
        const pose = ARCHETYPES[key][phase];
        for (const j of JOINTS) {
          expect(pose[j], `${key}.${phase}.${j}`).toBeDefined();
          expect(pose[j]).toHaveLength(2);
        }
      }
    }
  });
  it("ogni segmento collega due giunti noti", () => {
    for (const [from, to] of SEGMENTS) {
      expect(JOINTS).toContain(from);
      expect(JOINTS).toContain(to);
    }
  });
});
