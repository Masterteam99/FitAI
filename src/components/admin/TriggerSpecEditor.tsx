"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ChevronDown, ChevronRight, AlertTriangle } from "lucide-react";
import { useState } from "react";

// Editor guidato per la spec biomeccanica di un esercizio (movimenti → fasi →
// trigger), al posto della textarea JSON grezza. La forma dei dati resta
// identica a SpecSchema/buildSpecData in src/lib/admin/exercise-schema.ts —
// qui cambia solo come si compila, non cosa viene salvato.

export type Condition = "BELOW_MIN" | "ABOVE_MAX" | "OUT_OF_RANGE";
export type Severity = "WARNING" | "ERROR" | "CRITICAL";
export type Phase = "CONCENTRIC" | "ECCENTRIC" | "ISOMETRIC" | "TOP" | "BOTTOM" | "THROUGHOUT";

export interface TriggerRow {
  condition: Condition;
  severity: Severity;
  feedback: string;
  injuryRisk: boolean;
}
export interface PhaseRow {
  phase: Phase;
  minAngle: number;
  maxAngle: number;
  triggers: TriggerRow[];
}
export interface MovementRow {
  joint: string;
  movementType: string;
  phases: PhaseRow[];
}
export interface SpecValue {
  movements: MovementRow[];
}

// Le uniche 9 articolazioni che il motore di analisi sa effettivamente
// valutare (src/services/biomechanical/specEvaluator.ts::SPEC_JOINTS) — un
// valore diverso da questi fa sì che il movimento non venga mai controllato,
// senza errori visibili. Per questo qui è un menu chiuso, non testo libero.
const JOINTS: { value: string; label: string }[] = [
  { value: "left_knee", label: "Ginocchio sinistro" },
  { value: "right_knee", label: "Ginocchio destro" },
  { value: "left_elbow", label: "Gomito sinistro" },
  { value: "right_elbow", label: "Gomito destro" },
  { value: "left_shoulder", label: "Spalla sinistra" },
  { value: "right_shoulder", label: "Spalla destra" },
  { value: "left_hip", label: "Anca sinistra" },
  { value: "right_hip", label: "Anca destra" },
  { value: "spine", label: "Colonna vertebrale" },
];

const MOVEMENT_TYPES = ["flessione", "estensione", "abduzione", "adduzione", "rotazione", "inclinazione", "cerniera", "neutrale"];

const PHASES: { value: Phase; label: string }[] = [
  { value: "CONCENTRIC", label: "Concentrica (fase di sforzo/salita)" },
  { value: "ECCENTRIC", label: "Eccentrica (fase di cedimento/discesa)" },
  { value: "ISOMETRIC", label: "Isometrica (tenuta)" },
  { value: "TOP", label: "In alto (fine movimento)" },
  { value: "BOTTOM", label: "In basso (fine movimento)" },
  { value: "THROUGHOUT", label: "Durante tutto il movimento" },
];

const CONDITIONS: { value: Condition; label: string; hint: string }[] = [
  { value: "BELOW_MIN", label: "Angolo sotto il minimo", hint: "Scatta quando l'angolo è troppo piccolo rispetto al range" },
  { value: "ABOVE_MAX", label: "Angolo sopra il massimo", hint: "Scatta quando l'angolo è troppo grande rispetto al range" },
  { value: "OUT_OF_RANGE", label: "Angolo fuori dal range", hint: "Scatta in entrambi i casi (sotto il minimo o sopra il massimo)" },
];

const SEVERITIES: { value: Severity; label: string }[] = [
  { value: "WARNING", label: "🟡 Attenzione" },
  { value: "ERROR", label: "🟠 Errore" },
  { value: "CRITICAL", label: "🔴 Critico" },
];

const selectCls = "w-full h-9 px-3 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-1 focus:ring-ring";
const labelCls = "text-xs font-medium text-muted-foreground";

function emptyTrigger(): TriggerRow {
  return { condition: "OUT_OF_RANGE", severity: "WARNING", feedback: "", injuryRisk: false };
}
function emptyPhase(): PhaseRow {
  return { phase: "THROUGHOUT", minAngle: 0, maxAngle: 180, triggers: [] };
}
function emptyMovement(): MovementRow {
  return { joint: JOINTS[0].value, movementType: MOVEMENT_TYPES[0], phases: [] };
}

export function TriggerSpecEditor({ value, onChange }: { value: SpecValue; onChange: (v: SpecValue) => void }) {
  function updateMovement(i: number, patch: Partial<MovementRow>) {
    const movements = value.movements.map((m, idx) => (idx === i ? { ...m, ...patch } : m));
    onChange({ movements });
  }
  function addMovement() {
    onChange({ movements: [...value.movements, emptyMovement()] });
  }
  function removeMovement(i: number) {
    onChange({ movements: value.movements.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-3">
      {value.movements.length === 0 && (
        <p className="text-xs text-muted-foreground">Nessun movimento configurato. L&apos;esercizio non avrà analisi biomeccanica (L1) finché non ne aggiungi almeno uno.</p>
      )}
      {value.movements.map((m, i) => (
        <MovementCard
          key={i}
          movement={m}
          onChange={(patch) => updateMovement(i, patch)}
          onRemove={() => removeMovement(i)}
        />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addMovement} className="gap-1.5">
        <Plus className="w-3.5 h-3.5" /> Aggiungi movimento (articolazione)
      </Button>
    </div>
  );
}

function MovementCard({ movement, onChange, onRemove }: { movement: MovementRow; onChange: (p: Partial<MovementRow>) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  const jointLabel = JOINTS.find((j) => j.value === movement.joint)?.label ?? movement.joint;

  function updatePhase(i: number, patch: Partial<PhaseRow>) {
    onChange({ phases: movement.phases.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  }
  function addPhase() {
    onChange({ phases: [...movement.phases, emptyPhase()] });
  }
  function removePhase(i: number) {
    onChange({ phases: movement.phases.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-2.5 bg-secondary/40">
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-muted-foreground hover:text-foreground shrink-0">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        <span className="text-sm font-medium flex-1 truncate">{jointLabel} · {movement.movementType}</span>
        <span className="text-xs text-muted-foreground shrink-0">{movement.phases.length} fasi</span>
        <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-destructive shrink-0 p-1">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && (
        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className={labelCls}>Articolazione</label>
              <select value={movement.joint} onChange={(e) => onChange({ joint: e.target.value })} className={selectCls}>
                {JOINTS.map((j) => <option key={j.value} value={j.value}>{j.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Tipo di movimento</label>
              <select value={movement.movementType} onChange={(e) => onChange({ movementType: e.target.value })} className={selectCls}>
                {MOVEMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2 pl-3 border-l-2 border-border">
            {movement.phases.map((p, i) => (
              <PhaseRowEditor key={i} phase={p} onChange={(patch) => updatePhase(i, patch)} onRemove={() => removePhase(i)} />
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addPhase} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Aggiungi fase del movimento
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseRowEditor({ phase, onChange, onRemove }: { phase: PhaseRow; onChange: (p: Partial<PhaseRow>) => void; onRemove: () => void }) {
  const [open, setOpen] = useState(true);
  const phaseLabel = PHASES.find((x) => x.value === phase.phase)?.label ?? phase.phase;

  function updateTrigger(i: number, patch: Partial<TriggerRow>) {
    onChange({ triggers: phase.triggers.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });
  }
  function addTrigger() {
    onChange({ triggers: [...phase.triggers, emptyTrigger()] });
  }
  function removeTrigger(i: number) {
    onChange({ triggers: phase.triggers.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 p-2 bg-secondary/20">
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-muted-foreground hover:text-foreground shrink-0">
          {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        <span className="text-xs font-medium flex-1 truncate">{phaseLabel} · {phase.minAngle}°–{phase.maxAngle}°</span>
        <span className="text-[11px] text-muted-foreground shrink-0">{phase.triggers.length} regole</span>
        <button type="button" onClick={onRemove} className="text-muted-foreground hover:text-destructive shrink-0 p-1">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {open && (
        <div className="p-2.5 space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1 col-span-1">
              <label className={labelCls}>Fase</label>
              <select value={phase.phase} onChange={(e) => onChange({ phase: e.target.value as Phase })} className={selectCls}>
                {PHASES.map((ph) => <option key={ph.value} value={ph.value}>{ph.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Angolo min (°)</label>
              <Input type="number" value={phase.minAngle} onChange={(e) => onChange({ minAngle: Number(e.target.value) })} />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Angolo max (°)</label>
              <Input type="number" value={phase.maxAngle} onChange={(e) => onChange({ maxAngle: Number(e.target.value) })} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Range sicuro/atteso per questa fase: sotto {phase.minAngle}° o sopra {phase.maxAngle}° sono le zone che le regole sotto possono segnalare.</p>

          <div className="space-y-2 pl-3 border-l-2 border-border">
            {phase.triggers.map((t, i) => (
              <TriggerRowEditor key={i} trigger={t} onChange={(patch) => updateTrigger(i, patch)} onRemove={() => removeTrigger(i)} />
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addTrigger} className="gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Aggiungi regola (trigger)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function TriggerRowEditor({ trigger, onChange, onRemove }: { trigger: TriggerRow; onChange: (p: Partial<TriggerRow>) => void; onRemove: () => void }) {
  const conditionHint = CONDITIONS.find((c) => c.value === trigger.condition)?.hint ?? "";
  return (
    <div className="border border-border rounded-lg p-2.5 space-y-2 bg-card/50">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className={labelCls}>Quando scatta</label>
          <select value={trigger.condition} onChange={(e) => onChange({ condition: e.target.value as Condition })} className={selectCls}>
            {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className={labelCls}>Gravità</label>
          <select value={trigger.severity} onChange={(e) => onChange({ severity: e.target.value as Severity })} className={selectCls}>
            {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">{conditionHint}</p>
      <div className="space-y-1">
        <label className={labelCls}>Messaggio di correzione mostrato all&apos;utente</label>
        <textarea
          value={trigger.feedback}
          onChange={(e) => onChange({ feedback: e.target.value })}
          placeholder="Es. Scendi finché la coscia è parallela al pavimento."
          className="w-full bg-secondary/50 border border-border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[50px]"
        />
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" checked={trigger.injuryRisk} onChange={(e) => onChange({ injuryRisk: e.target.checked })} />
        <span className="inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-destructive" /> Segnala come rischio di infortunio</span>
      </label>
      <button type="button" onClick={onRemove} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
        <Trash2 className="w-3 h-3" /> Rimuovi regola
      </button>
    </div>
  );
}
