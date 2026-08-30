import { createUserService } from '@/api/user/service.js'
import type { LastFmConfig } from '@/core/config.js'
import type { ReportsWrappedRequest, ReportsWrappedResponse } from '../schemas.js'

function formatUtcDate(uts: number): string {
	const d = new Date(uts * 1000)
	return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function getSeasonName(monthIndex: number): 'winter' | 'spring' | 'summer' | 'fall' {
	if (monthIndex === 11 || monthIndex === 0 || monthIndex === 1) return 'winter'
	if (monthIndex >= 2 && monthIndex <= 4) return 'spring'
	if (monthIndex >= 5 && monthIndex <= 7) return 'summer'
	return 'fall'
}

export async function getWrapped(
	config: LastFmConfig,
	params: ReportsWrappedRequest,
	init?: RequestInit,
): Promise<ReportsWrappedResponse> {
	const currentYear = new Date().getUTCFullYear()
	const year = params.year ?? (params.from ? undefined : currentYear - 1)

	let fromUts: number
	let toUts: number

	if (params.from && params.to) {
		fromUts = params.from
		toUts = params.to
	} else if (year) {
		fromUts = Math.floor(Date.UTC(year, 0, 1, 0, 0, 0) / 1000)
		toUts = Math.floor(Date.UTC(year, 11, 31, 23, 59, 59) / 1000)
	} else {
		toUts = Math.floor(Date.now() / 1000)
		fromUts = toUts - 365 * 24 * 3600
	}

	const userService = createUserService(config)
	const recentRes = await userService.getRecentTracks(
		{ user: params.user, from: String(fromUts), to: String(toUts), limit: 1000 },
		init,
	)

	const rawTracks = recentRes.recenttracks?.track ?? []
	const tracks = (Array.isArray(rawTracks) ? rawTracks : [rawTracks]).filter((t) => !t['@attr']?.nowplaying)

	const rawTotal = recentRes.recenttracks?.['@attr']?.total
	const totalScrobbles =
		typeof rawTotal === 'number' ? rawTotal : Number.parseInt(String(rawTotal ?? tracks.length), 10) || tracks.length
	const estimatedListeningMinutes = Math.round(totalScrobbles * 3.5)

	const artistCounts: Record<string, number> = {}
	const trackCounts: Record<string, { artist: string; count: number }> = {}
	const albumCounts: Record<string, { artist: string; count: number }> = {}
	const dailyCounts: Record<string, { count: number; artistCounts: Record<string, number> }> = {}
	const seasonStats: Record<
		'winter' | 'spring' | 'summer' | 'fall',
		{
			artistCounts: Record<string, number>
			trackCounts: Record<string, number>
			total: number
		}
	> = {
		winter: { artistCounts: {}, trackCounts: {}, total: 0 },
		spring: { artistCounts: {}, trackCounts: {}, total: 0 },
		summer: { artistCounts: {}, trackCounts: {}, total: 0 },
		fall: { artistCounts: {}, trackCounts: {}, total: 0 },
	}

	for (const t of tracks) {
		const artistName =
			typeof t.artist === 'object' && t.artist !== null
				? (t.artist['#text'] ?? t.artist.name ?? '')
				: String(t.artist ?? '')
		const trackTitle = t.name ?? ''
		const albumTitle =
			typeof t.album === 'object' && t.album !== null ? (t.album['#text'] ?? '') : String(t.album ?? '')
		const uts = Number.parseInt(String(t.date?.uts ?? '0'), 10)

		if (artistName) {
			artistCounts[artistName] = (artistCounts[artistName] ?? 0) + 1
		}
		if (trackTitle && artistName) {
			const trkKey = `${trackTitle}:::${artistName}`
			trackCounts[trkKey] = {
				artist: artistName,
				count: (trackCounts[trkKey]?.count ?? 0) + 1,
			}
		}
		if (albumTitle && artistName) {
			const albKey = `${albumTitle}:::${artistName}`
			albumCounts[albKey] = {
				artist: artistName,
				count: (albumCounts[albKey]?.count ?? 0) + 1,
			}
		}

		if (uts > 0) {
			const dateStr = formatUtcDate(uts)
			if (!dailyCounts[dateStr]) {
				dailyCounts[dateStr] = { count: 0, artistCounts: {} }
			}
			dailyCounts[dateStr].count += 1
			if (artistName) {
				dailyCounts[dateStr].artistCounts[artistName] = (dailyCounts[dateStr].artistCounts[artistName] ?? 0) + 1
			}

			const d = new Date(uts * 1000)
			const season = getSeasonName(d.getUTCMonth())
			seasonStats[season].total += 1
			if (artistName) {
				seasonStats[season].artistCounts[artistName] = (seasonStats[season].artistCounts[artistName] ?? 0) + 1
			}
			if (trackTitle) {
				seasonStats[season].trackCounts[trackTitle] = (seasonStats[season].trackCounts[trackTitle] ?? 0) + 1
			}
		}
	}

	const topArtists = Object.entries(artistCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10)
		.map(([name, playcount]) => ({
			name,
			playcount,
			percentage: totalScrobbles > 0 ? Math.round((playcount / totalScrobbles) * 10000) / 100 : 0,
		}))

	const topTracks = Object.entries(trackCounts)
		.sort((a, b) => b[1].count - a[1].count)
		.slice(0, 10)
		.map(([key, data]) => {
			const name = key.split(':::')[0]
			return { name, artist: data.artist, playcount: data.count }
		})

	const topAlbums = Object.entries(albumCounts)
		.sort((a, b) => b[1].count - a[1].count)
		.slice(0, 10)
		.map(([key, data]) => {
			const name = key.split(':::')[0]
			return { name, artist: data.artist, playcount: data.count }
		})

	// Busiest day
	let maxDaily = 0
	let busiestDate = formatUtcDate(fromUts)
	let busiestArtist: string | null = null

	for (const [dateStr, data] of Object.entries(dailyCounts)) {
		if (data.count > maxDaily) {
			maxDaily = data.count
			busiestDate = dateStr
			let maxArtPlays = 0
			for (const [art, plays] of Object.entries(data.artistCounts)) {
				if (plays > maxArtPlays) {
					maxArtPlays = plays
					busiestArtist = art
				}
			}
		}
	}

	function resolveSeason(season: 'winter' | 'spring' | 'summer' | 'fall') {
		const s = seasonStats[season]
		let topArt: string | null = null
		let maxArt = 0
		for (const [art, p] of Object.entries(s.artistCounts)) {
			if (p > maxArt) {
				maxArt = p
				topArt = art
			}
		}

		let topTrk: string | null = null
		let maxTrk = 0
		for (const [trk, p] of Object.entries(s.trackCounts)) {
			if (p > maxTrk) {
				maxTrk = p
				topTrk = trk
			}
		}

		return {
			topArtist: topArt,
			topTrack: topTrk,
			scrobbles: s.total,
		}
	}

	return {
		user: params.user,
		year,
		from: fromUts,
		to: toUts,
		totalScrobbles,
		estimatedListeningMinutes,
		topArtists,
		topTracks,
		topAlbums,
		busiestDay: {
			date: busiestDate,
			scrobbles: maxDaily,
			topArtist: busiestArtist,
		},
		seasons: {
			winter: resolveSeason('winter'),
			spring: resolveSeason('spring'),
			summer: resolveSeason('summer'),
			fall: resolveSeason('fall'),
		},
	}
}
