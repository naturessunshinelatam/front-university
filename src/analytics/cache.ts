export type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

export class MemoryCache {
  private map = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }

    return entry.data as T;
  }

  set<T>(key: string, value: T, ttlMs: number) {
    this.map.set(key, { data: value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}
