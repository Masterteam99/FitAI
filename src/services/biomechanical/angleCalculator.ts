import { calculateAngle, getKeypoint, type Keypoint } from "@/lib/pose";
import type { JointAngles } from "@/types/analysis";

export function computeJointAngles(keypoints: Keypoint[]): JointAngles {
  const get = (name: Parameters<typeof getKeypoint>[1]) => getKeypoint(keypoints, name);

  const angles: JointAngles = {};

  // Gomito sinistro: polso-gomito-spalla
  const lw = get("left_wrist"), le = get("left_elbow"), ls = get("left_shoulder");
  if (lw && le && ls && lw.score > 0.3 && le.score > 0.3 && ls.score > 0.3) {
    angles.leftElbow = calculateAngle(lw, le, ls);
  }

  // Gomito destro
  const rw = get("right_wrist"), re = get("right_elbow"), rs = get("right_shoulder");
  if (rw && re && rs && rw.score > 0.3 && re.score > 0.3 && rs.score > 0.3) {
    angles.rightElbow = calculateAngle(rw, re, rs);
  }

  // Spalla sinistra: gomito-spalla-anca
  const lh = get("left_hip");
  if (le && ls && lh && le.score > 0.3 && ls.score > 0.3 && lh.score > 0.3) {
    angles.leftShoulder = calculateAngle(le, ls, lh);
  }

  // Spalla destra
  const rh = get("right_hip");
  if (re && rs && rh && re.score > 0.3 && rs.score > 0.3 && rh.score > 0.3) {
    angles.rightShoulder = calculateAngle(re, rs, rh);
  }

  // Anca sinistra: spalla-anca-ginocchio
  const lk = get("left_knee");
  if (ls && lh && lk && ls.score > 0.3 && lh.score > 0.3 && lk.score > 0.3) {
    angles.leftHip = calculateAngle(ls, lh, lk);
  }

  // Anca destra
  const rk = get("right_knee");
  if (rs && rh && rk && rs.score > 0.3 && rh.score > 0.3 && rk.score > 0.3) {
    angles.rightHip = calculateAngle(rs, rh, rk);
  }

  // Ginocchio sinistro: anca-ginocchio-caviglia
  const la = get("left_ankle");
  if (lh && lk && la && lh.score > 0.3 && lk.score > 0.3 && la.score > 0.3) {
    angles.leftKnee = calculateAngle(lh, lk, la);
  }

  // Ginocchio destro
  const ra = get("right_ankle");
  if (rh && rk && ra && rh.score > 0.3 && rk.score > 0.3 && ra.score > 0.3) {
    angles.rightKnee = calculateAngle(rh, rk, ra);
  }

  // Inclinazione della colonna (approssimazione: angolo spalla-anca rispetto verticale)
  if (ls && rs && lh && rh && ls.score > 0.3 && lh.score > 0.3) {
    const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2, score: 1, name: "mid_shoulder" };
    const midHip = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2, score: 1, name: "mid_hip" };
    const vertical = { x: midHip.x, y: midHip.y - 100, score: 1, name: "vertical" };
    angles.spineInclination = calculateAngle(midShoulder, midHip, vertical);
  }

  return angles;
}
