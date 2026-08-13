// Utility pure (client-safe, nessun import di prisma) per il sistema SiteContent:
// override editabili dei copy del sito applicati sopra i default di copy.ts.

export type Overrides = Record<string, string>;

export interface EditableEntry {
  key: string; // dot-path, es. "prezzi.premiumPrice"
  default: string; // valore corrente in copy.ts
}

// Elenca tutte le foglie di tipo stringa (le uniche sovrascrivibili senza rischio).
// Salta funzioni e array (troppo complessi/pericolosi da editare come testo).
export function editableEntries(obj: unknown, prefix = ""): EditableEntry[] {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return [];
  const out: EditableEntry[] = [];
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out.push({ key, default: v });
    else if (v && typeof v === "object" && !Array.isArray(v)) out.push(...editableEntries(v, key));
  }
  return out;
}

// True se il dot-path punta a una foglia stringa in `base` (whitelist di sicurezza).
export function isEditableKey(base: unknown, key: string): boolean {
  const parts = key.split(".");
  let node: unknown = base;
  for (const p of parts) {
    if (!node || typeof node !== "object" || Array.isArray(node)) return false;
    node = (node as Record<string, unknown>)[p];
  }
  return typeof node === "string";
}

// Applica gli override a `base` restituendo un nuovo oggetto: clona solo lungo i
// percorsi modificati (le funzioni e i rami non toccati restano per riferimento).
export function applyOverrides<T extends Record<string, unknown>>(base: T, overrides: Overrides): T {
  const root: Record<string, unknown> = { ...base };
  for (const [path, value] of Object.entries(overrides)) {
    const parts = path.split(".");
    let node = root;
    let ok = true;
    for (let i = 0; i < parts.length - 1; i++) {
      const cur = node[parts[i]];
      if (!cur || typeof cur !== "object" || Array.isArray(cur)) { ok = false; break; }
      node[parts[i]] = { ...(cur as Record<string, unknown>) };
      node = node[parts[i]] as Record<string, unknown>;
    }
    // applica solo se la foglia esistente è una stringa
    if (ok && typeof node[parts[parts.length - 1]] === "string") {
      node[parts[parts.length - 1]] = value;
    }
  }
  return root as T;
}
