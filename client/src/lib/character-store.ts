// Client-side character store that works without a backend
// Uses React state (in-memory) since localStorage is blocked in sandboxed iframes
// When the backend API is available, it syncs there too

export interface CharacterData {
  id: number;
  name: string;
  firearmSkillSmg: number;
  firearmSkillMg: number;
  weaponName: string;
  weaponDamage: string;
  weaponMagazine: number;
  weaponType: string;
  weaponMalfunction: number;
}

let nextId = 1;
let characters: CharacterData[] = [];
let snapshot = characters; // stable reference for useSyncExternalStore
let listeners: Set<() => void> = new Set();

function emitChange() {
  snapshot = [...characters]; // new reference only on actual change
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function getSnapshot(): CharacterData[] {
  return snapshot;
}

export function getCharacter(id: number): CharacterData | undefined {
  return characters.find((c) => c.id === id);
}

export function createCharacter(data: Omit<CharacterData, "id">): CharacterData {
  const char: CharacterData = { ...data, id: nextId++ };
  characters = [...characters, char];
  emitChange();
  return char;
}

export function updateCharacter(id: number, data: Partial<Omit<CharacterData, "id">>): CharacterData | undefined {
  const idx = characters.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  characters = characters.map((c) => (c.id === id ? { ...c, ...data } : c));
  emitChange();
  return characters.find((c) => c.id === id);
}

export function deleteCharacter(id: number): void {
  characters = characters.filter((c) => c.id !== id);
  emitChange();
}

// Try to sync with backend API on startup
export async function tryLoadFromBackend(): Promise<boolean> {
  try {
    const res = await fetch("/api/characters", { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const text = await res.text();
      if (text) {
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length > 0) {
          characters = data;
          nextId = Math.max(...data.map((c: CharacterData) => c.id)) + 1;
          emitChange();
        }
      }
      return true;
    }
  } catch {
    // Backend not available — expected in static deployment
  }
  return false;
}

// Try to persist to backend (fire and forget)
export async function trySaveToBackend(method: string, url: string, data?: unknown): Promise<void> {
  try {
    await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // Ignore — client-side state is the source of truth
  }
}
