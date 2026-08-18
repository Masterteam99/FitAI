import type { Metadata } from "next";
import { Apple, Smartphone, Check, Info } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { InstallPwaButton } from "@/components/marketing/InstallPwaButton";
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
        <FadeIn delay={0.28}>
          <div className="pt-2"><InstallPwaButton /></div>
        </FadeIn>
      </section>

      <section id="istruzioni-installazione" className="max-w-4xl mx-auto px-4 pb-16 grid md:grid-cols-2 gap-6 scroll-mt-20">
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

      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-2 gap-5">
          {c.benefits.map((b) => (
            <div key={b.title} className="flex gap-3 bg-card border border-border rounded-[16px] p-5">
              <Check className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--organic-green-deep)" }} />
              <div>
                <p className="font-semibold text-sm">{b.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="rounded-[22px] p-7 md:p-8" style={{ background: "var(--organic-espresso)", color: "var(--foreground)" }}>
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--organic-terracotta-soft)" }} />
            <div>
              <h2 className="font-display text-lg mb-2">{c.whyBrowser.title}</h2>
              <p className="text-sm" style={{ color: "rgba(234,241,248,.8)" }}>{c.whyBrowser.body}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
