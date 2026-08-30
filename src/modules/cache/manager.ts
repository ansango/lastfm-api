import type { CacheOptions, CacheStore, CacheStoreStats } from './interface.js'
import { MemoryCacheStore } from './stores/memory.js'

export class CacheManager {
	private readonly store: CacheStore
	private readonly defaultTtlMs: number
	private readonly ttlByNamespace: Record<string, number>
	private readonly ttlByMethod: Record<string, number>
	private readonly enabled: boolean

	constructor(options: CacheOptions = {}) {
		this.store = options.store ?? new MemoryCacheStore({ defaultTtlMs: options.defaultTtlMs })
		this.defaultTtlMs = options.defaultTtlMs ?? 300_000
		this.ttlByNamespace = options.ttlByNamespace ?? {}
		this.ttlByMethod = options.ttlByMethod ?? {}
		this.enabled = options.enabled ?? true
	}

	public isEnabled(): boolean {
		return this.enabled
	}

	public resolveTtl(methodId?: string): number {
		if (!methodId) return this.defaultTtlMs

		// 1. Direct method match (e.g. 'user.getRecentTracks' or 'user.getInfo')
		if (this.ttlByMethod[methodId] !== undefined) {
			return this.ttlByMethod[methodId]
		}

		// 2. Namespace match (e.g. 'user', 'artist', 'album')
		const [ns] = methodId.split('.')
		if (ns && this.ttlByNamespace[ns] !== undefined) {
			return this.ttlByNamespace[ns]
		}

		return this.defaultTtlMs
	}

	public async wrap<T>(key: string, fetcherFn: () => Promise<T>, ttlMs?: number): Promise<T> {
		if (!this.enabled) {
			return fetcherFn()
		}

		const cached = await this.store.get<T>(key)
		if (cached !== undefined) {
			return cached
		}

		const fresh = await fetcherFn()
		await this.store.set(key, fresh, ttlMs ?? this.defaultTtlMs)
		return fresh
	}

	public async get<T = unknown>(key: string): Promise<T | undefined> {
		return this.store.get<T>(key)
	}

	public async set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<void> {
		return this.store.set(key, value, ttlMs ?? this.defaultTtlMs)
	}

	public async delete(key: string): Promise<boolean> {
		return this.store.delete(key)
	}

	public async clear(): Promise<void> {
		return this.store.clear()
	}

	public async has(key: string): Promise<boolean> {
		return this.store.has(key)
	}

	public stats(): CacheStoreStats | undefined {
		return this.store.stats?.()
	}
}
