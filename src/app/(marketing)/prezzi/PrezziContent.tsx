"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { useCopy } from "@/content/CopyProvider";

export function PrezziContent() {
  const copy = useCopy();
  const FREE = copy.prezzi.free.features;
  const PREMIUM = copy.prezzi.premium.features;

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">{copy.prezzi.heroTitle.pre}<span className="text-gradient-energy">{copy.prezzi.heroTitle.highlight}</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {copy.prezzi.heroSubtitle}
          </p>
        </FadeIn>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-6">
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{copy.prezzi.free.name}</h2>
              <p className="text-sm text-muted-foreground">{copy.prezzi.free.tagline}</p>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold">{copy.prezzi.free.price}</span>
              <span className="text-muted-foreground mb-1">{copy.prezzi.free.period}</span>
            </div>
            <ul className="space-y-3 text-sm">
              {FREE.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/registrati" className="block">
              <Button variant="outline" className="w-full">{copy.prezzi.free.cta}</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-primary/40 relative lg:-translate-y-3 transition-transform shadow-[0_30px_70px_-30px_rgba(24,36,26,.5)]">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full glow-primary">
            {copy.prezzi.premium.badge}
          </div>
          <CardContent className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{copy.prezzi.premium.name}</h2>
              <p className="text-sm text-muted-foreground">{copy.prezzi.premium.tagline}</p>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold">{copy.prezzi.premium.price}</span>
              <span className="text-muted-foreground mb-1">{copy.prezzi.premium.period}</span>
            </div>
            <p className="text-xs text-muted-foreground -mt-4">{copy.prezzi.premium.yearlyNote}</p>
            <ul className="space-y-3 text-sm">
              {PREMIUM.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/registrati" className="block">
              <Button className="w-full gap-2 glow-energy">{copy.prezzi.premium.cta} <ChevronRight className="w-4 h-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-2xl mx-auto px-4 pb-12 text-center">
        <p className="text-sm text-muted-foreground">
          {copy.prezzi.footnote}
        </p>
      </section>

      {/* Cosa include ogni piano */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-display-md text-center mb-8">{copy.prezzi.featureTableTitle}</h2>
        <div className="overflow-x-auto rounded-[20px] border border-border">
          <table className="w-full text-sm border-collapse min-w-[420px]">
            <thead>
              <tr className="border-b border-border">
                {copy.prezzi.featureTable.cols.map((col) => (
                  <th key={col} className="text-left p-4 font-semibold text-muted-foreground">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {copy.prezzi.featureTable.rows.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-b-0">
                  <td className="p-4 font-medium">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="p-4 text-muted-foreground">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Confronto competitor */}
      <section className="max-w-5xl mx-auto px-4 pb-20" style={{ background: "var(--organic-sand)" }}>
        <div className="py-16 px-4">
          <h2 className="text-display-md text-center mb-3">{copy.prezzi.competitorTitle}</h2>
          <p className="text-xs text-muted-foreground text-center max-w-[70ch] mx-auto mb-10">{copy.prezzi.competitorCaption}</p>

          <div className="overflow-x-auto rounded-[20px] border border-border mb-10">
            <table className="w-full text-sm border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-border">
                  {copy.prezzi.competitorPriceTable.cols.map((col) => (
                    <th key={col} className="text-left p-4 font-semibold text-muted-foreground">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {copy.prezzi.competitorPriceTable.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <td className="p-4 font-medium">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className="p-4 text-muted-foreground">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-border">
            <table className="w-full text-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-border">
                  {copy.prezzi.competitorFeatureTable.cols.map((col, i) => (
                    <th key={col} className={`text-left p-4 font-semibold ${i === copy.prezzi.competitorFeatureTable.cols.length - 1 ? "" : "text-muted-foreground"}`} style={i === copy.prezzi.competitorFeatureTable.cols.length - 1 ? { color: "var(--organic-green)" } : undefined}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {copy.prezzi.competitorFeatureTable.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <td className="p-4 font-medium">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`p-4 ${i === row.values.length - 1 ? "font-semibold" : "text-muted-foreground"}`} style={i === row.values.length - 1 ? { color: "var(--organic-green)" } : undefined}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground mt-8 max-w-[80ch] mx-auto text-center">{copy.prezzi.competitorMessage}</p>
        </div>
      </section>

      {/* Quanto costa oggi farsi seguire */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-display-md text-center mb-4">{copy.prezzi.costTitle}</h2>
        <p className="text-muted-foreground text-center max-w-[70ch] mx-auto mb-8">{copy.prezzi.costText}</p>
        <div className="space-y-3">
          {copy.prezzi.costRows.map((r) => (
            <div key={r.label} className="flex justify-between items-center bg-card border border-border rounded-[14px] px-5 py-4 text-sm">
              <span className="font-medium">{r.label}</span>
              <span className="text-muted-foreground">{r.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ prezzi */}
      <section className="max-w-2xl mx-auto px-4 pb-20">
        <h2 className="text-display-md text-center mb-8">{copy.prezzi.faqPrezziTitle}</h2>
        <div className="space-y-4">
          {copy.prezzi.faqPrezzi.map((f) => (
            <Card key={f.q} className="bg-card/60 backdrop-blur-sm">
              <CardContent className="p-6 space-y-2">
                <h3 className="font-semibold text-sm">{f.q}</h3>
                <p className="text-sm text-muted-foreground">{f.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Blocco aziende */}
      <section className="max-w-2xl mx-auto px-4 pb-24 text-center">
        <div className="bg-card border border-border rounded-[20px] p-8">
          <h2 className="font-display text-xl mb-2">{copy.prezzi.azTitle}</h2>
          <p className="text-muted-foreground text-sm mb-5">{copy.prezzi.azText}</p>
          {/* [DA COMPLETARE] nessuna pagina "per le aziende" esiste ancora nel sito: link disattivato finché non c'è una route reale */}
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold opacity-60 cursor-not-allowed" style={{ color: "var(--organic-green-deep)" }}>
            {copy.prezzi.azCta} <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </section>
    </>
  );
}
