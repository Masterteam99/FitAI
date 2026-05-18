import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termini di Servizio" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-4 py-10">
      <article className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        <header>
          <h1 className="text-3xl font-bold">Termini di Servizio</h1>
          <p className="text-sm text-muted-foreground mt-2">Ultimo aggiornamento: 15 maggio 2026</p>
        </header>

        <Section title="1. Accettazione">
          <p>Utilizzando FitAI accetti questi Termini di Servizio. Se non sei d&apos;accordo, non utilizzare il servizio.</p>
        </Section>

        <Section title="2. Descrizione del servizio">
          <p>
            FitAI è un&apos;applicazione di fitness che utilizza intelligenza artificiale per generare piani di allenamento personalizzati, analizzare la tecnica di esecuzione tramite video, tracciare la nutrizione e fornire un coach AI conversazionale. Il servizio è fornito &quot;così com&apos;è&quot;.
          </p>
        </Section>

        <Section title="3. Account">
          <p>
            Devi avere almeno 16 anni per registrarti. Sei responsabile della sicurezza della tua password e di ogni attività sul tuo account. Devi fornire informazioni accurate. Un solo account per persona.
          </p>
        </Section>

        <Section title="4. Disclaimer medico — IMPORTANTE">
          <p className="text-foreground font-semibold">
            FitAI NON è un servizio medico o sanitario. I piani di allenamento, le analisi tecniche e i consigli del coach AI sono generati da algoritmi e da modelli di intelligenza artificiale, e NON sostituiscono il parere di medici, fisioterapisti o personal trainer qualificati.
          </p>
          <p>
            Prima di iniziare qualsiasi programma di allenamento, soprattutto se hai patologie pregresse, infortuni, sei in gravidanza o hai dubbi sulle tue condizioni di salute, consulta un medico. Sei l&apos;unico responsabile per la tua sicurezza durante l&apos;allenamento.
          </p>
        </Section>

        <Section title="5. Uso consentito">
          <p>Non puoi:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Tentare di accedere all&apos;account di altri utenti;</li>
            <li>Fare scraping o uso automatizzato del servizio;</li>
            <li>Caricare contenuti illegali, offensivi o che violino diritti altrui;</li>
            <li>Tentare di compromettere la sicurezza o le funzionalità del servizio;</li>
            <li>Rivendere o sublicenziare il servizio.</li>
          </ul>
        </Section>

        <Section title="6. Contenuti generati dagli utenti">
          <p>
            I video caricati per l&apos;analisi e i dati inseriti restano di tua proprietà. Concedi a FitAI una licenza limitata per elaborarli al fine di erogare il servizio. Non utilizziamo i tuoi dati per training di modelli AI senza il tuo consenso esplicito.
          </p>
        </Section>

        <Section title="7. Limitazione di responsabilità">
          <p>
            Nei limiti consentiti dalla legge, FitAI non è responsabile per: danni indiretti, perdita di dati, interruzioni del servizio, infortuni derivanti dall&apos;esecuzione degli esercizi proposti, decisioni prese sulla base dei consigli AI. L&apos;uso del servizio è a tuo rischio.
          </p>
        </Section>

        <Section title="8. Cancellazione account">
          <p>
            Puoi cancellare il tuo account in qualsiasi momento dal profilo. Possiamo sospendere o terminare il tuo account in caso di violazione di questi termini.
          </p>
        </Section>

        <Section title="9. Modifiche">
          <p>
            Possiamo aggiornare questi termini. Modifiche sostanziali ti saranno comunicate via email almeno 14 giorni prima della loro entrata in vigore.
          </p>
        </Section>

        <Section title="10. Legge applicabile">
          <p>
            Questi termini sono regolati dalla legge italiana. Foro competente: foro del consumatore previsto dalla normativa.
          </p>
        </Section>

        <Section title="11. Contatti">
          <p>
            Per domande sui termini: <span className="font-mono text-sm">legal@fitai.local</span>
          </p>
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">{children}</div>
    </section>
  );
}
