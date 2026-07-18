"use client";

import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toaster";
import { Check, X, Upload, Trash2, Video, Activity } from "lucide-react";
import { copy } from "@/content/copy";
import { extractReferenceProfileFromVideo } from "@/lib/analysis/pt-profile-extract";

type AdminExercise = {
  id: string;
  slug: string;
  name: string;
  muscleGroupPrimary: string;
  videoUrl: string | null;
  isActive: boolean;
  hasProfile: boolean;
};

export function AdminExercisesTable({ exercises }: { exercises: AdminExercise[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [dialogExercise, setDialogExercise] = useState<AdminExercise | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [profilingId, setProfilingId] = useState<string | null>(null);

  async function toggleActive(ex: AdminExercise) {
    setTogglingId(ex.id);
    try {
      const res = await fetch(`/api/admin/exercises/${ex.id}/active`, { method: "PATCH" });
      if (res.ok) router.refresh();
    } finally {
      setTogglingId(null);
    }
  }

  async function buildProfile(ex: AdminExercise) {
    if (!ex.videoUrl) return;
    setProfilingId(ex.id);
    try {
      const profile = await extractReferenceProfileFromVideo(ex.videoUrl, ex.slug);
      const res = await fetch(`/api/admin/exercises/${ex.id}/reference-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      toast({ title: "Profilo PT salvato", description: `${data.movements} movimenti · ${ex.name}`, variant: "success" });
      router.refresh();
    } catch (e) {
      toast({ title: "Estrazione profilo fallita", description: e instanceof Error ? e.message : "Errore sconosciuto", variant: "destructive" });
    } finally {
      setProfilingId(null);
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
            placeholder={copy.adminExercises.table.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button
            variant={onlyMissing ? "default" : "outline"}
            size="sm"
            onClick={() => setOnlyMissing((v) => !v)}
          >
            {copy.adminExercises.table.onlyMissing}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {copy.adminExercises.table.videoCount(presentCount, exercises.length)}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <p className="p-6 text-sm text-center text-muted-foreground">{copy.adminExercises.table.empty}</p>
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
                      {copy.adminExercises.table.videoBadge}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <X className="w-3 h-3" />
                      {copy.adminExercises.table.missingBadge}
                    </Badge>
                  )}
                  {ex.hasProfile && (
                    <Badge variant="secondary" className="gap-1">
                      <Activity className="w-3 h-3" />
                      Profilo PT
                    </Badge>
                  )}
                  <Badge variant={ex.isActive ? "default" : "outline"} className={ex.isActive ? "" : "text-muted-foreground"}>
                    {ex.isActive ? copy.adminExercises.table.active : copy.adminExercises.table.inactive}
                  </Badge>
                  <Button size="sm" onClick={() => setDialogExercise(ex)} className="gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    {ex.videoUrl ? copy.adminExercises.table.replace : copy.adminExercises.table.upload}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!ex.videoUrl || profilingId === ex.id}
                    onClick={() => buildProfile(ex)}
                    className="gap-1.5"
                    title={ex.videoUrl ? "Analizza il video PT ed estrai il profilo biomeccanico di riferimento" : "Carica prima un video PT"}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    {profilingId === ex.id ? "Analisi…" : ex.hasProfile ? "Ri-processa" : "Estrai profilo PT"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={togglingId === ex.id}
                    onClick={() => toggleActive(ex)}
                  >
                    {ex.isActive ? copy.adminExercises.table.deactivate : copy.adminExercises.table.activate}
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
      setError(copy.adminExercises.dialog.errorUnsupported);
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError(copy.adminExercises.dialog.errorTooLarge);
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
        const j = await res.json().catch(() => ({ error: copy.adminExercises.dialog.errorUnknown }));
        setError(j.error ?? `HTTP ${res.status}`);
        return;
      }
      toast({ title: copy.adminExercises.dialog.uploadedTitle, description: exercise.name, variant: "success" });
      router.refresh();
      onClose();
    });
  }

  async function handleDelete() {
    if (!exercise.videoUrl) return;
    if (!confirm(copy.adminExercises.dialog.confirmRemove(exercise.name))) return;
    setError("");
    startTransition(async () => {
      const res = await fetch(`/api/admin/exercises/${exercise.id}/pt-video`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: copy.adminExercises.dialog.errorUnknown }));
        setError(j.error ?? `HTTP ${res.status}`);
        return;
      }
      toast({ title: copy.adminExercises.dialog.removedTitle, description: exercise.name });
      router.refresh();
      onClose();
    });
  }

  const durationWarning =
    duration !== null && (duration < 8 || duration > 30)
      ? copy.adminExercises.dialog.durationWarning(duration.toFixed(1))
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
        aria-label={copy.adminExercises.dialog.ariaLabel(exercise.name)}
        className="relative w-full max-w-md bg-card border rounded-xl p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold">{copy.adminExercises.dialog.title(exercise.name)}</h2>
            <p className="text-xs text-muted-foreground">{exercise.slug}</p>
          </div>
          <button
            onClick={() => !pending && onClose()}
            disabled={pending}
            aria-label={copy.adminExercises.dialog.closeLabel}
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
              {copy.adminExercises.dialog.removeCurrent}
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={onClose} disabled={pending}>
            {copy.adminExercises.dialog.cancel}
          </Button>
          <Button size="sm" onClick={handleUpload} disabled={!file || pending} className="gap-1.5">
            <Video className="w-3.5 h-3.5" />
            {pending ? copy.adminExercises.dialog.uploading : exercise.videoUrl ? copy.adminExercises.dialog.replace : copy.adminExercises.dialog.upload}
          </Button>
        </div>
      </div>
    </div>
  );
}
