interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private defaultTtlSeconds: number;
  public hits: number = 0;
  public misses: number = 0;

  constructor(defaultTtlSeconds: number = 60) {
    this.defaultTtlSeconds = defaultTtlSeconds;
  }

  public setTtl(seconds: number): void {
    this.defaultTtlSeconds = Math.max(5, seconds);
  }

  public getTtl(): number {
    return this.defaultTtlSeconds;
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses += 1;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses += 1;
      return null;
    }

    this.hits += 1;
    return entry.data as T;
  }

  public set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = (ttlSeconds !== undefined ? ttlSeconds : this.defaultTtlSeconds) * 1000;
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  public invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  public getStats() {
    return {
      size: this.cache.size,
      ttlSeconds: this.defaultTtlSeconds,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(2) : '1.00',
    };
  }
}

export const cacheService = new MemoryCache(Number(process.env.CACHE_TTL) || 60);
