"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Mail } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { copy } from "@/content/copy";

export function ChangeEmailCard() {
  const c = copy.profilo.changeEmail;
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = /\S+@\S+\.\S+/.test(newEmail) && password.length > 0;

  async function submit() {
    setError(null);
    setSaving(true);
    const res = await fetch("/api/account/change-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newEmail, password }),
    });
    setSaving(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const msg = body.error ?? c.genericError;
      setError(msg);
      toast({ title: c.genericError, description: msg, variant: "destructive" });
      return;
    }
    setNewEmail("");
    setPassword("");
    toast({ title: c.success, variant: "success" });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          {c.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{c.desc}</p>
        <div>
          <label className="text-sm font-medium mb-1.5 block">{c.newEmailLabel}</label>
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder={c.newEmailPlaceholder}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">{c.passwordLabel}</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={c.passwordPlaceholder}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={submit} disabled={saving || !canSubmit} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {c.cta}
        </Button>
      </CardContent>
    </Card>
  );
}
