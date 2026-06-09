/**
 * ============================================================================
 *  FONTE UNICA DEI COPY — FitAI
 * ============================================================================
 *
 * Questo file è l'UNICA fonte di verità per tutti i testi dell'app (titoli,
 * sottotitoli, bottoni, liste, metadata SEO e il nome dell'app).
 *
 * Modificare un testo qui aggiorna automaticamente l'app web e la PWA mobile,
 * perché le pagine importano da questo modulo invece di avere stringhe inline.
 *
 * Struttura: una sezione per pagina/area, con un commento d'intestazione che
 * indica la route e il percorso del file sorgente che la usa. Così questo file
 * funge anche da "inventario" leggibile dei copy del prodotto.
 *
 * Convenzioni:
 *  - I titoli con parola evidenziata (gradient) usano { pre, highlight, post }.
 *  - Le stringhe usano l'apostrofo tipografico ' (non &apos;).
 * ============================================================================
 */

// ─── Identità del prodotto ───────────────────────────────────────────────────
export const APP_NAME = "FitAI";
export const APP_TAGLINE = "Allenati più intelligente";
export const APP_DESCRIPTION = "Il tuo personal trainer AI con analisi video in tempo reale";
/** Descrizione estesa usata nel footer marketing */
export const APP_DESCRIPTION_LONG =
  "Il tuo personal trainer AI: piani su misura, analisi video della tecnica e un coach disponibile 24/7.";

export type HeroTitle = { pre: string; highlight: string; post?: string };

export const copy = {
  // ── Layout root → src/app/layout.tsx ──
  layout: {
    meta: {
      titleDefault: APP_NAME,
      titleTemplate: `%s | ${APP_NAME}`,
      description: APP_DESCRIPTION,
    },
  },

  // ── Header marketing → src/components/marketing/MarketingHeader.tsx ──
  marketingHeader: {
    nav: [
      { href: "/funzionalita", label: "Funzionalità" },
      { href: "/come-funziona", label: "Come funziona" },
      { href: "/prezzi", label: "Prezzi" },
      { href: "/chi-siamo", label: "Chi siamo" },
      { href: "/faq", label: "FAQ" },
    ],
    login: "Accedi",
    signup: "Inizia gratis",
  },

  // ── Footer marketing → src/components/marketing/MarketingFooter.tsx ──
  marketingFooter: {
    description: APP_DESCRIPTION_LONG,
    columns: [
      {
        title: "Prodotto",
        links: [
          { href: "/funzionalita", label: "Funzionalità" },
          { href: "/come-funziona", label: "Come funziona" },
          { href: "/prezzi", label: "Prezzi" },
        ],
      },
      {
        title: "Azienda",
        links: [
          { href: "/chi-siamo", label: "Chi siamo" },
          { href: "/faq", label: "FAQ" },
        ],
      },
      {
        title: "Inizia",
        links: [
          { href: "/registrati", label: "Crea account" },
          { href: "/login", label: "Accedi" },
        ],
      },
    ],
    copyright: `© 2026 ${APP_NAME} — ${APP_TAGLINE}`,
  },

  // ── Navbar app loggata → src/components/layout/Navbar.tsx ──
  navbar: {
    items: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/esercizi", label: "Esercizi" },
      { href: "/allenamento", label: "Allenamento" },
      { href: "/analisi", label: "Analisi AI" },
      { href: "/ai-coach", label: "AI Coach" },
      { href: "/nutrizione", label: "Nutrizione" },
      { href: "/community", label: "Community" },
      { href: "/progressi", label: "Progressi" },
      { href: "/abbonamento", label: "Abbonamento" },
    ],
    admin: { href: "/admin/exercises", label: "Admin" },
    profileFallback: "Profilo",
    logout: "Esci",
  },

  // ── Landing → src/app/page.tsx ──
  landing: {
    badge: "Powered by Claude AI + MediaPipe",
    heroTitle: { pre: "Il tuo ", highlight: "Personal Trainer AI", post: "sempre con te" } as HeroTitle,
    heroSubtitle:
      "Allenati con piani personalizzati dall'AI, analizza la tua tecnica con la computer vision e ricevi feedback da un coach digitale disponibile 24/7.",
    ctaPrimary: "Inizia gratis",
    ctaSecondary: "Hai già un account",
    featuresTitle: "Tutto ciò di cui hai bisogno per allenarti meglio",
    features: [
      { title: "Piani AI Personalizzati", desc: "Claude crea piani su misura basandosi sui tuoi obiettivi, livello e attrezzatura disponibile." },
      { title: "Analisi Video Real-Time", desc: "Computer vision Google MediaPipe rileva i tuoi movimenti in tempo reale. Feedback istantaneo su postura e tecnica." },
      { title: "Analisi Triplice 50/30/20", desc: "Biomeccanica oggettiva, AI Expert e confronto con video PT: feedback completo come quello di un personal trainer privato." },
      { title: "Progressi Dettagliati", desc: "Traccia sessioni, misurazioni e miglioramenti nel tempo con grafici interattivi." },
      { title: "Gamification", desc: "Achievements, streak, punti e sfide per mantenerti motivato ogni giorno." },
      { title: "AI Coach 24/7", desc: "Domande su nutrizione, recupero o tecnica? Il tuo coach AI risponde sempre." },
    ],
    finalCtaTitle: "Pronto ad allenarti come un atleta?",
    finalCtaSubtitle: `Unisciti a migliaia di utenti che si allenano con ${APP_NAME}`,
    finalCtaButton: "Crea account gratuito",
  },

  // ── /funzionalita → src/app/(marketing)/funzionalita/page.tsx ──
  funzionalita: {
    meta: {
      title: `Funzionalità — ${APP_NAME}`,
      description: "Piani AI personalizzati, analisi video della tecnica, coach 24/7, nutrizione e gamification. Tutto in un'unica app.",
    },
    badge: "Funzionalità",
    heroTitle: { pre: "Tutto quello che serve, ", highlight: "un solo posto" } as HeroTitle,
    heroSubtitle: `${APP_NAME} unisce intelligenza artificiale e computer vision per offrirti l'esperienza di un personal trainer privato, sempre disponibile.`,
    features: [
      { title: "Piani allenamento AI", desc: "Claude compone il tuo piano scegliendo gli esercizi più adatti dal database in base a obiettivo, livello, attrezzatura e storico infortuni." },
      { title: "Analisi video real-time", desc: "La computer vision di MediaPipe traccia i tuoi movimenti dalla fotocamera e misura gli angoli articolari fotogramma per fotogramma." },
      { title: "Feedback triplice 50/30/20", desc: "Biomeccanica oggettiva, valutazione dell'AI Expert e confronto con i video dei personal trainer: un giudizio completo sulla tua tecnica." },
      { title: "Piani nutrizionali AI", desc: "Macro e pasti calibrati su peso, altezza, obiettivo e stile alimentare, generati dall'AI e aggiornabili quando vuoi." },
      { title: "Progressi e misurazioni", desc: "Sessioni, carichi, peso corporeo e circonferenze tracciati nel tempo con grafici interattivi e trend chiari." },
      { title: "Gamification", desc: "Achievement, streak giornaliere, punti e sfide per trasformare la costanza in qualcosa di divertente." },
      { title: "AI Coach 24/7", desc: "Dubbi su tecnica, recupero o alimentazione? Il coach digitale risponde in qualsiasi momento, con il contesto del tuo profilo." },
      { title: "Libreria esercizi", desc: "Schede dettagliate con muscoli coinvolti, attrezzatura e istruzioni: esplorabili anche senza un piano attivo." },
    ],
    ctaTitle: "Provalo gratis, oggi",
    ctaSubtitle: "Crea il tuo profilo e genera il primo piano in pochi minuti.",
    ctaButton: "Inizia gratis",
  },

  // ── /come-funziona → src/app/(marketing)/come-funziona/page.tsx ──
  comeFunziona: {
    meta: {
      title: `Come funziona — ${APP_NAME}`,
      description: "Dal profilo al piano AI all'analisi della tecnica: scopri come FitAI ti accompagna in cinque passi.",
    },
    heroTitle: { pre: "Come ", highlight: "funziona" } as HeroTitle,
    heroSubtitle: "Dal primo accesso al miglioramento misurabile: cinque passi semplici, guidati dall'intelligenza artificiale.",
    stepLabel: "Passo",
    steps: [
      { title: "Crea il tuo profilo", desc: "Registrati e rispondi a poche domande: obiettivo, livello, attrezzatura disponibile, dati fisici e storico sportivo." },
      { title: "Imposta le preferenze", desc: "Indica quanti giorni a settimana ti alleni, lo stile alimentare ed eventuali problematiche fisiche da tenere in considerazione." },
      { title: "L'AI genera il piano", desc: "Claude analizza il tuo profilo e compone allenamento e nutrizione scegliendo gli esercizi più rilevanti dal database, evitando quelli controindicati." },
      { title: "Allenati e filma la tecnica", desc: "Durante la sessione attivi la fotocamera: la computer vision misura i tuoi movimenti e ti dà feedback su postura ed esecuzione." },
      { title: "Monitora i progressi", desc: "Sessioni, carichi e misurazioni vengono tracciati nel tempo. Il coach AI adatta i consigli mano a mano che migliori." },
    ],
    ctaTitle: "Pronto a iniziare?",
    ctaButton: "Crea account gratuito",
  },

  // ── /prezzi → src/app/(marketing)/prezzi/page.tsx ──
  prezzi: {
    meta: {
      title: `Prezzi — ${APP_NAME}`,
      description: "Inizia gratis con piani AI, analisi video e nutrizione. Passa a Premium per uso illimitato a €9,99 al mese.",
    },
    heroTitle: { pre: "Un piano per ", highlight: "ogni obiettivo" } as HeroTitle,
    heroSubtitle: "Inizia gratis e passa a Premium quando vuoi più potenza. Nessun vincolo, disdici quando vuoi.",
    free: {
      name: "Free",
      tagline: "Per iniziare ad allenarti con l'AI",
      price: "€0",
      period: "/ per sempre",
      features: [
        "3 piani di allenamento AI al mese",
        "1 piano nutrizionale AI al mese",
        "5 analisi video della tecnica al mese",
        "Libreria esercizi completa",
        "Tracciamento progressi e gamification",
      ],
      cta: "Inizia gratis",
    },
    premium: {
      name: "Premium",
      tagline: "Uso illimitato, risultati senza freni",
      badge: "Consigliato",
      price: "€9,99",
      period: "/ al mese",
      yearlyNote: "oppure €79 all'anno (risparmi il 34%)",
      features: [
        "Piani di allenamento AI illimitati",
        "Piani nutrizionali AI illimitati",
        "Analisi video illimitate",
        "Coach AI 24/7 senza limiti",
        "Storico completo e statistiche avanzate",
        "Supporto prioritario",
      ],
      cta: "Passa a Premium",
    },
    footnote: "Tutti i limiti del piano Free si azzerano all'inizio di ogni mese. Puoi aggiornare o disdire l'abbonamento in qualsiasi momento dal tuo profilo.",
  },

  // ── /chi-siamo → src/app/(marketing)/chi-siamo/page.tsx ──
  chiSiamo: {
    meta: {
      title: `Chi siamo — ${APP_NAME}`,
      description: "La nostra missione: rendere l'allenamento personalizzato e sicuro accessibile a tutti grazie all'intelligenza artificiale.",
    },
    heroTitle: { pre: "Allenamento intelligente, ", highlight: "per tutti" } as HeroTitle,
    heroSubtitle: `${APP_NAME} nasce da un'idea semplice: la guida di un personal trainer esperto non dovrebbe dipendere dal budget o dalla città in cui vivi.`,
    intro: [
      "Abbiamo unito l'intelligenza artificiale e la computer vision per ricreare l'esperienza di un allenatore privato: un piano costruito su misura, un occhio attento sulla tua tecnica e un coach pronto a rispondere a ogni domanda.",
      "Non vendiamo programmi preconfezionati uguali per tutti. Ogni piano viene composto a partire dal tuo profilo — obiettivi, livello, attrezzatura e storico — scegliendo gli esercizi più adatti e scartando quelli rischiosi per te.",
    ],
    values: [
      { title: "Allenamento per tutti", desc: "Un personal trainer privato è un lusso. Vogliamo offrire la stessa qualità di guida a chiunque, ovunque." },
      { title: "Sicurezza prima di tutto", desc: "I nostri piani considerano infortuni e controindicazioni, e l'analisi della tecnica aiuta a prevenire errori che fanno male." },
      { title: "Tecnologia trasparente", desc: "Combiniamo l'AI di Claude e la computer vision di MediaPipe, spiegandoti sempre il perché di ogni consiglio." },
    ],
    ctaTitle: "Unisciti a noi",
    ctaSubtitle: `Inizia il tuo percorso con ${APP_NAME}, gratis.`,
    ctaButton: "Inizia gratis",
  },

  // ── /faq → src/app/(marketing)/faq/page.tsx ──
  faq: {
    meta: {
      title: `FAQ — ${APP_NAME}`,
      description: "Risposte alle domande più frequenti su piani AI, analisi video, abbonamenti e privacy.",
    },
    heroTitle: { pre: "Domande ", highlight: "frequenti" } as HeroTitle,
    heroSubtitle: "Tutto quello che c'è da sapere prima di iniziare.",
    faqs: [
      { q: `${APP_NAME} è davvero gratis?`, a: "Sì. Il piano Free include 3 piani di allenamento AI, 1 piano nutrizionale e 5 analisi video al mese, oltre alla libreria esercizi completa. Passi a Premium solo se ti serve uso illimitato." },
      { q: "Come vengono creati i piani di allenamento?", a: "L'AI di Claude analizza il tuo profilo — obiettivo, livello, attrezzatura, giorni disponibili e storico infortuni — e compone il piano scegliendo gli esercizi più adatti dal nostro database, escludendo quelli controindicati." },
      { q: "Cosa serve per l'analisi video?", a: "Solo la fotocamera del tuo dispositivo. La computer vision di MediaPipe elabora i movimenti in tempo reale per misurare gli angoli articolari e darti feedback su postura ed esecuzione." },
      { q: "Ho bisogno di attrezzatura in palestra?", a: "No. Durante la configurazione indichi cosa hai a disposizione, anche solo il peso corporeo: i piani vengono adattati di conseguenza." },
      { q: "Posso usare l'app senza generare subito un piano?", a: "Certo. Puoi saltare l'onboarding e la generazione del piano in qualsiasi momento e continuare a esplorare gli esercizi e le altre sezioni dell'app." },
      { q: "Posso disdire Premium quando voglio?", a: "Sì, l'abbonamento si disdice in qualsiasi momento dal tuo profilo e resta attivo fino alla fine del periodo già pagato." },
      { q: "I miei dati sono al sicuro?", a: "Trattiamo i tuoi dati con cura e li usiamo solo per personalizzare la tua esperienza di allenamento. L'analisi video avviene per fornirti feedback, non per scopi pubblicitari." },
    ],
    ctaTitle: "Hai ancora dubbi?",
    ctaSubtitle: `Il modo migliore per capire ${APP_NAME} è provarlo.`,
    ctaButton: "Inizia gratis",
  },

  // ── /login → src/app/(auth)/login/page.tsx ──
  login: {
    title: "Bentornato",
    subtitle: `Accedi al tuo account ${APP_NAME}`,
    googleButton: "Continua con Google",
    divider: "oppure",
    emailLabel: "Email",
    emailPlaceholder: "nome@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    submit: "Accedi",
    submitting: "Accesso in corso...",
    forgotPassword: "Password dimenticata?",
    noAccount: "Non hai un account?",
    signupLink: "Registrati gratis",
    errors: {
      invalidCredentials: "Email o password non corretti.",
    },
    validation: {
      emailInvalid: "Email non valida",
      passwordMin: "Minimo 6 caratteri",
    },
  },

  // ── /registrati → src/app/(auth)/registrati/page.tsx ──
  registrati: {
    title: "Inizia ora",
    subtitle: `Crea il tuo account ${APP_NAME} gratuito`,
    googleButton: "Registrati con Google",
    divider: "oppure",
    fields: {
      name: { label: "Nome completo", placeholder: "Mario Rossi" },
      email: { label: "Email", placeholder: "nome@email.com" },
      password: { label: "Password", placeholder: "Minimo 8 caratteri" },
      confirmPassword: { label: "Conferma password", placeholder: "Ripeti la password" },
    },
    submit: "Crea account",
    submitting: "Registrazione...",
    hasAccount: "Hai già un account?",
    loginLink: "Accedi",
    errors: {
      generic: "Errore durante la registrazione.",
    },
    validation: {
      nameMin: "Minimo 2 caratteri",
      emailInvalid: "Email non valida",
      passwordMin: "Minimo 8 caratteri",
      passwordsMismatch: "Le password non coincidono",
    },
  },

  // ── /forgot-password → src/app/(auth)/forgot-password/page.tsx ──
  forgotPassword: {
    title: "Password dimenticata?",
    subtitle: "Inseriamo la tua email e ti invieremo un link per reimpostarla.",
    sentTitle: "Email inviata",
    sentBody: "Se l'indirizzo è registrato, riceverai a breve un'email con il link per reimpostare la password. Controlla anche lo spam.",
    emailLabel: "Email",
    emailPlaceholder: "nome@email.com",
    submit: "Invia link di reset",
    submitting: "Invio in corso...",
    backToLogin: "Torna al login",
    errors: {
      generic: "Errore durante l'invio",
    },
    validation: {
      emailInvalid: "Email non valida",
    },
  },

  // ── /reset-password → src/app/(auth)/reset-password/page.tsx ──
  resetPassword: {
    title: "Nuova password",
    subtitle: "Scegli una password sicura per il tuo account.",
    invalidLink: "Link non valido. Richiedi un nuovo reset.",
    requestReset: "Richiedi reset",
    doneTitle: "Password aggiornata",
    doneBody: "Stai per essere reindirizzato al login...",
    passwordLabel: "Nuova password",
    passwordPlaceholder: "Minimo 8 caratteri",
    confirmPasswordLabel: "Conferma password",
    confirmPasswordPlaceholder: "Ripeti la password",
    submit: "Imposta nuova password",
    submitting: "Salvataggio...",
    errors: {
      tokenMissing: "Token mancante",
      generic: "Errore durante il reset",
    },
    validation: {
      passwordMin: "Minimo 8 caratteri",
      passwordsMismatch: "Le password non coincidono",
    },
  },

  // ── /verify-email → src/app/(auth)/verify-email/page.tsx ──
  verifyEmail: {
    messages: {
      ok: { title: "Email verificata", desc: "Il tuo indirizzo email è stato confermato. Puoi accedere alla dashboard." },
      expired: { title: "Link scaduto", desc: "Il link di verifica è scaduto. Richiedi una nuova email dal tuo profilo." },
      already: { title: "Email già verificata", desc: "Questo indirizzo email è già stato verificato in precedenza." },
      invalid: { title: "Link non valido", desc: "Il link di verifica non è valido. Richiedi una nuova email." },
      pending: { title: "Controlla la tua casella email", desc: "Ti abbiamo inviato un link per verificare il tuo indirizzo. Apri l'email e clicca sul pulsante." },
    },
    dashboardButton: "Vai alla dashboard",
    resendSent: "Email inviata di nuovo. Controlla la casella.",
    resendButton: "Invia nuovo link",
    backToLogin: "Torna al login",
    errors: {
      resend: "Errore invio",
    },
  },

  // ── /onboarding/step1 → src/app/(auth)/onboarding/step1/page.tsx ──
  onboardingStep1: {
    title: "Configuriamo il tuo profilo",
    stepLabel: "Step 1 di 4 — obiettivi e livello",
    goalsTitle: "Qual è il tuo obiettivo principale?",
    goals: [
      { value: "LOSE_WEIGHT", label: "Perdita di peso" },
      { value: "BUILD_MUSCLE", label: "Aumento massa muscolare" },
      { value: "ATHLETIC_PERFORMANCE", label: "Performance atletica" },
      { value: "ENDURANCE", label: "Resistenza cardiovascolare" },
      { value: "FLEXIBILITY", label: "Flessibilità e mobilità" },
      { value: "GENERAL_FITNESS", label: "Forma fisica generale" },
    ],
    levelsTitle: "Qual è il tuo livello?",
    levels: [
      { value: "BEGINNER", label: "Principiante", desc: "< 6 mesi di allenamento" },
      { value: "INTERMEDIATE", label: "Intermedio", desc: "6 mesi — 2 anni" },
      { value: "ADVANCED", label: "Avanzato", desc: "2+ anni regolari" },
      { value: "ATHLETE", label: "Atleta", desc: "Competizioni / atleta agonista" },
    ],
    continue: "Continua",
  },

  // ── /onboarding/step2 → src/app/(auth)/onboarding/step2/page.tsx ──
  onboardingStep2: {
    title: "Attrezzatura disponibile",
    stepLabel: "Step 2 di 4 — cosa hai a disposizione",
    cardTitle: "Seleziona tutto quello che puoi usare",
    equipment: [
      { value: "NONE", label: "Solo peso corporeo" },
      { value: "DUMBBELLS", label: "Manubri" },
      { value: "BARBELL", label: "Bilanciere" },
      { value: "MACHINE", label: "Macchinari palestra" },
      { value: "CABLES", label: "Cavi/Pulegge" },
      { value: "RESISTANCE_BANDS", label: "Elastici" },
      { value: "PULL_UP_BAR", label: "Sbarra trazioni" },
      { value: "BENCH", label: "Panca" },
      { value: "KETTLEBELL", label: "Kettlebell" },
      { value: "FULL_GYM", label: "Palestra completa" },
    ],
    back: "Indietro",
    continue: "Continua",
  },

  // ── /onboarding/step3 → src/app/(auth)/onboarding/step3/page.tsx ──
  onboardingStep3: {
    title: "I tuoi dati",
    stepLabel: "Step 3 di 4 — dati fisici e disponibilità",
    physicalDataTitle: "Dati fisici",
    ageLabel: "Età",
    agePlaceholder: "30",
    weightLabel: "Peso (kg)",
    weightPlaceholder: "75",
    heightLabel: "Altezza (cm)",
    heightPlaceholder: "175",
    genderLabel: "Genere",
    genders: [
      { value: "M", label: "Uomo" },
      { value: "F", label: "Donna" },
      { value: "X", label: "Altro" },
    ],
    daysTitle: "Giorni di allenamento a settimana",
    lifestyleTitle: "Stile di Vita e Storico",
    dietLabel: "Dieta attuale",
    dietOptions: ["Onnivora", "Vegetariana", "Vegana", "Chetogenica", "Mediterranea", "Altro"],
    injuriesLabel: "Problematiche fisiche",
    injuriesPlaceholder: "Es. dolore lombare, problemi al ginocchio sinistro, ecc.",
    sportsLabel: "Sport Pregresso",
    sportOptions: ["Nessuno", "Calcio", "Pallavolo", "Basket", "Nuoto", "Corsa", "Ciclismo", "Palestra", "Arti marziali", "Altro"],
    back: "Indietro",
    continue: "Continua",
  },

  // ── /onboarding/step4 → src/app/(auth)/onboarding/step4/page.tsx ──
  onboardingStep4: {
    title: "Tutto pronto",
    stepLabel: "Step 4 di 4 — riepilogo e generazione piano AI",
    goalLabels: {
      LOSE_WEIGHT: "Perdita di peso",
      BUILD_MUSCLE: "Aumento massa muscolare",
      ATHLETIC_PERFORMANCE: "Performance atletica",
      ENDURANCE: "Resistenza cardiovascolare",
      FLEXIBILITY: "Flessibilità e mobilità",
      GENERAL_FITNESS: "Forma fisica generale",
    },
    levelLabels: {
      BEGINNER: "Principiante",
      INTERMEDIATE: "Intermedio",
      ADVANCED: "Avanzato",
      ATHLETE: "Atleta",
    },
    rows: {
      goal: "Obiettivo",
      level: "Livello",
      equipment: "Attrezzatura",
      age: "Età",
      ageSuffix: "anni",
      weight: "Peso",
      weightSuffix: "kg",
      height: "Altezza",
      heightSuffix: "cm",
      workoutsPerWeek: "Allenamenti / settimana",
      diet: "Dieta",
      sports: "Sport",
      injuries: "Problematiche",
    },
    busyTitle: "Sto preparando il tuo piano…",
    busySubtitle: "Claude sta creando un piano personalizzato per te",
    back: "Indietro",
    generate: "Genera piano e inizia",
    retry: "Riprova generazione",
    continueToDashboard: "Continua alla dashboard",
    errors: {
      profileSave: "Errore salvataggio profilo",
      quotaExceeded: "Hai esaurito le generazioni AI di questo mese. Puoi comunque iniziare e creare un piano più tardi.",
      planGeneration: (status: number, detail: string) => `Errore generazione piano (HTTP ${status}${detail})`,
      planStreamEmpty: "Errore generazione piano: stream vuoto",
      planFormat: "Formato piano non riconosciuto",
      exercisesLoad: "Errore caricamento esercizi",
      planSave: "Errore salvataggio piano",
      unknown: "Errore sconosciuto",
    },
  },

  // ── WelcomeTour → src/components/onboarding/WelcomeTour.tsx ──
  welcomeTour: {
    steps: [
      {
        title: `Benvenuto in ${APP_NAME}! 💪`,
        body: "Il tuo personal trainer AI personale. In pochi minuti puoi: generare piani di allenamento personalizzati, analizzare la tua tecnica con video AI, tracciare nutrizione e progressi.",
        cta: null as { href: string; label: string } | null,
      },
      {
        title: "Genera il tuo piano AI",
        body: "Claude crea un piano basato su obiettivi, livello e attrezzatura. Puoi sostituirlo quando vuoi o crearne uno manuale.",
        cta: { href: "/allenamento/genera-ai", label: "Vai ai piani" } as { href: string; label: string } | null,
      },
      {
        title: "Analizza la tua tecnica",
        body: "Filma una serie con la camera, il nostro sistema 3-in-1 (biomeccanica + AI vision + confronto PT) ti dà feedback personalizzato.",
        cta: { href: "/analisi", label: "Prova l'analisi" } as { href: string; label: string } | null,
      },
      {
        title: "Traccia nutrizione e progressi",
        body: "Calorie, macros, sessioni completate, streak. Tutto in un colpo d'occhio. Il piano nutrizionale AI è incluso.",
        cta: null as { href: string; label: string } | null,
      },
      {
        title: "Tutto pronto!",
        body: "Esplora dalla navbar laterale. Quando completi una sessione apparirà nel feed Community. Buon allenamento!",
        cta: null as { href: string; label: string } | null,
      },
    ],
    close: "Chiudi tour",
    back: "Indietro",
    next: "Avanti",
    start: "Inizia",
    skip: "Salta il tour",
  },
} as const;
