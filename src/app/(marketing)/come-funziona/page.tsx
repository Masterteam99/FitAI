import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Sliders, Sparkles, Camera, TrendingUp, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.comeFunziona.meta.title,
  description: copy.comeFunziona.meta.description,
};

const STEP_ICONS = [UserPlus, Sliders, Sparkles, Camera, TrendingUp];
const STEPS = copy.comeFunziona.steps.map((s, i) => ({ ...s, icon: STEP_ICONS[i] }));

export default function ComeFunzionaPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">{copy.comeFunziona.heroTitle.pre}<span className="text-gradient-energy">{copy.comeFunziona.heroTitle.highlight}</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {copy.comeFunziona.heroSubtitle}
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
                        <span className="text-xs font-semibold text-primary">{copy.comeFunziona.stepLabel} {i + 1}</span>
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
        <h2 className="text-display-md">{copy.comeFunziona.ctaTitle}</h2>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">{copy.comeFunziona.ctaButton} <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>
    </>
  );
}
