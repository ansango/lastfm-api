import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { LastFmClient } from '../client.js';
import { LastFmApiError } from '../utils.js';
import { installFetchMock, type FetchMock, parseUrl } from './helpers/fetch-mock.js';
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

	describe('error handling', () => {
		test('Last.fm error envelope becomes LastFmApiError', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.INVALID_RESOURCE, 'No such artist'));

			await expect(client.artist.getInfo({ artist: 'X' })).rejects.toBeInstanceOf(LastFmApiError);
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

			const svc: ArtistService = createArtistService({ apiKey: API_KEY });
			expect(typeof svc.getInfo).toBe('function');
			expect(typeof svc.search).toBe('function');

			expect(artistSchemas.artistGetInfoRequestSchema).toBeDefined();
			expect(artistSchemas.artistSearchRequestSchema).toBeDefined();
		});
	});
});
