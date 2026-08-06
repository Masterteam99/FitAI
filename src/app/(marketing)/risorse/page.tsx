import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { ArticlesGrid } from "@/components/marketing/ArticlesGrid";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.risorse.meta.title,
  description: copy.risorse.meta.description,
};

export default function RisorsePage() {
  const c = copy.risorse;
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

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <ArticlesGrid />
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
