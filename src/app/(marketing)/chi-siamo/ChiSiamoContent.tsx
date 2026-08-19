"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

export function ChiSiamoContent() {
  const copy = useCopy();
  const c = copy.chiSiamo;
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">
            <EditableText path="chiSiamo.heroTitle.pre">{c.heroTitle.pre}</EditableText>
            <span className="text-gradient-energy"><EditableText path="chiSiamo.heroTitle.highlight">{c.heroTitle.highlight}</EditableText></span>
          </h1>
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
        <h2 className="text-display-md"><EditableText path="chiSiamo.ctaTitle">{c.ctaTitle}</EditableText></h2>
        <p className="text-muted-foreground"><EditableText path="chiSiamo.ctaSubtitle">{c.ctaSubtitle}</EditableText></p>
        <FadeIn>
          <Link href="/onboarding/step1">
            <Button size="lg" className="gap-2 px-8 glow-energy"><EditableText path="chiSiamo.ctaButton">{c.ctaButton}</EditableText> <ChevronRight className="w-5 h-5" /></Button>
          </Link>
        </FadeIn>
      </section>
    </>
  );
}
