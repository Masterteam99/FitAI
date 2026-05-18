import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background p-4 py-10">
      <article className="max-w-3xl mx-auto space-y-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        <header>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">Ultimo aggiornamento: 15 maggio 2026</p>
        </header>

        <Section title="1. Titolare del trattamento">
          <p>
            Il titolare del trattamento dei dati personali è il gestore di FitAI. Per qualsiasi richiesta relativa alla privacy puoi contattarci all&apos;indirizzo email indicato nella sezione &quot;Contatti&quot; di questo documento.
          </p>
        </Section>

        <Section title="2. Dati che raccogliamo">
          <p>Raccogliamo i seguenti dati personali quando usi FitAI:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Dati di registrazione</strong>: nome, indirizzo email, password (in forma crittografata via bcrypt).</li>
            <li><strong>Dati di profilo</strong>: età, peso, altezza, genere, obiettivi fitness, attrezzatura disponibile, dieta, sport pregresso, eventuali infortuni dichiarati.</li>
            <li><strong>Dati di utilizzo</strong>: sessioni di allenamento, log nutrizionali, sessioni di analisi video, punti accumulati, achievement, streak.</li>
            <li><strong>Dati tecnici</strong>: tipo di dispositivo e browser, indirizzo IP (per sicurezza e rate limiting), data e ora di accesso.</li>
            <li><strong>Video di analisi</strong>: i video caricati per l&apos;analisi tecnica vengono temporaneamente memorizzati per il tempo necessario all&apos;elaborazione e poi cancellati.</li>
          </ul>
        </Section>

        <Section title="3. Finalità e basi giuridiche">
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Erogazione del servizio</strong> (esecuzione del contratto): generare piani di allenamento, analizzare la tecnica, tracciare progressi.</li>
            <li><strong>Sicurezza e prevenzione abusi</strong> (legittimo interesse): rate limiting, log accessi, monitoraggio errori.</li>
            <li><strong>Miglioramento del prodotto</strong> (legittimo interesse): statistiche aggregate e anonime sull&apos;uso.</li>
            <li><strong>Comunicazioni di servizio</strong> (esecuzione del contratto): email di verifica, reset password, notifiche importanti.</li>
          </ul>
        </Section>

        <Section title="4. Conservazione dei dati">
          <p>
            I dati di profilo e cronologia sono conservati per tutta la durata dell&apos;account. Se richiedi la cancellazione, l&apos;account viene disattivato immediatamente e i dati eliminati definitivamente entro 30 giorni. I log tecnici sono conservati per 90 giorni.
          </p>
        </Section>

        <Section title="5. Condivisione con terzi">
          <p>Per fornire il servizio condividiamo alcuni dati con i seguenti processor esterni:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Supabase</strong> (PostgreSQL hosting, EU): database principale.</li>
            <li><strong>Upstash</strong> (Redis, EU): rate limiting.</li>
            <li><strong>Anthropic</strong> (Claude API, USA): generazione piani AI e analisi tecnica. Prompt e risposte sono inviati ma non usati per training.</li>
            <li><strong>Google</strong> (OAuth, opzionale): solo se scegli di accedere con Google.</li>
            <li><strong>Resend</strong> (email transazionali, EU/USA): invio email di servizio.</li>
            <li><strong>Vercel</strong> (hosting, USA/EU): hosting dell&apos;applicazione.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Tutti i processor sono vincolati da accordi DPA conformi al GDPR. Non vendiamo né condividiamo i tuoi dati personali con terzi per finalità di marketing.
          </p>
        </Section>

        <Section title="6. I tuoi diritti (GDPR)">
          <p>Hai diritto a:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Accesso</strong>: scaricare tutti i tuoi dati dal profilo &gt; sezione &quot;I miei dati&quot;.</li>
            <li><strong>Rettifica</strong>: modificare i tuoi dati dal profilo.</li>
            <li><strong>Cancellazione</strong>: eliminare l&apos;account dal profilo &gt; &quot;Elimina account&quot;.</li>
            <li><strong>Portabilità</strong>: esportare i dati in formato JSON.</li>
            <li><strong>Opposizione</strong>: contattarci per opporti a trattamenti basati su legittimo interesse.</li>
            <li><strong>Reclamo</strong>: presentare reclamo al Garante Privacy (www.garanteprivacy.it).</li>
          </ul>
        </Section>

        <Section title="7. Cookie">
          <p>
            FitAI usa solo cookie tecnici essenziali per l&apos;autenticazione (NextAuth session). Non usiamo cookie di profilazione o di marketing. Eventuali cookie di analytics aggiuntivi vengono attivati solo previo consenso esplicito tramite il banner cookie.
          </p>
        </Section>

        <Section title="8. Sicurezza">
          <p>
            Le password sono memorizzate in forma crittografata con bcrypt (12 rounds). Le connessioni sono cifrate TLS. L&apos;accesso ai dati è limitato al personale autorizzato. In caso di breach, ti notificheremo entro 72 ore come richiesto dal GDPR.
          </p>
        </Section>

        <Section title="9. Modifiche">
          <p>
            Possiamo aggiornare questa policy. La data di aggiornamento è in cima al documento. Modifiche sostanziali ti saranno notificate via email.
          </p>
        </Section>

        <Section title="10. Contatti">
          <p>
            Per qualsiasi richiesta relativa alla privacy: <span className="font-mono text-sm">privacy@fitai.local</span>
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
