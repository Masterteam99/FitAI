# [SUPERATO] Revisione trigger biomeccanici critici — 32 nuovi esercizi (Track B1)

> **REVISIONE COMPLETATA il 10/06/2026.** Questo file è superato: la revisione interna
> ha corretto fasi invertite, baseline colonna e trigger non misurabili, e il seed è
> stato eseguito. Documenti aggiornati:
> - `docs/revisione-trigger-biomeccanici.md` — catalogo completo auto-generato (52 esercizi,
>   per la validazione da parte di un esperto di biomeccanica)
> - `docs/revisione-trigger-NOTE-CORREZIONI.md` — correzioni applicate e domande aperte
>
> Il contenuto sotto è la fotografia PRE-correzione, conservata per riferimento storico.

**Conteggio (storico):** 19 trigger `CRITICAL` · 35 trigger con `injuryRisk: true`.

**Come leggere:** ogni riga è una condizione angolare che, se violata nella fase indicata,
fa scattare il feedback. `BELOW_MIN` = angolo sotto la soglia minima; `ABOVE_MAX` = oltre la massima;
`OUT_OF_RANGE` = fuori intervallo. Verificare che soglia, severità e testo siano sensati e sicuri.

**Azione richiesta:** confermare / correggere riga per riga, poi dare l'ok al seed.

### front-squat

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_knee | flessione | BOTTOM | BELOW_MIN | **CRITICAL + injuryRisk** | Discesa eccessiva sotto carico frontale: stress capsulare sul ginocchio. Ferma la discesa al parallelo. |
| spine | inclinazione | THROUGHOUT | ABOVE_MAX | **CRITICAL + injuryRisk** | Busto che collassa in avanti nel front squat: rischio lombare e perdita del bilanciere. Tieni i gomiti alti e il petto eretto. |

### overhead-squat

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_knee | flessione | BOTTOM | BELOW_MIN | **CRITICAL + injuryRisk** | Discesa eccessiva con carico sopra la testa: instabilità e rischio articolare. Controlla la profondità. |
| left_shoulder | flessione | THROUGHOUT | BELOW_MIN | **CRITICAL + injuryRisk** | Le braccia cadono in avanti: la spalla non mantiene la flessione overhead. Rischio per cuffia e colonna. Lavora sulla mobilità prima di caricare. |
| spine | inclinazione | THROUGHOUT | ABOVE_MAX | **CRITICAL + injuryRisk** | Tronco troppo inclinato in avanti con carico aereo: stress lombare elevato. Mantieni il busto verticale. |

### pistol-squat

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_knee | flessione | BOTTOM | BELOW_MIN | **WARNING + injuryRisk** | Affondamento incontrollato in fondo: rischio per il ginocchio. Controlla la fase eccentrica. |

### leg-extension

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_knee | estensione | TOP | ABOVE_MAX | **WARNING + injuryRisk** | Iperestensione del ginocchio al lockout: stress sulla rotula. Non bloccare con strappo. |

### leg-curl

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| spine | iperestensione | THROUGHOUT | ABOVE_MAX | **ERROR + injuryRisk** | Il bacino si stacca e la schiena si inarca per aiutare il movimento. Tieni i fianchi premuti sul cuscino. |

### incline-bench-press

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_elbow | flessione | BOTTOM | BELOW_MIN | **CRITICAL + injuryRisk** | Gomito oltre il range sicuro nella discesa su panca inclinata: stress sulla cuffia. Ferma la discesa al petto. |
| right_elbow | flessione | BOTTOM | BELOW_MIN | **CRITICAL + injuryRisk** | Gomito destro troppo aperto: pressione anomala sulla capsula. Riduci la discesa. |
| left_shoulder | abduzione | THROUGHOUT | ABOVE_MAX | **CRITICAL + injuryRisk** | Gomiti a 90° rispetto al busto: stress eccessivo sulla spalla. Porta i gomiti a 45-75°. |

### dumbbell-bench-press

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_elbow | flessione | BOTTOM | BELOW_MIN | **CRITICAL + injuryRisk** | Discesa eccessiva con i manubri: iperallungamento della spalla. Limita la profondità a livello del petto. |
| left_shoulder | abduzione | THROUGHOUT | ABOVE_MAX | **CRITICAL + injuryRisk** | Gomiti troppo aperti: stress sulla cuffia dei rotatori. Mantieni i gomiti a 45-75° dal busto. |

### chest-fly

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_shoulder | adduzione | BOTTOM | ABOVE_MAX | **CRITICAL + injuryRisk** | Apertura eccessiva delle braccia: iperestensione della spalla sotto carico. Limita l'apertura quando senti tensione al petto. |

### dips

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_elbow | flessione | BOTTOM | BELOW_MIN | **CRITICAL + injuryRisk** | Discesa eccessiva: spalla che scende troppo sotto il gomito. Rischio per la capsula gleno-omerale. Ferma la discesa a 90°. |

### seated-cable-row

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| spine | inclinazione | THROUGHOUT | ABOVE_MAX | **ERROR + injuryRisk** | Ti sdrai all'indietro per tirare il cavo: usi la schiena come leva. Mantieni il busto quasi verticale. |
| spine | inclinazione | THROUGHOUT | BELOW_MIN | **WARNING + injuryRisk** | Schiena arrotondata in avanti nell'allungamento: mantieni la colonna neutra anche a braccia estese. |

### dumbbell-row

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| spine | inclinazione | THROUGHOUT | ABOVE_MAX | **ERROR + injuryRisk** | Schiena che si arrotonda con il manubrio: mantieni la colonna neutra appoggiandoti alla panca. |

### arnold-press

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_shoulder | rotazione | THROUGHOUT | ABOVE_MAX | **WARNING + injuryRisk** | Rotazione eccessiva della spalla con carico: controlla l'ampiezza della rotazione per proteggere la cuffia. |
| spine | iperestensione | THROUGHOUT | ABOVE_MAX | **CRITICAL + injuryRisk** | Iperlordosi lombare durante la spinta sopra la testa: rischio discale. Attiva l'addome e non inarcare la schiena. |

### skull-crusher

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_elbow | estensione | BOTTOM | BELOW_MIN | **CRITICAL + injuryRisk** | Discesa eccessiva del bilanciere verso la fronte con gomiti chiusi: rischio per il gomito. Controlla l'ampiezza e mantieni i gomiti stabili. |

### russian-twist

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| spine | rotazione | THROUGHOUT | ABOVE_MAX | **ERROR + injuryRisk** | Rotazione eccessiva e di slancio con la zona lombare: rischio per la colonna. Ruota in modo controllato dal torace. |

### mountain-climber

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| spine | neutrale | THROUGHOUT | ABOVE_MAX | **ERROR + injuryRisk** | I fianchi salgono o crollano: perdi l'allineamento del plank. Mantieni il bacino stabile e il core attivo. |

### burpee

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_knee | flessione | BOTTOM | BELOW_MIN | **WARNING + injuryRisk** | Affondamento incontrollato nello squat del burpee: controlla la discesa per proteggere le ginocchia. |
| spine | inclinazione | THROUGHOUT | ABOVE_MAX | **ERROR + injuryRisk** | Schiena che si arrotonda nella fase di plank/discesa per stanchezza: mantieni la colonna neutra anche a fine serie. |

### jump-squat

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_knee | flessione | BOTTOM | BELOW_MIN | **CRITICAL + injuryRisk** | Atterraggio con ginocchio eccessivamente flesso e rigido: forte impatto articolare. Ammortizza l'atterraggio e controlla la profondità. |
| spine | inclinazione | THROUGHOUT | ABOVE_MAX | **ERROR + injuryRisk** | Busto che collassa in avanti all'atterraggio: rischio lombare sotto impatto. Mantieni il petto alto. |

### box-jump

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_knee | flessione | BOTTOM | BELOW_MIN | **CRITICAL + injuryRisk** | Atterraggio rigido sul box con ginocchio molto flesso: rischio articolare e di valgismo. Atterra morbido con le ginocchia allineate alle punte. |

### kettlebell-swing

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| spine | inclinazione | BOTTOM | ABOVE_MAX | **CRITICAL + injuryRisk** | Schiena arrotondata nella cerniera dello swing: rischio lombare elevato sotto slancio. Mantieni la colonna neutra e fai cerniera dall'anca. |
| left_hip | estensione | TOP | ABOVE_MAX | **CRITICAL + injuryRisk** | Iperestensione lombare alla fine dello swing: non inarcare la schiena, ferma l'estensione in posizione neutra. |

### kettlebell-goblet-squat

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_knee | flessione | BOTTOM | BELOW_MIN | **WARNING + injuryRisk** | Discesa oltre il range controllato: fermati al parallelo o poco sotto. |

### glute-bridge

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_hip | estensione | TOP | ABOVE_MAX | **WARNING + injuryRisk** | Iperestensione lombare in cima: non inarcare la schiena, l'estensione viene dai glutei. |

### good-morning

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| spine | inclinazione | BOTTOM | ABOVE_MAX | **CRITICAL + injuryRisk** | Schiena arrotondata o busto oltre il parallelo con bilanciere sulle spalle: rischio lombare molto elevato. Mantieni colonna neutra e fermati prima dell'orizzontale. |

### wall-sit

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| left_knee | flessione | ISOMETRIC | BELOW_MIN | **WARNING + injuryRisk** | Scendi sotto i 90°: aumenti lo stress sulla rotula. Mantieni le cosce parallele. |

### bird-dog

| Articolazione | Movimento | Fase | Condizione | Severità | Feedback |
|---|---|---|---|---|---|
| spine | neutrale | THROUGHOUT | ABOVE_MAX | **ERROR + injuryRisk** | La schiena si inarca o il bacino ruota mentre estendi braccio e gamba: mantieni la colonna neutra e il bacino stabile (anti-rotazione). |
