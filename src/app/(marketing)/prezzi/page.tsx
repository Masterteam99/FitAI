import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";

export const metadata: Metadata = {
  title: "Prezzi — FitAI",
  description: "Inizia gratis con piani AI, analisi video e nutrizione. Passa a Premium per uso illimitato a €9,99 al mese.",
};

const FREE = [
  "3 piani di allenamento AI al mese",
  "1 piano nutrizionale AI al mese",
  "5 analisi video della tecnica al mese",
  "Libreria esercizi completa",
  "Tracciamento progressi e gamification",
];

const PREMIUM = [
  "Piani di allenamento AI illimitati",
  "Piani nutrizionali AI illimitati",
  "Analisi video illimitate",
  "Coach AI 24/7 senza limiti",
  "Storico completo e statistiche avanzate",
  "Supporto prioritario",
];

export default function PrezziPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">Un piano per <span className="text-gradient-energy">ogni obiettivo</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Inizia gratis e passa a Premium quando vuoi più potenza. Nessun vincolo, disdici quando vuoi.
          </p>
        </FadeIn>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-6">
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Free</h2>
              <p className="text-sm text-muted-foreground">Per iniziare ad allenarti con l&apos;AI</p>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold">€0</span>
              <span className="text-muted-foreground mb-1">/ per sempre</span>
            </div>
            <ul className="space-y-3 text-sm">
              {FREE.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/registrati" className="block">
              <Button variant="outline" className="w-full">Inizia gratis</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-primary/40 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full glow-primary">
            Consigliato
          </div>
          <CardContent className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">Premium</h2>
              <p className="text-sm text-muted-foreground">Uso illimitato, risultati senza freni</p>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold">€9,99</span>
              <span className="text-muted-foreground mb-1">/ al mese</span>
            </div>
            <p className="text-xs text-muted-foreground -mt-4">oppure €79 all&apos;anno (risparmi il 34%)</p>
            <ul className="space-y-3 text-sm">
              {PREMIUM.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/registrati" className="block">
              <Button className="w-full gap-2 glow-energy">Passa a Premium <ChevronRight className="w-4 h-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Tutti i limiti del piano Free si azzerano all&apos;inizio di ogni mese. Puoi aggiornare o disdire l&apos;abbonamento in qualsiasi momento dal tuo profilo.
        </p>
      </section>
    </>
  );
}
