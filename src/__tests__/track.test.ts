import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { LastFmClient } from '../client.js';
import { LastFmApiError } from '../utils.js';
import { installFetchMock, type FetchMock, parseFormBody, parseUrl } from './helpers/fetch-mock.js';
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

	describe('getCorrection', () => {
		test('routes to track.getCorrection unsigned with artist+track, returns the corrected identities', async () => {
			mock.respondWithJson({
				corrections: {
					correction: [
						{
							track: {
								name: 'Believe',
								mbid: '11111111-1111-1111-1111-111111111111',
								url: 'https://www.last.fm/music/Cher/Believe'
							},
							artist: {
								name: 'Cher',
								mbid: 'bfcc6d75-a6a5-4bc6-8afc-4ac2b8271c25',
								url: 'https://www.last.fm/music/Cher'
							},
							artistcorrected: '1',
							trackcorrected: '1',
							'@attr': { index: '0' }
						}
					],
					'@attr': { artist: 'cher', track: 'belive' }
				}
			});

			const result = await client.track.getCorrection({ artist: 'cher', track: 'belive' });

			const call = mock.lastCall();
			const { params, base } = parseUrl(call.url);
			expect(params.method).toBe('track.getCorrection');
			expect(params.api_key).toBe(API_KEY);
			expect(params.format).toBe('json');
			expect(params.artist).toBe('cher');
			expect(params.track).toBe('belive');
			// Unsigned GET — no signature, no session.
			expect(params.api_sig).toBeUndefined();
			expect(params.sk).toBeUndefined();
			expect(call.method).toBe('GET');
			expect(call.body).toBeUndefined();
			expect(base).toBe('https://ws.audioscrobbler.com/2.0/');

			expect(result.corrections.correction).toHaveLength(1);
			const c = result.corrections.correction[0];
			expect(c.track.name).toBe('Believe');
			expect(c.artist.name).toBe('Cher');
			expect(c.artistcorrected).toBe('1');
			expect(c.trackcorrected).toBe('1');
			expect(c['@attr']?.index).toBe('0');
		});

		test('parses a no-correction response (empty correction list)', async () => {
			mock.respondWithJson({
				corrections: {
					correction: [],
					'@attr': { artist: 'X', track: 'Y' }
				}
			});

			const result = await client.track.getCorrection({ artist: 'X', track: 'Y' });
			expect(result.corrections.correction).toEqual([]);
		});

		test('accepts absent optional corrected flags and @attr', async () => {
			mock.respondWithJson({
				corrections: {
					correction: [
						{
							track: { name: 'T', mbid: 'm', url: 'u' },
							artist: { name: 'A', mbid: 'm', url: 'u' }
							// no artistcorrected/trackcorrected/@attr
						}
					]
				}
			});

			const result = await client.track.getCorrection({ artist: 'A', track: 'T' });
			expect(result.corrections.correction[0].track.name).toBe('T');
			expect(result.corrections.correction[0].artistcorrected).toBeUndefined();
			expect(result.corrections.correction[0]['@attr']).toBeUndefined();
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

	describe('addTags', () => {
		test('routes to track.addTags via signed POST with sk and comma-joined tags, returns void', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY'
			});
			mock.respondWithJson({});

			const result = await authed.track.addTags({
				artist: 'Test Artist',
				track: 'Test Track',
				tags: ['rock', '90s', 'favorites']
			});

			const call = mock.lastCall();
			expect(call.method).toBe('POST');
			expect(call.url).toBe('https://ws.audioscrobbler.com/2.0/');
			expect(call.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
			const body = parseFormBody(call.body);
			expect(body.method).toBe('track.addTags');
			expect(body.api_key).toBe(API_KEY);
			expect(body.artist).toBe('Test Artist');
			expect(body.track).toBe('Test Track');
			expect(body.tags).toBe('rock,90s,favorites');
			expect(body.sk).toBe('SESSION-KEY');
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/);
			expect(body.format).toBe('json');
			expect(result).toBeUndefined();
		});

		test('fails before fetch when no session key is available', async () => {
			const noSession = new LastFmClient({ apiKey: API_KEY, sharedSecret: SHARED_SECRET });

			let caught: unknown;
			try {
				await noSession.track.addTags({
					artist: 'A',
					track: 'T',
					tags: ['t1']
				});
			} catch (err) {
				caught = err;
			}
			expect(caught).toBeInstanceOf(LastFmApiError);
			expect((caught as LastFmApiError).httpStatus).toBe(0);
			expect(mock.calls).toHaveLength(0);
		});

		test('rejects more than 10 tags in the request schema', () => {
			const result = trackSchemas.trackAddTagsRequestSchema.safeParse({
				artist: 'A',
				track: 'T',
				tags: Array.from({ length: 11 }, (_, i) => `t${i}`)
			});
			expect(result.success).toBe(false);
		});
	});

	describe('removeTag', () => {
		test('routes to track.removeTag via signed POST with sk and single tag, returns void', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY'
			});
			mock.respondWithJson({});

			const result = await authed.track.removeTag({
				artist: 'Test Artist',
				track: 'Test Track',
				tag: 'favorites'
			});

			const call = mock.lastCall();
			expect(call.method).toBe('POST');
			const body = parseFormBody(call.body);
			expect(body.method).toBe('track.removeTag');
			expect(body.artist).toBe('Test Artist');
			expect(body.track).toBe('Test Track');
			expect(body.tag).toBe('favorites');
			expect(body.sk).toBe('SESSION-KEY');
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/);
			expect(result).toBeUndefined();
		});

		test('fails before fetch when no session key is available', async () => {
			const noSession = new LastFmClient({ apiKey: API_KEY, sharedSecret: SHARED_SECRET });

			let caught: unknown;
			try {
				await noSession.track.removeTag({ artist: 'A', track: 'T', tag: 't' });
			} catch (err) {
				caught = err;
			}
			expect(caught).toBeInstanceOf(LastFmApiError);
			expect(mock.calls).toHaveLength(0);
		});
	});

	describe('love', () => {
		test('routes to track.love via signed POST with sk, returns void', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY'
			});
			mock.respondWithJson({});

			const result = await authed.track.love({ artist: 'Test Artist', track: 'Believe' });

			const call = mock.lastCall();
			expect(call.method).toBe('POST');
			const body = parseFormBody(call.body);
			expect(body.method).toBe('track.love');
			expect(body.artist).toBe('Test Artist');
			expect(body.track).toBe('Believe');
			expect(body.sk).toBe('SESSION-KEY');
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/);
			// No tag payload expected.
			expect(body.tag).toBeUndefined();
			expect(body.tags).toBeUndefined();
			expect(result).toBeUndefined();
		});

		test('fails before fetch when no session key is available', async () => {
			const noSession = new LastFmClient({ apiKey: API_KEY, sharedSecret: SHARED_SECRET });

			let caught: unknown;
			try {
				await noSession.track.love({ artist: 'A', track: 'T' });
			} catch (err) {
				caught = err;
			}
			expect(caught).toBeInstanceOf(LastFmApiError);
			expect(mock.calls).toHaveLength(0);
		});
	});

	describe('unlove', () => {
		test('routes to track.unlove via signed POST with sk, returns void', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY'
			});
			mock.respondWithJson({});

			const result = await authed.track.unlove({ artist: 'Test Artist', track: 'Believe' });

			const call = mock.lastCall();
			expect(call.method).toBe('POST');
			const body = parseFormBody(call.body);
			expect(body.method).toBe('track.unlove');
			expect(body.artist).toBe('Test Artist');
			expect(body.track).toBe('Believe');
			expect(body.sk).toBe('SESSION-KEY');
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/);
			expect(result).toBeUndefined();
		});
	});

	describe('updateNowPlaying (regression — restored after #89 merge drop)', () => {
		test('routes to track.updateNowPlaying with the minimum required body, returns the parsed nowplaying payload', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY'
			});
			mock.respondWithJson({
				nowplaying: {
					track: { corrected: '0', '#text': 'Believe' },
					artist: { corrected: '0', '#text': 'Cher' },
					album: { corrected: '0' },
					albumArtist: { corrected: '0', '#text': 'Cher' },
					ignoredMessage: { code: '0', '#text': '' }
				}
			});

			const result = await authed.track.updateNowPlaying({
				artist: 'Cher',
				track: 'Believe'
			});

			const call = mock.lastCall();
			expect(call.method).toBe('POST');
			expect(call.url).toBe('https://ws.audioscrobbler.com/2.0/');
			expect(call.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
			const body = parseFormBody(call.body);
			expect(body.method).toBe('track.updateNowPlaying');
			expect(body.api_key).toBe(API_KEY);
			expect(body.artist).toBe('Cher');
			expect(body.track).toBe('Believe');
			expect(body.sk).toBe('SESSION-KEY');
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/);
			expect(body.format).toBe('json');
			expect(body.album).toBeUndefined();
			expect(body.trackNumber).toBeUndefined();
			expect(body.context).toBeUndefined();
			expect(body.mbid).toBeUndefined();
			expect(body.duration).toBeUndefined();
			expect(body.albumArtist).toBeUndefined();
			expect(body.timestamp).toBeUndefined();

			expect(result.nowplaying.artist?.['#text']).toBe('Cher');
			expect(result.nowplaying.track?.['#text']).toBe('Believe');
			expect(result.nowplaying.ignoredMessage.code).toBe('0');
		});

		test('forwards every optional field with exact wire casing and omits undefined', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY'
			});
			mock.respondWithJson({
				nowplaying: { ignoredMessage: { code: '0', '#text': '' } }
			});

			await authed.track.updateNowPlaying({
				artist: 'A',
				track: 'T',
				album: 'Al',
				trackNumber: 3,
				context: 'playlist:1',
				mbid: 'mbid-1',
				duration: 240,
				albumArtist: 'AA'
			});

			const body = parseFormBody(mock.lastCall().body);
			expect(body.album).toBe('Al');
			expect(body.trackNumber).toBe('3');
			expect(body.context).toBe('playlist:1');
			expect(body.mbid).toBe('mbid-1');
			expect(body.duration).toBe('240');
			expect(body.albumArtist).toBe('AA');
		});

		test('fails before fetch when no session key is available, with a sanitized error', async () => {
			const noSession = new LastFmClient({ apiKey: API_KEY, sharedSecret: SHARED_SECRET });

			let caught: unknown;
			try {
				await noSession.track.updateNowPlaying({ artist: 'A', track: 'T' });
			} catch (err) {
				caught = err;
			}
			expect(caught).toBeInstanceOf(LastFmApiError);
			const e = caught as LastFmApiError;
			expect(e.httpStatus).toBe(0);
			expect(e.message).toContain('session key');
			expect(mock.calls).toHaveLength(0);
		});

		test('parses an ignored now-playing response (code != 0) but does not throw', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY'
			});
			mock.respondWithJson({
				nowplaying: { ignoredMessage: { code: '2', '#text': 'Invalid artist' } }
			});

			const result = await authed.track.updateNowPlaying({ artist: 'A', track: 'T' });
			expect(result.nowplaying.ignoredMessage.code).toBe('2');
			expect(result.nowplaying.ignoredMessage['#text']).toBe('Invalid artist');
		});

		test('Last.fm error envelope becomes LastFmApiError', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: 'SESSION-KEY'
			});
			mock.respondWithJson(
				lastFmError(LAST_FM_ERROR_CODES.AUTHENTICATION_FAILED, 'Auth failed')
			);

			await expect(
				authed.track.updateNowPlaying({ artist: 'A', track: 'T' })
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
			expect(typeof c.track.getCorrection).toBe('function');
			expect(typeof c.track.addTags).toBe('function');
			expect(typeof c.track.removeTag).toBe('function');
			expect(typeof c.track.love).toBe('function');
			expect(typeof c.track.unlove).toBe('function');
			expect(typeof c.track.updateNowPlaying).toBe('function');

			const svc: TrackService = createTrackService({ apiKey: API_KEY, sharedSecret: SHARED_SECRET });
			expect(typeof svc.getInfo).toBe('function');
			expect(typeof svc.scrobble).toBe('function');
			expect(typeof svc.scrobbleMany).toBe('function');
			// Deprecated aliases point to the same implementation
			expect(svc.postTrackScrobble).toBe(svc.scrobble);
			expect(svc.postBatchTrackScrobble).toBe(svc.scrobbleMany);
			expect(typeof svc.addTags).toBe('function');
			expect(typeof svc.removeTag).toBe('function');
			expect(typeof svc.love).toBe('function');
			expect(typeof svc.unlove).toBe('function');
			expect(typeof svc.updateNowPlaying).toBe('function');

			expect(trackSchemas.trackGetInfoRequestSchema).toBeDefined();
			expect(trackSchemas.trackScrobbleRequestSchema).toBeDefined();
			expect(trackSchemas.trackGetCorrectionRequestSchema).toBeDefined();
			expect(trackSchemas.trackGetCorrectionResponseSchema).toBeDefined();
			expect(trackSchemas.trackCorrectionSchema).toBeDefined();
			expect(trackSchemas.trackAddTagsRequestSchema).toBeDefined();
			expect(trackSchemas.trackRemoveTagRequestSchema).toBeDefined();
			expect(trackSchemas.trackLoveRequestSchema).toBeDefined();
			expect(trackSchemas.trackUpdateNowPlayingRequestSchema).toBeDefined();
			expect(trackSchemas.trackUpdateNowPlayingResponseSchema).toBeDefined();
			expect(trackSchemas.correctedTextFieldSchema).toBeDefined();
			expect(trackSchemas.nowPlayingIgnoredMessageSchema).toBeDefined();
		});
	});
});
