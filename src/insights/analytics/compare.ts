import type { LastFmConfig } from '../../config.js'
import { createUserService } from '../../user/index.js'
import type { InsightsCompareRequest, InsightsCompareResponse } from '../schemas.js'
import { compareArtists, type NamedArtistEntry } from './math/compare.js'
import { resolvePeriod } from './math/periods.js'

export async function compareUsers(
	config: LastFmConfig,
	params: InsightsCompareRequest,
	init?: RequestInit,
): Promise<InsightsCompareResponse> {
	const userService = createUserService(config)
	const resolved = resolvePeriod(params.period ?? 'overall')
	const limit = params.limit ?? 100

	const [topArtistsA, topArtistsB] = await Promise.all([
		userService.getTopArtists({ user: params.userA, period: resolved.lastfm, limit }, init),
		userService.getTopArtists({ user: params.userB, period: resolved.lastfm, limit }, init),
	])

	const rosterA: NamedArtistEntry[] = (topArtistsA.topartists?.artist ?? []).map((a) => ({
		name: a.name,
		playcount: Number(a.playcount ?? 0),
	}))

	const rosterB: NamedArtistEntry[] = (topArtistsB.topartists?.artist ?? []).map((b) => ({
		name: b.name,
		playcount: Number(b.playcount ?? 0),
	}))

	const comparison = compareArtists(rosterA, rosterB)

	return {
		userA: params.userA,
		userB: params.userB,
		period: resolved.lastfm,
		compatibilityScore: comparison.compatibilityScore,
		jaccard: comparison.jaccard,
		sharedCount: comparison.intersection.length,
		userACount: comparison.aCount,
		userBCount: comparison.bCount,
		sharedArtists: [...comparison.sharedArtists],
		onlyUserA: [...comparison.onlyA],
		onlyUserB: [...comparison.onlyB],
	}
}
