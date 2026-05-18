"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Zap, Mail, Lock, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  name: z.string().min(2, "Minimo 2 caratteri"),
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "Minimo 8 caratteri"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Le password non coincidono", path: ["confirmPassword"] });
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Errore durante la registrazione.");
      return;
    }
    await signIn("credentials", { email: data.email, password: data.password, redirect: false });
    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Inizia ora</h1>
          <p className="text-muted-foreground mt-2">Crea il tuo account FitAI gratuito</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <Button variant="outline" className="w-full gap-3" onClick={() => signIn("google", { callbackUrl: "/onboarding" })}>
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Registrati con Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-card px-2">oppure</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
            {[
              { name: "name" as const, label: "Nome completo", icon: User, type: "text", placeholder: "Mario Rossi" },
              { name: "email" as const, label: "Email", icon: Mail, type: "email", placeholder: "nome@email.com" },
              { name: "password" as const, label: "Password", icon: Lock, type: "password", placeholder: "Minimo 8 caratteri" },
              { name: "confirmPassword" as const, label: "Conferma password", icon: Lock, type: "password", placeholder: "Ripeti la password" },
            ].map(({ name, label, icon: Icon, type, placeholder }) => (
              <div key={name} className="space-y-1">
                <label className="text-sm font-medium">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input className="pl-9" type={type} placeholder={placeholder} {...register(name)} />
                </div>
                {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registrazione..." : "Crea account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Hai già un account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">Accedi</Link>
        </p>
      </div>
    </div>
  );
}
