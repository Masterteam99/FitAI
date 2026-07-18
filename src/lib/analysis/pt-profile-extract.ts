"use client";

import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { computeJointAngles } from "@/services/biomechanical/angleCalculator";
import { mapLandmarksToKeypoints, mapWorldLandmarks } from "@/lib/pose";
import { detectPhases } from "@/services/biomechanical/phaseDetector";
import { buildReferenceProfile } from "@/services/analysis/referenceProfile";
import type { FrameAnalysis, ReferenceProfile } from "@/types/analysis";

const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export const PT_SAMPLE_FPS = 12;

/**
 * Estrae il profilo biomeccanico di riferimento da un video PT.
 * Gira nel browser admin: riproduce il video nascosto, campiona a PT_SAMPLE_FPS,
 * gira MediaPipe frame-per-frame e riduce a un ReferenceProfile.
 * Va invocato UNA VOLTA all'upload/ri-processo; il risultato viene salvato su Exercise.
 */
export async function extractReferenceProfileFromVideo(
  url: string,
  exerciseSlug: string,
  fps: number = PT_SAMPLE_FPS
): Promise<ReferenceProfile> {
  const vision = await FilesetResolver.forVisionTasks(WASM_BASE);
  const landmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false,
  });

  try {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    await new Promise<void>((resolve, reject) => {
      video.addEventListener("loadedmetadata", () => resolve(), { once: true });
      video.addEventListener("error", () => reject(new Error("Video PT non caricabile (CORS/formato)")), { once: true });
    });

    const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
    if (duration === 0) throw new Error("Durata video PT non leggibile");

    const step = 1 / fps;
    const frames: FrameAnalysis[] = [];

    for (let t = 0; t < duration; t += step) {
      await new Promise<void>((seekResolve) => {
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          seekResolve();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = Math.min(t, duration - 0.01);
      });
      if (video.videoWidth === 0) continue;
      const result = landmarker.detectForVideo(video, performance.now());
      const landmarks = result.landmarks[0];
      const worldLandmarks = result.worldLandmarks?.[0];
      if (!landmarks || landmarks.length === 0) continue;
      const keypoints = mapLandmarksToKeypoints(landmarks, video.videoWidth, video.videoHeight);
      const worldKeypoints = worldLandmarks ? mapWorldLandmarks(worldLandmarks) : undefined;
      const angles = computeJointAngles(worldKeypoints ?? keypoints);
      frames.push({ timestamp: Math.round(t * 1000), keypoints, worldKeypoints, angles });
    }

    const timeline = detectPhases(frames, exerciseSlug);
    return buildReferenceProfile(frames, timeline, { fps });
  } finally {
    landmarker.close();
  }
}
