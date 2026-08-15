"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, Mail, Smartphone } from "lucide-react";
import { toast } from "@/components/ui/toaster";
import { copy } from "@/content/copy";
import { isPushSupported, getCurrentPushSubscription, subscribeToPush, unsubscribeFromPush } from "@/lib/push-client";

export function NotificationsCard({
  initialEmailReminders,
}: {
  initialEmailReminders: boolean;
}) {
  const c = copy.profilo.notifiche;
  const [emailReminders, setEmailReminders] = useState(initialEmailReminders);
  const [savingEmail, setSavingEmail] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);
  const [pushBusy, setPushBusy] = useState(false);

  useEffect(() => {
    setPushSupported(isPushSupported());
    getCurrentPushSubscription().then((sub) => setPushSubscribed(Boolean(sub)));
  }, []);

  async function toggleEmailReminders() {
    const next = !emailReminders;
    setSavingEmail(true);
    const res = await fetch("/api/profilo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifyEmailReminders: next }),
    });
    setSavingEmail(false);
    if (!res.ok) {
      toast({ title: c.error, variant: "destructive" });
      return;
    }
    setEmailReminders(next);
    toast({ title: c.saved, variant: "success" });
  }

  async function togglePush() {
    setPushBusy(true);
    try {
      if (pushSubscribed) {
        const endpoint = await unsubscribeFromPush();
        if (endpoint) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint }),
          });
        }
        setPushSubscribed(false);
        toast({ title: c.saved, variant: "success" });
      } else {
        if (Notification.permission === "denied") {
          toast({ title: c.pushPermissionDenied, variant: "destructive" });
          return;
        }
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast({ title: c.pushPermissionDenied, variant: "destructive" });
          return;
        }
        const sub = await subscribeToPush();
        if (!sub) {
          toast({ title: c.error, variant: "destructive" });
          return;
        }
        const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
        });
        if (!res.ok) {
          toast({ title: c.error, variant: "destructive" });
          return;
        }
        setPushSubscribed(true);
        toast({ title: c.saved, variant: "success" });
      }
    } finally {
      setPushBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          {c.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{c.desc}</p>

        <div className="flex items-center justify-between gap-3 p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-start gap-2.5 min-w-0">
            <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{c.emailLabel}</p>
              <p className="text-xs text-muted-foreground">{c.emailDesc}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant={emailReminders ? "default" : "outline"}
            onClick={toggleEmailReminders}
            disabled={savingEmail}
            className="shrink-0 gap-2"
          >
            {savingEmail && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {emailReminders ? "Attivo" : "Disattivo"}
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-start gap-2.5 min-w-0">
            <Smartphone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{c.pushLabel}</p>
              <p className="text-xs text-muted-foreground">
                {pushSupported ? c.pushDesc : c.pushUnsupported}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant={pushSubscribed ? "default" : "outline"}
            onClick={togglePush}
            disabled={pushBusy || !pushSupported}
            className="shrink-0 gap-2"
          >
            {pushBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {pushSubscribed ? c.pushDisable : c.pushEnable}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
