import Link from "next/link";
import { Footprints, Home, Dumbbell, HeartPulse, PersonStanding, Baby, ChevronRight, Check, Lock, Quote } from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { OrganizationJsonLd } from "@/components/marketing/OrganizationJsonLd";
import { FadeIn, SlideUp, ScrollReveal, ScrollStagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { ExerciseFormPlayer, AnimatedRing, AnimatedArea } from "@/components/wow";
import { copy } from "@/content/copy";

const SEGMENT_ICONS = [Footprints, Home, Dumbbell, HeartPulse, PersonStanding, Baby];

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold mb-4 ${center ? "justify-center w-full" : ""}`}
      style={{ color: "var(--organic-green-deep)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--organic-green)" }} />
      {children}
    </span>
  );
}

function Title({ t, className }: { t: { pre: string; highlight: string; post?: string }; className?: string }) {
  return (
    <h2 className={className ?? "text-display-lg !text-[clamp(2.1rem,3.8vw,3.1rem)]"}>
      {t.pre}
      <em style={{ color: "var(--organic-green)" }}>{t.highlight}</em>
      {t.post}
    </h2>
  );
}

export default function LandingPage() {
  const c = copy.landing;
  return (
    <div className="theme-organic relative min-h-screen overflow-x-clip bg-background text-foreground">
      <OrganizationJsonLd />
      <div className="organic-grain" />
      <MarketingHeader />

      {/* 1 — HERO */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="organic-blob w-[540px] h-[540px] -top-32 -right-40" style={{ background: "var(--organic-terracotta-soft)" }} />
        <div className="relative z-[2] max-w-[1180px] mx-auto px-7 grid lg:grid-cols-[1.05fr_.95fr] gap-14 items-center">
          <div>
            <SlideUp>
              <h1 className="text-display-lg !text-[clamp(2.7rem,5.4vw,4.2rem)] mb-6">
                {c.heroTitle.pre}
                <em style={{ color: "var(--organic-green)" }}>{c.heroTitle.highlight}</em>
                {c.heroTitle.post}
              </h1>
            </SlideUp>
            <FadeIn delay={0.1}>
              <p className="text-lg text-muted-foreground max-w-[500px] mb-8">{c.heroLead}</p>
            </FadeIn>
            <FadeIn delay={0.16}>
              <div className="flex gap-4 items-center flex-wrap">
                <Link href="/onboarding/step1" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(233,69,96,.55)]" style={{ background: "var(--organic-terracotta)" }}>
                  {c.ctaPrimary} <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/come-funziona" className="inline-flex items-center px-7 py-3.5 rounded-full font-semibold text-sm border border-border hover:border-foreground transition-colors">
                  {c.ctaSecondary}
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{c.ctaMicro}</p>
              <p className="inline-flex items-center gap-1.5 text-xs mt-4 px-3 py-2 rounded-full" style={{ background: "rgba(15,158,153,.10)", color: "var(--organic-green-deep)" }}>
                {c.heroBadge}
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="flex flex-wrap gap-2.5 mt-7">
                {c.trustBadges.map((b) => (
                  <span key={b} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-secondary text-muted-foreground">{b}</span>
                ))}
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <div className="bg-card border border-border rounded-[28px] p-8 grid place-items-center shadow-[0_40px_80px_-40px_rgba(22,33,62,.35)]">
              <span className="text-xs uppercase tracking-[0.18em] font-bold mb-6 self-start" style={{ color: "var(--organic-sage-deep)" }}>Tecnica · squat</span>
              <ExerciseFormPlayer archetype="squat" errorNote="ginocchia in avanti" size={230} />
              <p className="text-sm text-muted-foreground mt-6 text-center max-w-[34ch]">L&apos;occhio dell&apos;AI segue il movimento e ti mostra il punto da correggere, rep dopo rep.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2 — PER CHI SEI */}
      <section id="per-chi" className="relative z-[2] py-24 scroll-mt-20" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <Eyebrow center>{c.segmentsEyebrow}</Eyebrow>
            <Title t={c.segmentsTitle} />
            <p className="text-muted-foreground text-lg mt-4">{c.segmentsSubtitle}</p>
          </div>
          <ScrollStagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.segments.map((s, i) => {
              const Icon = SEGMENT_ICONS[i];
              return (
                <StaggerItem key={s.title}>
                  <Link href="/per-chi" className="group block h-full bg-card border border-border rounded-[22px] p-7 transition-all hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-28px_rgba(22,33,62,.24)] hover:border-[var(--organic-green)]">
                    <div className="w-12 h-12 rounded-xl grid place-items-center mb-5" style={{ background: "rgba(15,158,153,.12)", color: "var(--organic-green-deep)" }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-xl mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-[0.95rem] mb-4">{s.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-3" style={{ color: "var(--organic-terracotta)" }}>
                      Scopri <ChevronRight className="w-4 h-4" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </ScrollStagger>
        </div>
      </section>

      {/* 3 — TI RICONOSCI? */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[900px] mx-auto px-7">
          <div className="text-center max-w-[620px] mx-auto mb-12">
            <Eyebrow center>{c.painEyebrow}</Eyebrow>
            <Title t={c.painTitle} />
            <p className="text-muted-foreground text-lg mt-4">{c.painSubtitle}</p>
          </div>
          <ScrollStagger className="grid sm:grid-cols-2 gap-5">
            {c.pains.map((p) => (
              <StaggerItem key={p}>
                <div className="flex gap-4 bg-card border border-border rounded-[20px] p-6 h-full">
                  <Quote className="w-6 h-6 shrink-0" style={{ color: "var(--organic-green)" }} />
                  <p className="text-[1.02rem] italic text-foreground/90">{p}</p>
                </div>
              </StaggerItem>
            ))}
          </ScrollStagger>
        </div>
      </section>

      {/* 4 — COME FUNZIONA */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <Eyebrow center>{c.stepsEyebrow}</Eyebrow>
            <Title t={c.stepsTitle} />
          </div>
          <ScrollStagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.steps.map((s) => (
              <StaggerItem key={s.num}>
                <div className="bg-card border border-border rounded-[22px] p-7 h-full">
                  <span className="font-display text-4xl" style={{ color: "var(--organic-green-soft)" }}>{s.num}</span>
                  <h3 className="font-display text-lg mt-3 mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm">{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </ScrollStagger>
        </div>
      </section>

      {/* 5 — IL TUO FORM SCORE */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[1180px] mx-auto px-7">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[36px] p-10 md:p-16 grid lg:grid-cols-2 gap-12 items-center" style={{ background: "var(--organic-espresso)", color: "var(--organic-sand)" }}>
              <div className="organic-blob w-[420px] h-[420px] -top-40 -right-32 opacity-[.3]" style={{ background: "var(--organic-terracotta)" }} />
              <div className="relative z-[2]">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold mb-4" style={{ color: "var(--organic-terracotta-soft)" }}>{c.formEyebrow}</span>
                <h2 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-tight mb-4" style={{ color: "var(--organic-sand)" }}>
                  {c.formTitle.pre}<em style={{ color: "var(--organic-green-soft)" }}>{c.formTitle.highlight}</em>{c.formTitle.post}
                </h2>
                <p className="text-[1.05rem]" style={{ color: "rgba(234,241,248,.74)" }}>{c.formText}</p>
              </div>
              <div className="relative z-[2] grid grid-cols-[auto_1fr] gap-6 items-center rounded-3xl p-7" style={{ background: "rgba(234,241,248,.06)", border: "1px solid rgba(234,241,248,.14)" }}>
                <AnimatedRing value={84} label="Form Score" />
                <div>
                  <div className="flex justify-between text-sm mb-3" style={{ color: "rgba(234,241,248,.7)" }}>
                    <span>{c.formChartLabel}</span>
                    <span style={{ color: "var(--organic-green-soft)" }}>{c.formChartDelta}</span>
                  </div>
                  <AnimatedArea values={[52, 58, 55, 64, 68, 74, 79, 84]} color="#c6f135" className="w-full h-[120px] block" />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 6 — SICUREZZA & PRIVACY */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[760px] mx-auto px-7 text-center">
          <div className="w-16 h-16 rounded-2xl grid place-items-center mx-auto mb-6" style={{ background: "rgba(15,158,153,.12)", color: "var(--organic-green-deep)" }}>
            <Lock className="w-8 h-8" />
          </div>
          <Eyebrow center>{c.privacyEyebrow}</Eyebrow>
          <Title t={c.privacyTitle} />
          <p className="text-muted-foreground text-lg mt-5">{c.privacyText}</p>
        </div>
      </section>

      {/* 7 — STORIE */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[760px] mx-auto px-7 text-center">
          <Title t={c.storieTitle} />
          <p className="text-muted-foreground text-lg mt-5 mb-7">{c.storieText}</p>
          <Link href="/storie" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--organic-green-deep)" }}>
            {c.storieLink} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 8 — PREZZI */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[1120px] mx-auto px-7">
          <div className="text-center mb-14">
            <Eyebrow center>{c.pricingEyebrow}</Eyebrow>
            <Title t={c.pricingTitle} />
          </div>
          <ScrollStagger className="grid md:grid-cols-3 gap-6 items-stretch">
            {c.plans.map((p) => (
              <StaggerItem key={p.name}>
                <div
                  className={`relative rounded-[22px] p-9 h-full ${p.featured ? "lg:-translate-y-3" : ""}`}
                  style={p.featured
                    ? { background: "var(--organic-espresso)", color: "var(--organic-sand)", boxShadow: "0 34px 80px -36px rgba(22,33,62,.6), 0 0 0 1.5px rgba(233,69,96,.4)" }
                    : { background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  {p.badge && (
                    <span className="absolute top-6 right-6 text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 rounded-full font-bold text-white" style={{ background: "var(--organic-terracotta)" }}>{p.badge}</span>
                  )}
                  <div className="text-xs uppercase tracking-[0.18em] font-bold mb-3.5" style={{ color: p.featured ? "var(--organic-terracotta-soft)" : "var(--organic-sage-deep)" }}>{p.name}</div>
                  <div className="font-display text-5xl leading-none mb-1.5">
                    {p.amount}
                    <small className="text-base font-sans" style={{ color: p.featured ? "rgba(234,241,248,.6)" : "var(--muted-foreground)" }}> {p.period}</small>
                  </div>
                  <p className="text-sm mb-6" style={{ color: p.featured ? "rgba(234,241,248,.7)" : "var(--muted-foreground)" }}>{p.desc}</p>
                  <ul className="mb-7 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2.5 items-start text-sm">
                        <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: p.featured ? "var(--organic-terracotta-soft)" : "var(--organic-green)" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/registrati"
                    className={`flex items-center justify-center w-full px-6 py-3 rounded-full font-semibold text-sm transition-all ${p.featured ? "text-white hover:-translate-y-0.5" : "border border-border hover:border-foreground"}`}
                    style={p.featured ? { background: "var(--organic-terracotta)" } : undefined}
                  >
                    {p.cta}
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </ScrollStagger>
          <p className="text-center text-sm text-muted-foreground mt-8">{c.pricingGuarantee}</p>
        </div>
      </section>

      {/* 9 — CTA FINALE */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[1180px] mx-auto px-7">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[36px] p-12 md:p-16 text-center" style={{ background: "var(--organic-espresso)", color: "var(--organic-sand)" }}>
              <div className="organic-blob w-[420px] h-[420px] -top-40 -left-32 opacity-[.3]" style={{ background: "var(--organic-terracotta)" }} />
              <div className="relative z-[2] max-w-[600px] mx-auto">
                <h2 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-tight mb-4" style={{ color: "var(--organic-sand)" }}>
                  {c.finalTitle.pre}<em style={{ color: "var(--organic-green-soft)" }}>{c.finalTitle.highlight}</em>{c.finalTitle.post}
                </h2>
                <p className="mb-8 text-[1.05rem]" style={{ color: "rgba(234,241,248,.74)" }}>{c.finalSubtitle}</p>
                <Link href="/onboarding/step1" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(233,69,96,.55)]" style={{ background: "var(--organic-terracotta)" }}>
                  {c.finalCta} <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
