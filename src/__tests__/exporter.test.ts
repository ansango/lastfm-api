import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { createClient, LastFmClient } from '@/client.js'
import { createExporterService, type ExporterService } from '@/entrypoints/exporter.js'
import * as exporterSchemas from '@/entrypoints/exporter.schemas.js'
import { fakeArtist, fakeTrack, okAttr } from './fixtures/lastfm-responses.js'
import { installFetchMock } from './helpers/fetch-mock.js'

const API_KEY = 'mock-key'

describe('exporter service', () => {
	let mock: ReturnType<typeof installFetchMock>
	let client: LastFmClient

	beforeEach(() => {
		mock = installFetchMock()
		client = new LastFmClient({ apiKey: API_KEY })
	})

	afterEach(() => {
		mock.restore()
	})

	describe('exportScrobbles', () => {
		test('exports scrobbles to JSON, CSV, JSONL, and ListenBrainz with checkpoint metadata', async () => {
			const tracks = [
				{
					...fakeTrack,
					name: 'Track A',
					artist: { name: 'Artist A' },
					album: { '#text': 'Album A' },
					date: { uts: '1700000500', '#text': '20 Nov 2023, 10:00' },
				},
				{
					...fakeTrack,
					name: 'Track B',
					artist: { name: 'Artist B' },
					album: { '#text': 'Album B' },
					date: { uts: '1700000100', '#text': '20 Nov 2023, 09:50' },
				},
			]

			mock.respondWithJson({ recenttracks: { track: tracks, '@attr': okAttr(1, 200, 2) } })

			const result = await client.exporter.exportScrobbles({
				user: 'test_user',
				format: 'listenbrainz',
			})

			expect(result.user).toBe('test_user')
			expect(result.format).toBe('listenbrainz')
			expect(result.totalExported).toBe(2)
			expect(result.newestUts).toBe(1700000500)
			expect(result.oldestUts).toBe(1700000100)
			expect(result.nextCheckpointUts).toBe(1700000099)
			expect(result.content).toContain('listen_type')
			expect(result.content).toContain('Artist A')

			const parsed = exporterSchemas.exporterScrobblesResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})

		test('exports to CSV format properly escaping columns', async () => {
			const tracks = [
				{
					...fakeTrack,
					name: 'Track, with comma',
					artist: { name: 'Artist "Quotes"' },
					date: { uts: '1700000000' },
				},
			]

			mock.respondWithJson({ recenttracks: { track: tracks, '@attr': okAttr(1, 200, 1) } })

			const result = await client.exporter.exportScrobbles({
				user: 'test_user',
				format: 'csv',
			})

			expect(result.content).toContain('Artist,Track,Album,UTS,Timestamp,MBID')
			expect(result.content).toContain('"Artist ""Quotes"""')
			expect(result.content).toContain('"Track, with comma"')
		})
	})

	describe('exportLovedTracks', () => {
		test('exports loved tracks to CSV and JSON', async () => {
			const tracks = [
				{ ...fakeTrack, name: 'Loved Song', artist: { name: 'Loved Artist' }, date: { uts: '1700000000' } },
			]

			mock.respondWithJson({ lovedtracks: { track: tracks, '@attr': okAttr(1, 200, 1) } })

			const result = await client.exporter.exportLovedTracks({ user: 'test_user', format: 'csv' })
			expect(result.totalExported).toBe(1)
			expect(result.content).toContain('Loved Artist,Loved Song')

			const parsed = exporterSchemas.exporterLovedTracksResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('exportLibrary', () => {
		test('exports user artist library to CSV and JSON', async () => {
			const artists = [{ ...fakeArtist, name: 'Library Artist', playcount: '500', tagcount: '10' }]

			mock.respondWithJson({ artists: { artist: artists, '@attr': okAttr(1, 200, 1) } })

			const result = await client.exporter.exportLibrary({ user: 'test_user', format: 'json' })
			expect(result.totalExported).toBe(1)
			expect(result.artists[0].name).toBe('Library Artist')
			expect(result.artists[0].playcount).toBe(500)

			const parsed = exporterSchemas.exporterLibraryResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('schema exports and client wiring', () => {
		test('factory createExporterService instantiates ExporterService with all wired methods', () => {
			const svc: ExporterService = createExporterService({ apiKey: API_KEY })
			expect(typeof svc.exportScrobbles).toBe('function')
			expect(typeof svc.exportLovedTracks).toBe('function')
			expect(typeof svc.exportLibrary).toBe('function')
		})

		test('exposes exporter service via createClient helper', () => {
			const c = createClient({ apiKey: API_KEY })
			expect(typeof c.exporter.exportScrobbles).toBe('function')
			expect(typeof c.exporter.exportLovedTracks).toBe('function')
			expect(typeof c.exporter.exportLibrary).toBe('function')
		})
	})
})
