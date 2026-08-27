import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { LastFmClient } from '../client.js';
import { LastFmApiError } from '../utils.js';
import { installFetchMock, type FetchMock, parseUrl } from './helpers/fetch-mock.js';
import {
	fakeArtist,
	lastFmError,
	LAST_FM_ERROR_CODES,
	okAttr
} from './fixtures/lastfm-responses.js';
import { createClient } from '../index.js';
import { createLibraryService, type LibraryService } from '../entrypoints/library.js';
import * as librarySchemas from '../entrypoints/library.schemas.js';

const API_KEY = 'test-api-key';

describe('library service', () => {
	let mock: FetchMock;
	let client: LastFmClient;

	beforeEach(() => {
		mock = installFetchMock();
		client = new LastFmClient({ apiKey: API_KEY });
	});

	afterEach(() => mock.restore());

	describe('getArtists', () => {
		test('routes to library.getArtists with user and returns parsed payload', async () => {
			mock.respondWithJson({
				artists: {
					artist: [{ ...fakeArtist, tagCount: '5', playcount: '10' }],
					'@attr': { user: 'test_user', ...okAttr(1, 50, 1) }
				}
			});

			const result = await client.library.getArtists({ user: 'test_user' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('library.getArtists');
			expect(params.api_key).toBe(API_KEY);
			expect(params.format).toBe('json');
			expect(params.user).toBe('test_user');
			expect(result.artists.artist[0].name).toBe(fakeArtist.name);
		});

		test('passes limit and page when provided', async () => {
			mock.respondWithJson({
				artists: {
					artist: [],
					'@attr': { user: 'test_user', ...okAttr(2, 10, 0) }
				}
			});

			await client.library.getArtists({ user: 'test_user', limit: 10, page: 2 });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.limit).toBe('10');
			expect(params.page).toBe('2');
		});
	});

	describe('error handling', () => {
		test('Last.fm error envelope becomes LastFmApiError', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.INVALID_PARAMS, 'Missing user'));

			await expect(client.library.getArtists({ user: 'x' })).rejects.toBeInstanceOf(LastFmApiError);
		});
	});

	describe('import coverage', () => {
		test('library service is exposed from root, library entrypoint, and library.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY });
			expect(typeof c.library.getArtists).toBe('function');

			const svc: LibraryService = createLibraryService({ apiKey: API_KEY });
			expect(typeof svc.getArtists).toBe('function');

			expect(librarySchemas.libraryGetArtistsRequestSchema).toBeDefined();
		});
	});
});
