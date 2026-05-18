"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useAnalysisStore } from "@/stores/analysisStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, AlertTriangle, Loader2, Brain, TrendingUp } from "lucide-react";
import Link from "next/link";
import CountdownCircle from "@/components/analisi/CountdownCircle";
import RecordingIndicator from "@/components/analisi/RecordingIndicator";
import AnalysisProgress from "@/components/analisi/AnalysisProgress";

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

async function captureFrame(video: HTMLVideoElement): Promise<{ base64: string; mediaType: "image/jpeg" } | null> {
  if (video.videoWidth === 0 || video.videoHeight === 0) return null;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  try {
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const base64 = dataUrl.split(",")[1] ?? "";
    if (!base64) return null;
    return { base64, mediaType: "image/jpeg" };
  } catch {
    // Es. tainted canvas (CORS): fallisce silenziosamente
    return null;
  }
}

async function extractProFrames(url: string, count: number): Promise<{ base64: string; mediaType: "image/jpeg"; label: string }[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    const out: { base64: string; mediaType: "image/jpeg"; label: string }[] = [];
    const fail = () => resolve(out);

    video.addEventListener("error", fail, { once: true });
    video.addEventListener("loadedmetadata", async () => {
      const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
      if (duration === 0) return fail();

      for (let i = 0; i < count; i++) {
        const t = count === 1 ? duration / 2 : (i / (count - 1)) * duration;
        await new Promise<void>((seekResolve) => {
          const onSeeked = () => { video.removeEventListener("seeked", onSeeked); seekResolve(); };
          video.addEventListener("seeked", onSeeked);
          video.currentTime = Math.min(t, duration - 0.01);
        });
        const snap = await captureFrame(video);
        if (snap) out.push({ ...snap, label: `t=${t.toFixed(1)}s` });
      }
      resolve(out);
    }, { once: true });
  });
}

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
  const userFramesRef = useRef<{ base64: string; mediaType: "image/jpeg"; label: string }[]>([]);
  const proFramesRef = useRef<{ base64: string; mediaType: "image/jpeg"; label: string }[]>([]);
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
      .catch(() => setError("Esercizio non trovato."));
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
        throw new Error(err.error ?? "Upload fallito");
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
        throw new Error(data.error ?? "Analisi fallita");
      }
      router.push(`/analisi/report/${data.analysisSessionId}`);
    } catch (e) {
      setPhase("ERROR");
      setError(e instanceof Error ? e.message : "Errore durante l'elaborazione");
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
    return (
      <div className="text-center py-16 space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <p className="text-muted-foreground">{error ?? "Seleziona un esercizio dalla pagina Analisi AI."}</p>
        <Link href="/analisi"><Button>Torna agli esercizi</Button></Link>
      </div>
    );
  }

  if (phase === "ERROR") {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold">Analisi non completata</h2>
        <p className="text-muted-foreground text-sm">{error}</p>
        <div className="flex justify-center gap-2">
          <Button onClick={retry}>Riprova</Button>
          <Link href="/analisi"><Button variant="outline">Esci</Button></Link>
        </div>
      </div>
    );
  }

  if (phase === "UPLOADING" || phase === "ANALYZING") {
    return (
      <div className="py-12 px-4 max-w-3xl mx-auto flex flex-col items-center gap-8">
        <h2 className="text-2xl font-bold text-center">
          {phase === "UPLOADING" ? "Carico il video..." : "Analisi in corso..."}
        </h2>
        <AnalysisProgress
          steps={[
            { label: "Upload", icon: <Loader2 className="w-5 h-5" /> },
            { label: "L1+L2+L3", icon: <Brain className="w-5 h-5" /> },
            { label: "Sintesi", icon: <TrendingUp className="w-5 h-5" /> },
          ]}
          currentStep={phase === "UPLOADING" ? 0 : analysisStep}
        />
        <p className="mt-12 text-muted-foreground text-center text-sm">
          {phase === "UPLOADING"
            ? "Stiamo trasferendo il tuo video al server."
            : "I 3 sistemi AI stanno elaborando: questo richiede 1-2 minuti."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{exercise?.name ?? "Caricamento..."}</h1>
          <p className="text-sm text-muted-foreground">
            {phase === "IDLE" && "Pronto a iniziare"}
            {phase === "COUNTDOWN" && "Posizionati di fronte alla camera"}
            {phase === "RECORDING" && "Registrazione in corso"}
          </p>
        </div>
        {phase === "IDLE" && <Link href="/analisi"><Button variant="outline" size="sm">← Indietro</Button></Link>}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <div className="aspect-video bg-black relative">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Fotocamera non attiva</p>
                </div>
              )}
              {phase === "COUNTDOWN" && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                  <CountdownCircle seconds={countdown} onComplete={onCountdownComplete} />
                </div>
              )}
            </div>
            {phase === "RECORDING" && exercise && (
              <div className="p-3">
                <RecordingIndicator
                  durationSeconds={exercise.recordingDurationSeconds}
                  elapsedSeconds={elapsedSeconds}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video bg-secondary/50 flex items-center justify-center">
              {exercise?.videoUrl ? (
                <video src={exercise.videoUrl} loop autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <Camera className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-xs">Video PT non disponibile</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {cameraError && <p className="text-sm text-destructive text-center">{cameraError}</p>}

      <div className="flex justify-center">
        {phase === "IDLE" && (
          <Button
            size="lg"
            onClick={startCountdown}
            disabled={cameraLoading || !analysisSessionId}
            className="gap-2 px-8"
          >
            {cameraLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            Inizia
          </Button>
        )}
      </div>
    </div>
  );
}

export default function SessionePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <SessioneContent />
    </Suspense>
  );
}
