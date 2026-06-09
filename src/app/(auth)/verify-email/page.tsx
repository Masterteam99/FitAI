"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Mail, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";

const MESSAGES = {
  ok: { title: copy.verifyEmail.messages.ok.title, desc: copy.verifyEmail.messages.ok.desc, icon: "ok" as const },
  expired: { title: copy.verifyEmail.messages.expired.title, desc: copy.verifyEmail.messages.expired.desc, icon: "err" as const },
  already: { title: copy.verifyEmail.messages.already.title, desc: copy.verifyEmail.messages.already.desc, icon: "ok" as const },
  invalid: { title: copy.verifyEmail.messages.invalid.title, desc: copy.verifyEmail.messages.invalid.desc, icon: "err" as const },
  pending: { title: copy.verifyEmail.messages.pending.title, desc: copy.verifyEmail.messages.pending.desc, icon: "pending" as const },
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}

function VerifyEmailInner() {
  const params = useSearchParams();
  const status = (params.get("status") ?? "pending") as keyof typeof MESSAGES;
  const m = MESSAGES[status] ?? MESSAGES.pending;
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  async function resend() {
    setResendError(null);
    const res = await fetch("/api/auth/send-verification", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setResendError(body.error ?? copy.verifyEmail.errors.resend);
      return;
    }
    setResent(true);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {m.icon === "ok" && <CheckCircle2 className="w-14 h-14 text-primary mx-auto" />}
          {m.icon === "err" && <AlertCircle className="w-14 h-14 text-destructive mx-auto" />}
          {m.icon === "pending" && <Mail className="w-14 h-14 text-primary mx-auto" />}

          <h1 className="text-2xl font-bold">{m.title}</h1>
          <p className="text-muted-foreground text-sm">{m.desc}</p>

          {status === "ok" && (
            <Button asChild className="w-full mt-2">
              <Link href="/dashboard">{copy.verifyEmail.dashboardButton}</Link>
            </Button>
          )}
          {(status === "expired" || status === "pending") && (
            <div className="space-y-2">
              {resent ? (
                <p className="text-sm text-primary">{copy.verifyEmail.resendSent}</p>
              ) : (
                <Button onClick={resend} variant="outline" className="w-full">{copy.verifyEmail.resendButton}</Button>
              )}
              {resendError && <p className="text-sm text-destructive">{resendError}</p>}
            </div>
          )}
        </div>

        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          {copy.verifyEmail.backToLogin}
        </Link>
      </div>
    </div>
  );
}
