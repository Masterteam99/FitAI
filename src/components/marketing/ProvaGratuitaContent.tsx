"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Loader2, AlertTriangle, ChevronRight, CheckCircle2, Video, Upload } from "lucide-react";
import { useCamera } from "@/hooks/useCamera";
import { usePoseDetection } from "@/hooks/usePoseDetection";
import { useAnalysisStore } from "@/stores/analysisStore";
import { captureFrame, extractProFrames, type LabeledFrame } from "@/lib/analysis/frame-capture";
import { AnalysisProcessingView } from "@/components/analisi/AnalysisProcessingView";
import { RecordingStage } from "@/components/analisi/RecordingStage";
import { ExerciseCardMedia } from "@/components/esercizi/ExerciseCardMedia";
import { copy } from "@/content/copy";

type Phase =
  | "LOADING_EXERCISES"
  | "FORM"
  | "UPLOAD_PICK"
  | "UPLOAD_PROCESSING"
  | "COUNTDOWN"
  | "RECORDING"
  | "UPLOADING"
  | "ANALYZING"
  | "RESULT"
  | "ERROR";

type Mode = "record" | "upload";

interface GuestExercise {
  id: string;
  name: string;
  slug: string;
  muscleGroupPrimary: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
}

interface ExerciseData {
  id: string;
  name: string;
  slug: string;
  videoUrl?: string;
  explanationVideoUrl?: string;
  professionalNotes?: string;
  recordingDurationSeconds: number;
}

const COUNTDOWN_SECONDS = 15;
const NUM_USER_FRAMES = 8;
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;
const ACCEPTED_UPLOAD_MIME = ["video/mp4", "video/webm", "video/quicktime"];

export function ProvaGratuitaContent() {
  const c = copy.provaGratuita;
  const cs = copy.analisiSessione;

  const [phase, setPhase] = useState<Phase>("LOADING_EXERCISES");
  const [exercises, setExercises] = useState<GuestExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [mode, setMode] = useState<Mode>("record");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consentCamera, setConsentCamera] = useState(false);
  const [consentProcessing, setConsentProcessing] = useState(false);
  const [consentEmail, setConsentEmail] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ combinedScore: number; overallJudgment: string } | null>(null);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const uploadVideoRef = useRef<HTMLVideoElement | null>(null);
  const uploadObjectUrlRef = useRef<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const userFramesRef = useRef<LabeledFrame[]>([]);
  const proFramesRef = useRef<LabeledFrame[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const frameTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { videoRef, stream, isLoading: cameraLoading, error: cameraError, canSwitchCamera, startCamera, stopCamera, switchCamera } = useCamera();
  const { startRecording: storeStart, stopRecording: storeStop, frameHistory, reset: storeReset } = useAnalysisStore();

  usePoseDetection({ videoRef, enabled: !!stream && phase === "RECORDING" });
  usePoseDetection({ videoRef: uploadVideoRef, enabled: phase === "UPLOAD_PROCESSING" });

  useEffect(() => {
    fetch("/api/guest-analysis/exercises")
      .then((r) => r.json())
      .then((d) => {
        const list: GuestExercise[] = d.exercises ?? [];
        setExercises(list);
        if (list.length > 0) setSelectedExerciseId(list[0].id);
        setPhase("FORM");
      })
      .catch(() => setPhase("FORM"));
  }, []);

  const cleanup = useCallback(() => {
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    if (frameTimerRef.current) { clearInterval(frameTimerRef.current); frameTimerRef.current = null; }
    if (uploadObjectUrlRef.current) { URL.revokeObjectURL(uploadObjectUrlRef.current); uploadObjectUrlRef.current = null; }
  }, []);
  useEffect(() => () => cleanup(), [cleanup]);

  async function submitForm() {
    setFormError(null);
    if (!selectedExerciseId) { setFormError(c.startError); return; }
    if (!consentProcessing || !consentEmail || (mode === "record" && !consentCamera)) { setFormError(c.missingConsent); return; }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailValid) { setFormError(c.emailInvalid); return; }

    setStarting(true);
    try {
      const res = await fetch("/api/guest-analysis/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined, email: email.trim(), exerciseId: selectedExerciseId, consent: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? c.startError);
      setExercise(data.exercise);
      setGuestSessionId(data.guestSessionId);
      proFramesRef.current = [];
      if (data.exercise?.videoUrl) {
        extractProFrames(data.exercise.videoUrl, 6).then((frames) => { proFramesRef.current = frames; });
      }
      if (mode === "upload") {
        setPhase("UPLOAD_PICK");
      } else {
        setPhase("COUNTDOWN");
        await startCamera();
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : c.startError);
      setPhase("FORM");
    } finally {
      setStarting(false);
    }
  }

  const finalize = useCallback(async (videoBlob: Blob, durationSecondsOverride?: number) => {
    if (!guestSessionId || !exercise) return;
    setPhase("UPLOADING");
    setAnalysisStep(0);
    try {
      const fd = new FormData();
      fd.append("video", videoBlob, "guest-video.webm");
      fd.append("guestSessionId", guestSessionId);
      const uploadRes = await fetch("/api/guest-analysis/upload-video", { method: "POST", body: fd });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.error ?? cs.uploadFailed);
      }

      setPhase("ANALYZING");
      setAnalysisStep(1);
      const completeRes = await fetch("/api/guest-analysis/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestSessionId,
          frameHistory,
          userFrames: userFramesRef.current,
          proFrames: proFramesRef.current,
          durationSeconds: durationSecondsOverride ?? exercise.recordingDurationSeconds,
        }),
      });
      const data = await completeRes.json();
      setAnalysisStep(2);
      if (!completeRes.ok || data.error) throw new Error(data.error ?? cs.analysisFailed);

      setResult({ combinedScore: data.combinedScore, overallJudgment: data.overallJudgment });
      setPhase("RESULT");
    } catch (e) {
      setPhase("ERROR");
      setError(e instanceof Error ? e.message : cs.processingError);
    } finally {
      stopCamera();
      storeReset();
    }
  }, [guestSessionId, exercise, frameHistory, stopCamera, storeReset, cs]);

  const startRecordingPhase = useCallback(() => {
    if (!exercise || !stream || !guestSessionId) return;
    const duration = exercise.recordingDurationSeconds;

    chunksRef.current = [];
    userFramesRef.current = [];
    setElapsedSeconds(0);
    storeStart(guestSessionId);

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

    const interval = (duration * 1000) / NUM_USER_FRAMES;
    let frameIdx = 0;
    frameTimerRef.current = setInterval(async () => {
      if (!videoRef.current || frameIdx >= NUM_USER_FRAMES) return;
      const snap = await captureFrame(videoRef.current);
      if (snap) userFramesRef.current.push({ ...snap, label: `t=${(frameIdx * interval / 1000).toFixed(1)}s` });
      frameIdx++;
    }, interval);
  }, [exercise, stream, guestSessionId, finalize, storeStart, storeStop, videoRef]);

  const onCountdownComplete = useCallback(() => {
    if (phase !== "COUNTDOWN") return;
    startRecordingPhase();
  }, [phase, startRecordingPhase]);

  const endEarly = useCallback(() => {
    if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    if (frameTimerRef.current) { clearInterval(frameTimerRef.current); frameTimerRef.current = null; }
    storeStop();
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
  }, [storeStop]);

  function clearUploadPreview() {
    setUploadPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setUploadFile(null);
  }

  function pickUploadFile(file: File | null) {
    setUploadError(null);
    if (!file) { clearUploadPreview(); return; }
    if (!ACCEPTED_UPLOAD_MIME.includes(file.type)) { setUploadError(c.uploadInvalidType); clearUploadPreview(); return; }
    if (file.size > MAX_UPLOAD_BYTES) { setUploadError(c.uploadTooLarge); clearUploadPreview(); return; }
    setUploadPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setUploadFile(file);
  }

  // Elabora il video caricato: lo riproduce (nascosto) in tempo reale così
  // MediaPipe può tracciare la posa fotogramma per fotogramma esattamente come
  // farebbe con la fotocamera live — poi estrae gli stessi frame campione usati
  // per il confronto vision (stessa utility già usata per il video del PT).
  // Il setup vero e proprio vive in un effect (sotto): l'elemento <video> nascosto
  // esiste solo nel branch JSX della fase UPLOAD_PROCESSING, quindi non è ancora
  // montato nello stesso tick in cui si clicca "Analizza questo video".
  const analyzeUploadedVideo = useCallback(() => {
    if (!uploadFile || !guestSessionId) return;
    setUploadProgress(0);
    setPhase("UPLOAD_PROCESSING");
  }, [uploadFile, guestSessionId]);

  useEffect(() => {
    if (phase !== "UPLOAD_PROCESSING" || !uploadFile || !guestSessionId) return;
    const video = uploadVideoRef.current;
    if (!video) return;

    if (uploadObjectUrlRef.current) URL.revokeObjectURL(uploadObjectUrlRef.current);
    const objectUrl = URL.createObjectURL(uploadFile);
    uploadObjectUrlRef.current = objectUrl;
    video.src = objectUrl;
    storeStart(guestSessionId);

    const onTimeUpdate = () => {
      if (video.duration > 0) setUploadProgress(Math.min(100, Math.round((video.currentTime / video.duration) * 100)));
    };
    const onEnded = async () => {
      storeStop();
      const frames = await extractProFrames(objectUrl, NUM_USER_FRAMES);
      userFramesRef.current = frames;
      const duration = isFinite(video.duration) ? Math.round(video.duration) : undefined;
      finalize(uploadFile, duration);
    };
    const onLoadedMetadata = () => { video.play().catch(() => {}); };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const retry = useCallback(() => {
    setError(null);
    setResult(null);
    setGuestSessionId(null);
    setExercise(null);
    setUploadPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setUploadFile(null);
    setUploadError(null);
    setPhase("FORM");
    storeReset();
  }, [storeReset]);

  if (phase === "LOADING_EXERCISES") {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (phase === "FORM") {
    if (exercises.length === 0) {
      return (
        <div className="max-w-lg mx-auto text-center py-16 space-y-4">
          <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">{c.noExercisesTitle}</h2>
          <p className="text-muted-foreground text-sm">{c.noExercisesBody}</p>
          <Link href="/registrati" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white" style={{ background: "var(--organic-terracotta)" }}>
            {c.resultCtaButton} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      );
    }
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--organic-green-deep)" }}>{c.step1Title}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {exercises.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => setSelectedExerciseId(ex.id)}
                className={`text-left p-2 rounded-xl border transition-colors ${selectedExerciseId === ex.id ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <ExerciseCardMedia videoUrl={ex.videoUrl} thumbnailUrl={ex.thumbnailUrl} name={ex.name} />
                <p className="text-sm font-medium mt-2 px-0.5">{ex.name}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: "var(--organic-green-deep)" }}>{c.step2Title}</p>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{c.nameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={c.namePlaceholder}
              className="w-full h-10 px-3 mt-1 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">{c.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={c.emailPlaceholder}
              className="w-full h-10 px-3 mt-1 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground mt-1">{c.emailHint}</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold" style={{ color: "var(--organic-green-deep)" }}>{c.step3Title}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode("record")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors ${mode === "record" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <Video className="w-6 h-6" style={{ color: "var(--organic-green-deep)" }} />
              <span className="text-sm font-semibold">{c.modeRecord}</span>
              <span className="text-xs text-muted-foreground">{c.modeRecordDesc}</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-colors ${mode === "upload" ? "border-primary bg-primary/5" : "border-border"}`}
            >
              <Upload className="w-6 h-6" style={{ color: "var(--organic-green-deep)" }} />
              <span className="text-sm font-semibold">{c.modeUpload}</span>
              <span className="text-xs text-muted-foreground">{c.modeUploadDesc}</span>
            </button>
          </div>

          <label className="flex items-start gap-2.5 text-sm">
            <input type="checkbox" checked={consentProcessing} onChange={(e) => setConsentProcessing(e.target.checked)} className="mt-0.5" />
            <span>{c.consentProcessing}</span>
          </label>
          {mode === "record" && (
            <label className="flex items-start gap-2.5 text-sm">
              <input type="checkbox" checked={consentCamera} onChange={(e) => setConsentCamera(e.target.checked)} className="mt-0.5" />
              <span>{c.consentCamera}</span>
            </label>
          )}
          <label className="flex items-start gap-2.5 text-sm">
            <input type="checkbox" checked={consentEmail} onChange={(e) => setConsentEmail(e.target.checked)} className="mt-0.5" />
            <span>{c.consentEmail}</span>
          </label>
        </div>

        {formError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />{formError}
          </div>
        )}

        <button
          type="button"
          onClick={submitForm}
          disabled={starting}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
          style={{ background: "var(--organic-terracotta)" }}
        >
          {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
          {c.startCta}
        </button>
      </div>
    );
  }

  if (phase === "UPLOAD_PICK") {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <div>
          <h2 className="text-xl font-bold">{c.uploadTitle}</h2>
          <p className="text-sm text-muted-foreground mt-1">{c.uploadHint}</p>
        </div>

        {uploadFile && uploadPreviewUrl ? (
          <video src={uploadPreviewUrl} controls className="w-full rounded-xl bg-black aspect-video" />
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 p-10 rounded-xl border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm font-medium">{c.uploadPick}</span>
            <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={(e) => pickUploadFile(e.target.files?.[0] ?? null)} />
          </label>
        )}

        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />{uploadError}
          </div>
        )}

        <div className="flex gap-3">
          {uploadFile && (
            <button type="button" onClick={clearUploadPreview} className="flex-1 px-4 py-3 rounded-full text-sm font-semibold border border-border">
              {c.uploadBack}
            </button>
          )}
          <button
            type="button"
            disabled={!uploadFile}
            onClick={analyzeUploadedVideo}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-semibold text-sm text-white disabled:opacity-50"
            style={{ background: "var(--organic-terracotta)" }}
          >
            <ChevronRight className="w-4 h-4" />
            {c.uploadAnalyzeCta}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "UPLOAD_PROCESSING") {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-5">
        <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: "var(--organic-green-deep)" }} />
        <div>
          <h2 className="text-xl font-semibold">{c.processingUploadTitle}</h2>
          <p className="text-sm text-muted-foreground mt-1">{c.processingUploadDesc}</p>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden max-w-xs mx-auto">
          <div className="h-full rounded-full transition-all" style={{ width: `${uploadProgress}%`, background: "var(--organic-terracotta)" }} />
        </div>
        <video ref={uploadVideoRef} muted playsInline className="hidden" />
      </div>
    );
  }

  if (phase === "ERROR") {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <p className="text-muted-foreground text-sm">{error ?? cs.processingError}</p>
        <button onClick={retry} className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white" style={{ background: "var(--organic-terracotta)" }}>
          {cs.retry}
        </button>
      </div>
    );
  }

  if (phase === "UPLOADING" || phase === "ANALYZING") {
    return <AnalysisProcessingView uploading={phase === "UPLOADING"} analysisStep={analysisStep} />;
  }

  if (phase === "RESULT") {
    if (!result) return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    return (
      <div className="max-w-lg mx-auto space-y-6 text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: "var(--organic-green-deep)" }} />
        <div>
          <h2 className="text-2xl font-bold">{c.resultTitle}</h2>
          <p className="text-muted-foreground text-sm mt-1">{c.resultBody(email)}</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: "var(--organic-espresso)", color: "var(--foreground)" }}>
          <div className="font-display text-5xl" style={{ color: "var(--organic-green-soft)" }}>{Math.round(result.combinedScore)}</div>
          <p className="text-sm mt-2" style={{ color: "rgba(234,241,248,.85)" }}>{result.overallJudgment}</p>
        </div>
        <div className="rounded-2xl border border-border p-6 text-left space-y-3">
          <h3 className="font-semibold">{c.resultCtaTitle}</h3>
          <p className="text-sm text-muted-foreground">{c.resultCtaBody}</p>
          <Link href="/registrati" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white" style={{ background: "var(--organic-terracotta)" }}>
            {c.resultCtaButton} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <button onClick={retry} className="text-sm text-muted-foreground hover:text-foreground underline">{c.retryCta}</button>
      </div>
    );
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
      canStart={!!guestSessionId}
      canSwitchCamera={canSwitchCamera}
      onCountdownComplete={onCountdownComplete}
      onStart={() => setCountdown(COUNTDOWN_SECONDS)}
      onSwitchCamera={switchCamera}
      onEndEarly={endEarly}
    />
  );
}
