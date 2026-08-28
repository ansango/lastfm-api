import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { type ChartService, createChartService } from '../entrypoints/chart.js'
import * as chartSchemas from '../entrypoints/chart.schemas.js'
import { createClient } from '../index.js'
import { LastFmApiError } from '../utils.js'
import {
	fakeArtist,
	fakeTag,
	fakeTrack,
	LAST_FM_ERROR_CODES,
	lastFmError,
	okAttr,
} from './fixtures/lastfm-responses.js'
import { type FetchMock, installFetchMock, parseUrl } from './helpers/fetch-mock.js'

const API_KEY = 'test-api-key'

describe('chart service', () => {
	let mock: FetchMock
	let client: LastFmClient

	beforeEach(() => {
		mock = installFetchMock()
		client = new LastFmClient({ apiKey: API_KEY })
	})

	afterEach(() => mock.restore())

	describe('getTopArtists', () => {
		test('routes to chart.getTopArtists and returns parsed payload', async () => {
			mock.respondWithJson({
				artists: { artist: [fakeArtist], '@attr': okAttr(1, 50, 1) },
			})

			const result = await client.chart.getTopArtists({})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('chart.getTopArtists')
			expect(params.api_key).toBe(API_KEY)
			expect(params.format).toBe('json')
			expect(result.artists.artist[0].name).toBe(fakeArtist.name)
		})

		test('passes limit and page when provided', async () => {
			mock.respondWithJson({
				artists: { artist: [], '@attr': okAttr(2, 10, 0) },
			})

			await client.chart.getTopArtists({ limit: 10, page: 2 })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.limit).toBe('10')
			expect(params.page).toBe('2')
		})
	})

	describe('getTopTags', () => {
		test('routes to chart.getTopTags and returns parsed payload', async () => {
			mock.respondWithJson({
				tags: { tag: [fakeTag], '@attr': okAttr(1, 50, 1) },
			})

			const result = await client.chart.getTopTags({})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('chart.getTopTags')
			expect(result.tags.tag[0].name).toBe(fakeTag.name)
		})
	})

	describe('getTopTracks', () => {
		test('routes to chart.getTopTracks and returns parsed payload', async () => {
			mock.respondWithJson({
				tracks: { track: [fakeTrack], '@attr': okAttr(1, 50, 1) },
			})

			const result = await client.chart.getTopTracks({})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('chart.getTopTracks')
			expect(result.tracks.track[0].name).toBe(fakeTrack.name)
		})
	})

	describe('error handling', () => {
		test('Last.fm error envelope becomes LastFmApiError', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.SERVICE_OFFLINE, 'Service offline'))

			await expect(client.chart.getTopArtists({})).rejects.toBeInstanceOf(LastFmApiError)
		})
	})

	describe('import coverage', () => {
		test('chart service is exposed from root, chart entrypoint, and chart.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY })
			expect(typeof c.chart.getTopArtists).toBe('function')
			expect(typeof c.chart.getTopTags).toBe('function')
			expect(typeof c.chart.getTopTracks).toBe('function')

			const svc: ChartService = createChartService({ apiKey: API_KEY })
			expect(typeof svc.getTopArtists).toBe('function')
			expect(typeof svc.getTopTags).toBe('function')
			expect(typeof svc.getTopTracks).toBe('function')

			expect(chartSchemas.chartGetTopArtistsRequestSchema).toBeDefined()
			expect(chartSchemas.chartGetTopTagsRequestSchema).toBeDefined()
			expect(chartSchemas.chartGetTopTracksRequestSchema).toBeDefined()
		})
	})
})
