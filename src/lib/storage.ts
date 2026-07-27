type Listener = () => void;

const FAVORITES_KEY = "launcher.favorites";
const RECENTS_KEY = "launcher.recents";
const RENAMES_KEY = "launcher.renames";
const MAX_RECENTS = 10;
const EMPTY: string[] = [];
const EMPTY_RENAMES: Record<string, string> = {};

const favoriteListeners = new Set<Listener>();
const recentListeners = new Set<Listener>();
const renameListeners = new Set<Listener>();

let favoritesCache: string[] | null = null;
let recentsCache: string[] | null = null;
let renamesCache: Record<string, string> | null = null;

function readList(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key: string, value: string[]) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readRecord(key: string): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRecord(key: string, value: Record<string, string>) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getFavoritesSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY;
  if (favoritesCache === null) favoritesCache = readList(FAVORITES_KEY);
  return favoritesCache;
}

export function getRecentsSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY;
  if (recentsCache === null) recentsCache = readList(RECENTS_KEY);
  return recentsCache;
}

export function getServerSnapshot(): string[] {
  return EMPTY;
}

export function getRenamesSnapshot(): Record<string, string> {
  if (typeof window === "undefined") return EMPTY_RENAMES;
  if (renamesCache === null) renamesCache = readRecord(RENAMES_KEY);
  return renamesCache;
}

export function getRenamesServerSnapshot(): Record<string, string> {
  return EMPTY_RENAMES;
}

export function subscribeFavorites(listener: Listener) {
  favoriteListeners.add(listener);
  return () => favoriteListeners.delete(listener);
}

export function subscribeRecents(listener: Listener) {
  recentListeners.add(listener);
  return () => recentListeners.delete(listener);
}

export function subscribeRenames(listener: Listener) {
  renameListeners.add(listener);
  return () => renameListeners.delete(listener);
}

export function toggleFavorite(id: string) {
  const current = getFavoritesSnapshot();
  const next = current.includes(id)
    ? current.filter((f) => f !== id)
    : [...current, id];
  favoritesCache = next;
  writeList(FAVORITES_KEY, next);
  favoriteListeners.forEach((listener) => listener());
}

export function renameProject(id: string, name: string) {
  const current = { ...getRenamesSnapshot() };
  const trimmed = name.trim();
  if (trimmed) {
    current[id] = trimmed;
  } else {
    delete current[id];
  }
  renamesCache = current;
  writeRecord(RENAMES_KEY, current);
  renameListeners.forEach((listener) => listener());
}

export function pushRecent(id: string) {
  const current = getRecentsSnapshot().filter((r) => r !== id);
  const next = [id, ...current].slice(0, MAX_RECENTS);
  recentsCache = next;
  writeList(RECENTS_KEY, next);
  recentListeners.forEach((listener) => listener());
}
