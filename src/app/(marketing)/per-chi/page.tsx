import Link from "next/link";
import type { Metadata } from "next";
import { Home, Dumbbell, Building2, HeartPulse, PersonStanding, ChevronRight, Quote } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.perChi.meta.title,
  description: copy.perChi.meta.description,
};

const SEGMENT_ICONS = [Home, Dumbbell, Building2, HeartPulse, PersonStanding];

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

      <section className="max-w-[1180px] mx-auto px-7 pb-24">
        <Stagger className="grid md:grid-cols-2 gap-6">
          {c.segments.map((s, i) => {
            const Icon = SEGMENT_ICONS[i];
            return (
              <StaggerItem key={s.title}>
                <div className="group bg-card border border-border rounded-[22px] p-8 h-full transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--organic-terracotta-soft)] hover:shadow-[0_24px_50px_-28px_rgba(0,0,0,.4)]">
                  <div className="w-14 h-14 rounded-2xl grid place-items-center mb-5" style={{ background: "rgba(79,209,197,.12)", color: "var(--organic-sage-deep)" }}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h2 className="font-display text-xl mb-3">{s.title}</h2>
                  <div className="flex gap-2.5 mb-4">
                    <Quote className="w-4 h-4 shrink-0 mt-1" style={{ color: "var(--organic-green)" }} />
                    <p className="text-sm italic text-foreground/80">{s.quote}</p>
                  </div>
                  <p className="text-muted-foreground text-[0.95rem] mb-5">{s.desc}</p>
                  <Link
                    href="/onboarding/step1"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
                    style={{ color: "var(--organic-terracotta)" }}
                  >
                    {c.segmentCta} <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>
    </>
  );
}
