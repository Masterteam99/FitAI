"use client";

import { useRef } from "react";
import { Dumbbell, Play } from "lucide-react";
import { copy } from "@/content/copy";

// Area media della card esercizio: se c'è il video demo PT mostra il primo
// frame con badge "Video" e avvia il loop al passaggio del mouse; altrimenti
// il placeholder. preload="metadata" scarica solo l'header del file.
export function ExerciseCardMedia({ videoUrl, thumbnailUrl, name }: {
  videoUrl: string | null;
  thumbnailUrl: string | null;
  name: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  if (videoUrl) {
    return (
      <div
        className="relative aspect-video rounded-lg bg-secondary/50 overflow-hidden"
        onMouseEnter={() => videoRef.current?.play().catch(() => {})}
        onMouseLeave={() => {
          const v = videoRef.current;
          if (v) { v.pause(); v.currentTime = 0; }
        }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          preload="metadata"
          muted
          loop
          playsInline
          aria-label={name}
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-background/80 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-foreground border border-border">
          <Play className="w-3 h-3 text-primary" />
          {copy.esercizi.videoBadge}
        </span>
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden">
      {thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={thumbnailUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <Dumbbell className="w-8 h-8 text-muted-foreground" />
      )}
    </div>
  );
}
