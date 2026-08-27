import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { LastFmClient } from '../client.js';
import { LastFmApiError } from '../utils.js';
import { installFetchMock, type FetchMock, parseUrl } from './helpers/fetch-mock.js';
import {
	fakeAlbum,
	fakeArtist,
	fakeTag,
	fakeTrack,
	fakeUser,
	lastFmError,
	LAST_FM_ERROR_CODES,
	okAttr
} from './fixtures/lastfm-responses.js';
import { createClient } from '../index.js';
import { createUserService, type UserService } from '../entrypoints/user.js';
import * as userSchemas from '../entrypoints/user.schemas.js';

const API_KEY = 'test-api-key';
const TEST_USER = 'test_user';

describe('user service', () => {
	let mock: FetchMock;
	let client: LastFmClient;

	beforeEach(() => {
		mock = installFetchMock();
		client = new LastFmClient({ apiKey: API_KEY });
	});

	afterEach(() => mock.restore());

	describe('getInfo', () => {
		test('routes to user.getInfo with user, returns parsed payload', async () => {
			mock.respondWithJson({ user: fakeUser });

			const result = await client.user.getInfo({ user: TEST_USER });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getInfo');
			expect(params.api_key).toBe(API_KEY);
			expect(params.format).toBe('json');
			expect(params.user).toBe(TEST_USER);
			expect(result.user.name).toBe(TEST_USER);
		});
	});

	describe('getFriends', () => {
		test('routes to user.getFriends with user, returns parsed payload', async () => {
			mock.respondWithJson({
				friends: {
					user: [{ name: 'friend_a' }, { name: 'friend_b' }],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 2) }
				}
			});

			const result = await client.user.getFriends({ user: TEST_USER });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getFriends');
			expect(result.friends.user).toHaveLength(2);
		});

		test('passes limit and page when provided', async () => {
			mock.respondWithJson({ friends: { user: [], '@attr': { user: TEST_USER, ...okAttr() } } });

			await client.user.getFriends({ user: TEST_USER, limit: 10, page: 2 });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.limit).toBe('10');
			expect(params.page).toBe('2');
		});
	});

	describe('getLovedTracks', () => {
		test('routes to user.getLovedTracks with user, returns parsed payload', async () => {
			mock.respondWithJson({
				lovedtracks: {
					track: [
						{
							artist: { name: 'Test Artist', mbid: '', url: '' },
							date: { uts: '1700000000', '#text': '2024-01-01' },
							name: 'Test Track',
							mbid: '',
							url: 'https://example.com',
							image: []
						}
					],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 1) }
				}
			});

			const result = await client.user.getLovedTracks({ user: TEST_USER });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getLovedTracks');
			expect(result.lovedtracks.track[0].name).toBe('Test Track');
		});
	});

	describe('getRecentTracks', () => {
		test('routes to user.getRecentTracks with user, returns parsed payload', async () => {
			mock.respondWithJson({
				recenttracks: {
					track: [
						{
							artist: { mbid: '', '#text': 'Test Artist' },
							album: { mbid: '', '#text': 'Test Album' },
							date: { uts: '1700000000', '#text': '2024-01-01' },
							name: 'Test Track',
							mbid: '',
							url: 'https://example.com',
							image: []
						}
					],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 1) }
				}
			});

			const result = await client.user.getRecentTracks({ user: TEST_USER });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getRecentTracks');
			expect(result.recenttracks.track[0].name).toBe('Test Track');
		});
	});

	describe('getTopAlbums', () => {
		test('routes to user.getTopAlbums and returns parsed payload', async () => {
			mock.respondWithJson({
				topalbums: {
					album: [{ ...fakeAlbum, '@attr': { rank: '1' } }],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 1) }
				}
			});

			const result = await client.user.getTopAlbums({ user: TEST_USER });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getTopAlbums');
			expect(result.topalbums.album[0].name).toBe(fakeAlbum.name);
		});

		test('passes period when provided', async () => {
			mock.respondWithJson({
				topalbums: { album: [], '@attr': { user: TEST_USER, ...okAttr() } }
			});

			await client.user.getTopAlbums({ user: TEST_USER, period: '7day' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.period).toBe('7day');
		});
	});

	describe('getTopArtists', () => {
		test('routes to user.getTopArtists and returns parsed payload', async () => {
			mock.respondWithJson({
				topartists: {
					artist: [{ ...fakeArtist, '@attr': { rank: '1' } }],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 1) }
				}
			});

			const result = await client.user.getTopArtists({ user: TEST_USER });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getTopArtists');
			expect(result.topartists.artist[0].name).toBe(fakeArtist.name);
		});
	});

	describe('getTopTags', () => {
		test('routes to user.getTopTags and returns parsed payload', async () => {
			mock.respondWithJson({
				toptags: { tag: [fakeTag], '@attr': { user: TEST_USER } }
			});

			const result = await client.user.getTopTags({ user: TEST_USER });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getTopTags');
			expect(result.toptags.tag[0].name).toBe(fakeTag.name);
		});
	});

	describe('getTopTracks', () => {
		test('routes to user.getTopTracks and returns parsed payload', async () => {
			mock.respondWithJson({
				toptracks: {
					track: [{ ...fakeTrack, '@attr': { rank: '1' } }],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 1) }
				}
			});

			const result = await client.user.getTopTracks({ user: TEST_USER });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getTopTracks');
			expect(result.toptracks.track[0].name).toBe(fakeTrack.name);
		});
	});

	describe('getWeeklyAlbumChart', () => {
		test('routes to user.getWeeklyAlbumChart and returns parsed payload', async () => {
			mock.respondWithJson({
				weeklyalbumchart: {
					album: [
						{
							artist: { mbid: '', '#text': 'Test Artist' },
							mbid: '',
							url: 'https://example.com',
							name: 'Test Album',
							playcount: '5',
							'@attr': { rank: '1' }
						}
					],
					'@attr': { from: '1700000000', user: TEST_USER, to: '1700604800' }
				}
			});

			const result = await client.user.getWeeklyAlbumChart({
				user: TEST_USER,
				from: '1700000000',
				to: '1700604800'
			});

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getWeeklyAlbumChart');
			expect(params.from).toBe('1700000000');
			expect(params.to).toBe('1700604800');
			expect(result.weeklyalbumchart.album[0].name).toBe('Test Album');
		});
	});

	describe('getWeeklyArtistChart', () => {
		test('routes to user.getWeeklyArtistChart and returns parsed payload', async () => {
			mock.respondWithJson({
				weeklyartistchart: {
					artist: [
						{
							mbid: '',
							url: 'https://example.com',
							name: 'Test Artist',
							playcount: '10',
							'@attr': { rank: '1' }
						}
					],
					'@attr': { user: TEST_USER, to: '1700604800', from: '1700000000' }
				}
			});

			const result = await client.user.getWeeklyArtistChart({
				user: TEST_USER,
				from: '1700000000',
				to: '1700604800'
			});

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getWeeklyArtistChart');
			expect(result.weeklyartistchart.artist[0].name).toBe('Test Artist');
		});
	});

	describe('getWeeklyChartList', () => {
		test('routes to user.getWeeklyChartList and returns parsed payload', async () => {
			mock.respondWithJson({
				weeklychartlist: {
					chart: [{ '#text': 'a week', from: '1700000000', to: '1700604800' }]
				}
			});

			const result = await client.user.getWeeklyChartList({ user: TEST_USER });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getWeeklyChartList');
			expect(result.weeklychartlist.chart[0].from).toBe('1700000000');
		});
	});

	describe('getWeeklyTrackChart', () => {
		test('routes to user.getWeeklyTrackChart and returns parsed payload', async () => {
			mock.respondWithJson({
				weeklytrackchart: {
					track: [
						{
							artist: { mbid: '', '#text': 'Test Artist' },
							image: [],
							mbid: '',
							url: 'https://example.com',
							name: 'Test Track',
							playcount: '5',
							'@attr': { rank: '1' }
						}
					],
					'@attr': { user: TEST_USER, to: '1700604800', from: '1700000000' }
				}
			});

			const result = await client.user.getWeeklyTrackChart({
				user: TEST_USER,
				from: '1700000000',
				to: '1700604800'
			});

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('user.getWeeklyTrackChart');
			expect(result.weeklytrackchart.track[0].name).toBe('Test Track');
		});
	});

	describe('error handling', () => {
		test('Last.fm error envelope becomes LastFmApiError', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.INVALID_RESOURCE, 'No such user'));

			await expect(client.user.getInfo({ user: 'ghost' })).rejects.toBeInstanceOf(LastFmApiError);
		});
	});

	describe('import coverage', () => {
		test('user service is exposed from root, user entrypoint, and user.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY });
			expect(typeof c.user.getInfo).toBe('function');
			expect(typeof c.user.getFriends).toBe('function');
			expect(typeof c.user.getLovedTracks).toBe('function');
			expect(typeof c.user.getRecentTracks).toBe('function');
			expect(typeof c.user.getTopAlbums).toBe('function');
			expect(typeof c.user.getTopArtists).toBe('function');
			expect(typeof c.user.getTopTags).toBe('function');
			expect(typeof c.user.getTopTracks).toBe('function');
			expect(typeof c.user.getWeeklyAlbumChart).toBe('function');
			expect(typeof c.user.getWeeklyArtistChart).toBe('function');
			expect(typeof c.user.getWeeklyChartList).toBe('function');
			expect(typeof c.user.getWeeklyTrackChart).toBe('function');

			const svc: UserService = createUserService({ apiKey: API_KEY });
			expect(typeof svc.getInfo).toBe('function');
			expect(typeof svc.getWeeklyTrackChart).toBe('function');

			expect(userSchemas.userGetInfoRequestSchema).toBeDefined();
			expect(userSchemas.userGetWeeklyTrackChartRequestSchema).toBeDefined();
		});
	});
});
