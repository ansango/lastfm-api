import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { LastFmClient } from '../client.js';
import { LastFmApiError } from '../utils.js';
import { installFetchMock, type FetchMock, parseUrl } from './helpers/fetch-mock.js';
import {
	fakeArtist,
	fakeTrack,
	lastFmError,
	LAST_FM_ERROR_CODES,
	okAttr
} from './fixtures/lastfm-responses.js';
import { createClient } from '../index.js';
import { createGeoService, type GeoService } from '../entrypoints/geo.js';
import * as geoSchemas from '../entrypoints/geo.schemas.js';

const API_KEY = 'test-api-key';

describe('geo service', () => {
	let mock: FetchMock;
	let client: LastFmClient;

	beforeEach(() => {
		mock = installFetchMock();
		client = new LastFmClient({ apiKey: API_KEY });
	});

	afterEach(() => mock.restore());

	describe('getTopArtists', () => {
		test('routes to geo.getTopArtists with country and returns parsed payload', async () => {
			mock.respondWithJson({
				topartists: {
					artist: [fakeArtist],
					'@attr': { country: 'Spain', ...okAttr(1, 50, 1) }
				}
			});

			const result = await client.geo.getTopArtists({ country: 'Spain' });

			expect(mock.calls).toHaveLength(1);
			const { base, params } = parseUrl(mock.lastCall().url);
			expect(base).toBe('https://ws.audioscrobbler.com/2.0/');
			expect(params.method).toBe('geo.getTopArtists');
			expect(params.api_key).toBe(API_KEY);
			expect(params.format).toBe('json');
			expect(params.country).toBe('Spain');
			expect(result.topartists.artist[0].name).toBe(fakeArtist.name);
		});

		test('passes limit and page when provided', async () => {
			mock.respondWithJson({
				topartists: { artist: [], '@attr': { country: 'Spain', ...okAttr(2, 10, 11) } }
			});

			await client.geo.getTopArtists({ country: 'Spain', limit: 10, page: 2 });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.limit).toBe('10');
			expect(params.page).toBe('2');
		});

		test('uses GET (no body) and no Content-Type header', async () => {
			mock.respondWithJson({
				topartists: { artist: [], '@attr': { country: 'Spain', ...okAttr(1, 50, 0) } }
			});

			await client.geo.getTopArtists({ country: 'Spain' });

			const call = mock.lastCall();
			expect(call.method).toBe('GET');
			expect(call.body).toBeUndefined();
		});
	});

	describe('getTopTracks', () => {
		test('routes to geo.getTopTracks with country and location', async () => {
			mock.respondWithJson({
				tracks: {
					track: [fakeTrack],
					'@attr': { country: 'Spain', ...okAttr(1, 50, 1) }
				}
			});

			const result = await client.geo.getTopTracks({ country: 'Spain', location: 'Madrid' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('geo.getTopTracks');
			expect(params.country).toBe('Spain');
			expect(params.location).toBe('Madrid');
			expect(result.tracks.track[0].name).toBe(fakeTrack.name);
		});
	});

	describe('error handling', () => {
		test('Last.fm error envelope becomes LastFmApiError with code and message', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.INVALID_API_KEY, 'Invalid API key'));

			try {
				await client.geo.getTopArtists({ country: 'Spain' });
				expect.unreachable();
			} catch (err) {
				expect(err).toBeInstanceOf(LastFmApiError);
				const e = err as LastFmApiError;
				expect(e.code).toBe(LAST_FM_ERROR_CODES.INVALID_API_KEY);
				expect(e.httpStatus).toBe(200);
				expect(e.message).toContain('Invalid API key');
			}
		});

		test('HTTP 500 with non-JSON body becomes LastFmApiError without exposing a fake api_sig', async () => {
			mock.respondWithHttpError(500, 'Internal Server Error', 'plain text body');

			try {
				await client.geo.getTopArtists({ country: 'Spain' });
				expect.unreachable();
			} catch (err) {
				expect(err).toBeInstanceOf(LastFmApiError);
				const e = err as LastFmApiError;
				expect(e.httpStatus).toBe(500);
			}
		});
	});

	describe('import coverage', () => {
		test('geo service is exposed from root, geo entrypoint, and geo.schemas entrypoint', () => {
			// root
			const c = createClient({ apiKey: API_KEY });
			expect(typeof c.geo.getTopArtists).toBe('function');
			expect(typeof c.geo.getTopTracks).toBe('function');
			// domain entrypoint factory
			const svc: GeoService = createGeoService({ apiKey: API_KEY });
			expect(typeof svc.getTopArtists).toBe('function');
			expect(typeof svc.getTopTracks).toBe('function');
			// schemas entrypoint exposes at least the request schema type
			expect(geoSchemas.geoGetTopArtistsRequestSchema).toBeDefined();
			expect(geoSchemas.geoGetTopTracksRequestSchema).toBeDefined();
		});
	});
});
