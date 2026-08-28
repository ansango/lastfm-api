import type { LastFmConfig } from '../../config.js'
import type { InsightsDiscoveriesRequest, InsightsDiscoveriesResponse } from '../insights.schemas.js'
import { createUserService } from '../user.js'
import { type ArtistTimestampItem, findNewArtists } from './lib/discoveries.js'

/**
 * Detects newly discovered artists in a recent time window by comparing
 * against the user's historical baseline roster.
 */
export async function getDiscoveries(
	config: LastFmConfig,
	params: InsightsDiscoveriesRequest,
	init?: RequestInit,
): Promise<InsightsDiscoveriesResponse> {
	const userService = createUserService(config)
	const windowDays = params.windowDays ?? 7
	const to = params.to ?? Math.floor(Date.now() / 1000)
	const from = params.from ?? to - windowDays * 86400
	const baselineLimit = params.baselineLimit ?? 200
	const maxPages = params.maxPages ?? 20
	const maxResults = params.maxResults ?? 20

	// 1. Fetch baseline overall top artists
	const baselineRes = await userService.getTopArtists(
		{ user: params.user, period: 'overall', limit: baselineLimit },
		init,
	)
	const baselineSet = new Set((baselineRes.topartists?.artist ?? []).map((a) => a.name))

	// 2. Fetch window recent tracks
	const windowScrobbles: ArtistTimestampItem[] = []
	let page = 1

	while (page <= maxPages) {
		const recentRes = await userService.getRecentTracks(
			{
				user: params.user,
				from: String(from),
				to: String(to),
				limit: 200,
				page,
			},
			init,
		)

		const tracks = recentRes.recenttracks?.track ?? []
		for (const t of tracks) {
			const rawArtist = t.artist as Record<string, unknown> | string | undefined
			const artistName =
				typeof rawArtist === 'object' && rawArtist !== null
					? String(rawArtist.name ?? rawArtist['#text'] ?? '')
					: String(rawArtist ?? '')
			const uts = t.date?.uts ? Number(t.date.uts) : undefined
			if (artistName.length > 0 && typeof uts === 'number' && !Number.isNaN(uts)) {
				windowScrobbles.push({ name: artistName, firstSeen: uts })
			}
		}

		if (tracks.length < 200) break
		page++
	}

	const discoveries = findNewArtists(windowScrobbles, baselineSet, { maxResults })

	return {
		user: params.user,
		windowDays,
		baselineSize: baselineSet.size,
		totalDiscovered: discoveries.length,
		discoveries,
	}
}
