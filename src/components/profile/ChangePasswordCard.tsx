"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Lock } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { copy } from "@/content/copy";

export function ChangePasswordCard() {
  const c = copy.profilo.changePassword;
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = next.length >= 8 && confirm.length >= 8;

  async function submit() {
    setError(null);
    if (next !== confirm) {
      setError(c.mismatchError);
      return;
    }
    setSaving(true);
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current || undefined, newPassword: next }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body.error ?? c.genericError;
      setError(msg);
      toast({ title: c.genericError, description: msg, variant: "destructive" });
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    toast({ title: c.success, variant: "success" });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="w-4 h-4 text-primary" />
          {c.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{c.desc}</p>
        <div>
          <label className="text-sm font-medium mb-1.5 block">{c.currentLabel}</label>
          <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder={c.currentPlaceholder} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{c.newLabel}</label>
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder={c.newPlaceholder} minLength={8} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{c.confirmLabel}</label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={c.confirmPlaceholder} minLength={8} />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={submit} disabled={saving || !canSubmit} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {c.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
