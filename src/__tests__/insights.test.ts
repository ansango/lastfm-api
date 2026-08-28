import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { createInsightsService, type InsightsService } from '../entrypoints/insights.js'
import * as insightSchemas from '../entrypoints/insights.schemas.js'
import { createClient } from '../index.js'
import { findBinges } from '../services/insights/lib/binges.js'
import { compareArtists, jaccard } from '../services/insights/lib/compare.js'
import { findNewArtists } from '../services/insights/lib/discoveries.js'
import { computeDiversity, topNShare } from '../services/insights/lib/diversity.js'
import { bucketTimestamp, buildHourHistogram } from '../services/insights/lib/hours.js'
import { classifyMood } from '../services/insights/lib/mood.js'
import { resolvePeriod } from '../services/insights/lib/periods.js'
import { scoreArchetypes } from '../services/insights/lib/personality.js'
import { diffRankings } from '../services/insights/lib/trends.js'
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
			const ts = Math.floor(new Date('2023-11-14T12:00:00Z').getTime() / 1000)
			const b = bucketTimestamp(ts)
			expect(b.hour).toBe(12)
			expect(b.weekday).toBe(1) // Tuesday
		})

		test('buildHourHistogram computes counts, peaks, and shares', () => {
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
			expect(h.weekendShare).toBeCloseTo(3 / 5, 5)
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
			expect(binges[0].length).toBe(3)
			expect(binges[0].startUts).toBe(1000)
			expect(binges[0].endUts).toBe(1600)
			expect(binges[1].length).toBe(2)
		})

		test('breaks binge run when gap exceeds maxGapSeconds', () => {
			const scrobbles = [
				{ artist: 'Radiohead', track: 'Song 1', uts: 1000 },
				{ artist: 'Radiohead', track: 'Song 2', uts: 10000 },
			]
			const binges = findBinges(scrobbles, { minLength: 2, maxGapSeconds: 3600 })
			expect(binges).toHaveLength(0)
		})
	})

	describe('pure algorithms: trends diff', () => {
		test('diffRankings categorizes risers, fallers, newcomers, departures', () => {
			const current = [
				{ name: 'Artist A', playcount: 50 },
				{ name: 'Artist C', playcount: 40 },
				{ name: 'Artist B', playcount: 30 },
			]
			const previous = [
				{ name: 'Artist B', playcount: 80 },
				{ name: 'Artist A', playcount: 40 },
				{ name: 'Artist D', playcount: 20 },
			]

			const diff = diffRankings(current, previous)
			expect(diff.risers).toHaveLength(1)
			expect(diff.risers[0].name).toBe('Artist A')
			expect(diff.risers[0].deltaRank).toBe(1)

			expect(diff.newcomers).toHaveLength(1)
			expect(diff.newcomers[0].name).toBe('Artist C')

			expect(diff.fallers).toHaveLength(1)
			expect(diff.fallers[0].name).toBe('Artist B')
			expect(diff.fallers[0].deltaRank).toBe(-2)

			expect(diff.departures).toHaveLength(1)
			expect(diff.departures[0].name).toBe('Artist D')
		})
	})

	describe('pure algorithms: discoveries', () => {
		test('findNewArtists filters out baseline and sorts by firstSeen', () => {
			const baseline = new Set(['Radiohead', 'The Beatles'])
			const window = [
				{ name: 'Radiohead', firstSeen: 1000 },
				{ name: 'Black Country, New Road', firstSeen: 1500 },
				{ name: 'Fontaines D.C.', firstSeen: 1200 },
				{ name: 'Fontaines D.C.', firstSeen: 1800 },
			]

			const discoveries = findNewArtists(window, baseline)
			expect(discoveries).toHaveLength(2)
			expect(discoveries[0].name).toBe('Fontaines D.C.')
			expect(discoveries[0].firstSeen).toBe(1200)
			expect(discoveries[1].name).toBe('Black Country, New Road')
			expect(discoveries[1].firstSeen).toBe(1500)
		})
	})

	describe('pure algorithms: mood classifier', () => {
		test('classifies euphoric and energetic tags', () => {
			const tags = ['punk', 'happy', 'dance', 'punk rock']
			const mood = classifyMood(tags)
			expect(mood.axes.energy).toBeGreaterThan(0.2)
			expect(mood.axes.valence).toBeGreaterThan(0.2)
			expect(mood.label).toBe('euphoric & energetic')
			expect(mood.categories).toContain('punk')
			expect(mood.confidence).toBeGreaterThan(0.5)
		})

		test('classifies ambient and melancholic tags', () => {
			const tags = ['ambient', 'sad', 'melancholy', 'drone']
			const mood = classifyMood(tags)
			expect(mood.axes.energy).toBeLessThan(-0.2)
			expect(mood.axes.valence).toBeLessThan(-0.2)
			expect(mood.label).toBe('melancholic & calm')
			expect(mood.categories).toContain('ambient')
		})
	})

	describe('pure algorithms: personality archetypes', () => {
		test('scores Devotee highest when top1Share is very high', () => {
			const features = {
				totalScrobbles: 500,
				uniqueArtists: 5,
				top1Share: 0.75,
				top3Share: 0.9,
				top5Share: 1.0,
				normalizedDiversity: 0.2,
				newArtistsLast30d: 0,
				totalArtistsLast30d: 5,
				nightHourShare: 0.1,
				morningHourShare: 0.2,
				weekdayShare: 0.7,
			}
			const result = scoreArchetypes(features)
			expect(result.winner).toBe('Devotee')
			expect(result.scores.Devotee).toBeGreaterThan(0.7)
		})

		test('scores Nocturnal highest when night listening dominates', () => {
			const features = {
				totalScrobbles: 800,
				uniqueArtists: 40,
				top1Share: 0.1,
				top3Share: 0.25,
				top5Share: 0.35,
				normalizedDiversity: 0.8,
				newArtistsLast30d: 5,
				totalArtistsLast30d: 40,
				nightHourShare: 0.75,
				morningHourShare: 0.05,
				weekdayShare: 0.7,
			}
			const result = scoreArchetypes(features)
			expect(result.winner).toBe('Nocturnal')
		})
	})

	describe('pure algorithms: compare users', () => {
		test('jaccard computes correct overlap fractions', () => {
			const a = new Set(['Radiohead', 'The Beatles', 'Pink Floyd'])
			const b = new Set(['Radiohead', 'Pink Floyd', 'King Crimson'])
			// intersection: 2, union: 4 -> 0.5
			expect(jaccard(a, b)).toBe(0.5)
			expect(jaccard(new Set(), new Set())).toBe(0)
		})

		test('compareArtists computes mutual overlap and ranking', () => {
			const a = [
				{ name: 'Radiohead', playcount: 100 },
				{ name: 'The Beatles', playcount: 80 },
			]
			const b = [
				{ name: 'Radiohead', playcount: 60 },
				{ name: 'Pink Floyd', playcount: 50 },
			]
			const res = compareArtists(a, b)
			expect(res.aCount).toBe(2)
			expect(res.bCount).toBe(2)
			expect(res.intersection).toEqual(['Radiohead'])
			expect(res.sharedArtists[0].weight).toBe(60) // min(100, 60)
			expect(res.onlyA).toEqual(['The Beatles'])
			expect(res.onlyB).toEqual(['Pink Floyd'])
			expect(res.compatibilityScore).toBe(33) // 1/3 = ~0.33 -> 33
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
			expect(result.user).toBe('test_user')
			expect(result.lastfmPeriod).toBe('7day')
			expect(result.totalScrobbles).toBe(100)
			expect(result.topArtists).toHaveLength(2)
			expect(result.diversity).toBeDefined()

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
			const ts1 = 1700000000
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

	describe('getTrends', () => {
		test('calculates artist ranking diff between periods', async () => {
			const cur = [{ ...fakeArtist, name: 'Radiohead', playcount: '50' }]
			const prev = [
				{ ...fakeArtist, name: 'The Smile', playcount: '40' },
				{ ...fakeArtist, name: 'Radiohead', playcount: '30' },
			]

			mock.respondWithJson({ topartists: { artist: cur, '@attr': okAttr() } })
			mock.respondWithJson({ topartists: { artist: prev, '@attr': okAttr() } })

			const result = await client.insights.getTrends({
				user: 'test_user',
				target: 'artists',
				currentPeriod: '7day',
				previousPeriod: '1month',
			})

			expect(result.user).toBe('test_user')
			expect(result.target).toBe('artists')
			expect(result.risers).toHaveLength(1)
			expect(result.risers[0].name).toBe('Radiohead')
			expect(result.risers[0].deltaRank).toBe(1)
			expect(result.departures).toHaveLength(1)
			expect(result.departures[0].name).toBe('The Smile')

			const parsed = insightSchemas.insightsTrendsResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getDiscoveries', () => {
		test('identifies new artist discoveries against baseline roster', async () => {
			const baseline = [{ ...fakeArtist, name: 'Radiohead' }]
			const windowTrack = {
				...fakeTrack,
				artist: { name: 'Fontaines D.C.' },
				date: { uts: '1700000000' },
			}

			mock.respondWithJson({ topartists: { artist: baseline, '@attr': okAttr() } })
			mock.respondWithJson({ recenttracks: { track: [windowTrack], '@attr': okAttr(1, 200, 1) } })

			const result = await client.insights.getDiscoveries({
				user: 'test_user',
				windowDays: 7,
			})

			expect(result.user).toBe('test_user')
			expect(result.baselineSize).toBe(1)
			expect(result.totalDiscovered).toBe(1)
			expect(result.discoveries[0].name).toBe('Fontaines D.C.')
			expect(result.discoveries[0].firstSeen).toBe(1700000000)

			const parsed = insightSchemas.insightsDiscoveriesResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getMood', () => {
		test('fetches user tags & top artist tags, returns classified mood profile', async () => {
			const topArtists = [{ ...fakeArtist, name: 'Idles' }]
			const userTags = [{ ...fakeTag, name: 'punk' }]
			const artistTags = [
				{ ...fakeTag, name: 'post-punk' },
				{ ...fakeTag, name: 'hardcore' },
			]

			mock.respondWithJson({ topartists: { artist: topArtists, '@attr': okAttr() } })
			mock.respondWithJson({ toptags: { tag: userTags, '@attr': okAttr() } })
			mock.respondWithJson({ toptags: { tag: artistTags, '@attr': okAttr() } })

			const result = await client.insights.getMood({
				user: 'test_user',
				period: '7day',
			})

			expect(result.user).toBe('test_user')
			expect(result.categories).toContain('punk')
			expect(result.axes.energy).toBeGreaterThan(0)
			expect(result.tagSourceCount).toBe(3)
			expect(result.primarySource).toBe('mixed')

			const parsed = insightSchemas.insightsMoodResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getPersonality', () => {
		test('assembles features and returns listener archetype', async () => {
			// 1. getSummary calls (topArtists, topTracks, topAlbums, topTags)
			const artist1 = { ...fakeArtist, name: 'Radiohead', playcount: '80' }
			mock.respondWithJson({ topartists: { artist: [artist1], '@attr': okAttr() } })
			mock.respondWithJson({ toptracks: { track: [], '@attr': okAttr() } })
			mock.respondWithJson({ topalbums: { album: [], '@attr': okAttr() } })
			mock.respondWithJson({ toptags: { tag: [], '@attr': okAttr() } })

			// 2. getHoursHistogram calls (recenttracks)
			mock.respondWithJson({ recenttracks: { track: [], '@attr': okAttr() } })

			// 3. getDiscoveries calls (overall topArtists baseline + recenttracks window)
			mock.respondWithJson({ topartists: { artist: [artist1], '@attr': okAttr() } })
			mock.respondWithJson({ recenttracks: { track: [], '@attr': okAttr() } })

			const result = await client.insights.getPersonality({ user: 'test_user' })
			expect(result.user).toBe('test_user')
			expect(result.winner).toBeDefined()
			expect(result.archetype.name).toBeDefined()
			expect(result.features).toBeDefined()

			const parsed = insightSchemas.insightsPersonalityResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('compareUsers', () => {
		test('fetches both users top artists and calculates Jaccard affinity and shared artists', async () => {
			const artistsA = [
				{ ...fakeArtist, name: 'Radiohead', playcount: '100' },
				{ ...fakeArtist, name: 'The Beatles', playcount: '80' },
			]
			const artistsB = [
				{ ...fakeArtist, name: 'Radiohead', playcount: '60' },
				{ ...fakeArtist, name: 'Pink Floyd', playcount: '50' },
			]

			mock.respondWithJson({ topartists: { artist: artistsA, '@attr': okAttr() } })
			mock.respondWithJson({ topartists: { artist: artistsB, '@attr': okAttr() } })

			const result = await client.insights.compareUsers({
				userA: 'user_a',
				userB: 'user_b',
				period: 'overall',
			})

			expect(mock.calls).toHaveLength(2)
			expect(result.userA).toBe('user_a')
			expect(result.userB).toBe('user_b')
			expect(result.sharedCount).toBe(1)
			expect(result.sharedArtists[0].name).toBe('Radiohead')
			expect(result.sharedArtists[0].weight).toBe(60)
			expect(result.onlyUserA).toEqual(['The Beatles'])
			expect(result.onlyUserB).toEqual(['Pink Floyd'])
			expect(result.compatibilityScore).toBe(33)

			const parsed = insightSchemas.insightsCompareResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getObscurityScore', () => {
		test('evaluates top artists and computes weighted obscurity score, gems, and anchors', async () => {
			const topArtists = [
				{ ...fakeArtist, name: 'Coldplay', playcount: '100' },
				{ ...fakeArtist, name: 'Local Underground Band', playcount: '50' },
			]

			mock.respondWithJson({ topartists: { artist: topArtists, '@attr': okAttr() } })
			// artist.getInfo for Coldplay (mega mainstream)
			mock.respondWithJson({
				artist: {
					...fakeArtist,
					name: 'Coldplay',
					stats: { listeners: '6000000', playcount: '350000000' },
					url: 'https://www.last.fm/music/Coldplay',
				},
			})
			// artist.getInfo for Local Underground Band (indie/obscure)
			mock.respondWithJson({
				artist: {
					...fakeArtist,
					name: 'Local Underground Band',
					stats: { listeners: '1500', playcount: '12000' },
					url: 'https://www.last.fm/music/Local+Underground+Band',
				},
			})

			const result = await client.insights.getObscurityScore({
				user: 'test_user',
				limit: 20,
			})

			expect(mock.calls).toHaveLength(3)
			expect(result.user).toBe('test_user')
			expect(result.totalArtistsEvaluated).toBe(2)
			expect(result.obscurityScore).toBeGreaterThanOrEqual(0)
			expect(result.obscurityScore).toBeLessThanOrEqual(100)
			expect(result.hiddenGems).toHaveLength(1)
			expect(result.hiddenGems[0].name).toBe('Local Underground Band')
			expect(result.mainstreamAnchors).toHaveLength(2)
			expect(result.mainstreamAnchors[0].name).toBe('Coldplay')

			const parsed = insightSchemas.insightsObscurityResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})

		test('handles empty top artists gracefully with fallback score', async () => {
			mock.respondWithJson({ topartists: { artist: [], '@attr': okAttr() } })

			const result = await client.insights.getObscurityScore({ user: 'empty_user' })
			expect(result.totalArtistsEvaluated).toBe(0)
			expect(result.obscurityScore).toBe(50)
			expect(result.hiddenGems).toHaveLength(0)

			const parsed = insightSchemas.insightsObscurityResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getForgottenFavorites', () => {
		test('identifies historical top artists absent from recent listening', async () => {
			const histArtists = [
				{ ...fakeArtist, name: 'The Smiths', playcount: '350' },
				{ ...fakeArtist, name: 'Radiohead', playcount: '300' },
			]
			const recentArtists = [{ ...fakeArtist, name: 'Radiohead', playcount: '25' }]

			mock.respondWithJson({ topartists: { artist: histArtists, '@attr': okAttr() } })
			mock.respondWithJson({ topartists: { artist: recentArtists, '@attr': okAttr() } })

			const result = await client.insights.getForgottenFavorites({
				user: 'test_user',
				historicPeriod: '12month',
				recentPeriod: '1month',
			})

			expect(mock.calls).toHaveLength(2)
			expect(result.user).toBe('test_user')
			expect(result.totalForgotten).toBe(1)
			expect(result.forgottenArtists[0].name).toBe('The Smiths')
			expect(result.forgottenArtists[0].historicPlaycount).toBe(350)
			expect(result.forgottenArtists[0].historicRank).toBe(1)

			const parsed = insightSchemas.insightsForgottenFavoritesResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getObsessions', () => {
		test('detects high-density obsession window in recent track stream', async () => {
			const tracks = [
				{ ...fakeTrack, artist: { name: 'Fontaines D.C.' }, name: 'Starburster', date: { uts: '1700000000' } },
				{ ...fakeTrack, artist: { name: 'Fontaines D.C.' }, name: 'Starburster', date: { uts: '1700000200' } },
				{ ...fakeTrack, artist: { name: 'Fontaines D.C.' }, name: 'In The Modern World', date: { uts: '1700000400' } },
				{ ...fakeTrack, artist: { name: 'Fontaines D.C.' }, name: 'Starburster', date: { uts: '1700000600' } },
				{ ...fakeTrack, artist: { name: 'Other Band' }, name: 'Song X', date: { uts: '1700000800' } },
			]

			mock.respondWithJson({ recenttracks: { track: tracks, '@attr': okAttr(1, 200, 5) } })

			const result = await client.insights.getObsessions({
				user: 'test_user',
				windowSize: 5,
				thresholdRatio: 0.5,
			})

			expect(result.user).toBe('test_user')
			expect(result.totalScrobblesInspected).toBe(5)
			expect(result.obsessions).toHaveLength(1)
			expect(result.obsessions[0].artist).toBe('Fontaines D.C.')
			expect(result.obsessions[0].density).toBe(0.8)
			expect(result.obsessions[0].track).toBe('Starburster')
			expect(result.mostObsessiveArtist).toBe('Fontaines D.C.')

			const parsed = insightSchemas.insightsObsessionsResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getListeningStreaks', () => {
		test('computes consecutive streak days and dry spells', async () => {
			// Day 1: 2024-01-01 (1704067200), Day 2: 2024-01-02 (1704153600), Day 4: 2024-01-04 (1704326400)
			const tracks = [
				{ ...fakeTrack, date: { uts: '1704326400' } }, // Jan 4
				{ ...fakeTrack, date: { uts: '1704153600' } }, // Jan 2
				{ ...fakeTrack, date: { uts: '1704067200' } }, // Jan 1
			]

			mock.respondWithJson({ recenttracks: { track: tracks, '@attr': okAttr(1, 200, 3) } })

			const result = await client.insights.getListeningStreaks({ user: 'test_user' })
			expect(result.user).toBe('test_user')
			expect(result.longestStreakDays).toBe(2) // Jan 1 & 2
			expect(result.longestDrySpellDays).toBe(1) // Jan 3
			expect(result.activeDaysCount).toBe(3)
			expect(result.totalDaysEvaluated).toBe(4)

			const parsed = insightSchemas.insightsStreaksResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getListeningHeatmap', () => {
		test('generates calendar days with intensity levels 0..4', async () => {
			const tracks = [
				{ ...fakeTrack, date: { uts: String(Math.floor(Date.now() / 1000)) } },
				{ ...fakeTrack, date: { uts: String(Math.floor(Date.now() / 1000) - 100) } },
			]

			mock.respondWithJson({ recenttracks: { track: tracks, '@attr': okAttr(1, 200, 2) } })

			const result = await client.insights.getListeningHeatmap({ user: 'test_user', days: 14 })
			expect(result.user).toBe('test_user')
			expect(result.totalScrobbles).toBe(2)
			expect(result.days).toHaveLength(14)
			expect(result.maxDailyCount).toBeGreaterThanOrEqual(1)

			const parsed = insightSchemas.insightsHeatmapResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getAlbumHabits', () => {
		test('analyzes sequential album tracks and classifies listener profile', async () => {
			const tracks = [
				{
					...fakeTrack,
					artist: { name: 'Radiohead' },
					album: { '#text': 'In Rainbows' },
					name: '15 Step',
					date: { uts: '1700000000' },
				},
				{
					...fakeTrack,
					artist: { name: 'Radiohead' },
					album: { '#text': 'In Rainbows' },
					name: 'Bodysnatchers',
					date: { uts: '1700000200' },
				},
				{
					...fakeTrack,
					artist: { name: 'Radiohead' },
					album: { '#text': 'In Rainbows' },
					name: 'Nude',
					date: { uts: '1700000400' },
				},
				{
					...fakeTrack,
					artist: { name: 'Single Artist' },
					album: { '#text': 'Single Album' },
					name: 'Track 1',
					date: { uts: '1700000600' },
				},
			]

			mock.respondWithJson({ recenttracks: { track: tracks, '@attr': okAttr(1, 200, 4) } })

			const result = await client.insights.getAlbumHabits({ user: 'test_user', minSessionTracks: 3 })
			expect(result.user).toBe('test_user')
			expect(result.totalScrobblesInspected).toBe(4)
			expect(result.cohesionScore).toBe(75)
			expect(result.profile).toBe('Album Purist')
			expect(result.albumSessionCount).toBe(1)
			expect(result.isolatedTracksCount).toBe(1)
			expect(result.topAlbums).toHaveLength(1)
			expect(result.topAlbums[0].album).toBe('In Rainbows')
			expect(result.longestSession?.trackCount).toBe(3)

			const parsed = insightSchemas.insightsAlbumHabitsResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getGenreBreakdown', () => {
		test('filters noise tags and calculates HHI concentration index', async () => {
			const topArtists = [{ ...fakeArtist, name: 'Fontaines D.C.', playcount: '100' }]
			const tags = [
				{ name: 'post-punk', count: 100 },
				{ name: 'seen live', count: 80 }, // noise
				{ name: 'indie rock', count: 50 },
			]

			mock.respondWithJson({ topartists: { artist: topArtists, '@attr': okAttr() } })
			mock.respondWithJson({ toptags: { tag: tags, '@attr': { artist: 'Fontaines D.C.' } } })

			const result = await client.insights.getGenreBreakdown({ user: 'test_user', limit: 10 })
			expect(result.user).toBe('test_user')
			expect(result.totalGenresDetected).toBe(2)
			expect(result.genres[0].name).toBe('post-punk')
			expect(result.genres.some((g) => g.name === 'seen live')).toBe(false)
			expect(result.hhiIndex).toBeGreaterThan(0)

			const parsed = insightSchemas.insightsGenreBreakdownResponseSchema.safeParse(result)
			expect(parsed.success).toBe(true)
		})
	})

	describe('getGenreEvolution', () => {
		test('computes rising, fading, and new genres between periods', async () => {
			const curArtists = [{ ...fakeArtist, name: 'Artist A', playcount: '50' }]
			const prevArtists = [{ ...fakeArtist, name: 'Artist B', playcount: '50' }]

			// Both getTopArtists calls fire first concurrently in Promise.all
			mock.respondWithJson({ topartists: { artist: curArtists, '@attr': okAttr() } })
			mock.respondWithJson({ topartists: { artist: prevArtists, '@attr': okAttr() } })
			// Then both getTopTags calls fire
			mock.respondWithJson({ toptags: { tag: [{ name: 'shoegaze', count: 100 }], '@attr': { artist: 'Artist A' } } })
			mock.respondWithJson({ toptags: { tag: [{ name: 'post-punk', count: 100 }], '@attr': { artist: 'Artist B' } } })

			const result = await client.insights.getGenreEvolution({
				user: 'test_user',
				currentPeriod: '1month',
				previousPeriod: '12month',
			})

			expect(result.user).toBe('test_user')
			expect(result.risingGenres).toHaveLength(1)
			expect(result.risingGenres[0].name).toBe('shoegaze')
			expect(result.fadingGenres).toHaveLength(1)
			expect(result.fadingGenres[0].name).toBe('post-punk')
			expect(result.newGenres).toHaveLength(1)
			expect(result.newGenres[0].name).toBe('shoegaze')

			const parsed = insightSchemas.insightsGenreEvolutionResponseSchema.safeParse(result)
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
			expect(typeof svc.getTrends).toBe('function')
			expect(typeof svc.getDiscoveries).toBe('function')
			expect(typeof svc.getMood).toBe('function')
			expect(typeof svc.getPersonality).toBe('function')
			expect(typeof svc.compareUsers).toBe('function')
			expect(typeof svc.getObscurityScore).toBe('function')
			expect(typeof svc.getForgottenFavorites).toBe('function')
			expect(typeof svc.getObsessions).toBe('function')
			expect(typeof svc.getListeningStreaks).toBe('function')
			expect(typeof svc.getListeningHeatmap).toBe('function')
			expect(typeof svc.getAlbumHabits).toBe('function')
			expect(typeof svc.getGenreBreakdown).toBe('function')
			expect(typeof svc.getGenreEvolution).toBe('function')
		})

		test('exposes insights service via createClient helper', () => {
			const c = createClient({ apiKey: API_KEY })
			expect(typeof c.insights.getSummary).toBe('function')
			expect(typeof c.insights.getNowPlaying).toBe('function')
			expect(typeof c.insights.getHoursHistogram).toBe('function')
			expect(typeof c.insights.getBinges).toBe('function')
			expect(typeof c.insights.getTrends).toBe('function')
			expect(typeof c.insights.getDiscoveries).toBe('function')
			expect(typeof c.insights.getMood).toBe('function')
			expect(typeof c.insights.getPersonality).toBe('function')
			expect(typeof c.insights.compareUsers).toBe('function')
			expect(typeof c.insights.getObscurityScore).toBe('function')
			expect(typeof c.insights.getForgottenFavorites).toBe('function')
			expect(typeof c.insights.getObsessions).toBe('function')
			expect(typeof c.insights.getListeningStreaks).toBe('function')
			expect(typeof c.insights.getListeningHeatmap).toBe('function')
			expect(typeof c.insights.getAlbumHabits).toBe('function')
			expect(typeof c.insights.getGenreBreakdown).toBe('function')
			expect(typeof c.insights.getGenreEvolution).toBe('function')
		})

		test('insightsCompareRequestSchema validates inputs', () => {
			expect(
				insightSchemas.insightsCompareRequestSchema.safeParse({ userA: 'alice', userB: 'bob', limit: 50 }).success,
			).toBe(true)
		})

		test('insightsObscurityRequestSchema validates inputs', () => {
			expect(
				insightSchemas.insightsObscurityRequestSchema.safeParse({ user: 'alice', period: '7day', limit: 20 }).success,
			).toBe(true)
		})

		test('insightsForgottenFavoritesRequestSchema validates inputs', () => {
			expect(
				insightSchemas.insightsForgottenFavoritesRequestSchema.safeParse({
					user: 'alice',
					historicPeriod: '12month',
					recentPeriod: '1month',
				}).success,
			).toBe(true)
		})

		test('insightsObsessionsRequestSchema validates inputs', () => {
			expect(
				insightSchemas.insightsObsessionsRequestSchema.safeParse({
					user: 'alice',
					thresholdRatio: 0.4,
					windowSize: 25,
				}).success,
			).toBe(true)
		})

		test('insightsStreaksRequestSchema validates inputs', () => {
			expect(insightSchemas.insightsStreaksRequestSchema.safeParse({ user: 'alice', limit: 500 }).success).toBe(true)
		})

		test('insightsHeatmapRequestSchema validates inputs', () => {
			expect(
				insightSchemas.insightsHeatmapRequestSchema.safeParse({ user: 'alice', days: 30, limit: 500 }).success,
			).toBe(true)
		})

		test('insightsAlbumHabitsRequestSchema validates inputs', () => {
			expect(
				insightSchemas.insightsAlbumHabitsRequestSchema.safeParse({ user: 'alice', limit: 200, minSessionTracks: 4 })
					.success,
			).toBe(true)
		})

		test('insightsGenreBreakdownRequestSchema validates inputs', () => {
			expect(
				insightSchemas.insightsGenreBreakdownRequestSchema.safeParse({ user: 'alice', period: '1month', limit: 20 })
					.success,
			).toBe(true)
		})

		test('insightsGenreEvolutionRequestSchema validates inputs', () => {
			expect(
				insightSchemas.insightsGenreEvolutionRequestSchema.safeParse({
					user: 'alice',
					currentPeriod: '1month',
					previousPeriod: '12month',
				}).success,
			).toBe(true)
		})
	})
})
