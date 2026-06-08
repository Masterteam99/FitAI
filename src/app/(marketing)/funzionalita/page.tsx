import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Camera, Target, BarChart, Trophy, Zap, Apple, Dumbbell, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem, CardHover } from "@/components/motion/MotionPrimitives";

export const metadata: Metadata = {
  title: "Funzionalità — FitAI",
  description: "Piani AI personalizzati, analisi video della tecnica, coach 24/7, nutrizione e gamification. Tutto in un'unica app.",
};

const FEATURES = [
  { icon: Brain, color: "text-primary", title: "Piani allenamento AI", desc: "Claude compone il tuo piano scegliendo gli esercizi più adatti dal database in base a obiettivo, livello, attrezzatura e storico infortuni." },
  { icon: Camera, color: "text-blue-400", title: "Analisi video real-time", desc: "La computer vision di MediaPipe traccia i tuoi movimenti dalla fotocamera e misura gli angoli articolari fotogramma per fotogramma." },
  { icon: Target, color: "text-purple-400", title: "Feedback triplice 50/30/20", desc: "Biomeccanica oggettiva, valutazione dell'AI Expert e confronto con i video dei personal trainer: un giudizio completo sulla tua tecnica." },
  { icon: Apple, color: "text-green-400", title: "Piani nutrizionali AI", desc: "Macro e pasti calibrati su peso, altezza, obiettivo e stile alimentare, generati dall'AI e aggiornabili quando vuoi." },
  { icon: BarChart, color: "text-orange-400", title: "Progressi e misurazioni", desc: "Sessioni, carichi, peso corporeo e circonferenze tracciati nel tempo con grafici interattivi e trend chiari." },
  { icon: Trophy, color: "text-yellow-400", title: "Gamification", desc: "Achievement, streak giornaliere, punti e sfide per trasformare la costanza in qualcosa di divertente." },
  { icon: Zap, color: "text-pink-400", title: "AI Coach 24/7", desc: "Dubbi su tecnica, recupero o alimentazione? Il coach digitale risponde in qualsiasi momento, con il contesto del tuo profilo." },
  { icon: Dumbbell, color: "text-cyan-400", title: "Libreria esercizi", desc: "Schede dettagliate con muscoli coinvolti, attrezzatura e istruzioni: esplorabili anche senza un piano attivo." },
];

export default function FunzionalitaPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium">
            <Zap className="w-4 h-4" /> Funzionalità
          </div>
        </FadeIn>
        <SlideUp delay={0.05}>
          <h1 className="text-display-lg">Tutto quello che serve, <span className="text-gradient-energy">un solo posto</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            FitAI unisce intelligenza artificiale e computer vision per offrirti l&apos;esperienza di un personal trainer privato, sempre disponibile.
          </p>
        </FadeIn>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-20">
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <StaggerItem key={f.title}>
                <CardHover>
                  <Card className="h-full bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors">
                    <CardContent className="p-6 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${f.color}`} />
                      </div>
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </CardContent>
                  </Card>
                </CardHover>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md">Provalo gratis, oggi</h2>
        <p className="text-muted-foreground">Crea il tuo profilo e genera il primo piano in pochi minuti.</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">Inizia gratis <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>
    </>
  );
}
