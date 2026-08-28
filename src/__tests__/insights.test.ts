import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { createInsightsService, type InsightsService } from '../entrypoints/insights.js'
import * as insightSchemas from '../entrypoints/insights.schemas.js'
import { createClient } from '../index.js'
import { computeDiversity, topNShare } from '../services/insights/lib/diversity.js'
import { resolvePeriod } from '../services/insights/lib/periods.js'
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

describe('insights service', () => {
	let mock: FetchMock
	let client: LastFmClient

	beforeEach(() => {
		mock = installFetchMock()
		client = new LastFmClient({ apiKey: API_KEY })
	})

	afterEach(() => mock.restore())

	describe('pure algorithms: diversity', () => {
		test('returns zeros for empty count map', () => {
			const res = computeDiversity({})
			expect(res.total).toBe(0)
			expect(res.uniqueCount).toBe(0)
			expect(res.shannon).toBe(0)
			expect(res.normalized).toBe(0)
		})

		test('returns 0 entropy and 0 normalized for single item', () => {
			const res = computeDiversity({ Radiohead: 100 })
			expect(res.total).toBe(100)
			expect(res.uniqueCount).toBe(1)
			expect(res.shannon).toBe(0)
			expect(res.normalized).toBe(0)
		})

		test('returns 1.0 normalized entropy for perfectly uniform distribution', () => {
			const res = computeDiversity({
				Artist1: 50,
				Artist2: 50,
				Artist3: 50,
				Artist4: 50,
			})
			expect(res.total).toBe(200)
			expect(res.uniqueCount).toBe(4)
			expect(res.normalized).toBeCloseTo(1.0, 5)
			expect(res.shannon).toBeCloseTo(Math.log(4), 5)
		})

		test('returns < 1.0 normalized entropy for skewed distribution', () => {
			const res = computeDiversity({
				DominantArtist: 90,
				OtherArtist: 10,
			})
			expect(res.total).toBe(100)
			expect(res.uniqueCount).toBe(2)
			expect(res.normalized).toBeLessThan(1.0)
			expect(res.normalized).toBeGreaterThan(0.0)
		})

		test('topNShare calculates correct concentration shares', () => {
			const counts = { A: 50, B: 30, C: 15, D: 5 }
			expect(topNShare(counts, 1)).toBeCloseTo(0.5, 5)
			expect(topNShare(counts, 2)).toBeCloseTo(0.8, 5)
			expect(topNShare(counts, 3)).toBeCloseTo(0.95, 5)
			expect(topNShare(counts, 5)).toBe(1.0)
			expect(topNShare({}, 1)).toBe(0)
		})
	})

	describe('pure algorithms: periods', () => {
		const FIXED_NOW_MS = 1700000000 * 1000 // 1700000000 s
		const clock = () => FIXED_NOW_MS

		test('resolves overall period', () => {
			const res = resolvePeriod('overall', clock)
			expect(res.lastfm).toBe('overall')
			expect(res.label).toBe('all time')
			expect(res.from).toBeUndefined()
			expect(res.to).toBe(1700000000)
		})

		test('resolves 7day and weekly periods', () => {
			const weekly = resolvePeriod('weekly', clock)
			expect(weekly.lastfm).toBe('7day')
			expect(weekly.label).toBe('this week')
			expect(weekly.from).toBe(1700000000 - 7 * 86400)
			expect(weekly.to).toBe(1700000000)

			const sevenDay = resolvePeriod('7day', clock)
			expect(sevenDay.lastfm).toBe('7day')
			expect(sevenDay.label).toBe('last 7 days')
		})

		test('resolves monthly and 1month periods', () => {
			const monthly = resolvePeriod('monthly', clock)
			expect(monthly.lastfm).toBe('1month')
			expect(monthly.label).toBe('this month')
			expect(monthly.from).toBe(1700000000 - 30 * 86400)
		})
	})

	describe('getSummary', () => {
		test('fetches top artists, tracks, albums, tags in parallel and computes summary + diversity', async () => {
			const artist1 = { ...fakeArtist, name: 'Radiohead', playcount: '60' }
			const artist2 = { ...fakeArtist, name: 'The Smile', playcount: '40' }
			const track1 = { ...fakeTrack, name: 'Karma Police', playcount: '30' }
			const album1 = { ...fakeAlbum, name: 'OK Computer', playcount: '40' }
			const tag1 = { ...fakeTag, name: 'art rock', count: '100' }

			mock.respondWithJson({ topartists: { artist: [artist1, artist2], '@attr': okAttr() } })
			mock.respondWithJson({ toptracks: { track: [track1], '@attr': okAttr() } })
			mock.respondWithJson({ topalbums: { album: [album1], '@attr': okAttr() } })
			mock.respondWithJson({ toptags: { tag: [tag1], '@attr': okAttr() } })

			const result = await client.insights.getSummary({
				user: 'test_user',
				period: '7day',
				limit: 10,
			})

			expect(mock.calls).toHaveLength(4)

			// Assert API routing
			const methods = mock.calls.map((c) => parseUrl(c.url).params.method)
			expect(methods).toContain('user.getTopArtists')
			expect(methods).toContain('user.getTopTracks')
			expect(methods).toContain('user.getTopAlbums')
			expect(methods).toContain('user.getTopTags')

			// Assert summary composition
			expect(result.user).toBe('test_user')
			expect(result.lastfmPeriod).toBe('7day')
			expect(result.totalScrobbles).toBe(100) // 60 + 40
			expect(result.topArtists).toHaveLength(2)
			expect(result.topArtists[0].name).toBe('Radiohead')
			expect(result.topArtists[0].playcount).toBe(60)
			expect(result.topArtists[1].name).toBe('The Smile')
			expect(result.topArtists[1].playcount).toBe(40)

			expect(result.topTracks).toHaveLength(1)
			expect(result.topTracks[0].name).toBe('Karma Police')

			expect(result.topAlbums).toHaveLength(1)
			expect(result.topAlbums[0].name).toBe('OK Computer')

			expect(result.topTags).toHaveLength(1)
			expect(result.topTags[0].name).toBe('art rock')

			// Diversity should be computed for >= 2 artists
			expect(result.diversity).toBeDefined()
			expect(result.diversity?.uniqueArtists).toBe(2)
			expect(result.diversity?.top1Share).toBeCloseTo(0.6, 2)
			expect(result.diversity?.top3Share).toBe(1.0)
			expect(result.diversity?.normalized).toBeGreaterThan(0.9)

			// Schema validation
			const parsed = insightSchemas.insightsSummaryResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})

		test('returns undefined diversity when fewer than 2 artists are returned', async () => {
			const artist1 = { ...fakeArtist, name: 'Solo Artist', playcount: '10' }

			mock.respondWithJson({ topartists: { artist: [artist1], '@attr': okAttr() } })
			mock.respondWithJson({ toptracks: { track: [], '@attr': okAttr() } })
			mock.respondWithJson({ topalbums: { album: [], '@attr': okAttr() } })
			mock.respondWithJson({ toptags: { tag: [], '@attr': okAttr() } })

			const result = await client.insights.getSummary({ user: 'test_user' })
			expect(result.totalScrobbles).toBe(10)
			expect(result.diversity).toBeUndefined()
		})

		test('propagates LastFmApiError if any sub-call fails', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.INVALID_RESOURCE, 'User not found'))
			mock.respondWithJson({ toptracks: { track: [], '@attr': okAttr() } })
			mock.respondWithJson({ topalbums: { album: [], '@attr': okAttr() } })
			mock.respondWithJson({ toptags: { tag: [], '@attr': okAttr() } })

			await expect(client.insights.getSummary({ user: 'nonexistent' })).rejects.toBeInstanceOf(LastFmApiError)
		})
	})

	describe('schema exports and client wiring', () => {
		test('factory createInsightsService instantiates InsightsService with getSummary', () => {
			const svc: InsightsService = createInsightsService({ apiKey: API_KEY })
			expect(typeof svc.getSummary).toBe('function')
		})

		test('exposes insights service via createClient helper', () => {
			const c = createClient({ apiKey: API_KEY })
			expect(typeof c.insights.getSummary).toBe('function')
		})

		test('insightsSummaryRequestSchema validates inputs', () => {
			const valid = { user: 'ansango', period: 'weekly', limit: 5 }
			const parsed = insightSchemas.insightsSummaryRequestSchema.safeParse(valid)
			expect(parsed.success).toBe(true)
		})
	})
})
