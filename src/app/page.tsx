import Link from "next/link";
import { Brain, Camera, ChevronRight, Check, Heart, ShieldAlert, TrendingDown, Wallet } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { OrganizationJsonLd } from "@/components/marketing/OrganizationJsonLd";
import { OrganicHeroVisual } from "@/components/marketing/OrganicHeroVisual";
import { FadeIn, SlideUp, ScrollReveal, ScrollStagger, StaggerItem, CountUp } from "@/components/motion/MotionPrimitives";
import { AnimatedArea, AnimatedRing, ExerciseFormPlayer, AdaptiveBodyMap, ScrollExplainer } from "@/components/wow";
import { copy } from "@/content/copy";

const PILLAR_ICONS = [Camera, Brain, Heart];
const PROBLEM_ICONS = [ShieldAlert, TrendingDown, Wallet];
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
    <div className="theme-organic relative min-h-screen overflow-x-clip bg-background text-foreground">
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
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(233,69,96,.55)]"
                  style={{ background: "var(--organic-terracotta)" }}
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
              <p className="text-xs text-muted-foreground mt-3">{c.ctaMicro}</p>
              <p className="inline-flex items-center gap-1.5 text-xs mt-4 px-3 py-2 rounded-full" style={{ background: "rgba(15,158,153,.10)", color: "var(--organic-green-deep)" }}>
                {c.privacyBadge}
              </p>
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

      {/* Blocco 3 — Il problema (empatia) */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="max-w-[700px] mb-12">
            <Eyebrow>{c.problemEyebrow}</Eyebrow>
            <h2 className="text-display-lg !text-[clamp(2.1rem,3.8vw,3.1rem)]">
              {c.problemTitle.pre}<em style={{ color: "var(--organic-green)" }}>{c.problemTitle.highlight}</em>{c.problemTitle.post}
            </h2>
          </div>
          <ScrollStagger className="grid md:grid-cols-3 gap-6">
            {c.problems.map((p, i) => {
              const Icon = PROBLEM_ICONS[i];
              return (
                <StaggerItem key={p.title}>
                  <div className="bg-card border border-border rounded-[22px] p-8 h-full">
                    <div className="w-12 h-12 rounded-xl grid place-items-center mb-5" style={{ background: "rgba(233,69,96,.10)", color: "var(--organic-terracotta)" }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl mb-2">{p.title}</h3>
                    <p className="text-muted-foreground text-[0.95rem]">{p.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </ScrollStagger>
          <p className="font-display text-2xl mt-12 text-center" style={{ color: "var(--organic-espresso)" }}>{c.problemClose}</p>
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
                  <div className={`group bg-card border border-border rounded-[22px] p-9 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_28px_56px_-28px_rgba(51,39,31,.28)] hover:border-[var(--organic-terracotta-soft)] ${i === 1 ? "lg:mt-12" : i === 2 ? "lg:mt-6" : ""}`}>
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
          <ScrollExplainer
            steps={c.steps.map((s) => ({ title: s.title, desc: s.desc }))}
            stepVh={62}
            visuals={[
              <div key="v0" className="bg-card border border-border rounded-[28px] p-8 grid place-items-center">
                <ExerciseFormPlayer archetype="squat" errorNote="ginocchia in avanti" size={200} />
              </div>,
              <div key="v1" className="bg-card border border-border rounded-[28px] p-8 w-[280px] mx-auto">
                <AdaptiveBodyMap mode="balance" showToggle={false} data={[{ muscle: "QUADRICEPS", deficitPct: 66 }, { muscle: "CALVES", deficitPct: 58 }]} />
              </div>,
              <div key="v2" className="bg-card border border-border rounded-[28px] p-10 grid place-items-center">
                <AnimatedRing value={84} label="form score" />
              </div>,
              <div key="v3" className="bg-card border border-border rounded-[28px] p-8 w-[360px]">
                <AnimatedArea values={[20, 26, 24, 33, 31, 42, 49, 58]} color="#3fae5a" className="w-full h-[150px] block" />
              </div>,
            ]}
          />
        </div>
      </section>

      {/* Analisi biomeccanica — esecuzione + heatmap */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="max-w-[640px] mb-14">
            <Eyebrow>Analisi biomeccanica</Eyebrow>
            <h2 className="text-display-lg !text-[clamp(2.1rem,3.8vw,3.1rem)] mb-4">
              Vedi <em style={{ color: "var(--organic-green)" }}>dove sbagli</em>, muscolo per muscolo
            </h2>
            <p className="text-muted-foreground text-lg">
              L&apos;AI ricostruisce ogni ripetizione e accende i gruppi muscolari che alleni troppo poco. Niente sensori: basta un video.
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <ScrollReveal>
              <div className="bg-card border border-border rounded-[28px] p-8 h-full flex flex-col items-center">
                <span className="text-xs uppercase tracking-[0.18em] font-bold mb-6 self-start" style={{ color: "var(--organic-sage-deep)" }}>
                  Tecnica · squat
                </span>
                <ExerciseFormPlayer archetype="squat" errorNote="ginocchia in avanti" size={200} />
                <p className="text-sm text-muted-foreground mt-6 text-center max-w-[34ch]">
                  La figura ripete il movimento e segnala il punto critico fotogramma per fotogramma.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.08}>
              <div className="bg-card border border-border rounded-[28px] p-8 h-full">
                <span className="text-xs uppercase tracking-[0.18em] font-bold mb-6 block" style={{ color: "var(--organic-sage-deep)" }}>
                  Equilibrio muscolare
                </span>
                <div className="max-w-[280px] mx-auto">
                  <AdaptiveBodyMap
                    mode="balance"
                    showToggle={false}
                    data={[
                      { muscle: "QUADRICEPS", deficitPct: 68 },
                      { muscle: "CALVES", deficitPct: 61 },
                      { muscle: "SHOULDERS", deficitPct: 55 },
                    ]}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-4 text-center max-w-[40ch] mx-auto">
                  In rosso i muscoli sotto-allenati: il piano successivo li riequilibra in automatico.
                </p>
              </div>
            </ScrollReveal>
          </div>
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
                  <AnimatedArea
                    values={[18, 24, 22, 31, 29, 38, 44, 52]}
                    color="#7fd194"
                    className="w-full h-[150px] block"
                  />
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
              <div className="relative rounded-[22px] p-10 h-full lg:-translate-y-3 transition-transform" style={{ background: "var(--organic-espresso)", color: "var(--organic-sand)", boxShadow: "0 34px 80px -36px rgba(24,36,26,.6), 0 0 0 1.5px rgba(63,174,90,.45)" }}>
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

      {/* Blocco 8 — CTA finale + FAQ rapida */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="relative overflow-hidden rounded-[36px] p-10 md:p-16 text-center" style={{ background: "var(--organic-espresso)", color: "var(--organic-sand)" }}>
            <div className="organic-blob w-[420px] h-[420px] -top-40 -right-32 opacity-[.30]" style={{ background: "var(--organic-terracotta)" }} />
            <div className="relative z-[2] max-w-[640px] mx-auto">
              <h2 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-tight mb-4" style={{ color: "var(--organic-sand)" }}>
                {c.finalTitle.pre}<em style={{ color: "var(--organic-green-soft)" }}>{c.finalTitle.highlight}</em>{c.finalTitle.post}
              </h2>
              <p className="mb-8 text-[1.05rem]" style={{ color: "rgba(232,241,226,.74)" }}>{c.finalSubtitle}</p>
              <Link
                href="/registrati"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(233,69,96,.55)]"
                style={{ background: "var(--organic-terracotta)" }}
              >
                {c.finalCta} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {c.faqQuick.map((f) => (
              <div key={f.q} className="bg-card border border-border rounded-[20px] p-6 h-full">
                <h3 className="font-semibold mb-2 text-[0.98rem]">{f.q}</h3>
                <p className="text-muted-foreground text-sm">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--organic-green-deep)" }}>
              Vedi tutte le domande <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
