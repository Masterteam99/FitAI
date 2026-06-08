import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Brain, Camera, Trophy, Target, ChevronRight, BarChart } from "lucide-react";
import { GradientMesh } from "@/components/visualizations/GradientMesh";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { FadeIn, SlideUp, Stagger, StaggerItem, CardHover } from "@/components/motion/MotionPrimitives";

const FEATURES = [
  { icon: Brain, title: "Piani AI Personalizzati", desc: "Claude crea piani su misura basandosi sui tuoi obiettivi, livello e attrezzatura disponibile.", color: "text-primary" },
  { icon: Camera, title: "Analisi Video Real-Time", desc: "Computer vision Google MediaPipe rileva i tuoi movimenti in tempo reale. Feedback istantaneo su postura e tecnica.", color: "text-blue-400" },
  { icon: Target, title: "Analisi Triplice 50/30/20", desc: "Biomeccanica oggettiva, AI Expert e confronto con video PT: feedback completo come quello di un personal trainer privato.", color: "text-purple-400" },
  { icon: BarChart, title: "Progressi Dettagliati", desc: "Traccia sessioni, misurazioni e miglioramenti nel tempo con grafici interattivi.", color: "text-orange-400" },
  { icon: Trophy, title: "Gamification", desc: "Achievements, streak, punti e sfide per mantenerti motivato ogni giorno.", color: "text-yellow-400" },
  { icon: Zap, title: "AI Coach 24/7", desc: "Domande su nutrizione, recupero o tecnica? Il tuo coach AI risponde sempre.", color: "text-green-400" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <GradientMesh palette="rainbow" intensity="medium" fixed />

      <MarketingHeader />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 py-24 text-center space-y-8">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium">
            <Brain className="w-4 h-4" />
            Powered by Claude AI + MediaPipe
          </div>
        </FadeIn>
        <SlideUp delay={0.05}>
          <h1 className="text-display-lg">
            Il tuo <span className="text-gradient-energy">Personal Trainer AI</span><br />sempre con te
          </h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Allenati con piani personalizzati dall&apos;AI, analizza la tua tecnica con la computer vision
            e ricevi feedback da un coach digitale disponibile 24/7.
          </p>
        </FadeIn>
        <FadeIn delay={0.25}>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/registrati">
              <Button size="lg" className="gap-2 px-8 glow-energy">Inizia gratis <ChevronRight className="w-5 h-5" /></Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">Hai già un account</Button>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Feature cards */}
      <section className="relative max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-display-md text-center mb-12">Tutto ciò di cui hai bisogno per allenarti meglio</h2>
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* CTA */}
      <section className="relative max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md">Pronto ad allenarti come un atleta?</h2>
        <p className="text-muted-foreground">Unisciti a migliaia di utenti che si allenano con FitAI</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">Crea account gratuito <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>

      <MarketingFooter />
    </div>
  );
}
