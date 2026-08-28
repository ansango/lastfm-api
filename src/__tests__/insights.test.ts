import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { createInsightsService, type InsightsService } from '../entrypoints/insights.js'
import * as insightSchemas from '../entrypoints/insights.schemas.js'
import { createClient } from '../index.js'
import { findBinges } from '../services/insights/lib/binges.js'
import { computeDiversity, topNShare } from '../services/insights/lib/diversity.js'
import { bucketTimestamp, buildHourHistogram } from '../services/insights/lib/hours.js'
import { resolvePeriod } from '../services/insights/lib/periods.js'
import { stripWiki, summarizeBio } from '../services/insights/now-playing.js'
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
import { type FetchMock, installFetchMock } from './helpers/fetch-mock.js'

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

	describe('pure algorithms: bio sanitization', () => {
		test('stripWiki cleans wiki links and HTML tags', () => {
			const input = 'Formed in [[Oxford|Oxford, England]] in 1985. <a href="...">Read more</a> on Last.fm.'
			const clean = stripWiki(input)
			expect(clean).toBe('Formed in Oxford, England in 1985. Read more on Last.fm.')
		})

		test('summarizeBio truncates cleanly on word boundary', () => {
			const bio = 'Radiohead are an English rock band formed in Abingdon in 1985.'
			const summarized = summarizeBio(bio, 25)
			expect(summarized).toBe('Radiohead are an English…')
		})

		test('summarizeBio returns full string if within maxChars', () => {
			const bio = 'Short bio.'
			expect(summarizeBio(bio, 100)).toBe('Short bio.')
			expect(summarizeBio(undefined, 100)).toBe('')
		})
	})

	describe('pure algorithms: hours histogram', () => {
		test('bucketTimestamp maps UTC hour and ISO weekday (Mon=0..Sun=6)', () => {
			// 2023-11-14 12:00:00 UTC is Tuesday (weekday = 1)
			const ts = Math.floor(new Date('2023-11-14T12:00:00Z').getTime() / 1000)
			const b = bucketTimestamp(ts)
			expect(b.hour).toBe(12)
			expect(b.weekday).toBe(1) // Tuesday
		})

		test('buildHourHistogram computes counts, peaks, and shares', () => {
			// 3 timestamps at 02:00 (night, Sunday), 2 at 14:00 (afternoon, Monday)
			const sundayNight = Math.floor(new Date('2023-11-19T02:00:00Z').getTime() / 1000)
			const mondayAfternoon = Math.floor(new Date('2023-11-20T14:00:00Z').getTime() / 1000)

			const stamps = [sundayNight, sundayNight, sundayNight, mondayAfternoon, mondayAfternoon]
			const h = buildHourHistogram(stamps)

			expect(h.total).toBe(5)
			expect(h.byHour[2]).toBe(3)
			expect(h.byHour[14]).toBe(2)
			expect(h.peakHour).toBe(2)
			expect(h.peakHourCount).toBe(3)
			expect(h.nightShare).toBeCloseTo(3 / 5, 5)
			expect(h.afternoonShare).toBeCloseTo(2 / 5, 5)
			expect(h.weekendShare).toBeCloseTo(3 / 5, 5) // Sunday is weekend
		})
	})

	describe('pure algorithms: binges', () => {
		test('findBinges detects consecutive plays of the same artist', () => {
			const scrobbles = [
				{ artist: 'Radiohead', track: 'Airbag', uts: 1000 },
				{ artist: 'Radiohead', track: 'Paranoid Android', uts: 1300 },
				{ artist: 'Radiohead', track: 'Subterranean Homesick Alien', uts: 1600 },
				{ artist: 'The Smile', track: 'You Will Never Work in Television Again', uts: 2000 },
				{ artist: 'Radiohead', track: 'Exit Music', uts: 2300 },
				{ artist: 'Radiohead', track: 'Let Down', uts: 2600 },
			]

			const binges = findBinges(scrobbles, { minLength: 2, maxGapSeconds: 1000 })
			expect(binges).toHaveLength(2)
			expect(binges[0].artist).toBe('Radiohead')
			expect(binges[0].length).toBe(3) // First run of 3
			expect(binges[0].startUts).toBe(1000)
			expect(binges[0].endUts).toBe(1600)
			expect(binges[1].length).toBe(2) // Second run of 2
		})

		test('breaks binge run when gap exceeds maxGapSeconds', () => {
			const scrobbles = [
				{ artist: 'Radiohead', track: 'Song 1', uts: 1000 },
				{ artist: 'Radiohead', track: 'Song 2', uts: 10000 }, // gap is 9000s > 3600s
			]
			const binges = findBinges(scrobbles, { minLength: 2, maxGapSeconds: 3600 })
			expect(binges).toHaveLength(0)
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

			// Assert summary composition
			expect(result.user).toBe('test_user')
			expect(result.lastfmPeriod).toBe('7day')
			expect(result.totalScrobbles).toBe(100) // 60 + 40
			expect(result.topArtists).toHaveLength(2)
			expect(result.diversity).toBeDefined()

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

	describe('getNowPlaying', () => {
		test('enriches currently playing track with artist bio and similar artists', async () => {
			const track = {
				...fakeTrack,
				name: 'Jigsaw Falling Into Place',
				artist: { name: 'Radiohead', mbid: 'artist-mbid', url: 'https://last.fm/music/Radiohead' },
				album: { '#text': 'In Rainbows' },
				'@attr': { nowplaying: 'true' },
			}
			const artistInfo = {
				...fakeArtist,
				name: 'Radiohead',
				bio: { summary: 'Radiohead are an English rock band formed in Abingdon in 1985.' },
			}
			const similar = {
				similarartists: {
					artist: [
						{ name: 'The Smile', match: '0.9', url: 'https://last.fm/music/The+Smile' },
						{ name: 'Thom Yorke', match: '0.85', url: 'https://last.fm/music/Thom+Yorke' },
					],
				},
			}

			mock.respondWithJson({ recenttracks: { track: [track], '@attr': { user: 'test_user' } } })
			mock.respondWithJson({ artist: artistInfo })
			mock.respondWithJson(similar)

			const result = await client.insights.getNowPlaying({
				user: 'test_user',
				similarLimit: 2,
				bioMaxChars: 50,
			})

			expect(mock.calls).toHaveLength(3)
			expect(result.user).toBe('test_user')
			expect(result.nowPlaying).toBe(true)
			expect(result.track.name).toBe('Jigsaw Falling Into Place')
			expect(result.artist.name).toBe('Radiohead')
			expect(result.album).toBe('In Rainbows')
			expect(result.bio).toContain('Radiohead')
			expect(result.similar).toHaveLength(2)

			const parsed = insightSchemas.insightsNowPlayingResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})

		test('handles empty track history gracefully', async () => {
			mock.respondWithJson({ recenttracks: { track: [], '@attr': { user: 'test_user' } } })

			const result = await client.insights.getNowPlaying({ user: 'test_user' })
			expect(result.user).toBe('test_user')
			expect(result.nowPlaying).toBe(false)
			expect(result.track.name).toBe('')
			expect(result.similar).toEqual([])
		})
	})

	describe('getHoursHistogram', () => {
		test('paginates recenttracks and calculates diurnal histogram', async () => {
			const ts1 = 1700000000 // 2023-11-14 22:13:20 UTC
			const track1 = { ...fakeTrack, date: { uts: String(ts1) } }

			mock.respondWithJson({
				recenttracks: {
					track: [track1],
					'@attr': okAttr(1, 200, 1),
				},
			})

			const result = await client.insights.getHoursHistogram({
				user: 'test_user',
				from: ts1 - 1000,
				to: ts1 + 1000,
			})

			expect(mock.calls).toHaveLength(1)
			expect(result.user).toBe('test_user')
			expect(result.total).toBe(1)
			expect(result.byHour[22]).toBe(1)
			expect(result.peakHour).toBe(22)
			expect(result.eveningShare).toBe(1.0)

			const parsed = insightSchemas.insightsHoursResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getBinges', () => {
		test('paginates recent tracks, sorts ascending, and identifies streaks', async () => {
			const tracks = [
				{ ...fakeTrack, artist: { name: 'Radiohead' }, name: 'Song 3', date: { uts: '1700000600' } },
				{ ...fakeTrack, artist: { name: 'Radiohead' }, name: 'Song 2', date: { uts: '1700000300' } },
				{ ...fakeTrack, artist: { name: 'Radiohead' }, name: 'Song 1', date: { uts: '1700000000' } },
			]

			mock.respondWithJson({
				recenttracks: {
					track: tracks,
					'@attr': okAttr(1, 200, 3),
				},
			})

			const result = await client.insights.getBinges({
				user: 'test_user',
				minLength: 2,
				maxGapSeconds: 600,
			})

			expect(result.user).toBe('test_user')
			expect(result.totalScrobbles).toBe(3)
			expect(result.binges).toHaveLength(1)
			expect(result.binges[0].artist).toBe('Radiohead')
			expect(result.binges[0].length).toBe(3)
			expect(result.binges[0].durationSeconds).toBe(600)

			const parsed = insightSchemas.insightsBingesResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('schema exports and client wiring', () => {
		test('factory createInsightsService instantiates InsightsService with all wired methods', () => {
			const svc: InsightsService = createInsightsService({ apiKey: API_KEY })
			expect(typeof svc.getSummary).toBe('function')
			expect(typeof svc.getNowPlaying).toBe('function')
			expect(typeof svc.getHoursHistogram).toBe('function')
			expect(typeof svc.getBinges).toBe('function')
		})

		test('exposes insights service via createClient helper', () => {
			const c = createClient({ apiKey: API_KEY })
			expect(typeof c.insights.getSummary).toBe('function')
			expect(typeof c.insights.getNowPlaying).toBe('function')
			expect(typeof c.insights.getHoursHistogram).toBe('function')
			expect(typeof c.insights.getBinges).toBe('function')
		})

		test('insightsHoursRequestSchema and insightsBingesRequestSchema validate inputs', () => {
			expect(insightSchemas.insightsHoursRequestSchema.safeParse({ user: 'ansango', sinceDays: 14 }).success).toBe(true)
			expect(
				insightSchemas.insightsBingesRequestSchema.safeParse({ user: 'ansango', minLength: 3, trackKey: 'artist' })
					.success,
			).toBe(true)
		})
	})
})
