# Revisione trigger biomeccanici — catalogo completo (52 esercizi)

> Documento generato automaticamente da `scripts/generate-trigger-doc.ts` a partire
> dai dati reali in `prisma/seed-biomechanical-specs.ts`. NON modificare a mano:
> correggere i dati del seed e rigenerare.

Data generazione: 2026-06-11

## A chi è rivolto

A un esperto di biomeccanica/chinesiologia che debba validare: (1) le soglie angolari,
(2) la severità assegnata a ogni violazione, (3) i testi di feedback mostrati all'utente.

## Come funziona il sistema (leggere prima di valutare)

L'app riprende l'utente con la webcam/fotocamera (vista laterale consigliata) e stima
33 punti del corpo con MediaPipe BlazePose. Da questi calcola **angoli 2D** per frame:

- **Ginocchio**: angolo interno anca–ginocchio–caviglia (180° = gamba tesa)
- **Gomito**: angolo interno polso–gomito–spalla (180° = braccio teso)
- **Spalla**: angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead)
- **Anca**: angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa)
- **Colonna**: inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili)

**Limiti strutturali della misura 2D** (vincolano cosa può essere controllato):

- Gli angoli sono limitati a 0–180°: l'iperestensione oltre i 180° NON è rilevabile.
- Rotazioni (es. rotazione del busto o della spalla) NON sono misurabili.
- L'arrotondamento della colonna è approssimato dall'inclinazione del busto: non distingue
  una schiena flessa da una neutra molto inclinata.
- Negli esercizi a corpo orizzontale (sdraiati, plank, quadrupedia) l'inclinazione della
  colonna parte da ~90°, non da 0°: i range tengono conto della posizione.

**Fasi del movimento**: il sistema individua le fasi osservando l'angolo-chiave
dell'esercizio: la fase `BOTTOM`/`TOP` è la finestra in cui l'angolo è vicino al
minimo/massimo osservato (per gli esercizi di tirata le etichette sono invertite, così
`TOP` = posizione contratta). `THROUGHOUT` = il controllo vale su tutto il movimento;
`ISOMETRIC` = tenuta statica. Un trigger definito su BOTTOM/TOP viene valutato solo nei
frame di quella fase.

**Penalità**: una violazione conta solo se persiste ≥200 ms consecutivi. Peso per severità:
WARNING=1, ERROR=3, CRITICAL=10, moltiplicato per la persistenza (frazione di frame in
violazione nella fase). `injuryRisk` evidenzia il feedback come rischio infortunio nell'UI.

## Cosa validare, riga per riga

1. La **soglia** (min/max) è anatomicamente sensata per l'esercizio e per il modo in cui
   l'angolo è misurato (vedi sopra)?
2. La **severità** è proporzionata (CRITICAL = potenziale danno acuto)?
3. Il **feedback** è corretto, chiaro e sicuro per un utente non esperto?

---

### affondi

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 80–110° | angolo SOPRA il massimo | ERROR | no | Affondo troppo corto: il ginocchio anteriore non raggiunge i 90°. Aumenta il passo e scendi più in basso. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 80–110° | angolo SOTTO il minimo | WARNING | ⚠️ sì | Affondo eccessivo: il ginocchio anteriore oltre la sicurezza. Ferma la discesa al parallelo con il pavimento. |
| Ginocchio dx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 80–110° | angolo SOPRA il massimo | ERROR | no | Affondo troppo corto sul lato destro. Porta il ginocchio posteriore quasi a terra nella discesa. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–15° | angolo SOPRA il massimo | ERROR | no | Busto inclinato in avanti nell'affondo. Mantieni il tronco verticale e le spalle sopra i fianchi. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 85–115° | angolo SOPRA il massimo | WARNING | no | Passo troppo corto: l'anca non si abbassa abbastanza. Aumenta la lunghezza del passo per un affondo completo. |

### arnold-press

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 160–178° | angolo SOTTO il minimo | WARNING | no | Lockout incompleto: estendi le braccia sopra la testa senza iperestendere i gomiti. |
| Colonna (iperestensione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–12° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Iperlordosi lombare durante la spinta sopra la testa: rischio discale. Attiva l'addome e non inarcare la schiena. |

### bird-dog

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Colonna (neutrale) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 70–105° | angolo FUORI dall'intervallo | ERROR | ⚠️ sì | La schiena si inarca o il bacino ruota mentre estendi braccio e gamba: mantieni la colonna neutra e il bacino stabile (anti-rotazione). |
| Anca sx (estensione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | TOP | 160–180° | angolo SOTTO il minimo | WARNING | no | La gamba non si estende del tutto: porta il tallone indietro fino all'allineamento con il busto, senza alzarla oltre. |
| Spalla sx (flessione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | TOP | 150–180° | angolo SOTTO il minimo | WARNING | no | Il braccio non si estende del tutto in avanti: portalo all'altezza della spalla mantenendo le scapole stabili. |

### box-jump

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 65–110° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Atterraggio rigido sul box con ginocchio molto flesso: rischio articolare e di valgismo. Atterra morbido con le ginocchia allineate alle punte. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–40° | angolo SOPRA il massimo | WARNING | no | Eccessiva inclinazione del busto al decollo o all'atterraggio: cerca un atterraggio controllato e composto. |

### bulgarian-split-squat

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 80–110° | angolo SOPRA il massimo | ERROR | no | Profondità insufficiente: il ginocchio anteriore non raggiunge i 90°. Abbassa il bacino fino al parallelo della coscia con il pavimento. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 80–110° | angolo SOTTO il minimo | WARNING | ⚠️ sì | Discesa eccessiva sulla gamba anteriore. Controlla la discesa e fermati quando la coscia è parallela. |
| Ginocchio dx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 80–105° | angolo SOTTO il minimo | WARNING | no | Ginocchio posteriore che tocca il pavimento con troppa forza. Controlla la discesa nella fase eccentrica. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–20° | angolo SOPRA il massimo | ERROR | no | Busto inclinato in avanti nel bulgaro. Rimani verticale: il peso del busto non deve spostarsi in avanti. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 85–120° | angolo SOPRA il massimo | WARNING | no | Passo anteriore troppo corto: l'anca non scende abbastanza. Porta il piede anteriore più avanti per permettere una discesa completa. |

### burpee

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 60–110° | angolo SOTTO il minimo | WARNING | ⚠️ sì | Affondamento incontrollato nello squat del burpee: controlla la discesa per proteggere le ginocchia. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–120° | angolo SOTTO il minimo | WARNING | no | Crolli a terra nella fase di push-up: controlla la discesa invece di lasciarti cadere. |

### calf-raise

_Rilevamento fasi: non configurato (volutamente: la spec usa solo THROUGHOUT)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (estensione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | THROUGHOUT | 160–180° | angolo SOTTO il minimo | WARNING | no | Le ginocchia si piegano: trasferisci il lavoro dai polpacci ai quadricipiti. Mantieni le gambe tese. |
| Colonna (neutrale) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–15° | angolo SOPRA il massimo | WARNING | no | Oscillazione del busto per slanciare il peso. Mantieni il corpo verticale e il movimento solo alla caviglia. |

### cat-cow

_Rilevamento fasi: non configurato (volutamente: la spec usa solo THROUGHOUT)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Colonna (flessione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 20–60° | angolo SOTTO il minimo | WARNING | no | Movimento di mobilità troppo ridotto: alterna in modo ampio e fluido flessione (cat) ed estensione (cow) della colonna. |

### chest-fly

_Rilevamento fasi: non configurato (volutamente: la spec usa solo THROUGHOUT)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Spalla sx (adduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | THROUGHOUT | 0–105° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Apertura eccessiva delle braccia: iperestensione della spalla sotto carico. Limita l'apertura quando senti tensione al petto. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | THROUGHOUT | 140–170° | angolo SOTTO il minimo | WARNING | no | Gomiti troppo piegati: stai facendo una distensione, non croci. Mantieni una leggera flessione fissa. |

### crunch

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Colonna (flessione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | TOP | 45–78° | angolo SOPRA il massimo | ERROR | no | Flessione troppo ridotta: il crunch è parziale. Contrai l'addome e porta le spalle a staccarsi completamente dal pavimento. |
| Colonna (flessione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | TOP | 45–78° | angolo SOTTO il minimo | WARNING | no | Ti alzi troppo in su: non è più un crunch ma un sit-up. Ferma il movimento dove senti la massima contrazione addominale. |
| Colonna (flessione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | BOTTOM | 82–95° | angolo SOTTO il minimo | WARNING | no | Non torni abbastanza alla posizione di partenza. Abbassa le spalle quasi a terra tra una ripetizione e l'altra. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | THROUGHOUT | 80–100° | angolo FUORI dall'intervallo | WARNING | no | Le ginocchia non sono a 90°: la posizione di partenza non è corretta. Sistema le gambe prima di iniziare. |

### curl-bicipiti

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 30–60° | angolo SOPRA il massimo | ERROR | no | Il gomito non sale abbastanza in cima: la contrazione del bicipite è incompleta. Porta il bilanciere verso le spalle. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 160–180° | angolo SOTTO il minimo | WARNING | no | Discesa parziale: il bicipite non si allunga completamente. Estendi le braccia fino al quasi-lockout nella fase bassa. |
| Gomito dx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 30–60° | angolo SOPRA il massimo | ERROR | no | Contrazione incompleta sul gomito destro. Porta il manubrio destro fino alle spalle senza oscillare il busto. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–15° | angolo SOPRA il massimo | WARNING | no | Stai usando il busto per sollevare il peso. Riduci il carico e tieni la schiena verticale per isolare il bicipite. |

### dips

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–100° | angolo SOPRA il massimo | ERROR | no | Discesa parziale: scendi finché la spalla è all'altezza del gomito. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–100° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Discesa eccessiva: spalla che scende troppo sotto il gomito. Rischio per la capsula gleno-omerale. Ferma la discesa a 90°. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 160–178° | angolo SOTTO il minimo | WARNING | no | Lockout incompleto: estendi le braccia in cima senza bloccare con strappo. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–30° | angolo SOPRA il massimo | WARNING | no | Forte inclinazione del busto sposta il lavoro sul petto: scegli intenzionalmente l'inclinazione in base al target (petto vs tricipiti). |

### dumbbell-bench-press

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 65–105° | angolo SOPRA il massimo | ERROR | no | Range corto: scendi finché i manubri sono all'altezza del petto. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 65–105° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Discesa eccessiva con i manubri: iperallungamento della spalla. Limita la profondità a livello del petto. |
| Spalla sx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | BOTTOM | 40–75° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Gomiti troppo aperti: stress sulla cuffia dei rotatori. Mantieni i gomiti a 45-75° dal busto. |

### dumbbell-row

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 25–55° | angolo SOTTO il minimo | WARNING | no | Busto troppo verticale: inclina di più per coinvolgere i dorsali. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 25–55° | angolo SOPRA il massimo | ERROR | ⚠️ sì | Il busto crolla verso l'orizzontale: probabile perdita di neutralità della colonna. Mantieni l'inclinazione costante appoggiandoti alla panca. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 50–85° | angolo SOPRA il massimo | ERROR | no | Il manubrio non sale abbastanza: tira il gomito verso l'alto oltre la linea del busto. |

### face-pull

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Spalla sx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | TOP | 80–110° | angolo SOTTO il minimo | ERROR | no | Le braccia non si aprono abbastanza nel face pull. Porta i polsi all'altezza delle orecchie per attivare completamente il deltoide posteriore. |
| Spalla dx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | TOP | 80–110° | angolo SOTTO il minimo | ERROR | no | Il braccio destro non si apre abbastanza. Porta entrambi i polsi all'altezza delle orecchie in modo simmetrico. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 70–100° | angolo SOPRA il massimo | WARNING | no | I gomiti si aprono troppo nella fase di trazione. Mantieni i gomiti all'altezza delle spalle durante il pull. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–10° | angolo SOPRA il massimo | WARNING | no | Stai inclinando il busto all'indietro per tirare il cavo. Rimani verticale e lavora solo con le braccia e le spalle. |

### front-raise

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Spalla sx (flessione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | TOP | 80–100° | angolo SOPRA il massimo | WARNING | no | Alzi il braccio oltre la parallela: coinvolgi i trapezi. Ferma all'altezza della spalla. |
| Spalla sx (flessione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | TOP | 80–100° | angolo SOTTO il minimo | ERROR | no | Alzata troppo bassa: porta il manubrio fino all'altezza della spalla. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–12° | angolo SOPRA il massimo | WARNING | no | Oscillazione del busto per slanciare: riduci il carico e mantieni il tronco fermo. |

### front-squat

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 65–105° | angolo SOPRA il massimo | ERROR | no | Profondità insufficiente nel front squat: scendi finché la coscia è sotto il parallelo. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 65–105° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Discesa eccessiva sotto carico frontale: stress capsulare sul ginocchio. Ferma la discesa al parallelo. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–25° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Busto che collassa in avanti nel front squat: rischio lombare e perdita del bilanciere. Tieni i gomiti alti e il petto eretto. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 55–100° | angolo SOPRA il massimo | WARNING | no | L'anca si flette poco: spingi i glutei indietro e in basso per uno squat completo. |

### glute-bridge

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Anca sx (estensione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | TOP | 165–180° | angolo SOTTO il minimo | ERROR | no | Estensione dell'anca incompleta: spingi i fianchi in alto contraendo i glutei. |

### goblet-squat

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 70–115° | angolo SOPRA il massimo | ERROR | no | Profondità insufficiente nel goblet squat. Scendi più in basso: il peso frontale ti aiuta a bilanciare. Porta la coscia sotto la parallela. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 70–115° | angolo SOTTO il minimo | WARNING | ⚠️ sì | Discesa oltre il range sicuro nel goblet squat. Mantieni il controllo e fermati al parallelo o poco sotto. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–25° | angolo SOPRA il massimo | ERROR | no | Busto troppo inclinato in avanti nel goblet squat. Il peso frontale deve aiutarti a stare eretto: sollevalo al petto. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 60–105° | angolo SOPRA il massimo | WARNING | no | Anca troppo poco flessa: stai facendo uno squat alto. Lascia che il kettlebell ti aiuti a sederti più in basso. |

### good-morning

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | BOTTOM | 30–80° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Busto oltre il parallelo con bilanciere sulle spalle: rischio lombare molto elevato. Mantieni la colonna neutra e fermati prima dell'orizzontale. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 70–110° | angolo SOPRA il massimo | WARNING | no | Cerniera dell'anca insufficiente: spingi i glutei indietro per allungare gli ischiocrurali. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | TOP | 165–180° | angolo SOTTO il minimo | ERROR | no | Estensione dell'anca incompleta in cima: porta i fianchi avanti contraendo i glutei. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | THROUGHOUT | 150–175° | angolo SOTTO il minimo | WARNING | no | Ginocchia troppo piegate: mantieni le gambe quasi tese per caricare gli ischiocrurali. |

### hammer-curl

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 30–60° | angolo SOPRA il massimo | ERROR | no | Contrazione incompleta: porta il manubrio fino alla spalla mantenendo la presa neutra. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 160–180° | angolo SOTTO il minimo | WARNING | no | Discesa parziale: estendi il braccio fino al quasi-lockout per allungare il brachiale. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–15° | angolo SOPRA il massimo | WARNING | no | Stai usando il busto per slanciare: tieni la schiena verticale e i gomiti fissi. |

### hamstring-stretch

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | ISOMETRIC | 60–110° | angolo SOPRA il massimo | WARNING | no | Allungamento ridotto: aumenta gradualmente la flessione dell'anca senza forzare oltre la tensione confortevole. |

### hip-flexor-stretch

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Anca sx (estensione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | ISOMETRIC | 160–180° | angolo SOTTO il minimo | WARNING | no | Allungamento insufficiente del flessore dell'anca: spingi delicatamente il bacino in avanti mantenendo il busto eretto. |
| Colonna (neutrale) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | ISOMETRIC | 0–15° | angolo SOPRA il massimo | WARNING | no | Stai inarcando la zona lombare invece di allungare il flessore: mantieni la pelvi in retroversione e il core attivo. |

### hip-thrust

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Anca sx (estensione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | TOP | 170–180° | angolo SOTTO il minimo | ERROR | no | Estensione dell'anca incompleta in cima. Spingi i fianchi verso il soffitto e contrai i glutei al massimo. |
| Anca sx (estensione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 90–130° | angolo SOTTO il minimo | WARNING | no | Discesa eccessiva: il bacino tocca terra. Mantieni una leggera tensione nei glutei anche nella fase bassa. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | TOP | 80–100° | angolo FUORI dall'intervallo | WARNING | no | Angolo del ginocchio sbagliato al lockout: il piede è posizionato in modo errato. Regola la distanza dal banco finché il ginocchio è a 90° in cima. |

### incline-bench-press

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–110° | angolo SOPRA il massimo | ERROR | no | Discesa corta: porta il bilanciere fino alla parte alta del petto. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–110° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Gomito oltre il range sicuro nella discesa su panca inclinata: stress sulla cuffia. Ferma la discesa al petto. |
| Gomito dx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–110° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Gomito destro troppo aperto: pressione anomala sulla capsula. Riduci la discesa. |
| Spalla sx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | BOTTOM | 40–75° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Gomiti a 90° rispetto al busto: stress eccessivo sulla spalla. Porta i gomiti a 45-75°. |

### jump-squat

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 70–110° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Atterraggio con ginocchio eccessivamente flesso e rigido: forte impatto articolare. Ammortizza l'atterraggio e controlla la profondità. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | TOP | 165–180° | angolo SOTTO il minimo | WARNING | no | Estensione incompleta nel salto: spingi con forza fino alla completa estensione di anche e ginocchia. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–35° | angolo SOPRA il massimo | ERROR | ⚠️ sì | Busto che collassa in avanti all'atterraggio: rischio lombare sotto impatto. Mantieni il petto alto. |

### kettlebell-goblet-squat

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 65–110° | angolo SOPRA il massimo | ERROR | no | Profondità insufficiente: usa il kettlebell come contrappeso per scendere sotto il parallelo. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 65–110° | angolo SOTTO il minimo | WARNING | ⚠️ sì | Discesa oltre il range controllato: fermati al parallelo o poco sotto. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–25° | angolo SOPRA il massimo | ERROR | no | Busto troppo inclinato: tieni il kettlebell al petto e resta eretto. |

### kettlebell-swing

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | BOTTOM | 30–65° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Busto oltre il range della cerniera: probabile schiena arrotondata sotto slancio, rischio lombare elevato. Mantieni la colonna neutra e fai cerniera dall'anca. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | TOP | 0–15° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Iperestensione lombare alla fine dello swing: non inarcare la schiena, ferma l'estensione in posizione neutra. |
| Anca sx (estensione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | TOP | 165–180° | angolo SOTTO il minimo | ERROR | no | Estensione dell'anca incompleta in cima: lo swing è guidato dall'anca, non dalle braccia. Spingi i fianchi avanti e contrai i glutei. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 130–165° | angolo SOTTO il minimo | WARNING | no | Ginocchia troppo piegate: stai facendo uno squat, non uno swing. La cerniera è all'anca con ginocchia poco flesse. |

### lat-pulldown

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 40–70° | angolo SOPRA il massimo | ERROR | no | Trazione incompleta: porta la barra fino alla parte alta del petto. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 150–180° | angolo SOTTO il minimo | WARNING | no | Non allunghi del tutto i dorsali: estendi le braccia in alto controllando il ritorno. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–25° | angolo SOPRA il massimo | WARNING | no | Eccessiva oscillazione all'indietro per tirare la barra. Limita l'inclinazione del busto e usa i dorsali. |

### lateral-raise

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Spalla sx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | TOP | 80–110° | angolo SOTTO il minimo | ERROR | no | Alzata troppo bassa: il braccio non raggiunge la parallela. Solleva il manubrio fino all'altezza della spalla. |
| Spalla sx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | TOP | 80–110° | angolo SOPRA il massimo | WARNING | no | Braccio alzato oltre la parallela: attivi i trapezi. Ferma il movimento quando il braccio è parallelo al pavimento. |
| Spalla sx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | BOTTOM | 0–15° | angolo SOPRA il massimo | WARNING | no | Manubrio non torna alla posizione di partenza: perdi il range completo di movimento. Abbassa il braccio fino ai fianchi. |
| Spalla dx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | TOP | 80–110° | angolo SOTTO il minimo | ERROR | no | Il braccio destro non raggiunge la parallela. Porta il manubrio all'altezza della spalla con movimento controllato. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–10° | angolo SOPRA il massimo | WARNING | no | Stai oscillando il busto per sollevare il peso. Riduci il carico e mantieni il tronco verticale. |

### leg-curl

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | TOP | 30–60° | angolo SOPRA il massimo | ERROR | no | Flessione incompleta: porta il tallone più vicino al gluteo per contrarre del tutto gli ischiocrurali. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 155–180° | angolo SOTTO il minimo | WARNING | no | Non allunghi completamente i femorali: estendi la gamba in modo controllato. |

### leg-extension

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (estensione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | TOP | 160–178° | angolo SOTTO il minimo | ERROR | no | Estensione incompleta del ginocchio: contrai completamente il quadricipite in cima. |
| Ginocchio sx (estensione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | TOP | 160–178° | angolo SOPRA il massimo | WARNING | ⚠️ sì | Iperestensione del ginocchio al lockout: stress sulla rotula. Non bloccare con strappo. |
| Ginocchio sx (estensione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 80–100° | angolo FUORI dall'intervallo | WARNING | no | Angolo di partenza errato: regola il sedile in modo che il ginocchio parta a circa 90°. |

### leg-press

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 70–110° | angolo SOPRA il massimo | ERROR | no | Profondità insufficiente al leg press. Piega le ginocchia almeno a 90° per attivare completamente quadricipiti e glutei. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 70–110° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Ginocchio piegato oltre il range sicuro al leg press. Rischio di stress sulla rotula. Regola il fermo della macchina per limitare la discesa. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | TOP | 155–175° | angolo SOTTO il minimo | WARNING | no | Lockout incompleto al leg press: le ginocchia rimangono piegate. Estendi le gambe quasi completamente tra ogni ripetizione. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | TOP | 155–175° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Ginocchia iperestese al lockout del leg press: rischio articolare. Non bloccare completamente le ginocchia: mantieni una lieve flessione. |
| Ginocchio dx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 70–110° | angolo SOPRA il massimo | ERROR | no | Gamba destra non scende abbastanza al leg press. Controlla che il piede destro sia posizionato simmetricamente sulla piattaforma. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 70–110° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Il bacino si stacca dalla seduta nella discesa: il rachide lombare si flette sotto carico. Riduci il range di movimento. |

### military-press

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 80–100° | angolo SOPRA il massimo | ERROR | no | Posizione di partenza troppo alta: il bilanciere non è all'altezza delle orecchie. Abbassa il bilanciere alla clavicola. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 160–178° | angolo SOTTO il minimo | WARNING | no | Lockout incompleto sopra la testa. Estendi completamente le braccia in cima senza iperestendere i gomiti. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 160–178° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Gomiti iperestesi al lockout aereo: rischio tendineo. Mantieni minima flessione residua a braccia tese. |
| Gomito dx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 80–100° | angolo FUORI dall'intervallo | WARNING | no | Asimmetria nella posizione di partenza: il gomito destro non è allineato con il sinistro. Correggi la presa. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–10° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Iperlordosi lombare durante la spinta: rischio discale sotto carico aereo. Attiva l'addome e non estendere la schiena. |
| Spalla sx (flessione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | TOP | 160–180° | angolo SOTTO il minimo | ERROR | no | La spalla sinistra non completa la flessione sopra la testa. Lavora sulla mobilità toracica e della cuffia. |

### mountain-climber

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | TOP | 60–100° | angolo SOPRA il massimo | WARNING | no | Il ginocchio non sale abbastanza verso il petto: aumenta la flessione dell'anca a ogni ripetizione. |
| Colonna (neutrale) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 50–95° | angolo FUORI dall'intervallo | ERROR | ⚠️ sì | I fianchi salgono o crollano: perdi l'allineamento del plank. Mantieni il bacino stabile e il core attivo. |

### overhead-squat

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 65–105° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Discesa eccessiva con carico sopra la testa: instabilità e rischio articolare. Controlla la profondità. |
| Spalla sx (flessione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | THROUGHOUT | 160–180° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Le braccia cadono in avanti: la spalla non mantiene la flessione overhead. Rischio per cuffia e colonna. Lavora sulla mobilità prima di caricare. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–20° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Tronco troppo inclinato in avanti con carico aereo: stress lombare elevato. Mantieni il busto verticale. |

### panca-piana

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–110° | angolo SOPRA il massimo | ERROR | no | Discesa troppo corta: il bilanciere non arriva al petto. Abbassa fino al contatto con lo sterno. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–110° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Gomito oltre il range di sicurezza nella discesa. Rischio di stress sulla cuffia dei rotatori. Ferma la discesa al petto. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 160–175° | angolo SOTTO il minimo | WARNING | no | Lockout incompleto in cima. Estendi i gomiti senza iperestenderli per completare la ripetizione. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 160–175° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Gomiti iperestesi in chiusura: rischio articolare. Mantieni una leggera flessione residua nei gomiti al lockout. |
| Gomito dx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–110° | angolo SOPRA il massimo | ERROR | no | Gomito destro non raggiunge la profondità corretta. Abbassa il bilanciere simmetricamente fino al petto. |
| Gomito dx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–110° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Gomito destro troppo aperto: pressione anomala sulla capsula articolare. Riduci la discesa. |
| Spalla sx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | BOTTOM | 40–75° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Gomiti troppo aperti a 90°. Stress eccessivo sulla spalla. Porta i gomiti a 45-75° rispetto al busto. |
| Spalla sx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | BOTTOM | 40–75° | angolo SOTTO il minimo | WARNING | no | Gomiti troppo stretti al busto: attiveresti più i tricipiti che il petto. Allarga leggermente i gomiti. |

### pistol-squat

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 30–70° | angolo SOPRA il massimo | ERROR | no | Pistol squat parziale: non raggiungi la massima flessione. Scendi in modo controllato fino in fondo. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 30–70° | angolo SOTTO il minimo | WARNING | ⚠️ sì | Affondamento incontrollato in fondo: rischio per il ginocchio. Controlla la fase eccentrica. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–45° | angolo SOPRA il massimo | WARNING | no | Eccessiva inclinazione del busto per bilanciarti. Lavora sulla mobilità della caviglia per restare più eretto. |

### plank

_Rilevamento fasi: esercizio statico (tutte le fasi THROUGHOUT)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Anca sx (neutrale) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | THROUGHOUT | 165–180° | angolo SOTTO il minimo | ERROR | ⚠️ sì | Il corpo perde l'allineamento: il bacino scende o si alza. Attiva addome e glutei e spingi i talloni indietro. |

### plank-laterale

_Rilevamento fasi: esercizio statico (tutte le fasi THROUGHOUT)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Anca sx (abduzione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | THROUGHOUT | 160–180° | angolo SOTTO il minimo | ERROR | ⚠️ sì | Il fianco cede verso il basso: bacino non allineato con spalle e caviglie. Attiva l'obliquo e solleva i fianchi per creare una linea retta. |

### push-up

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–110° | angolo SOPRA il massimo | ERROR | no | Push-up troppo corto: il petto non sfiora il pavimento. Abbassa il corpo finché il petto quasi tocca terra. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 70–110° | angolo SOTTO il minimo | WARNING | no | Scendi troppo in basso rispetto alle spalle. Ferma la discesa quando il gomito raggiunge i 90° o appena sotto. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 155–180° | angolo SOTTO il minimo | WARNING | no | Lockout incompleto in cima. Estendi completamente le braccia alla fine di ogni ripetizione. |
| Anca sx (neutrale) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | THROUGHOUT | 160–180° | angolo SOTTO il minimo | ERROR | ⚠️ sì | Fianchi che cadono verso il basso o si alzano verso l'alto. Mantieni il corpo come una tavola rigida dal tallone alla testa. |
| Spalla sx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | BOTTOM | 30–65° | angolo SOPRA il massimo | WARNING | ⚠️ sì | Gomiti troppo aperti a 90°: carico eccessivo sulla cuffia. Porta i gomiti a 45° rispetto al busto. |

### rematore-bilanciere

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 30–60° | angolo SOTTO il minimo | ERROR | no | Busto troppo verticale: stai eseguendo quasi uno shrug. Inclina il tronco a 45° con i fianchi spinti indietro. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 30–60° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Schiena quasi orizzontale con carico: stress discale elevato. Raddrizza il busto a 45° e attiva il core. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 50–80° | angolo SOPRA il massimo | ERROR | no | Il bilanciere non sale abbastanza: non stai completando la trazione. Porta i gomiti oltre il piano della schiena. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 155–180° | angolo SOTTO il minimo | WARNING | no | Le braccia non si allungano completamente nella fase di discesa. Estendi i gomiti per allungare completamente i dorsali. |
| Spalla sx (abduzione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | TOP | 0–30° | angolo SOPRA il massimo | WARNING | no | Gomiti troppo aperti: stai attivando il deltoide posteriore invece dei dorsali. Porta i gomiti vicini al corpo. |

### romanian-deadlift

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–45° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Schiena arrotondata nella discesa del rumeno: rischio di lesione lombare. Mantieni la curva lombare naturale e il petto alto. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 50–90° | angolo SOPRA il massimo | WARNING | no | Range di movimento corto: gli ischiocrurali non si allungano abbastanza. Scendi più in basso mantenendo la schiena neutra. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | TOP | 165–180° | angolo SOTTO il minimo | ERROR | no | Estensione dell'anca incompleta in cima. Spingi i fianchi in avanti e contrai i glutei al lockout. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | THROUGHOUT | 145–175° | angolo SOTTO il minimo | WARNING | no | Ginocchia troppo piegate: stai eseguendo un mezzo stacco, non un rumeno. Mantieni le gambe quasi tese durante tutto il movimento. |

### russian-twist

_Rilevamento fasi: non configurato (volutamente: la spec usa solo THROUGHOUT)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 20–50° | angolo SOTTO il minimo | WARNING | no | Busto troppo verticale: reclina il tronco a circa 45° per attivare gli obliqui. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 20–50° | angolo SOPRA il massimo | ERROR | ⚠️ sì | Busto troppo reclinato all'indietro: la zona lombare va sotto stress. Risali verso i 45° e ruota in modo controllato dal torace. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | THROUGHOUT | 80–120° | angolo FUORI dall'intervallo | WARNING | no | Le gambe oscillano per slancio: tienile ferme e stabili per isolare il core. |

### seated-cable-row

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 50–80° | angolo SOPRA il massimo | ERROR | no | Tirata incompleta: porta i gomiti oltre il busto e stringi le scapole. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–25° | angolo SOPRA il massimo | ERROR | ⚠️ sì | Ti sdrai all'indietro per tirare il cavo: usi la schiena come leva. Mantieni il busto quasi verticale. |

### skull-crusher

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (estensione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 155–175° | angolo SOTTO il minimo | ERROR | no | Estensione incompleta del tricipite: stendi del tutto il gomito senza spostarlo. |
| Gomito sx (estensione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 40–70° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Discesa eccessiva del bilanciere verso la fronte con gomiti chiusi: rischio per il gomito. Controlla l'ampiezza e mantieni i gomiti stabili. |
| Spalla sx (flessione) | angolo gomito–spalla–anca (0° = braccio lungo il fianco, 90° = braccio perpendicolare al busto, 180° = braccio overhead) | THROUGHOUT | 75–100° | angolo FUORI dall'intervallo | WARNING | no | Le braccia si spostano avanti/indietro: mantieni le braccia perpendicolari al pavimento per isolare i tricipiti. |

### squat

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 70–110° | angolo SOPRA il massimo | ERROR | no | Profondità insufficiente: il ginocchio non raggiunge il parallelo. Scendi finché la coscia è parallela al pavimento. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 70–110° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Discesa eccessiva sotto il parallelo. Rischio di stress capsulare sul ginocchio. Ferma la discesa al parallelo. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | TOP | 160–180° | angolo SOTTO il minimo | WARNING | no | Lockout incompleto. Estendi completamente le gambe tra una ripetizione e l'altra. |
| Ginocchio dx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 70–110° | angolo SOPRA il massimo | ERROR | no | Profondità insufficiente sul lato destro. Lavora sulla mobilità dell'anca e della caviglia per scendere più in basso. |
| Ginocchio dx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 70–110° | angolo SOTTO il minimo | CRITICAL | ⚠️ sì | Ginocchio destro eccessivamente flesso oltre il range sicuro. Riduci la profondità della discesa. |
| Ginocchio dx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | TOP | 160–180° | angolo SOTTO il minimo | WARNING | no | Lockout incompleto sulla gamba destra. Stendi completamente il ginocchio prima di iniziare la ripetizione successiva. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–35° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Tronco troppo inclinato in avanti. Rischio lombare sotto carico. Mantieni il petto alto e attiva il core. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 60–100° | angolo SOPRA il massimo | WARNING | no | L'anca si flette poco: stai scendendo solo con le ginocchia. Spingi i glutei indietro come per sederti. |

### stacco-da-terra

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–50° | angolo SOPRA il massimo | CRITICAL | ⚠️ sì | Schiena arrotondata durante lo stacco. Rischio di ernia discale. Mantieni il petto alto e attiva i dorsali per fissare la colonna. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 75–115° | angolo SOTTO il minimo | ERROR | ⚠️ sì | Posizione di partenza troppo bassa: stai caricando la schiena come uno squat. Alza il bacino per creare tensione sugli ischiocrurali. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 75–115° | angolo SOPRA il massimo | WARNING | no | Posizione di partenza troppo alta: l'anca parte già quasi estesa. Abbassa il bacino per attivare le gambe nella spinta. |
| Anca sx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | TOP | 165–180° | angolo SOTTO il minimo | ERROR | no | Lockout incompleto: l'anca non si estende completamente in cima. Spingi i fianchi in avanti e contrai i glutei. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 80–130° | angolo SOTTO il minimo | ERROR | no | Ginocchia troppo flesse nella partenza: stai eseguendo uno squat, non uno stacco. Raddrizza le gambe e porta le ginocchia leggermente indietro. |
| Anca dx (flessione) | angolo interno spalla–anca–ginocchio (180° = corpo in linea, valori piccoli = anca flessa) | BOTTOM | 75–115° | angolo SOTTO il minimo | ERROR | ⚠️ sì | Asimmetria del bacino nella partenza: lato destro troppo basso. Livella i fianchi prima di staccare il bilanciere. |

### step-up

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | BOTTOM | 75–110° | angolo SOPRA il massimo | WARNING | no | Rialzo troppo basso: scegli un'altezza che porti il ginocchio vicino a 90° per un lavoro completo. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | TOP | 160–180° | angolo SOTTO il minimo | WARNING | no | Estensione incompleta in cima: raddrizza completamente la gamba di appoggio. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–25° | angolo SOPRA il massimo | WARNING | no | Eccessiva inclinazione in avanti per spingerti su: mantieni il busto eretto e spingi dal tallone. |

### trazioni

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 30–70° | angolo SOPRA il massimo | ERROR | no | Non stai salendo abbastanza: il mento non supera la sbarra. Aumenta la trazione con le braccia e contrai i dorsali. |
| Gomito sx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 155–180° | angolo SOTTO il minimo | ERROR | no | Discesa incompleta: le braccia non si estendono del tutto. Scendi fino al completo allungamento per ogni ripetizione. |
| Gomito dx (flessione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 30–70° | angolo SOPRA il massimo | ERROR | no | Il lato destro non arriva in cima. Verifica l'asimmetria nella forza di trazione: lavora sull'equilibrio dorsale. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–20° | angolo SOPRA il massimo | WARNING | no | Tronco troppo inclinato all'indietro durante la trazione. Mantieni il corpo quasi verticale e tira con i gomiti verso i fianchi. |

### tricipiti-cavi

_Rilevamento fasi: attivo (etichette invertite: TOP = posizione contratta)._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Gomito sx (estensione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 160–178° | angolo SOTTO il minimo | ERROR | no | Estensione incompleta del tricipite: il gomito non si raddrizza. Porta la corda fino in fondo a ogni ripetizione. |
| Gomito sx (estensione) | angolo interno polso–gomito–spalla (180° = braccio teso) | TOP | 60–90° | angolo SOPRA il massimo | WARNING | no | Gomito troppo aperto nella fase alta: perdi tensione sul tricipite. Mantieni il gomito a circa 90° nella posizione alta. |
| Gomito dx (estensione) | angolo interno polso–gomito–spalla (180° = braccio teso) | BOTTOM | 160–178° | angolo SOTTO il minimo | ERROR | no | Estensione incompleta sul lato destro. Porta il manico giù simmetricamente fino al lockout del gomito. |
| Colonna (inclinazione) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | THROUGHOUT | 0–15° | angolo SOPRA il massimo | WARNING | no | Busto che si inclina in avanti durante il push-down. Rimani verticale e tieni i gomiti fissi ai fianchi. |

### wall-sit

_Rilevamento fasi: attivo._

| Articolazione | Misura | Fase | Range | Condizione | Severità | Rischio | Feedback all'utente |
|---|---|---|---|---|---|---|---|
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | ISOMETRIC | 80–100° | angolo SOPRA il massimo | WARNING | no | Non scendi a 90°: abbassati finché le cosce sono parallele al pavimento. |
| Ginocchio sx (flessione) | angolo interno anca–ginocchio–caviglia (180° = gamba tesa) | ISOMETRIC | 80–100° | angolo SOTTO il minimo | WARNING | ⚠️ sì | Scendi sotto i 90°: aumenti lo stress sulla rotula. Mantieni le cosce parallele. |
| Colonna (neutrale) | inclinazione della linea anca→spalla rispetto alla VERTICALE (0° = busto eretto, 90° = busto orizzontale; senza segno: avanti e indietro sono indistinguibili) | ISOMETRIC | 0–12° | angolo SOPRA il massimo | WARNING | no | La schiena si stacca dal muro: mantieni tutta la colonna a contatto con la parete. |

---

## Riepilogo

- Esercizi: **52**
- Trigger totali: **178**
- Trigger CRITICAL: **34**
- Trigger con rischio infortunio: **54**

