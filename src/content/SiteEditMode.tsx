"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Pencil, X, Loader2, Check, Undo2, Redo2, RotateCcw, Sparkles } from "lucide-react";

export type StyleColor = "default" | "green" | "terracotta" | "sand" | "muted";
export type StyleSize = "default" | "sm" | "lg" | "xl";
export interface StyleValue { color?: StyleColor; fontSize?: StyleSize }

const COLOR_SWATCH: Record<Exclude<StyleColor, "default">, string> = {
  green: "var(--organic-green)",
  terracotta: "var(--organic-terracotta)",
  sand: "var(--foreground)",
  muted: "var(--muted-foreground)",
};
const SIZE_SCALE: Record<Exclude<StyleSize, "default">, string> = {
  sm: "0.85em",
  lg: "1.2em",
  xl: "1.5em",
};

function styleToCss(s: StyleValue | undefined): React.CSSProperties {
  const css: React.CSSProperties = {};
  if (s?.color && s.color !== "default") css.color = COLOR_SWATCH[s.color];
  if (s?.fontSize && s.fontSize !== "default") css.fontSize = SIZE_SCALE[s.fontSize];
  return css;
}

interface Change { key: string; text: string; style: StyleValue }
interface HistoryEntry { key: string; before: Change; after: Change }

interface SiteEditModeValue {
  isAdmin: boolean;
  editMode: boolean;
  getContent: (key: string) => string | undefined;
  getStyle: (key: string) => StyleValue | undefined;
  registerField: (key: string, text: string) => void;
  fields: Record<string, string>;
  applyChange: (key: string, text: string, style: StyleValue) => Promise<void>;
  resetField: (key: string) => Promise<void>;
}

const SiteEditModeContext = createContext<SiteEditModeValue>({
  isAdmin: false,
  editMode: false,
  getContent: () => undefined,
  getStyle: () => undefined,
  registerField: () => {},
  fields: {},
  applyChange: async () => {},
  resetField: async () => {},
});

export function useSiteEditMode(): SiteEditModeValue {
  return useContext(SiteEditModeContext);
}

/**
 * Attiva la modalità "designer" SOLO quando la pagina è caricata dentro
 * l'anteprima dell'editor in Admin (query `?siteEditor=1`, iniettata
 * dall'iframe in /admin/site-content) — mai sulle pagine pubbliche visitate
 * normalmente, anche da un admin loggato. La verifica admin passa
 * dall'endpoint già esistente /api/admin/site-content (GET); le PUT restano
 * comunque protette server-side indipendentemente da questo flag client.
 */
export function SiteEditModeProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [forceEditor, setForceEditor] = useState(false);
  const [contents, setContents] = useState<Record<string, string>>({});
  const [styles, setStyles] = useState<Record<string, StyleValue>>({});
  const [fields, setFields] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    setForceEditor(new URLSearchParams(window.location.search).get("siteEditor") === "1");
    fetch("/api/admin/site-content")
      .then((r) => setIsAdmin(r.ok))
      .catch(() => setIsAdmin(false));
    fetch("/api/site-content")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.overrides) setContents(d.overrides); })
      .catch(() => {});
    fetch("/api/site-style")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.overrides) setStyles(d.overrides); })
      .catch(() => {});
  }, []);

  const registerField = useCallback((key: string, text: string) => {
    setFields((prev) => (prev[key] === text ? prev : { ...prev, [key]: text }));
  }, []);

  const applyChange = useCallback(async (key: string, text: string, style: StyleValue, recordHistory = true) => {
    const before: Change = { key, text: contents[key] ?? fields[key] ?? "", style: styles[key] ?? {} };
    const after: Change = { key, text, style };

    await Promise.all([
      fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: text }),
      }),
      fetch("/api/admin/site-style", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, color: style.color, fontSize: style.fontSize }),
      }),
    ]);

    setContents((prev) => ({ ...prev, [key]: text }));
    setStyles((prev) => ({ ...prev, [key]: style }));

    if (recordHistory) {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), { key, before, after }]);
      setHistoryIndex((i) => i + 1);
    }
  }, [contents, fields, styles, historyIndex]);

  const resetField = useCallback(async (key: string) => {
    await applyChange(key, "", {});
  }, [applyChange]);

  const undo = useCallback(async () => {
    if (historyIndex < 0) return;
    const entry = history[historyIndex];
    await applyChange(entry.key, entry.before.text, entry.before.style, false);
    setHistoryIndex((i) => i - 1);
  }, [history, historyIndex, applyChange]);

  const redo = useCallback(async () => {
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 1];
    await applyChange(entry.key, entry.after.text, entry.after.style, false);
    setHistoryIndex((i) => i + 1);
  }, [history, historyIndex, applyChange]);

  const getContent = useCallback((key: string) => contents[key], [contents]);
  const getStyle = useCallback((key: string) => styles[key], [styles]);

  const editMode = isAdmin && forceEditor;

  return (
    <SiteEditModeContext.Provider value={{ isAdmin, editMode, getContent, getStyle, registerField, fields, applyChange, resetField }}>
      {children}
      {editMode && (
        <EditorToolbar
          canUndo={historyIndex >= 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={undo}
          onRedo={redo}
          assistantOpen={assistantOpen}
          onToggleAssistant={() => setAssistantOpen((v) => !v)}
        />
      )}
      {editMode && assistantOpen && <EditorAssistant onClose={() => setAssistantOpen(false)} />}
    </SiteEditModeContext.Provider>
  );
}

function EditorToolbar({
  canUndo, canRedo, onUndo, onRedo, assistantOpen, onToggleAssistant,
}: { canUndo: boolean; canRedo: boolean; onUndo: () => void; onRedo: () => void; assistantOpen: boolean; onToggleAssistant: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-1.5 p-1.5 rounded-full shadow-lg" style={{ background: "var(--organic-espresso)" }}>
      <ToolbarBtn onClick={onUndo} disabled={!canUndo} label="Annulla ultima modifica"><Undo2 className="w-4 h-4" /></ToolbarBtn>
      <ToolbarBtn onClick={onRedo} disabled={!canRedo} label="Ripeti modifica"><Redo2 className="w-4 h-4" /></ToolbarBtn>
      <div className="w-px h-5" style={{ background: "var(--organic-line)" }} />
      <ToolbarBtn onClick={onToggleAssistant} active={assistantOpen} label="Assistente IA"><Sparkles className="w-4 h-4" /></ToolbarBtn>
      <span className="flex items-center gap-1.5 px-3 text-xs font-semibold" style={{ color: "var(--foreground)" }}>
        <Pencil className="w-3.5 h-3.5" /> Modalità modifica
      </span>
    </div>
  );
}

function ToolbarBtn({ onClick, disabled, active, label, children }: { onClick: () => void; disabled?: boolean; active?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-8 h-8 rounded-full grid place-items-center transition-colors disabled:opacity-30"
      style={{ background: active ? "var(--organic-terracotta)" : "transparent", color: active ? "var(--primary-foreground)" : "var(--foreground)" }}
    >
      {children}
    </button>
  );
}

interface AssistantMsg { role: "user" | "assistant"; content: string }

function EditorAssistant({ onClose }: { onClose: () => void }) {
  const { fields, applyChange } = useSiteEditMode();
  const [messages, setMessages] = useState<AssistantMsg[]>([
    { role: "assistant", content: "Ciao! Dimmi cosa vuoi cambiare in questa pagina (es. \"rendi il titolo principale verde e più grande\") e lo faccio per te." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setError(null);
    const nextMessages: AssistantMsg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/site-editor-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(0, -1),
          fields: Object.entries(fields).map(([key, currentText]) => ({ key, currentText })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Richiesta non riuscita");

      for (const edit of data.edits ?? []) {
        await applyChange(edit.key, edit.text ?? fields[edit.key] ?? "", { color: edit.color, fontSize: edit.fontSize });
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || "Fatto." }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore imprevisto");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-20 right-5 z-50 w-80 max-w-[calc(100vw-2.5rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ background: "var(--organic-espresso)", maxHeight: 420 }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--organic-line)" }}>
        <span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: "var(--foreground)" }}><Sparkles className="w-4 h-4" /> Assistente editor</span>
        <button type="button" onClick={onClose} aria-label="Chiudi assistente"><X className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} /></button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        {messages.map((m, i) => (
          <div key={i} className="text-sm" style={{ color: m.role === "user" ? "var(--organic-green-soft)" : "var(--foreground)" }}>
            <span className="font-semibold">{m.role === "user" ? "Tu: " : "Assistente: "}</span>
            {m.content}
          </div>
        ))}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
      <div className="flex items-center gap-2 p-3 border-t" style={{ borderColor: "var(--organic-line)" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Cosa vuoi modificare?"
          className="flex-1 h-9 px-3 rounded-lg bg-white text-black text-sm focus:outline-none"
        />
        <button type="button" onClick={send} disabled={busy} className="w-9 h-9 rounded-lg grid place-items-center shrink-0" style={{ background: "var(--organic-terracotta)" }}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  );
}

const COLOR_OPTIONS: { key: StyleColor; label: string }[] = [
  { key: "default", label: "Default" },
  { key: "green", label: "Verde" },
  { key: "terracotta", label: "Terracotta" },
  { key: "sand", label: "Chiaro" },
  { key: "muted", label: "Attenuato" },
];
const SIZE_OPTIONS: { key: StyleSize; label: string }[] = [
  { key: "default", label: "Normale" },
  { key: "sm", label: "Piccolo" },
  { key: "lg", label: "Grande" },
  { key: "xl", label: "Molto grande" },
];

/**
 * Avvolge un testo del copy (foglia stringa, es. "prezzi.heroTitle.pre") e lo
 * rende cliccabile in modalità modifica: click → dialog con testo, colore,
 * dimensione e un bottone "ripristina default" → salva o annulla. Fuori dalla
 * modalità modifica (o per utenti non admin) è invisibile: renderizza solo il
 * testo con lo stile eventualmente salvato, nessun cambiamento per i
 * visitatori normali che arrivano dalla navigazione ordinaria del sito.
 */
export function EditableText({ path, children, as: Tag = "span" }: { path: string; children: string; as?: keyof React.JSX.IntrinsicElements }) {
  const { editMode, getContent, getStyle, registerField, applyChange, resetField } = useSiteEditMode();
  const [editing, setEditing] = useState(false);
  const savedContent = getContent(path);
  const displayValue = savedContent ?? children;
  const [draft, setDraft] = useState(displayValue);
  const savedStyle = getStyle(path);
  const [draftStyle, setDraftStyle] = useState<StyleValue>(savedStyle ?? {});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setDraft(displayValue), [displayValue]);
  useEffect(() => setDraftStyle(savedStyle ?? {}), [savedStyle]);
  useEffect(() => { registerField(path, displayValue); }, [path, displayValue, registerField]);

  const appliedStyle = styleToCss(savedStyle);

  if (!editMode) return <Tag style={appliedStyle}>{displayValue}</Tag>;

  // L'editor si apre in un portale (dialog centrato) invece che inline: molti usi
  // di EditableText finiscono dentro un <Button>, e nidificare un <textarea> +
  // altri <button> dentro un <button> reale produrrebbe HTML non valido.
  async function handleSave() {
    setSaving(true);
    try {
      await applyChange(path, draft, draftStyle);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      setEditing(false);
    } catch {
      alert("Salvataggio non riuscito, riprova.");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      await resetField(path);
      setEditing(false);
    } catch {
      alert("Ripristino non riuscito, riprova.");
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
        style={{ ...appliedStyle, outline: "1.5px dashed var(--organic-terracotta)", outlineOffset: 3, cursor: "pointer", borderRadius: 3, position: "relative" }}
      >
        {saved && <Check className="w-3 h-3 inline mr-1" style={{ color: "var(--organic-green)" }} />}
        {displayValue}
      </Tag>
      {editing && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(10,15,28,.7)" }} onClick={() => setEditing(false)}>
          <div className="w-full max-w-lg rounded-2xl p-5 space-y-4" style={{ background: "var(--organic-espresso)" }} onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-mono" style={{ color: "rgba(234,241,248,.5)" }}>{path}</p>
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={draft.length > 60 ? 4 : 2}
              className="w-full bg-white text-black border-2 rounded-lg p-2.5 text-sm resize-y focus:outline-none"
              style={{ borderColor: "var(--organic-terracotta)" }}
            />

            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(234,241,248,.6)" }}>Colore</p>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setDraftStyle((s) => ({ ...s, color: o.key }))}
                    className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full border"
                    style={{
                      borderColor: (draftStyle.color ?? "default") === o.key ? "var(--organic-terracotta)" : "var(--organic-line)",
                      color: "var(--foreground)",
                      background: (draftStyle.color ?? "default") === o.key ? "rgba(200,247,81,.08)" : "transparent",
                    }}
                  >
                    <span className="w-3 h-3 rounded-full border" style={{ background: o.key === "default" ? "transparent" : COLOR_SWATCH[o.key], borderColor: "var(--organic-line)" }} />
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "rgba(234,241,248,.6)" }}>Dimensione</p>
              <div className="flex flex-wrap gap-1.5">
                {SIZE_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setDraftStyle((s) => ({ ...s, fontSize: o.key }))}
                    className="text-xs font-medium px-2.5 py-1.5 rounded-full border"
                    style={{
                      borderColor: (draftStyle.fontSize ?? "default") === o.key ? "var(--organic-terracotta)" : "var(--organic-line)",
                      color: "var(--foreground)",
                      background: (draftStyle.fontSize ?? "default") === o.key ? "rgba(200,247,81,.08)" : "transparent",
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                style={{ color: "var(--muted-foreground)" }}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ripristina default
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setDraft(displayValue); setDraftStyle(savedStyle ?? {}); setEditing(false); }}
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
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
