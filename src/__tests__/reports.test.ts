import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { createClient, LastFmClient } from '../client.js'
import { createReportsService, type ReportsService } from '../entrypoints/reports.js'
import * as reportSchemas from '../entrypoints/reports.schemas.js'
import { fakeTrack, okAttr } from './fixtures/lastfm-responses.js'
import { installFetchMock } from './helpers/fetch-mock.js'

const API_KEY = 'mock-key'

describe('reports service', () => {
	let mock: ReturnType<typeof installFetchMock>
	let client: LastFmClient

	beforeEach(() => {
		mock = installFetchMock()
		client = new LastFmClient({ apiKey: API_KEY })
	})

	afterEach(() => {
		mock.restore()
	})

	describe('getWrapped', () => {
		test('generates yearly wrapped summary with seasonal profiles and top entities', async () => {
			const tracks = [
				{
					...fakeTrack,
					name: 'Song Winter',
					artist: { name: 'Winter Artist' },
					album: { '#text': 'Winter Album' },
					date: { uts: '1704067200' }, // Jan 1 2024
				},
				{
					...fakeTrack,
					name: 'Song Summer',
					artist: { name: 'Summer Artist' },
					album: { '#text': 'Summer Album' },
					date: { uts: '1720000000' }, // Jul 3 2024
				},
			]

			mock.respondWithJson({ recenttracks: { track: tracks, '@attr': okAttr(1, 200, 2) } })

			const result = await client.reports.getWrapped({ user: 'test_user', year: 2024 })
			expect(result.user).toBe('test_user')
			expect(result.year).toBe(2024)
			expect(result.totalScrobbles).toBe(2)
			expect(result.estimatedListeningMinutes).toBe(7)
			expect(result.topArtists).toHaveLength(2)
			expect(result.seasons.winter.topArtist).toBe('Winter Artist')
			expect(result.seasons.summer.topArtist).toBe('Summer Artist')

			const parsed = reportSchemas.reportsWrappedResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getMilestones', () => {
		test('detects milestones and calculates next milestone projection', async () => {
			const userInfo = {
				user: {
					name: 'test_user',
					playcount: '1050',
					registered: { unixtime: '1600000000' },
				},
			}
			const tracks = [
				{
					...fakeTrack,
					name: 'Milestone 1000 Track',
					artist: { name: 'Milestone Artist' },
					date: { uts: '1700000000' },
				},
			]

			mock.respondWithJson(userInfo)
			mock.respondWithJson({ recenttracks: { track: tracks, '@attr': okAttr(1, 200, 1) } })

			const result = await client.reports.getMilestones({ user: 'test_user', targets: [1000, 5000] })
			expect(result.user).toBe('test_user')
			expect(result.totalScrobbles).toBe(1050)
			expect(result.nextMilestone.target).toBe(5000)
			expect(result.nextMilestone.remainingScrobbles).toBe(3950)

			const parsed = reportSchemas.reportsMilestonesResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getMonthlyDigest', () => {
		test('compares current month to previous month and returns growth delta', async () => {
			const curTracks = [
				{ ...fakeTrack, name: 'Cur Track', artist: { name: 'Cur Artist' }, date: { uts: '1706745600' } },
				{ ...fakeTrack, name: 'Cur Track 2', artist: { name: 'Cur Artist' }, date: { uts: '1706745700' } },
			]
			const prevTracks = [
				{ ...fakeTrack, name: 'Prev Track', artist: { name: 'Prev Artist' }, date: { uts: '1704067200' } },
			]

			mock.respondWithJson({ recenttracks: { track: curTracks, '@attr': okAttr(1, 200, 2) } })
			mock.respondWithJson({ recenttracks: { track: prevTracks, '@attr': okAttr(1, 200, 1) } })

			const result = await client.reports.getMonthlyDigest({ user: 'test_user', year: 2024, month: 2 })
			expect(result.user).toBe('test_user')
			expect(result.totalScrobbles).toBe(2)
			expect(result.previousMonthScrobbles).toBe(1)
			expect(result.growthPercentage).toBe(100)
			expect(result.topArtists[0].name).toBe('Cur Artist')

			const parsed = reportSchemas.reportsMonthlyDigestResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('schema exports and client wiring', () => {
		test('factory createReportsService instantiates ReportsService with all wired methods', () => {
			const svc: ReportsService = createReportsService({ apiKey: API_KEY })
			expect(typeof svc.getWrapped).toBe('function')
			expect(typeof svc.getMilestones).toBe('function')
			expect(typeof svc.getMonthlyDigest).toBe('function')
		})

		test('exposes reports service via createClient helper', () => {
			const c = createClient({ apiKey: API_KEY })
			expect(typeof c.reports.getWrapped).toBe('function')
			expect(typeof c.reports.getMilestones).toBe('function')
			expect(typeof c.reports.getMonthlyDigest).toBe('function')
		})
	})
})
