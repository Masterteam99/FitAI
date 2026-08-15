import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.chiSiamo.meta.title,
  description: copy.chiSiamo.meta.description,
};

export default function ChiSiamoPage() {
  const c = copy.chiSiamo;
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">{c.heroTitle.pre}<span className="text-gradient-energy">{c.heroTitle.highlight}</span></h1>
        </SlideUp>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <Stagger className="space-y-5">
          {c.blocks.map((b) => (
            <StaggerItem key={b.title}>
              <Card className="bg-card/60 backdrop-blur-sm">
                <CardContent className="p-7 space-y-2">
                  <h2 className="font-semibold text-lg">{b.title}</h2>
                  <p className="text-sm text-muted-foreground italic">{b.text}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md">{c.ctaTitle}</h2>
        <p className="text-muted-foreground">{c.ctaSubtitle}</p>
        <FadeIn>
          <Link href="/onboarding/step1">
            <Button size="lg" className="gap-2 px-8 glow-energy">{c.ctaButton} <ChevronRight className="w-5 h-5" /></Button>
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
