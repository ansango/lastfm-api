import type { LastFmConfig } from '../../config.js'
import { createUserService } from '../../user/index.js'
import type {
	InsightConsensusArtist,
	InsightPairwiseAffinity,
	InsightsCompareTasteGroupRequest,
	InsightsCompareTasteGroupResponse,
} from '../schemas.js'
import { resolvePeriod } from './math/periods.js'

export async function compareTasteGroup(
	config: LastFmConfig,
	params: InsightsCompareTasteGroupRequest,
	init?: RequestInit,
): Promise<InsightsCompareTasteGroupResponse> {
	const limit = Math.min(
		100,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 50),
	)
	const period = params.period ?? 'overall'
	const resolved = resolvePeriod(period)

	const userService = createUserService(config)
	const users: string[] = Array.from(new Set(params.users))

	const userArtistRosters: Array<{ user: string; artistMap: Map<string, { name: string; playcount: number }> }> =
		await Promise.all(
			users.map(async (u) => {
				try {
					const res = await userService.getTopArtists({ user: u, period: resolved.lastfm, limit }, init)
					const raw = res.topartists?.artist ?? []
					const list = Array.isArray(raw) ? raw : [raw]
					const artistMap = new Map<string, { name: string; playcount: number }>()
					for (const a of list) {
						if (a.name) {
							artistMap.set(a.name.toLowerCase().trim(), {
								name: a.name,
								playcount: Number.parseInt(String(a.playcount ?? '0'), 10) || 1,
							})
						}
					}
					return { user: u, artistMap }
				} catch {
					return { user: u, artistMap: new Map<string, { name: string; playcount: number }>() }
				}
			}),
		)

	const pairwiseMatrix: InsightPairwiseAffinity[] = []
	const userTotalScores: Record<string, { sumScore: number; pairCount: number }> = {}
	for (const u of users) {
		userTotalScores[u] = { sumScore: 0, pairCount: 0 }
	}

	for (let i = 0; i < userArtistRosters.length; i++) {
		for (let j = i + 1; j < userArtistRosters.length; j++) {
			const u1 = userArtistRosters[i]
			const u2 = userArtistRosters[j]

			const set1 = new Set(u1.artistMap.keys())
			const set2 = new Set(u2.artistMap.keys())

			const intersection = new Set([...set1].filter((x) => set2.has(x)))
			const union = new Set([...set1, ...set2])

			const jaccard = union.size > 0 ? Math.round((intersection.size / union.size) * 1000) / 1000 : 0
			const compatibilityScore = Math.round(jaccard * 100)

			pairwiseMatrix.push({
				userA: u1.user,
				userB: u2.user,
				jaccard,
				compatibilityScore,
				sharedCount: intersection.size,
			})

			userTotalScores[u1.user].sumScore += compatibilityScore
			userTotalScores[u1.user].pairCount += 1

			userTotalScores[u2.user].sumScore += compatibilityScore
			userTotalScores[u2.user].pairCount += 1
		}
	}

	const totalPairs = pairwiseMatrix.length
	const groupAvgCompat =
		totalPairs > 0
			? Math.round((pairwiseMatrix.reduce((acc, p) => acc + p.compatibilityScore, 0) / totalPairs) * 100) / 100
			: 0

	let minAvg = Number.POSITIVE_INFINITY
	let maxAvg = Number.NEGATIVE_INFINITY
	let groupOutlier: { user: string; averageCompatibility: number } | null = null
	let groupAnchor: { user: string; averageCompatibility: number } | null = null

	for (const [u, data] of Object.entries(userTotalScores)) {
		if (data.pairCount > 0) {
			const avg = Math.round((data.sumScore / data.pairCount) * 100) / 100
			if (avg < minAvg) {
				minAvg = avg
				groupOutlier = { user: u, averageCompatibility: avg }
			}
			if (avg > maxAvg) {
				maxAvg = avg
				groupAnchor = { user: u, averageCompatibility: avg }
			}
		}
	}

	const artistAgg = new Map<string, { name: string; listeners: Set<string>; totalPlays: number }>()

	for (const { user, artistMap } of userArtistRosters) {
		for (const [key, data] of artistMap.entries()) {
			const existing = artistAgg.get(key)
			if (existing) {
				existing.listeners.add(user)
				existing.totalPlays += data.playcount
			} else {
				artistAgg.set(key, {
					name: data.name,
					listeners: new Set([user]),
					totalPlays: data.playcount,
				})
			}
		}
	}

	const minListenersRequired = users.length > 2 ? 2 : 1
	const consensusArtists: InsightConsensusArtist[] = Array.from(artistAgg.values())
		.filter((a) => a.listeners.size >= minListenersRequired)
		.map((a) => ({
			name: a.name,
			listenerCount: a.listeners.size,
			listenerPercentage: Math.round((a.listeners.size / users.length) * 10000) / 100,
			listeners: Array.from(a.listeners),
			totalPlays: a.totalPlays,
		}))
		.sort((a, b) => b.listenerCount - a.listenerCount || b.totalPlays - a.totalPlays)
		.slice(0, 20)

	return {
		users,
		period,
		groupAverageCompatibility: groupAvgCompat,
		groupOutlier,
		groupAnchor,
		consensusArtists,
		pairwiseMatrix,
	}
}
