"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { ArticlesGrid } from "@/components/marketing/ArticlesGrid";
import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

export function RisorseContent() {
  const copy = useCopy();
  const c = copy.risorse;
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">
            <EditableText path="risorse.heroTitle.pre">{c.heroTitle.pre}</EditableText>
            <span className="text-gradient-energy"><EditableText path="risorse.heroTitle.highlight">{c.heroTitle.highlight}</EditableText></span>
          </h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground"><EditableText path="risorse.heroSubtitle">{c.heroSubtitle}</EditableText></p>
        </FadeIn>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <ArticlesGrid />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md"><EditableText path="risorse.ctaTitle">{c.ctaTitle}</EditableText></h2>
        <p className="text-muted-foreground"><EditableText path="risorse.ctaSubtitle">{c.ctaSubtitle}</EditableText></p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">
            <EditableText path="risorse.ctaButton">{c.ctaButton}</EditableText> <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
      </section>
    </>
  );
}
