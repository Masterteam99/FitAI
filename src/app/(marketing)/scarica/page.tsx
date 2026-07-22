import type { Metadata } from "next";
import { Apple, Smartphone } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.scarica.meta.title,
  description: copy.scarica.meta.description,
};

export default function ScaricaPage() {
  const c = copy.scarica;
  const guides = [
    { icon: Apple, ...c.ios },
    { icon: Smartphone, ...c.android },
  ];
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
        <SlideUp>
          <h1 className="text-display-lg">
            {c.heroTitle.pre}
            <span className="text-gradient-energy">{c.heroTitle.highlight}</span>
          </h1>
        </SlideUp>
        <FadeIn delay={0.12}>
          <p className="text-xl text-muted-foreground">{c.heroSubtitle}</p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full" style={{ background: "rgba(15,158,153,.10)", color: "var(--organic-green-deep)" }}>
            {c.note}
          </p>
        </FadeIn>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-24 grid md:grid-cols-2 gap-6">
        {guides.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.title} className="bg-card border border-border rounded-[22px] p-8">
              <div className="w-12 h-12 rounded-xl grid place-items-center mb-5" style={{ background: "rgba(22,33,62,.08)", color: "var(--primary)" }}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="font-display text-xl mb-5">{g.title}</h2>
              <ol className="space-y-3">
                {g.steps.map((s, i) => (
                  <li key={s} className="flex items-start gap-3 text-sm">
                    <span className="w-6 h-6 shrink-0 rounded-full grid place-items-center text-xs font-bold text-white" style={{ background: "var(--organic-terracotta)" }}>
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          );
        })}
      </section>
    </>
  );
}
