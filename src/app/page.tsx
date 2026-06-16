import Link from "next/link";
import { Brain, Camera, ChevronRight, Check, Heart } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { OrganizationJsonLd } from "@/components/marketing/OrganizationJsonLd";
import { OrganicHeroVisual } from "@/components/marketing/OrganicHeroVisual";
import { FadeIn, SlideUp, ScrollReveal, ScrollStagger, StaggerItem, CountUp } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

const PILLAR_ICONS = [Brain, Camera, Heart];
const PILLAR_TONES = [
  { bg: "rgba(63,174,90,.13)", color: "var(--organic-terracotta)" },
  { bg: "rgba(138,154,123,.18)", color: "var(--organic-sage-deep)" },
  { bg: "rgba(51,39,31,.08)", color: "var(--organic-espresso)" },
];

function Eyebrow({ children, center, light }: { children: React.ReactNode; center?: boolean; light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] font-semibold mb-5 ${center ? "justify-center w-full" : ""}`}
      style={{ color: light ? "var(--organic-terracotta-soft)" : "var(--organic-green-deep)" }}
    >
      <span className="organic-dot w-1.5 h-1.5 rounded-full" style={{ background: "var(--organic-green)" }} />
      {children}
    </span>
  );
}

export default function LandingPage() {
  const c = copy.landing;
  return (
    <div className="theme-organic relative min-h-screen overflow-hidden bg-background text-foreground">
      <OrganizationJsonLd />
      <div className="organic-grain" />
      <MarketingHeader />

      {/* Hero */}
      <section className="relative pt-24 pb-28 overflow-hidden">
        <div className="organic-blob w-[560px] h-[560px] -top-32 -right-40" style={{ background: "var(--organic-terracotta-soft)" }} />
        <div className="organic-blob w-[480px] h-[480px] -bottom-52 -left-44 opacity-40" style={{ background: "var(--organic-sage)" }} />
        <div className="relative z-[2] max-w-[1180px] mx-auto px-7 grid lg:grid-cols-[1.08fr_.92fr] gap-14 items-center">
          <div>
            <FadeIn>
              <Eyebrow>{c.eyebrow}</Eyebrow>
            </FadeIn>
            <SlideUp delay={0.05}>
              <h1 className="text-display-lg !text-[clamp(2.9rem,5.6vw,4.5rem)] mb-6">
                {c.heroTitle.pre}
                <em style={{ color: "var(--organic-green)" }}>{c.heroTitle.highlight}</em>
                {c.heroTitle.post}
              </h1>
            </SlideUp>
            <FadeIn delay={0.12}>
              <p className="text-lg text-muted-foreground max-w-[480px] mb-9">{c.heroLead}</p>
            </FadeIn>
            <FadeIn delay={0.18}>
              <div className="flex gap-4 items-center flex-wrap">
                <Link
                  href="/registrati"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(63,174,90,.5)]"
                  style={{ background: "var(--organic-espresso)", color: "var(--organic-cream)" }}
                >
                  {c.ctaPrimary} <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/come-funziona"
                  className="inline-flex items-center px-7 py-3.5 rounded-full font-semibold text-sm border border-border hover:border-foreground transition-colors"
                >
                  {c.ctaSecondary}
                </Link>
              </div>
            </FadeIn>
            <FadeIn delay={0.25}>
              <div className="flex gap-8 mt-11 pt-7 border-t border-border flex-wrap">
                {c.metrics.map((m) => (
                  <div key={m.label}>
                    <strong className="font-display text-3xl block" style={{ color: "var(--organic-espresso)" }}>{m.value}</strong>
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <OrganicHeroVisual />
          </FadeIn>
        </div>
      </section>

      {/* Tre pilastri */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="max-w-[620px] mb-14">
            <Eyebrow>{c.pillarsEyebrow}</Eyebrow>
            <h2 className="text-display-lg !text-[clamp(2.1rem,3.8vw,3.1rem)] mb-4">
              {c.pillarsTitle.pre}
              <em style={{ color: "var(--organic-green)" }}>{c.pillarsTitle.highlight}</em>
              {c.pillarsTitle.post}
            </h2>
            <p className="text-muted-foreground text-lg">{c.pillarsSubtitle}</p>
          </div>
          <ScrollStagger className="grid md:grid-cols-3 gap-6">
            {c.pillars.map((p, i) => {
              const Icon = PILLAR_ICONS[i];
              const tone = PILLAR_TONES[i];
              return (
                <StaggerItem key={p.title}>
                  <div className="group bg-card border border-border rounded-[22px] p-9 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_56px_-28px_rgba(51,39,31,.28)] hover:border-[var(--organic-terracotta-soft)]">
                    <div className="w-14 h-14 rounded-2xl grid place-items-center mb-6" style={{ background: tone.bg, color: tone.color }}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-display text-2xl mb-3">{p.title}</h3>
                    <p className="text-muted-foreground text-[0.95rem] mb-4">{p.desc}</p>
                    <Link href="/funzionalita" className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-3" style={{ color: "var(--organic-terracotta)" }}>
                      {c.pillarMore} <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </StaggerItem>
              );
            })}
          </ScrollStagger>
        </div>
      </section>

      {/* Come funziona — 4 passi */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="max-w-[620px] mb-14">
            <Eyebrow>{c.stepsEyebrow}</Eyebrow>
            <h2 className="text-display-lg !text-[clamp(2.1rem,3.8vw,3.1rem)]">
              {c.stepsTitle.pre}
              <em style={{ color: "var(--organic-green)" }}>{c.stepsTitle.highlight}</em>
              {c.stepsTitle.post}
            </h2>
          </div>
          <ScrollStagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {c.steps.map((s, i) => {
              const dark = i % 2 === 1;
              return (
                <StaggerItem key={s.num}>
                  <div
                    className={`rounded-[22px] p-7 h-full ${dark ? "" : "bg-card border border-border"}`}
                    style={dark ? { background: "var(--organic-forest)", color: "var(--organic-sand)" } : undefined}
                  >
                    <div className="font-display text-4xl leading-none mb-4" style={{ opacity: dark ? 0.8 : 0.32, color: dark ? "var(--organic-terracotta-soft)" : undefined }}>
                      {s.num}
                    </div>
                    <h3 className="font-display text-xl mb-2">{s.title}</h3>
                    <p className="text-sm" style={{ color: dark ? "rgba(232,241,226,.72)" : "var(--muted-foreground)" }}>{s.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </ScrollStagger>
        </div>
      </section>

      {/* Showcase dati */}
      <section className="relative z-[2] pb-24">
        <div className="max-w-[1180px] mx-auto px-7">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[36px] p-10 md:p-16" style={{ background: "var(--organic-forest)", color: "var(--organic-sand)" }}>
              <div className="organic-blob w-[420px] h-[420px] -top-40 -right-32 opacity-[.34]" style={{ background: "var(--organic-terracotta)" }} />
              <div className="relative z-[2] grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Eyebrow light>{c.showcaseEyebrow}</Eyebrow>
                  <h2 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-tight mb-4" style={{ color: "var(--organic-sand)" }}>
                    {c.showcaseTitle.pre}
                    <em style={{ color: "var(--organic-green-soft)" }}>{c.showcaseTitle.highlight}</em>
                    {c.showcaseTitle.post}
                  </h2>
                  <p className="mb-7 text-[1.05rem]" style={{ color: "rgba(232,241,226,.74)" }}>{c.showcaseText}</p>
                  <div className="flex gap-3.5">
                    {c.showcaseStats.map((s) => (
                      <div key={s.label} className="flex-1 rounded-2xl p-4" style={{ background: "rgba(232,241,226,.06)" }}>
                        <b className="font-display text-3xl block" style={{ color: "var(--organic-terracotta-soft)" }}>
                          <CountUp value={s.value} />
                        </b>
                        <span className="text-xs" style={{ color: "rgba(232,241,226,.65)" }}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl p-7" style={{ background: "rgba(232,241,226,.06)", border: "1px solid rgba(232,241,226,.14)" }}>
                  <div className="flex justify-between text-sm mb-3.5" style={{ color: "rgba(232,241,226,.7)" }}>
                    <span>{c.showcaseChartLabel}</span>
                    <span style={{ color: "var(--organic-terracotta-soft)" }}>{c.showcaseChartDelta}</span>
                  </div>
                  <svg className="w-full h-[150px] block" viewBox="0 0 300 150" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="organic-area" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#7fd194" stopOpacity=".55" />
                        <stop offset="1" stopColor="#7fd194" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,110 C40,100 60,70 90,72 C120,74 140,40 175,46 C210,52 235,24 300,18 L300,150 L0,150 Z" fill="url(#organic-area)" />
                    <path d="M0,110 C40,100 60,70 90,72 C120,74 140,40 175,46 C210,52 235,24 300,18" fill="none" stroke="#7fd194" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Prezzi */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center mb-14">
            <Eyebrow center>{c.pricingEyebrow}</Eyebrow>
            <h2 className="text-display-lg !text-[clamp(2.1rem,3.8vw,3.1rem)]">
              {c.pricingTitle.pre}
              <em style={{ color: "var(--organic-green)" }}>{c.pricingTitle.highlight}</em>
              {c.pricingTitle.post}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-[840px] mx-auto">
            <ScrollReveal>
              <div className="bg-card border border-border rounded-[22px] p-10 h-full">
                <div className="text-xs uppercase tracking-[0.18em] font-bold mb-3.5" style={{ color: "var(--organic-sage-deep)" }}>{c.priceFree.name}</div>
                <div className="font-display text-5xl leading-none mb-1.5">
                  {c.priceFree.amount}
                  <small className="text-base text-muted-foreground font-sans">{c.priceFree.period}</small>
                </div>
                <p className="text-muted-foreground text-sm mb-6">{c.priceFree.desc}</p>
                <ul className="mb-7">
                  {c.priceFree.features.map((f) => (
                    <li key={f} className="flex gap-2.5 items-start py-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--organic-sage)" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/registrati" className="flex items-center justify-center w-full px-6 py-3 rounded-full font-semibold text-sm border border-border hover:border-foreground transition-colors">
                  {c.priceFree.cta}
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <div className="relative rounded-[22px] p-10 h-full" style={{ background: "var(--organic-espresso)", color: "var(--organic-sand)" }}>
                <span className="absolute top-6 right-6 text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full font-bold text-white" style={{ background: "var(--organic-terracotta)" }}>
                  {c.pricePro.badge}
                </span>
                <div className="text-xs uppercase tracking-[0.18em] font-bold mb-3.5" style={{ color: "var(--organic-terracotta-soft)" }}>{c.pricePro.name}</div>
                <div className="font-display text-5xl leading-none mb-1.5">
                  {c.pricePro.amount}
                  <small className="text-base font-sans" style={{ color: "rgba(232,241,226,.6)" }}>{c.pricePro.period}</small>
                </div>
                <p className="text-sm mb-6" style={{ color: "rgba(232,241,226,.7)" }}>{c.pricePro.desc}</p>
                <ul className="mb-4">
                  {c.pricePro.features.map((f) => (
                    <li key={f} className="flex gap-2.5 items-start py-2 text-sm">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--organic-terracotta-soft)" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-xs mb-5" style={{ color: "rgba(232,241,226,.55)" }}>{c.pricePro.yearlyNote}</p>
                <Link
                  href="/registrati"
                  className="flex items-center justify-center w-full px-6 py-3 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(63,174,90,.5)]"
                  style={{ background: "var(--organic-terracotta)" }}
                >
                  {c.pricePro.cta}
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
