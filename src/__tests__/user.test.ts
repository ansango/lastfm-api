import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { createUserService, type UserService } from '../entrypoints/user.js'
import * as userSchemas from '../entrypoints/user.schemas.js'
import { createClient } from '../index.js'
import { LastFmApiError } from '../utils.js'
import {
	fakeAlbum,
	fakeArtist,
	fakeTag,
	fakeTrack,
	fakeUser,
	LAST_FM_ERROR_CODES,
	lastFmError,
	okAttr,
} from './fixtures/lastfm-responses.js'
import { type FetchMock, installFetchMock, parseUrl } from './helpers/fetch-mock.js'

const API_KEY = 'test-api-key'
const TEST_USER = 'test_user'

describe('user service', () => {
	let mock: FetchMock
	let client: LastFmClient

	beforeEach(() => {
		mock = installFetchMock()
		client = new LastFmClient({ apiKey: API_KEY })
	})

	afterEach(() => mock.restore())

	describe('getInfo', () => {
		test('routes to user.getInfo with user, returns parsed payload', async () => {
			mock.respondWithJson({ user: fakeUser })

			const result = await client.user.getInfo({ user: TEST_USER })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getInfo')
			expect(params.api_key).toBe(API_KEY)
			expect(params.format).toBe('json')
			expect(params.user).toBe(TEST_USER)
			expect(result.user.name).toBe(TEST_USER)
		})
	})

	describe('getFriends', () => {
		test('routes to user.getFriends with user, returns parsed payload', async () => {
			mock.respondWithJson({
				friends: {
					user: [{ name: 'friend_a' }, { name: 'friend_b' }],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 2) },
				},
			})

			const result = await client.user.getFriends({ user: TEST_USER })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getFriends')
			expect(result.friends.user).toHaveLength(2)
		})

		test('passes limit and page when provided', async () => {
			mock.respondWithJson({ friends: { user: [], '@attr': { user: TEST_USER, ...okAttr() } } })

			await client.user.getFriends({ user: TEST_USER, limit: 10, page: 2 })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.limit).toBe('10')
			expect(params.page).toBe('2')
		})
	})

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
							image: [],
						},
					],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 1) },
				},
			})

			const result = await client.user.getLovedTracks({ user: TEST_USER })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getLovedTracks')
			expect(result.lovedtracks.track[0].name).toBe('Test Track')
		})
	})

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
							image: [],
						},
					],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 1) },
				},
			})

			const result = await client.user.getRecentTracks({ user: TEST_USER })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getRecentTracks')
			expect(result.recenttracks.track[0].name).toBe('Test Track')
		})
	})

	describe('getTopAlbums', () => {
		test('routes to user.getTopAlbums and returns parsed payload', async () => {
			mock.respondWithJson({
				topalbums: {
					album: [{ ...fakeAlbum, '@attr': { rank: '1' } }],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 1) },
				},
			})

			const result = await client.user.getTopAlbums({ user: TEST_USER })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getTopAlbums')
			expect(result.topalbums.album[0].name).toBe(fakeAlbum.name)
		})

		test('passes period when provided', async () => {
			mock.respondWithJson({
				topalbums: { album: [], '@attr': { user: TEST_USER, ...okAttr() } },
			})

			await client.user.getTopAlbums({ user: TEST_USER, period: '7day' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.period).toBe('7day')
		})
	})

	describe('getTopArtists', () => {
		test('routes to user.getTopArtists and returns parsed payload', async () => {
			mock.respondWithJson({
				topartists: {
					artist: [{ ...fakeArtist, '@attr': { rank: '1' } }],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 1) },
				},
			})

			const result = await client.user.getTopArtists({ user: TEST_USER })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getTopArtists')
			expect(result.topartists.artist[0].name).toBe(fakeArtist.name)
		})
	})

	describe('getTopTags', () => {
		test('routes to user.getTopTags and returns parsed payload', async () => {
			mock.respondWithJson({
				toptags: { tag: [fakeTag], '@attr': { user: TEST_USER } },
			})

			const result = await client.user.getTopTags({ user: TEST_USER })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getTopTags')
			expect(result.toptags.tag[0].name).toBe(fakeTag.name)
		})
	})

	describe('getTopTracks', () => {
		test('routes to user.getTopTracks and returns parsed payload', async () => {
			mock.respondWithJson({
				toptracks: {
					track: [{ ...fakeTrack, '@attr': { rank: '1' } }],
					'@attr': { user: TEST_USER, ...okAttr(1, 50, 1) },
				},
			})

			const result = await client.user.getTopTracks({ user: TEST_USER })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getTopTracks')
			expect(result.toptracks.track[0].name).toBe(fakeTrack.name)
		})
	})

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
							'@attr': { rank: '1' },
						},
					],
					'@attr': { from: '1700000000', user: TEST_USER, to: '1700604800' },
				},
			})

			const result = await client.user.getWeeklyAlbumChart({
				user: TEST_USER,
				from: '1700000000',
				to: '1700604800',
			})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getWeeklyAlbumChart')
			expect(params.from).toBe('1700000000')
			expect(params.to).toBe('1700604800')
			expect(result.weeklyalbumchart.album[0].name).toBe('Test Album')
		})
	})

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
							'@attr': { rank: '1' },
						},
					],
					'@attr': { user: TEST_USER, to: '1700604800', from: '1700000000' },
				},
			})

			const result = await client.user.getWeeklyArtistChart({
				user: TEST_USER,
				from: '1700000000',
				to: '1700604800',
			})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getWeeklyArtistChart')
			expect(result.weeklyartistchart.artist[0].name).toBe('Test Artist')
		})
	})

	describe('getWeeklyChartList', () => {
		test('routes to user.getWeeklyChartList and returns parsed payload', async () => {
			mock.respondWithJson({
				weeklychartlist: {
					chart: [{ '#text': 'a week', from: '1700000000', to: '1700604800' }],
				},
			})

			const result = await client.user.getWeeklyChartList({ user: TEST_USER })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getWeeklyChartList')
			expect(result.weeklychartlist.chart[0].from).toBe('1700000000')
		})
	})

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
							'@attr': { rank: '1' },
						},
					],
					'@attr': { user: TEST_USER, to: '1700604800', from: '1700000000' },
				},
			})

			const result = await client.user.getWeeklyTrackChart({
				user: TEST_USER,
				from: '1700000000',
				to: '1700604800',
			})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('user.getWeeklyTrackChart')
			expect(result.weeklytrackchart.track[0].name).toBe('Test Track')
		})
	})

	describe('getPersonalTags', () => {
		test('routes to user.getPersonalTags with user+tag+taggingtype, returns the artist variant', async () => {
			mock.respondWithJson({
				taggings: {
					user: 'test_user',
					tag: 'favorites',
					'@attr': { page: '1', perPage: '50', totalPages: '1', total: '1' },
					artists: {
						artist: [{ name: 'Cher', mbid: 'cher-mbid', url: 'https://www.last.fm/music/Cher' }],
					},
				},
			})

			const result = await client.user.getPersonalTags({
				user: 'test_user',
				tag: 'favorites',
				taggingtype: 'artist',
			})

			const call = mock.lastCall()
			const { params, base } = parseUrl(call.url)
			expect(params.method).toBe('user.getPersonalTags')
			expect(params.api_key).toBe(API_KEY)
			expect(params.format).toBe('json')
			expect(params.user).toBe('test_user')
			expect(params.tag).toBe('favorites')
			expect(params.taggingtype).toBe('artist')
			// Unsigned GET — no signature, no session.
			expect(params.api_sig).toBeUndefined()
			expect(params.sk).toBeUndefined()
			expect(call.method).toBe('GET')
			expect(call.body).toBeUndefined()
			expect(base).toBe('https://ws.audioscrobbler.com/2.0/')

			expect(result.taggings.user).toBe('test_user')
			expect(result.taggings.tag).toBe('favorites')
			expect(result.taggings['@attr'].total).toBe('1')
			if ('artists' in result.taggings) {
				expect(result.taggings.artists.artist[0].name).toBe('Cher')
			} else {
				throw new Error('expected artist variant')
			}
		})

		test('routes for the album variant and parses the album entity', async () => {
			mock.respondWithJson({
				taggings: {
					user: 'test_user',
					tag: 'favorites',
					'@attr': { page: '1', perPage: '50', totalPages: '1', total: '1' },
					albums: {
						album: [
							{
								name: 'Believe',
								mbid: 'album-mbid',
								url: 'https://www.last.fm/music/Cher/Believe',
								artist: {
									name: 'Cher',
									mbid: 'cher-mbid',
									url: 'https://www.last.fm/music/Cher',
								},
							},
						],
					},
				},
			})

			const result = await client.user.getPersonalTags({
				user: 'test_user',
				tag: 'favorites',
				taggingtype: 'album',
			})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.taggingtype).toBe('album')
			if ('albums' in result.taggings) {
				expect(result.taggings.albums.album[0].name).toBe('Believe')
				expect(result.taggings.albums.album[0].artist?.name).toBe('Cher')
			} else {
				throw new Error('expected album variant')
			}
		})

		test('routes for the track variant and parses the track entity', async () => {
			mock.respondWithJson({
				taggings: {
					user: 'test_user',
					tag: 'favorites',
					'@attr': { page: '1', perPage: '50', totalPages: '1', total: '1' },
					tracks: {
						track: [
							{
								name: 'Believe',
								mbid: 'track-mbid',
								url: 'https://www.last.fm/music/Cher/Believe',
								artist: {
									name: 'Cher',
									mbid: 'cher-mbid',
									url: 'https://www.last.fm/music/Cher',
								},
							},
						],
					},
				},
			})

			const result = await client.user.getPersonalTags({
				user: 'test_user',
				tag: 'favorites',
				taggingtype: 'track',
			})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.taggingtype).toBe('track')
			if ('tracks' in result.taggings) {
				expect(result.taggings.tracks.track[0].name).toBe('Believe')
			} else {
				throw new Error('expected track variant')
			}
		})

		test('passes limit and page when provided', async () => {
			mock.respondWithJson({
				taggings: {
					user: 'u',
					tag: 't',
					'@attr': { page: '2', perPage: '5', totalPages: '1', total: '0' },
					artists: { artist: [] },
				},
			})

			await client.user.getPersonalTags({
				user: 'u',
				tag: 't',
				taggingtype: 'artist',
				limit: 5,
				page: 2,
			})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.limit).toBe('5')
			expect(params.page).toBe('2')
		})

		test('parses empty results (no personal tags)', async () => {
			mock.respondWithJson({
				taggings: {
					user: 'u',
					tag: 'unused',
					'@attr': { page: '1', perPage: '50', totalPages: '0', total: '0' },
					artists: { artist: [] },
				},
			})

			const result = await client.user.getPersonalTags({
				user: 'u',
				tag: 'unused',
				taggingtype: 'artist',
			})
			if ('artists' in result.taggings) {
				expect(result.taggings.artists.artist).toEqual([])
			} else {
				throw new Error('expected artist variant')
			}
		})

		test('rejects an invalid taggingtype at the request schema', () => {
			const result = userSchemas.userGetPersonalTagsRequestSchema.safeParse({
				user: 'u',
				tag: 't',
				taggingtype: 'playlist',
			})
			expect(result.success).toBe(false)
		})
	})

	describe('error handling', () => {
		test('Last.fm error envelope becomes LastFmApiError', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.INVALID_RESOURCE, 'No such user'))

			await expect(client.user.getInfo({ user: 'ghost' })).rejects.toBeInstanceOf(LastFmApiError)
		})
	})

	describe('import coverage', () => {
		test('user service is exposed from root, user entrypoint, and user.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY })
			expect(typeof c.user.getInfo).toBe('function')
			expect(typeof c.user.getFriends).toBe('function')
			expect(typeof c.user.getLovedTracks).toBe('function')
			expect(typeof c.user.getRecentTracks).toBe('function')
			expect(typeof c.user.getTopAlbums).toBe('function')
			expect(typeof c.user.getTopArtists).toBe('function')
			expect(typeof c.user.getTopTags).toBe('function')
			expect(typeof c.user.getTopTracks).toBe('function')
			expect(typeof c.user.getWeeklyAlbumChart).toBe('function')
			expect(typeof c.user.getWeeklyArtistChart).toBe('function')
			expect(typeof c.user.getWeeklyChartList).toBe('function')
			expect(typeof c.user.getWeeklyTrackChart).toBe('function')
			expect(typeof c.user.getPersonalTags).toBe('function')

			const svc: UserService = createUserService({ apiKey: API_KEY })
			expect(typeof svc.getInfo).toBe('function')
			expect(typeof svc.getWeeklyTrackChart).toBe('function')
			expect(typeof svc.getPersonalTags).toBe('function')

			expect(userSchemas.userGetInfoRequestSchema).toBeDefined()
			expect(userSchemas.userGetWeeklyTrackChartRequestSchema).toBeDefined()
			expect(userSchemas.userGetPersonalTagsRequestSchema).toBeDefined()
			expect(userSchemas.userGetPersonalTagsResponseSchema).toBeDefined()
			expect(userSchemas.userGetPersonalTagsArtistResponseSchema).toBeDefined()
			expect(userSchemas.userGetPersonalTagsAlbumResponseSchema).toBeDefined()
			expect(userSchemas.userGetPersonalTagsTrackResponseSchema).toBeDefined()
		})

		test('generic narrowing: literal taggingtype resolves to the matching response', () => {
			const c = createClient({ apiKey: API_KEY })
			type ArtistRes = Awaited<ReturnType<typeof c.user.getPersonalTags<'artist'>>>
			type AlbumRes = Awaited<ReturnType<typeof c.user.getPersonalTags<'album'>>>
			type TrackRes = Awaited<ReturnType<typeof c.user.getPersonalTags<'track'>>>

			// Each variant carries the expected collection key.
			const _artistHasArtists: ArtistRes['taggings'] extends { artists: unknown } ? true : false = true
			const _albumHasAlbums: AlbumRes['taggings'] extends { albums: unknown } ? true : false = true
			const _trackHasTracks: TrackRes['taggings'] extends { tracks: unknown } ? true : false = true
			expect(_artistHasArtists).toBe(true)
			expect(_albumHasAlbums).toBe(true)
			expect(_trackHasTracks).toBe(true)

			// A wider type resolves to the union (no narrowing).
			type Dynamic = Awaited<ReturnType<typeof c.user.getPersonalTags<string>>>
			const _dynamicIsUnion: Dynamic extends
				| { taggings: { artists: unknown } }
				| { taggings: { albums: unknown } }
				| { taggings: { tracks: unknown } }
				? true
				: false = true
			expect(_dynamicIsUnion).toBe(true)
		})
	})
})
