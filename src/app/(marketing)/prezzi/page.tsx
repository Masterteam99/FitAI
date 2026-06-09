import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.prezzi.meta.title,
  description: copy.prezzi.meta.description,
};

const FREE = copy.prezzi.free.features;
const PREMIUM = copy.prezzi.premium.features;

export default function PrezziPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">{copy.prezzi.heroTitle.pre}<span className="text-gradient-energy">{copy.prezzi.heroTitle.highlight}</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {copy.prezzi.heroSubtitle}
          </p>
        </FadeIn>
      </section>

      <section className="max-w-4xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-6">
        <Card className="bg-card/60 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{copy.prezzi.free.name}</h2>
              <p className="text-sm text-muted-foreground">{copy.prezzi.free.tagline}</p>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold">{copy.prezzi.free.price}</span>
              <span className="text-muted-foreground mb-1">{copy.prezzi.free.period}</span>
            </div>
            <ul className="space-y-3 text-sm">
              {FREE.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/registrati" className="block">
              <Button variant="outline" className="w-full">{copy.prezzi.free.cta}</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-primary/40 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full glow-primary">
            {copy.prezzi.premium.badge}
          </div>
          <CardContent className="p-8 space-y-6">
            <div>
              <h2 className="text-lg font-semibold">{copy.prezzi.premium.name}</h2>
              <p className="text-sm text-muted-foreground">{copy.prezzi.premium.tagline}</p>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-bold">{copy.prezzi.premium.price}</span>
              <span className="text-muted-foreground mb-1">{copy.prezzi.premium.period}</span>
            </div>
            <p className="text-xs text-muted-foreground -mt-4">{copy.prezzi.premium.yearlyNote}</p>
            <ul className="space-y-3 text-sm">
              {PREMIUM.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/registrati" className="block">
              <Button className="w-full gap-2 glow-energy">{copy.prezzi.premium.cta} <ChevronRight className="w-4 h-4" /></Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          {copy.prezzi.footnote}
        </p>
      </section>
    </>
  );
}
