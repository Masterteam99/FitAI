"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useAnalysisStore } from "@/stores/analysisStore";
import { Loader2 } from "lucide-react";
import { captureFrame, extractProFrames, type LabeledFrame } from "@/lib/analysis/frame-capture";
import { AnalysisErrorState } from "@/components/analisi/AnalysisErrorState";
import { AnalysisProcessingView } from "@/components/analisi/AnalysisProcessingView";
import { RecordingStage } from "@/components/analisi/RecordingStage";
import { copy } from "@/content/copy";

type Phase = "IDLE" | "COUNTDOWN" | "RECORDING" | "UPLOADING" | "ANALYZING" | "ERROR";

interface ExerciseData {
  id: string;
  name: string;
  slug: string;
  videoUrl?: string;
  professionalNotes?: string;
  recordingDurationSeconds: number;
}

const COUNTDOWN_SECONDS = 15;
const NUM_USER_FRAMES = 8;

function SessioneContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const exerciseId = searchParams.get("id");

  const [phase, setPhase] = useState<Phase>("IDLE");
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [analysisSessionId, setAnalysisSessionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const userFramesRef = useRef<LabeledFrame[]>([]);
  const proFramesRef = useRef<LabeledFrame[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const frameTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { videoRef, stream, isLoading: cameraLoading, error: cameraError, startCamera, stopCamera } = useCamera();
  const { startRecording: storeStart, stopRecording: storeStop, frameHistory, reset: storeReset } = useAnalysisStore();

  usePoseDetection({ videoRef, enabled: !!stream && phase === "RECORDING" });

  // Load exercise + create analysisSession
  useEffect(() => {
    if (!exerciseId) return;
    fetch("/api/analysis/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setExercise(data.exercise);
        setAnalysisSessionId(data.analysisSessionId);
      })
      .catch(() => setError(copy.analisiSessione.exerciseNotFound));
  }, [exerciseId]);

  const cleanup = useCallback(() => {
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    if (frameTimerRef.current) { clearInterval(frameTimerRef.current); frameTimerRef.current = null; }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const finalize = useCallback(async (videoBlob: Blob) => {
    if (!analysisSessionId || !exercise) return;
    setPhase("UPLOADING");
    setAnalysisStep(0);

    try {
      // 1. Upload video
      const fd = new FormData();
      fd.append("video", videoBlob, "user-recording.webm");
      fd.append("analysisSessionId", analysisSessionId);
      const uploadRes = await fetch("/api/analysis/upload-video", { method: "POST", body: fd });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error ?? copy.analisiSessione.uploadFailed);
      }

      // 2. Run analysis
      setPhase("ANALYZING");
      setAnalysisStep(1);
      const completeRes = await fetch("/api/analysis/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisSessionId,
          frameHistory,
          userFrames: userFramesRef.current,
          proFrames: proFramesRef.current,
          durationSeconds: exercise.recordingDurationSeconds,
        }),
      });
      const data = await completeRes.json();
      setAnalysisStep(2);
      if (!completeRes.ok || data.error) {
        throw new Error(data.error ?? copy.analisiSessione.analysisFailed);
      }
      router.push(`/analisi/report/${data.analysisSessionId}`);
    } catch (e) {
      setPhase("ERROR");
      setError(e instanceof Error ? e.message : copy.analisiSessione.processingError);
    } finally {
      stopCamera();
      storeReset();
    }
  }, [analysisSessionId, exercise, frameHistory, router, stopCamera, storeReset]);

  const startRecordingPhase = useCallback(() => {
    if (!exercise || !stream || !analysisSessionId) return;
    const duration = exercise.recordingDurationSeconds;

    // Reset & init
    chunksRef.current = [];
    userFramesRef.current = [];
    setElapsedSeconds(0);
    storeStart(analysisSessionId);

    // MediaRecorder
    const mimeOptions = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    const mimeType = mimeOptions.find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type ?? "video/webm" });
      finalize(blob);
    };
    recorder.start();
    recorderRef.current = recorder;

    setPhase("RECORDING");

    // Timer durata
    recordingTimerRef.current = setInterval(() => {
      setElapsedSeconds((s) => {
        const next = s + 0.25;
        if (next >= duration) {
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
          if (frameTimerRef.current) clearInterval(frameTimerRef.current);
          storeStop();
          if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
          return duration;
        }
        return next;
      });
    }, 250);

    // Snapshot frame uniformi
    const interval = (duration * 1000) / NUM_USER_FRAMES;
    let frameIdx = 0;
    frameTimerRef.current = setInterval(async () => {
      if (!videoRef.current || frameIdx >= NUM_USER_FRAMES) return;
      const snap = await captureFrame(videoRef.current);
      if (snap) {
        userFramesRef.current.push({ ...snap, label: `t=${(frameIdx * interval / 1000).toFixed(1)}s` });
      }
      frameIdx++;
    }, interval);
  }, [exercise, stream, analysisSessionId, finalize, storeStart, storeStop, videoRef]);

  const startCountdown = useCallback(async () => {
    setPhase("COUNTDOWN");
    setCountdown(COUNTDOWN_SECONDS);
    proFramesRef.current = [];
    if (exercise?.videoUrl) {
      // Estrazione PT frames in parallelo al countdown — best-effort, fallisce silenziosamente su CORS
      extractProFrames(exercise.videoUrl, 6).then((frames) => {
        proFramesRef.current = frames;
      });
    }
    await startCamera();
  }, [startCamera, exercise?.videoUrl]);

  const onCountdownComplete = useCallback(() => {
    if (phase !== "COUNTDOWN") return;
    startRecordingPhase();
  }, [phase, startRecordingPhase]);

  const retry = useCallback(() => {
    setError(null);
    setPhase("IDLE");
    storeReset();
  }, [storeReset]);

  if (!exerciseId || (error && phase === "IDLE")) {
    return <AnalysisErrorState message={error ?? copy.analisiSessione.noExerciseSelected} />;
  }

  if (phase === "ERROR") {
    return (
      <AnalysisErrorState
        title={copy.analisiSessione.notCompletedTitle}
        message={error ?? copy.analisiSessione.processingError}
        onRetry={retry}
      />
    );
  }

  if (phase === "UPLOADING" || phase === "ANALYZING") {
    return <AnalysisProcessingView uploading={phase === "UPLOADING"} analysisStep={analysisStep} />;
  }

  return (
    <RecordingStage
      phase={phase}
      exercise={exercise}
      videoRef={videoRef}
      stream={stream}
      countdown={countdown}
      elapsedSeconds={elapsedSeconds}
      cameraError={cameraError}
      cameraLoading={cameraLoading}
      canStart={!!analysisSessionId}
      onCountdownComplete={onCountdownComplete}
      onStart={startCountdown}
    />
  );
}

export default function SessionePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SessioneContent />
    </Suspense>
  );
}
