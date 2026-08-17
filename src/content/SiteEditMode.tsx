"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Pencil, X, Loader2, Check } from "lucide-react";

interface SiteEditModeValue {
  isAdmin: boolean;
  editMode: boolean;
  toggle: () => void;
  save: (key: string, value: string) => Promise<void>;
}

const SiteEditModeContext = createContext<SiteEditModeValue>({
  isAdmin: false,
  editMode: false,
  toggle: () => {},
  save: async () => {},
});

export function useSiteEditMode(): SiteEditModeValue {
  return useContext(SiteEditModeContext);
}

/**
 * Attiva la modalità "designer" per gli admin: sul sito pubblico, se loggati come
 * admin, appare un bottone flottante per entrare/uscire dalla modifica inline del
 * copy (i componenti <EditableText> diventano cliccabili). Per tutti gli altri
 * visitatori non cambia nulla — la verifica admin passa dall'endpoint già
 * esistente /api/admin/site-content (GET), niente di nuovo da autorizzare.
 */
export function SiteEditModeProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-content")
      .then((r) => setIsAdmin(r.ok))
      .catch(() => setIsAdmin(false));
  }, []);

  const save = useCallback(async (key: string, value: string) => {
    const res = await fetch("/api/admin/site-content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error("Salvataggio non riuscito");
  }, []);

  return (
    <SiteEditModeContext.Provider value={{ isAdmin, editMode, toggle: () => setEditMode((v) => !v), save }}>
      {children}
      {isAdmin && <EditModeToggle editMode={editMode} onToggle={() => setEditMode((v) => !v)} />}
    </SiteEditModeContext.Provider>
  );
}

function EditModeToggle({ editMode, onToggle }: { editMode: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 px-4 py-3 rounded-full font-semibold text-sm shadow-lg transition-all hover:-translate-y-0.5"
      style={{ background: editMode ? "var(--organic-terracotta)" : "var(--organic-espresso)", color: editMode ? "var(--primary-foreground)" : "var(--foreground)" }}
    >
      {editMode ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
      {editMode ? "Esci da modifica" : "Modifica pagina"}
    </button>
  );
}

/**
 * Avvolge un testo del copy (foglia stringa, es. "prezzi.heroTitle.pre") e lo
 * rende cliccabile in modalità modifica: click → textarea inline → salva o
 * annulla. Fuori dalla modalità modifica (o per utenti non admin) è invisibile:
 * renderizza solo il testo, nessun cambiamento per i visitatori normali.
 */
export function EditableText({ path, children, as: Tag = "span" }: { path: string; children: string; as?: keyof React.JSX.IntrinsicElements }) {
  const { editMode, save } = useSiteEditMode();
  const [editing, setEditing] = useState(false);
  const [savedValue, setSavedValue] = useState<string | null>(null);
  const displayValue = savedValue ?? children;
  const [draft, setDraft] = useState(displayValue);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(displayValue), [displayValue]);

  if (!editMode) return <Tag>{displayValue}</Tag>;

  // L'editor si apre in un portale (dialog centrato) invece che inline: molti usi
  // di EditableText finiscono dentro un <Button>, e nidificare un <textarea> +
  // altri <button> dentro un <button> reale produrrebbe HTML non valido.
  async function handleSave() {
    setSaving(true);
    try {
      await save(path, draft);
      setSavedValue(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setEditing(false);
    } catch {
      alert("Salvataggio non riuscito, riprova.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Tag
        onClick={(e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setEditing(true); }}
        role="button"
        tabIndex={0}
        title={`Modifica: ${path}`}
        style={{ outline: "1.5px dashed var(--organic-terracotta)", outlineOffset: 3, cursor: "pointer", borderRadius: 3, position: "relative" }}
      >
        {saved && <Check className="w-3 h-3 inline mr-1" style={{ color: "var(--organic-green)" }} />}
        {displayValue}
      </Tag>
      {editing && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(10,15,28,.7)" }} onClick={() => setEditing(false)}>
          <div className="w-full max-w-lg rounded-2xl p-5 space-y-3" style={{ background: "var(--organic-espresso)" }} onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-mono" style={{ color: "rgba(234,241,248,.5)" }}>{path}</p>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={draft.length > 60 ? 4 : 2}
              className="w-full bg-white text-black border-2 rounded-lg p-2.5 text-sm resize-y focus:outline-none"
              style={{ borderColor: "var(--organic-terracotta)" }}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setDraft(displayValue); setEditing(false); }}
                className="text-sm font-semibold px-4 py-2 rounded-lg border"
                style={{ borderColor: "var(--organic-line)", color: "var(--foreground)" }}
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white"
                style={{ background: "var(--organic-terracotta)" }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Salva
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
