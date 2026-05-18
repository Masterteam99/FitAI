"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Save, Loader2, Trophy, Flame, Dumbbell, Download, Trash2, AlertTriangle } from "lucide-react";
import { signOut as nextSignOut } from "next-auth/react";

interface ProfileData {
  name: string;
  email: string;
  fitnessLevel: string;
  primaryGoal: string;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  profileVisibility: "PUBLIC" | "PRIVATE";
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
}

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzato",
  EXPERT: "Expert",
};

const GOAL_LABELS: Record<string, string> = {
  WEIGHT_LOSS: "Perdita di peso",
  MUSCLE_GAIN: "Aumento massa",
  STRENGTH: "Forza",
  ENDURANCE: "Resistenza",
  FLEXIBILITY: "Flessibilità",
  GENERAL_FITNESS: "Forma generale",
  SPORT_PERFORMANCE: "Performance sportiva",
};

export default function ProfiloPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", weight: "", height: "" });

  useEffect(() => {
    fetch("/api/profilo")
      .then((r) => r.json())
      .then((d: ProfileData) => {
        setProfile(d);
        setForm({
          name: d.name ?? "",
          age: d.age?.toString() ?? "",
          weight: d.weightKg?.toString() ?? "",
          height: d.heightCm?.toString() ?? "",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    setSaving(true);
    await fetch("/api/profilo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        age: form.age ? Number(form.age) : null,
        weightKg: form.weight ? Number(form.weight) : null,
        heightCm: form.height ? Number(form.height) : null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-7 h-7 text-primary" />
          Il mio Profilo
        </h1>
        <p className="text-muted-foreground">Gestisci le tue informazioni personali</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Trophy, label: "Punti", value: profile?.totalPoints ?? 0, color: "text-yellow-400" },
          { icon: Flame, label: "Streak", value: `${profile?.currentStreak ?? 0}🔥`, color: "text-orange-400" },
          { icon: Dumbbell, label: "Record streak", value: profile?.longestStreak ?? 0, color: "text-primary" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${s.color}`} />
                <div className="text-xl font-bold">{s.value}</div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Account info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {profile?.fitnessLevel && (
              <Badge variant="secondary">{LEVEL_LABELS[profile.fitnessLevel] ?? profile.fitnessLevel}</Badge>
            )}
            {profile?.primaryGoal && (
              <Badge variant="outline">{GOAL_LABELS[profile.primaryGoal] ?? profile.primaryGoal}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader><CardTitle className="text-base">Modifica informazioni</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Nome</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Il tuo nome" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Età</label>
              <Input type="number" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} placeholder="30" min="10" max="99" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Peso (kg)</label>
              <Input type="number" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} placeholder="75" min="30" max="300" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Altezza (cm)</label>
              <Input type="number" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))} placeholder="175" min="100" max="250" />
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? "Salvato!" : "Salva modifiche"}
          </Button>
        </CardContent>
      </Card>

      {/* Visibilità profilo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Visibilità profilo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Profilo pubblico: i tuoi allenamenti completati appaiono nel feed Community. Profilo privato: niente di visibile agli altri utenti.
          </p>
          <div className="flex gap-2">
            <Button
              variant={profile?.profileVisibility === "PUBLIC" ? "default" : "outline"}
              onClick={async () => {
                await fetch("/api/profilo", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ profileVisibility: "PUBLIC" }),
                });
                setProfile((p) => p && { ...p, profileVisibility: "PUBLIC" });
              }}
              className="flex-1"
            >
              Pubblico
            </Button>
            <Button
              variant={profile?.profileVisibility === "PRIVATE" ? "default" : "outline"}
              onClick={async () => {
                await fetch("/api/profilo", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ profileVisibility: "PRIVATE" }),
                });
                setProfile((p) => p && { ...p, profileVisibility: "PRIVATE" });
              }}
              className="flex-1"
            >
              Privato
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* I miei dati (GDPR) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">I miei dati</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Scarica una copia completa di tutti i tuoi dati in formato JSON, come previsto dal GDPR (diritto alla portabilità).
          </p>
          <Button variant="outline" asChild className="gap-2">
            <a href="/api/account/export">
              <Download className="w-4 h-4" />
              Scarica i miei dati (.json)
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-destructive/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">Esci dall&apos;account</p>
            <p className="text-sm text-muted-foreground">Verrai disconnesso da tutti i dispositivi</p>
          </div>
          <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })} className="gap-2">
            <LogOut className="w-4 h-4" />
            Esci
          </Button>
        </CardContent>
      </Card>

      <DeleteAccountSection />
    </div>
  );
}

function DeleteAccountSection() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    setError(null);
    setBusy(true);
    const res = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmText, password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Errore eliminazione");
      setBusy(false);
      return;
    }
    await nextSignOut({ callbackUrl: "/" });
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 text-destructive">
          <AlertTriangle className="w-4 h-4" />
          Elimina account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!open ? (
          <>
            <p className="text-sm text-muted-foreground">
              Operazione irreversibile. Tutti i tuoi dati (piani, sessioni, analisi, log) saranno eliminati definitivamente.
            </p>
            <Button variant="destructive" onClick={() => setOpen(true)} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Elimina account
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Per confermare, scrivi <span className="font-mono font-semibold text-foreground">ELIMINA</span> e inserisci la tua password.
            </p>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="ELIMINA" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="La tua password" />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={busy || confirmText !== "ELIMINA" || !password}
                className="gap-2"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Conferma eliminazione
              </Button>
              <Button variant="outline" onClick={() => { setOpen(false); setConfirmText(""); setPassword(""); setError(null); }}>
                Annulla
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
