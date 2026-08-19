"use client";

import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { ProvaGratuitaContent } from "@/components/marketing/ProvaGratuitaContent";
import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

export function ProvaGratuitaPageContent() {
  const copy = useCopy();
  const c = copy.provaGratuita;
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-3">
        <SlideUp>
          <h1 className="text-display-lg !text-[clamp(2rem,4vw,2.8rem)]">
            <EditableText path="provaGratuita.heroTitle.pre">{c.heroTitle.pre}</EditableText>
            <em style={{ color: "var(--organic-green)" }}><EditableText path="provaGratuita.heroTitle.highlight">{c.heroTitle.highlight}</EditableText></em>
            <EditableText path="provaGratuita.heroTitle.post">{c.heroTitle.post ?? ""}</EditableText>
          </h1>
        </SlideUp>
        <FadeIn delay={0.1}>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto"><EditableText path="provaGratuita.heroSubtitle">{c.heroSubtitle}</EditableText></p>
        </FadeIn>
      </div>

      <ProvaGratuitaContent />
    </div>
  );
}
