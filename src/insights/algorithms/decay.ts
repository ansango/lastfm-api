import type { LastFmConfig } from '../../config.js'
import { createUserService } from '../../core/services/user.js'
import { resolvePeriod } from '../lib/periods.js'
import type {
	InsightForgottenArtist,
	InsightObsessionEpisode,
	InsightsForgottenFavoritesRequest,
	InsightsForgottenFavoritesResponse,
	InsightsObsessionsRequest,
	InsightsObsessionsResponse,
} from '../schemas.js'

/**
 * Identifies artists that were staples in a user's historical period but have zero plays in the recent period.
 */
export async function getForgottenFavorites(
	config: LastFmConfig,
	params: InsightsForgottenFavoritesRequest,
	init?: RequestInit,
): Promise<InsightsForgottenFavoritesResponse> {
	const limit = Math.min(
		50,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 20),
	)
	const historicPeriod = params.historicPeriod ?? '12month'
	const recentPeriod = params.recentPeriod ?? '1month'

	const resolvedHist = resolvePeriod(historicPeriod)
	const resolvedRecent = resolvePeriod(recentPeriod)

	const userService = createUserService(config)

	// Fetch historical top artists (sample top 100)
	const histRes = await userService.getTopArtists({ user: params.user, period: resolvedHist.lastfm, limit: 100 }, init)
	// Fetch recent top artists (sample top 100)
	const recentRes = await userService.getTopArtists(
		{ user: params.user, period: resolvedRecent.lastfm, limit: 100 },
		init,
	)

	const rawHist = histRes.topartists?.artist ?? []
	const histList = Array.isArray(rawHist) ? rawHist : [rawHist]

	const rawRecent = recentRes.topartists?.artist ?? []
	const recentList = Array.isArray(rawRecent) ? rawRecent : [rawRecent]

	const recentArtistSet = new Set(recentList.map((a) => a.name.toLowerCase().trim()))

	const forgotten: InsightForgottenArtist[] = []

	histList.forEach((a, idx) => {
		const name = a.name
		if (!name) return
		if (!recentArtistSet.has(name.toLowerCase().trim())) {
			forgotten.push({
				name,
				historicPlaycount: Number.parseInt(a.playcount ?? '0', 10) || 0,
				historicRank: idx + 1,
				url: a.url,
			})
		}
	})

	// Sort by historic prominence (highest playcount / best rank first)
	forgotten.sort((a, b) => b.historicPlaycount - a.historicPlaycount)

	return {
		user: params.user,
		historicPeriod,
		recentPeriod,
		totalForgotten: forgotten.length,
		forgottenArtists: forgotten.slice(0, limit),
	}
}

/**
 * Detects intense listening obsessions (sliding windows where a single artist heavily dominates).
 */
export async function getObsessions(
	config: LastFmConfig,
	params: InsightsObsessionsRequest,
	init?: RequestInit,
): Promise<InsightsObsessionsResponse> {
	const limit = Math.min(
		1000,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 200),
	)
	const thresholdRatio = params.thresholdRatio ?? 0.35
	const windowSize = Math.max(5, Math.min(100, params.windowSize ?? 20))

	const userService = createUserService(config)
	const recentRes = await userService.getRecentTracks({ user: params.user, limit }, init)
	const rawTracks = recentRes.recenttracks?.track ?? []
	const trackList = (Array.isArray(rawTracks) ? rawTracks : [rawTracks]).filter((t) => !t['@attr']?.nowplaying)

	// Sort chronologically ascending by timestamp
	const sorted = [...trackList].sort((a, b) => {
		const utsa = Number.parseInt(a.date?.uts ?? '0', 10)
		const utsb = Number.parseInt(b.date?.uts ?? '0', 10)
		return utsa - utsb
	})

	if (sorted.length < windowSize) {
		return {
			user: params.user,
			totalScrobblesInspected: sorted.length,
			obsessions: [],
			mostObsessiveArtist: null,
		}
	}

	const rawEpisodes: Array<{
		artist: string
		track?: string
		scrobbles: number
		totalInWindow: number
		density: number
		startTime: number
		endTime: number
		durationHours: number
	}> = []

	// Sliding window scan
	for (let i = 0; i <= sorted.length - windowSize; i++) {
		const slice = sorted.slice(i, i + windowSize)
		const counts: Record<string, { count: number; trackCounts: Record<string, number> }> = {}

		for (const t of slice) {
			const artistName =
				typeof t.artist === 'object' && t.artist !== null
					? (t.artist['#text'] ?? t.artist.name ?? '')
					: String(t.artist ?? '')
			if (!artistName) continue
			if (!counts[artistName]) {
				counts[artistName] = { count: 0, trackCounts: {} }
			}
			counts[artistName].count += 1
			const trk = t.name
			if (trk) {
				counts[artistName].trackCounts[trk] = (counts[artistName].trackCounts[trk] ?? 0) + 1
			}
		}

		for (const [art, data] of Object.entries(counts)) {
			const ratio = data.count / windowSize
			if (ratio >= thresholdRatio) {
				const startUts = Number.parseInt(slice[0].date?.uts ?? '0', 10) || 0
				const endUts = Number.parseInt(slice[slice.length - 1].date?.uts ?? '0', 10) || 0
				const durationHours = Math.round(((endUts - startUts) / 3600) * 100) / 100

				let topTrack: string | undefined
				let maxTrackPlays = 0
				for (const [trk, tCount] of Object.entries(data.trackCounts)) {
					if (tCount > maxTrackPlays) {
						maxTrackPlays = tCount
						topTrack = trk
					}
				}

				rawEpisodes.push({
					artist: art,
					track: maxTrackPlays >= 3 ? topTrack : undefined,
					scrobbles: data.count,
					totalInWindow: windowSize,
					density: Math.round(ratio * 100) / 100,
					startTime: startUts,
					endTime: endUts,
					durationHours: Math.max(0.1, durationHours),
				})
			}
		}
	}

	// Merge contiguous/overlapping episodes for the same artist
	const merged: InsightObsessionEpisode[] = []
	for (const ep of rawEpisodes) {
		const last = merged[merged.length - 1]
		if (last && last.artist.toLowerCase() === ep.artist.toLowerCase() && ep.startTime <= last.endTime + 7200) {
			last.endTime = Math.max(last.endTime, ep.endTime)
			last.scrobbles = Math.max(last.scrobbles, ep.scrobbles)
			last.density = Math.max(last.density, ep.density)
			last.durationHours = Math.round(((last.endTime - last.startTime) / 3600) * 100) / 100
		} else {
			merged.push({ ...ep })
		}
	}

	// Rank episodes by highest density and scrobbles
	merged.sort((a, b) => b.density - a.density || b.scrobbles - a.scrobbles)

	// Find most obsessive artist
	const artistObsessionCount: Record<string, number> = {}
	for (const ep of merged) {
		artistObsessionCount[ep.artist] = (artistObsessionCount[ep.artist] ?? 0) + ep.scrobbles
	}
	let mostObsessiveArtist: string | null = null
	let maxObsession = 0
	for (const [art, count] of Object.entries(artistObsessionCount)) {
		if (count > maxObsession) {
			maxObsession = count
			mostObsessiveArtist = art
		}
	}

	return {
		user: params.user,
		totalScrobblesInspected: sorted.length,
		obsessions: merged,
		mostObsessiveArtist,
	}
}
