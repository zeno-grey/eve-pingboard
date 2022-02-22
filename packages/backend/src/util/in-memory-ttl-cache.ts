export class InMemoryTTLCache<K, V> {
  private defaultTTL: number | null
  private _get: (key: K) => Promise<{ ttl?: number, value: V }>
  private maxEntries: number | null
  private cache = new Map<K, Promise<{ expires: number, value: V }>>()

  constructor(options: {
    defaultTTL: number
    get: (key: K) => Promise<{ ttl?: number, value: V }>
    maxEntries?: number
  })
  constructor(options: { get: (key: K) => Promise<{ ttl: number, value: V }>, maxEntries?: number })
  constructor(options: {
    defaultTTL?: number
    get(key: K): Promise<{ ttl?: number, value: V }>
    maxEntries?: number
  }) {
    this.defaultTTL = options.defaultTTL ?? null
    this._get = options.get
    this.maxEntries = options.maxEntries ?? null
  }

  async get(key: K, forceRefresh = false): Promise<V> {
    if (forceRefresh) {
      this.cache.delete(key)
    } else {
      const cached = this.cache.get(key)
      if (cached) {
        const { expires, value } = await cached
        if (expires > Date.now()) {
          return value
        }
      }
    }
    const newValue = (async () => {
      const { ttl, value } = await this._get(key)
      return {
        expires: Date.now() + (ttl ?? this.defaultTTL ?? 0),
        value,
      }
    })()
    this.cache.set(key, newValue)
    if (typeof this.maxEntries === 'number' && this.cache.size > Math.max(0, this.maxEntries)) {
      const oldKeys = [...this.cache.keys()].slice(0, this.cache.size - Math.max(this.maxEntries))
      for (const key of oldKeys) {
        this.cache.delete(key)
      }
    }
    return newValue.then(v => v.value)
  }

  clear(): void {
    this.cache.clear()
  }
}
