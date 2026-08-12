/**
 * ============================================================================
 *  FONTE UNICA DEI COPY — Motion Insight
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
export const APP_NAME = "Motion Insight";
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
      { href: "/come-funziona", label: "Come funziona" },
      { href: "/per-chi", label: "Per chi" },
      { href: "/prezzi", label: "Prezzi" },
      { href: "/storie", label: "Storie" },
      { href: "/risorse", label: "Risorse" },
    ],
    login: "Accedi",
    signup: "Prova Gratis",
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
          { href: "/scarica", label: "Scarica l'app" },
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
    piva: "P.IVA da inserire",
    tagline: "Fatto con cura in Italia",
  },

  // ── Navbar app loggata → src/components/layout/Navbar.tsx ──
  navbar: {
    // Tab principali (bottom bar mobile = 5, sidebar desktop). `label` breve per la tab-bar,
    // `longLabel` esteso per la sidebar desktop.
    items: [
      { href: "/dashboard", label: "Dashboard", longLabel: "Dashboard" },
      { href: "/allenamento", label: "Sessione", longLabel: "La tua sessione" },
      { href: "/nutrizione", label: "Nutrizione", longLabel: "Il tuo piano nutrizionale" },
      { href: "/esercizi", label: "Libreria", longLabel: "Libreria" },
      { href: "/progressi", label: "Progressi", longLabel: "Progressi" },
    ],
    // Voci nel menu ☰ (mobile) / in coda alla sidebar (desktop).
    menu: [
      { href: "/community", label: "Community", longLabel: "Community" },
      { href: "/profilo", label: "Profilo", longLabel: "Profilo" },
    ],
    admin: { href: "/admin/exercises", label: "Admin" },
    menuLabel: "Menu",
    profileFallback: "Profilo",
    logout: "Esci",
    premium: { title: "Premium", desc: "Analisi illimitate e piani su misura.", cta: "Passa a Premium" },
  },

  // ── Landing → src/app/page.tsx ──
  landing: {
    // ── 1. HERO ──
    heroTitle: { pre: "Alleni da solo? Ora hai un ", highlight: "occhio esperto", post: " che ti guarda." } as HeroTitle,
    heroLead:
      "Motion Insight usa la fotocamera per vedere la tua tecnica e correggerti in tempo reale — così migliori davvero, senza farti male.",
    ctaPrimary: "Trova il tuo percorso",
    ctaSecondary: "Guarda la demo",
    ctaMicro: "Gratis · nessuna carta · 2 minuti",
    heroBadge: "🔒 Il video resta sul tuo telefono.",
    trustBadges: ["Nessun attrezzo", "In tempo reale", "In italiano"],

    // ── 2. PER CHI SEI ──
    segmentsEyebrow: "Per chi è",
    segmentsTitle: { pre: "Da dove vuoi ", highlight: "partire", post: "?" } as HeroTitle,
    segmentsSubtitle: "Ogni corpo e ogni obiettivo hanno il loro percorso. Scegli il tuo.",
    segments: [
      { title: "Corro", desc: "Migliora la corsa e previeni gli infortuni tipici del runner." },
      { title: "Mi alleno a casa", desc: "Nessun attrezzo: bastano fotocamera e spazio per muoverti." },
      { title: "Vado in palestra", desc: "Perfeziona la tecnica sui pesi e progredisci in sicurezza." },
      { title: "Riparto dopo un infortunio", desc: "Movimenti controllati e progressivi, senza forzare." },
      { title: "Ho superato i 50", desc: "Forza, equilibrio e mobilità, con i tuoi tempi." },
      { title: "Torno in forma dopo la gravidanza", desc: "Rientro graduale, core e pavimento pelvico." },
    ],

    // ── 3. TI RICONOSCI? ──
    painEyebrow: "Ti riconosci?",
    painTitle: { pre: "Ti suona ", highlight: "familiare", post: "?" } as HeroTitle,
    painSubtitle: "Non è colpa tua: nessuno ti ha mai detto cosa stavi sbagliando.",
    pains: [
      "Faccio gli esercizi ma non sono sicuro di farli bene.",
      "Ho un fastidio ricorrente a schiena, ginocchia o spalle.",
      "Mi alleno da mesi ma i risultati non arrivano.",
      "Un personal trainer costa troppo per seguirmi sempre.",
    ],

    // ── 4. COME FUNZIONA (i "33 punti" vivono SOLO qui) ──
    stepsEyebrow: "Come funziona",
    stepsTitle: { pre: "Dalla fotocamera al ", highlight: "consiglio", post: ", in un attimo." } as HeroTitle,
    steps: [
      { num: "01", title: "Inquadra e muoviti", desc: "Basta la fotocamera." },
      { num: "02", title: "L'AI legge 33 punti del tuo corpo", desc: "Fino a 30 volte al secondo." },
      { num: "03", title: "Ricevi la correzione", desc: "Angoli, allineamento, profondità." },
      { num: "04", title: "Il piano si adatta", desc: "Ai tuoi progressi." },
    ],

    // ── 5. IL TUO FORM SCORE (il Form Score e "+18%" vivono SOLO qui) ──
    formEyebrow: "Il tuo Form Score",
    formTitle: { pre: "La qualità dei tuoi movimenti, finalmente ", highlight: "misurabile", post: "." } as HeroTitle,
    formText:
      "Non solo peso e ripetizioni: il Form Score ti dà un punteggio oggettivo (0-100) sulla qualità della tua esecuzione, e ti mostra come cresce settimana dopo settimana.",
    formChartLabel: "Form Score",
    formChartDelta: "+18% questo mese",

    // ── 6. SICUREZZA & PRIVACY (on-device vive SOLO qui + FAQ) ──
    privacyEyebrow: "Sicurezza & Privacy",
    privacyTitle: { pre: "La tua privacy è ", highlight: "sacra", post: ". La tua sicurezza anche." } as HeroTitle,
    privacyText:
      "Il video viene elaborato direttamente sul tuo telefono: nessun filmato viene mai salvato o inviato. E ti proponiamo solo esercizi adatti al tuo livello, con progressione graduale.",

    // ── 7. STORIE ──
    storieTitle: { pre: "Le prime storie stanno ", highlight: "arrivando", post: "." } as HeroTitle,
    storieText:
      "Preferiamo mostrarti testimonianze vere — con nome, città e risultato reale — piuttosto che frasi inventate. Le stiamo raccogliendo ora.",
    storieLink: "Vai alle storie",

    // ── 8. PREZZI (3 piani) ──
    pricingEyebrow: "Prezzi",
    pricingTitle: { pre: "Un piano per ", highlight: "ogni obiettivo", post: "." } as HeroTitle,
    plans: [
      { name: "Free", amount: "€0", period: "/ per sempre", desc: "Per iniziare e provare la correzione della forma.", features: ["3 piani AI al mese", "5 analisi video al mese", "Libreria esercizi"], cta: "Crea account", featured: false, badge: null as string | null },
      { name: "Premium", amount: "€9,90", period: "/ mese", desc: "L'esperienza completa, senza limiti.", features: ["Analisi e correzione illimitate", "Piani AI illimitati", "Nutrizione dinamica", "AI Coach 24/7"], cta: "Prova 7 giorni gratis", featured: true, badge: "Più scelto" as string | null },
      { name: "Annuale", amount: "€79,90", period: "/ anno", desc: "Il massimo risparmio: due mesi in regalo.", features: ["Tutto Premium", "Due mesi gratis", "Priorità supporto"], cta: "Passa all'annuale", featured: false, badge: "−33%" as string | null },
    ],
    pricingGuarantee: "Prova 7 giorni gratis · Disdici quando vuoi · Rimborso entro 30 giorni.",

    // ── 9. CTA FINALE (una sola azione) ──
    finalTitle: { pre: "Pronto a ", highlight: "migliorare davvero", post: "?" } as HeroTitle,
    finalSubtitle: "Trova il tuo percorso in 2 minuti. Gratis, nessuna carta.",
    finalCta: "Trova il tuo percorso",

    // Visual hero (riusato da OrganicHeroVisual — non mostra il Form Score)
    scoreCard: {
      tag: "Tecnica · squat",
      title: "Ginocchia in avanti",
      score: 0,
      scoreLabel: "",
      rows: [
        { label: "Allineamento ginocchia", value: "Correggi", chip: true },
        { label: "Profondità", value: "Ok", chip: false },
        { label: "Schiena", value: "Neutra", chip: true },
      ],
    },
    floatCard: { title: "Correzione in tempo reale", sub: "rep 6 · lato sinistro" },
  },

  // ── /per-chi → src/app/(marketing)/per-chi/page.tsx ──
  perChi: {
    meta: {
      title: "Per chi è",
      description: "Runner, allenamento a casa, palestra, post-parto, over 50, rientro da infortunio: trova il tuo percorso con la correzione della forma AI.",
    },
    badge: "Per chi è",
    heroTitle: { pre: "Un percorso per ", highlight: "ogni corpo" } as HeroTitle,
    heroSubtitle: "Qualunque sia il tuo punto di partenza, Motion Insight guarda come ti muovi e adatta allenamento, tecnica e nutrizione a te.",
    segments: [
      { title: "Runner ed endurance", desc: "Previeni gli infortuni da corsa e migliora l'efficienza del gesto: l'AI vede appoggio, postura e simmetria." },
      { title: "Ti alleni a casa", desc: "Nessun attrezzo necessario: la palestra è il tuo salotto. Correzione della forma anche a corpo libero." },
      { title: "Vai in palestra", desc: "Perfeziona la tecnica sui pesi e progredisci in sicurezza, con il carico giusto proposto serie dopo serie." },
      { title: "Neo-mamme (post-parto)", desc: "Rientro graduale e sicuro, con focus su core e pavimento pelvico, ai tuoi ritmi." },
      { title: "Over 50", desc: "Forza, equilibrio e prevenzione con progressioni su misura e movimenti controllati." },
      { title: "Rientro da infortunio", desc: "Movimenti progressivi e controllati: l'AI tiene d'occhio i compensi e ti protegge." },
    ],
    ctaTitle: "Non sai da dove partire?",
    ctaSubtitle: "Il quiz di 2 minuti costruisce il percorso giusto per te.",
    cta: "Calcola il tuo piano gratis",
  },

  // ── /funzionalita → src/app/(marketing)/funzionalita/page.tsx ──
  funzionalita: {
    meta: {
      title: `Funzionalità`,
      description: "Piani AI personalizzati, analisi video della tecnica, coach 24/7, nutrizione e gamification. Tutto in un'unica app.",
    },
    badge: "Funzionalità",
    heroTitle: { pre: "Molto più di una scheda: ", highlight: "un occhio sulla tua tecnica" } as HeroTitle,
    heroSubtitle: `${APP_NAME} unisce intelligenza artificiale e computer vision per darti quello che nessuna app di schede offre: la correzione della forma, in tempo reale.`,
    features: [
      { title: "Correzione forma in tempo reale", desc: "Il differenziale. La fotocamera legge i tuoi movimenti, misura gli angoli e ti dice esattamente cosa correggere mentre ti alleni: overlay, feedback vocale e Form Score." },
      { title: "Piano di allenamento adattivo", desc: "Generato su obiettivo, livello e attrezzatura, si ricalcola in base ai tuoi risultati. Niente schede statiche uguali per tutti." },
      { title: "«Come ti senti oggi?»", desc: "Energico, stanco o poco tempo: l'AI adatta il workout del giorno a energia, tempo e dolori, all'istante." },
      { title: "Feedback vocale in cuffia", desc: "Ti guida ritmo, ripetizioni ed errori senza obbligarti a guardare lo schermo mentre esegui." },
      { title: "Suggerimento carico progressivo", desc: "A fine serie l'AI propone il peso della successiva, per progredire in sicurezza senza indovinare." },
      { title: "Nutrizione dinamica", desc: "Piano su misura sincronizzato con l'allenamento, con «Svuota-Frigo» e sostituzione ingredienti a parità di macro." },
      { title: "Registro progressi + Form Score", desc: "Non solo peso e ripetizioni: la qualità reale della tua esecuzione, misurata e tracciata nel tempo." },
      { title: "AI Coach contestuale", desc: "Risponde con il contesto dei tuoi dati: sostituzioni, dolori, scelte al ristorante. In arrivo." },
    ],
    ctaTitle: "Provalo gratis, oggi",
    ctaSubtitle: "Calcola il tuo piano e prova la correzione della forma in pochi minuti.",
    ctaButton: "Calcola il tuo piano gratis",
  },

  // ── /come-funziona → src/app/(marketing)/come-funziona/page.tsx ──
  comeFunziona: {
    meta: {
      title: `Come funziona`,
      description: "Dal profilo al piano AI all'analisi della tecnica: scopri come Motion Insight ti accompagna in cinque passi.",
    },
    heroTitle: { pre: "Come l'AI ", highlight: "vede la tua tecnica" } as HeroTitle,
    heroSubtitle: "Nessuna magia e nessun sensore: solo la fotocamera del tuo telefono e un'analisi che avviene sul tuo dispositivo. Ecco cosa succede, passo per passo.",
    stepLabel: "Passo",
    steps: [
      { title: "Riprendi la tua esecuzione", desc: "Attivi la fotocamera e ti alleni. Nessun attrezzo, nessun wearable: basta inquadrare il movimento." },
      { title: "L'AI legge 33 punti del corpo", desc: "La computer vision traccia la tua postura fino a 30 volte al secondo e misura angoli, allineamento, profondità e simmetria." },
      { title: "Ricevi il feedback immediato", desc: "Ti dice esattamente cosa correggere — «ginocchia in linea», «schiena troppo inclinata» — con un Form Score oggettivo da 0 a 100." },
      { title: "Il piano si adatta a te", desc: "In base a come vai, come ti senti e quanto tempo hai, il programma successivo si ricalibra automaticamente." },
      { title: "La tua privacy resta tua", desc: "Il video è elaborato sul tuo dispositivo: nessun filmato viene mai salvato o inviato. Conforme al GDPR." },
    ],
    ctaTitle: "Pronto a vedere cosa correggere?",
    ctaButton: "Calcola il tuo piano gratis",
  },

  // ── /prezzi → src/app/(marketing)/prezzi/page.tsx ──
  prezzi: {
    meta: {
      title: `Prezzi`,
      description: "Inizia gratis con piani AI, correzione della forma e nutrizione. Passa a Premium a €9,90 al mese, con prova di 7 giorni gratis.",
    },
    heroTitle: { pre: "Un piano per ", highlight: "ogni obiettivo" } as HeroTitle,
    heroSubtitle: "Inizia gratis e passa a Premium quando vuoi. Prova 7 giorni gratis, disdici quando vuoi, soddisfatto o rimborsato entro 30 giorni.",
    free: {
      name: "Free",
      tagline: "Per iniziare e provare la correzione della forma",
      price: "€0",
      period: "/ per sempre",
      features: [
        "3 piani di allenamento AI al mese",
        "1 piano nutrizionale AI al mese",
        "5 analisi della forma al mese",
        "Libreria esercizi completa",
        "Tracciamento progressi e Form Score",
      ],
      cta: "Inizia gratis",
    },
    premium: {
      name: "Premium",
      tagline: "Correzione e adattamento senza limiti",
      badge: "Più scelto",
      price: "€9,90",
      period: "/ al mese",
      yearlyNote: "oppure €79,90 all'anno (risparmi il 33%)",
      features: [
        "Correzione forma e analisi illimitate",
        "Piani di allenamento AI illimitati e adattivi",
        "Nutrizione dinamica + «Svuota-Frigo»",
        "AI Coach 24/7 con il contesto dei tuoi dati",
        "Storico completo e statistiche avanzate",
        "Supporto prioritario",
      ],
      cta: "Prova 7 giorni gratis",
    },
    footnote: "Prova Premium 7 giorni gratis. I limiti del piano Free si azzerano ogni mese. Disdici o cambia piano quando vuoi dal profilo; soddisfatto o rimborsato entro 30 giorni.",
  },

  // ── /chi-siamo → src/app/(marketing)/chi-siamo/page.tsx ──
  chiSiamo: {
    meta: {
      title: `Chi siamo`,
      description: "La nostra missione: rendere l'allenamento personalizzato e sicuro accessibile a tutti grazie all'intelligenza artificiale.",
    },
    heroTitle: { pre: "Il personal trainer AI ", highlight: "che vede gli errori" } as HeroTitle,
    heroSubtitle: `${APP_NAME} nasce da un'idea semplice: chi si allena da solo non dovrebbe farsi male per una tecnica sbagliata solo perché non ha un occhio esperto accanto.`,
    intro: [
      "Abbiamo unito intelligenza artificiale e computer vision per dare a chiunque quello sguardo: la fotocamera legge come ti muovi e ti dice esattamente cosa correggere, in tempo reale, in italiano — senza sensori e senza mandare via i tuoi video.",
      "Non vendiamo schede preconfezionate uguali per tutti. Ogni piano parte dal tuo profilo — obiettivi, livello, attrezzatura e storico — e si adatta ai tuoi risultati, giorno dopo giorno.",
    ],
    values: [
      { title: "Vedere per prevenire", desc: "La tecnica sbagliata, ripetuta, fa male. Il nostro scopo è mostrartela e correggerla prima che diventi un infortunio." },
      { title: "La tua privacy è sacra", desc: "Il video è elaborato sul tuo dispositivo: nessun filmato viene salvato o inviato. Conforme al GDPR, per scelta." },
      { title: "Concreto, non tecnicismi", desc: "Niente «rete neurale» o «algoritmo proprietario»: ti diciamo cosa correggere e perché, in un italiano chiaro." },
    ],
    ctaTitle: "Unisciti a noi",
    ctaSubtitle: `Inizia il tuo percorso con ${APP_NAME}, gratis.`,
    ctaButton: "Calcola il tuo piano gratis",
  },

  // ── /storie → src/app/(marketing)/storie/page.tsx ──
  storie: {
    meta: {
      title: `Storie`,
      description: "Le storie di chi si allena con Motion Insight: risultati reali, tecnica corretta, infortuni evitati. In arrivo.",
    },
    heroTitle: { pre: "Storie ", highlight: "vere" } as HeroTitle,
    heroSubtitle: "Stiamo raccogliendo le prime testimonianze dai nostri beta tester: persone reali, risultati concreti sul Form Score e sulla tecnica.",
    comingSoonTag: "In arrivo",
    comingSoonTitle: "Le prime storie stanno arrivando",
    comingSoonText: "Preferiamo mostrarti testimonianze autentiche piuttosto che frasi inventate. Le stiamo raccogliendo ora — con nome, città e risultato reale, e con il consenso di chi le condivide.",
    ctaTitle: "Vuoi essere tra i primi?",
    ctaSubtitle: "Prova Motion Insight e raccontaci com'è andata: le storie migliori finiranno qui.",
    ctaButton: "Inizia gratis",
  },

  // ── /risorse → src/app/(marketing)/risorse/page.tsx ──
  risorse: {
    meta: {
      title: `Risorse`,
      description: "Guide pratiche su tecnica, allenamento, nutrizione e prevenzione infortuni. Impara a muoverti meglio con Motion Insight.",
    },
    heroTitle: { pre: "Guide per ", highlight: "muoverti meglio" } as HeroTitle,
    heroSubtitle: "Tecnica, allenamento, nutrizione e prevenzione: articoli pratici per allenarti in sicurezza e con risultati.",
    allLabel: "Tutti",
    readingSuffix: "min di lettura",
    emptyCategory: "Presto altri articoli in questa categoria.",
    backToList: "Tutte le risorse",
    ctaTitle: "Metti in pratica quello che hai letto",
    ctaSubtitle: "Motion Insight ti corregge mentre ti alleni. Provalo gratis.",
    ctaButton: "Calcola il tuo piano gratis",
  },

  // ── /scarica → src/app/(marketing)/scarica/page.tsx ──
  scarica: {
    meta: {
      title: "Scarica l'app",
      description: "Installa Motion Insight dal browser in 10 secondi. Niente store, niente attese. Funziona anche offline.",
    },
    heroTitle: { pre: "Porta Motion Insight ", highlight: "sempre con te" } as HeroTitle,
    heroSubtitle: "Installa l'app direttamente dal browser, in 10 secondi. Niente store, niente attese.",
    note: "Funziona come un'app vera: icona in home, schermo intero, anche offline.",
    installNow: "Installa ora",
    ios: {
      title: "iPhone / iPad (Safari)",
      steps: ["Tocca Condividi ⬆", "Scegli «Aggiungi a Home»", "Apri Motion Insight dall'icona"],
    },
    android: {
      title: "Android (Chrome)",
      steps: ["Apri il menu ⋮", "Scegli «Installa app»", "Apri Motion Insight dall'icona"],
    },
  },

  // ── /faq → src/app/(marketing)/faq/page.tsx ──
  faq: {
    meta: {
      title: `FAQ`,
      description: "Risposte alle domande più frequenti su piani AI, analisi video, abbonamenti e privacy.",
    },
    heroTitle: { pre: "Domande ", highlight: "frequenti" } as HeroTitle,
    heroSubtitle: "Privacy, fotocamera, funzionamento: tutto quello che c'è da sapere prima di iniziare.",
    faqs: [
      { q: "L'AI vede davvero cosa faccio?", a: "Sì. Dal video la computer vision traccia 33 punti del tuo corpo e misura angoli, allineamento, profondità e simmetria, fase per fase. Poi ti dice esattamente cosa correggere, con un Form Score da 0 a 100." },
      { q: "I miei video vengono salvati o inviati?", a: "No. L'elaborazione avviene sul tuo dispositivo: nessun filmato viene mai salvato o inviato ai nostri server. È il nostro principio, ed è conforme al GDPR." },
      { q: "Funziona senza attrezzi, a casa?", a: "Sì. Durante la configurazione indichi cosa hai a disposizione, anche solo il peso corporeo: i piani e l'analisi si adattano di conseguenza." },
      { q: "Serve un telefono potente?", a: "No. Basta uno smartphone recente con una fotocamera e spazio per muoverti. L'analisi è ottimizzata per girare fluida sul dispositivo." },
      { q: "Posso usarlo se sono principiante assoluto?", a: "Assolutamente. I piani partono dal tuo livello e la correzione della forma è pensata proprio per chi vuole imparare la tecnica giusta fin dall'inizio." },
      { q: "Come disdico l'abbonamento?", a: "In qualsiasi momento dal tuo profilo. L'abbonamento resta attivo fino alla fine del periodo già pagato; con la prova di 7 giorni non ti viene addebitato nulla se disdici prima." },
      { q: "Motion Insight sostituisce un medico o un fisioterapista?", a: "No. È uno strumento di supporto all'allenamento: ti aiuta a migliorare la tecnica e a ridurre gli errori, ma non fornisce diagnosi né terapie. In caso di dolore o patologie, consulta un professionista sanitario." },
    ],
    ctaTitle: "Hai ancora dubbi?",
    ctaSubtitle: `Il modo migliore per capire ${APP_NAME} è provarlo.`,
    ctaButton: "Calcola il tuo piano gratis",
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
      oauthOnlyAccount:
        "Questo account è stato creato con Google e non ha una password. Usa \"Continua con Google\", oppure imposta una password da \"Password dimenticata?\".",
      // Codici errore NextAuth (?error= sul redirect)
      OAuthSignin: "Impossibile avviare l'accesso con Google. Riprova tra qualche istante.",
      OAuthCallback: "Google non ha completato l'accesso (risposta non valida). Riprova.",
      AccessDenied: "Accesso negato da Google: l'account non è autorizzato o hai annullato la richiesta.",
      Configuration: "Configurazione dell'accesso non valida lato server. Contatta l'assistenza.",
      OAuthAccountNotLinked: "Questa email è già registrata con un altro metodo di accesso. Usa il metodo originale.",
      oauthGeneric: "Accesso non riuscito. Riprova o usa un altro metodo.",
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

  // ── /dashboard → src/app/(app)/dashboard/page.tsx ──
  dashboard: {
    meta: { title: "Dashboard" },
    greeting: (name: string) => `Ciao, ${name}`,
    greetingFallback: "Atleta",
    subtitle: "Pronto per l'allenamento di oggi?",
    streakSuffix: "gg streak",
    pointsSuffix: "pt",
    statband: {
      workouts: "Allenamenti completati",
      streak: "Streak di costanza",
      streakUnit: "giorni",
      streakRecord: (n: number) => `record ${n}`,
      points: "Punti totali",
      pointsUnit: "pt",
    },
    activePlanTitle: "Piano Attivo",
    goToWorkout: "Vai all'allenamento",
    workoutsPerWeekSuffix: "x/sett",
    sessionsCompleted: (n: number) => `${n} sessioni completate`,
    restDay: "Riposo",
    exercisesCount: (n: number) => `${n} esercizi`,
    noActivePlan: "Nessun piano attivo",
    createPlanAi: "Crea piano con AI",
    consistencyTitle: "Costanza ultimi 90 giorni",
    seeAll: "Vedi tutto →",
    recentSessionsTitle: "Sessioni Recenti",
    noSessions: "Nessuna sessione ancora. Inizia il tuo allenamento!",
    freeSession: "Sessione libera",
    imbalancesTitle: "Squilibri muscolari",
    mapLink: "Mappa →",
    goodBalance: "Buon equilibrio 💪",
    quickActionsTitle: "Azioni rapide",
    quickActions: [
      { label: "Analizza esercizio", desc: "Analisi video AI" },
      { label: "Vai alla Libreria", desc: "Tutti gli esercizi" },
    ],
    lastAchievementsTitle: "Ultimi Achievement",
    pointsLabel: (n: number) => `+${n} punti`,
  },

  // ── DailyMissionCard → src/components/dashboard/DailyMissionCard.tsx ──
  dailyMission: {
    missionDoneTitle: "Missione completata! 🎉",
    missionTitle: "La tua missione di oggi",
    tasksProgressAria: (done: number) => `${done} di 3 task completati`,
    startHere: "Inizia da qui",
    ctaSee: "Vedi",
    ctaStart: "Inizia",
    ctaCreate: "Crea",
    ctaLog: "Logga",
    checkinQuestion: "Come ti senti oggi?",
    checkinFeeling: (emoji: string) => `Oggi ti senti ${emoji}`,
    moodAria: (mood: number) => `Mood ${mood}`,
    checkinSaveError: "Errore salvataggio check-in",
  },

  // ── /allenamento → src/app/(app)/allenamento/page.tsx ──
  allenamento: {
    goalLabels: {
      WEIGHT_LOSS: "Perdita di peso",
      MUSCLE_GAIN: "Aumento massa",
      STRENGTH: "Forza",
      ENDURANCE: "Resistenza",
      FLEXIBILITY: "Flessibilità",
      GENERAL_FITNESS: "Forma generale",
      SPORT_PERFORMANCE: "Performance sportiva",
    },
    title: "La tua sessione",
    subtitle: "Il tuo allenamento, sessione per sessione.",
    newPlan: "Nuovo piano",
    emptyTitle: "Nessun piano ancora",
    emptySubtitle: "Crea un piano manualmente o generane uno con l'AI",
    generateWithAi: "Genera con AI",
    createManually: "Crea manualmente",
    activePlanSection: "Piano Attivo",
    otherPlansSection: "Altri Piani",
    generateNewWithAi: "Genera nuovo piano con AI",
    activeBadge: "Attivo",
    deletePlanAria: "Elimina piano",
    weeksSuffix: "settimane",
    workoutsPerWeekSuffix: "x/settimana",
    exercisesSuffix: "esercizi",
    moreDays: (n: number) => `+${n} altri`,
    goToPlan: "Vai al piano",
    setActive: "Imposta attivo",
    sessionEyebrow: "Piano attivo",
    dayExercises: (n: number) => `${n} eserciz${n === 1 ? "io" : "i"}`,
    restDayLabel: "Riposo",
    startDayCta: "Inizia",
    openFullSession: "Apri la sessione completa",
    plansSectionTitle: "I tuoi piani",
  },

  // ── /allenamento/[id] → src/app/(app)/allenamento/[id]/page.tsx ──
  allenamentoDettaglio: {
    meta: { title: "Piano di Allenamento" },
    difficultyLabels: {
      BEGINNER: "Principiante",
      INTERMEDIATE: "Intermedio",
      ADVANCED: "Avanzato",
      EXPERT: "Expert",
    },
    backToPlans: "I miei piani",
    activeBadge: "Attivo",
    weeksSuffix: "settimane",
    workoutsPerWeekSuffix: "x/settimana",
    minutesPerSession: (n: number) => `~${n} min/sessione`,
    dayLabel: (n: number, name: string) => `Giorno ${n}: ${name}`,
    startDay: "Inizia",
    restDayNote: "Giorno di riposo — recupero attivo consigliato",
    noExercises: "Nessun esercizio aggiunto",
    restPrefix: "rest",
    hintPre: "Seleziona il giorno che vuoi allenare e premi ",
    hintBold: "Inizia",
    hintPost: " per avviare la sessione guidata.",
    analyzeAction: "Analisi avanzata",
    statusTitle: "Il tuo stato",
    statusRisk: "Rischio infortuni",
    statusSuggestion: "Da tenere d'occhio",
    statusGoodBalance: "Buon equilibrio muscolare.",
    statusNoData: "Fai un'analisi per vedere qui il tuo stato e i rischi.",
    statusDisclaimer: "Avvisi di allenamento, non diagnosi mediche.",
  },

  // ── /allenamento/[id]/sessione → src/app/(app)/allenamento/[id]/sessione/page.tsx ──
  allenamentoSessione: {
    motivationalQuotes: [
      "Recupera, conquista.",
      "Il riposo costruisce il muscolo.",
      "Respira. Ricarica.",
      "La prossima serie è la tua.",
      "Focus sul prossimo rep.",
      "L'energia torna. Tienila pronta.",
      "Un set alla volta.",
      "Resta presente.",
      "Il muscolo cresce quando recuperi.",
      "Sei più forte di un minuto fa.",
    ],
    dayNotFound: "Giorno non trovato",
    noExercisesError: "Nessun esercizio per questo giorno.",
    backToPlan: "Torna al piano",
    achievementName: "Sessione completata",
    completedLabel: "Sessione completata",
    completedTitle: "Ottimo lavoro 💪",
    statDuration: "Durata",
    statExercises: "Esercizi",
    statTotalSets: "Set tot.",
    musclesHitToday: "Muscoli colpiti oggi",
    dashboard: "Dashboard",
    plan: "Piano",
    exit: "Esci",
    rest: "Recupero",
    paused: "in pausa",
    resume: "Riprendi",
    pause: "Pausa",
    skip: "Salta",
    repsUnit: "reps",
    seriesLabel: (current: number, total: number) => `Serie ${current} di ${total}`,
    setCompleted: "Serie completata",
    analysisToggleLabel: "Analisi avanzata",
    analysisToggleHint: "Attivala per farti analizzare la tecnica di questo esercizio; lasciala spenta per eseguire e basta.",
    analyzeCta: "Analizza questo esercizio",
    upcoming: "Prossimi",
    progressAria: "Avanzamento sessione",
    setDotAria: (n: number, done: boolean) => (done ? `Serie ${n} completata` : `Serie ${n} da fare`),
    restCountdownAria: "Secondi di recupero rimanenti",
    weightLabel: "Carico (kg)",
    repsLabel: "Ripetizioni",
    lastLoadHint: (kg: number, reps: number | null) => `Ultimo: ${kg} kg${reps != null ? ` × ${reps}` : ""}`,
  },

  // ── /allenamento/nuovo → src/app/(app)/allenamento/nuovo/page.tsx ──
  allenamentoNuovo: {
    goals: [
      { value: "LOSE_WEIGHT", label: "Perdita di peso" },
      { value: "BUILD_MUSCLE", label: "Massa muscolare" },
      { value: "ATHLETIC_PERFORMANCE", label: "Performance" },
      { value: "ENDURANCE", label: "Resistenza" },
      { value: "FLEXIBILITY", label: "Flessibilità" },
      { value: "GENERAL_FITNESS", label: "Forma generale" },
    ],
    dayNameDefault: (n: number) => `Giorno ${n}`,
    backToPlans: "Tutti i piani",
    title: "Nuovo piano manuale",
    subtitlePre: "Costruisci il tuo piano scegliendo esercizi giorno per giorno. In alternativa puoi ",
    subtitleLink: "generarlo con l'AI",
    subtitlePost: ".",
    saveError: "Errore salvataggio",
    detailsTitle: "Dettagli piano",
    nameLabel: "Nome del piano",
    namePlaceholder: "Es. Forza base 4 settimane",
    weeksLabel: "Settimane",
    daysPerWeekLabel: "Giorni / sett.",
    goalLabel: "Obiettivo",
    daysSectionTitle: "Giorni del piano",
    addDay: "Aggiungi giorno",
    dayNamePlaceholder: "Nome giorno",
    restDay: "Riposo",
    noDayExercises: "Nessun esercizio. Aggiungine almeno uno dal menu sotto.",
    unknownExercise: "?",
    repUnit: "rep",
    addExercisePlaceholder: "+ Aggiungi esercizio...",
    cancel: "Annulla",
    createPlan: "Crea piano",
    removeDayAria: "Rimuovi giorno",
    removeExerciseAria: "Rimuovi esercizio",
  },

  // ── /allenamento/genera-ai → src/app/(app)/allenamento/genera-ai/page.tsx ──
  generaAi: {
    goals: [
      { value: "LOSE_WEIGHT", label: "Perdita di peso", emoji: "🔥" },
      { value: "BUILD_MUSCLE", label: "Aumento massa muscolare", emoji: "💪" },
      { value: "ATHLETIC_PERFORMANCE", label: "Performance atletica", emoji: "🏋️" },
      { value: "ENDURANCE", label: "Resistenza cardiovascolare", emoji: "🏃" },
      { value: "FLEXIBILITY", label: "Flessibilità e mobilità", emoji: "🧘" },
      { value: "GENERAL_FITNESS", label: "Forma fisica generale", emoji: "⚡" },
    ],
    levels: [
      { value: "BEGINNER", label: "Principiante", desc: "< 6 mesi di allenamento" },
      { value: "INTERMEDIATE", label: "Intermedio", desc: "6 mesi — 2 anni" },
      { value: "ADVANCED", label: "Avanzato", desc: "2+ anni regolari" },
    ],
    equipment: [
      { value: "BARBELL", label: "Bilanciere" },
      { value: "DUMBBELLS", label: "Manubri" },
      { value: "MACHINE", label: "Macchinari palestra" },
      { value: "CABLES", label: "Cavi/Pulegge" },
      { value: "BODYWEIGHT", label: "Solo peso corporeo" },
      { value: "RESISTANCE_BANDS", label: "Elastici" },
      { value: "PULL_UP_BAR", label: "Sbarra trazioni" },
      { value: "BENCH", label: "Panca" },
    ],
    errors: {
      planFormat: "Formato piano non riconosciuto",
      quotaExceeded: "Hai esaurito le generazioni AI di questo mese.",
      tooManyRequests: "Troppe richieste. Riprova tra un minuto.",
      planGeneration: "Errore generazione piano",
      emptyResponse: "Risposta vuota dal server",
      exercisesLoad: "Errore caricamento esercizi",
      planSave: "Errore salvataggio piano",
      unknown: "Errore sconosciuto",
    },
    busyTitle: "Claude sta generando il tuo piano...",
    busySubtitle: "L'AI sta creando un piano personalizzato per i tuoi obiettivi",
    title: "Genera Piano con AI",
    subtitle: "Claude creerà un piano personalizzato in pochi secondi",
    goalQuestion: "Qual è il tuo obiettivo principale?",
    levelQuestion: "Qual è il tuo livello?",
    daysQuestion: "Quante volte a settimana?",
    equipmentQuestion: "Attrezzatura disponibile",
    notesQuestion: "Note aggiuntive (opzionale)",
    notesPlaceholder: "Es: dolore alla spalla destra, preferisco non fare corsa, ho 45-60 minuti a sessione...",
    generateButton: "Genera piano personalizzato",
  },

  // ── /nutrizione → src/app/(app)/nutrizione/page.tsx ──
  nutrizione: {
    mealLabels: {
      BREAKFAST: "Colazione",
      LUNCH: "Pranzo",
      DINNER: "Cena",
      SNACK: "Spuntino",
      PRE_WORKOUT: "Pre-allenamento",
      POST_WORKOUT: "Post-allenamento",
    },
    title: "Il tuo piano nutrizionale",
    subtitle: "Il tuo piano e cosa mangi ogni giorno.",
    matchTitle: "Piano consigliato per te",
    matchSubtitle: "Dal pool dei nostri professionisti, in base ai tuoi obiettivi.",
    matchMacros: "Target indicativi",
    recipesTitle: "Ricette per te",
    recipesHint: "Idee di ricette adatte ai tuoi obiettivi e alla tua alimentazione.",
    recipesCta: "Genera ricette",
    recipesLoading: "Sto pensando…",
    recipesError: "Generazione non riuscita. Riprova.",
    add: "Aggiungi",
    macros: {
      calories: "Calorie",
      protein: "Proteine",
      carbs: "Carboidrati",
      fat: "Grassi",
    },
    caloriesUnit: "kcal",
    gramsUnit: "g",
    newFoodTitle: "Nuovo alimento",
    foodNamePlaceholder: "Nome alimento *",
    caloriesPlaceholder: "Calorie *",
    proteinPlaceholder: "Proteine (g)",
    carbsPlaceholder: "Carboidrati (g)",
    fatPlaceholder: "Grassi (g)",
    cancel: "Annulla",
    macroSummary: (p: number, c: number, f: number) => `P:${p}g C:${c}g G:${f}g`,
    emptyDay: "Nessun alimento registrato per questo giorno",
    prevDayAria: "Giorno precedente",
    nextDayAria: "Giorno successivo",
  },

  // ── /ai-coach → src/app/(app)/ai-coach/page.tsx ──
  aiCoach: {
    suggestions: [
      "Come miglioro la mia tecnica nello squat?",
      "Quante proteine dovrei mangiare al giorno?",
      "Ho dolore alla spalla, posso allenarmi?",
      "Crea un piano di recupero post-allenamento",
    ],
    welcomeMessage:
      "Ciao! Sono il tuo AI Coach personale 💪 Sono qui per rispondere a qualsiasi domanda su allenamento, nutrizione, recupero o tecnica degli esercizi. Come posso aiutarti oggi?",
    errorMessage: "Mi dispiace, si è verificato un errore. Riprova.",
    genericError: "Errore",
    title: "AI Coach",
    subtitle: "Il tuo personal trainer AI disponibile 24/7",
    inputPlaceholder: "Scrivi un messaggio...",
    sendAria: "Invia messaggio",
  },

  // ── /progressi → src/app/(app)/progressi/page.tsx ──
  progressi: {
    title: "I miei Progressi",
    subtitle: "Tieni traccia dei tuoi risultati",
    formScoreTitle: "Qualità dei tuoi movimenti",
    formScoreSubtitle: "L'andamento del Form Score delle tue analisi.",
    formScoreDelta: (d: number) => `${d >= 0 ? "+" : ""}${d} rispetto alla prima analisi`,
    formScoreTooltip: (n: number) => `Form Score ${n}`,
    formScoreEmpty: "Fai la tua prima analisi e qui vedrai crescere il tuo Form Score.",
    weightTitle: "Peso e misure",
    weightSubtitle: "Facoltativi. Aggiungili quando vuoi per seguire l'andamento.",
    weightLabel: "Peso (kg)",
    waistLabel: "Vita (cm)",
    weightSave: "Salva misura",
    weightAdd: "Aggiungi misura",
    weightEmpty: "Ancora nessuna misura registrata.",
    weightTooltip: (n: number) => `${n} kg`,
    stats: {
      totalSessions: "Sessioni totali",
      totalMinutes: "Minuti totali",
      currentStreak: "Streak attuale",
      totalPoints: "Punti totali",
    },
    weeklyChartTitle: "Sessioni ultimi 7 giorni",
    sessionsTooltip: (n: number) => `${n} sessioni`,
    minutesTrendTitle: "Minuti allenamento (ultimi 30 giorni)",
    minutesTooltip: (n: number) => `${n} min`,
    insightsTitle: "I tuoi insight",
    insightDaysActive: "Giorni attivi (30g)",
    insightAvgMinPerSession: "Min/sessione media",
    insightAvgMinPerWeek: "Min/sett. media (8 sett.)",
    insightAvgFeeling: "Feeling medio (1-5)",
    weeklyVolumeTitle: "Volume settimanale (ultime 8 settimane)",
    achievementsTitle: (n: number) => `Achievement sbloccati (${n})`,
    emptyState: "Completa la prima sessione per vedere i tuoi progressi!",
  },

  // ── /esercizi → src/app/(app)/esercizi/page.tsx ──
  esercizi: {
    meta: { title: "Libreria" },
    title: "Libreria",
    countAvailable: (n: number) => `${n} esercizi disponibili`,
    searchPlaceholder: "Cerca esercizio...",
    allFilter: "Tutti",
    noResults: "Nessun esercizio trovato per i filtri selezionati.",
    videoBadge: "Video",
  },

  // ── /esercizi/[slug] → src/app/(app)/esercizi/[slug]/page.tsx ──
  esercizioDettaglio: {
    fallbackTitle: "Esercizio",
    backToExercises: "Torna agli esercizi",
    videoComingSoon: "Video disponibile a breve",
    analyzeWithAi: "Analizza la mia esecuzione con AI",
    executionVideoLabel: "Esecuzione del professionista",
    explanationVideoLabel: "Consigli del professionista",
    activateAdvancedAnalysis: "Attiva analisi avanzata",
    statCalPerMin: "Cal/min",
    statAiRules: "Regole AI",
    statEquipment: "Attrezzature",
    equipmentNeeded: "Attrezzatura necessaria",
    instructionsTitle: "Istruzioni di Esecuzione",
    biomechanicalTitle: "Parametri Biomeccanici AI",
    biomechanicalIntro: "Il sistema AI monitora questi parametri durante l'analisi in tempo reale:",
    professionalNotesTitle: "Note del Professionista",
    loadHistoryTitle: "I tuoi carichi",
    loadHistoryBest: (kg: number, reps: number | null, sets: number) =>
      `${kg} kg${reps != null ? ` × ${reps}` : ""} · ${sets} serie`,
  },

  // ── /abbonamento → src/app/(app)/abbonamento/page.tsx ──
  abbonamento: {
    statusLabels: {
      FREE: "Free",
      TRIALING: "Trial",
      ACTIVE: "Attivo",
      PAST_DUE: "Pagamento in sospeso",
      CANCELED: "Cancellato",
    },
    freeFeatures: [
      { ok: true, label: "3 piani AI al mese" },
      { ok: true, label: "5 analisi video al mese" },
      { ok: true, label: "1 piano nutrizionale AI al mese" },
      { ok: true, label: "Tracking allenamenti illimitato" },
      { ok: false, label: "AI Coach personalizzato" },
      { ok: false, label: "Esportazione report PDF" },
    ],
    premiumFeatures: [
      { ok: true, label: "Piani AI illimitati" },
      { ok: true, label: "Analisi video illimitate" },
      { ok: true, label: "Piano nutrizionale AI illimitato" },
      { ok: true, label: "Tracking allenamenti illimitato" },
      { ok: true, label: "AI Coach personalizzato 24/7" },
      { ok: true, label: "Esportazione report PDF" },
      { ok: true, label: "Priorità in coda AI" },
    ],
    genericError: "Errore",
    title: "Abbonamento",
    subtitle: "Sblocca tutte le funzionalità AI con un abbonamento Premium.",
    successFlash: "Abbonamento attivato. Potrebbe servire qualche secondo per aggiornare lo stato.",
    cancelFlash: "Checkout annullato. Nessuna spesa effettuata.",
    yourPlanTitle: "Il tuo piano",
    planMonthly: "Mensile",
    planYearly: "Annuale",
    cancelAtPeriodEnd: "Il tuo abbonamento è impostato per cancellarsi alla fine del periodo corrente.",
    autoRenew: "Il tuo abbonamento si rinnoverà automaticamente.",
    nextRenewalPre: " Prossimo rinnovo: ",
    statusGranted: "Premium omaggio",
    grantedNote: "Hai un accesso Premium in omaggio attivo",
    grantedUntilPre: " fino al ",
    managePlan: "Gestisci abbonamento",
    freePlanNote: "Stai usando il piano Free. Scegli un piano qui sotto per sbloccare tutto.",
    freeTitle: "Free",
    freePrice: "€0",
    freePeriod: "per sempre",
    premiumTitle: "Premium",
    premiumPrice: "€9.99",
    premiumPeriod: "al mese",
    recommendedBadge: "Consigliato",
    subscribeMonthly: "Abbonati — €9.99/mese",
    subscribeYearly: "Annuale — €79/anno (risparmi 34%)",
    footnote: "Pagamenti gestiti da Stripe. Puoi cancellare in qualsiasi momento dal portale clienti.",
  },

  // ── /profilo → src/app/(app)/profilo/page.tsx ──
  profilo: {
    levelLabels: {
      BEGINNER: "Principiante",
      INTERMEDIATE: "Intermedio",
      ADVANCED: "Avanzato",
      EXPERT: "Expert",
    },
    goalLabels: {
      WEIGHT_LOSS: "Perdita di peso",
      MUSCLE_GAIN: "Aumento massa",
      STRENGTH: "Forza",
      ENDURANCE: "Resistenza",
      FLEXIBILITY: "Flessibilità",
      GENERAL_FITNESS: "Forma generale",
      SPORT_PERFORMANCE: "Performance sportiva",
    },
    title: "Il mio Profilo",
    subtitle: "Gestisci le tue informazioni personali",
    stats: {
      points: "Punti",
      streak: "Streak",
      longestStreak: "Record streak",
    },
    accountTitle: "Account",
    editTitle: "Modifica informazioni",
    nameLabel: "Nome",
    namePlaceholder: "Il tuo nome",
    ageLabel: "Età",
    agePlaceholder: "30",
    weightLabel: "Peso (kg)",
    weightPlaceholder: "75",
    heightLabel: "Altezza (cm)",
    heightPlaceholder: "175",
    saved: "Salvato!",
    save: "Salva modifiche",
    visibilityTitle: "Visibilità profilo",
    visibilityDesc:
      "Profilo pubblico: i tuoi allenamenti completati appaiono nel feed Community. Profilo privato: niente di visibile agli altri utenti.",
    visibilityPublic: "Pubblico",
    visibilityPrivate: "Privato",
    dataTitle: "I miei dati",
    dataDesc:
      "Scarica una copia completa di tutti i tuoi dati in formato JSON, come previsto dal GDPR (diritto alla portabilità).",
    dataDownload: "Scarica i miei dati (.json)",
    logoutTitle: "Esci dall'account",
    logoutDesc: "Verrai disconnesso da tutti i dispositivi",
    logout: "Esci",
    deleteError: "Errore eliminazione",
    deleteTitle: "Elimina account",
    deleteDesc: "Operazione irreversibile. Tutti i tuoi dati (piani, sessioni, analisi, log) saranno eliminati definitivamente.",
    deleteConfirmKeyword: "ELIMINA",
    deleteConfirmPre: "Per confermare, scrivi ",
    deleteConfirmPost: " e inserisci la tua password.",
    deleteConfirmTextPlaceholder: "ELIMINA",
    deletePasswordPlaceholder: "La tua password",
    deleteConfirm: "Conferma eliminazione",
    cancel: "Annulla",
    abbonamento: { title: "Abbonamento", desc: "Il tuo piano e la gestione.", cta: "Gestisci abbonamento" },
    retakeQuiz: { title: "Rifai il quiz", desc: "Aggiorna obiettivi, attrezzatura e preferenze.", cta: "Rifai il quiz" },
    documenti: {
      title: "Documenti",
      desc: "Carica la scheda del tuo trainer o nutrizionista (PDF o immagine): la useremo per adattare i tuoi piani. Solo file di allenamento o nutrizione.",
      kindFitness: "Allenamento",
      kindNutrition: "Nutrizione",
      upload: "Carica documento",
      uploading: "Caricamento…",
      empty: "Nessun documento caricato.",
      deleteAria: "Elimina documento",
      error: "Caricamento non riuscito.",
    },
    noteMediche: {
      title: "Note mediche",
      desc: "Hai condizioni di cui tenere conto? Scrivicele qui (facoltativo). Le useremo solo per rendere l'allenamento più adatto a te.",
      placeholder: "Es. problemi al ginocchio destro, pressione alta…",
      disclaimer: "Bastano poche parole: non inserire referti o documenti medici.",
      save: "Salva note",
      saved: "Salvato!",
    },
    guida: {
      title: "Come funziona Motion Insight",
      intro: "Tutto quello che puoi fare, in breve.",
      items: [
        { q: "Come faccio un'analisi?", a: "Vai su un esercizio, attiva l'analisi avanzata ed eseguilo per venti secondi davanti alla fotocamera. In un paio di minuti hai il tuo referto." },
        { q: "Come leggo il punteggio?", a: "È da 0 a 100 e riassume tre analisi diverse del tuo movimento. Serve a capire a che punto sei, non a darti un voto." },
        { q: "Come si esegue una sessione?", a: "Nella tua sessione trovi gli esercizi del giorno. Premi Esegui; se vuoi il riscontro tecnico, attiva prima l'analisi avanzata." },
        { q: "Come chiedo una revisione del piano?", a: "In fondo alla Sessione o al Piano nutrizionale: scrivi cosa vuoi cambiare e la invii a un professionista." },
        { q: "Dove finiscono i miei video?", a: "Restano legati solo al tuo account, non li vede nessun altro e li elimini quando vuoi dal Profilo." },
      ],
    },
  },

  // ── Richiesta revisione → src/components/RevisionRequestForm.tsx ──
  revisione: {
    title: "Chiedi una revisione",
    descFitness: "Il piano non ti convince? Scrivi cosa vorresti cambiare e lo giriamo a un nostro professionista.",
    descNutrition: "Vuoi aggiustare qualcosa nel piano nutrizionale? Scrivici cosa e lo giriamo a un nostro nutrizionista.",
    placeholder: "Scrivi cosa vorresti cambiare…",
    cta: "Invia richiesta",
    sent: "Richiesta inviata. Ti rispondiamo presto.",
    error: "Invio non riuscito. Riprova.",
  },

  // ── /community → src/app/(app)/community/page.tsx ──
  community: {
    typeLabels: {
      WORKOUT_SHARE: "Allenamento",
      ACHIEVEMENT: "Achievement",
      PROGRESS_PHOTO: "Foto progressi",
      CHALLENGE_COMPLETION: "Sfida",
    },
    unknownInitials: "??",
    title: "Community",
    subtitle:
      `Attività recenti della community ${APP_NAME}. I tuoi allenamenti completati appaiono automaticamente nel feed — puoi disattivarli rendendo il profilo privato dalle impostazioni.`,
    emptyTitle: "Nessun post ancora",
    emptySubtitle: "Completa un allenamento e sarai il primo!",
    anonymous: "Anonimo",
    loadMore: "Carica altri",
    composerPlaceholder: "Condividi qualcosa con la community…",
    post: "Pubblica",
    commentPlaceholder: "Scrivi un commento…",
    addComment: "Invia",
    noComments: "Ancora nessun commento.",
  },

  // ── /analisi → src/app/(app)/analisi/page.tsx ──
  analisi: {
    meta: { title: "Analisi AI" },
    title: "Analisi AI in Tempo Reale",
    subtitle: "Seleziona un esercizio, filma la tua esecuzione e ricevi feedback personalizzato da 3 sistemi AI in parallelo.",
    systems: [
      { pct: "33%", title: "Biomeccanico", desc: "Misura angoli articolari in tempo reale e li confronta con soglie definite da professionisti" },
      { pct: "33%", title: "AI Expert", desc: "Claude analizza l'esecuzione come un personal trainer con 15 anni di esperienza" },
      { pct: "34%", title: "Confronto Video", desc: "Confronta la tua esecuzione con quella del professionista per identificare differenze" },
    ],
    listTitle: (n: number) => `Esercizi con Analisi AI (${n})`,
    aiReadyBadge: "AI ready",
  },

  // ── /analisi/sessione → src/app/(app)/analisi/sessione/page.tsx ──
  analisiSessione: {
    exerciseNotFound: "Esercizio non trovato.",
    uploadFailed: "Upload fallito",
    analysisFailed: "Analisi fallita",
    processingError: "Errore durante l'elaborazione",
    noExerciseSelected: "Seleziona un esercizio dalla pagina Analisi AI.",
    backToExercises: "Torna agli esercizi",
    notCompletedTitle: "Analisi non completata",
    retry: "Riprova",
    exit: "Esci",
    uploadingTitle: "Carico il video...",
    analyzingTitle: "Analisi in corso...",
    steps: { upload: "Upload", layers: "L1+L2+L3", synthesis: "Sintesi" },
    uploadingDesc: "Stiamo trasferendo il tuo video al server.",
    analyzingDesc: "I 3 sistemi AI stanno elaborando: questo richiede 1-2 minuti.",
    loadingExercise: "Caricamento...",
    phaseIdle: "Pronto a iniziare",
    phaseCountdown: "Posizionati di fronte alla camera",
    phaseRecording: "Registrazione in corso",
    back: "← Indietro",
    cameraInactive: "Fotocamera non attiva",
    proVideoUnavailable: "Video PT non disponibile",
    start: "Inizia",
  },

  // ── /analisi/report/[id] → src/app/(app)/analisi/report/[id]/page.tsx ──
  analisiReport: {
    meta: { title: "Report Analisi" },
    errorMessage: "Il sistema non è riuscito a completare l'analisi del video.",
    processingTitle: "Analisi in corso...",
    steps: { l1: "L1 Biomeccanica", l2: "L2 PT Expert", l3: "L3 Confronto" },
    processingDesc: "Stiamo elaborando il tuo video. Questo processo richiede 1-2 minuti. La pagina si aggiornerà automaticamente.",
    backToDashboard: "Torna alla dashboard",
    newAnalysis: "Nuova analisi",
    reportTitle: (name: string) => `Report: ${name}`,
    completedOn: (date: string) => `Analisi completata il ${date}`,
    outOf100: "su 100",
    overallScore: "Punteggio Complessivo",
    scoreCards: {
      biomechanics: "Biomeccanica",
      ptVision: "PT Vision",
      ptComparison: "Confronto PT",
    },
    safetyAlert: (level: string) => `Allerta sicurezza — livello ${level}`,
    affectedAreas: (areas: string) => `Aree coinvolte: ${areas}`,
    coachJudgmentTitle: "Giudizio del Coach",
    improvementAreasTitle: "Aree da Migliorare",
    strengthsTitle: "Punti di Forza",
    biomechanicalFeedbackTitle: "Feedback Biomeccanico",
    proComparisonTitle: "Confronto con Professionista",
    syncedVideosTitle: "Video sincronizzati",
    repeatAnalysis: "Ripeti l'analisi",
    otherExercises: "Altri esercizi",
  },

  // ── /admin/users → src/app/(app)/admin/users/page.tsx + src/components/admin/UsersTable.tsx ──
  adminUsers: {
    title: "Utenti",
    subtitle: "Gestione utenti registrati, promozioni admin, premium gratuiti.",
    table: {
      loading: "Caricamento…",
      updating: "Aggiornamento…",
      metricTotal: "Utenti totali",
      metricPremium: "Premium",
      metricAdmin: "Admin",
      searchPlaceholder: "Cerca email o nome...",
      filters: { all: "Tutti", premium: "Premium", free: "Free", admin: "Admin" },
      badgeAdmin: "ADMIN",
      badgePremium: "PREMIUM",
      badgeGranted: "OMAGGIO",
      noName: "—",
      meta: (date: string, sessions: number) => `iscritto ${date} · ${sessions} sessioni`,
      revokeAdmin: "Revoca admin",
      makeAdmin: "Rendi admin",
      grantPremium: "Premium 30g",
      detail: "Dettaglio",
      actionFailed: (label: string, error: string) => `${label} fallita: ${error}`,
      unknownError: "errore sconosciuto",
      revokeAdminLabel: "Revoca admin",
      promoteAdminLabel: "Promozione admin",
      grantPremiumLabel: "Grant Premium 30g",
      pageInfo: (page: number, total: number) => `Pagina ${page} di ${total}`,
      prev: "← Prev",
      next: "Next →",
    },
  },

  // ── /admin/subscriptions → src/app/(app)/admin/subscriptions/page.tsx + src/components/admin/SubscriptionsTable.tsx ──
  adminSubscriptions: {
    title: "Abbonamenti",
    subtitle: "Stato subscription Stripe e metriche aggregate.",
    table: {
      loading: "Caricamento…",
      updating: "Aggiornamento…",
      metricPremiumActive: "Premium attivi",
      metricMrr: "MRR stimato",
      metricChurn: "Churn 30g",
      metricRenewals: "Rinnovi 7g",
      filterAll: "Tutti",
      periodUntil: (date: string) => `Periodo fino ${date}`,
      stripeLink: "Stripe →",
      pageInfo: (page: number, total: number) => `Pagina ${page} di ${total}`,
      prev: "← Prev",
      next: "Next →",
    },
  },

  // ── /admin/stats → src/app/(app)/admin/stats/page.tsx + src/components/admin/StatsDashboard.tsx ──
  adminStats: {
    title: "Statistiche d'uso",
    subtitle: "Aggregati globali sull'utilizzo dell'app.",
    dashboard: {
      loading: "Caricamento…",
      metricTotalUsers: "Utenti totali",
      metricMau: "MAU 30g",
      metricDau: "DAU oggi",
      metricWorkouts: "Workout 30g",
      metricAnalyses: "Analisi 30g",
      metricCheckins: "Check-in 30g",
      newUsersChart: "Nuovi utenti per giorno (30g)",
      workoutsChart: "Workout completati per giorno (30g)",
      topExercisesTitle: "Top 10 esercizi (sessioni completate ultimi 30g)",
      noData: "Nessun dato",
      sessionsUnit: (count: number) => `${count} sess.`,
      fitnessLevelTitle: "Distribuzione livello fitness",
      levelNull: "—",
      usersUnit: (count: number) => `${count} utenti`,
    },
  },

  // ── /admin/admins → src/app/(app)/admin/admins/page.tsx + src/components/admin/AdminsManager.tsx ──
  adminAdmins: {
    title: "Gestione admin",
    subtitle: "Chi può accedere all'area admin.",
    manager: {
      loading: "Caricamento…",
      envTitle: "Email in ADMIN_EMAILS (env)",
      envHintPre: "Queste email vengono promosse automaticamente al primo login. Modifica ",
      envHintCode: ".env.local",
      envHintPost: " e riavvia il server.",
      envEmpty: "(nessuna)",
      currentTitle: (count: number) => `Admin attuali (${count})`,
      youBadge: "tu",
      originAuto: "Auto-promosso",
      originManual: "Promosso manualmente",
      revoke: "Revoca",
      promoteTitle: "Promuovi un utente esistente",
      promotePlaceholder: "email utente registrato...",
      promote: "Promuovi",
      error: "Errore",
    },
  },

  // ── /admin/ai-usage → src/app/(app)/admin/ai-usage/page.tsx + src/components/admin/AiUsagePanel.tsx ──
  adminAiUsage: {
    title: "AI Usage",
    subtitle: "Uso e costi stimati delle feature AI.",
    panel: {
      loading: "Caricamento…",
      metricCost: "Costo stimato mese",
      metricCostHint: "basato su stime token",
      metricFreeAtLimit: "Utenti FREE al limite",
      metricFreeAtLimitHint: "almeno 1 quota maxata",
      byFeatureTitle: "Uso per feature (mese corrente)",
      byFeatureEmpty: "Nessuna chiamata questo mese",
      byPeriodTitle: "Uso per mese (ultimi 6)",
      byPeriodEmpty: "Nessun dato storico",
      topUsersTitle: "Top 10 utenti per uso AI (mese corrente)",
      topUsersEmpty: "Nessun utente attivo",
      callsUnit: (count: number) => `${count} chiamate`,
    },
  },

  // ── /admin/exercises → src/app/(app)/admin/exercises/page.tsx + src/components/admin/AdminExercisesTable.tsx ──
  adminExercises: {
    meta: { title: "Admin · Esercizi & Video PT" },
    title: "Esercizi & Video PT",
    subtitle: "Carica i video del Personal Trainer usati dall'Analisi L3 per il confronto frame-by-frame.",
    metricTotal: "Esercizi totali",
    metricWithVideo: "Con video PT",
    metricActive: "Attivi",
    table: {
      searchPlaceholder: "Cerca per nome o slug…",
      onlyMissing: "Solo mancanti",
      videoCount: (present: number, total: number) => `${present}/${total} esercizi con video PT`,
      empty: "Nessun esercizio.",
      videoBadge: "Video PT",
      missingBadge: "Mancante",
      active: "Attivo",
      inactive: "Disattivo",
      replace: "Sostituisci",
      upload: "Carica",
      deactivate: "Disattiva",
      activate: "Attiva",
    },
    dialog: {
      closeLabel: "Chiudi",
      ariaLabel: (name: string) => `Carica video PT per ${name}`,
      title: (name: string) => `Video PT — ${name}`,
      errorUnsupported: "Formato non supportato. Usa mp4, webm o mov.",
      errorTooLarge: "File troppo grande (max 50MB).",
      errorUnknown: "Errore sconosciuto",
      uploadedTitle: "Video PT caricato",
      removedTitle: "Video PT rimosso",
      confirmRemove: (name: string) => `Rimuovere il video PT di ${name}?`,
      durationWarning: (duration: string) => `Durata ${duration}s fuori range consigliato (8-30s).`,
      removeCurrent: "Rimuovi attuale",
      cancel: "Annulla",
      uploading: "Carico…",
      replace: "Sostituisci",
      upload: "Carica",
    },
  },

  // ── /admin/activity → src/app/(app)/admin/activity/page.tsx + src/components/admin/ActivityLog.tsx ──
  adminActivity: {
    title: "Attività recente",
    subtitle: "Storico delle azioni admin sul sistema.",
    log: {
      empty: "Nessuna azione registrata.",
      pageInfo: (page: number, total: number) => `Pagina ${page} di ${total}`,
      prev: "← Prev",
      next: "Next →",
    },
  },

  // ── Sidebar admin → src/components/admin/AdminSidebar.tsx ──
  adminSidebar: {
    sectionLabel: "Sezione admin",
    tabUsers: "Utenti",
    tabSubscriptions: "Abbonamenti",
    tabExercises: "Esercizi & PT",
    tabStats: "Statistiche",
    tabAdmins: "Gestione admin",
    tabAiUsage: "AI Usage",
    tabRevisions: "Revisioni",
    tabNutritionPool: "Pool nutrizione",
    tabQuiz: "Quiz",
    activity: "Attività recente →",
  },

  // ── /admin/revisions → src/app/(app)/admin/revisions/page.tsx ──
  adminRevisions: {
    title: "Richieste di revisione",
    empty: "Nessuna richiesta al momento.",
    typeFitness: "Allenamento",
    typeNutrition: "Nutrizione",
    statusPending: "Da gestire",
    statusReviewed: "Gestita",
    markReviewed: "Segna come gestita",
  },

  // ── /admin/exercises/tags → src/app/(app)/admin/exercises/tags/page.tsx ──
  adminExerciseTags: {
    meta: { title: "Tag & pianificazione" },
    title: "Tag & pianificazione esercizi",
    subtitle: "Imposta i tag (obiettivo, zona, attrezzatura, difficoltà, luogo) e le note che l'AI userà per comporre il piano fitness.",
    tagsLabel: "Tag",
    tagsPlaceholder: "es. forza, casa, principiante, gambe",
    notesLabel: "Note per la pianificazione (AI)",
    notesPlaceholder: "Prerequisiti, controindicazioni, ordine consigliato…",
    save: "Salva",
    saved: "Salvato!",
    openEditor: "Tag & pianificazione",
    backToList: "← Elenco esercizi",
  },

  // ── /admin/nutrition-plans → src/app/(app)/admin/nutrition-plans/page.tsx ──
  adminNutritionPool: {
    meta: { title: "Pool piani nutrizionali" },
    title: "Pool piani nutrizionali",
    subtitle: "I piani creati dai professionisti tra cui l'AI sceglie in base al quiz dell'utente.",
    newPlan: "Nuovo piano",
    empty: "Nessun piano nel pool. Creane uno.",
    nameLabel: "Nome del piano",
    descLabel: "Per chi / a cosa serve",
    dietLabel: "Tipo di dieta",
    goalLabel: "Obiettivo",
    caloriesLabel: "Kcal",
    proteinLabel: "Proteine (g)",
    carbsLabel: "Carboidrati (g)",
    fatLabel: "Grassi (g)",
    rationaleLabel: "Quando usarlo (per l'AI)",
    weeklyLabel: "Piano settimanale",
    weeklyPlaceholder: "Descrivi i pasti della settimana…",
    create: "Crea piano",
    creating: "Creazione…",
    deleteAria: "Elimina piano",
    error: "Operazione non riuscita. Controlla i campi.",
    goals: {
      LOSE_WEIGHT: "Perdita di peso",
      BUILD_MUSCLE: "Aumento massa",
      ENDURANCE: "Resistenza",
      FLEXIBILITY: "Flessibilità",
      GENERAL_FITNESS: "Forma generale",
      ATHLETIC_PERFORMANCE: "Performance sportiva",
    },
    dietTypes: ["onnivora", "vegetariana", "vegana", "chetogenica", "mediterranea", "altro"],
  },

  // ── /admin/exercises/new → src/app/(app)/admin/exercises/new/page.tsx ──
  adminNewExercise: {
    meta: { title: "Nuovo esercizio" },
    title: "Nuovo esercizio",
    subtitle: "Crea un esercizio completo: video PT, copy, tag e trigger biomeccanici.",
    back: "← Elenco esercizi",
    nameLabel: "Nome",
    slugLabel: "Slug (opzionale, generato dal nome)",
    descLabel: "Descrizione",
    instructionsLabel: "Istruzioni (una per riga)",
    primaryMuscleLabel: "Muscolo primario",
    secondaryMuscleLabel: "Muscoli secondari",
    difficultyLabel: "Difficoltà",
    categoryLabel: "Categoria",
    equipmentLabel: "Attrezzatura",
    videoLabel: "Video PT — esecuzione (per l'analisi)",
    explanationVideoLabel: "Video PT — spiegazione/consigli",
    thumbnailLabel: "Thumbnail (URL)",
    durationLabel: "Durata (s)",
    recordingLabel: "Durata registrazione analisi (s)",
    caloriesLabel: "Kcal/minuto",
    notesLabel: "Note del professionista",
    tagsLabel: "Tag (separati da virgola)",
    specLabel: "Trigger biomeccanici (JSON, opzionale)",
    specHint: "{ movements: [ { joint, movementType, phases: [ { phase, minAngle, maxAngle, triggers: [ { condition, severity, feedback, injuryRisk } ] } ] } ] }",
    create: "Crea esercizio",
    creating: "Creazione…",
    invalidJson: "Il JSON dei trigger non è valido.",
    error: "Creazione non riuscita. Controlla i campi.",
    created: "Esercizio creato ✓",
    newExercise: "Nuovo esercizio",
  },

  // ── /admin/quiz → src/app/(app)/admin/quiz/page.tsx ──
  adminQuiz: {
    meta: { title: "Quiz onboarding" },
    title: "Quiz di onboarding",
    subtitle: "Modifica le domande mostrate agli utenti: copy, opzioni, tipo. Salva per pubblicare.",
    titleLabel: "Domanda (copy)",
    helpLabel: "Testo di aiuto (opzionale)",
    keyLabel: "Chiave (sistema)",
    typeLabel: "Tipo",
    optionsLabel: "Opzioni",
    valuePlaceholder: "valore",
    labelPlaceholder: "etichetta",
    addOption: "Opzione",
    minLabel: "Min",
    maxLabel: "Max",
    requiredLabel: "Obbligatoria",
    addQuestion: "Aggiungi domanda",
    save: "Salva quiz",
    saved: "Salvato!",
    error: "Salvataggio non riuscito.",
    keysHint: "Chiavi di sistema riconosciute (mappate ai dati utente): goal, level, place, equipment, days, time, diet, notes. Altre chiavi vengono mostrate ma non collegate automaticamente.",
    openEditor: "Quiz onboarding",
  },

  // ── /onboarding/quiz → src/app/(auth)/onboarding/quiz/page.tsx ──
  quiz: {
    title: "Costruiamo il tuo percorso",
    subtitle: "Poche domande per creare il piano giusto per te.",
    submit: "Crea il mio piano",
    skip: "Salta per ora",
    missing: "Rispondi alle domande obbligatorie (*).",
    error: "Invio non riuscito. Riprova.",
  },

  // ── Pulsante conferma azione → src/components/admin/ConfirmActionButton.tsx ──
  confirmAction: {
    pending: "...",
    confirm: "Conferma",
    cancel: "Annulla",
  },

  // ── Drawer dettaglio utente → src/components/admin/UserDetailDrawer.tsx ──
  userDetail: {
    loading: "Caricamento…",
    title: "Dettaglio utente",
    close: "✕",
    profileTitle: "Profilo",
    labelEmail: "Email",
    labelName: "Nome",
    labelLevel: "Livello",
    labelAge: "Età",
    labelRegistered: "Iscritto",
    dash: "—",
    weightUnit: "kg",
    heightUnit: "cm",
    badgeAdmin: "ADMIN",
    engagementTitle: "Engagement",
    engagementLine: (points: number, current: number, longest: number) =>
      `Punti: ${points} · Streak attuale: ${current} · Max streak: ${longest}`,
    billingTitle: "Billing",
    billingStatus: (status: string) => `Status: ${status}`,
    billingPeriod: (date: string) => `Periodo fino a: ${date}`,
    stripeLink: "Apri in Stripe →",
    sessionsTitle: "Ultime 10 sessioni workout",
    sessionsEmpty: "Nessuna sessione",
    sessionDuration: (minutes: number) => `${minutes}m`,
    checkinsTitle: "Ultimi 5 check-in",
    checkinsEmpty: "Nessun check-in",
    mood: (mood: number) => `mood ${mood}/5`,
  },

  // ── /privacy → src/app/privacy/page.tsx ──
  privacy: {
    meta: { title: "Privacy Policy" },
    backHome: "Home",
    title: "Privacy Policy",
    lastUpdated: "Ultimo aggiornamento: 15 maggio 2026",
    contactEmail: "privacy@motioninsight.local",
    sections: [
      {
        title: "1. Titolare del trattamento",
        blocks: [
          { type: "p", text: `Il titolare del trattamento dei dati personali è il gestore di ${APP_NAME}. Per qualsiasi richiesta relativa alla privacy puoi contattarci all'indirizzo email indicato nella sezione "Contatti" di questo documento.` },
        ],
      },
      {
        title: "2. Dati che raccogliamo",
        blocks: [
          { type: "p", text: `Raccogliamo i seguenti dati personali quando usi ${APP_NAME}:` },
          { type: "ul", items: [
            { strong: "Dati di registrazione", text: ": nome, indirizzo email, password (in forma crittografata via bcrypt)." },
            { strong: "Dati di profilo", text: ": età, peso, altezza, genere, obiettivi fitness, attrezzatura disponibile, dieta, sport pregresso, eventuali infortuni dichiarati." },
            { strong: "Dati di utilizzo", text: ": sessioni di allenamento, log nutrizionali, sessioni di analisi video, punti accumulati, achievement, streak." },
            { strong: "Dati tecnici", text: ": tipo di dispositivo e browser, indirizzo IP (per sicurezza e rate limiting), data e ora di accesso." },
            { strong: "Video di analisi", text: ": i video caricati per l'analisi tecnica vengono temporaneamente memorizzati per il tempo necessario all'elaborazione e poi cancellati." },
          ] },
        ],
      },
      {
        title: "3. Finalità e basi giuridiche",
        blocks: [
          { type: "ul", items: [
            { strong: "Erogazione del servizio", text: " (esecuzione del contratto): generare piani di allenamento, analizzare la tecnica, tracciare progressi." },
            { strong: "Sicurezza e prevenzione abusi", text: " (legittimo interesse): rate limiting, log accessi, monitoraggio errori." },
            { strong: "Miglioramento del prodotto", text: " (legittimo interesse): statistiche aggregate e anonime sull'uso." },
            { strong: "Comunicazioni di servizio", text: " (esecuzione del contratto): email di verifica, reset password, notifiche importanti." },
          ] },
        ],
      },
      {
        title: "4. Conservazione dei dati",
        blocks: [
          { type: "p", text: "I dati di profilo e cronologia sono conservati per tutta la durata dell'account. Se richiedi la cancellazione, l'account viene disattivato immediatamente e i dati eliminati definitivamente entro 30 giorni. I log tecnici sono conservati per 90 giorni." },
        ],
      },
      {
        title: "5. Condivisione con terzi",
        blocks: [
          { type: "p", text: "Per fornire il servizio condividiamo alcuni dati con i seguenti processor esterni:" },
          { type: "ul", items: [
            { strong: "Supabase", text: " (PostgreSQL hosting, EU): database principale." },
            { strong: "Upstash", text: " (Redis, EU): rate limiting." },
            { strong: "Anthropic", text: " (Claude API, USA): generazione piani AI e analisi tecnica. Prompt e risposte sono inviati ma non usati per training." },
            { strong: "Google", text: " (OAuth, opzionale): solo se scegli di accedere con Google." },
            { strong: "Resend", text: " (email transazionali, EU/USA): invio email di servizio." },
            { strong: "Vercel", text: " (hosting, USA/EU): hosting dell'applicazione." },
          ] },
          { type: "p", className: "text-sm text-muted-foreground", text: "Tutti i processor sono vincolati da accordi DPA conformi al GDPR. Non vendiamo né condividiamo i tuoi dati personali con terzi per finalità di marketing." },
        ],
      },
      {
        title: "6. I tuoi diritti (GDPR)",
        blocks: [
          { type: "p", text: "Hai diritto a:" },
          { type: "ul", items: [
            { strong: "Accesso", text: ': scaricare tutti i tuoi dati dal profilo > sezione "I miei dati".' },
            { strong: "Rettifica", text: ": modificare i tuoi dati dal profilo." },
            { strong: "Cancellazione", text: ': eliminare l\'account dal profilo > "Elimina account".' },
            { strong: "Portabilità", text: ": esportare i dati in formato JSON." },
            { strong: "Opposizione", text: ": contattarci per opporti a trattamenti basati su legittimo interesse." },
            { strong: "Reclamo", text: ": presentare reclamo al Garante Privacy (www.garanteprivacy.it)." },
          ] },
        ],
      },
      {
        title: "7. Cookie",
        blocks: [
          { type: "p", text: `${APP_NAME} usa solo cookie tecnici essenziali per l'autenticazione (NextAuth session). Non usiamo cookie di profilazione o di marketing. Eventuali cookie di analytics aggiuntivi vengono attivati solo previo consenso esplicito tramite il banner cookie.` },
        ],
      },
      {
        title: "8. Sicurezza",
        blocks: [
          { type: "p", text: "Le password sono memorizzate in forma crittografata con bcrypt (12 rounds). Le connessioni sono cifrate TLS. L'accesso ai dati è limitato al personale autorizzato. In caso di breach, ti notificheremo entro 72 ore come richiesto dal GDPR." },
        ],
      },
      {
        title: "9. Modifiche",
        blocks: [
          { type: "p", text: "Possiamo aggiornare questa policy. La data di aggiornamento è in cima al documento. Modifiche sostanziali ti saranno notificate via email." },
        ],
      },
      {
        title: "10. Contatti",
        blocks: [
          { type: "p", text: "Per qualsiasi richiesta relativa alla privacy: ", emailMono: "privacy@motioninsight.local" },
        ],
      },
    ],
  },

  // ── /terms → src/app/terms/page.tsx ──
  terms: {
    meta: { title: "Termini di Servizio" },
    backHome: "Home",
    title: "Termini di Servizio",
    lastUpdated: "Ultimo aggiornamento: 15 maggio 2026",
    contactEmail: "legal@motioninsight.local",
    sections: [
      {
        title: "1. Accettazione",
        blocks: [
          { type: "p", text: `Utilizzando ${APP_NAME} accetti questi Termini di Servizio. Se non sei d'accordo, non utilizzare il servizio.` },
        ],
      },
      {
        title: "2. Descrizione del servizio",
        blocks: [
          { type: "p", text: `${APP_NAME} è un'applicazione di fitness che utilizza intelligenza artificiale per generare piani di allenamento personalizzati, analizzare la tecnica di esecuzione tramite video, tracciare la nutrizione e fornire un coach AI conversazionale. Il servizio è fornito "così com'è".` },
        ],
      },
      {
        title: "3. Account",
        blocks: [
          { type: "p", text: "Devi avere almeno 16 anni per registrarti. Sei responsabile della sicurezza della tua password e di ogni attività sul tuo account. Devi fornire informazioni accurate. Un solo account per persona." },
        ],
      },
      {
        title: "4. Disclaimer medico — IMPORTANTE",
        blocks: [
          { type: "p", className: "text-foreground font-semibold", text: `${APP_NAME} NON è un servizio medico o sanitario. I piani di allenamento, le analisi tecniche e i consigli del coach AI sono generati da algoritmi e da modelli di intelligenza artificiale, e NON sostituiscono il parere di medici, fisioterapisti o personal trainer qualificati.` },
          { type: "p", text: "Prima di iniziare qualsiasi programma di allenamento, soprattutto se hai patologie pregresse, infortuni, sei in gravidanza o hai dubbi sulle tue condizioni di salute, consulta un medico. Sei l'unico responsabile per la tua sicurezza durante l'allenamento." },
        ],
      },
      {
        title: "5. Uso consentito",
        blocks: [
          { type: "p", text: "Non puoi:" },
          { type: "ul", items: [
            { text: "Tentare di accedere all'account di altri utenti;" },
            { text: "Fare scraping o uso automatizzato del servizio;" },
            { text: "Caricare contenuti illegali, offensivi o che violino diritti altrui;" },
            { text: "Tentare di compromettere la sicurezza o le funzionalità del servizio;" },
            { text: "Rivendere o sublicenziare il servizio." },
          ] },
        ],
      },
      {
        title: "6. Contenuti generati dagli utenti",
        blocks: [
          { type: "p", text: `I video caricati per l'analisi e i dati inseriti restano di tua proprietà. Concedi a ${APP_NAME} una licenza limitata per elaborarli al fine di erogare il servizio. Non utilizziamo i tuoi dati per training di modelli AI senza il tuo consenso esplicito.` },
        ],
      },
      {
        title: "7. Limitazione di responsabilità",
        blocks: [
          { type: "p", text: `Nei limiti consentiti dalla legge, ${APP_NAME} non è responsabile per: danni indiretti, perdita di dati, interruzioni del servizio, infortuni derivanti dall'esecuzione degli esercizi proposti, decisioni prese sulla base dei consigli AI. L'uso del servizio è a tuo rischio.` },
        ],
      },
      {
        title: "8. Cancellazione account",
        blocks: [
          { type: "p", text: "Puoi cancellare il tuo account in qualsiasi momento dal profilo. Possiamo sospendere o terminare il tuo account in caso di violazione di questi termini." },
        ],
      },
      {
        title: "9. Modifiche",
        blocks: [
          { type: "p", text: "Possiamo aggiornare questi termini. Modifiche sostanziali ti saranno comunicate via email almeno 14 giorni prima della loro entrata in vigore." },
        ],
      },
      {
        title: "10. Legge applicabile",
        blocks: [
          { type: "p", text: "Questi termini sono regolati dalla legge italiana. Foro competente: foro del consumatore previsto dalla normativa." },
        ],
      },
      {
        title: "11. Contatti",
        blocks: [
          { type: "p", text: "Per domande sui termini: ", emailMono: "legal@motioninsight.local" },
        ],
      },
    ],
  },
} as const;
