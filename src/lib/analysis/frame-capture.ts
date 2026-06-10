// Estrazione frame lato client per l'analisi biomeccanica.
// Funzioni pure DOM: nessuna dipendenza da React.

export interface CapturedFrame {
  base64: string;
  mediaType: "image/jpeg";
}

export interface LabeledFrame extends CapturedFrame {
  label: string;
}

export async function captureFrame(video: HTMLVideoElement): Promise<CapturedFrame | null> {
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

export async function extractProFrames(url: string, count: number): Promise<LabeledFrame[]> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    const out: LabeledFrame[] = [];
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
