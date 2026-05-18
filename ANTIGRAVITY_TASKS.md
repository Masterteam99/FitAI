# FitAI — Istruzioni operative per Antigravity AI

*Versione 1.0 — 30 aprile 2026*

> Questo file contiene **prompt pronti da copia-incolla** per Antigravity. Ogni sezione è un'istruzione completa e self-contained: include contesto, file da leggere prima, formato output atteso, vincoli e criteri di completamento. **Esegui le task in ordine** salvo dipendenze diverse indicate.

> **Documenti di riferimento da leggere SEMPRE prima**:
> - `ANALYSIS_SPEC.md` (root) — spec funzionale autoritativa
> - `ROADMAP.md` (root) — tracking globale (Antigravity deve aggiornare lo stato delle task qui)
> - `STATO_PROGETTO.md` — overview progetto e stack
> - `AGENTS.md` — Next.js 16 ha breaking changes, leggi `node_modules/next/dist/docs/` se non sei sicuro

---

## TASK 1.3 — Compilazione dataset spec biomeccaniche

**Stato**: TODO — può iniziare subito (no dipendenze codice)
**Tempo stimato**: 4-6 ore
**Priorità**: ALTA (sblocca Fase 1.4 e tutta la Logica 1)

### Prompt copy-paste

```
Devi compilare un dataset TypeScript con le specifiche biomeccaniche per 20 esercizi
del progetto FitAI. Il dataset alimenterà la Logica 1 dell'analisi tripartita
(vedi ANALYSIS_SPEC.md sezione "Logica 1 — Biomeccanica Deterministica").

PRIMA DI INIZIARE leggi questi file:
1. ANALYSIS_SPEC.md — sezione 2 "Logica 1" e sezione 3 "Modello dati"
2. prisma/schema.prisma — modelli ExerciseBiomechanicalSpec, ExerciseMovement,
   MovementPhase, PhaseTrigger (sono già stati aggiunti, leggi le linee ~250-310)
3. src/lib/pose.ts — costante KEYPOINT_NAMES (33 punti BlazePose). I joint
   monitorabili sono: left_knee, right_knee, left_elbow, right_elbow,
   left_shoulder, right_shoulder, left_hip, right_hip, "spine" (calcolato
   da spalla-anca-verticale)
4. src/services/ai/promptTemplates.ts — stile dei feedback in italiano

ESERCIZI DA COMPILARE (slug esatti, devono matchare prisma/seed.ts):
squat, stacco-da-terra, panca-piana, trazioni, military-press, affondi,
rematore-bilanciere, curl-bicipiti, push-up, plank, romanian-deadlift,
lateral-raise, tricipiti-cavi, hip-thrust, crunch, goblet-squat,
bulgarian-split-squat, plank-laterale, face-pull, leg-press

CREA il file: prisma/seed-biomechanical-specs.ts

FORMAT OUTPUT (esempio per squat):

import type { ExercisePhase, TriggerCondition, ThresholdSeverity } from "@prisma/client";

export interface BiomechanicalSpecData {
  movements: {
    joint: string;
    movementType: string;
    phases: {
      phase: ExercisePhase;
      minAngle: number;
      maxAngle: number;
      triggers: {
        condition: TriggerCondition;
        severity: ThresholdSeverity;
        feedback: string;
        injuryRisk: boolean;
      }[];
    }[];
  }[];
}

export const BIOMECHANICAL_SPECS: Record<string, BiomechanicalSpecData> = {
  "squat": {
    movements: [
      {
        joint: "left_knee",
        movementType: "flessione",
        phases: [
          {
            phase: "BOTTOM",
            minAngle: 70,
            maxAngle: 110,
            triggers: [
              {
                condition: "ABOVE_MAX",
                severity: "ERROR",
                feedback: "Il ginocchio sinistro supera la punta del piede. Porta il peso sui talloni e apri leggermente le ginocchia.",
                injuryRisk: true
              },
              {
                condition: "BELOW_MIN",
                severity: "WARNING",
                feedback: "Stai scendendo eccessivamente: rischio di sovraccarico al ginocchio.",
                injuryRisk: true
              }
            ]
          },
          {
            phase: "ECCENTRIC",
            minAngle: 110,
            maxAngle: 170,
            triggers: [/* ... */]
          }
        ]
      },
      {
        joint: "spine",
        movementType: "inclinazione",
        phases: [/* ... */]
      },
      // ... altri movimenti
    ]
  },
  "stacco-da-terra": { /* ... */ },
  // ... 18 altri esercizi
};

VINCOLI:
- Per ogni esercizio: minimo 3 movimenti monitorati, massimo 6
- Per ogni movimento: 1-3 fasi pertinenti (non tutte le fasi sono rilevanti per
  ogni esercizio — es. plank è solo THROUGHOUT)
- Per ogni fase: 1-3 trigger (non sempre servono tutti e 3)
- Feedback: italiano, max 30 parole, tono PT professionale ma accessibile
- injuryRisk: true SOLO se la violazione contribuisce a un rischio reale
  (hyperextension lombare, valgo del ginocchio, scapole non retratte in panca)
- Severità:
  * WARNING = svista correggibile, no rischio (es. ROM incompleto in curl)
  * ERROR = errore tecnico significativo (es. ginocchio in valgo lieve)
  * CRITICAL = rischio infortunio (es. schiena in iperestensione su military press)

VALORI ANGOLARI: usa letteratura biomeccanica come riferimento. Esempi guida:
- Squat profondità: ginocchio 70-110° in BOTTOM
- Panca piana: gomito 60-100° in BOTTOM, scapole retratte (spalla 30-80°)
- Stacco: schiena neutrale (inclinazione spina 0-20° throughout)
- Plank: anca 165-185° (corpo allineato), spina 0-10°
- Push-up: gomito 60-100° in BOTTOM, anca 160-185° throughout

Quando finisci:
1. Scrivi il file prisma/seed-biomechanical-specs.ts completo
2. Aggiorna ROADMAP.md task 1.3 a "✅ DONE" con data
3. Notifica che la task 1.4 può ora partire
```

### Verifica
- [ ] File `prisma/seed-biomechanical-specs.ts` creato
- [ ] 20 esercizi presenti, slug corretti
- [ ] Almeno 3 movimenti per esercizio
- [ ] Tutti i `condition`/`severity`/`phase` corrispondono agli enum Prisma
- [ ] Nessun feedback inglese (solo italiano)
- [ ] ROADMAP.md aggiornato

---

## TASK 1.4 — Aggiornamento `prisma/seed.ts`

**Stato**: TODO — dipende da 1.3
**Tempo stimato**: 1 ora
**Priorità**: ALTA

### Prompt copy-paste

```
La task 1.3 ha creato prisma/seed-biomechanical-specs.ts con i nuovi dati strutturati.
Ora devi aggiornare prisma/seed.ts per:
1. Importare i nuovi specs
2. Aggiungere recordingDurationSeconds a ciascun esercizio
3. Eliminare il vecchio blocco prisma.biomechanicalThreshold.create (sostituito)
4. Creare la nuova gerarchia: ExerciseBiomechanicalSpec → ExerciseMovement → MovementPhase → PhaseTrigger

PRIMA DI INIZIARE leggi:
1. prisma/seed.ts (file attuale)
2. prisma/seed-biomechanical-specs.ts (output della task 1.3)
3. prisma/schema.prisma (modelli aggiornati)

PASSI:

A. Aggiungere import in cima a seed.ts:
   import { BIOMECHANICAL_SPECS } from "./seed-biomechanical-specs";

B. Per ogni esercizio nel data block, aggiungere recordingDurationSeconds:
   - 25s: plank, plank-laterale, hip-thrust
   - 20s (default, può essere omesso): squat, stacco-da-terra, panca-piana,
     military-press, affondi, rematore-bilanciere, push-up, romanian-deadlift,
     bulgarian-split-squat, leg-press, goblet-squat
   - 15s: curl-bicipiti, lateral-raise, tricipiti-cavi, face-pull, crunch, trazioni

C. Sostituire il blocco esistente (cerca le linee con `await prisma.biomechanicalThreshold.deleteMany`
   e `await prisma.biomechanicalThreshold.create`) con il nuovo:

   // Crea spec biomeccanica strutturata se presente in BIOMECHANICAL_SPECS
   const specData = BIOMECHANICAL_SPECS[ex.slug];
   if (specData) {
     // Cancella spec esistente (cascade su movements/phases/triggers)
     await prisma.exerciseBiomechanicalSpec.deleteMany({
       where: { exerciseId: exercise.id }
     });

     const spec = await prisma.exerciseBiomechanicalSpec.create({
       data: { exerciseId: exercise.id }
     });

     for (const movement of specData.movements) {
       const movementRecord = await prisma.exerciseMovement.create({
         data: {
           specId: spec.id,
           joint: movement.joint,
           movementType: movement.movementType,
         }
       });

       for (const phase of movement.phases) {
         const phaseRecord = await prisma.movementPhase.create({
           data: {
             movementId: movementRecord.id,
             phase: phase.phase,
             minAngle: phase.minAngle,
             maxAngle: phase.maxAngle,
           }
         });

         for (const trigger of phase.triggers) {
           await prisma.phaseTrigger.create({
             data: {
               phaseId: phaseRecord.id,
               condition: trigger.condition,
               severity: trigger.severity,
               feedback: trigger.feedback,
               injuryRisk: trigger.injuryRisk,
             }
           });
         }
       }
     }
   }

D. NON eliminare ancora le righe `thresholds: [...]` né il vecchio blocco
   biomechanicalThreshold se serve mantenere compatibilità v1 durante migrazione.
   Va bene tenere entrambi seedati.

VINCOLI:
- Non rimuovere nessun esercizio esistente
- Non modificare la logica di seed degli achievements / users mock
- Verificare che la sintassi TypeScript sia valida (file non avrà errori TS
  se eseguito con npx prisma db seed)

Quando finisci:
1. Aggiorna ROADMAP.md task 1.4 a "✅ DONE"
2. Lascia un commento in fondo a seed.ts: // ⚠️ Eseguire `npx prisma db seed` dopo `npx prisma migrate dev --name analysis_v2_schema`
```

### Verifica
- [ ] `prisma/seed.ts` importa BIOMECHANICAL_SPECS
- [ ] Tutti gli esercizi hanno `recordingDurationSeconds` corretto
- [ ] Nuovo blocco crea gerarchia spec/movement/phase/trigger
- [ ] No errori TypeScript

---

## TASK 2.3 — Componenti UI countdown/recording/progress

**Stato**: TODO — può partire in parallelo con il resto
**Tempo stimato**: 2-3 ore
**Priorità**: MEDIA (serve per task 2.2 ma può essere creata indipendentemente)

### Prompt copy-paste

```
Devi creare 3 componenti React riutilizzabili per la nuova UI dell'analisi sessione
del progetto FitAI. Questi componenti saranno usati dalla pagina sessione (task 2.2)
e dalla pagina report (task 4.x).

PRIMA DI INIZIARE leggi:
1. ANALYSIS_SPEC.md — sezione 1 "Panoramica del flusso utente" per capire stati UI
2. src/components/ui/* — design system esistente (Tailwind + Radix UI, shadcn-style)
3. src/app/(app)/analisi/sessione/page.tsx — UI corrente (sarà sostituita)

CREA 3 FILE:

A. src/components/analisi/CountdownCircle.tsx

   Componente: cerchio SVG grande con secondi al centro che animano da N a 0.
   Visivo: anello esterno verde primary che si svuota antiorario, secondi grandi
   centrati. Sotto i secondi un sottotitolo opzionale.

   API:
   interface CountdownCircleProps {
     seconds: number;       // durata totale countdown
     onComplete: () => void;
     subtitle?: string;     // es. "Preparati a iniziare"
   }

   Implementazione:
   - useState elapsed = 0; useEffect setInterval ogni 1000ms
   - SVG: <circle> con stroke-dasharray = circonferenza, stroke-dashoffset = circ * (elapsed/seconds)
   - cleanup useEffect per clearInterval
   - No dipendenze nuove

B. src/components/analisi/RecordingIndicator.tsx

   Componente: badge REC pulsante (rosso) + progress bar lineare orizzontale.

   API:
   interface RecordingIndicatorProps {
     durationSeconds: number;  // durata totale prevista
     elapsedSeconds: number;   // tempo trascorso
   }

   Implementazione:
   - Badge: <div> con background red-500, animazione pulse Tailwind
   - Progress: usare <Progress> da @/components/ui/progress (già esistente)
   - Mostrare anche "{elapsed}s / {duration}s" in testo

C. src/components/analisi/AnalysisProgress.tsx

   Componente: 3 step orizzontali con icone, lo step corrente ha animazione spinner,
   gli step completati hanno checkmark, quelli futuri sono grigi.

   API:
   interface AnalysisProgressProps {
     steps: { label: string; icon: React.ReactNode }[];
     currentStep: number;  // 0-based, -1 = none done, steps.length = all done
   }

   Implementazione:
   - Map steps in <div> flex
   - Logica: i < currentStep = done (checkmark), i === currentStep = active (spinner),
     i > currentStep = pending (grigio)
   - Linea connettrice tra step (può essere flex-1 con border)

VINCOLI:
- Usa SOLO Tailwind + componenti esistenti in src/components/ui/
- Niente animation library nuove (usa Tailwind transitions)
- Mobile-first: tutti devono essere responsive (testare con DevTools)
- TypeScript stretto, niente `any`
- "use client" in cima a ogni file (sono client components)

ESEMPIO USO (per riferimento, non scrivere questo):
  <CountdownCircle seconds={15} onComplete={() => setState("RECORDING")} />
  <RecordingIndicator durationSeconds={20} elapsedSeconds={5} />
  <AnalysisProgress
    steps={[
      { label: "L1 Biomeccanica", icon: <Activity /> },
      { label: "L2 PT Expert", icon: <Brain /> },
      { label: "L3 Confronto", icon: <GitCompare /> }
    ]}
    currentStep={1}
  />

Quando finisci:
1. I 3 file sono nella cartella src/components/analisi/
2. Esegui `npx tsc --noEmit` e verifica che non ci siano errori sui nuovi file
3. Aggiorna ROADMAP.md task 2.3 a "✅ DONE"
```

### Verifica
- [ ] 3 file creati in `src/components/analisi/`
- [ ] No errori TypeScript sui nuovi file
- [ ] No nuove dipendenze npm aggiunte
- [ ] ROADMAP.md aggiornato

---

## TASK 4.2 — Empty states + skeleton loading per report

**Stato**: TODO — può partire dopo che task 4.1 ha definito le sezioni del report
**Tempo stimato**: 1-2 ore
**Priorità**: BASSA

### Prompt copy-paste

```
Devi creare componenti di skeleton/loading e empty state per la pagina report analisi.

PRIMA DI INIZIARE leggi:
1. src/app/(app)/analisi/report/[id]/page.tsx (riscritta da task 4.1)
2. ANALYSIS_SPEC.md — sezione FinalReport per capire cosa va mostrato

CREA: src/components/analisi/ReportSkeleton.tsx

   Componente: skeleton placeholder che mimetizza la struttura del report finale.
   Visualizza shimmer animation mentre il report carica (3-5s).

   API:
   nessuna prop, è puramente visuale.

   Sezioni da skeleton-izzare:
   - Hero score (cerchio grande)
   - Card "Giudizio del Coach" (3 righe testo)
   - 3 list items (improvements)
   - 3 list items (positive aspects)

   Usa Tailwind `animate-pulse` + bg-muted.

CREA: src/components/analisi/ReportError.tsx

   Empty state se l'analisi è fallita.

   API:
   interface ReportErrorProps {
     message?: string;
     onRetry?: () => void;
   }

   Visualizzazione: card centrale con icona AlertTriangle (lucide-react), testo
   del messaggio, bottone "Riprova" se onRetry definita, link "Torna alla
   dashboard".

INTEGRAZIONE:
   In src/app/(app)/analisi/report/[id]/page.tsx aggiungi questi import e usali:
   - Mentre l'analisi è in corso (status === "PROCESSING") → mostra <AnalysisProgress>
     (componente da task 2.3)
   - Mentre carichi i dati dal DB → mostra <ReportSkeleton />
   - Se status === "ERROR" → mostra <ReportError />

VINCOLI:
- Solo Tailwind + componenti esistenti
- Nessuna nuova dipendenza
- Mobile-first

Quando finisci:
1. 2 nuovi file in src/components/analisi/
2. Page integrata con i 3 stati
3. Aggiorna ROADMAP.md task 4.2 a "✅ DONE"
```

---

## TASK 5.2 — Estensione questionario onboarding

**Stato**: TODO
**Tempo stimato**: 2-3 ore
**Priorità**: MEDIA

### Prompt copy-paste

```
Devi estendere il questionario onboarding di FitAI per raccogliere più dati che il
sistema userà per generare piani di allenamento e nutrizione personalizzati.

PRIMA DI INIZIARE leggi:
1. src/app/(auth)/onboarding/step3/page.tsx — step attuale con età/peso/altezza/giorni
2. src/app/(auth)/onboarding/step4/page.tsx — riepilogo + chiamata generate-plan
3. src/app/api/onboarding/route.ts — API che salva il profilo
4. prisma/schema.prisma — modello User (linee ~150-185)
5. src/services/ai/promptTemplates.ts — buildPlanGeneratorPrompt

MODIFICHE:

A. prisma/schema.prisma — aggiungi a User:
   dietType        String?    // onnivora, vegetariana, vegana, chetogenica, mediterranea, altro
   pastInjuries    String[]   @default([])  // array libero, es. ["dolore lombare", "menisco operato"]
   pastSports      String[]   @default([])  // multi-select dropdown

B. src/app/(auth)/onboarding/step3/page.tsx — aggiungi al form:
   - Sezione "Dieta attuale": <Select> con 6 opzioni
     (Onnivora / Vegetariana / Vegana / Chetogenica / Mediterranea / Altro)
   - Sezione "Problematiche fisiche": <Textarea> con placeholder
     "Es. dolore lombare, problemi al ginocchio sinistro, ecc."
   - Sezione "Sport pregresso": multi-checkbox con opzioni
     (Nessuno, Calcio, Pallavolo, Basket, Nuoto, Corsa, Ciclismo, Palestra,
     Arti marziali, Altro)
   Salvare in onboardingState (helper esistente)

C. src/app/api/onboarding/route.ts — Zod schema:
   Aggiungi:
     dietType: z.string().optional(),
     pastInjuries: z.array(z.string()).optional(),
     pastSports: z.array(z.string()).optional(),
   Aggiungi al `prisma.user.update` data block.

D. src/services/ai/promptTemplates.ts — buildPlanGeneratorPrompt:
   Aggiungi parametri opzionali e includili nel prompt:
     dietType?: string;
     pastInjuries?: string[];
     pastSports?: string[];
   Sezione prompt: "PROBLEMATICHE FISICHE: {pastInjuries.join(', ')} —
   adatta il piano evitando movimenti che potrebbero peggiorare queste condizioni."
   Sezione: "ESPERIENZA PREGRESSA: {pastSports.join(', ')} — considera
   adattamenti motori già acquisiti."

VINCOLI:
- Mantieni retrocompatibilità: utenti esistenti senza questi campi devono
  poter funzionare (Optional/default array vuoto)
- Mobile-first
- Conferma con `npx prisma format` che lo schema è valido
- `npx tsc --noEmit` deve passare sui file modificati

Quando finisci:
1. Aggiorna ROADMAP.md task 5.2 a "✅ DONE"
2. Annota nel commit: "richiede npx prisma migrate dev --name onboarding_extended"
```

### Verifica
- [ ] Schema esteso e validato
- [ ] step3 mostra i 3 nuovi campi
- [ ] API salva i dati
- [ ] Prompt AI usa i dati nuovi
- [ ] No errori TS

---

## TASK 6.2 — Documentazione utente in README

**Stato**: TODO
**Tempo stimato**: 30 min
**Priorità**: BASSA

### Prompt copy-paste

```
Devi aggiornare README.md (root) aggiungendo una sezione user-facing che spieghi
come funziona l'app dal punto di vista dell'utente finale.

PRIMA DI INIZIARE leggi:
1. README.md attuale (root)
2. ANALYSIS_SPEC.md — flusso utente
3. STATO_PROGETTO.md — overview features

AGGIUNGI in fondo a README.md una sezione "## Come funziona l'analisi AI" con:

1. Sottosezione "Il flusso in 5 passi":
   - Scegli un esercizio dal tuo piano
   - Guarda il video del PT professionista
   - Posizionati di fronte alla camera (15 secondi di preparazione)
   - Esegui l'esercizio mentre l'app registra (15-25 secondi)
   - Ricevi feedback completo entro 1-2 minuti

2. Sottosezione "I 3 livelli di analisi":
   - **Biomeccanica deterministica (34%)**: misura gli angoli articolari frame
     per frame e li confronta con range sicuri
   - **Coach AI (33%)**: Claude analizza visivamente la tua esecuzione come
     farebbe un PT professionista
   - **Confronto col PT (33%)**: paragona i tuoi movimenti con quelli del
     video professionale

3. Sottosezione "Severità dei feedback":
   - 🟢 Suggerimento: piccola correzione tecnica
   - 🟡 Errore: errore di esecuzione da correggere
   - 🔴 Allerta: rischio infortunio, fermati e correggi

4. Sottosezione "Cosa fare se compare un'allerta":
   Se vedi 🔴 Allerta, l'app ha rilevato un movimento potenzialmente pericoloso
   per la tua salute. Ferma l'esecuzione, leggi il feedback e ripeti l'esercizio
   correggendo la postura. In caso di dolore persistente, consulta un medico.

VINCOLI:
- Tono accessibile (utenti non tecnici)
- Italiano
- No emoji negli header (solo nel testo dove utile)

Quando finisci:
1. Aggiorna ROADMAP.md task 6.2 a "✅ DONE"
```

---

## Convenzioni per Antigravity

### Cosa fare a inizio task
1. Leggi `ROADMAP.md` per stato corrente
2. Leggi `ANALYSIS_SPEC.md` per spec dell'analisi
3. Leggi i file specifici indicati in "PRIMA DI INIZIARE"
4. Marca la task come `IN_PROGRESS` in ROADMAP.md

### Cosa fare a fine task
1. Verifica con `npx tsc --noEmit` che non ci siano errori sui file toccati (errori pre-esistenti su `any` impliciti vanno ignorati fino a `prisma generate`)
2. Aggiorna ROADMAP.md a `✅ DONE` con data
3. Aggiorna la memoria progetto se hai imparato qualcosa di importante (`~/.claude/projects/.../memory/project_fitai_state.md`)
4. Lascia un commento conciso al termine del file modificato se sono stati presi shortcut o assunzioni

### Cosa NON fare
- ❌ Non eseguire `npx prisma migrate dev` o `npx prisma generate` — l'utente non ha ancora il DB attivo
- ❌ Non installare nuove dipendenze npm senza giustificazione (preferisci builtin/esistenti)
- ❌ Non modificare `ANALYSIS_SPEC.md` (è autoritativo, solo l'utente può modificarlo)
- ❌ Non eliminare codice marcato come "DEPRECATED v1" prima di Fase 5.1
- ❌ Non commitare se ci sono errori TS sui file che hai modificato

### In caso di dubbio
- Se la spec sembra ambigua → leggi ANALYSIS_SPEC.md, se ancora ambigua chiedi all'utente
- Se trovi un bug pre-esistente → segnalalo nel commit message, non fixarlo in questa task
- Se serve una decisione di design → propone 2 alternative all'utente, non procedere unilateralmente
