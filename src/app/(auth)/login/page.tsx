"use client";

import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrganicLogo } from "@/components/marketing/OrganicLogo";
import { copy } from "@/content/copy";

const schema = z.object({
  email: z.string().email(copy.login.validation.emailInvalid),
  password: z.string().min(6, copy.login.validation.passwordMin),
});
type FormData = z.infer<typeof schema>;

// NextAuth redirige qui con ?error=<codice> quando l'OAuth fallisce
// (pages.error in src/lib/auth.ts): mappiamo i codici a messaggi leggibili.
const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  OAuthSignin: copy.login.errors.OAuthSignin,
  OAuthCallback: copy.login.errors.OAuthCallback,
  AccessDenied: copy.login.errors.AccessDenied,
  Configuration: copy.login.errors.Configuration,
  OAuthAccountNotLinked: copy.login.errors.OAuthAccountNotLinked,
};

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthErrorCode = searchParams.get("error");
  const [error, setError] = useState<string | null>(
    oauthErrorCode ? (OAUTH_ERROR_MESSAGES[oauthErrorCode] ?? copy.login.errors.oauthGeneric) : null,
  );
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    const result = await signIn("credentials", { ...data, redirect: false });
    if (result?.error) {
      // L'account potrebbe esistere ma essere stato creato con Google
      // (senza password): in quel caso il messaggio generico è fuorviante.
      const hint = await fetch("/api/auth/login-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      }).then((r) => r.json()).catch(() => ({ oauthOnly: false }));
      setError(hint.oauthOnly ? copy.login.errors.oauthOnlyAccount : copy.login.errors.invalidCredentials);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex justify-center mb-4">
            <OrganicLogo />
          </div>
          <h1 className="font-display text-3xl">{copy.login.title}</h1>
          <p className="text-muted-foreground mt-2">{copy.login.subtitle}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <Button variant="outline" className="w-full gap-3" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {copy.login.googleButton}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-card px-2">{copy.login.divider}</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium">{copy.login.emailLabel}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder={copy.login.emailPlaceholder} {...register("email")} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">{copy.login.passwordLabel}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" type="password" placeholder={copy.login.passwordPlaceholder} {...register("password")} />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? copy.login.submitting : copy.login.submit}
            </Button>
            <div className="text-center">
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {copy.login.forgotPassword}
              </Link>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {copy.login.noAccount}{" "}
          <Link href="/registrati" className="text-primary hover:underline font-medium">{copy.login.signupLink}</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
