# Kit per Claude Design — Area utente + Account Manager

> **Scopo:** materiale pronto da dare in pasto a Claude Design per costruire/rifinire le schermate
> dell'**app** (area utente + admin) **nello stile attuale**. Generato dal codice reale il 2026-08-14.
> Fonte copy: `src/content/copy.ts`. Fonte layout: `MOTION_INSIGHT_AREA_UTENTE_v2.md`. Token: `src/app/globals.css`.
>
> **Nota:** la LANDING (questo kit copre solo app + admin) è stata **portata nel codice il 2026-08-14**
> dalla fonte `Motion-Insight-anteprima v2.html` (v2, non più v1 — v1 è superata/rimossa). `src/app/page.tsx`
> e `src/content/copy.ts` (`copy.landing`) riflettono ora quel contenuto. Riferimento futuro per la landing: v2.

---

## ⛔ REGOLA D'ORO — NON è un redesign
Lo stile attuale **piace e va mantenuto**. Claude Design deve **replicare il design system qui sotto**,
non inventarne uno nuovo. Si interviene solo su **parti e copy**, con lo **stesso linguaggio visivo**.
Colori, tipografia, raggi, spaziature e componenti sono quelli definiti sotto.

---

## 1. DESIGN SYSTEM UFFICIALE — palette ANTEPRIMA (scuro + lime)
Fonte di verità del design = **`Motion-Insight-anteprima.html`**. Dal **2026-08-14 il codice è allineato**:
`.theme-organic` (che avvolge landing, area utente **e** admin) usa questa palette scura. Riprodurla identica.

### Palette (hex ufficiali dell'anteprima)
| Ruolo | Token | Hex |
|---|---|---|
| Sfondo pagina | `--background` | `#0A0F1C` (navy quasi-nero) |
| Card / superfici | `--card` | `#121A2B` |
| Superficie elevata / muted | `--secondary` · `--muted` | `#1B2540` |
| Testo primario | `--foreground` | `#ECF1F8` (bianco sporco) |
| Testo secondario | `--muted-foreground` | `#94A3B8` (grigio-slate) |
| Bordi | `--border` | `#1E2A3D` |
| **PRIMARIO / ACCENTO / CTA / focus** | `--primary` `--accent` `--ring` | `#C8F751` **(LIME)** |
| Testo su lime | `--primary-foreground` | `#0A0F1C` (scuro) |
| Evidenza secondaria / link | teal | `#4FD1C5` |
| Rischio / warning | amber | `#FFB547` |
| Errore / distruttivo | `--destructive` | `#E5484D` |

### Scala "energy" (heatmap muscolari, intensità, streak) — su fondo scuro
| Livello | Hex | Significato |
|---|---|---|
| cold | `#2E8BC9` (blu) | muscolo non lavorato |
| cool | `#4FD1C5` (teal) | lavorato base |
| warm | `#C8F751` (lime) | lavorato bene |
| hot | `#FFB547` → `#DC3A2E` (ambra→rosso) | intensità alta |

### Tipografia · forma · movimento
- **Font (anteprima):** display **Space Grotesk** (geometrico, bold, tight), corpo **Inter**. *Nota:* nel codice oggi il display è Sora e il corpo Geist/Manrope (sostituti neutri equivalenti); allineare i font esatti all'anteprima è un follow-up rapido.
- **Raggio:** `--radius: 0.75rem` (12px); varianti sm/md/lg derivate.
- **Componenti chiave da riusare:** `Card` (superficie `--card`, bordo `--border`, raggio lg), badge/pill,
  bottone primario verde, tabelle admin, mini-grafici **recharts**, heatmap muscolare, gauge/anelli animati,
  primitive motion (`ScrollReveal`/`ScrollStagger`, `CountUp`). Libreria "wow": `src/components/wow/`.
- **Densità:** area utente arieggiata (card, molto respiro); admin più densa (tabelle, metriche in alto).

---

## 2. COME LAVORARE IN CLAUDE DESIGN (metodo consigliato)
Non rifare 26 schermate a mano. **Definisci il design system su 4-5 schermate rappresentative**, poi il look
si propaga (i componenti sono condivisi). Ordine suggerito:
1. **Dashboard** (utente) — set completo di componenti: statband, card, heatmap, azioni rapide.
2. **Report Analisi** (utente) — il pezzo forte: punteggio, score-cards, confronto PT.
3. **Un editor admin + la tabella Utenti** — copre tutto il pattern admin (form + tabella + metriche).
Da lì, applica gli stessi stili alle altre.
- **Dati:** i mockup sono statici → usa i **dati d'esempio** della §5 (o simili realistici).
- **Placeholder:** dove un contenuto non c'è ancora, lascia un placeholder etichettato, non inventare.
- **AI Coach:** esiste in codice ma è **de-linkato** dalla nav → non includerlo nel menu.

---

## 3. AREA UTENTE — navigazione + inventario schermate
**Nav (etichetta menu → route):** Dashboard `/dashboard` · **La tua sessione** `/allenamento` ·
**Il tuo piano nutrizionale** `/nutrizione` · **Libreria** `/esercizi` · Progressi `/progressi` ·
(menu ☰) Community `/community` · Profilo `/profilo`. Extra: Analisi `/analisi` (+ report), Abbonamento.
Su mobile: 5 tab fisse in basso + menu ☰ per Community/Profilo.

Ogni schermata ha la sua copy in `copy.ts` (chiave indicata). Sotto, le **rappresentative** con copy reale.

### 3.1 Dashboard `/dashboard` — chiave `copy.dashboard` (+ `copy.dailyMission`)
Layout: saluto + statband (3 metriche) → Piano attivo → **La tua missione di oggi** (3 task) → Costanza 90gg
(heatmap) → Sessioni recenti → Squilibri muscolari (mappa) → Azioni rapide → Ultimi achievement.
Copy reale:
- Saluto: **"Ciao, {nome}"** · sottotitolo **"Pronto per l'allenamento di oggi?"** · streak "{n} gg streak".
- Statband: "Allenamenti completati" · "Streak di costanza" (record {n}) · "Punti totali".
- Piano attivo → **"Vai all'allenamento"**; vuoto: "Nessun piano attivo" → **"Crea piano con AI"**.
- "Costanza ultimi 90 giorni" · "Vedi tutto →".
- "Sessioni Recenti" — vuoto: "Nessuna sessione ancora. Inizia il tuo allenamento!".
- "Squilibri muscolari" · "Mappa →" · "Buon equilibrio 💪".
- Azioni rapide: {Analizza esercizio · "Analisi video AI"} {Vai alla Libreria · "Tutti gli esercizi"}.
- Missione: **"La tua missione di oggi"**, "{done} di 3 task", CTA Inizia/Vedi/Crea/Logga; check-in
  **"Come ti senti oggi?"** (Energico/Stanco/Poco tempo).

### 3.2 La tua sessione `/allenamento` — chiave `copy.allenamento` (+ `allenamentoDettaglio`, `allenamentoSessione`)
Titolo **"La tua sessione"** · sottotitolo "Il tuo allenamento, sessione per sessione."
Vuoto: "Nessun piano ancora" · "Crea un piano manualmente o generane uno con l'AI" → **"Genera con AI"** /
"Crea manualmente". Sezioni: "Piano Attivo" (badge **"Attivo"**) · "Altri Piani". Card piano: "{n} settimane",
"{n} x/settimana", "{n} esercizi", **"Vai al piano"** / "Imposta attivo".
Dettaglio giorno: **"Inizia"** per avviare la sessione guidata; pannello **"Il tuo stato"** (Rischio infortuni,
"Da tenere d'occhio", "Buon equilibrio muscolare.", disclaimer "Avvisi di allenamento, non diagnosi mediche.");
toggle **"Analisi avanzata"** per esercizio.

### 3.3 Report Analisi `/analisi/report/[id]` — chiave `copy.analisiReport` ⭐ (pezzo forte)
Stato elaborazione: **"Analisi in corso..."** con 3 step (L1 Biomeccanica · L2 PT Expert · L3 Confronto),
"Questo processo richiede 1-2 minuti…".
Report: **"Report: {esercizio}"** · "Analisi completata il {data}" · **Punteggio Complessivo** grande "{n} su 100".
Tre score-card: **Biomeccanica · PT Vision · Confronto PT**. Eventuale **"Allerta sicurezza — livello {x}"**
("Aree coinvolte: {…}"). Sezioni: **"Giudizio del Coach"** · "Aree da Migliorare" · "Punti di Forza" ·
"Feedback Biomeccanico" · **"Confronto con Professionista"** · "Video sincronizzati". CTA: "Ripeti l'analisi" / "Altri esercizi".

### 3.4 Il tuo piano nutrizionale `/nutrizione` — chiave `copy.nutrizione`
Titolo **"Il tuo piano nutrizionale"** · "Il tuo piano e cosa mangi ogni giorno." Blocchi: **"Piano consigliato
per te"** ("Dal pool dei nostri professionisti…", "Target indicativi": Calorie/Proteine/Carboidrati/Grassi) ·
**"Ricette per te"** (badge **"Selezionata"** per le curate, "Genera ricette" per l'AI, Ingredienti/Preparazione) ·
diario giornaliero con navigazione giorni (pasti: Colazione/Pranzo/Cena/Spuntino), "Nuovo alimento" (form),
vuoto: "Nessun alimento registrato per questo giorno".

### 3.5 Progressi `/progressi` — chiave `copy.progressi`
Titolo **"I miei Progressi"**. Blocchi (tutti grafici recharts): **"Qualità dei tuoi movimenti"** (trend Form Score,
"+{d} rispetto alla prima analisi") · "Peso e misure" (facoltativi) · statistiche (Sessioni/Minuti/Streak/Punti) ·
"Sessioni ultimi 7 giorni" · "Minuti allenamento (30gg)" · **"I tuoi insight"** · "Volume settimanale (8 sett.)" ·
**"Andamento carichi principali"** (carico max per sessione, "+{d} kg dalla prima volta") · Achievement.

### 3.6 Altre schermate utente (stesso stile, copy già pronta)
- **Libreria** `/esercizi` (`copy.esercizi` + `esercizioDettaglio`): filtro per tag, dettaglio con doppio video
  PT (esecuzione + consigli), curva 1RM.
- **Community** `/community` (`copy.community`): feed post + like + commenti.
- **Profilo** `/profilo` (`copy.profilo`, la più ricca): abbonamento, note mediche, upload documenti, quiz ripetibile,
  richiesta revisione (`copy.revisione`).
- **Analisi (cattura)** `/analisi` + `/analisi/sessione` (`copy.analisi`, `analisiSessione`): conto alla rovescia, registrazione 20s.
- **Abbonamento** `/abbonamento` (`copy.abbonamento`).

---

## 4. ACCOUNT MANAGER (admin) — inventario
**Sidebar** (`copy.adminSidebar`). Densità alta: header con **metriche in alto** + tabella/form sotto. Stesso tema scuro/verde.

- **Utenti** `/admin/users` (`copy.adminUsers`) ⭐ rappresentativa: titolo "Utenti"; metriche in alto
  (Utenti totali · Premium · Admin · **Ricavo mensile (MRR)** · **Costo AI (mese)** · **Margine**);
  ricerca + filtri (Tutti/Premium/Free/Admin); righe con badge ADMIN/PREMIUM/OMAGGIO, "iscritto {data} · {n} sessioni",
  colonne **Costo AI / Ricavo / Margine** (€), azioni "Rendi admin" / "Premium 30g" / "Dettaglio"; blocco
  **"Economia utenti (mese corrente)"** ("Costo AI stimato dall'utilizzo vs ricavo dal piano…").
- **Abbonamenti** `/admin/subscriptions` (`copy.adminSubscriptions`): Premium attivi · MRR · Churn 30g · Rinnovi 7g · link Stripe.
- **Statistiche** `/admin/stats` (`copy.adminStats`): MAU, aggregati d'uso.
- **Esercizi** `/admin/exercises` (+ new, `[id]/edit`, tags) (`copy.adminExercises`, `adminNewExercise`, `adminExerciseTags`):
  form completo (info, video esecuzione + spiegazione, tag, note PT, trigger biomeccanici), editor tag.
- **Pool nutrizionale** `/admin/nutrition-plans` (`copy.adminNutritionPool`) · **Pool allenamenti**
  `/admin/workout-plans` (`copy.adminWorkoutPool`) · **Ricette** `/admin/recipes` (`copy.adminRecipes`): CRUD template/ricette.
- **Quiz** `/admin/quiz` (`copy.adminQuiz`): editor domande/opzioni onboarding.
- **Revisioni** `/admin/revisions` (`copy.adminRevisions`): coda richieste di revisione manuale.
- **Contenuti sito** `/admin/site-content` (`copy.adminSiteContent`): override copy senza deploy.
- **Attività** `/admin/activity` (`copy.adminActivity`) · **Admin** `/admin/admins` · **AI usage** `/admin/ai-usage`.

**Pattern comune admin** (per ogni sezione editabile): metriche → tabella/lista → form crea/modifica → salva.
Un solo stile di tabella e un solo stile di form, riusati ovunque.

---

## 5. DATI D'ESEMPIO (per i mockup statici)
- **Utente:** "Ciao, Marco" · 12 allenamenti · streak 5 gg (record 9) · 340 pt.
- **Form Score:** 77/100 · trend [61, 65, 68, 72, 77] · delta +16.
- **Report squat:** Biomeccanica 74 · PT Vision 80 · Confronto PT 71 · Allerta "ginocchio destro" livello medio.
- **Nutrizione target:** 2100 kcal · P 150g · C 210g · G 70g.
- **Carichi:** Squat 80kg (+15) · Stacco 100kg (+20) · Panca 60kg (+10).
- **Admin economia:** MRR €248 · Costo AI mese €37,40 · Margine €210,60 · 42 utenti (7 Premium).
- **Heatmap muscolare:** quadricipiti warm, dorsali cool, core hot, spalle cold.

---

## 6. Note / decisioni ancora aperte (NON inventare)
- **AI Coach:** de-linkato dalla nav (scelta presa) — non metterlo nel menu.
- La copy è centralizzata in `src/content/copy.ts`: per estrarre il testo esatto di una schermata,
  cercare la chiave indicata (es. `copy.progressi`).
- Dopo l'approvazione in Claude Design, i mockup vanno **portati a codice** nei componenti React/Tailwind
  (nessun sync automatico): si aggiornano i token/componenti condivisi → il look si propaga a tutte le pagine.
