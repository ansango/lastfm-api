import { createUserService } from '../../../api/user/index.js'
import type { LastFmConfig } from '../../../core/config.js'
import type { InsightsBingesRequest, InsightsBingesResponse } from '../schemas.js'
import { type BingesTrackKey, findBinges, type ScrobbleItem } from './math/binges.js'

export async function getBinges(
	config: LastFmConfig,
	params: InsightsBingesRequest,
	init?: RequestInit,
): Promise<InsightsBingesResponse> {
	const userService = createUserService(config)
	const to = params.to ?? Math.floor(Date.now() / 1000)
	const from = params.from ?? (params.sinceDays ? to - params.sinceDays * 86400 : to - 7 * 86400)
	const maxPages = params.maxPages ?? 50

	const scrobbles: ScrobbleItem[] = []
	let page = 1

	while (page <= maxPages) {
		const res = await userService.getRecentTracks(
			{
				user: params.user,
				from: String(from),
				to: String(to),
				limit: 200,
				page,
			},
			init,
		)

		const tracks = res.recenttracks?.track ?? []
		for (const t of tracks) {
			const rawArtist = t.artist as Record<string, unknown> | string | undefined
			const artist =
				typeof rawArtist === 'object' && rawArtist !== null
					? String(rawArtist.name ?? rawArtist['#text'] ?? '')
					: String(rawArtist ?? '')
			const track = String(t.name ?? '')
			const uts = t.date?.uts ? Number(t.date.uts) : undefined
			if (artist.length > 0 && track.length > 0 && typeof uts === 'number' && !Number.isNaN(uts)) {
				scrobbles.push({ artist, track, uts })
			}
		}

		if (tracks.length < 200) break
		page++
	}

	scrobbles.sort((a, b) => a.uts - b.uts)

	const trackKey: BingesTrackKey = params.trackKey === true || params.trackKey === 'track' ? 'track' : 'artist'

	const binges = findBinges(scrobbles, {
		minLength: params.minLength,
		maxGapSeconds: params.maxGapSeconds,
		trackKey,
		maxResults: params.maxResults,
	})

	return {
		user: params.user,
		totalScrobbles: scrobbles.length,
		binges,
	}
}
