/**
 * Interface definition for Cache Stores in @ansango/lastfm-api
 */

export interface CacheStoreStats {
	hits: number
	misses: number
	size: number
}

export interface CacheStore {
	/**
	 * Retrieve a cached value by key
	 */
	get<T = unknown>(key: string): Promise<T | undefined> | T | undefined

	/**
	 * Store a value in the cache with an optional TTL in milliseconds
	 */
	set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<void> | void

	/**
	 * Remove a specific key from the cache
	 */
	delete(key: string): Promise<boolean> | boolean

	/**
	 * Clear all cached values
	 */
	clear(): Promise<void> | void

	/**
	 * Check if a non-expired key exists in the cache
	 */
	has(key: string): Promise<boolean> | boolean

	/**
	 * Get cache metrics if supported
	 */
	stats?(): CacheStoreStats
}

export interface CacheOptions {
	/**
	 * Custom cache store implementation (defaults to MemoryCacheStore)
	 */
	store?: CacheStore

	/**
	 * Default TTL in milliseconds for all read requests (default: 300,000 ms / 5 minutes)
	 */
	defaultTtlMs?: number

	/**
	 * Granular TTL overrides by namespace (e.g. { artist: 86_400_000, user: 60_000 })
	 */
	ttlByNamespace?: Record<string, number>

	/**
	 * Granular TTL overrides by method (e.g. { 'user.getRecentTracks': 10_000 })
	 */
	ttlByMethod?: Record<string, number>

	/**
	 * Whether caching is enabled (default: true)
	 */
	enabled?: boolean
}
