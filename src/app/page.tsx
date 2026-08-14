import Link from "next/link";
import {
  Home,
  Dumbbell,
  HeartPulse,
  PersonStanding,
  ChevronRight,
  Check,
  Lock,
  Quote,
  Utensils,
  TrendingUp,
  Calculator,
  Users,
  ChefHat,
  ShieldCheck,
  Award,
  AlertTriangle,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { OrganizationJsonLd } from "@/components/marketing/OrganizationJsonLd";
import { FadeIn, SlideUp, ScrollReveal, ScrollStagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { ExerciseFormPlayer } from "@/components/wow";
import { copy } from "@/content/copy";

const SEGMENT_ICONS = [Home, Dumbbell, HeartPulse, PersonStanding];
const EXTRA_ICONS = [Dumbbell, Utensils, TrendingUp, Calculator, Users, ChefHat];
const TRUST_ICONS = [ShieldCheck, Award, Lock];

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
              <Eyebrow>{c.heroEyebrow}</Eyebrow>
              <h1 className="text-display-lg !text-[clamp(2.7rem,5.4vw,4.2rem)] mb-6">
                {c.heroTitle.pre}
                <em style={{ color: "var(--organic-green)" }}>{c.heroTitle.highlight}</em>
                {c.heroTitle.post}
              </h1>
            </SlideUp>
            <FadeIn delay={0.1}>
              <p className="text-lg text-muted-foreground max-w-[520px] mb-8">{c.heroLead}</p>
            </FadeIn>
            <FadeIn delay={0.16}>
              <div className="flex gap-4 items-center flex-wrap">
                <Link href="/onboarding/step1" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(200,247,81,.4)]" style={{ background: "var(--organic-terracotta)", color: "var(--primary-foreground)" }}>
                  {c.ctaPrimary} <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/come-funziona" className="inline-flex items-center px-7 py-3.5 rounded-full font-semibold text-sm border border-border hover:border-foreground transition-colors">
                  {c.ctaSecondary}
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-3 max-w-[46ch]">{c.ctaMicro}</p>
            </FadeIn>
          </div>
          <FadeIn delay={0.2}>
            <div className="bg-card border border-border rounded-[28px] p-8 grid place-items-center shadow-[0_40px_80px_-40px_rgba(0,0,0,.5)]">
              <span className="text-xs uppercase tracking-[0.18em] font-bold mb-6 self-start" style={{ color: "var(--organic-sage-deep)" }}>Tecnica · squat</span>
              <ExerciseFormPlayer archetype="squat" errorNote="ginocchia in avanti" size={230} />
              <p className="text-sm text-muted-foreground mt-6 text-center max-w-[34ch]">L&apos;occhio dell&apos;AI segue il movimento e ti mostra il punto da correggere, rep dopo rep.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 2 — IL PROBLEMA */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[820px] mx-auto px-7 text-center">
          <Title t={c.problemTitle} />
          <p className="text-muted-foreground text-lg mt-5 mb-9">{c.problemText}</p>
          <div className="grid sm:grid-cols-3 gap-4 text-left">
            {c.problemPoints.map((p) => (
              <div key={p} className="flex gap-3 bg-card border border-border rounded-[16px] p-5">
                <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: "var(--organic-terracotta)" }} />
                <p className="text-sm text-foreground/90">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — IN TRE PASSI */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <Eyebrow center>{c.stepsEyebrow}</Eyebrow>
            <Title t={c.stepsTitle} />
          </div>
          <ScrollStagger className="grid sm:grid-cols-3 gap-5">
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
          <div className="text-center mt-8">
            <Link href="/come-funziona" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--organic-green-deep)" }}>
              {c.stepsLink}
            </Link>
          </div>
        </div>
      </section>

      {/* 4 — COSA RICEVI (report campione) */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[1180px] mx-auto px-7 grid lg:grid-cols-2 gap-14 items-center">
          <ScrollReveal>
            <Eyebrow>{c.reportEyebrow}</Eyebrow>
            <Title t={c.reportTitle} />
            <p className="text-muted-foreground text-lg mt-4 mb-6">{c.reportText}</p>
            <ul className="space-y-2.5">
              {c.reportBullets.map((b) => (
                <li key={b} className="flex gap-2.5 items-start text-sm">
                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--organic-green)" }} />
                  {b}
                </li>
              ))}
            </ul>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="rounded-[28px] p-7 md:p-8" style={{ background: "var(--organic-espresso)", color: "var(--organic-sand)" }}>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <span className="font-display text-6xl leading-none" style={{ color: "var(--organic-green-soft)" }}>{c.reportCard.score}</span>
                  <span className="text-sm ml-2" style={{ color: "rgba(234,241,248,.6)" }}>su 100</span>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "rgba(255,181,71,.16)", color: "#ffb547" }}>{c.reportCard.risk}</span>
              </div>
              <p className="text-sm mb-6" style={{ color: "rgba(234,241,248,.78)" }}>{c.reportCard.verdict}</p>
              <div className="text-xs uppercase tracking-[0.14em] font-bold mb-3" style={{ color: "rgba(234,241,248,.5)" }}>{c.reportCard.fixesTitle}</div>
              <ol className="space-y-3">
                {c.reportCard.fixes.map((f, i) => (
                  <li key={f} className="flex gap-3 text-sm" style={{ color: "rgba(234,241,248,.85)" }}>
                    <span className="shrink-0 w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold" style={{ background: "rgba(234,241,248,.1)" }}>{i + 1}</span>
                    {f}
                  </li>
                ))}
              </ol>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5 — DA DOVE VUOI PARTIRE */}
      <section id="per-chi" className="relative z-[2] py-24 scroll-mt-20">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <Eyebrow center>{c.segmentsEyebrow}</Eyebrow>
            <Title t={c.segmentsTitle} />
            <p className="text-muted-foreground text-lg mt-4">{c.segmentsSubtitle}</p>
          </div>
          <ScrollStagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.segments.map((s, i) => {
              const Icon = SEGMENT_ICONS[i];
              return (
                <StaggerItem key={s.title}>
                  <Link href="/per-chi" className="group block h-full bg-card border border-border rounded-[22px] p-7 transition-all hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-28px_rgba(0,0,0,.5)] hover:border-[var(--organic-green)]">
                    <div className="w-12 h-12 rounded-xl grid place-items-center mb-5" style={{ background: "rgba(79,209,197,.12)", color: "var(--organic-sage-deep)" }}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-display text-lg mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-[0.9rem]">{s.desc}</p>
                  </Link>
                </StaggerItem>
              );
            })}
          </ScrollStagger>
        </div>
      </section>

      {/* 6 — IL CONFRONTO */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[900px] mx-auto px-7">
          <div className="text-center max-w-[680px] mx-auto mb-12">
            <Eyebrow center>{c.compareEyebrow}</Eyebrow>
            <Title t={c.compareTitle} />
            <p className="text-muted-foreground text-lg mt-4">{c.compareText}</p>
          </div>
          <div className="bg-card border border-border rounded-[22px] p-7 md:p-9">
            <div className="flex items-center gap-6 mb-7 text-xs font-semibold">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: "var(--organic-green)" }} />{c.compareLabels.you}</span>
              <span className="flex items-center gap-2 text-muted-foreground"><span className="w-3 h-0.5" style={{ background: "var(--organic-sage-deep)" }} />{c.compareLabels.pro}</span>
            </div>
            <div className="space-y-5">
              {c.comparePhases.map((p) => (
                <div key={p.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium">{p.label}</span>
                    <span className="text-muted-foreground">{p.value}</span>
                  </div>
                  <div className="relative h-2.5 rounded-full bg-secondary overflow-hidden">
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${p.value}%`, background: "var(--organic-green)" }} />
                    <div className="absolute inset-y-0" style={{ left: "100%", width: "2px", background: "var(--organic-sage-deep)", transform: "translateX(-2px)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7 — NON SOLO ANALISI */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <Eyebrow center>{c.extrasEyebrow}</Eyebrow>
            <Title t={c.extrasTitle} />
          </div>
          <ScrollStagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.extras.map((e, i) => {
              const Icon = EXTRA_ICONS[i];
              return (
                <StaggerItem key={e.title}>
                  <div className="h-full bg-card border border-border rounded-[20px] p-6">
                    <div className="w-10 h-10 rounded-lg grid place-items-center mb-4" style={{ background: "rgba(200,247,81,.12)", color: "var(--organic-green)" }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-base mb-1.5">{e.title}</h3>
                    <p className="text-muted-foreground text-sm">{e.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </ScrollStagger>
        </div>
      </section>

      {/* 8 — FIDUCIA */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="text-center max-w-[640px] mx-auto mb-14">
            <Title t={c.trustTitle} />
          </div>
          <ScrollStagger className="grid sm:grid-cols-3 gap-6">
            {c.trust.map((t, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <StaggerItem key={t.title}>
                  <div className="text-center h-full">
                    <div className="w-14 h-14 rounded-2xl grid place-items-center mx-auto mb-5" style={{ background: "rgba(79,209,197,.12)", color: "var(--organic-sage-deep)" }}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-display text-lg mb-2">{t.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{t.desc}</p>
                    {"link" in t && t.link && (
                      <Link href={t.href!} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--organic-green-deep)" }}>
                        {t.link}
                      </Link>
                    )}
                  </div>
                </StaggerItem>
              );
            })}
          </ScrollStagger>
        </div>
      </section>

      {/* 9 — VOCE DEL COFONDATORE (placeholder) */}
      <section className="relative z-[2] py-20">
        <div className="max-w-[700px] mx-auto px-7 text-center">
          <Quote className="w-8 h-8 mx-auto mb-5" style={{ color: "var(--organic-green)" }} />
          <p className="text-xl italic text-foreground/90 mb-4">«{c.founderQuote}»</p>
          <p className="text-sm text-muted-foreground">{c.founderName}</p>
        </div>
      </section>

      {/* 10 — PREZZI (compatto) */}
      <section className="relative z-[2] py-24" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[820px] mx-auto px-7 text-center">
          <Eyebrow center>{c.pricingEyebrow}</Eyebrow>
          <Title t={c.pricingTitle} />
          <div className="grid sm:grid-cols-3 gap-5 mt-10">
            {c.pricingMini.map((p) => (
              <div key={p.name} className="relative bg-card border border-border rounded-[20px] p-6">
                {p.badge && (
                  <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 rounded-full font-bold" style={{ background: "var(--organic-terracotta)", color: "var(--primary-foreground)" }}>{p.badge}</span>
                )}
                <div className="text-xs uppercase tracking-[0.18em] font-bold mb-2" style={{ color: "var(--organic-sage-deep)" }}>{p.name}</div>
                <div className="font-display text-2xl">{p.price}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-8">{c.pricingGuarantee}</p>
          <Link href="/prezzi" className="inline-flex items-center gap-1.5 text-sm font-semibold mt-4" style={{ color: "var(--organic-green-deep)" }}>
            {c.pricingLink} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 11 — TABELLA COMPETITOR */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[1120px] mx-auto px-7">
          <div className="text-center max-w-[640px] mx-auto mb-10">
            <Title t={{ pre: "", highlight: "", post: c.compTableTitle }} />
          </div>
          <div className="overflow-x-auto rounded-[20px] border border-border">
            <table className="w-full text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-border">
                  {c.compTableCols.map((col, i) => (
                    <th key={col} className={`text-left p-4 font-semibold ${i === c.compTableCols.length - 1 ? "" : "text-muted-foreground"}`} style={i === c.compTableCols.length - 1 ? { color: "var(--organic-green)" } : undefined}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.compTableRows.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <td className="p-4 font-medium">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={`p-4 ${i === row.values.length - 1 ? "font-semibold" : "text-muted-foreground"}`} style={i === row.values.length - 1 ? { color: "var(--organic-green)" } : undefined}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4 max-w-[70ch]">{c.compTableCaption}</p>
          <p className="text-sm text-muted-foreground mt-5 max-w-[80ch]">{c.compTableNote}</p>
          <div className="text-center mt-8">
            <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "var(--organic-green-deep)" }}>
              {c.faqLink} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 12 — CTA FINALE */}
      <section className="relative z-[2] py-24">
        <div className="max-w-[1180px] mx-auto px-7">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-[36px] p-12 md:p-16 text-center" style={{ background: "var(--organic-espresso)", color: "var(--organic-sand)" }}>
              <div className="organic-blob w-[420px] h-[420px] -top-40 -left-32 opacity-[.3]" style={{ background: "var(--organic-terracotta)" }} />
              <div className="relative z-[2] max-w-[600px] mx-auto">
                <h2 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-tight mb-8" style={{ color: "var(--organic-sand)" }}>
                  {c.finalTitle.pre}<em style={{ color: "var(--organic-green-soft)" }}>{c.finalTitle.highlight}</em>{c.finalTitle.post}
                </h2>
                <Link href="/onboarding/step1" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(200,247,81,.4)]" style={{ background: "var(--organic-terracotta)", color: "var(--primary-foreground)" }}>
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
