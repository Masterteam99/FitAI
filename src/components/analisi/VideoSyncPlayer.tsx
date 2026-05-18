"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface Props {
  userVideoUrl: string | null;
  proVideoUrl: string | null;
}

export default function VideoSyncPlayer({ userVideoUrl, proVideoUrl }: Props) {
  const userRef = useRef<HTMLVideoElement | null>(null);
  const proRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = useCallback(() => {
    const u = userRef.current;
    const p = proRef.current;
    if (playing) {
      u?.pause();
      p?.pause();
      setPlaying(false);
    } else {
      // Allinea timestamp e parte
      if (u && p) p.currentTime = u.currentTime;
      u?.play().catch(() => {});
      p?.play().catch(() => {});
      setPlaying(true);
    }
  }, [playing]);

  const restart = useCallback(() => {
    const u = userRef.current;
    const p = proRef.current;
    if (u) u.currentTime = 0;
    if (p) p.currentTime = 0;
    if (playing) {
      u?.play().catch(() => {});
      p?.play().catch(() => {});
    }
  }, [playing]);

  if (!userVideoUrl && !proVideoUrl) return null;

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">La tua esecuzione</p>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {userVideoUrl ? (
              <video
                ref={userRef}
                src={userVideoUrl}
                className="w-full h-full object-cover"
                playsInline
                muted
                onEnded={() => setPlaying(false)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Video utente non disponibile
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Esecuzione PT</p>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            {proVideoUrl ? (
              <video
                ref={proRef}
                src={proVideoUrl}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Video PT non disponibile
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <Button size="sm" onClick={togglePlay} disabled={!userVideoUrl && !proVideoUrl}>
          {playing ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          {playing ? "Pausa" : "Riproduci sync"}
        </Button>
        <Button size="sm" variant="outline" onClick={restart}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Da capo
        </Button>
      </div>
    </div>
  );
}
