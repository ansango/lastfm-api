import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { createTagService, type TagService } from '../entrypoints/tag.js'
import * as tagSchemas from '../entrypoints/tag.schemas.js'
import { createClient } from '../index.js'
import { LastFmApiError } from '../utils.js'
import {
	fakeAlbum,
	fakeArtist,
	fakeTag,
	fakeTrack,
	LAST_FM_ERROR_CODES,
	lastFmError,
	okAttr,
} from './fixtures/lastfm-responses.js'
import { type FetchMock, installFetchMock, parseUrl } from './helpers/fetch-mock.js'

const API_KEY = 'test-api-key'

describe('tag service', () => {
	let mock: FetchMock
	let client: LastFmClient

	beforeEach(() => {
		mock = installFetchMock()
		client = new LastFmClient({ apiKey: API_KEY })
	})

	afterEach(() => mock.restore())

	describe('getInfo', () => {
		test('routes to tag.getInfo with tag and returns parsed payload', async () => {
			mock.respondWithJson({
				tag: {
					name: 'rock',
					taggings: '1000000',
					reach: '50000000',
					wiki: { summary: 'Test', content: 'Test' },
				},
			})

			const result = await client.tag.getInfo({ tag: 'rock' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('tag.getInfo')
			expect(params.api_key).toBe(API_KEY)
			expect(params.format).toBe('json')
			expect(params.tag).toBe('rock')
			expect(result.tag.name).toBe('rock')
		})

		test('passes lang when provided', async () => {
			mock.respondWithJson({
				tag: { name: 'rock', taggings: '0', reach: '0' },
			})

			await client.tag.getInfo({ tag: 'rock', lang: 'es' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.lang).toBe('es')
		})
	})

	describe('getSimilar', () => {
		test('routes to tag.getSimilar and returns parsed payload', async () => {
			mock.respondWithJson({
				similar: {
					tag: [{ name: 'alternative', url: 'https://example.com' }],
					'@attr': { tag: 'rock' },
				},
			})

			const result = await client.tag.getSimilar({ tag: 'rock' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('tag.getSimilar')
			expect(result.similar.tag[0].name).toBe('alternative')
		})
	})

	describe('getTopAlbums', () => {
		test('routes to tag.getTopAlbums and returns parsed payload', async () => {
			mock.respondWithJson({
				albums: { album: [fakeAlbum], '@attr': { tag: 'rock', ...okAttr(1, 50, 1) } },
			})

			const result = await client.tag.getTopAlbums({ tag: 'rock' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('tag.getTopAlbums')
			expect(result.albums.album[0].name).toBe(fakeAlbum.name)
		})
	})

	describe('getTopArtists', () => {
		test('routes to tag.getTopArtists and returns parsed payload', async () => {
			mock.respondWithJson({
				topartists: { artist: [fakeArtist], '@attr': { tag: 'rock', ...okAttr(1, 50, 1) } },
			})

			const result = await client.tag.getTopArtists({ tag: 'rock' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('tag.getTopArtists')
			expect(result.topartists.artist[0].name).toBe(fakeArtist.name)
		})
	})

	describe('getTopTags', () => {
		test('routes to tag.getTopTags and returns parsed payload', async () => {
			mock.respondWithJson({
				toptags: { tag: [fakeTag], '@attr': okAttr(1, 50, 1) },
			})

			const result = await client.tag.getTopTags({})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('tag.getTopTags')
			expect(result.toptags.tag[0].name).toBe(fakeTag.name)
		})
	})

	describe('getTopTracks', () => {
		test('routes to tag.getTopTracks and returns parsed payload', async () => {
			mock.respondWithJson({
				toptracks: { track: [fakeTrack], '@attr': { tag: 'rock', ...okAttr(1, 50, 1) } },
			})

			const result = await client.tag.getTopTracks({ tag: 'rock' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('tag.getTopTracks')
			expect(result.toptracks.track[0].name).toBe(fakeTrack.name)
		})
	})

	describe('getWeeklyChartList', () => {
		test('routes to tag.getWeeklyChartList and returns parsed payload', async () => {
			mock.respondWithJson({
				weeklychartlist: {
					chart: [{ from: '1700000000', to: '1700604800' }],
					'@attr': { tag: 'rock' },
				},
			})

			const result = await client.tag.getWeeklyChartList({ tag: 'rock' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('tag.getWeeklyChartList')
			expect(result.weeklychartlist.chart[0].from).toBe('1700000000')
		})
	})

	describe('error handling', () => {
		test('Last.fm error envelope becomes LastFmApiError', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.INVALID_RESOURCE, 'No such tag'))

			await expect(client.tag.getInfo({ tag: 'x' })).rejects.toBeInstanceOf(LastFmApiError)
		})
	})

	describe('import coverage', () => {
		test('tag service is exposed from root, tag entrypoint, and tag.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY })
			expect(typeof c.tag.getInfo).toBe('function')
			expect(typeof c.tag.getSimilar).toBe('function')
			expect(typeof c.tag.getTopAlbums).toBe('function')
			expect(typeof c.tag.getTopArtists).toBe('function')
			expect(typeof c.tag.getTopTags).toBe('function')
			expect(typeof c.tag.getTopTracks).toBe('function')
			expect(typeof c.tag.getWeeklyChartList).toBe('function')

			const svc: TagService = createTagService({ apiKey: API_KEY })
			expect(typeof svc.getInfo).toBe('function')
			expect(typeof svc.getWeeklyChartList).toBe('function')

			expect(tagSchemas.tagGetInfoRequestSchema).toBeDefined()
			expect(tagSchemas.tagGetWeeklyChartListRequestSchema).toBeDefined()
		})
	})
})
