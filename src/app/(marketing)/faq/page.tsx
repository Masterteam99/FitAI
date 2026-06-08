import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/motion/MotionPrimitives";

export const metadata: Metadata = {
  title: "FAQ — FitAI",
  description: "Risposte alle domande più frequenti su piani AI, analisi video, abbonamenti e privacy.",
};

const FAQS = [
  { q: "FitAI è davvero gratis?", a: "Sì. Il piano Free include 3 piani di allenamento AI, 1 piano nutrizionale e 5 analisi video al mese, oltre alla libreria esercizi completa. Passi a Premium solo se ti serve uso illimitato." },
  { q: "Come vengono creati i piani di allenamento?", a: "L'AI di Claude analizza il tuo profilo — obiettivo, livello, attrezzatura, giorni disponibili e storico infortuni — e compone il piano scegliendo gli esercizi più adatti dal nostro database, escludendo quelli controindicati." },
  { q: "Cosa serve per l'analisi video?", a: "Solo la fotocamera del tuo dispositivo. La computer vision di MediaPipe elabora i movimenti in tempo reale per misurare gli angoli articolari e darti feedback su postura ed esecuzione." },
  { q: "Ho bisogno di attrezzatura in palestra?", a: "No. Durante la configurazione indichi cosa hai a disposizione, anche solo il peso corporeo: i piani vengono adattati di conseguenza." },
  { q: "Posso usare l'app senza generare subito un piano?", a: "Certo. Puoi saltare l'onboarding e la generazione del piano in qualsiasi momento e continuare a esplorare gli esercizi e le altre sezioni dell'app." },
  { q: "Posso disdire Premium quando voglio?", a: "Sì, l'abbonamento si disdice in qualsiasi momento dal tuo profilo e resta attivo fino alla fine del periodo già pagato." },
  { q: "I miei dati sono al sicuro?", a: "Trattiamo i tuoi dati con cura e li usiamo solo per personalizzare la tua esperienza di allenamento. L'analisi video avviene per fornirti feedback, non per scopi pubblicitari." },
];

export default function FaqPage() {
  return (
    <>
      <section className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <SlideUp>
          <h1 className="text-display-lg">Domande <span className="text-gradient-energy">frequenti</span></h1>
        </SlideUp>
        <FadeIn delay={0.15}>
          <p className="text-xl text-muted-foreground">Tutto quello che c&apos;è da sapere prima di iniziare.</p>
        </FadeIn>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20">
        <Stagger className="space-y-4">
          {FAQS.map((f) => (
            <StaggerItem key={f.q}>
              <Card className="bg-card/60 backdrop-blur-sm">
                <CardContent className="p-6 space-y-2">
                  <h3 className="font-semibold">{f.q}</h3>
                  <p className="text-sm text-muted-foreground">{f.a}</p>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6">
        <h2 className="text-display-md">Hai ancora dubbi?</h2>
        <p className="text-muted-foreground">Il modo migliore per capire FitAI è provarlo.</p>
        <Link href="/registrati">
          <Button size="lg" className="gap-2 px-8 glow-energy">Inizia gratis <ChevronRight className="w-5 h-5" /></Button>
        </Link>
      </section>
    </>
  );
}
