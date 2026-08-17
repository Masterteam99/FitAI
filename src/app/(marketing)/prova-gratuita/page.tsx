import type { Metadata } from "next";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { ProvaGratuitaContent } from "@/components/marketing/ProvaGratuitaContent";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.provaGratuita.meta.title,
  description: copy.provaGratuita.meta.description,
};

export default function ProvaGratuitaPage() {
  const c = copy.provaGratuita;
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-10">
      <div className="text-center space-y-3">
        <SlideUp>
          <h1 className="text-display-lg !text-[clamp(2rem,4vw,2.8rem)]">
            {c.heroTitle.pre}<em style={{ color: "var(--organic-green)" }}>{c.heroTitle.highlight}</em>{c.heroTitle.post}
          </h1>
        </SlideUp>
        <FadeIn delay={0.1}>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">{c.heroSubtitle}</p>
        </FadeIn>
      </div>

      <ProvaGratuitaContent />
    </div>
  );
}
