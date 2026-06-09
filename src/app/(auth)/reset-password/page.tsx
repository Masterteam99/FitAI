"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copy } from "@/content/copy";

const schema = z.object({
  password: z.string().min(8, copy.resetPassword.validation.passwordMin).max(128),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: copy.resetPassword.validation.passwordsMismatch, path: ["confirmPassword"] });
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    if (!token) {
      setError(copy.resetPassword.errors.tokenMissing);
      return;
    }
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: data.password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? copy.resetPassword.errors.generic);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">{copy.resetPassword.title}</h1>
          <p className="text-muted-foreground mt-2">{copy.resetPassword.subtitle}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {!token ? (
            <div className="text-center space-y-2 py-2">
              <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
              <p className="text-sm text-muted-foreground">{copy.resetPassword.invalidLink}</p>
              <Link href="/forgot-password" className="text-primary text-sm hover:underline inline-block mt-2">{copy.resetPassword.requestReset}</Link>
            </div>
          ) : done ? (
            <div className="text-center space-y-3 py-2">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
              <h2 className="font-semibold">{copy.resetPassword.doneTitle}</h2>
              <p className="text-sm text-muted-foreground">{copy.resetPassword.doneBody}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-sm font-medium">{copy.resetPassword.passwordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9" type="password" placeholder={copy.resetPassword.passwordPlaceholder} {...register("password")} />
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">{copy.resetPassword.confirmPasswordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9" type="password" placeholder={copy.resetPassword.confirmPasswordPlaceholder} {...register("confirmPassword")} />
                </div>
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? copy.resetPassword.submitting : copy.resetPassword.submit}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
