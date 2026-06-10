"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Camera, Loader2 } from "lucide-react";
import CountdownCircle from "@/components/analisi/CountdownCircle";
import RecordingIndicator from "@/components/analisi/RecordingIndicator";
import { copy } from "@/content/copy";

interface ExerciseData {
  id: string;
  name: string;
  slug: string;
  videoUrl?: string;
  professionalNotes?: string;
  recordingDurationSeconds: number;
}

export function RecordingStage({
  phase,
  exercise,
  videoRef,
  stream,
  countdown,
  elapsedSeconds,
  cameraError,
  cameraLoading,
  canStart,
  onCountdownComplete,
  onStart,
}: {
  phase: "IDLE" | "COUNTDOWN" | "RECORDING";
  exercise: ExerciseData | null;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  countdown: number;
  elapsedSeconds: number;
  cameraError: string | null;
  cameraLoading: boolean;
  canStart: boolean;
  onCountdownComplete: () => void;
  onStart: () => void;
}) {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{exercise?.name ?? copy.analisiSessione.loadingExercise}</h1>
          <p className="text-sm text-muted-foreground">
            {phase === "IDLE" && copy.analisiSessione.phaseIdle}
            {phase === "COUNTDOWN" && copy.analisiSessione.phaseCountdown}
            {phase === "RECORDING" && copy.analisiSessione.phaseRecording}
          </p>
        </div>
        {phase === "IDLE" && <Link href="/analisi"><Button variant="outline" size="sm">{copy.analisiSessione.back}</Button></Link>}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0 relative">
            <div className="aspect-video bg-black relative">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
              {!stream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{copy.analisiSessione.cameraInactive}</p>
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
                  <p className="text-xs">{copy.analisiSessione.proVideoUnavailable}</p>
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
            onClick={onStart}
            disabled={cameraLoading || !canStart}
            className="gap-2 px-8"
          >
            {cameraLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            {copy.analisiSessione.start}
          </Button>
        )}
      </div>
    </div>
  );
}
