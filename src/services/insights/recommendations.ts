import type { LastFmConfig } from '../../config.js'
import { createArtistService } from '../artist.js'
import type {
	InsightBridgeArtist,
	InsightRecommendationItem,
	InsightsBridgeArtistsRequest,
	InsightsBridgeArtistsResponse,
	InsightsRecommendationsRequest,
	InsightsRecommendationsResponse,
} from '../insights.schemas.js'
import { createTagService } from '../tag.js'
import { createUserService } from '../user.js'
import { resolvePeriod } from './lib/periods.js'

/**
 * Traverses Last.fm similarity graphs from user's top artists to recommend unlistened artists.
 */
export async function getSmartRecommendations(
	config: LastFmConfig,
	params: InsightsRecommendationsRequest,
	init?: RequestInit,
): Promise<InsightsRecommendationsResponse> {
	const seedLimit = Math.min(
		20,
		typeof params.seedLimit === 'string' ? Number.parseInt(params.seedLimit, 10) : (params.seedLimit ?? 10),
	)
	const limit = Math.min(
		50,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 15),
	)
	const period = params.period ?? 'overall'
	const resolved = resolvePeriod(period)

	const userService = createUserService(config)
	const artistService = createArtistService(config)

	// Fetch top 50 user artists to identify seeds and known roster
	const topRes = await userService.getTopArtists({ user: params.user, period: resolved.lastfm, limit: 50 }, init)
	const rawArtists = topRes.topartists?.artist ?? []
	const artistList = Array.isArray(rawArtists) ? rawArtists : [rawArtists]

	const knownArtists = new Set(artistList.map((a) => a.name.toLowerCase().trim()))
	const seedArtists = artistList.slice(0, seedLimit)

	const candidateMap = new Map<string, { name: string; score: number; matchedSeeds: Set<string>; url?: string }>()

	const promises = seedArtists.map(async (seed, idx) => {
		const seedName = seed.name
		const seedWeight = Math.max(1, seedLimit - idx)
		try {
			const simRes = await artistService.getSimilar({ artist: seedName, limit: 20 }, init)
			const rawSim = simRes.similarartists?.artist ?? []
			const simList = Array.isArray(rawSim) ? rawSim : [rawSim]

			for (const sim of simList) {
				const candidateName = sim.name
				if (!candidateName) continue
				const lower = candidateName.toLowerCase().trim()
				if (knownArtists.has(lower)) continue

				const matchVal = Number.parseFloat(sim.match ?? '0.5') || 0.5
				const contribution = matchVal * seedWeight

				const existing = candidateMap.get(lower)
				if (existing) {
					existing.score += contribution
					existing.matchedSeeds.add(seedName)
				} else {
					candidateMap.set(lower, {
						name: candidateName,
						score: contribution,
						matchedSeeds: new Set([seedName]),
						url: sim.url,
					})
				}
			}
		} catch {
			// ignore failure for individual seed
		}
	})

	await Promise.allSettled(promises)

	const scoredCandidates: InsightRecommendationItem[] = Array.from(candidateMap.values())
		.map((c) => ({
			name: c.name,
			score: Math.round(c.score * 100) / 100,
			matchedSeeds: Array.from(c.matchedSeeds),
			url: c.url,
		}))
		.sort((a, b) => b.score - a.score || b.matchedSeeds.length - a.matchedSeeds.length)
		.slice(0, limit)

	return {
		user: params.user,
		seedArtists: seedArtists.map((s) => s.name),
		totalRecommendations: scoredCandidates.length,
		recommendations: scoredCandidates,
	}
}

/**
 * Finds artists that bridge two distinct genres or tags.
 */
export async function getBridgeArtists(
	config: LastFmConfig,
	params: InsightsBridgeArtistsRequest,
	init?: RequestInit,
): Promise<InsightsBridgeArtistsResponse> {
	const limit = Math.min(
		50,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 10),
	)

	const tagService = createTagService(config)

	const [tagARes, tagBRes] = await Promise.all([
		tagService.getTopArtists({ tag: params.tagA, limit: 50 }, init),
		tagService.getTopArtists({ tag: params.tagB, limit: 50 }, init),
	])

	const rawA = tagARes.topartists?.artist ?? []
	const listA = Array.isArray(rawA) ? rawA : [rawA]

	const rawB = tagBRes.topartists?.artist ?? []
	const listB = Array.isArray(rawB) ? rawB : [rawB]

	const mapA = new Map<string, { rank: number; name: string; url?: string }>()
	listA.forEach((a, idx) => {
		if (a.name) {
			mapA.set(a.name.toLowerCase().trim(), { rank: idx + 1, name: a.name, url: a.url })
		}
	})

	const bridges: InsightBridgeArtist[] = []

	listB.forEach((b, idx) => {
		if (!b.name) return
		const lower = b.name.toLowerCase().trim()
		const hit = mapA.get(lower)
		if (hit) {
			const rankA = hit.rank
			const rankB = idx + 1
			const combinedScore = Math.round(((1 / rankA + 1 / rankB) / 2) * 10000) / 100
			bridges.push({
				name: hit.name,
				rankA,
				rankB,
				combinedScore,
				url: hit.url ?? b.url,
			})
		}
	})

	bridges.sort((a, b) => b.combinedScore - a.combinedScore)

	return {
		tagA: params.tagA,
		tagB: params.tagB,
		totalBridges: bridges.length,
		bridgeArtists: bridges.slice(0, limit),
	}
}
