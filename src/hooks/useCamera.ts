"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type FacingMode = "user" | "environment";

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
  facingMode: FacingMode;
  canSwitchCamera: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  // Lo switch ha senso solo su device con più fotocamere (mobile); su desktop lo nascondiamo.
  const [canSwitchCamera, setCanSwitchCamera] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices?.()
      .then((devices) => setCanSwitchCamera(devices.filter((d) => d.kind === "videoinput").length > 1))
      .catch(() => {});
  }, []);

  const openStream = useCallback(async (mode: FacingMode) => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: mode },
      audio: false,
    });
    streamRef.current = mediaStream;
    setStream(mediaStream);
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      await videoRef.current.play();
    }
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await openStream(facingMode);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Accesso alla fotocamera negato";
      setError(msg.includes("NotAllowed") ? "Permesso fotocamera negato. Abilita l'accesso nelle impostazioni del browser." : msg);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode, openStream]);

  const switchCamera = useCallback(async () => {
    const nextMode: FacingMode = facingMode === "user" ? "environment" : "user";
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    setError(null);
    try {
      await openStream(nextMode);
      setFacingMode(nextMode);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Impossibile cambiare fotocamera";
      setError(msg);
    }
  }, [facingMode, openStream]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, stream, isLoading, error, facingMode, canSwitchCamera, startCamera, stopCamera, switchCamera };
}
