export type LessonStatus = "not-started" | "started" | "completed";

export type LessonProgress = {
  status: LessonStatus;
  updatedAt: number;
};

export type ProgressSnapshot = Record<string, LessonProgress>;

export interface ProgressStore {
  /** Stable, referentially-equal snapshot for useSyncExternalStore. */
  getSnapshot(): ProgressSnapshot;
  /** Server / pre-hydration snapshot — always empty. */
  getServerSnapshot(): ProgressSnapshot;
  subscribe(listener: () => void): () => void;
  get(key: string): LessonStatus;
  setStatus(key: string, status: LessonStatus): void;
  clear(): void;
}

export const EMPTY_PROGRESS: ProgressSnapshot = Object.freeze({});

const STORAGE_KEY = "ev.progress.v2";

function isValidEntry(value: unknown): value is LessonProgress {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  const status = entry.status;
  return (
    (status === "not-started" ||
      status === "started" ||
      status === "completed") &&
    typeof entry.updatedAt === "number"
  );
}

function sanitize(value: unknown): ProgressSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const result: ProgressSnapshot = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof key === "string" && isValidEntry(entry)) {
      result[key] = { status: entry.status, updatedAt: entry.updatedAt };
    }
  }
  return result;
}

/**
 * localStorage-backed store. Every access is defensive: if storage is
 * unavailable or holds invalid data the store degrades to an in-memory store
 * rather than throwing.
 */
export class LocalStorageProgressStore implements ProgressStore {
  private cache: ProgressSnapshot = {};
  private loaded = false;
  private listeners = new Set<() => void>();
  private storageListenerAttached = false;

  private readonly onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    this.loaded = false;
    this.cache = this.read();
    this.loaded = true;
    this.emit();
  };

  private read(): ProgressSnapshot {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return sanitize(JSON.parse(raw));
    } catch {
      return {};
    }
  }

  private ensureLoaded() {
    if (this.loaded) return;
    this.loaded = true;
    this.cache = this.read();
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    } catch {
      /* storage full or unavailable — keep the in-memory cache */
    }
  }

  private emit() {
    for (const listener of this.listeners) listener();
  }

  getSnapshot = (): ProgressSnapshot => {
    this.ensureLoaded();
    return this.cache;
  };

  getServerSnapshot = (): ProgressSnapshot => EMPTY_PROGRESS;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    if (!this.storageListenerAttached && typeof window !== "undefined") {
      window.addEventListener("storage", this.onStorage);
      this.storageListenerAttached = true;
    }
    return () => {
      this.listeners.delete(listener);
      if (
        this.listeners.size === 0 &&
        this.storageListenerAttached &&
        typeof window !== "undefined"
      ) {
        window.removeEventListener("storage", this.onStorage);
        this.storageListenerAttached = false;
      }
    };
  };

  get = (key: string): LessonStatus => {
    this.ensureLoaded();
    return this.cache[key]?.status ?? "not-started";
  };

  setStatus = (key: string, status: LessonStatus): void => {
    this.ensureLoaded();
    const next: ProgressSnapshot = { ...this.cache };
    if (status === "not-started") {
      delete next[key];
    } else {
      next[key] = { status, updatedAt: Date.now() };
    }
    this.cache = next;
    this.persist();
    this.emit();
  };

  clear = (): void => {
    this.cache = {};
    this.persist();
    this.emit();
  };
}

let defaultStore: ProgressStore | null = null;

/** Lazily-created browser singleton. */
export function getDefaultProgressStore(): ProgressStore {
  if (!defaultStore) defaultStore = new LocalStorageProgressStore();
  return defaultStore;
}
