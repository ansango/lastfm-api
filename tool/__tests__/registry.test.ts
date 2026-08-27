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
import { describe, test, expect } from 'bun:test';
import { CANONICAL_METHODS } from '../../src/canonical-methods.js';
import { allMethods, methodRegistry } from '../../src/method-registry.js';
import { createClient } from '../../src/client.js';

describe('method-registry: shape', () => {
	test('registry covers all 57 canonical methods', () => {
		expect(allMethods.length).toBe(57);
	});

	test('every registry id appears in CANONICAL_METHODS', () => {
		const ids = new Set(CANONICAL_METHODS);
		for (const m of allMethods) {
			expect(ids.has(m.id as (typeof CANONICAL_METHODS)[number])).toBe(true);
		}
	});

	test('every entry has a resolve function and Zod request/response schemas', () => {
		const client = createClient({ apiKey: 'probe' });
		for (const m of allMethods) {
			expect(typeof m.resolve, `${m.id} resolve`).toBe('function');
			const fn = m.resolve(client);
			expect(typeof fn, `${m.id} resolved fn`).toBe('function');
			expect(typeof m.schema.safeParse, `${m.id} schema.safeParse`).toBe('function');
			expect(typeof m.response.safeParse, `${m.id} response.safeParse`).toBe('function');
		}
	});

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
			auth: 3
		};
		const actual: Record<string, number> = {};
		for (const m of allMethods) {
			actual[m.ns] = (actual[m.ns] ?? 0) + 1;
		}
		expect(actual).toEqual(expected);
	});
});

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
			'track.scrobble'
		];
		for (const id of writes) {
			const [ns, name] = id.split('.') as [string, string];
			const m = methodRegistry[ns][name];
			expect(m.httpMethod, `${id} httpMethod`).toBe('POST');
			expect(m.bodyKind, `${id} bodyKind`).toBe('json');
			expect(m.requiresSession, `${id} requiresSession`).toBe(true);
			expect(m.requiresSignature, `${id} requiresSignature`).toBe(true);
		}
	});

	test('auth.getMobileSession is POST + signed but does NOT need a session', () => {
		const m = methodRegistry.auth.getMobileSession;
		expect(m.httpMethod).toBe('POST');
		expect(m.bodyKind).toBe('json');
		expect(m.requiresSession).toBe(false);
		expect(m.requiresSignature).toBe(true);
	});

	test('auth.getToken and auth.getSession are signed GET (no session)', () => {
		for (const name of ['getToken', 'getSession']) {
			const m = methodRegistry.auth[name];
			expect(m.httpMethod, `${name} httpMethod`).toBe('GET');
			expect(m.requiresSession, `${name} requiresSession`).toBe(false);
			expect(m.requiresSignature, `${name} requiresSignature`).toBe(true);
		}
	});

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
			'auth.getMobileSession',
			'auth.getToken',
			'auth.getSession'
		]);
		for (const m of allMethods) {
			if (specialIds.has(m.id)) continue;
			expect(m.httpMethod, `${m.id} httpMethod`).toBe('GET');
			expect(m.bodyKind, `${m.id} bodyKind`).toBe('query');
			expect(m.requiresSession, `${m.id} requiresSession`).toBe(false);
			expect(m.requiresSignature, `${m.id} requiresSignature`).toBe(false);
		}
	});
});
