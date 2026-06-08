# Checklist Deploy & Setup Produzione

Lista di azioni manuali da eseguire al di fuori del codebase per portare FitAI in produzione. Si compila incrementalmente con l'avanzare delle milestone M0-M5.

---

## M0 — Quick wins

### [ ] CORS bucket `exercise-videos` su Supabase

L'estrazione frame da video PT (Analisi v2 Livello 3) fallisce silenziosamente con fallback `(L1+L2)/2` se il bucket Storage non ha CORS configurato. Dopo questa configurazione, L3 funziona pienamente.

**Procedura**:
1. Apri dashboard Supabase del progetto FitAI → sezione **Storage**.
2. Apri il bucket `exercise-videos`.
3. Vai su **Configuration** (o **Settings** del bucket) → **CORS configuration**.
4. Aggiungi le seguenti regole (formato JSON):
   ```json
   [
     {
       "allowed_origins": ["http://localhost:3000"],
       "allowed_methods": ["GET", "HEAD"],
       "allowed_headers": ["*"],
       "exposed_headers": ["Content-Range", "Content-Length"],
       "max_age_seconds": 3600
     }
   ]
   ```
5. Quando arrivi a M5 (deploy Vercel), aggiungi anche l'origine `https://<dominio-prod>` (es. `https://app.fitai.it` e/o `https://fitai.vercel.app`).
6. Salva. La modifica è immediata, niente redeploy lato app.

**Verifica**: avvia un'analisi su un esercizio con video PT di confronto e controlla nei DevTools Network che la fetch al bucket ritorni 200 senza errori CORS. Nel report L3 deve apparire un punteggio (non solo "L1+L2 fallback").

---

## M9 — Admin video PT upload

Pagina `/admin/exercises` che permette di caricare per ogni esercizio il **video PT di riferimento** usato dalla Logica 3 dell'Analisi (confronto frame-by-frame utente vs PT). Senza video PT, L3 cade sempre nel fallback `(L1+L2)/2`.

### [ ] Bootstrap del primo admin

1. In `.env.local` (e in Vercel env vars per la prod): setta
   ```
   ADMIN_EMAILS="tuo@email.com"
   ```
   (CSV per più admin: `"a@x.com,b@x.com"`).
2. Fai login con quell'email su `/login`.
3. Visita `/admin/exercises` una sola volta: l'helper `requireAdmin()` rileva l'email in env, imposta `User.isAdmin=true` su DB e ti fa entrare. Idempotente.
4. Da questo momento puoi togliere l'email da `ADMIN_EMAILS` senza perdere i privilegi (sono persistiti su DB). Tenerla in env è comunque utile come "safety net" in caso di reset DB.

Per revocare admin a un utente: `UPDATE users SET "isAdmin" = false WHERE email = '...'` (Prisma Studio o SQL).

### [ ] Bucket Supabase `exercise-videos` — policy + CORS

L'API admin carica con il client **service-role** (bypassa RLS), ma il browser legge i video pubblicamente per estrarre i frame L3. Quindi serve:

1. **Public read policy** sul bucket. Supabase dashboard → Storage → `exercise-videos` → Policies → INSERT/SELECT public (oppure crea policy custom solo per path `pt/*` se vuoi essere granulare).
2. **CORS** (procedura già descritta nella sezione M0 sopra). Senza, l'estrazione frame fallisce silenziosamente lato client e L3 resta in fallback anche dopo l'upload.

### [ ] Formato video PT consigliato

- **MIME**: `video/mp4` (preferito, max compatibilità), `video/webm` o `video/quicktime` accettati
- **Dimensione**: max 50MB per file (limite hard nell'API)
- **Durata**: 8-30s (warning UX nel dialog, non bloccante)
- **Risoluzione**: 720p sufficiente. Aspect ratio libero (l'analisi estrae 6 frame uniformi)
- **Naming nel bucket**: automatico, path `pt/{slug-esercizio}.{ext}` (es. `pt/squat.mp4`). `upsert: true` → caricare un nuovo video sostituisce il vecchio.

### Verifica end-to-end

1. Avvia analisi su un esercizio CON video PT caricato → in `/analisi/report/{id}` deve apparire un L3 score reale (non più `(L1+L2)/2` fallback)
2. Nel `videoSyncPlayer` del report devi vedere il video PT a fianco del tuo video

---

## M8 — Daily Mission dashboard

**Nessuna azione manuale richiesta.** Tutto codice locale: nuovo modello Prisma `DailyCheckin` (applicato via `db push --accept-data-loss` come da prassi M4/M8 — no migration file separato), nuovo endpoint `POST /api/daily-checkin`, componente hero `DailyMissionCard`, modifica `dashboard/page.tsx`. Coperto da 5 test E2E in `tests/e2e/m8-daily-mission.spec.ts`. Suite totale: 50/50 verde su `npm run test:e2e`.

Quando arrivi al deploy Vercel (M5 sotto), il `prisma generate && next build` di `vercel.json` produce automaticamente il client aggiornato. Se la tabella `daily_checkins` non esiste sul DB Supabase di produzione, eseguire UNA volta `npx prisma db push --accept-data-loss` puntando alle env vars di produzione (stessa procedura di M4 Stripe schema).

---

## M2 — Email transactional

### [ ] Account Resend + verifica dominio

In M2 abbiamo implementato il wrapper email (`src/lib/email.ts`) con fallback dev: se `RESEND_API_KEY` non è settata, le email vengono solo stampate in console (utile per sviluppo locale). Per inviarle davvero in produzione:

1. **Crea account Resend**: https://resend.com (free tier: 3000 email/mese, 100/giorno)
2. **Verifica dominio**:
   - Dashboard Resend → Domains → Add Domain
   - Aggiungi i record DNS forniti (SPF, DKIM, DMARC) al tuo provider (es. Cloudflare, Namecheap)
   - Attendere ~10 min e clicca "Verify"
3. **Crea API key**: Resend dashboard → API Keys → Create. Permessi: "Sending access".
4. **Aggiorna `.env.local`** (e poi le env vars Vercel in M5):
   ```
   RESEND_API_KEY=re_xxxxxxxxxx
   EMAIL_FROM="FitAI <noreply@tuodominio.it>"
   APP_URL=http://localhost:3000   # in prod sarà https://tuodominio.it
   ```
5. **Verifica funzionamento**: triggera `POST /api/auth/forgot-password` con la tua email, controlla l'inbox.

**Senza dominio (dev only)**: lascia `RESEND_API_KEY` non settata → le email vengono loggate in console. Oppure usa la chiave Resend con `EMAIL_FROM="onboarding@resend.dev"` per inviare via dominio Resend di test (solo per test, non per produzione).

## M3 — Sentry + GDPR

### [ ] Sentry (opzionale per produzione)

`@sentry/nextjs` è **già installato e integrato** (Next 16: `src/instrumentation.ts` + `src/instrumentation-client.ts` + `sentry.server/edge.config.ts`, `next.config.ts` avvolto in `withSentryConfig`). Tutto è guardato dai DSN: **senza DSN, ZERO impatto** — `src/lib/observability.ts` logga solo in console e l'SDK resta no-op. Per abilitare il monitoring vero:

1. Crea progetto Sentry (free tier 5K errors/mese): https://sentry.io → New Project → Next.js. Copia il DSN.
2. Aggiungi a `.env.local` e Vercel env:
   - `SENTRY_DSN=https://...@sentry.io/...` → errori server/edge
   - `NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...` → errori client/browser (stesso DSN)
3. (Opzionale, solo per upload sourcemap in build CI) `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`. Senza auth token l'upload sourcemap viene saltato e il build resta verde.
4. Verifica deploy → triggera un errore → controlla dashboard Sentry.

### [ ] Aggiornare email contatti

Le privacy/terms hanno placeholder:
- `privacy@fitai.local` → sostituisci con email reale
- `legal@fitai.local` → sostituisci con email reale

File: `src/app/privacy/page.tsx` riga ~110, `src/app/terms/page.tsx` riga ~92.
## M4 — Stripe pagamenti

In M4 abbiamo implementato: schema `Subscription` + `UsageCounter`, wrapper `src/lib/billing/stripe.ts`, gating `requirePremium`/`checkQuota`/`incrementUsage`, 4 API (`checkout`, `portal`, `webhook`, `status`), gating su `/api/ai/*` e `/api/analysis/start`, pagina `/abbonamento` e voce navbar.

**Senza chiavi Stripe**: gli endpoint `/api/billing/checkout` e `/api/billing/portal` ritornano 503; il gating funziona comunque sui piani esistenti (chiunque resta FREE). I 4 endpoint AI ritornano 402 quando si esauriscono le quote o si chiede AI Coach con piano FREE — già operativo in dev.

### Setup produzione (in ordine)

1. **Account Stripe**: https://stripe.com → Dashboard → attiva il tuo profilo (richiesta P.IVA per business in IT, oppure persona fisica con limiti).
2. **Crea prodotti** (Test mode prima, poi Live):
   - Dashboard → Products → "Add product"
   - **FitAI Premium Monthly**: ricorrente, €9.99/mese, EUR. Annota il `price_id` (inizia con `price_`).
   - **FitAI Premium Yearly**: ricorrente, €79.00/anno, EUR. Annota il `price_id`.
3. **API keys** (test mode):
   - Dashboard → Developers → API keys
   - Copia `Secret key` (sk_test_...) e `Publishable key` (pk_test_...)
4. **Webhook**:
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: in dev → usa `stripe listen --forward-to localhost:3000/api/billing/webhook` (Stripe CLI). In prod → `https://<dominio>/api/billing/webhook`.
   - Eventi da inviare: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
   - Copia il `Signing secret` (whsec_...).
5. **Aggiorna `.env.local`** (e poi le env vars Vercel in M5):
   ```
   STRIPE_SECRET_KEY=sk_test_xxx
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   STRIPE_PRICE_MONTHLY=price_xxx
   STRIPE_PRICE_YEARLY=price_xxx
   ```
6. **Test in dev**:
   - Apri `/abbonamento` → clicca "Abbonati — €9.99/mese" → si apre Stripe Checkout (test mode).
   - Usa carta test `4242 4242 4242 4242`, scadenza futura, qualsiasi CVC.
   - Completa → torni a `/abbonamento?status=success`.
   - Webhook viene inviato a `localhost:3000/api/billing/webhook` (via Stripe CLI). Verifica nel DB `user.subscriptionStatus=ACTIVE`.
   - Tenta `/api/ai/chat` → deve passare (era 402 con FREE).
7. **Customer Portal**: in dashboard → Settings → Billing → Customer portal → Activate. Configura le opzioni di cancellazione/upgrade.
8. **Go live**: passa da test mode a live mode in Stripe, rifai il setup di prodotti + webhook puntando al dominio prod, aggiorna le env vars Vercel con chiavi `sk_live_*` e `whsec_*` di produzione.

### Configurazione modello commerciale (modificabile)

Quote piano FREE sono in `src/lib/billing/gating.ts`:
```ts
export const FREE_QUOTAS = {
  generate_plan: 3,
  generate_nutrition_plan: 1,
  analysis_start: 5,
};
```
AI Coach: solo Premium (`requirePremium`). Per cambiare modifica i singoli endpoint API.
## M5 — Vercel deploy + go-live

### Pre-flight (già fatto dal codice)
- `vercel.json` con region `fra1` + build command `prisma generate && next build`
- `.env.example` con tutte le env vars necessarie
- `@vercel/analytics` integrato in `src/app/providers.tsx`
- Health endpoint `GET /api/health` (verifica DB)
- Build production verificato locale (`npm run build` → 54 pagine, 0 errori)
- 39 test E2E Playwright verdi

### Passo 1 — GitHub
1. Crea repo privato su GitHub (es. `fitai-app`).
2. Da progetto root:
   ```bash
   git init
   git add -A
   git commit -m "feat: production-ready M0-M5"
   git branch -M main
   git remote add origin git@github.com:TUO_USERNAME/fitai-app.git
   git push -u origin main
   ```
3. Verifica `.gitignore` esclude `.env.local`, `.next/`, `node_modules/`. (`.env.example` deve essere tracciato.)

### Passo 2 — Importa progetto su Vercel
1. https://vercel.com → New Project → Import Git Repository → seleziona `fitai-app`.
2. Framework: rilevato automaticamente come Next.js.
3. **Build & Output settings**: lascia default (override già in `vercel.json`).
4. **NON deployare ancora** — configura prima le env vars.

### Passo 3 — Env vars (copia da `.env.local`)

Su Vercel → Project Settings → Environment Variables. Aggiungi tutte (Production + Preview):

| Variable | Production value | Note |
|---|---|---|
| `DATABASE_URL` | Supabase pooler 6543 | Branch preview: stesso DB o branch separato |
| `DIRECT_URL` | Supabase pooler 5432 | |
| `NEXTAUTH_SECRET` | nuovo segreto (32 byte) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://<dominio>` | URL pubblico finale |
| `APP_URL` | `https://<dominio>` | usato da email + Stripe |
| `GOOGLE_CLIENT_ID` | da Google Cloud Console | |
| `GOOGLE_CLIENT_SECRET` | da Google Cloud Console | |
| `ANTHROPIC_API_KEY` | sk-ant-xxx | |
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... | |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... | server-only |
| `UPSTASH_REDIS_REST_URL` | https://xxx.upstash.io | |
| `UPSTASH_REDIS_REST_TOKEN` | xxx | |
| `RESEND_API_KEY` | re_xxx (se vuoi email) | opzionale ma raccomandato |
| `EMAIL_FROM` | `FitAI <noreply@<dominio>>` | |
| `SENTRY_DSN` | (opzionale) | errori server/edge; senza, console-only |
| `NEXT_PUBLIC_SENTRY_DSN` | (opzionale) | errori client/browser (stesso DSN) |
| `STRIPE_SECRET_KEY` | sk_live_xxx (in prod) | sk_test_xxx in preview |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_live_xxx | |
| `STRIPE_WEBHOOK_SECRET` | whsec_xxx | da webhook config (passo 6) |
| `STRIPE_PRICE_MONTHLY` | price_xxx | da Stripe dashboard prodotti |
| `STRIPE_PRICE_YEARLY` | price_xxx | |

### Passo 4 — First deploy
1. Vercel → Deploy. Aspetta build (~3-5 min).
2. Verifica preview URL: `https://fitai-app-xxx.vercel.app`.
3. Apri `/api/health` → deve restituire `{"status":"ok","checks":{"database":"ok"}}`.
4. Smoke test: `/registrati` → onboarding → `/dashboard`.

### Passo 5 — Dominio custom
1. Vercel → Project → Settings → Domains → Add → `app.fitai.it`.
2. Vercel mostra i record DNS richiesti. Aggiungi sul tuo provider DNS (Cloudflare/Namecheap/etc):
   - Apex (`fitai.it`): record A `76.76.21.21`
   - Subdomain (`app.fitai.it`): record CNAME `cname.vercel-dns.com`
3. Attendi propagazione (5 min — 24h). Vercel emette automaticamente SSL Let's Encrypt.
4. Aggiorna env vars: `NEXTAUTH_URL` e `APP_URL` con il nuovo dominio (richiede redeploy).

### Passo 6 — Webhook Stripe production
1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. URL: `https://app.fitai.it/api/billing/webhook`.
3. Events: `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.payment_failed`.
4. Copia il `Signing secret` (whsec_xxx) → mettilo in env var `STRIPE_WEBHOOK_SECRET` su Vercel → redeploy.
5. Verifica: dashboard Stripe → Webhooks → endpoint → "Send test event" → deve arrivare con 200.

### Passo 7 — Aggiorna Google OAuth callback
1. Google Cloud Console → APIs & Services → Credentials → tuo OAuth Client.
2. Authorized redirect URIs → aggiungi `https://app.fitai.it/api/auth/callback/google`.
3. Salva.

### Passo 8 — Aggiorna CORS Supabase
1. Supabase dashboard → bucket `exercise-videos` → CORS → aggiungi origin `https://app.fitai.it`.
2. Aggiungi anche dominio Vercel preview se serve testare PR su preview URL.

### Passo 9 — Verifica Resend dominio (se hai dominio email)
1. Resend dashboard → Domains → Add domain → inserisci dominio email (es. `fitai.it`).
2. Aggiungi i record DNS forniti (SPF, DKIM, DMARC).
3. Attendi verifica.
4. Aggiorna `EMAIL_FROM` su Vercel: `FitAI <noreply@fitai.it>`.

### Passo 10 — Smoke test produzione end-to-end
- [ ] Apri `https://app.fitai.it` → home risponde
- [ ] `/api/health` → status ok
- [ ] Signup nuovo utente con email vera
- [ ] Ricevi welcome + verify email nell'inbox (verifica link funziona)
- [ ] Completa onboarding 4 step
- [ ] Genera piano AI
- [ ] Esegui workout sample → appare nel feed community
- [ ] Logout, "password dimenticata" → ricevi email reset → cambio password funziona
- [ ] Vai a `/abbonamento` → click "Abbonati" → Stripe Checkout aperto
- [ ] Completa con carta test `4242 4242 4242 4242` (test mode) o vera (live mode)
- [ ] Torni a `/abbonamento?status=success` → status diventa ACTIVE
- [ ] `/ai-coach` → ora accessibile (era 402 con FREE)
- [ ] Vercel Analytics → vedo pageview
- [ ] Sentry (se configurato) → triggera errore manuale e vedo nel dashboard

### Passo 11 — Modalità maintenance (opzionale)
Per metterti in modalità manutenzione: Vercel → Project → Settings → Production Domain → Disable deployment Protection è un altro tema. La via più semplice: redeploy con env var `MAINTENANCE_MODE=1` e middleware che redirige a `/maintenance.html` se la flag è on. Non implementato — aggiungere se serve.
