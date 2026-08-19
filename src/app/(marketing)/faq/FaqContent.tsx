"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

export function FaqContent() {
  const copy = useCopy();
  const c = copy.faq;
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">
            <EditableText path="faq.heroTitle.pre">{c.heroTitle.pre}</EditableText>
            <span className="text-gradient-energy"><EditableText path="faq.heroTitle.highlight">{c.heroTitle.highlight}</EditableText></span>
          </h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground"><EditableText path="faq.heroSubtitle">{c.heroSubtitle}</EditableText></p>
        </FadeIn>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <Stagger className="space-y-4">
          {c.faqs.map((f) => (
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
        <h2 className="text-display-md"><EditableText path="faq.ctaTitle">{c.ctaTitle}</EditableText></h2>
        <p className="text-muted-foreground"><EditableText path="faq.ctaSubtitle">{c.ctaSubtitle}</EditableText></p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy"><EditableText path="faq.ctaButton">{c.ctaButton}</EditableText> <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>
    </>
  );
}
