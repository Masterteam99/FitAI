import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Brain, Camera, Trophy, Target, ChevronRight, BarChart } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">FitAI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login"><Button variant="ghost">Accedi</Button></Link>
          <Link href="/registrati"><Button>Inizia gratis <ChevronRight className="w-4 h-4" /></Button></Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium">
          <Brain className="w-4 h-4" />
          Powered by Claude AI + MediaPipe
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Il tuo <span className="text-primary">Personal Trainer AI</span><br />sempre con te
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Allenati con piani personalizzati dall&apos;AI, analizza la tua tecnica con la computer vision
          e ricevi feedback da un coach digitale disponibile 24/7.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/registrati">
            <Button size="lg" className="gap-2 px-8">Inizia gratis <ChevronRight className="w-5 h-5" /></Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">Hai già un account</Button>
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Tutto ciò di cui hai bisogno per allenarti meglio</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Brain, title: "Piani AI Personalizzati", desc: "Claude crea piani su misura basandosi sui tuoi obiettivi, livello e attrezzatura disponibile.", color: "text-primary" },
            { icon: Camera, title: "Analisi Video Real-Time", desc: "Computer vision Google MediaPipe rileva i tuoi movimenti in tempo reale. Feedback istantaneo su postura e tecnica.", color: "text-blue-400" },
            { icon: Target, title: "Analisi Triplice 33/33/34", desc: "Biomeccanica + AI Expert + Confronto Video: feedback completo come quello di un PT privato.", color: "text-purple-400" },
            { icon: BarChart, title: "Progressi Dettagliati", desc: "Traccia sessioni, misurazioni e miglioramenti nel tempo con grafici interattivi.", color: "text-orange-400" },
            { icon: Trophy, title: "Gamification", desc: "Achievements, streak, punti e sfide per mantenerti motivato ogni giorno.", color: "text-yellow-400" },
            { icon: Zap, title: "AI Coach 24/7", desc: "Domande su nutrizione, recupero o tecnica? Il tuo coach AI risponde sempre.", color: "text-green-400" },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="bg-card/60 hover:border-primary/30 transition-colors">
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-3xl font-bold">Pronto ad allenarti come un atleta?</h2>
        <p className="text-muted-foreground">Unisciti a migliaia di utenti che si allenano con FitAI</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8">Crea account gratuito <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 FitAI — Allenati più intelligente</p>
      </footer>
    </div>
  );
}
