import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.faq.meta.title,
  description: copy.faq.meta.description,
};

const FAQS = copy.faq.faqs;

export default function FaqPage() {
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">{copy.faq.heroTitle.pre}<span className="text-gradient-energy">{copy.faq.heroTitle.highlight}</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground">{copy.faq.heroSubtitle}</p>
        </FadeIn>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <Stagger className="space-y-4">
          {FAQS.map((f) => (
            <StaggerItem key={f.q}>
              <Card className="bg-card/60 backdrop-blur-sm">
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-semibold">{f.q}</h3>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md">{copy.faq.ctaTitle}</h2>
        <p className="text-muted-foreground">{copy.faq.ctaSubtitle}</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">{copy.faq.ctaButton} <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>
    </>
  );
}
