import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Sliders, Sparkles, Camera, TrendingUp, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";

export const metadata: Metadata = {
  title: "Come funziona — FitAI",
  description: "Dal profilo al piano AI all'analisi della tecnica: scopri come FitAI ti accompagna in cinque passi.",
};

const STEPS = [
  { icon: UserPlus, title: "Crea il tuo profilo", desc: "Registrati e rispondi a poche domande: obiettivo, livello, attrezzatura disponibile, dati fisici e storico sportivo." },
  { icon: Sliders, title: "Imposta le preferenze", desc: "Indica quanti giorni a settimana ti alleni, lo stile alimentare ed eventuali problematiche fisiche da tenere in considerazione." },
  { icon: Sparkles, title: "L'AI genera il piano", desc: "Claude analizza il tuo profilo e compone allenamento e nutrizione scegliendo gli esercizi più rilevanti dal database, evitando quelli controindicati." },
  { icon: Camera, title: "Allenati e filma la tecnica", desc: "Durante la sessione attivi la fotocamera: la computer vision misura i tuoi movimenti e ti dà feedback su postura ed esecuzione." },
  { icon: TrendingUp, title: "Monitora i progressi", desc: "Sessioni, carichi e misurazioni vengono tracciati nel tempo. Il coach AI adatta i consigli mano a mano che migliori." },
];

export default function ComeFunzionaPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">Come <span className="text-gradient-energy">funziona</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dal primo accesso al miglioramento misurabile: cinque passi semplici, guidati dall&apos;intelligenza artificiale.
          </p>
        </FadeIn>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <Stagger className="space-y-5">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <StaggerItem key={s.title}>
                <Card className="bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-6 flex gap-5 items-start">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-primary">Passo {i + 1}</span>
                      </div>
                      <h3 className="font-semibold text-lg">{s.title}</h3>
                      <p className="text-sm text-muted-foreground">{s.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md">Pronto a iniziare?</h2>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">Crea account gratuito <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>
    </>
  );
}
