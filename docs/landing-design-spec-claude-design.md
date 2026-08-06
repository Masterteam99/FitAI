# Landing Design Spec — Motion Insight (per Claude Design)

Documento operativo per progettare la **landing page** (tutte le pagine) di Motion Insight: tema, copy pronto, animazioni e immagini open-source. Base marketing **chiara**, palette **navy/coral**. Brand **Motion Insight** (non "FitAI"). Le esplorazioni scure/verdi precedenti sono superate: usa questo.

---

## 1. Design system (tema)

### 1.1 Palette
| Ruolo | HEX | Uso |
|---|---|---|
| Navy (scuro) | `#16213E` | Base scura, blocchi d'enfasi, testi forti, header su fondo scuro |
| **Coral (azione)** | `#E94560` | **SOLO CTA/azioni. Una sola azione coral per schermata** |
| Teal (supporto) | `#0F9E99` | Link, etichette, evidenze nei titoli (`<em>`), micro-testi |
| Lime (energia) | `#C6F135` | Stati positivi, Form Score alto, micro-accenti su fondo scuro |
| Cloud | `#F4F7FB` | Sfondo pagina/sezioni chiare |
| Mist | `#EAF1F8` | Sezioni alternate, card secondarie |
| Ink | `#1B1B1B` | Testo primario |
| Grigio | `#555555` | Testo secondario |
| Linea | `#E2E8F0` | Bordi, divisori |

**Regola d'oro:** il coral è raro e prezioso. In ogni schermata un solo bottone è coral (l'azione principale). Il secondario è navy pieno o outline. Le evidenze nei titoli sono **teal**, non coral.

### 1.2 Tipografia
- **Display:** `Sora` (geometrico, sportivo/tech), pesi 600–700, tracking stretto (-0.03em), per H1/H2 e numeri grandi.
- **Corpo:** `Inter`, 16–18px minimo, leggibile.
- Gerarchia: H1 `clamp(2.6rem, 5.5vw, 4.4rem)`; H2 `clamp(2rem, 3.8vw, 3rem)`; body 16–18px; caption 12–13px uppercase tracking 0.16em.
- Numeri (Form Score, rep, prezzi): Sora bold, grandi.

### 1.3 Forma e profondità
- Radius: card 18–24px, pill/bottoni full (999px), input 12px.
- Ombre morbide e diffuse (mai dure): es. `0 28px 56px -28px rgba(22,33,62,.20)`.
- Griglia contenuti: max-width ~1180px, padding laterale 28px (mobile 20px).
- Sezioni alternate cloud/mist; blocchi navy per enfasi (hero secondari, CTA finale, price card Premium).

### 1.4 Componenti
- **Bottoni:** primario coral pieno (testo bianco); secondario navy pieno o outline; terziario testuale teal.
- **Card:** fondo bianco, bordo `#E2E8F0`, ombra morbida, icona + titolo + testo + link.
- **Badge/pill:** "Più scelto", "-33%", "On-device", "In arrivo".
- **Anello Form Score:** anello percentuale con draw-on; il numero al centro grande.
- **Overlay scheletro:** figura con 33 nodi luminosi, stato verde (ok) / rosso (errore), messaggio breve.

### 1.5 Motion — principi
- Rispetta sempre `prefers-reduced-motion` (anima solo opacity, niente movimenti forti).
- Easing morbido (`cubic-bezier(.22,1,.36,1)`), durate 300–700ms.
- Entrata alla vista, non loop invadenti. Un solo elemento "vivo" per viewport.

---

## 2. Libreria animazioni (cosa usare, dove)

Sono le primitive già disponibili nel codice: progetta pensando a queste.

| Animazione | Effetto | Dove usarla |
|---|---|---|
| **FadeIn / SlideUp** | comparsa in dissolvenza / dal basso al caricamento | hero, titoli di sezione |
| **ScrollReveal / ScrollStagger** | comparsa a scroll, a cascata sulle card | griglie di card (pilastri, segmenti, prezzi) |
| **ScrollExplainer** | sezione **sticky scroll-driven**: il testo avanza per step mentre a lato cambia il visual | "Come funziona" (3–4 passi) |
| **CountUp** | numeri che salgono da 0 | metriche, statistiche, Form Score |
| **RadialGauge / AnimatedRing** | anello che si disegna fino al valore | Form Score, obiettivo settimanale |
| **AnimatedArea / AnimatedBars** | grafico area/barre che cresce | showcase dati, volume |
| **AdaptiveBodyMap** | mappa corporea con **pulse** sui muscoli carenti | "equilibrio muscolare", analisi biomeccanica |
| **ExerciseFormPlayer** | figura di profilo che esegue l'esercizio con marker sull'errore, frame per frame | hero/demo tecnica, "cosa vede l'AI" |
| **ParallaxLayer / GradientMesh** | strati in parallasse / sfondo mesh animato CSS | hero (leggero), blocchi navy |
| **MagneticHover / CardHover** | micro-interazioni al hover | bottoni, card cliccabili |

Nota: l'accento coral può avere un leggero **glow** (`box-shadow` diffuso) solo sull'azione principale.

---

## 3. Immagini (open-source)

### 3.1 Fonti consigliate (uso commerciale libero)
- **Unsplash** (unsplash.com) — Unsplash License: uso commerciale, nessuna attribuzione obbligatoria.
- **Pexels** (pexels.com) — Pexels License: idem.
- **Pixabay** (pixabay.com) — idem.
- **Icone:** `Lucide` (lucide.dev, ISC) — set unico, lineare.
- **Illustrazioni (solo se servono):** `unDraw` (undraw.co, open) — usare con parsimonia, mai infantili.

**Regole:** preferisci **foto reali** di persone che si allenano (evita stock troppo patinati e finti); niente loghi/marchi riconoscibili; volti di persone reali solo con foto libere da diritti; ottimizza in **WebP/AVIF**, `srcset` responsive, lazy-load sotto la piega, hero prioritizzato. OG image 1200×630.

### 3.2 Il visual dell'hero (prodotto, non stock)
Il visual chiave (persona che fa squat + **overlay scheletro 33 punti** + Form Score live) è un **asset prodotto**: video demo 8s in loop muto, oppure una foto fitness open-source con **overlay grafico scheletro** disegnato sopra (SVG). Non esiste come singola foto stock: va composto.

### 3.3 Termini di ricerca per placement (vedi ogni pagina sotto)
Per ogni immagine indico **[fonte · termine di ricerca]** e cosa deve mostrare.

---

## 4. Elementi globali

- **Header sticky** (sfondo cloud translucido, blur): logo Motion Insight a sinistra (mark navy + onda lime + wordmark, "Insight" in teal) · voci centrali (Home, Come Funziona, Funzionalità, Per Chi, Prezzi, Storie, Risorse) · a destra `Accedi` (outline) + **`Prova Gratis` (coral pieno)**. Mobile: hamburger, ma i due bottoni restano visibili.
- **Footer** completo: link a tutte le sezioni, contatti, social, note legali (Privacy, Termini, Cookie), P.IVA, badge "Dati elaborati sul tuo dispositivo".
- **Barra CTA mobile** fissa in basso: "Prova Gratis" coral.
- **Banner cookie** GDPR (decline non-essenziali di default).

---

## 5. Pagine

Per ogni pagina: **obiettivo · struttura · copy (pronto) · animazioni · immagini**.

### 5.1 HOME
**Obiettivo:** agganciare in 5 secondi e portare al quiz. Pagina più importante.

**Blocchi (dall'alto):**
1. **Hero** — a sinistra testo, a destra il visual demo.
   - H1: *"L'AI che **vede gli errori** nella tua tecnica prima che ti facciano male."* ("vede gli errori" in teal)
   - Sub: *"Allena con la fotocamera. La nostra AI ti dice esattamente cosa correggere, in tempo reale, in italiano. Piano di allenamento e nutrizione su misura, che si adatta a te ogni giorno."*
   - CTA coral: **"Calcola il tuo piano gratis"** · secondario outline: "Guarda la demo"
   - Micro-copy: *"Gratis. Nessuna carta richiesta. 2 minuti."*
   - Badge privacy (teal soft): *"🔒 Il video è elaborato sul tuo dispositivo. Nessun filmato viene mai salvato o inviato."*
   - **Animazioni:** SlideUp sul titolo, FadeIn su sub/CTA, ExerciseFormPlayer o video loop nel visual, ParallaxLayer leggero.
   - **Immagini:** visual prodotto (vedi §3.2). Fallback [Unsplash · "woman squat home workout"] con overlay scheletro SVG.
2. **Barra di fiducia** — striscia con micro-proof: "33 punti del corpo tracciati" · "100% elaborato sul tuo dispositivo" · "Form Score 0–100 oggettivo". *(niente numeri di utenti inventati)* — CountUp sui numeri.
3. **Il problema (empatia)** — H2: *"Ti alleni da solo. Ma chi ti dice se **lo stai facendo bene**?"* + 3 card (icone Lucide, accento coral):
   - *Rischi infortuni* — "La tecnica sbagliata, ripetuta, prima o poi si paga: ginocchia, schiena, spalle."
   - *Non vedi risultati* — "Ti impegni ma non capisci perché non arrivano: manca un occhio che ti corregga."
   - *Un PT costa 200-400€/mese* — "Seguirti davvero costa. Motion Insight ti dà quello sguardo, sempre con te."
   - Chiusura centrata: *"Motion Insight risolve tutti e tre."* — ScrollStagger sulle card.
   - **Icone:** ShieldAlert, TrendingDown, Wallet (Lucide).
4. **Tre pilastri** — H2: *"La **correzione della forma** che nessuna app ti dà."* + 3 card cliccabili asimmetriche:
   - *Correzione forma in tempo reale* (la più grande/prima) → Come Funziona
   - *Piano di allenamento adattivo* → Funzionalità
   - *Nutrizione dinamica* → Funzionalità
   - **Animazioni:** ScrollStagger, card offset verticale, hover lift.
5. **Mini-demo tecnologia** — "Come funziona" in 4 step **ScrollExplainer** (sticky): Riprendi → L'AI legge 33 punti → Ricevi la correzione → Il piano si adatta. Visual per step: ExerciseFormPlayer, AdaptiveBodyMap, AnimatedRing (Form Score), AnimatedArea.
6. **Prova sociale breve** — 2–3 testimonianze (placeholder "in arrivo" finché non reali) → link a Storie.
7. **Prezzi in sintesi** — Free / Premium €9,90 (evidenziato) / Annuale €79,90 (-33%) → Vedi tutti i piani. Card Premium su fondo navy, CTA coral.
8. **CTA finale + FAQ rapida** — blocco navy centrato: H2 *"Pronto a vedere **cosa correggere**?"* + CTA coral "Calcola il tuo piano gratis" + 3 FAQ ("L'AI vede davvero?", "I video vengono salvati?", "Funziona a casa?") + link a FAQ.

### 5.2 COME FUNZIONA
**Obiettivo:** trasformare curiosità in fiducia (utenti scettici).
- Hero: *"Come **funziona**"* — sub: "Dalla fotocamera al feedback, in tempo reale."
- **In 3 passi** (ScrollExplainer): 1) Riprendi la tua esecuzione con la fotocamera; 2) L'AI analizza 33 punti del tuo corpo fino a 30 volte al secondo; 3) Ricevi feedback immediato + un piano che si adatta.
- **"Cosa vede l'AI"** — visual grande overlay scheletro annotato (angolo ginocchio, allineamento schiena, profondità, simmetria). Immagine: composizione prodotta / [Unsplash · "squat side view gym"] + overlay.
- **"Perché è diverso da YouTube"** — tabella confronto (generico vs sul TUO corpo, nessun feedback vs Form Score).
- **"La tua privacy è sacra"** — icona lucchetto grande, on-device, GDPR.
- **Regola copy:** mai "machine learning/rete neurale/algoritmo". Usa: "l'AI impara come ti muovi", "capisce i tuoi progressi", "si adatta a te".
- **Animazioni:** ScrollExplainer, FadeIn, AdaptiveBodyMap pulse.

### 5.3 FUNZIONALITÀ
**Obiettivo:** mostrare la profondità del prodotto.
- Hero: *"Tutto quello che serve, **un solo posto**"* (o "Ogni funzione al servizio della tua tecnica").
- Card funzioni — **"Correzione forma in tempo reale" per prima e più grande** (differenziale). Poi: Piano adattivo; "Come ti senti oggi?"; Feedback vocale in cuffia; Suggerimento carico progressivo; Nutrizione dinamica (+ Svuota-Frigo, sostituzione ingredienti); Registro progressi + Form Score; AI Coach (rilascio successivo); Integrazione wearable (rilascio successivo).
- **Animazioni:** ScrollStagger sulle card, ExerciseFormPlayer nella card differenziale, AnimatedArea/heatmap nelle card dati.
- **Immagini:** mockup app realistici; overlay scheletro; icone Lucide per ogni funzione.

### 5.4 PER CHI
**Obiettivo:** far dire "questo è per me".
- Hero: *"Un percorso per **ogni corpo**"* — sub: "Qualunque sia il tuo punto di partenza, Motion Insight guarda come ti muovi e adatta allenamento, tecnica e nutrizione a te."
- 6 segmenti (card cliccabili): Runner ed endurance · Ti alleni a casa · Vai in palestra · Neo-mamme (post-parto) · Over 50 · Rientro da infortunio. (copy pronto in progetto)
- **Immagini** (una foto reale per segmento):
  - [Pexels · "runner running outdoor"]
  - [Unsplash · "home workout living room"]
  - [Unsplash · "gym weight training"]
  - [Pexels · "postpartum mother exercise"] (foto rispettosa, non clinica)
  - [Unsplash · "senior fitness training"]
  - [Pexels · "physiotherapy rehabilitation exercise"]
- **Animazioni:** ScrollStagger, hover lift; CTA finale coral.

### 5.5 PREZZI
**Obiettivo:** convertire con trasparenza.
- Hero: *"Inizia gratis. **Cresci** quando vuoi."*
- 3 colonne: **Free** (€0) / **Premium** €9,90/mese (badge "Più scelto", evidenziata su fondo navy) / **Annuale** €79,90 (badge "-33%").
- Tabella comparativa funzionalità (spunte). Trust: "Prova 7 giorni gratis", "Disdici quando vuoi", "Soddisfatto o rimborsato 30 giorni".
- Sezione B2B in fondo ("Sei un'azienda? Motion Insight per il welfare aziendale").
- FAQ pricing. **CTA coral** unica per colonna evidenziata.
- **Animazioni:** ScrollReveal sulle colonne, card Premium sollevata.

### 5.6 STORIE
**Obiettivo:** prova sociale localizzata (reale).
- Hero: *"Storie **vere**"*.
- **Stato attuale: "In arrivo"** — card tratteggiata con badge "In arrivo" e nota onesta: "Preferiamo mostrarti testimonianze autentiche piuttosto che frasi inventate. Le stiamo raccogliendo ora — con nome, città e risultato reale."
- Layout futuro (predisponi): griglia testimonianze (foto reale, nome, età, città, sport, risultato, prima/dopo del Form Score), numeri aggregati.
- **Immagini:** per ora nessuna foto finta; placeholder/illustrazione sobria. In futuro ritratti reali con consenso.

### 5.7 RISORSE / BLOG
**Obiettivo:** traffico organico + autorità.
- Hero: *"Guide per **muoverti meglio**"*.
- **Indice** con filtro categorie: Tecnica · Allenamento · Nutrizione · Prevenzione infortuni. Card articolo (categoria, titolo, estratto, minuti di lettura).
- **Pagina articolo:** titolo, meta (categoria · minuti · data), corpo (H2/paragrafi/liste), CTA finale coral. 5 articoli già scritti (squat, push-up, 5K, proteine, mal di schiena).
- **Immagini hero articolo** (una per topic):
  - Squat → [Unsplash · "barbell squat"]
  - Push-up → [Pexels · "push up floor"]
  - 5K → [Unsplash · "running beginner park"]
  - Proteine → [Pexels · "high protein food eggs chicken"]
  - Mal di schiena → [Unsplash · "back stretching mobility"]
- **Animazioni:** ScrollStagger sulle card, FadeIn sull'articolo.

### 5.8 FAQ / SUPPORTO
**Obiettivo:** rimuovere obiezioni (privacy, camera).
- Hero: *"Domande **frequenti**"* — sub: "Privacy, fotocamera, funzionamento: tutto quello che c'è da sapere prima di iniziare."
- Accordion con le 7 domande (copy pronto in progetto), ordine: L'AI vede davvero? · I video vengono salvati? · Funziona a casa? · Serve un telefono potente? · Principiante assoluto? · Come disdico? · Sostituisce medico/fisio? (disclaimer).
- **Animazioni:** accordion espandibile fluido; icona lucchetto sulla domanda privacy.

### 5.9 CHI SIAMO
**Obiettivo:** missione e fiducia.
- Hero: *"Allenamento intelligente, **per tutti**"* — la guida di un PT esperto non dovrebbe dipendere dal budget o dalla città.
- Intro (missione) + 3 valori: Allenamento per tutti · Sicurezza prima di tutto · Tecnologia trasparente.
- **Immagini:** [Unsplash · "people training together"] o [Pexels · "fitness technology phone workout"]; tono umano, non corporate freddo.
- CTA finale coral.

---

## 6. Consegna attesa
Mockup per **ogni pagina**, **desktop + mobile**, rispettando i token della §1 e le animazioni della §2. Priorità: **Home → Come Funziona → Prezzi → Funzionalità → Per Chi → resto**. Se una scelta di leggibilità richiede una micro-deviazione dai token, segnalala.
