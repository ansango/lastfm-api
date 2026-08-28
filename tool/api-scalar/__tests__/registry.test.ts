/**
 * Registry smoke tests (HU5 of #92).
 *
 * Verifies that:
 *  - `methodRegistry` covers all 57 canonical Last.fm methods
 *  - Every entry has a callable `fn`, a Zod request schema and a Zod
 *    response schema
 *  - The `SPECIAL` table covers the 13 methods that break the
 *    namespace defaults (10 POST signed + 3 auth)
 */
import { describe, expect, test } from 'bun:test'
import { createClient } from '../../../src/client.js'
import { ALL_REGISTRY_METHODS, allMethods, methodRegistry } from '../../../src/method-registry.js'

describe('method-registry: shape', () => {
	test('registry covers all canonical and insight methods', () => {
		expect(allMethods.length).toBe(ALL_REGISTRY_METHODS.length)
	})

	test('every registry id appears in ALL_REGISTRY_METHODS', () => {
		const ids = new Set(ALL_REGISTRY_METHODS)
		for (const m of allMethods) {
			expect(ids.has(m.id as (typeof ALL_REGISTRY_METHODS)[number])).toBe(true)
		}
	})

	test('every entry has a resolve function and Zod request/response schemas', () => {
		const client = createClient({ apiKey: 'probe' })
		for (const m of allMethods) {
			expect(typeof m.resolve, `${m.id} resolve`).toBe('function')
			const fn = m.resolve(client)
			expect(typeof fn, `${m.id} resolved fn`).toBe('function')
			expect(typeof m.schema.safeParse, `${m.id} schema.safeParse`).toBe('function')
			expect(typeof m.response.safeParse, `${m.id} response.safeParse`).toBe('function')
		}
	})

	test('per-namespace count matches the inventory', () => {
		const expected: Record<string, number> = {
			artist: 10,
			album: 6,
			track: 12,
			user: 13,
			tag: 7,
			chart: 3,
			geo: 2,
			library: 1,
			auth: 2,
			insights: 20,
		}
		const actual: Record<string, number> = {}
		for (const m of allMethods) {
			actual[m.ns] = (actual[m.ns] ?? 0) + 1
		}
		expect(actual).toEqual(expected)
	})
})

describe('method-registry: SPECIAL table', () => {
	test('10 write methods are POST + signed + require session', () => {
		const writes = [
			'album.addTags',
			'album.removeTag',
			'artist.addTags',
			'artist.removeTag',
			'track.addTags',
			'track.removeTag',
			'track.love',
			'track.unlove',
			'track.updateNowPlaying',
			'track.scrobble',
		]
		for (const id of writes) {
			const [ns, name] = id.split('.') as [string, string]
			const m = methodRegistry[ns][name]
			expect(m.httpMethod, `${id} httpMethod`).toBe('POST')
			expect(m.bodyKind, `${id} bodyKind`).toBe('json')
			expect(m.requiresSession, `${id} requiresSession`).toBe(true)
			expect(m.requiresSignature, `${id} requiresSignature`).toBe(true)
		}
	})

	test('auth.getToken and auth.getSession are signed GET (no session)', () => {
		for (const name of ['getToken', 'getSession']) {
			const m = methodRegistry.auth[name]
			expect(m.httpMethod, `${name} httpMethod`).toBe('GET')
			expect(m.requiresSession, `${name} requiresSession`).toBe(false)
			expect(m.requiresSignature, `${name} requiresSignature`).toBe(true)
		}
	})

	test('all non-special methods are GET + unsigned + no session', () => {
		const specialIds = new Set([
			'album.addTags',
			'album.removeTag',
			'artist.addTags',
			'artist.removeTag',
			'track.addTags',
			'track.removeTag',
			'track.love',
			'track.unlove',
			'track.updateNowPlaying',
			'track.scrobble',
			'auth.getToken',
			'auth.getSession',
		])
		for (const m of allMethods) {
			if (specialIds.has(m.id)) continue
			expect(m.httpMethod, `${m.id} httpMethod`).toBe('GET')
			expect(m.bodyKind, `${m.id} bodyKind`).toBe('query')
			expect(m.requiresSession, `${m.id} requiresSession`).toBe(false)
			expect(m.requiresSignature, `${m.id} requiresSignature`).toBe(false)
		}
	})
})
