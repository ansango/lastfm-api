import { describe, test, beforeEach, afterEach, expect } from 'bun:test';
import { LastFmClient } from '../client.js';
import { buildUrl, buildAuthUrl } from '../utils.js';
import type { LastFmConfig } from '../config.js';
import { installFetchMock, type FetchMock } from './helpers/fetch-mock.js';
import { fakeArtist } from './fixtures/lastfm-responses.js';

/**
 * Regression tests for issue #58:
 * `new LastFmClient({ apiKey })` must not throw "Failed to parse URL from
 * undefined" because `buildUrl` / `buildAuthUrl` default `baseUrl`.
 */

describe('issue #58: default baseUrl', () => {
	let mock: FetchMock;

	beforeEach(() => {
		mock = installFetchMock();
	});

	afterEach(() => {
		mock.restore();
	});

	test('LastFmClient constructed without baseUrl + getInfo does not throw "Failed to parse URL from undefined"', async () => {
		mock.respondWithJson({ artist: fakeArtist });
		const client = new LastFmClient({ apiKey: 'test' });
		const result = await client.artist.getInfo({ artist: 'Radiohead' });
		expect(result.artist.name).toBe('Test Artist');
		// Sanity: a syntactically valid URL must be passed to fetch.
		// Before the fix this would throw "Failed to parse URL from undefined".
		expect(() => new URL(mock.lastCall().url)).not.toThrow();
	});

	test('buildUrl defaults baseUrl when config.baseUrl is undefined', () => {
		const config: LastFmConfig = { apiKey: 'test' };
		const url = buildUrl(config, 'artist.getInfo', { artist: 'Radiohead' });
		expect(url).toMatch(/^https:\/\/ws\.audioscrobbler\.com\/2\.0\/\?/);
		expect(url).toContain('method=artist.getInfo');
		expect(url).toContain('api_key=test');
		// Must not produce the literal "undefined?..." string that caused the original bug.
		expect(url.startsWith('undefined')).toBe(false);
	});

	test('buildAuthUrl defaults baseUrl when config.baseUrl is undefined', () => {
		const config: LastFmConfig = { apiKey: 'test', sharedSecret: 'secret' };
		const url = buildAuthUrl(config, 'track.scrobble', {
			artist: 'Radiohead',
			track: 'OK Computer',
			timestamp: 1,
			sk: 'session'
		});
		expect(url).toMatch(/^https:\/\/ws\.audioscrobbler\.com\/2\.0\/\?/);
		expect(url).toMatch(/api_sig=[a-f0-9]{32}/);
		expect(url.startsWith('undefined')).toBe(false);
	});

	test('buildUrl honours an explicit baseUrl when provided', () => {
		const config: LastFmConfig = {
			apiKey: 'test',
			baseUrl: 'https://example.test/api/'
		};
		const url = buildUrl(config, 'artist.getInfo', { artist: 'X' });
		expect(url).toMatch(/^https:\/\/example\.test\/api\/\?/);
	});
});
