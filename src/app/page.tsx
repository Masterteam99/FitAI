import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Brain, Camera, Trophy, Target, ChevronRight, BarChart } from "lucide-react";
import { GradientMesh } from "@/components/visualizations/GradientMesh";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { FadeIn, SlideUp, Stagger, StaggerItem, CardHover } from "@/components/motion/MotionPrimitives";
import { copy } from "@/content/copy";

const FEATURE_STYLES = [
  { icon: Brain, color: "text-primary" },
  { icon: Camera, color: "text-blue-400" },
  { icon: Target, color: "text-purple-400" },
  { icon: BarChart, color: "text-orange-400" },
  { icon: Trophy, color: "text-yellow-400" },
  { icon: Zap, color: "text-green-400" },
];
const FEATURES = copy.landing.features.map((f, i) => ({ ...f, ...FEATURE_STYLES[i] }));

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <GradientMesh palette="rainbow" intensity="medium" fixed />

      <MarketingHeader />

      {/* Hero */}
      <section className="relative max-w-7xl mx-auto px-4 py-24 text-center space-y-8">
        <FadeIn>
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium">
            <Brain className="w-4 h-4" />
            {copy.landing.badge}
          </div>
        </FadeIn>
        <SlideUp delay={0.05}>
          <h1 className="text-display-lg">
            {copy.landing.heroTitle.pre}<span className="text-gradient-energy">{copy.landing.heroTitle.highlight}</span><br />{copy.landing.heroTitle.post}
          </h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {copy.landing.heroSubtitle}
          </p>
        </FadeIn>
        <FadeIn delay={0.25}>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/registrati">
              <Button size="lg" className="gap-2 px-8 glow-energy">{copy.landing.ctaPrimary} <ChevronRight className="w-5 h-5" /></Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">{copy.landing.ctaSecondary}</Button>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Feature cards */}
      <section className="relative max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-display-md text-center mb-12">{copy.landing.featuresTitle}</h2>
        <Stagger className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <StaggerItem key={f.title}>
                <CardHover>
                  <Card className="h-full bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-colors">
                    <CardContent className="p-6 space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${f.color}`} />
                      </div>
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </CardContent>
                  </Card>
                </CardHover>
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      {/* CTA */}
      <section className="relative max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md">{copy.landing.finalCtaTitle}</h2>
        <p className="text-muted-foreground">{copy.landing.finalCtaSubtitle}</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">{copy.landing.finalCtaButton} <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>

      <MarketingFooter />
    </div>
  );
}
