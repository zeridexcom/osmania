interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

function prune(now: number): void {
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
}

export function cacheGet<T>(key: string): T | undefined {
  prune(Date.now());
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheDelete(key: string): void {
  store.delete(key);
}

export function cacheClear(): void {
  store.clear();
}

export function createTtlCache<T>(ttlMs: number) {
  return {
    get(key: string): T | undefined {
      return cacheGet<T>(key);
    },
    set(key: string, value: T): void {
      cacheSet(key, value, ttlMs);
    },
    delete(key: string): void {
      cacheDelete(key);
    },
    clear(): void {
      cacheClear();
    },
  };
}
