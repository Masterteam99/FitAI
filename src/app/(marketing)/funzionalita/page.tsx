import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Camera, Target, BarChart, Trophy, Zap, Apple, Dumbbell, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem, CardHover } from "@/components/motion/MotionPrimitives";
import { ExerciseFormPlayer, AdaptiveBodyMap, AnimatedArea } from "@/components/wow";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.funzionalita.meta.title,
  description: copy.funzionalita.meta.description,
};

const FEATURE_STYLES = [
  { icon: Brain, color: "text-primary" },
  { icon: Camera, color: "text-blue-400" },
  { icon: Target, color: "text-purple-400" },
  { icon: Apple, color: "text-green-400" },
  { icon: BarChart, color: "text-orange-400" },
  { icon: Trophy, color: "text-yellow-400" },
  { icon: Zap, color: "text-pink-400" },
  { icon: Dumbbell, color: "text-cyan-400" },
];
const FEATURES = copy.funzionalita.features.map((f, i) => ({ ...f, ...FEATURE_STYLES[i] }));

export default function FunzionalitaPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium">
            <Zap className="w-4 h-4" /> {copy.funzionalita.badge}
          </div>
        </FadeIn>
        <SlideUp delay={0.05}>
          <h1 className="text-display-lg">{copy.funzionalita.heroTitle.pre}<span className="text-gradient-energy">{copy.funzionalita.heroTitle.highlight}</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {copy.funzionalita.heroSubtitle}
          </p>
        </FadeIn>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-12">
        <FadeIn>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-[28px] p-7 flex flex-col items-center text-center">
              <ExerciseFormPlayer archetype="squat" errorNote="ginocchia in avanti" size={170} />
              <h3 className="font-display text-lg mt-5">Analisi della tecnica</h3>
              <p className="text-sm text-muted-foreground mt-1">Ricostruisce il movimento e segnala dove correggere.</p>
            </div>
            <div className="bg-card border border-border rounded-[28px] p-7 flex flex-col items-center text-center">
              <div className="w-[210px]">
                <AdaptiveBodyMap mode="balance" showToggle={false} data={[{ muscle: "QUADRICEPS", deficitPct: 64 }, { muscle: "CALVES", deficitPct: 55 }]} />
              </div>
              <h3 className="font-display text-lg mt-5">Equilibrio muscolare</h3>
              <p className="text-sm text-muted-foreground mt-1">Mostra i gruppi che alleni troppo poco.</p>
            </div>
            <div className="bg-card border border-border rounded-[28px] p-7 flex flex-col items-center text-center">
              <div className="w-full">
                <AnimatedArea values={[16, 22, 20, 30, 28, 39, 46, 55]} color="#3fae5a" className="w-full h-[140px] block" />
              </div>
              <h3 className="font-display text-lg mt-5">Progressi reali</h3>
              <p className="text-sm text-muted-foreground mt-1">L&apos;andamento del tuo carico nel tempo.</p>
            </div>
          </div>
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
        <h2 className="text-display-md">{copy.funzionalita.ctaTitle}</h2>
        <p className="text-muted-foreground">{copy.funzionalita.ctaSubtitle}</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">{copy.funzionalita.ctaButton} <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>
    </>
  );
}
