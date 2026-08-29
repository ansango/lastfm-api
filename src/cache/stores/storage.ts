import type { CacheStore, CacheStoreStats } from '../interface.js'

export interface StorageLike {
	getItem(key: string): string | null
	setItem(key: string, value: string): void
	removeItem(key: string): void
	clear(): void
	readonly length: number
	key(index: number): string | null
}

export interface StorageCacheStoreOptions {
	/**
	 * Storage backend (defaults to globalThis.localStorage if available)
	 */
	storage?: StorageLike

	/**
	 * Prefix for cache keys in storage to prevent collisions (default: 'lastfm_cache_')
	 */
	prefix?: string

	/**
	 * Default TTL in milliseconds (default: 300,000 / 5 minutes)
	 */
	defaultTtlMs?: number
}

interface StoredPayload<T> {
	value: T
	expiresAt: number
}

/**
 * Persistent cache store using Web Storage (localStorage or sessionStorage).
 */
export class StorageCacheStore implements CacheStore {
	private readonly storage: StorageLike | undefined
	private readonly prefix: string
	private readonly defaultTtlMs: number
	private hitCount = 0
	private missCount = 0

	constructor(options: StorageCacheStoreOptions = {}) {
		this.storage =
			options.storage ??
			(typeof globalThis !== 'undefined' && 'localStorage' in globalThis
				? (globalThis.localStorage as unknown as StorageLike)
				: undefined)
		this.prefix = options.prefix ?? 'lastfm_cache_'
		this.defaultTtlMs = options.defaultTtlMs ?? 300_000
	}

	private prefixedKey(key: string): string {
		return `${this.prefix}${key}`
	}

	public get<T = unknown>(key: string): T | undefined {
		if (!this.storage) {
			this.missCount++
			return undefined
		}

		try {
			const item = this.storage.getItem(this.prefixedKey(key))
			if (!item) {
				this.missCount++
				return undefined
			}

			const parsed: StoredPayload<T> = JSON.parse(item)
			if (Date.now() > parsed.expiresAt) {
				this.storage.removeItem(this.prefixedKey(key))
				this.missCount++
				return undefined
			}

			this.hitCount++
			return parsed.value
		} catch {
			this.missCount++
			return undefined
		}
	}

	public set<T = unknown>(key: string, value: T, ttlMs?: number): void {
		if (!this.storage) return

		const ttl = ttlMs ?? this.defaultTtlMs
		const payload: StoredPayload<T> = {
			value,
			expiresAt: Date.now() + ttl,
		}

		try {
			this.storage.setItem(this.prefixedKey(key), JSON.stringify(payload))
		} catch {
			// Storage quota exceeded or disabled; fail gracefully
		}
	}

	public delete(key: string): boolean {
		if (!this.storage) return false
		const fullKey = this.prefixedKey(key)
		const exists = this.storage.getItem(fullKey) !== null
		if (exists) {
			this.storage.removeItem(fullKey)
			return true
		}
		return false
	}

	public clear(): void {
		if (!this.storage) return
		const keysToRemove: string[] = []
		for (let i = 0; i < this.storage.length; i++) {
			const k = this.storage.key(i)
			if (k?.startsWith(this.prefix)) {
				keysToRemove.push(k)
			}
		}
		for (const k of keysToRemove) {
			this.storage.removeItem(k)
		}
		this.hitCount = 0
		this.missCount = 0
	}

	public has(key: string): boolean {
		return this.get(key) !== undefined
	}

	public stats(): CacheStoreStats {
		let size = 0
		if (this.storage) {
			for (let i = 0; i < this.storage.length; i++) {
				const k = this.storage.key(i)
				if (k?.startsWith(this.prefix)) {
					size++
				}
			}
		}
		return {
			hits: this.hitCount,
			misses: this.missCount,
			size,
		}
	}
}
