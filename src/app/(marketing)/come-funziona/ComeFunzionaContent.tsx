"use client";

import Link from "next/link";
import {
  ChevronRight,
  Move,
  Eye,
  Users,
  Gauge,
  AlertTriangle,
  ListOrdered,
  XCircle,
  ShieldCheck,
  EyeOff,
  Lock,
  UserCheck,
} from "lucide-react";
import { FadeIn, SlideUp, ScrollStagger, StaggerItem } from "@/components/motion/MotionPrimitives";
import { useCopy } from "@/content/CopyProvider";
import { EditableText } from "@/content/SiteEditMode";

const LEVEL_ICONS = [Move, Eye, Users];
const READ_ICONS = [Gauge, AlertTriangle, ListOrdered];
const PRIVACY_ICONS = [EyeOff, ShieldCheck, Lock, UserCheck];

function Eyebrow({ text, path }: { text: string; path: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-bold mb-4 justify-center w-full"
      style={{ color: "var(--organic-green-deep)" }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--organic-green)" }} />
      <EditableText path={path}>{text}</EditableText>
    </span>
  );
}

function SectionTitle({ t, tPath }: { t: { pre: string; highlight: string; post?: string }; tPath: string }) {
  return (
    <h2 className="text-display-lg !text-[clamp(1.9rem,3.4vw,2.7rem)]">
      <EditableText path={`${tPath}.pre`}>{t.pre}</EditableText>
      <em style={{ color: "var(--organic-green)" }}><EditableText path={`${tPath}.highlight`}>{t.highlight}</EditableText></em>
      <EditableText path={`${tPath}.post`}>{t.post ?? ""}</EditableText>
    </h2>
  );
}

export function ComeFunzionaContent() {
  const copy = useCopy();
  const c = copy.comeFunziona;
  return (
    <>
      {/* Intestazione */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-14 text-center space-y-5">
        <Eyebrow text={c.eyebrow} path="comeFunziona.eyebrow" />
        <SlideUp>
          <h1 className="text-display-lg">
            <EditableText path="comeFunziona.heroTitle.pre">{c.heroTitle.pre}</EditableText>
            <em style={{ color: "var(--organic-green)" }}><EditableText path="comeFunziona.heroTitle.highlight">{c.heroTitle.highlight}</EditableText></em>
            <EditableText path="comeFunziona.heroTitle.post">{c.heroTitle.post ?? ""}</EditableText>
          </h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-lg text-muted-foreground"><EditableText path="comeFunziona.heroSubtitle">{c.heroSubtitle}</EditableText></p>
        </FadeIn>
      </section>

      {/* A — Perché registriamo invece di correggerti mentre ti muovi */}
      <section className="py-20" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[900px] mx-auto px-7 text-center">
          <SectionTitle t={c.sectionA.title} tPath="comeFunziona.sectionA.title" />
          <div className="mt-5 space-y-4 text-left max-w-[720px] mx-auto">
            {c.sectionA.paragraphs.map((p) => (
              <p key={p} className="text-muted-foreground text-lg">{p}</p>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-5 mt-10 text-left">
            {c.sectionA.compare.map((item) => (
              <div key={item.title} className="bg-card border border-border rounded-[18px] p-6">
                <h3 className="font-display text-base mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B — I tre livelli di analisi */}
      <section className="py-20">
        <div className="max-w-[1100px] mx-auto px-7">
          <div className="text-center mb-12">
            <SectionTitle t={c.sectionB.title} tPath="comeFunziona.sectionB.title" />
          </div>
          <ScrollStagger className="grid sm:grid-cols-3 gap-5">
            {c.sectionB.levels.map((l, i) => {
              const Icon = LEVEL_ICONS[i];
              return (
                <StaggerItem key={l.title}>
                  <div className="h-full bg-card border border-border rounded-[20px] p-7">
                    <div className="w-11 h-11 rounded-xl grid place-items-center mb-4" style={{ background: "rgba(200,247,81,.12)", color: "var(--organic-green)" }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-lg mb-2">{l.title}</h3>
                    <p className="text-muted-foreground text-sm">{l.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </ScrollStagger>
          <p className="text-center text-muted-foreground mt-8 max-w-[560px] mx-auto"><EditableText path="comeFunziona.sectionB.note">{c.sectionB.note}</EditableText></p>
        </div>
      </section>

      {/* C — Come si legge l'analisi */}
      <section className="py-20" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[1100px] mx-auto px-7">
          <div className="text-center mb-12">
            <SectionTitle t={c.sectionC.title} tPath="comeFunziona.sectionC.title" />
          </div>
          <ScrollStagger className="grid sm:grid-cols-3 gap-5">
            {c.sectionC.items.map((it, i) => {
              const Icon = READ_ICONS[i];
              return (
                <StaggerItem key={it.title}>
                  <div className="h-full bg-card border border-border rounded-[20px] p-7">
                    <div className="w-11 h-11 rounded-xl grid place-items-center mb-4" style={{ background: "rgba(79,209,197,.12)", color: "var(--organic-sage-deep)" }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-lg mb-2">{it.title}</h3>
                    <p className="text-muted-foreground text-sm">{it.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </ScrollStagger>
        </div>
      </section>

      {/* D — L'analisi è il punto di partenza */}
      <section className="py-20">
        <div className="max-w-[720px] mx-auto px-7 text-center">
          <SectionTitle t={c.sectionD.title} tPath="comeFunziona.sectionD.title" />
          <p className="text-muted-foreground text-lg mt-5"><EditableText path="comeFunziona.sectionD.text">{c.sectionD.text}</EditableText></p>
        </div>
      </section>

      {/* E — Cosa Motion Insight non è */}
      <section className="py-20" style={{ background: "var(--organic-sand)" }}>
        <div className="max-w-[900px] mx-auto px-7 text-center">
          <SectionTitle t={c.sectionE.title} tPath="comeFunziona.sectionE.title" />
          <p className="text-muted-foreground text-lg mt-4 mb-10"><EditableText path="comeFunziona.sectionE.intro">{c.sectionE.intro}</EditableText></p>
          <div className="grid sm:grid-cols-3 gap-5 text-left">
            {c.sectionE.items.map((it) => (
              <div key={it.title} className="bg-card border border-border rounded-[18px] p-6">
                <XCircle className="w-5 h-5 mb-3" style={{ color: "#ffb547" }} />
                <h3 className="font-display text-base mb-2">{it.title}</h3>
                <p className="text-sm text-muted-foreground">{it.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* F — Privacy */}
      <section className="py-20">
        <div className="max-w-[1100px] mx-auto px-7">
          <div className="text-center mb-10">
            <Eyebrow text={c.sectionF.eyebrow} path="comeFunziona.sectionF.eyebrow" />
            <SectionTitle t={c.sectionF.title} tPath="comeFunziona.sectionF.title" />
            <p className="text-muted-foreground text-lg mt-4 max-w-[640px] mx-auto"><EditableText path="comeFunziona.sectionF.intro">{c.sectionF.intro}</EditableText></p>
          </div>
          <ScrollStagger className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {c.sectionF.items.map((it, i) => {
              const Icon = PRIVACY_ICONS[i];
              return (
                <StaggerItem key={it.title}>
                  <div className="h-full bg-card border border-border rounded-[18px] p-6">
                    <div className="w-10 h-10 rounded-lg grid place-items-center mb-4" style={{ background: "rgba(200,247,81,.12)", color: "var(--organic-green)" }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-display text-base mb-2">{it.title}</h3>
                    <p className="text-sm text-muted-foreground">{it.desc}</p>
                  </div>
                </StaggerItem>
              );
            })}
          </ScrollStagger>
          <p className="text-xs text-muted-foreground mt-6 max-w-[70ch] mx-auto text-center italic"><EditableText path="comeFunziona.sectionF.dataDisclaimer">{c.sectionF.dataDisclaimer}</EditableText></p>
        </div>
      </section>

      {/* G — Chiusura */}
      <section className="py-24">
        <div className="max-w-[1180px] mx-auto px-7">
          <div className="relative overflow-hidden rounded-[36px] p-12 md:p-16 text-center" style={{ background: "var(--organic-espresso)", color: "var(--foreground)" }}>
            <div className="relative z-[2] max-w-[600px] mx-auto">
              <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.6rem)] leading-tight mb-8" style={{ color: "var(--foreground)" }}>
                <EditableText path="comeFunziona.sectionG.title.pre">{c.sectionG.title.pre}</EditableText><em style={{ color: "var(--organic-green-soft)" }}><EditableText path="comeFunziona.sectionG.title.highlight">{c.sectionG.title.highlight}</EditableText></em><EditableText path="comeFunziona.sectionG.title.post">{c.sectionG.title.post ?? ""}</EditableText>
              </h2>
              <Link href="/prova-gratuita" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm transition-all hover:-translate-y-0.5" style={{ background: "var(--organic-terracotta)", color: "var(--primary-foreground)" }}>
                <EditableText path="comeFunziona.sectionG.cta">{c.sectionG.cta}</EditableText> <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
