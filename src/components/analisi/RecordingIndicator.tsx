"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";

interface RecordingIndicatorProps {
  durationSeconds: number;
  elapsedSeconds: number;
}

export default function RecordingIndicator({ durationSeconds, elapsedSeconds }: RecordingIndicatorProps) {
  const percentage = Math.min(100, Math.max(0, (elapsedSeconds / durationSeconds) * 100));
  
  return (
    <div className="flex flex-col gap-2 w-full max-w-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
          <span className="font-semibold text-red-500">REC</span>
        </div>
        <span className="text-sm font-medium text-muted-foreground">
          {Math.floor(elapsedSeconds)}s / {durationSeconds}s
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
