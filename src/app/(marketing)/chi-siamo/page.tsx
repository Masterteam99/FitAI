import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShieldCheck, Cpu, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.chiSiamo.meta.title,
  description: copy.chiSiamo.meta.description,
};

const VALUE_ICONS = [Heart, ShieldCheck, Cpu];
const VALUES = copy.chiSiamo.values.map((v, i) => ({ ...v, icon: VALUE_ICONS[i] }));

export default function ChiSiamoPage() {
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">{copy.chiSiamo.heroTitle.pre}<span className="text-gradient-energy">{copy.chiSiamo.heroTitle.highlight}</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground">
            {copy.chiSiamo.heroSubtitle}
          </p>
        </FadeIn>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-12 space-y-6">
        <FadeIn>
          <Card className="bg-card/60 backdrop-blur-sm">
            <CardContent className="p-8 space-y-4 text-muted-foreground">
              {copy.chiSiamo.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
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
        <h2 className="text-display-md">{copy.chiSiamo.ctaTitle}</h2>
        <p className="text-muted-foreground">{copy.chiSiamo.ctaSubtitle}</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">{copy.chiSiamo.ctaButton} <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>
    </>
  );
}
