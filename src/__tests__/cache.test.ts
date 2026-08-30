import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { CacheManager, MemoryCacheStore, StorageCacheStore, type StorageLike } from '../modules/cache/index.js'
import { installFetchMock } from './helpers/fetch-mock.js'

describe('MemoryCacheStore', () => {
	test('basic get, set, delete, clear, has and stats', () => {
		const store = new MemoryCacheStore({ defaultTtlMs: 10_000 })

		expect(store.get('key1')).toBeUndefined()
		expect(store.has('key1')).toBe(false)

		store.set('key1', { hello: 'world' })
		expect(store.has('key1')).toBe(true)
		expect(store.get<{ hello: string }>('key1')).toEqual({ hello: 'world' })

		const stats1 = store.stats()
		expect(stats1.hits).toBe(1)
		expect(stats1.misses).toBe(1)
		expect(stats1.size).toBe(1)

		expect(store.delete('key1')).toBe(true)
		expect(store.has('key1')).toBe(false)
		expect(store.get('key1')).toBeUndefined()

		store.set('key2', 123)
		store.set('key3', 456)
		expect(store.stats().size).toBe(2)

		store.clear()
		expect(store.stats().size).toBe(0)
		expect(store.stats().hits).toBe(0)
	})

	test('expires items after TTL', async () => {
		const store = new MemoryCacheStore({ defaultTtlMs: 50 })
		store.set('fast_expire', 'data')

		expect(store.get<string>('fast_expire')).toBe('data')
		await new Promise((resolve) => setTimeout(resolve, 60))

		expect(store.get('fast_expire')).toBeUndefined()
		expect(store.has('fast_expire')).toBe(false)
	})

	test('evicts oldest entries when maxEntries is exceeded', () => {
		const store = new MemoryCacheStore({ maxEntries: 2, defaultTtlMs: 10_000 })
		store.set('k1', 'v1')
		store.set('k2', 'v2')
		store.set('k3', 'v3') // should evict k1

		expect(store.has('k1')).toBe(false)
		expect(store.has('k2')).toBe(true)
		expect(store.has('k3')).toBe(true)
	})

	test('prunes expired entries', async () => {
		const store = new MemoryCacheStore({ defaultTtlMs: 30 })
		store.set('e1', 1)
		store.set('e2', 2)

		await new Promise((resolve) => setTimeout(resolve, 40))
		const pruned = store.pruneExpired()
		expect(pruned).toBe(2)
		expect(store.stats().size).toBe(0)
	})
})

describe('StorageCacheStore', () => {
	class MockStorage implements StorageLike {
		private items = new Map<string, string>()

		getItem(key: string): string | null {
			return this.items.get(key) ?? null
		}
		setItem(key: string, value: string): void {
			this.items.set(key, value)
		}
		removeItem(key: string): void {
			this.items.delete(key)
		}
		clear(): void {
			this.items.clear()
		}
		get length(): number {
			return this.items.size
		}
		key(index: number): string | null {
			return Array.from(this.items.keys())[index] ?? null
		}
	}

	test('persists and retrieves values with prefix', () => {
		const storage = new MockStorage()
		const store = new StorageCacheStore({ storage, prefix: 'test_' })

		store.set('album_1', { name: 'OK Computer' })
		expect(storage.getItem('test_album_1')).not.toBeNull()
		expect(store.get<{ name: string }>('album_1')).toEqual({ name: 'OK Computer' })

		expect(store.has('album_1')).toBe(true)
		expect(store.stats().size).toBe(1)

		store.delete('album_1')
		expect(store.get('album_1')).toBeUndefined()

		store.set('album_2', { name: 'Kid A' })
		store.clear()
		expect(store.stats().size).toBe(0)
	})

	test('expires items in storage after TTL', async () => {
		const storage = new MockStorage()
		const store = new StorageCacheStore({ storage, defaultTtlMs: 50 })
		store.set('exp', 'value')

		expect(store.get<string>('exp')).toBe('value')
		await new Promise((resolve) => setTimeout(resolve, 60))
		expect(store.get('exp')).toBeUndefined()
	})
})

describe('CacheManager', () => {
	test('resolves TTL hierarchy correctly', () => {
		const manager = new CacheManager({
			defaultTtlMs: 1000,
			ttlByNamespace: { artist: 5000, user: 2000 },
			ttlByMethod: { 'artist.getSimilar': 9000 },
		})

		expect(manager.resolveTtl('artist.getSimilar')).toBe(9000)
		expect(manager.resolveTtl('artist.getInfo')).toBe(5000)
		expect(manager.resolveTtl('user.getInfo')).toBe(2000)
		expect(manager.resolveTtl('tag.getInfo')).toBe(1000)
		expect(manager.resolveTtl(undefined)).toBe(1000)
	})

	test('wraps async calls and caches results', async () => {
		const manager = new CacheManager({ defaultTtlMs: 10_000 })
		let callCount = 0
		const fetcherFn = async () => {
			callCount++
			return { data: 'fresh' }
		}

		const res1 = await manager.wrap('cache_key', fetcherFn)
		expect(res1).toEqual({ data: 'fresh' })
		expect(callCount).toBe(1)

		const res2 = await manager.wrap('cache_key', fetcherFn)
		expect(res2).toEqual({ data: 'fresh' })
		expect(callCount).toBe(1) // from cache!
	})

	test('bypasses caching when disabled', async () => {
		const manager = new CacheManager({ enabled: false })
		let callCount = 0
		const fetcherFn = async () => {
			callCount++
			return 'value'
		}

		await manager.wrap('k', fetcherFn)
		await manager.wrap('k', fetcherFn)
		expect(callCount).toBe(2)
	})
})

describe('LastFmClient Cache Integration', () => {
	let mock: ReturnType<typeof installFetchMock>

	beforeEach(() => {
		mock = installFetchMock()
	})

	afterEach(() => {
		mock.restore()
	})

	test('serves duplicate GET requests from cache without network calls', async () => {
		const client = new LastFmClient({
			apiKey: 'test-api-key',
			cache: true,
		})

		mock.respondWithJson({
			artist: {
				name: 'Radiohead',
				mbid: 'a74b1b7f-71a5-4011-9441-d0b5e4122711',
				url: 'https://www.last.fm/music/Radiohead',
				image: [],
				streamable: '0',
				ontour: '0',
				stats: { listeners: '100', playcount: '500' },
				similar: { artist: [] },
				tags: { tag: [] },
				bio: { summary: '', content: '' },
			},
		})

		// 1st request -> hits mock fetch
		const res1 = await client.artist.getInfo({ artist: 'Radiohead' })
		expect(res1.artist.name).toBe('Radiohead')
		expect(mock.calls.length).toBe(1)

		// 2nd request -> hits cache, 0 new fetch calls!
		const res2 = await client.artist.getInfo({ artist: 'Radiohead' })
		expect(res2.artist.name).toBe('Radiohead')
		expect(mock.calls.length).toBe(1)

		const stats = client.cache.stats()
		expect(stats?.hits).toBe(1)
		expect(stats?.misses).toBe(1)
		expect(stats?.size).toBe(1)

		// Clearing cache forces a new network call
		await client.cache.clear()
		mock.respondWithJson({
			artist: {
				name: 'Radiohead',
				mbid: 'a74b1b7f-71a5-4011-9441-d0b5e4122711',
				url: 'https://www.last.fm/music/Radiohead',
				image: [],
				streamable: '0',
				ontour: '0',
				stats: { listeners: '100', playcount: '500' },
				similar: { artist: [] },
				tags: { tag: [] },
				bio: { summary: '', content: '' },
			},
		})

		const res3 = await client.artist.getInfo({ artist: 'Radiohead' })
		expect(res3.artist.name).toBe('Radiohead')
		expect(mock.calls.length).toBe(2)
	})
})
