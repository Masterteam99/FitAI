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
} as const;
