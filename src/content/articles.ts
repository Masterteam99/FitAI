// Contenuti editoriali del blog "Risorse" — Motion Insight.
// Articoli veri (contenuto informativo, non recensioni). Tono del brief:
// concreto, incoraggiante, niente tecnicismi, disclaimer di sicurezza dove serve.

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export const ARTICLE_CATEGORIES = ["Tecnica", "Allenamento", "Nutrizione", "Prevenzione infortuni"] as const;
export type ArticleCategory = (typeof ARTICLE_CATEGORIES)[number];

export interface Article {
  slug: string;
  title: string;
  category: ArticleCategory;
  excerpt: string;
  readingMin: number;
  date: string; // ISO
  body: ArticleBlock[];
}

export const ARTICLES: Article[] = [
  {
    slug: "come-fare-uno-squat-corretto",
    title: "Come fare uno squat corretto (e perché le ginocchia ti fanno male)",
    category: "Tecnica",
    excerpt: "La guida pratica allo squat: profondità, schiena, ginocchia e l'errore invisibile dei talloni che si sollevano.",
    readingMin: 5,
    date: "2026-07-14",
    body: [
      { type: "p", text: "Lo squat è uno degli esercizi più completi che esistano: coinvolge gambe, glutei e core in un solo movimento. Ma è anche uno dei più fraintesi: piccoli errori di tecnica, ripetuti nel tempo, si trasformano in fastidi a ginocchia e schiena." },
      { type: "h2", text: "I punti che contano davvero" },
      { type: "ul", items: [
        "Piedi a larghezza spalle, punte leggermente ruotate verso l'esterno.",
        "Peso sui talloni e su tutta la pianta, non sull'avampiede.",
        "Scendi spingendo i glutei indietro, come per sederti su una sedia.",
        "Le ginocchia seguono la direzione delle punte, senza cedere verso l'interno.",
        "Schiena neutra: petto alto e core attivo per tutta la discesa.",
      ] },
      { type: "h2", text: "L'errore invisibile: i talloni che si alzano" },
      { type: "p", text: "Se durante la discesa i talloni si sollevano, il peso si sposta sull'avampiede e finisce per scaricarsi sulla rotula. Il problema, spesso, non è la forza: è la mobilità della caviglia. Finché non la sblocchi, le ginocchia pagano il prezzo. Prova a radicare i talloni a terra come se volessi bucarli: sentirai subito lavorare di più la catena posteriore." },
      { type: "h2", text: "Quanto scendere" },
      { type: "p", text: "La profondità ideale porta la coscia almeno parallela al pavimento, se la tua mobilità lo consente e senza dolore. Scendere troppo oltre il tuo range attuale, o rimbalzare in fondo, aumenta lo stress articolare senza benefici. Meglio un range pulito e controllato che una profondità forzata." },
      { type: "h2", text: "Come Motion Insight ti aiuta" },
      { type: "p", text: "Riprendendo lo squat con la fotocamera, l'analisi misura gli angoli di ginocchia, anche e schiena fase per fase e ti segnala esattamente dove correggere — per esempio se il tronco si inclina troppo in avanti o se scendi poco. È come avere un occhio esperto accanto, a ogni ripetizione." },
    ],
  },
  {
    slug: "errori-comuni-push-up",
    title: "Gli errori più comuni nel push-up (e come sistemarli)",
    category: "Tecnica",
    excerpt: "Gomiti larghi, bacino che cede, range incompleto: i tre errori che rendono le flessioni meno efficaci e più rischiose.",
    readingMin: 4,
    date: "2026-07-12",
    body: [
      { type: "p", text: "Il push-up sembra semplice, ma è un plank in movimento: se il corpo non lavora come un blocco unico, perdi efficacia e carichi le spalle nel modo sbagliato." },
      { type: "h2", text: "Errore 1 — Gomiti troppo larghi" },
      { type: "p", text: "Gomiti aperti a 90° verso l'esterno stressano l'articolazione della spalla. Tienili più vicini al busto, formando una freccia (circa 45°): il petto lavora meglio e le spalle ringraziano." },
      { type: "h2", text: "Errore 2 — Il bacino che cede" },
      { type: "p", text: "Se le anche sprofondano verso il pavimento, la zona lombare va in iperestensione. Attiva glutei e addome e immagina una linea retta dalla testa ai talloni per tutta la ripetizione." },
      { type: "h2", text: "Errore 3 — Range incompleto" },
      { type: "p", text: "Scendere solo a metà è l'errore più diffuso. Porta il petto vicino al suolo (senza appoggiarti) e spingi fino a estendere le braccia. Se non riesci a completare il range, parti dalle flessioni sulle ginocchia o inclinate su un rialzo." },
      { type: "h2", text: "Il test rapido" },
      { type: "p", text: "Filmati di lato: la testa, il bacino e i talloni dovrebbero restare allineati per tutta la serie. Motion Insight rende automatico questo controllo, segnalandoti l'istante esatto in cui l'allineamento si rompe." },
    ],
  },
  {
    slug: "programma-5k-principianti",
    title: "Programma 5K per principianti: dalla panchina al traguardo in 8 settimane",
    category: "Allenamento",
    excerpt: "Un piano progressivo cammina-corri per arrivare a correre 5 km senza fermarti, senza farti male.",
    readingMin: 6,
    date: "2026-07-08",
    body: [
      { type: "p", text: "Correre 5 km di fila è un obiettivo alla portata di quasi tutti, a patto di costruire la base con gradualità. Il segreto non è correre di più: è alternare corsa e camminata, aumentando il tempo di corsa un po' alla volta." },
      { type: "h2", text: "Il principio: cammina-corri" },
      { type: "p", text: "Ogni sessione alterna intervalli di corsa lenta a intervalli di camminata di recupero. Settimana dopo settimana la corsa si allunga e la camminata si accorcia. Tre uscite a settimana, con almeno un giorno di riposo tra una e l'altra." },
      { type: "h2", text: "Struttura in 8 settimane" },
      { type: "ul", items: [
        "Sett. 1–2: 1 min corsa / 2 min camminata, per 20–25 min.",
        "Sett. 3–4: 2 min corsa / 1,5 min camminata, per 25 min.",
        "Sett. 5–6: 4 min corsa / 1 min camminata, per 28 min.",
        "Sett. 7: 8–10 min corsa continua + recuperi brevi.",
        "Sett. 8: prova i 5 km continui a ritmo comodo.",
      ] },
      { type: "h2", text: "Regole d'oro" },
      { type: "ul", items: [
        "Corri a un ritmo in cui riesci ancora a parlare: se ansimi, rallenta.",
        "Riscaldati camminando 5 minuti prima di iniziare.",
        "Se senti dolore (non semplice fatica), fermati e recupera.",
      ] },
      { type: "p", text: "La corsa mette alla prova anche la tecnica: appoggio, postura e simmetria contano. Curare la forza e la stabilità con l'allenamento a corpo libero — e correggere gli squilibri muscolari — riduce il rischio di infortuni da sovraccarico tipici di chi inizia a correre." },
    ],
  },
  {
    slug: "quante-proteine-servono",
    title: "Quante proteine ti servono davvero (senza esagerare)",
    category: "Nutrizione",
    excerpt: "Fabbisogno proteico, timing e fonti: cosa conta davvero per costruire muscolo e recuperare.",
    readingMin: 5,
    date: "2026-07-04",
    body: [
      { type: "p", text: "Le proteine sono il mattone con cui il corpo ripara e costruisce il muscolo dopo l'allenamento. Ma non serve mangiarne quantità enormi: oltre una certa soglia, il surplus non offre vantaggi." },
      { type: "h2", text: "La quantità di riferimento" },
      { type: "p", text: "Per chi si allena con costanza, un intervallo pratico è circa 1,4–2,0 grammi di proteine per chilo di peso corporeo al giorno. Chi fa attività leggera può stare nella parte bassa; chi cerca ipertrofia o è in deficit calorico tende verso la parte alta. Sono indicazioni generali: la tua situazione specifica può variare." },
      { type: "h2", text: "Distribuzione nella giornata" },
      { type: "p", text: "Distribuire le proteine in 3–4 pasti da circa 20–40 g ciascuno è più efficace che concentrarle tutte in un unico pasto. Un apporto vicino all'allenamento e prima di dormire aiuta il recupero." },
      { type: "h2", text: "Buone fonti" },
      { type: "ul", items: [
        "Animali: uova, pollo, pesce, latticini, carne magra.",
        "Vegetali: legumi, tofu e tempeh, seitan, soia.",
        "Combina più fonti vegetali nella giornata per coprire tutti gli aminoacidi.",
      ] },
      { type: "p", text: "Con Motion Insight il piano nutrizionale si sincronizza con l'allenamento e mantiene i macro anche quando sostituisci un ingrediente o cucini con ciò che hai in casa. Per esigenze cliniche o patologie, fai sempre riferimento a un nutrizionista." },
    ],
  },
  {
    slug: "prevenire-mal-di-schiena-allenandoti",
    title: "Come prevenire il mal di schiena allenandoti",
    category: "Prevenzione infortuni",
    excerpt: "Core, mobilità dell'anca e tecnica sui sollevamenti: la strategia in tre punti per una schiena robusta.",
    readingMin: 5,
    date: "2026-06-30",
    body: [
      { type: "p", text: "Il mal di schiena non specifico è tra i disturbi più diffusi, e spesso peggiora con la sedentarietà. L'allenamento, fatto bene, è uno degli strumenti migliori per prevenirlo: rende la colonna più stabile e resistente." },
      { type: "h2", text: "1. Rinforza il core, non solo gli addominali" },
      { type: "p", text: "Il core è tutto il cilindro che stabilizza il tronco. Esercizi come plank, bird-dog e dead bug insegnano alla colonna a restare neutra sotto carico, molto più utile di mille crunch." },
      { type: "h2", text: "2. Sblocca anche e caviglie" },
      { type: "p", text: "Quando anche e caviglie sono rigide, la schiena compensa piegandosi al posto loro. Dedicare qualche minuto alla mobilità di queste articolazioni scarica lavoro dalla zona lombare." },
      { type: "h2", text: "3. Cura la tecnica nei sollevamenti" },
      { type: "p", text: "Raccogliere un peso da terra con la schiena curva è la ricetta classica per farsi male. Impara a incernierare dalle anche (hip hinge) mantenendo la schiena neutra: vale per lo stacco in palestra come per la borsa della spesa." },
      { type: "h2", text: "Quando rivolgersi a un professionista" },
      { type: "p", text: "Se il dolore è acuto, si irradia lungo la gamba o non migliora in pochi giorni, consulta un medico o un fisioterapista. Motion Insight ti aiuta a correggere la tecnica e a ridurre gli errori, ma non sostituisce una valutazione clinica." },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
