"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { Check, X, Upload, Trash2, Video } from "lucide-react";

type AdminExercise = {
  id: string;
  slug: string;
  name: string;
  muscleGroupPrimary: string;
  videoUrl: string | null;
  isActive: boolean;
};

export function AdminExercisesTable({ exercises }: { exercises: AdminExercise[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [dialogExercise, setDialogExercise] = useState<AdminExercise | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function toggleActive(ex: AdminExercise) {
    setTogglingId(ex.id);
    try {
      const res = await fetch(`/api/admin/exercises/${ex.id}/active`, { method: "PATCH" });
      if (res.ok) router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (onlyMissing && ex.videoUrl) return false;
      if (q && !ex.name.toLowerCase().includes(q) && !ex.slug.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [exercises, search, onlyMissing]);

  const presentCount = exercises.filter((e) => e.videoUrl).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Cerca per nome o slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant={onlyMissing ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyMissing((v) => !v)}
          >
            Solo mancanti
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {presentCount}/{exercises.length} esercizi con video PT
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-center text-muted-foreground">Nessun esercizio.</p>
          ) : (
            <ul className="divide-y">
              {filtered.map((ex) => (
                <li key={ex.id} className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{ex.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {ex.slug} · {ex.muscleGroupPrimary}
                    </p>
                  </div>
                  {ex.videoUrl ? (
                    <Badge variant="secondary" className="gap-1">
                      <Check className="w-3 h-3" />
                      Video PT
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <X className="w-3 h-3" />
                      Mancante
                    </Badge>
                  )}
                  <Badge variant={ex.isActive ? "default" : "outline"} className={ex.isActive ? "" : "text-muted-foreground"}>
                    {ex.isActive ? "Attivo" : "Disattivo"}
                  </Badge>
                  <Button size="sm" onClick={() => setDialogExercise(ex)} className="gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {ex.videoUrl ? "Sostituisci" : "Carica"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={togglingId === ex.id}
                    onClick={() => toggleActive(ex)}
                  >
                    {ex.isActive ? "Disattiva" : "Attiva"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {dialogExercise && (
        <UploadDialog
          exercise={dialogExercise}
          onClose={() => setDialogExercise(null)}
        />
      )}
    </div>
  );
}

function UploadDialog({ exercise, onClose }: { exercise: AdminExercise; onClose: () => void }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFile(f: File | null) {
    setError("");
    setDuration(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (!f) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    const accepted = ["video/mp4", "video/webm", "video/quicktime"];
    if (!accepted.includes(f.type)) {
      setError("Formato non supportato. Usa mp4, webm o mov.");
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError("File troppo grande (max 50MB).");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!file) return;
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    startTransition(async () => {
      const res = await fetch(`/api/admin/exercises/${exercise.id}/pt-video`, {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Errore sconosciuto" }));
        setError(j.error ?? `HTTP ${res.status}`);
        return;
      }
      toast({ title: "Video PT caricato", description: exercise.name, variant: "success" });
      router.refresh();
      onClose();
    });
  }

  async function handleDelete() {
    if (!exercise.videoUrl) return;
    if (!confirm(`Rimuovere il video PT di ${exercise.name}?`)) return;
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/exercises/${exercise.id}/pt-video`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Errore sconosciuto" }));
        setError(j.error ?? `HTTP ${res.status}`);
        return;
      }
      toast({ title: "Video PT rimosso", description: exercise.name });
      router.refresh();
      onClose();
    });
  }

  const durationWarning =
    duration !== null && (duration < 8 || duration > 30)
      ? `Durata ${duration.toFixed(1)}s fuori range consigliato (8-30s).`
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => !pending && onClose()}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Carica video PT per ${exercise.name}`}
        className="relative w-full max-w-md bg-card border rounded-xl p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">Video PT — {exercise.name}</h2>
            <p className="text-xs text-muted-foreground">{exercise.slug}</p>
          </div>
          <button
            onClick={() => !pending && onClose()}
            disabled={pending}
            aria-label="Chiudi"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer hover:file:bg-primary/90"
            disabled={pending}
          />
          {file && (
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type}
            </p>
          )}
        </div>

        {previewUrl && (
          <video
            src={previewUrl}
            controls
            preload="metadata"
            className="w-full rounded-lg bg-black"
            onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          />
        )}

        {durationWarning && (
          <p className="text-xs text-amber-500">{durationWarning}</p>
        )}

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">{error}</p>
        )}

        <div className="flex gap-2 pt-2">
          {exercise.videoUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={pending}
              className="gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Rimuovi attuale
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={onClose} disabled={pending}>
            Annulla
          </Button>
          <Button size="sm" onClick={handleUpload} disabled={!file || pending} className="gap-1.5">
            <Video className="w-3.5 h-3.5" />
            {pending ? "Carico…" : exercise.videoUrl ? "Sostituisci" : "Carica"}
          </Button>
        </div>
      </div>
    </div>
  );
}
