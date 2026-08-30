import type { CacheStoreStats } from './interface.js'
import type { CacheManager } from './manager.js'

export interface CacheService {
	get: <T = unknown>(key: string) => Promise<T | undefined>
	set: <T = unknown>(key: string, value: T, ttlMs?: number) => Promise<void>
	delete: (key: string) => Promise<boolean>
	clear: () => Promise<void>
	has: (key: string) => Promise<boolean>
	stats: () => CacheStoreStats | undefined
	manager: CacheManager
}

export function createCacheService(manager: CacheManager): CacheService {
	return {
		get: <T = unknown>(key: string) => manager.get<T>(key),
		set: <T = unknown>(key: string, value: T, ttlMs?: number) => manager.set(key, value, ttlMs),
		delete: (key: string) => manager.delete(key),
		clear: () => manager.clear(),
		has: (key: string) => manager.has(key),
		stats: () => manager.stats(),
		manager,
	}
}
