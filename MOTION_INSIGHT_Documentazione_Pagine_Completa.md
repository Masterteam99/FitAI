> ## ⚠️ STATO REALE — aggiornato 2026-08-23 (Sessione 12)
> **Fonte autorevole dello stato di avanzamento: i due diari `COSE_FATTE_IN_SESSIONE.md` + `COSE_DA_FARE.md`.** In caso di conflitto con questo documento, **valgono i diari** (qui sotto possono esserci sezioni storiche o superate).
>
> **Sessione 12:** tabelle competitor prezzi (home + `/prezzi`) popolate con dati reali verificati via
> ricerca web — Buddyfit, Freeletics, Gymondo (tabella home) + Fitbod (aggiunto anche su `/prezzi`).
> Prezzo Freeletics riverificato direttamente sul sito ufficiale dopo un primo giro giudicato non
> abbastanza solido: nessun piano mensile standalone, solo 3/12 mesi. Rimossa la sotto-tabella
> "Funzionalità" da `/prezzi` (ridondante con quella in home); aggiunta riga "Calcolo delle kilocalorie"
> a Free/Premium. Commit `be4369b`, pushato su `main`. Dettaglio completo in
> `COSE_FATTE_IN_SESSIONE.md` Sessione 12.
---

Tutte le pagine: copy, struttura, obiettivi, note tecniche

Generato: 10/08/2026 \| Progetto: Motion Insight (app fitness AI:
analisi video tecnica + piani + nutrizione)

SEZIONE 1: MARKETING & SITO PUBBLICO

17+ pagine pubbliche (sito marketing, home, chi-siamo, prezzi, percorsi,
faq, risorse, scarica, privacy, terms, ecc.)

Home / Landing Page

1\. Titolo pagina e URL/route

Route: /

File: src/app/page.tsx

2\. Obiettivo generale

Pagina di ingresso principale. Spiega il valore di Motion Insight
attraverso 9 sezioni hero→segmenti→pain→come funziona→Form
Score→sicurezza→storie→prezzi→CTA finale.

3\. Pubblico target

Visitatore nuovo, non ancora iscritto. Funnel da awareness a conversione
quiz.

4\. Struttura della pagina

1\. HERO --- H1 \'Alleni da solo?\...\', lead, CTA primaria/secondaria,
trust badges

2\. PER CHI SEI --- 6 segmenti (corro, casa, palestra, post-parto, over
50, infortunio)

3\. TI RICONOSCI? --- 4 pain points

4\. COME FUNZIONA --- 4 passi (camera, 33 punti, feedback, adattamento)

5\. FORM SCORE --- titolo, testo, grafico, delta +18%

6\. SICUREZZA & PRIVACY --- on-device claim, GDPR

7\. STORIE --- \'In arrivo\' pre-launch

8\. PREZZI --- 3 piani (Free, Premium €9,90, Annuale €79,90)

9\. CTA FINALE --- bottone verso quiz

6\. CTA principali

• \"Trova il tuo percorso\" → /quiz

• \"Guarda la demo\" → video

7\. Componenti/elementi interattivi

Hero visual con score card placeholder, float card correzione in tempo
reale, pricing table

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.landing (righe 104-197). Landing è il
punto di ingresso principale: traffico organico, paid, social. Ogni
sezione target engagement diverso. Meta SEO ottimizzato.

Per chi è (Segmenti)

1\. Titolo pagina e URL/route

Route: /per-chi

File: src/app/(marketing)/per-chi/page.tsx

2\. Obiettivo generale

Pagina dedicated sui 6 segmenti di utenti. Espande i segmenti della
landing con valore proposition dettagliata per ognuno.

3\. Pubblico target

Visitatore che vuole sapere se Motion Insight è per lui, quale percorso.

4\. Struttura della pagina

1\. Hero --- Badge \'Per chi è\', H1, sottotitolo

2\. 6 Segmenti espansi --- runner, casa, palestra, neo-mamme, over 50,
post-infortunio

3\. CTA finale --- \'Non sai da dove partire? Quiz\'

6\. CTA principali

• \"Calcola il tuo piano gratis\" → /quiz

7\. Componenti/elementi interattivi

Nessun form, testo statico.

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.perChi (righe 199-219). Meta
description: \'Runner, allenamento a casa, palestra, post-parto, over
50, rientro da infortunio: trova il tuo percorso con la correzione della
forma AI.\'

Funzionalità

1\. Titolo pagina e URL/route

Route: /funzionalita

File: src/app/(marketing)/funzionalita/page.tsx

2\. Obiettivo generale

Showcase delle 8 feature principali di Motion Insight: correzione forma,
piano adattivo, \'Come ti senti?\', feedback vocale, carico progressivo,
nutrizione, tracker progressi, AI Coach.

3\. Pubblico target

Visitatore interessato alle funzionalità, fase mid-funnel, pronto a
provare.

4\. Struttura della pagina

1\. Hero --- Badge, H1 \'Molto più di una scheda\', sottotitolo

2\. 8 Feature card --- ciascuna con titolo, descrizione, differenziale

3\. CTA finale --- \'Provalo gratis\'

6\. CTA principali

• \"Calcola il tuo piano gratis\" → /quiz

7\. Componenti/elementi interattivi

Feature card grid, nessun form, static layout

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.funzionalita (righe 221-243). Mette
in luce il differenziale: computer vision + AI + adattamento.

Come Funziona

1\. Titolo pagina e URL/route

Route: /come-funziona

File: src/app/(marketing)/come-funziona/page.tsx

2\. Obiettivo generale

Spiega in dettaglio il funzionamento tecnico: 5 passi da video a
feedback a adattamento, con claim su on-device processing e GDPR.

3\. Pubblico target

Visitatore che vuole capire il \'come\', fase consideration,
tech-interested.

4\. Struttura della pagina

1\. Hero --- H1 \'Come l\'AI vede la tua tecnica\', sottotitolo

2\. 5 Passi --- Riprendi, 33 punti, feedback, adattamento, privacy

3\. CTA finale --- \'Pronto a vedere cosa correggere?\'

6\. CTA principali

• \"Calcola il tuo piano gratis\" → /quiz

7\. Componenti/elementi interattivi

Step counter, testo statico, no form

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.comeFunziona (righe 245-263). Claim
critico su privacy: \'Il video è elaborato sul tuo dispositivo\'. Da
mantenere accurato se l\'architettura cambia.

Prezzi

1\. Titolo pagina e URL/route

Route: /prezzi

File: src/app/(marketing)/prezzi/page.tsx

2\. Obiettivo generale

Showcase dei 3 piani di abbonamento con features, prezzi, note di
rassicurazione (prova 7g, disdici quando, rimborso 30g).

3\. Pubblico target

Visitatore pronto a convertire, phase consideration to decision.

4\. Struttura della pagina

1\. Hero --- H1 \'Un piano per ogni obiettivo\', guarantee note

2\. Free plan --- €0, 3 piani AI/mese, 5 analisi/mese

3\. Premium plan --- €9,90/mese (badge \'Più scelto\'), illimitato + AI
Coach + nutrizione dinamica

4\. Yearly plan --- €79,90/anno (badge \'−33%\'), tutto Premium + 2 mesi
gratis

5\. Footnote --- prova 7g, disdici, rimborso 30g

6\. CTA principali

• \"Inizia gratis\" → /registrati

• \"Prova 7 giorni gratis\" → /checkout?plan=premium

7\. Componenti/elementi interattivi

3-col pricing table, plan card, feature comparison

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.prezzi (righe 265-305). Piani critici
per revenue. Guarantee note reduce friction conversion. Test A/B su CTA
button color.

Chi siamo

1\. Titolo pagina e URL/route

Route: /chi-siamo

File: src/app/(marketing)/chi-siamo/page.tsx

2\. Obiettivo generale

Build trust: missione, perché esiste Motion Insight, 3 valori principali
(vedere per prevenire, privacy, concreto non tecnicismi).

3\. Pubblico target

Visitatore scettico, phase consideration, vuole capire chi c\'è dietro.

4\. Struttura della pagina

1\. Hero --- H1 \'Il personal trainer AI che vede gli errori\',
sottotitolo

2\. Intro --- 2 paragrafi su motivazione e approccio

3\. 3 Valori --- \'Vedere per prevenire\', \'Privacy è sacra\',
\'Concreto, non tecnicismi\'

4\. CTA finale --- \'Unisciti a noi\'

6\. CTA principali

• \"Calcola il tuo piano gratis\" → /quiz

7\. Componenti/elementi interattivi

Text-heavy, possibly value icons, static layout

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.chiSiamo (righe 307-327). About page:
build trust. Language: \'intelligenza artificiale + computer vision\',
no jargon.

Storie (Stories / Testimonials)

1\. Titolo pagina e URL/route

Route: /storie

File: src/app/(marketing)/storie/page.tsx

2\. Obiettivo generale

Pre-launch landing per feature: racconta che storie vere di utenti
stanno arrivando, preferibilità per testimonianze autentiche.

3\. Pubblico target

Visitatore che vuole \'social proof\', fase consideration, user stories.

4\. Struttura della pagina

1\. Hero --- H1 \'Storie vere\', sottotitolo, badge \'In arrivo\'

2\. Coming soon block --- \'Le prime storie stanno arrivando\'

3\. CTA --- \'Vuoi essere tra i primi?\'

6\. CTA principali

• \"Inizia gratis\" → /registrati

7\. Componenti/elementi interattivi

Coming soon placeholder, CTA card

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.storie (righe 329-343). Feature
ancora in development. Pre-launch messaging per generate demand.

Risorse (Blog / Articles)

1\. Titolo pagina e URL/route

Route: /risorse

File: src/app/(marketing)/risorse/page.tsx

2\. Obiettivo generale

Content hub: guide pratiche su tecnica, allenamento, nutrizione,
prevenzione. Long-form content per SEO e trust.

3\. Pubblico target

Visitatore research-phase, interessato a imparare prima di impegnarsi.

4\. Struttura della pagina

1\. Hero --- H1 \'Guide per muoverti meglio\', sottotitolo

2\. Article grid --- filtri per categoria, snippet lettura

3\. CTA finale --- \'Metti in pratica\'

6\. CTA principali

• \"Calcola il tuo piano gratis\" → /quiz

7\. Componenti/elementi interattivi

Article card grid, category filter, reading time badge

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.risorse (righe 345-360). Content
marketing layer. Help with SEO, build authority.

Scarica l\'app

1\. Titolo pagina e URL/route

Route: /scarica

File: src/app/(marketing)/scarica/page.tsx

2\. Obiettivo generale

PWA installation guide: 10-second install (no app store), funziona
offline, come installare da Safari/Chrome.

3\. Pubblico target

Utente già pronto, fase conversion, non vuole attendere app store
approval.

4\. Struttura della pagina

1\. Hero --- H1 \'Porta Motion Insight sempre con te\', sottotitolo

2\. Note --- \'Funziona come un\'app vera: icona in home, schermo
intero, offline\'

3\. iOS guide (Safari) --- 3 step

4\. Android guide (Chrome) --- 3 step

5\. CTA --- \'Installa ora\'

6\. CTA principali

• \"Installa ora\" → javascript:void(0)

7\. Componenti/elementi interattivi

Platform-specific instructions, install button

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.scarica (righe 362-380). PWA key
differentiator: no store approval, instant updates, offline capability.

FAQ

1\. Titolo pagina e URL/route

Route: /faq

File: src/app/(marketing)/faq/page.tsx

2\. Obiettivo generale

Risponde alle 7 domande più frequenti: funziona davvero? Video salvati?
Senza attrezzi? Telefono? Principiante? Disdica? Disclaimer medico.

3\. Pubblico target

Visitatore in fase decision, scettico, ha obiezioni.

4\. Struttura della pagina

1\. Hero --- H1 \'Domande frequenti\', sottotitolo

2\. 7 Q&A --- Accordion format

Q1: \'L\'AI vede davvero cosa faccio?\'

Q2: \'I miei video vengono salvati o inviati?\'

Q3: \'Funziona senza attrezzi, a casa?\'

Q4: \'Serve un telefono potente?\'

Q5: \'Posso usarlo se sono principiante assoluto?\'

Q6: \'Come disdico l\'abbonamento?\'

Q7: \'Motion Insight sostituisce un medico?\'

3\. CTA finale

6\. CTA principali

• \"Calcola il tuo piano gratis\" → /quiz

7\. Componenti/elementi interattivi

Accordion/collapsible Q&A, no form

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.faq (righe 382-402). Critical page:
address objections, reduce friction, medical disclaimer.

Privacy Policy

1\. Titolo pagina e URL/route

Route: /privacy

File: src/app/privacy/page.tsx

2\. Obiettivo generale

GDPR-compliant privacy policy: chi tratta dati, cosa raccogliamo,
finalità, retention, terzi, diritti GDPR, cookies, sicurezza.

3\. Pubblico target

Utente che legge pre-signup, compliance lawyer, data protection officer.

4\. Struttura della pagina

1\. Titolare del trattamento

2\. Dati che raccogliamo --- registrazione, profilo, utilizzo, tecnici,
video

3\. Finalità e basi giuridiche --- servizio, sicurezza, miglioramento,
comunicazioni

4\. Conservazione dei dati

5\. Condivisione con terzi --- Supabase, Upstash, Anthropic, Google,
Resend, Vercel

6\. Diritti GDPR --- accesso, rettifica, cancellazione, portabilità,
opposizione

7\. Cookie --- solo tecnici, no profilazione

8\. Sicurezza --- bcrypt, TLS, breach notification 72h

9\. Modifiche

10\. Contatti --- privacy\@motioninsight.local

6\. CTA principali

Nessun CTA principale

7\. Componenti/elementi interattivi

Accordion section, email contact

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.privacy (righe 1455-1553). Critical
legal doc. Video processing on-device claim è core privacy selling point
e deve essere accurato. On-device elaboration per video = no video
saved/sent. Last update: 15 maggio 2026.

Terms of Service

1\. Titolo pagina e URL/route

Route: /terms

File: src/app/terms/page.tsx

2\. Obiettivo generale

Legal T&C: accettazione, descrizione servizio, account, medical
disclaimer, acceptable use, content ownership, liability, cancellazione,
modifiche, legge applicabile.

3\. Pubblico target

Utente che legge, avvocati, compliance.

4\. Struttura della pagina

1\. Accettazione

2\. Descrizione del servizio

3\. Account --- min 16 anni, responsabilità password, one per persona

4\. Disclaimer medico --- IMPORTANTE: non è servizio medico

5\. Uso consentito --- no account hacking, scraping, illegal content,
compromise, resale

6\. Contenuti generati dagli utenti --- tua proprietà, licenza limitata,
no AI training without consent

7\. Limitazione di responsabilità

8\. Cancellazione account

9\. Modifiche --- 14 giorni notice

10\. Legge applicabile --- legge italiana

11\. Contatti --- legal\@motioninsight.local

6\. CTA principali

Nessun CTA principale

7\. Componenti/elementi interattivi

Accordion section, email contact

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.terms (righe 1555-1638). Medical
disclaimer è prominente: \'NON è servizio medico\'. Video ownership: tua
proprietà, no training use without consent. Last update: 15 maggio 2026.

SEZIONE 2: AUTENTICAZIONE & ONBOARDING

[Nota 12 ago 2026: l'onboarding principale e ora il QUIZ (/onboarding/quiz),
verso cui puntano le CTA "Calcola il tuo piano gratis". Il flusso 4-step
descritto sotto esiste ancora nel codice ma non e piu l'entry point. Questo
documento copre solo pagine pubbliche/auth: l'area utente app e in
DOCUMENTAZIONE_FLUSSI.md §21.]

9 pagine (login, registrati, password reset, email verify, 4-step
onboarding, welcome tour)

Login

1\. Titolo pagina e URL/route

Route: /login

File: src/app/(auth)/login/page.tsx

2\. Obiettivo generale

Pagina di accesso: email/password oppure Google, link reset password,
link registrazione.

3\. Pubblico target

Utente registrato che ritorna.

4\. Struttura della pagina

1\. Form title --- \'Bentornato\'

2\. Google OAuth button

3\. Divider --- \'oppure\'

4\. Email + password fields

5\. Forgot password link

6\. Sign up link --- \'Non hai un account?\'

6\. CTA principali

• \"Accedi\" → form submit

• \"Continua con Google\" → oauth

7\. Componenti/elementi interattivi

Form, OAuth button, text link

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.login (righe 404-435). Validazione
email+password. Error messages: \'Email o password non corretti\',
\'Questo account è stato creato con Google\'.

Registrazione

1\. Titolo pagina e URL/route

Route: /registrati

File: src/app/(auth)/registrati/page.tsx

2\. Obiettivo generale

Pagina di signup: nome, email, password, conferma password, Google
OAuth.

3\. Pubblico target

Visitatore nuovo, ready to sign up.

4\. Struttura della pagina

1\. Form title --- \'Inizia ora\'

2\. Google OAuth button

3\. Divider --- \'oppure\'

4\. Nome completo field

5\. Email field

6\. Password field --- min 8

7\. Confirm password field

8\. Submit button

9\. Login link --- \'Hai già un account?\'

6\. CTA principali

• \"Crea account\" → form submit

• \"Registrati con Google\" → oauth

7\. Componenti/elementi interattivi

Form, OAuth button, text link

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.registrati (righe 437-462).
Validazione: nome min 2, email valida, password min 8, match confirm.
Lead into onboarding step 1.

Password Dimenticata

1\. Titolo pagina e URL/route

Route: /forgot-password

File: src/app/(auth)/forgot-password/page.tsx

2\. Obiettivo generale

Pagina di reset password: richiedi email, sistema invia link, messaggio
di conferma.

3\. Pubblico target

Utente che ha dimenticato password.

4\. Struttura della pagina

1\. Form title --- \'Password dimenticata?\'

2\. Subtitle --- \'Inseriamo la tua email e ti invieremo un link\'

3\. Email field

4\. Submit button --- \'Invia link di reset\'

5\. Success message --- \'Email inviata. Controlla anche lo spam.\'

6\. Back to login link

6\. CTA principali

• \"Invia link di reset\" → form submit

7\. Componenti/elementi interattivi

Form, text link

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.forgotPassword (righe 464-481).
Two-state: input form, then success confirmation.

Reset Password

1\. Titolo pagina e URL/route

Route: /reset-password?token=\...

File: src/app/(auth)/reset-password/page.tsx

2\. Obiettivo generale

Pagina di reset password: nuova password, conferma, submit, success
message.

3\. Pubblico target

Utente con token valido da email reset link.

4\. Struttura della pagina

1\. Form title --- \'Nuova password\'

2\. Password field --- min 8

3\. Confirm password field

4\. Submit button

5\. Error state --- \'Link non valido. Richiedi un nuovo reset.\'

6\. Success state --- \'Password aggiornata. Reindirizzando a
login\...\'

6\. CTA principali

• \"Imposta nuova password\" → form submit

• \"Richiedi reset\" → /forgot-password

7\. Componenti/elementi interattivi

Form, error/success states

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.resetPassword (righe 483-505). Token
validation critical. Expired token message clear.

Verify Email

1\. Titolo pagina e URL/route

Route: /verify-email

File: src/app/(auth)/verify-email/page.tsx

2\. Obiettivo generale

Pagina di verifica email: 4 stati (ok, expired, already, invalid,
pending). Bottone resend link.

3\. Pubblico target

Utente che clicca link da email di verifica.

4\. Struttura della pagina

1\. State-based display:

\- OK: \'Email verificata. Puoi accedere.\'

\- Expired: \'Link scaduto. Richiedi una nuova email.\'

\- Already: \'Email già verificata in precedenza.\'

\- Invalid: \'Link non valido. Richiedi una nuova email.\'

\- Pending: \'Controlla la tua casella email. Ti abbiamo inviato un
link.\'

2\. Resend button / Dashboard button

6\. CTA principali

• \"Vai alla dashboard\" → /dashboard

• \"Invia nuovo link\" → api resend

7\. Componenti/elementi interattivi

State-based display, conditional buttons

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.verifyEmail (righe 507-523). 5
distinct states. Token TTL validation.

Onboarding Step 1 --- Obiettivi e Livello

1\. Titolo pagina e URL/route

Route: /onboarding/step1

File: src/app/(auth)/onboarding/step1/page.tsx

2\. Obiettivo generale

Step 1/4: scelta obiettivo principale (6 opzioni) e livello fitness (4
opzioni).

3\. Pubblico target

Utente appena registrato.

4\. Struttura della pagina

1\. Step indicator --- \'Step 1 di 4 --- obiettivi e livello\'

2\. Obiettivo section --- 6 radio buttons:

\- Perdita di peso

\- Aumento massa muscolare

\- Performance atletica

\- Resistenza cardiovascolare

\- Flessibilità e mobilità

\- Forma fisica generale

3\. Livello section --- 4 radio buttons con descrizione:

\- Principiante (\< 6 mesi)

\- Intermedio (6 mesi --- 2 anni)

\- Avanzato (2+ anni regolari)

\- Atleta (Competizioni / agonista)

4\. Continue button

6\. CTA principali

• \"Continua\" → /onboarding/step2

7\. Componenti/elementi interattivi

Radio group x2, Continue button

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.onboardingStep1 (righe 525-546).
Store in profile. Required fields.

Onboarding Step 2 --- Attrezzatura

1\. Titolo pagina e URL/route

Route: /onboarding/step2

File: src/app/(auth)/onboarding/step2/page.tsx

2\. Obiettivo generale

Step 2/4: scelta attrezzatura disponibile (10 opzioni, multi-select).

3\. Pubblico target

Utente onboarding.

4\. Struttura della pagina

1\. Step indicator --- \'Step 2 di 4 --- cosa hai a disposizione\'

2\. Instruction --- \'Seleziona tutto quello che puoi usare\'

3\. 10 Checkboxes:

\- Solo peso corporeo

\- Manubri

\- Bilanciere

\- Macchinari palestra

\- Cavi/Pulegge

\- Elastici

\- Sbarra trazioni

\- Panca

\- Kettlebell

\- Palestra completa

4\. Back + Continue buttons

6\. CTA principali

• \"Indietro\" → /onboarding/step1

• \"Continua\" → /onboarding/step3

7\. Componenti/elementi interattivi

Checkbox group, Back+Continue buttons

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.onboardingStep2 (righe 548-567).
Multi-select allowed.

Onboarding Step 3 --- Dati Fisici

1\. Titolo pagina e URL/route

Route: /onboarding/step3

File: src/app/(auth)/onboarding/step3/page.tsx

2\. Obiettivo generale

Step 3/4: dati fisici (età, peso, altezza, genere), giorni allenamento,
dieta, problematiche, sport pregresso.

3\. Pubblico target

Utente onboarding.

4\. Struttura della pagina

1\. Step indicator --- \'Step 3 di 4 --- dati fisici e disponibilità\'

2\. Physical data section:

\- Age (number)

\- Weight in kg (number)

\- Height in cm (number)

\- Gender (radio: M, F, Altro)

3\. Workout days --- number (x/week)

4\. Lifestyle section:

\- Diet (dropdown: Onnivora, Vegetariana, Vegana, Chetogenica,
Mediterranea, Altro)

\- Physical issues (textarea)

\- Previous sports (multi-select dropdown)

5\. Back + Continue buttons

6\. CTA principali

• \"Indietro\" → /onboarding/step2

• \"Continua\" → /onboarding/step4

7\. Componenti/elementi interattivi

Text inputs, dropdowns, radio, textarea

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.onboardingStep3 (righe 569-596).
Age/weight/height validation. Optional: injuries/sports.

Onboarding Step 4 --- Generazione Piano AI

1\. Titolo pagina e URL/route

Route: /onboarding/step4

File: src/app/(auth)/onboarding/step4/page.tsx

2\. Obiettivo generale

Step 4/4: recap dati, generazione piano AI con Claude, loading state,
success → dashboard.

3\. Pubblico target

Utente onboarding.

4\. Struttura della pagina

1\. Step indicator --- \'Step 4 di 4 --- riepilogo e generazione piano
AI\'

2\. Summary table --- goal, level, equipment, age, weight, height,
workouts/week, diet, sports, injuries

3\. Generate button --- \'Genera piano e inizia\'

4\. Loading state --- \'Sto preparando il tuo piano\... Claude sta
creando un piano personalizzato per te\'

5\. Success state --- \'Continua alla dashboard\'

6\. Error state --- \'Errore generazione. Riprova.\'

6\. CTA principali

• \"Indietro\" → /onboarding/step3

• \"Genera piano e inizia\" → api generate

• \"Riprova generazione\" → retry

• \"Continua alla dashboard\" → /dashboard

7\. Componenti/elementi interattivi

Summary table, Generate button, streaming status, error retry

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.onboardingStep4 (righe 598-647).
Calls Claude API to generate personalized plan. Quota exceeded handling.
Plan saved, user redirect to dashboard.

Welcome Tour

1\. Titolo pagina e URL/route

Route: (in-app overlay)

File: src/components/onboarding/WelcomeTour.tsx

2\. Obiettivo generale

5-step guided tour on first login: intro, genera piano, analizza
tecnica, traccia progressi, navigazione.

3\. Pubblico target

Utente appena onboarded, first login experience.

4\. Struttura della pagina

1\. Step 0 --- \'Benvenuto in Motion Insight! 💪\' intro to features

2\. Step 1 --- \'Genera il tuo piano AI\' link to /allenamento/genera-ai

3\. Step 2 --- \'Analizza la tua tecnica\' link to /analisi

4\. Step 3 --- \'Traccia nutrizione e progressi\' (no CTA)

5\. Step 4 --- \'Tutto pronto! Esplora dalla navbar, buon allenamento!\'
(no CTA)

6\. CTA principali

• \"Vai ai piani\" → /allenamento/genera-ai

• \"Prova l\'analisi\" → /analisi

7\. Componenti/elementi interattivi

Tour overlay, step navigation, skip/back/next buttons

8\. Note tecniche/UX rilevanti

Copy da src/content/copy.ts → copy.welcomeTour (righe 649-683).
Skippable. Triggered on first dashboard visit.
