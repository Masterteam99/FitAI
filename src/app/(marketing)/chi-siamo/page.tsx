import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShieldCheck, Cpu, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";

export const metadata: Metadata = {
  title: "Chi siamo — FitAI",
  description: "La nostra missione: rendere l'allenamento personalizzato e sicuro accessibile a tutti grazie all'intelligenza artificiale.",
};

const VALUES = [
  { icon: Heart, title: "Allenamento per tutti", desc: "Un personal trainer privato è un lusso. Vogliamo offrire la stessa qualità di guida a chiunque, ovunque." },
  { icon: ShieldCheck, title: "Sicurezza prima di tutto", desc: "I nostri piani considerano infortuni e controindicazioni, e l'analisi della tecnica aiuta a prevenire errori che fanno male." },
  { icon: Cpu, title: "Tecnologia trasparente", desc: "Combiniamo l'AI di Claude e la computer vision di MediaPipe, spiegandoti sempre il perché di ogni consiglio." },
];

export default function ChiSiamoPage() {
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">Allenamento intelligente, <span className="text-gradient-energy">per tutti</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground">
            FitAI nasce da un&apos;idea semplice: la guida di un personal trainer esperto non dovrebbe dipendere dal budget o dalla città in cui vivi.
          </p>
        </FadeIn>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12 space-y-6">
        <FadeIn>
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-8 space-y-4 text-muted-foreground">
              <p>
                Abbiamo unito l&apos;intelligenza artificiale e la computer vision per ricreare l&apos;esperienza di un allenatore privato:
                un piano costruito su misura, un occhio attento sulla tua tecnica e un coach pronto a rispondere a ogni domanda.
              </p>
              <p>
                Non vendiamo programmi preconfezionati uguali per tutti. Ogni piano viene composto a partire dal tuo profilo —
                obiettivi, livello, attrezzatura e storico — scegliendo gli esercizi più adatti e scartando quelli rischiosi per te.
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-20">
        <Stagger className="grid md:grid-cols-3 gap-6">
          {VALUES.map((v) => {
            const Icon = v.icon;
            return (
              <StaggerItem key={v.title}>
                <Card className="h-full bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.desc}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md">Unisciti a noi</h2>
        <p className="text-muted-foreground">Inizia il tuo percorso con FitAI, gratis.</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">Inizia gratis <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>
    </>
  );
}
