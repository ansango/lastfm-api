import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { createClient, LastFmClient } from '../client.js'
import { createPlaylistsService, type PlaylistsService } from '../entrypoints/playlists.js'
import * as playlistSchemas from '../entrypoints/playlists.schemas.js'
import { fakeTrack, okAttr } from './fixtures/lastfm-responses.js'
import { installFetchMock } from './helpers/fetch-mock.js'

const API_KEY = 'mock-key'

describe('playlists service', () => {
	let mock: ReturnType<typeof installFetchMock>
	let client: LastFmClient

	beforeEach(() => {
		mock = installFetchMock()
		client = new LastFmClient({ apiKey: API_KEY })
	})

	afterEach(() => {
		mock.restore()
	})

	describe('generate', () => {
		test('generates heavy-rotation playlist with M3U and CSV formats', async () => {
			const tracks = [
				{ ...fakeTrack, name: 'Heavy Track 1', artist: { name: 'Artist A' }, playcount: '50' },
				{ ...fakeTrack, name: 'Heavy Track 2', artist: { name: 'Artist B' }, playcount: '40' },
			]

			mock.respondWithJson({ toptracks: { track: tracks, '@attr': okAttr() } })

			const result = await client.playlists.generate({
				user: 'test_user',
				mode: 'heavy-rotation',
				limit: 10,
			})

			expect(result.user).toBe('test_user')
			expect(result.mode).toBe('heavy-rotation')
			expect(result.totalTracks).toBe(2)
			expect(result.tracks[0].name).toBe('Heavy Track 1')
			expect(result.formats.m3u).toContain('#EXTM3U')
			expect(result.formats.m3u).toContain('Artist A - Heavy Track 1')
			expect(result.formats.csv).toContain('Artist A,Heavy Track 1')
			expect(result.formats.spotifyQueries).toEqual([
				'track:Heavy Track 1 artist:Artist A',
				'track:Heavy Track 2 artist:Artist B',
			])

			const parsed = playlistSchemas.playlistsGenerateResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})

		test('generates time-capsule playlist skipping recent tracks', async () => {
			const histTracks = [
				{ ...fakeTrack, name: 'Old Favorite', artist: { name: 'Old Band' } },
				{ ...fakeTrack, name: 'Recent Song', artist: { name: 'Active Band' } },
			]
			const recentTracks = [{ ...fakeTrack, name: 'Recent Song', artist: { name: 'Active Band' } }]

			mock.respondWithJson({ toptracks: { track: histTracks, '@attr': okAttr() } })
			mock.respondWithJson({ recenttracks: { track: recentTracks, '@attr': okAttr() } })

			const result = await client.playlists.generate({
				user: 'test_user',
				mode: 'time-capsule',
			})

			expect(result.totalTracks).toBe(1)
			expect(result.tracks[0].name).toBe('Old Favorite')

			const parsed = playlistSchemas.playlistsGenerateResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('export formats', () => {
		test('exports custom tracks to M3U and CSV formats', async () => {
			const tracks = [
				{ name: 'Song A', artist: 'Band A', duration: 180 },
				{ name: 'Song B', artist: 'Band B', duration: 240 },
			]

			const m3u = await client.playlists.exportM3U({ title: 'My Mix', tracks })
			expect(m3u.filename).toBe('my-mix.m3u')
			expect(m3u.content).toContain('#EXTINF:180,Band A - Song A')

			const csv = await client.playlists.exportCsv({ filename: 'custom.csv', tracks })
			expect(csv.filename).toBe('custom.csv')
			expect(csv.content).toContain('Band A,Song A')
		})
	})

	describe('schema exports and client wiring', () => {
		test('factory createPlaylistsService instantiates PlaylistsService with all wired methods', () => {
			const svc: PlaylistsService = createPlaylistsService({ apiKey: API_KEY })
			expect(typeof svc.generate).toBe('function')
			expect(typeof svc.exportM3U).toBe('function')
			expect(typeof svc.exportCsv).toBe('function')
		})

		test('exposes playlists service via createClient helper', () => {
			const c = createClient({ apiKey: API_KEY })
			expect(typeof c.playlists.generate).toBe('function')
			expect(typeof c.playlists.exportM3U).toBe('function')
			expect(typeof c.playlists.exportCsv).toBe('function')
		})
	})
})
