// Client-side character store persisted to localStorage

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

const STORAGE_KEY = "pulp-auto-characters";

function loadFromStorage(): { characters: CharacterData[]; nextId: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const chars: CharacterData[] = Array.isArray(parsed.characters) ? parsed.characters : [];
      const nextId: number =
        typeof parsed.nextId === "number"
          ? parsed.nextId
          : chars.length > 0
          ? Math.max(...chars.map((c) => c.id)) + 1
          : 1;
      return { characters: chars, nextId };
    }
  } catch {
    // Ignore parse errors — start fresh
  }
  return { characters: [], nextId: 1 };
}

function saveToStorage(chars: CharacterData[], id: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ characters: chars, nextId: id }));
  } catch {
    // Ignore storage errors (e.g. quota exceeded or sandboxed iframe)
  }
}

const initial = loadFromStorage();
let nextId = initial.nextId;
let characters: CharacterData[] = initial.characters;
let snapshot = characters; // stable reference for useSyncExternalStore
let listeners: Set<() => void> = new Set();

function emitChange() {
  snapshot = [...characters]; // new reference only on actual change
  saveToStorage(characters, nextId);
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
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

export function updateCharacter(
  id: number,
  data: Partial<Omit<CharacterData, "id">>,
): CharacterData | undefined {
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
