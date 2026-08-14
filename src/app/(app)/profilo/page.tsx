"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Save, Loader2, Trophy, Flame, Dumbbell, Download, Trash2, AlertTriangle, Sparkles, HelpCircle, ListChecks } from "lucide-react";
import { signOut as nextSignOut } from "next-auth/react";
import Link from "next/link";
import { DocumentsCard } from "@/components/DocumentsCard";
import { ProfileVideosCard } from "@/components/ProfileVideosCard";
import { copy } from "@/content/copy";

interface ProfileData {
  name: string;
  email: string;
  fitnessLevel: string;
  primaryGoal: string;
  age: number | null;
  weightKg: number | null;
  heightCm: number | null;
  profileVisibility: "PUBLIC" | "PRIVATE";
  medicalNotes: string | null;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
}

const LEVEL_LABELS: Record<string, string> = copy.profilo.levelLabels;

const GOAL_LABELS: Record<string, string> = copy.profilo.goalLabels;

export default function ProfiloPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", age: "", weight: "", height: "" });
  const [medicalNotes, setMedicalNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [savedNotes, setSavedNotes] = useState(false);

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
        setMedicalNotes(d.medicalNotes ?? "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function saveMedicalNotes() {
    setSavingNotes(true);
    await fetch("/api/profilo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ medicalNotes: medicalNotes.trim() || null }),
    });
    setSavingNotes(false);
    setSavedNotes(true);
    setTimeout(() => setSavedNotes(false), 3000);
  }

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
          {copy.profilo.title}
        </h1>
        <p className="text-muted-foreground">{copy.profilo.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Trophy, label: copy.profilo.stats.points, value: profile?.totalPoints ?? 0, color: "text-yellow-400" },
          { icon: Flame, label: copy.profilo.stats.streak, value: `${profile?.currentStreak ?? 0}🔥`, color: "text-orange-400" },
          { icon: Dumbbell, label: copy.profilo.stats.longestStreak, value: profile?.longestStreak ?? 0, color: "text-primary" },
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
        <CardHeader><CardTitle className="text-base">{copy.profilo.accountTitle}</CardTitle></CardHeader>
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
        <CardHeader><CardTitle className="text-base">{copy.profilo.editTitle}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{copy.profilo.nameLabel}</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={copy.profilo.namePlaceholder} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{copy.profilo.ageLabel}</label>
              <Input type="number" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} placeholder={copy.profilo.agePlaceholder} min="10" max="99" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{copy.profilo.weightLabel}</label>
              <Input type="number" value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} placeholder={copy.profilo.weightPlaceholder} min="30" max="300" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{copy.profilo.heightLabel}</label>
              <Input type="number" value={form.height} onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))} placeholder={copy.profilo.heightPlaceholder} min="100" max="250" />
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? copy.profilo.saved : copy.profilo.save}
          </Button>
        </CardContent>
      </Card>

      {/* Rifai il quiz */}
      <Card>
        <CardHeader><CardTitle className="text-base">{copy.profilo.retakeQuiz.title}</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">{copy.profilo.retakeQuiz.desc}</p>
          <Button variant="outline" asChild className="gap-2 shrink-0">
            <Link href="/onboarding/quiz">
              <ListChecks className="w-4 h-4" />
              {copy.profilo.retakeQuiz.cta}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Note mediche */}
      <Card>
        <CardHeader><CardTitle className="text-base">{copy.profilo.noteMediche.title}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{copy.profilo.noteMediche.desc}</p>
          <textarea
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            placeholder={copy.profilo.noteMediche.placeholder}
            maxLength={2000}
            className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[90px]"
          />
          <p className="text-xs text-muted-foreground">{copy.profilo.noteMediche.disclaimer}</p>
          <Button onClick={saveMedicalNotes} disabled={savingNotes} className="gap-2">
            {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {savedNotes ? copy.profilo.noteMediche.saved : copy.profilo.noteMediche.save}
          </Button>
        </CardContent>
      </Card>

      {/* Documenti (fitness/nutrizione) */}
      <DocumentsCard />

      {/* Video delle analisi registrate */}
      <ProfileVideosCard />

      {/* Abbonamento */}
      <Card>
        <CardHeader><CardTitle className="text-base">{copy.profilo.abbonamento.title}</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-muted-foreground">{copy.profilo.abbonamento.desc}</p>
          <Button variant="outline" asChild className="gap-2 shrink-0">
            <Link href="/abbonamento">
              <Sparkles className="w-4 h-4" />
              {copy.profilo.abbonamento.cta}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Visibilità profilo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{copy.profilo.visibilityTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {copy.profilo.visibilityDesc}
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
              {copy.profilo.visibilityPublic}
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
              {copy.profilo.visibilityPrivate}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* I miei dati (GDPR) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{copy.profilo.dataTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {copy.profilo.dataDesc}
          </p>
          <Button variant="outline" asChild className="gap-2">
            <a href="/api/account/export">
              <Download className="w-4 h-4" />
              {copy.profilo.dataDownload}
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Guida — come funziona l'app */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            {copy.profilo.guida.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{copy.profilo.guida.intro}</p>
          <div className="space-y-3">
            {copy.profilo.guida.items.map((it) => (
              <div key={it.q}>
                <p className="text-sm font-medium">{it.q}</p>
                <p className="text-sm text-muted-foreground">{it.a}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-destructive/30">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">{copy.profilo.logoutTitle}</p>
            <p className="text-sm text-muted-foreground">{copy.profilo.logoutDesc}</p>
          </div>
          <Button variant="destructive" onClick={() => signOut({ callbackUrl: "/" })} className="gap-2">
            <LogOut className="w-4 h-4" />
            {copy.profilo.logout}
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
      setError(body.error ?? copy.profilo.deleteError);
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
          {copy.profilo.deleteTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!open ? (
          <>
            <p className="text-sm text-muted-foreground">
              {copy.profilo.deleteDesc}
            </p>
            <Button variant="destructive" onClick={() => setOpen(true)} className="gap-2">
              <Trash2 className="w-4 h-4" />
              {copy.profilo.deleteTitle}
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {copy.profilo.deleteConfirmPre}<span className="font-mono font-semibold text-foreground">{copy.profilo.deleteConfirmKeyword}</span>{copy.profilo.deleteConfirmPost}
            </p>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder={copy.profilo.deleteConfirmTextPlaceholder} />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={copy.profilo.deletePasswordPlaceholder} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={busy || confirmText !== copy.profilo.deleteConfirmKeyword || !password}
                className="gap-2"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {copy.profilo.deleteConfirm}
              </Button>
              <Button variant="outline" onClick={() => { setOpen(false); setConfirmText(""); setPassword(""); setError(null); }}>
                {copy.profilo.cancel}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
