import Link from "next/link";
import type { Metadata } from "next";
import { Footprints, House, Dumbbell, Baby, HeartPulse, Activity, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.perChi.meta.title,
  description: copy.perChi.meta.description,
};

const SEGMENT_ICONS = [Footprints, House, Dumbbell, Baby, HeartPulse, Activity];

export default function PerChiPage() {
  const c = copy.perChi;
  return (
    <>
      <section className="max-w-[1180px] mx-auto px-7 pt-20 pb-10 text-center">
        <FadeIn>
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold mb-5" style={{ color: "var(--organic-green-deep)" }}>
            <span className="organic-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--organic-green)" }} />
            {c.badge}
          </span>
        </FadeIn>
        <SlideUp delay={0.05}>
          <h1 className="text-display-lg !text-[clamp(2.6rem,5vw,4rem)] mb-5">
            {c.heroTitle.pre}
            <em style={{ color: "var(--organic-green)" }}>{c.heroTitle.highlight}</em>
          </h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-lg text-muted-foreground max-w-[620px] mx-auto">{c.heroSubtitle}</p>
        </FadeIn>
      </section>

      <section className="max-w-[1180px] mx-auto px-7 pb-16">
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {c.segments.map((s, i) => {
            const Icon = SEGMENT_ICONS[i];
            return (
              <StaggerItem key={s.title}>
                <div className="group bg-card border border-border rounded-[22px] p-8 h-full transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--organic-terracotta-soft)] hover:shadow-[0_24px_50px_-28px_rgba(22,33,62,.28)]">
                  <div className="w-14 h-14 rounded-2xl grid place-items-center mb-5" style={{ background: "rgba(15,158,153,.12)", color: "var(--organic-green-deep)" }}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h2 className="font-display text-xl mb-2">{s.title}</h2>
                  <p className="text-muted-foreground text-[0.95rem]">{s.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="max-w-[1180px] mx-auto px-7 pb-24">
        <div className="relative overflow-hidden rounded-[32px] p-10 md:p-14 text-center" style={{ background: "var(--organic-espresso)", color: "var(--organic-sand)" }}>
          <div className="organic-blob w-[380px] h-[380px] -top-32 -right-24 opacity-30" style={{ background: "var(--organic-terracotta)" }} />
          <div className="relative z-[2] max-w-[560px] mx-auto">
            <h2 className="font-display text-[clamp(1.8rem,3vw,2.4rem)] mb-3" style={{ color: "var(--organic-sand)" }}>{c.ctaTitle}</h2>
            <p className="mb-7" style={{ color: "rgba(232,241,226,.74)" }}>{c.ctaSubtitle}</p>
            <Link
              href="/registrati"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(233,69,96,.55)]"
              style={{ background: "var(--organic-terracotta)" }}
            >
              {c.cta} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
