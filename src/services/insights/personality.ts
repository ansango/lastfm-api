import type { LastFmConfig } from '../../config.js'
import type { InsightsPersonalityRequest, InsightsPersonalityResponse } from '../insights.schemas.js'
import { getDiscoveries } from './discoveries.js'
import { getHoursHistogram } from './hours.js'
import { ARCHETYPE_INFO, type PersonalityFeatures, scoreArchetypes } from './lib/personality.js'
import { getSummary } from './summary.js'

/**
 * Derives a holistic listener personality archetype (The Devotee, The Explorer,
 * The Drifter, The DJ, The Nocturnal, The Archivist) based on multidimensional feature vectors.
 */
export async function getPersonality(
	config: LastFmConfig,
	params: InsightsPersonalityRequest,
	init?: RequestInit,
): Promise<InsightsPersonalityResponse> {
	const [summary, histogram, discoveries] = await Promise.all([
		getSummary(config, { user: params.user, period: '1month', limit: 30 }, init),
		getHoursHistogram(config, { user: params.user, sinceDays: 30 }, init),
		getDiscoveries(config, { user: params.user, windowDays: 30, baselineLimit: 200, maxResults: 100 }, init),
	])

	const features: PersonalityFeatures = {
		totalScrobbles: summary.totalScrobbles,
		uniqueArtists: summary.topArtists.length,
		top1Share: summary.diversity?.top1Share ?? 0,
		top3Share: summary.diversity?.top3Share ?? 0,
		top5Share: summary.diversity?.top5Share ?? 0,
		normalizedDiversity: summary.diversity?.normalized ?? 0.5,
		newArtistsLast30d: discoveries.totalDiscovered,
		totalArtistsLast30d: summary.topArtists.length,
		nightHourShare: histogram.nightShare,
		morningHourShare: histogram.morningShare,
		weekdayShare: 1 - histogram.weekendShare,
	}

	const result = scoreArchetypes(features)
	const archetype = {
		id: result.winner,
		...ARCHETYPE_INFO[result.winner],
	}

	return {
		user: params.user,
		winner: result.winner,
		archetype,
		scores: result.scores,
		reasons: [...result.reasons],
		features,
	}
}
