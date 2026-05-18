"use client";

import { useEffect, useRef, useCallback } from "react";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { computeJointAngles } from "@/services/biomechanical/angleCalculator";
import { mapLandmarksToKeypoints, mapWorldLandmarks } from "@/lib/pose";
import { useAnalysisStore } from "@/stores/analysisStore";
import type { FrameAnalysis } from "@/types/analysis";

interface UsePoseDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
}

const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

/**
 * Hook silent acquisitore per Analisi v2.
 * Esegue MediaPipe pose detection sui frame video e popola lo store con
 * keypoints 2D + worldKeypoints 3D + angoli articolari.
 *
 * NON disegna skeleton, NON calcola violazioni real-time, NON emette feedback.
 * Tutta la logica di valutazione è post-acquisizione (vedi /api/analysis/complete).
 */
export function usePoseDetection({ videoRef, enabled }: UsePoseDetectionProps) {
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const lastVideoTimeRef = useRef(-1);
  const addFrame = useAnalysisStore((s) => s.addFrame);
  const isRecording = useAnalysisStore((s) => s.isRecording);

  const initPoseLandmarker = useCallback(async () => {
    if (typeof window === "undefined" || landmarkerRef.current) return;
    try {
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
      landmarkerRef.current = landmarker;
    } catch (err) {
      console.error("MediaPipe init error:", err);
    }
  }, []);

  const detectLoop = useCallback(() => {
    if (!enabled || !isRecording) return;
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      try {
        const result = landmarker.detectForVideo(video, performance.now());
        const landmarks = result.landmarks[0];
        const worldLandmarks = result.worldLandmarks?.[0];
        if (landmarks && landmarks.length > 0) {
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 480;
          const keypoints = mapLandmarksToKeypoints(landmarks, w, h);
          const worldKeypoints = worldLandmarks ? mapWorldLandmarks(worldLandmarks) : undefined;
          // Preferiamo angoli 3D se disponibili (indipendenti da angolazione camera)
          const angles = computeJointAngles(worldKeypoints ?? keypoints);

          const frame: FrameAnalysis = {
            timestamp: Date.now(),
            keypoints,
            worldKeypoints,
            angles,
          };
          addFrame(frame);
        }
      } catch {
        // Errore singolo frame: ignoriamo, continua il loop
      }
    }

    rafRef.current = requestAnimationFrame(detectLoop);
  }, [enabled, isRecording, videoRef, addFrame]);

  useEffect(() => {
    if (enabled) initPoseLandmarker();
  }, [enabled, initPoseLandmarker]);

  useEffect(() => {
    if (enabled && isRecording) {
      lastVideoTimeRef.current = -1;
      rafRef.current = requestAnimationFrame(detectLoop);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, isRecording, detectLoop]);

  useEffect(() => {
    return () => {
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);
}
