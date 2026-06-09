"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, X, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { copy } from "@/content/copy";

interface BillingState {
  subscriptionStatus: "FREE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  subscriptionPlan: "MONTHLY" | "YEARLY" | null;
  subscriptionCurrentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const STATUS_LABEL: Record<BillingState["subscriptionStatus"], string> = copy.abbonamento.statusLabels;

const FREE_FEATURES = copy.abbonamento.freeFeatures;

const PREMIUM_FEATURES = copy.abbonamento.premiumFeatures;

export default function AbbonamentoPage() {
  const params = useSearchParams();
  const flashStatus = params.get("status");
  const [billing, setBilling] = useState<BillingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"checkout-monthly" | "checkout-yearly" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((r) => r.json())
      .then(setBilling)
      .finally(() => setLoading(false));
  }, []);

  async function startCheckout(plan: "MONTHLY" | "YEARLY") {
    setBusy(plan === "MONTHLY" ? "checkout-monthly" : "checkout-yearly");
    setError(null);
    const res = await fetch("/api/billing/checkout", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? copy.abbonamento.genericError);
      setBusy(null);
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  async function openPortal() {
    setBusy("portal");
    setError(null);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? copy.abbonamento.genericError);
      setBusy(null);
      return;
    }
    const { url } = await res.json();
    window.location.href = url;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const isPremium = billing && ["ACTIVE", "TRIALING"].includes(billing.subscriptionStatus);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" />
          {copy.abbonamento.title}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {copy.abbonamento.subtitle}
        </p>
      </div>

      {flashStatus === "success" && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg p-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {copy.abbonamento.successFlash}
        </div>
      )}
      {flashStatus === "cancel" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/40 border border-border rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {copy.abbonamento.cancelFlash}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <Card className={isPremium ? "border-primary/40 bg-primary/5" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base">{copy.abbonamento.yourPlanTitle}</CardTitle>
            <Badge variant={isPremium ? "default" : "secondary"}>
              {STATUS_LABEL[billing?.subscriptionStatus ?? "FREE"]}
              {billing?.subscriptionPlan && ` · ${billing.subscriptionPlan === "MONTHLY" ? copy.abbonamento.planMonthly : copy.abbonamento.planYearly}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isPremium ? (
            <>
              <p className="text-sm text-muted-foreground">
                {billing?.cancelAtPeriodEnd
                  ? copy.abbonamento.cancelAtPeriodEnd
                  : copy.abbonamento.autoRenew}
                {billing?.subscriptionCurrentPeriodEnd && (
                  <>{copy.abbonamento.nextRenewalPre}<span className="text-foreground">{new Date(billing.subscriptionCurrentPeriodEnd).toLocaleDateString("it-IT")}</span></>
                )}
              </p>
              <Button onClick={openPortal} disabled={busy === "portal"} variant="outline" className="gap-2">
                {busy === "portal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                {copy.abbonamento.managePlan}
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{copy.abbonamento.freePlanNote}</p>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <PlanCard
          title={copy.abbonamento.freeTitle}
          price={copy.abbonamento.freePrice}
          period={copy.abbonamento.freePeriod}
          features={FREE_FEATURES}
          cta={null}
        />
        <PlanCard
          title={copy.abbonamento.premiumTitle}
          price={copy.abbonamento.premiumPrice}
          period={copy.abbonamento.premiumPeriod}
          features={PREMIUM_FEATURES}
          highlight
          cta={
            isPremium ? null : (
              <div className="space-y-2">
                <Button onClick={() => startCheckout("MONTHLY")} disabled={!!busy} className="w-full gap-2">
                  {busy === "checkout-monthly" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {copy.abbonamento.subscribeMonthly}
                </Button>
                <Button onClick={() => startCheckout("YEARLY")} disabled={!!busy} variant="outline" className="w-full gap-2">
                  {busy === "checkout-yearly" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {copy.abbonamento.subscribeYearly}
                </Button>
              </div>
            )
          }
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        {copy.abbonamento.footnote}
      </p>
    </div>
  );
}

function PlanCard({ title, price, period, features, cta, highlight }: {
  title: string; price: string; period: string;
  features: readonly { ok: boolean; label: string }[];
  cta: React.ReactNode | null; highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-primary/50 bg-primary/5" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {highlight && <Badge className="bg-primary/20 text-primary border-primary/30">{copy.abbonamento.recommendedBadge}</Badge>}
        </div>
        <div className="mt-2">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-sm text-muted-foreground ml-1">{period}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2 text-sm">
          {features.map((f) => (
            <li key={f.label} className="flex items-center gap-2">
              {f.ok ? <Check className="w-4 h-4 text-primary shrink-0" /> : <X className="w-4 h-4 text-muted-foreground shrink-0" />}
              <span className={f.ok ? "" : "text-muted-foreground line-through"}>{f.label}</span>
            </li>
          ))}
        </ul>
        {cta}
      </CardContent>
    </Card>
  );
}
