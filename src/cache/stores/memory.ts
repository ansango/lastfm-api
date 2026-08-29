import type { CacheStore, CacheStoreStats } from '../interface.js'

export interface MemoryCacheStoreOptions {
	/**
	 * Maximum number of entries before oldest entries are evicted (default: 500)
	 */
	maxEntries?: number

	/**
	 * Default TTL in milliseconds (default: 300,000 / 5 minutes)
	 */
	defaultTtlMs?: number
}

interface CacheRecord<T> {
	value: T
	expiresAt: number
}

/**
 * High-performance in-memory cache store with TTL expiration and LRU eviction.
 */
export class MemoryCacheStore implements CacheStore {
	private readonly entries = new Map<string, CacheRecord<unknown>>()
	private readonly maxEntries: number
	private readonly defaultTtlMs: number
	private hitCount = 0
	private missCount = 0

	constructor(options: MemoryCacheStoreOptions = {}) {
		this.maxEntries = options.maxEntries ?? 500
		this.defaultTtlMs = options.defaultTtlMs ?? 300_000
	}

	public get<T = unknown>(key: string): T | undefined {
		const record = this.entries.get(key)
		if (!record) {
			this.missCount++
			return undefined
		}

		if (Date.now() > record.expiresAt) {
			this.entries.delete(key)
			this.missCount++
			return undefined
		}

		// Re-insert to refresh LRU order
		this.entries.delete(key)
		this.entries.set(key, record)
		this.hitCount++
		return record.value as T
	}

	public set<T = unknown>(key: string, value: T, ttlMs?: number): void {
		const ttl = ttlMs ?? this.defaultTtlMs
		const expiresAt = Date.now() + ttl

		// Evict oldest entry if capacity reached
		if (this.entries.size >= this.maxEntries && !this.entries.has(key)) {
			const oldestKey = this.entries.keys().next().value
			if (oldestKey !== undefined) {
				this.entries.delete(oldestKey)
			}
		}

		this.entries.delete(key)
		this.entries.set(key, { value, expiresAt })
	}

	public delete(key: string): boolean {
		return this.entries.delete(key)
	}

	public clear(): void {
		this.entries.clear()
		this.hitCount = 0
		this.missCount = 0
	}

	public has(key: string): boolean {
		const record = this.entries.get(key)
		if (!record) return false
		if (Date.now() > record.expiresAt) {
			this.entries.delete(key)
			return false
		}
		return true
	}

	public stats(): CacheStoreStats {
		this.pruneExpired()
		return {
			hits: this.hitCount,
			misses: this.missCount,
			size: this.entries.size,
		}
	}

	/**
	 * Removes all expired entries from memory
	 */
	public pruneExpired(): number {
		const now = Date.now()
		let pruned = 0
		for (const [key, record] of this.entries.entries()) {
			if (now > record.expiresAt) {
				this.entries.delete(key)
				pruned++
			}
		}
		return pruned
	}
}
