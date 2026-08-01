import { test, beforeEach, afterEach, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LastFmClient } from '../client.js';
import { buildUrl, buildAuthUrl } from '../utils.js';
import type { LastFmConfig } from '../config.js';

/**
 * Regression tests for issue #58:
 * `new LastFmClient({ apiKey })` must not throw "Failed to parse URL from
 * undefined" because `buildUrl` / `buildAuthUrl` default `baseUrl`.
 */

/** Minimal fake artist payload that satisfies the Zod schema. */
const fakeArtistPayload = {
	artist: {
		name: 'Radiohead',
		mbid: 'a74b1b7f-71a5-4011-9441-d0b5e4122711',
		url: 'https://www.last.fm/music/Radiohead',
		image: [],
		streamable: '0',
		ontour: '0',
		stats: {
			listeners: '1',
			playcount: '1',
			userplaycount: '0'
		},
		similar: { artist: [] },
		tags: { tag: [] },
		bio: {
			published: '2024-01-01',
			summary: 'Test',
			content: 'Test'
		}
	}
};

describe('issue #58: default baseUrl', () => {
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		// Mock fetch so the test does not require a real API key.
		globalThis.fetch = (async (input: RequestInfo | URL) => {
			const url = typeof input === 'string' ? input : input.toString();
			// Sanity: a syntactically valid URL must be passed to fetch.
			// Before the fix this would throw "Failed to parse URL from undefined".
			new URL(url);
			return new Response(JSON.stringify(fakeArtistPayload), {
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			});
		}) as typeof fetch;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	test('LastFmClient constructed without baseUrl + getInfo does not throw "Failed to parse URL from undefined"', async () => {
		const client = new LastFmClient({ apiKey: 'test' });
		const result = await client.artist.getInfo({ artist: 'Radiohead' });
		assert.equal(result.artist.name, 'Radiohead');
	});

	test('buildUrl defaults baseUrl when config.baseUrl is undefined', () => {
		const config: LastFmConfig = { apiKey: 'test' };
		const url = buildUrl(config, 'artist.getInfo', { artist: 'Radiohead' });
		assert.match(url, /^https:\/\/ws\.audioscrobbler\.com\/2\.0\/\?/);
		assert.match(url, /method=artist\.getInfo/);
		assert.match(url, /api_key=test/);
		// Must not produce the literal "undefined?..." string that caused the original bug.
		assert.doesNotMatch(url, /^undefined/);
	});

	test('buildAuthUrl defaults baseUrl when config.baseUrl is undefined', () => {
		const config: LastFmConfig = { apiKey: 'test', sharedSecret: 'secret' };
		const url = buildAuthUrl(config, 'track.scrobble', {
			artist: 'Radiohead',
			track: 'OK Computer',
			timestamp: 1,
			sk: 'session'
		});
		assert.match(url, /^https:\/\/ws\.audioscrobbler\.com\/2\.0\/\?/);
		assert.match(url, /api_sig=[a-f0-9]{32}/);
		assert.doesNotMatch(url, /^undefined/);
	});

	test('buildUrl honours an explicit baseUrl when provided', () => {
		const config: LastFmConfig = {
			apiKey: 'test',
			baseUrl: 'https://example.test/api/'
		};
		const url = buildUrl(config, 'artist.getInfo', { artist: 'X' });
		assert.match(url, /^https:\/\/example\.test\/api\/\?/);
	});
});
