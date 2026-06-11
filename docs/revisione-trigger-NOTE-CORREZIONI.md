# Note di revisione trigger biomeccanici — correzioni applicate e domande aperte

> Complemento di `revisione-trigger-biomeccanici.md` (catalogo completo auto-generato).
> Questa revisione interna (10/06/2026) ha verificato ogni trigger contro il modo in cui
> il sistema misura davvero gli angoli. Qui sono documentate le correzioni applicate e
> i punti che restano da validare con un esperto di biomeccanica.

## Correzioni applicate in questa revisione

### 1. Fasi invertite negli esercizi di tirata (bug sistemico, anche su esercizi già live)

Il rilevatore di fasi etichetta `BOTTOM` = angolo minimo osservato. Nelle tirate
(curl, trazioni, rematore, pulley, lat machine…) la posizione **contratta** — il "top"
del movimento — coincide però con l'angolo **minimo** del gomito. Risultato: i trigger
scritti per il "top" venivano valutati sui frame sbagliati, generando falsi errori del
tipo "contrazione incompleta" su ogni ripetizione corretta.

**Fix**: il rilevatore ora supporta l'inversione delle etichette per esercizio
(`TOP` = posizione contratta). Esercizi corretti: `curl-bicipiti`, `trazioni`,
`rematore-bilanciere`, `tricipiti-cavi`, `face-pull` (ora su angolo gomito),
`seated-cable-row`, `dumbbell-row`, `hammer-curl`, `leg-curl`, `mountain-climber`,
`crunch`.

### 2. Inclinazione colonna con baseline sbagliata (esercizi a corpo orizzontale)

L'inclinazione della colonna è misurata rispetto alla **verticale**: da sdraiati,
in plank o in quadrupedia il valore parte da ~90°, non da 0°. I trigger scritti con
range 0–15° scattavano quindi **su ogni frame** anche con tecnica perfetta.

| Esercizio | Correzione |
|---|---|
| `plank`, `plank-laterale` | Controllo colonna rimosso; la linea del corpo è misurata dall'angolo dell'anca (già presente, promosso a ERROR) |
| `push-up` | Controllo colonna sostituito con controllo angolo anca 160–180° (rileva bacino che cade/sale) |
| `hip-thrust` | Controllo colonna rimosso (la linea spalla-anca varia per geometria durante il movimento) |
| `crunch` | Range ricalibrati sulla baseline supina (disteso ≈ 90°, contratto ≈ 55-75°) e condizioni corrette |
| `leg-curl` | Controllo colonna rimosso (prono: non misurabile) |
| `glute-bridge` | Controllo colonna rimosso (supino: non misurabile) |
| `mountain-climber` | Range ricalibrato 50–95° OUT_OF_RANGE (posizione di plank alto) |
| `bird-dog` | Range ricalibrato 70–105° OUT_OF_RANGE (quadrupedia) |
| `burpee` | Controllo colonna rimosso (il movimento alterna eretto ↔ plank, nessun range fisso è valido) |
| `hamstring-stretch` | Controllo colonna rimosso (in una flessione profonda 50–90° di inclinazione sono normali: penalizzava gli allungamenti corretti) |

### 3. Trigger non misurabili in 2D (rimossi)

- `arnold-press` — "rotazione spalla 0–90°": la rotazione non è misurabile; l'angolo
  usato misura l'elevazione del braccio e supera 90° in ogni spinta overhead (falso
  positivo su ogni ripetizione).
- `trazioni` / `lat-pulldown` — "spalle verso le orecchie": a braccia overhead l'angolo
  gomito-spalla-anca è sempre ≈160-180°, il trigger scattava sempre. L'elevazione
  scapolare non è rilevabile con i keypoint attuali.
- `seated-cable-row` — trigger BELOW_MIN con minimo 0°: matematicamente non può scattare.
- `russian-twist` — "rotazione" non misurabile: il controllo è stato convertito in
  controllo di **posizione del busto** (reclinato 20–50°), con feedback riscritti.

### 4. Trigger "morti" con soglie oltre i 180°

L'angolo 2D è limitato a 180°: l'iperestensione non è rilevabile da quell'angolo.
- `hip-thrust`, `glute-bridge` — trigger di iperestensione lombare ABOVE_MAX >180° rimossi.
- `kettlebell-swing` — il controllo di iperestensione in cima è stato **spostato sulla
  colonna** (busto che si reclina >15° oltre la verticale a swing chiuso): stessa
  intenzione clinica, misura raggiungibile.

### 5. Soglie riviste nel merito

- `good-morning` — il vecchio max 45° di inclinazione segnalava come CRITICAL anche le
  ripetizioni corrette (il busto a fine cerniera arriva normalmente a 50–80°). Nuovo
  range BOTTOM 30–80°, CRITICAL solo oltre il parallelo.
- `kettlebell-swing` — profondità cerniera: max 55° → 65° (una cerniera profonda con
  colonna neutra è normale); feedback riformulato per non confondere inclinazione
  con arrotondamento.
- Flare dei gomiti su `panca-piana`, `incline-bench-press`, `dumbbell-bench-press`,
  `push-up`: il controllo era THROUGHOUT ma al lockout il braccio è ~90° dal busto per
  geometria (falso positivo a fine di ogni rep). Ora valutato solo in fase BOTTOM,
  dove il flare è realmente misurabile e rilevante.
- `chest-fly` — il controllo "chiusura completa" non è distinguibile in 2D (posizione
  chiusa ≈ 90° come quella di lavoro) ed è stato rimosso; resta il controllo di
  sicurezza sull'apertura eccessiva (>105°), riformulato come THROUGHOUT.
- 32 nuovi esercizi: aggiunta la configurazione del rilevatore di fasi (prima i trigger
  su BOTTOM/TOP/ISOMETRIC non potevano scattare).

## Domande aperte per l'esperto

1. **Profondità squat come rischio**: il sistema segnala CRITICAL la discesa sotto
   ~65-70° di flessione del ginocchio (squat, front-squat, goblet…). La letteratura
   moderna considera lo squat profondo sicuro con mobilità e controllo adeguati: la
   scelta attuale è volutamente conservativa per utenti non seguiti. Confermare o
   ammorbidire (es. ERROR senza injuryRisk)?
2. **Soglie di inclinazione del busto** (squat 35°, front-squat 25°, overhead-squat 20°,
   goblet 25°, affondi 15°, bulgarian 20°): valori plausibili ma da validare,
   l'antropometria individuale (femori lunghi) può richiedere inclinazioni maggiori.
3. **Dips**: profondità CRITICAL sotto i 70° di flessione del gomito — confermare la
   soglia per la capsula gleno-omerale.
4. **Wall-sit**: WARNING sotto gli 80° di flessione (sotto il parallelo). Adeguato per
   pubblico riabilitativo?
5. **Severità del valgismo**: il valgismo dinamico del ginocchio NON è attualmente
   misurato (servirebbe la vista frontale + angolo proiettato anca-ginocchio-caviglia).
   È il singolo controllo mancante di maggior valore clinico: valutare se aggiungerlo
   in una iterazione futura.
6. **`cat-cow`**: il trigger presente è di fatto inerte (la flesso-estensione della
   colonna in quadrupedia non modifica significativamente la linea spalla-anca).
   Lasciato come placeholder: l'esercizio è a rischio nullo. Rimuovere o lasciare?

## Stato

- Revisione interna completata e correzioni applicate al seed + rilevatore di fasi.
- Catalogo completo per la validazione esterna: `docs/revisione-trigger-biomeccanici.md`.
- Il seed è stato eseguito: gli esercizi e le spec corrette sono nel database.
