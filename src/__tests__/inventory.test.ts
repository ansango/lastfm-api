import { describe, test, expect } from 'bun:test';
import { LastFmClient } from '../client.js';
import { CANONICAL_METHODS } from '../canonical-methods.js';

/**
 * Tests that the package's exported client covers the canonical
 * Last.fm method inventory declared in `src/canonical-methods.ts`.
 *
 * The inventory list is the single source of truth for the "57/57"
 * coverage declared in the parent epic (#67), re-audited in #77,
 * and consumed by the docs tool via `src/method-registry.ts` (#92).
 */

describe('inventory: 57/57 canonical Last.fm methods', () => {
	test('the inventory list itself contains exactly 57 entries', () => {
		expect(CANONICAL_METHODS.length).toBe(57);
	});

	test('all canonical methods exist on the LastFmClient as callable functions', () => {
		const client = new LastFmClient({ apiKey: 'inventory-test' });
		const namespaces: Record<string, Record<string, unknown>> = {
			artist: client.artist as unknown as Record<string, unknown>,
			album: client.album as unknown as Record<string, unknown>,
			track: client.track as unknown as Record<string, unknown>,
			user: client.user as unknown as Record<string, unknown>,
			tag: client.tag as unknown as Record<string, unknown>,
			chart: client.chart as unknown as Record<string, unknown>,
			geo: client.geo as unknown as Record<string, unknown>,
			library: client.library as unknown as Record<string, unknown>,
			auth: client.auth as unknown as Record<string, unknown>
		};

		for (const canonical of CANONICAL_METHODS) {
			const [ns, method] = canonical.split('.');
			expect(namespaces[ns], `namespace ${ns} missing`).toBeDefined();
			expect(typeof namespaces[ns][method], `${canonical} should be a function`).toBe(
				'function'
			);
		}
	});

	test('no duplicate canonical methods are listed', () => {
		const set = new Set(CANONICAL_METHODS);
		expect(set.size).toBe(CANONICAL_METHODS.length);
	});

	test('every entry matches the namespace.method shape', () => {
		for (const canonical of CANONICAL_METHODS) {
			expect(canonical).toMatch(/^[a-z]+\.[a-zA-Z]+$/);
		}
	});

	test('per-namespace breakdown matches the docs/api-coverage.md audit', () => {
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
		for (const canonical of CANONICAL_METHODS) {
			const [ns] = canonical.split('.');
			actual[ns] = (actual[ns] ?? 0) + 1;
		}
		expect(actual).toEqual(expected);
	});
});
