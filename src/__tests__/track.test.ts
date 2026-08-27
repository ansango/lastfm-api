import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { LastFmClient } from '../client.js';
import { LastFmApiError } from '../utils.js';
import { installFetchMock, type FetchMock, parseUrl } from './helpers/fetch-mock.js';
import {
	fakeTag,
	fakeTrack,
	lastFmError,
	LAST_FM_ERROR_CODES
} from './fixtures/lastfm-responses.js';
import { createClient } from '../index.js';
import { createTrackService, type TrackService } from '../entrypoints/track.js';
import * as trackSchemas from '../entrypoints/track.schemas.js';

const API_KEY = 'test-api-key';
const SHARED_SECRET = 'test-shared-secret';

describe('track service', () => {
	let mock: FetchMock;
	let client: LastFmClient;

	beforeEach(() => {
		mock = installFetchMock();
		client = new LastFmClient({ apiKey: API_KEY, sharedSecret: SHARED_SECRET });
	});

	afterEach(() => mock.restore());

	describe('getInfo', () => {
		test('routes to track.getInfo with artist and track, returns parsed payload', async () => {
			mock.respondWithJson({ track: fakeTrack });

			const result = await client.track.getInfo({ artist: 'Test Artist', track: 'Test Track' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('track.getInfo');
			expect(params.api_key).toBe(API_KEY);
			expect(params.format).toBe('json');
			expect(params.artist).toBe('Test Artist');
			expect(params.track).toBe('Test Track');
			expect(result.track.name).toBe(fakeTrack.name);
		});

		test('passes optional mbid when provided', async () => {
			mock.respondWithJson({ track: fakeTrack });

			await client.track.getInfo({
				artist: 'Test Artist',
				track: 'Test Track',
				mbid: '00000000-0000-0000-0000-000000000010'
			});

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.mbid).toBe('00000000-0000-0000-0000-000000000010');
		});
	});

	describe('getSimilar', () => {
		test('routes to track.getSimilar and returns parsed payload', async () => {
			mock.respondWithJson({
				similartracks: {
					track: [fakeTrack],
					'@attr': { artist: 'Test Artist', track: 'Test Track' }
				}
			});

			const result = await client.track.getSimilar({ artist: 'Test Artist', track: 'Test Track' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('track.getSimilar');
			expect(result.similartracks.track[0].name).toBe(fakeTrack.name);
		});
	});

	describe('getTags', () => {
		test('routes to track.getTags with user, artist, and track, returns parsed payload', async () => {
			mock.respondWithJson({
				tags: { tag: [fakeTag], '@attr': { artist: 'Test Artist', track: 'Test Track' } }
			});

			const result = await client.track.getTags({
				artist: 'Test Artist',
				track: 'Test Track',
				user: 'test_user'
			});

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('track.getTags');
			expect(params.user).toBe('test_user');
			expect(result.tags.tag[0].name).toBe(fakeTag.name);
		});
	});

	describe('getTopTags', () => {
		test('routes to track.getTopTags and returns parsed payload', async () => {
			mock.respondWithJson({
				toptags: { tag: [fakeTag], '@attr': { artist: 'Test Artist', track: 'Test Track' } }
			});

			const result = await client.track.getTopTags({
				artist: 'Test Artist',
				track: 'Test Track'
			});

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('track.getTopTags');
			expect(result.toptags.tag[0].name).toBe(fakeTag.name);
		});
	});

	describe('search', () => {
		test('routes to track.search with track query and returns parsed payload', async () => {
			mock.respondWithJson({
				results: {
					'opensearch:Query': {
						'#text': 'Test',
						role: 'request',
						searchTerms: 'Test',
						startPage: '1'
					},
					'opensearch:totalResults': '1',
					'opensearch:startIndex': '0',
					'opensearch:itemsPerPage': '50',
					trackmatches: { track: [fakeTrack] },
					'@attr': { for: 'Test' }
				}
			});

			const result = await client.track.search({ track: 'Test' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('track.search');
			expect(params.track).toBe('Test');
			expect(result.results.trackmatches.track[0].name).toBe(fakeTrack.name);
		});
	});

	describe('scrobble (smoke through the service; transport behavior is in transport.test.ts)', () => {
		test('scrobble succeeds end-to-end when session is on the config', async () => {
			const scrobbleClient = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY-VALUE'
			});
			mock.respondWithJson({
				scrobbles: {
					scrobble: {
						artist: { corrected: '0', '#text': 'Test Artist' },
						album: { corrected: '0' },
						track: { corrected: '0', '#text': 'Test Track' },
						ignoredMessage: { code: '0', '#text': '' },
						albumArtist: { corrected: '0', '#text': 'Test Artist' },
						timestamp: '1700000000'
					},
					'@attr': { accepted: 1, ignored: 0 }
				}
			});

			const result = await scrobbleClient.track.scrobble({
				artist: 'Test Artist',
				track: 'Test Track',
				timestamp: 1700000000
			});

			expect(result.scrobbles['@attr'].accepted).toBe(1);
			// Transport behavior (URL safety, body, signature) is covered in
			// transport.test.ts. Here we only verify the service wires through.
		});

		test('scrobbleMany accepts a numeric timestamp per the updated schema', async () => {
			const c = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY-VALUE'
			});
			mock.respondWithJson({
				scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } }
			});

			await c.track.scrobbleMany({
				tracks: [{ artist: 'A', track: 'T', timestamp: 1700000000 }]
			});

			expect(mock.lastCall().method).toBe('POST');
		});

		test('scrobbleMany rejects more than 50 tracks with a clear error', async () => {
			const c = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY-VALUE'
			});
			const tooMany = Array.from({ length: 51 }, (_, i) => ({
				artist: `A${i}`,
				track: `T${i}`,
				timestamp: 1700000000 + i
			}));

			let caught: unknown;
			try {
				await c.track.scrobbleMany({ tracks: tooMany });
			} catch (err) {
				caught = err;
			}
			expect(caught).toBeInstanceOf(Error);
			expect((caught as Error).message).toMatch(/50/);
			// No fetch was made.
			expect(mock.calls).toHaveLength(0);
		});
	});

	describe('error handling', () => {
		test('Last.fm error envelope becomes LastFmApiError', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.INVALID_RESOURCE, 'No such track'));

			await expect(
				client.track.getInfo({ artist: 'Test Artist', track: 'Nonexistent' })
			).rejects.toBeInstanceOf(LastFmApiError);
		});
	});

	describe('import coverage', () => {
		test('track service is exposed from root, track entrypoint, and track.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY });
			expect(typeof c.track.getInfo).toBe('function');
			expect(typeof c.track.getSimilar).toBe('function');
			expect(typeof c.track.getTags).toBe('function');
			expect(typeof c.track.getTopTags).toBe('function');
			expect(typeof c.track.search).toBe('function');
			expect(typeof c.track.scrobble).toBe('function');
			expect(typeof c.track.scrobbleMany).toBe('function');

			const svc: TrackService = createTrackService({ apiKey: API_KEY, sharedSecret: SHARED_SECRET });
			expect(typeof svc.getInfo).toBe('function');
			expect(typeof svc.scrobble).toBe('function');
			expect(typeof svc.scrobbleMany).toBe('function');
			// Deprecated aliases point to the same implementation
			expect(svc.postTrackScrobble).toBe(svc.scrobble);
			expect(svc.postBatchTrackScrobble).toBe(svc.scrobbleMany);

			expect(trackSchemas.trackGetInfoRequestSchema).toBeDefined();
			expect(trackSchemas.trackScrobbleRequestSchema).toBeDefined();
		});
	});
});
