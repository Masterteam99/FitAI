import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import {
  ScrollExplainer,
  AnimatedRing,
  AnimatedBars,
  AdaptiveBodyMap,
  ExerciseFormPlayer,
  AnimatedArea,
} from "@/components/wow";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.comeFunziona.meta.title,
  description: copy.comeFunziona.meta.description,
};

function VisualCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-[28px] p-8 grid place-items-center w-full max-w-[340px] mx-auto">
      {children}
    </div>
  );
}

export default function ComeFunzionaPage() {
  const steps = copy.comeFunziona.steps;
  const visuals = [
    <VisualCard key="v0"><AnimatedRing value={92} label="profilo" /></VisualCard>,
    <VisualCard key="v1">
      <AnimatedBars
        className="w-full"
        data={[
          { label: "Forza", value: 24 },
          { label: "Ipertrofia", value: 32 },
          { label: "Mobilità", value: 18 },
        ]}
      />
    </VisualCard>,
    <VisualCard key="v2">
      <div className="w-[240px]">
        <AdaptiveBodyMap
          mode="balance"
          showToggle={false}
          data={[
            { muscle: "QUADRICEPS", deficitPct: 64 },
            { muscle: "SHOULDERS", deficitPct: 52 },
          ]}
        />
      </div>
    </VisualCard>,
    <VisualCard key="v3"><ExerciseFormPlayer archetype="squat" errorNote="ginocchia in avanti" size={190} /></VisualCard>,
    <VisualCard key="v4">
      <AnimatedArea values={[18, 24, 22, 31, 29, 40, 47, 56]} color="#3fae5a" className="w-full h-[150px] block" />
    </VisualCard>,
  ];

  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">
            {copy.comeFunziona.heroTitle.pre}
            <span className="text-gradient-energy">{copy.comeFunziona.heroTitle.highlight}</span>
          </h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{copy.comeFunziona.heroSubtitle}</p>
        </FadeIn>
      </section>

      <section className="max-w-6xl mx-auto px-4">
        <ScrollExplainer
          steps={steps.map((s) => ({ title: s.title, desc: s.desc }))}
          stepVh={58}
          visuals={visuals.slice(0, steps.length)}
        />
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md">{copy.comeFunziona.ctaTitle}</h2>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">
            {copy.comeFunziona.ctaButton} <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
      </section>
    </>
  );
}
