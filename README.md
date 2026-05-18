This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Documentazione interna (sviluppatori)

Per capire l'architettura e i flussi del progetto:

- **[DOCUMENTAZIONE_FLUSSI.md](./DOCUMENTAZIONE_FLUSSI.md)** — entry point completo: ogni sezione dell'app, ogni flusso, ogni endpoint con riferimenti `path:line`.
- **[STATO_PROGETTO.md](./STATO_PROGETTO.md)** — overview dello stato attuale e copertura funzionale.
- **[ROADMAP.md](./ROADMAP.md)** — task tracking esecutivo (cosa è fatto, cosa resta).
- **[ANALYSIS_SPEC.md](./ANALYSIS_SPEC.md)** — spec autoritativa dell'Analisi v2 (formato I/O dei 3 livelli).
- **[AGENTS.md](./AGENTS.md)** — note operative per agenti AI che lavorano sul codice.
- **[PROFESSIONALS_DATA_GUIDE.md](./PROFESSIONALS_DATA_GUIDE.md)** — guida per personal trainer e nutrizionisti che inseriscono contenuti via CSV/Excel (template in `data-templates/`).
- **[DATA_AUTHORING_GUIDE.md](./DATA_AUTHORING_GUIDE.md)** — guida tecnica per il dev che converte i CSV in TypeScript seed.

---

## Come funziona l'analisi AI

### Il flusso in 5 passi
- Scegli un esercizio dal tuo piano
- Guarda il video del PT professionista
- Posizionati di fronte alla camera (15 secondi di preparazione)
- Esegui l'esercizio mentre l'app registra (15-25 secondi)
- Ricevi feedback completo entro 1-2 minuti

### I 3 livelli di analisi
- **Biomeccanica deterministica (34%)**: misura gli angoli articolari frame per frame e li confronta con range sicuri
- **Coach AI (33%)**: Claude analizza visivamente la tua esecuzione come farebbe un PT professionista
- **Confronto col PT (33%)**: paragona i tuoi movimenti con quelli del video professionale

### Severità dei feedback
- 🟢 Suggerimento: piccola correzione tecnica
- 🟡 Errore: errore di esecuzione da correggere
- 🔴 Allerta: rischio infortunio, fermati e correggi

### Cosa fare se compare un'allerta
Se vedi 🔴 Allerta, l'app ha rilevato un movimento potenzialmente pericoloso per la tua salute. Ferma l'esecuzione, leggi il feedback e ripeti l'esercizio correggendo la postura. In caso di dolore persistente, consulta un medico.
