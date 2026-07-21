import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.storie.meta.title,
  description: copy.storie.meta.description,
};

export default function StoriePage() {
  const c = copy.storie;
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">
            {c.heroTitle.pre}
            <span className="text-gradient-energy">{c.heroTitle.highlight}</span>
          </h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground">{c.heroSubtitle}</p>
        </FadeIn>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <FadeIn>
          <Card className="bg-card/60 backdrop-blur-sm border-dashed">
            <CardContent className="p-10 text-center space-y-4">
              <div
                className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
                style={{ background: "rgba(15,158,153,.12)", color: "var(--organic-green-deep)" }}
              >
                <Quote className="w-7 h-7" />
              </div>
              <span
                className="inline-block text-[10px] uppercase tracking-[0.16em] font-bold px-3 py-1 rounded-full"
                style={{ background: "rgba(233,69,96,.10)", color: "var(--organic-terracotta)" }}
              >
                {c.comingSoonTag}
              </span>
              <h2 className="font-display text-2xl">{c.comingSoonTitle}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{c.comingSoonText}</p>
            </CardContent>
          </Card>
        </FadeIn>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md">{c.ctaTitle}</h2>
        <p className="text-muted-foreground">{c.ctaSubtitle}</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">
            {c.ctaButton} <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
      </section>
    </>
  );
}
