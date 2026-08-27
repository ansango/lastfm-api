import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { LastFmClient } from '../client.js';
import { LastFmApiError } from '../utils.js';
import { installFetchMock, type FetchMock, parseFormBody, parseUrl } from './helpers/fetch-mock.js';
import {
	fakeAlbum,
	fakeArtist,
	fakeTag,
	fakeTrack,
	lastFmError,
	LAST_FM_ERROR_CODES,
	okAttr
} from './fixtures/lastfm-responses.js';
import { createClient } from '../index.js';
import { createArtistService, type ArtistService } from '../entrypoints/artist.js';
import * as artistSchemas from '../entrypoints/artist.schemas.js';

const API_KEY = 'test-api-key';

describe('artist service', () => {
	let mock: FetchMock;
	let client: LastFmClient;

	beforeEach(() => {
		mock = installFetchMock();
		client = new LastFmClient({ apiKey: API_KEY });
	});

	afterEach(() => mock.restore());

	describe('getInfo', () => {
		test('routes to artist.getInfo with artist, returns parsed payload', async () => {
			mock.respondWithJson({ artist: fakeArtist });

			const result = await client.artist.getInfo({ artist: 'Test Artist' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('artist.getInfo');
			expect(params.api_key).toBe(API_KEY);
			expect(params.format).toBe('json');
			expect(params.artist).toBe('Test Artist');
			expect(result.artist.name).toBe('Test Artist');
		});

		test('passes optional mbid, lang, and user when provided', async () => {
			mock.respondWithJson({ artist: fakeArtist });

			await client.artist.getInfo({
				artist: 'Test Artist',
				mbid: '00000000-0000-0000-0000-000000000001',
				lang: 'es',
				user: 'test_user'
			});

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.mbid).toBe('00000000-0000-0000-0000-000000000001');
			expect(params.lang).toBe('es');
			expect(params.user).toBe('test_user');
		});
	});

	describe('getTags', () => {
		test('routes to artist.getTags with artist, returns parsed payload', async () => {
			mock.respondWithJson({
				tags: { tag: [fakeTag], '@attr': { artist: 'Test Artist' } }
			});

			const result = await client.artist.getTags({ artist: 'Test Artist' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('artist.getTags');
			expect(result.tags.tag[0].name).toBe(fakeTag.name);
		});

		test('passes limit when provided', async () => {
			mock.respondWithJson({
				tags: { tag: [], '@attr': { artist: 'Test Artist' } }
			});

			await client.artist.getTags({ artist: 'Test Artist', limit: 5 });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.limit).toBe('5');
		});
	});

	describe('getSimilar', () => {
		test('routes to artist.getSimilar and returns parsed payload', async () => {
			mock.respondWithJson({
				similarartists: {
					artist: [{ ...fakeArtist, match: '0.9' }],
					'@attr': { artist: 'Test Artist' }
				}
			});

			const result = await client.artist.getSimilar({ artist: 'Test Artist' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('artist.getSimilar');
			expect(result.similarartists.artist[0].name).toBe('Test Artist');
		});

		test('passes limit when provided', async () => {
			mock.respondWithJson({
				similarartists: { artist: [], '@attr': { artist: 'Test Artist' } }
			});

			await client.artist.getSimilar({ artist: 'Test Artist', limit: 5 });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.limit).toBe('5');
		});
	});

	describe('getTopAlbums', () => {
		test('routes to artist.getTopAlbums and returns parsed payload', async () => {
			mock.respondWithJson({
				topalbums: { album: [fakeAlbum], '@attr': { artist: 'Test Artist', ...okAttr(1, 50, 1) } }
			});

			const result = await client.artist.getTopAlbums({ artist: 'Test Artist' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('artist.getTopAlbums');
			expect(result.topalbums.album[0].name).toBe(fakeAlbum.name);
		});
	});

	describe('getTopTags', () => {
		test('routes to artist.getTopTags and returns parsed payload', async () => {
			mock.respondWithJson({
				toptags: { tag: [fakeTag], '@attr': { artist: 'Test Artist' } }
			});

			const result = await client.artist.getTopTags({ artist: 'Test Artist' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('artist.getTopTags');
			expect(result.toptags.tag[0].name).toBe(fakeTag.name);
		});
	});

	describe('getTopTracks', () => {
		test('routes to artist.getTopTracks and returns parsed payload', async () => {
			mock.respondWithJson({
				toptracks: {
					track: [{ ...fakeTrack, '@attr': { rank: '1' } }],
					'@attr': { artist: 'Test Artist', ...okAttr(1, 50, 1) }
				}
			});

			const result = await client.artist.getTopTracks({ artist: 'Test Artist' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('artist.getTopTracks');
			expect(result.toptracks.track[0].name).toBe(fakeTrack.name);
		});
	});

	describe('search', () => {
		test('routes to artist.search with artist query and returns parsed payload', async () => {
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
					artistmatches: { artist: [fakeArtist] },
					'@attr': { for: 'Test' }
				}
			});

			const result = await client.artist.search({ artist: 'Test' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('artist.search');
			expect(params.artist).toBe('Test');
			expect(result.results.artistmatches.artist[0].name).toBe(fakeArtist.name);
		});
	});

	describe('getCorrection', () => {
		test('routes to artist.getCorrection unsigned with artist, returns the corrected identity', async () => {
			mock.respondWithJson({
				corrections: {
					correction: [
						{
							artist: {
								name: 'Cher',
								mbid: 'bfcc6d75-a6a5-4bc6-8afc-4ac2b8271c25',
								url: 'https://www.last.fm/music/Cher'
							},
							'@attr': { index: '0' }
						}
					],
					'@attr': { artist: 'Cher' }
				}
			});

			const result = await client.artist.getCorrection({ artist: 'cher' });

			const call = mock.lastCall();
			const { params, base } = parseUrl(call.url);
			expect(params.method).toBe('artist.getCorrection');
			expect(params.api_key).toBe(API_KEY);
			expect(params.format).toBe('json');
			expect(params.artist).toBe('cher');
			// Unsigned GET — no signature, no session.
			expect(params.api_sig).toBeUndefined();
			expect(params.sk).toBeUndefined();
			expect(call.method).toBe('GET');
			expect(call.body).toBeUndefined();
			expect(base).toBe('https://ws.audioscrobbler.com/2.0/');
			// The corrected identity is parsed.
			expect(result.corrections.correction).toHaveLength(1);
			expect(result.corrections.correction[0].artist.name).toBe('Cher');
			expect(result.corrections.correction[0].artist.mbid).toBe(
				'bfcc6d75-a6a5-4bc6-8afc-4ac2b8271c25'
			);
			expect(result.corrections['@attr']?.artist).toBe('Cher');
		});

		test('parses a no-correction response (empty correction list)', async () => {
			mock.respondWithJson({
				corrections: {
					correction: [],
					'@attr': { artist: 'Xyzzy' }
				}
			});

			const result = await client.artist.getCorrection({ artist: 'Xyzzy' });
			expect(result.corrections.correction).toEqual([]);
		});

		test('parses a response without optional @attr on the correction entry', async () => {
			mock.respondWithJson({
				corrections: {
					correction: [
						{
							artist: { name: 'Cher', mbid: 'm', url: 'u' }
							// no @attr.index
						}
					]
				}
			});

			const result = await client.artist.getCorrection({ artist: 'cher' });
			expect(result.corrections.correction[0].artist.name).toBe('Cher');
			expect(result.corrections.correction[0]['@attr']).toBeUndefined();
		});
	});

	describe('error handling', () => {
		test('Last.fm error envelope becomes LastFmApiError', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.INVALID_RESOURCE, 'No such artist'));

			await expect(client.artist.getInfo({ artist: 'X' })).rejects.toBeInstanceOf(LastFmApiError);
		});
	});

	describe('addTags', () => {
		test('routes to artist.addTags via signed POST with sk and comma-joined tags, returns void', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: 'test-shared-secret',
				sessionKey: 'SESSION-KEY'
			});
			mock.respondWithJson({});

			const result = await authed.artist.addTags({
				artist: 'Test Artist',
				tags: ['rock', '90s', 'favorites']
			});

			const call = mock.lastCall();
			expect(call.method).toBe('POST');
			expect(call.url).toBe('https://ws.audioscrobbler.com/2.0/');
			expect(call.headers['Content-Type']).toBe('application/x-www-form-urlencoded');
			const body = parseFormBody(call.body);
			expect(body.method).toBe('artist.addTags');
			expect(body.api_key).toBe(API_KEY);
			expect(body.artist).toBe('Test Artist');
			expect(body.tags).toBe('rock,90s,favorites');
			expect(body.sk).toBe('SESSION-KEY');
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/);
			expect(body.format).toBe('json');
			expect(result).toBeUndefined();
		});

		test('per-request sk overrides config.sessionKey', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: 'test-shared-secret',
				sessionKey: 'CONFIG-SK'
			});
			mock.respondWithJson({});

			await authed.artist.addTags({
				artist: 'A',
				tags: ['t1'],
				sk: 'REQUEST-SK'
			});

			const body = parseFormBody(mock.lastCall().body);
			expect(body.sk).toBe('REQUEST-SK');
		});

		test('fails before fetch when no session key is available, with a clear sanitized error', async () => {
			const noSession = new LastFmClient({ apiKey: API_KEY, sharedSecret: 'test-shared-secret' });

			let caught: unknown;
			try {
				await noSession.artist.addTags({ artist: 'A', tags: ['t1'] });
			} catch (err) {
				caught = err;
			}
			expect(caught).toBeInstanceOf(LastFmApiError);
			const e = caught as LastFmApiError;
			expect(e.httpStatus).toBe(0);
			expect(e.message).toContain('session key');
			expect(mock.calls).toHaveLength(0);
		});

		test('rejects more than 10 tags in the request schema', () => {
			const result = artistSchemas.artistAddTagsRequestSchema.safeParse({
				artist: 'A',
				tags: Array.from({ length: 11 }, (_, i) => `t${i}`)
			});
			expect(result.success).toBe(false);
		});
	});

	describe('removeTag', () => {
		test('routes to artist.removeTag via signed POST with sk and single tag, returns void', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: 'test-shared-secret',
				sessionKey: 'SESSION-KEY'
			});
			mock.respondWithJson({});

			const result = await authed.artist.removeTag({
				artist: 'Test Artist',
				tag: 'favorites'
			});

			const call = mock.lastCall();
			expect(call.method).toBe('POST');
			const body = parseFormBody(call.body);
			expect(body.method).toBe('artist.removeTag');
			expect(body.artist).toBe('Test Artist');
			expect(body.tag).toBe('favorites');
			expect(body.sk).toBe('SESSION-KEY');
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/);
			expect(result).toBeUndefined();
		});

		test('fails before fetch when no session key is available', async () => {
			const noSession = new LastFmClient({ apiKey: API_KEY, sharedSecret: 'test-shared-secret' });

			let caught: unknown;
			try {
				await noSession.artist.removeTag({ artist: 'A', tag: 't' });
			} catch (err) {
				caught = err;
			}
			expect(caught).toBeInstanceOf(LastFmApiError);
			expect(mock.calls).toHaveLength(0);
		});
	});

	describe('import coverage', () => {
		test('artist service is exposed from root, artist entrypoint, and artist.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY });
			expect(typeof c.artist.getInfo).toBe('function');
			expect(typeof c.artist.getTags).toBe('function');
			expect(typeof c.artist.getSimilar).toBe('function');
			expect(typeof c.artist.getTopTags).toBe('function');
			expect(typeof c.artist.getTopAlbums).toBe('function');
			expect(typeof c.artist.getTopTracks).toBe('function');
			expect(typeof c.artist.search).toBe('function');
			expect(typeof c.artist.getCorrection).toBe('function');
			expect(typeof c.artist.addTags).toBe('function');
			expect(typeof c.artist.removeTag).toBe('function');

			const svc: ArtistService = createArtistService({ apiKey: API_KEY });
			expect(typeof svc.getInfo).toBe('function');
			expect(typeof svc.search).toBe('function');
			expect(typeof svc.getCorrection).toBe('function');
			expect(typeof svc.addTags).toBe('function');
			expect(typeof svc.removeTag).toBe('function');

			expect(artistSchemas.artistGetInfoRequestSchema).toBeDefined();
			expect(artistSchemas.artistSearchRequestSchema).toBeDefined();
			expect(artistSchemas.artistGetCorrectionRequestSchema).toBeDefined();
			expect(artistSchemas.artistGetCorrectionResponseSchema).toBeDefined();
			expect(artistSchemas.artistCorrectionSchema).toBeDefined();
			expect(artistSchemas.artistAddTagsRequestSchema).toBeDefined();
			expect(artistSchemas.artistRemoveTagRequestSchema).toBeDefined();
		});
	});
});
