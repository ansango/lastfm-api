import type { LastFmConfig } from '../config.js'
import { getBinges } from './insights/binges.js'
import { compareUsers } from './insights/compare.js'
import { getDiscoveries } from './insights/discoveries.js'
import { getHoursHistogram } from './insights/hours.js'
import { getMood } from './insights/mood.js'
import { getNowPlaying } from './insights/now-playing.js'
import { getPersonality } from './insights/personality.js'
import { getSummary } from './insights/summary.js'
import { getTrends } from './insights/trends.js'
import type {
	InsightsBingesRequest,
	InsightsBingesResponse,
	InsightsCompareRequest,
	InsightsCompareResponse,
	InsightsDiscoveriesRequest,
	InsightsDiscoveriesResponse,
	InsightsHoursRequest,
	InsightsHoursResponse,
	InsightsMoodRequest,
	InsightsMoodResponse,
	InsightsNowPlayingRequest,
	InsightsNowPlayingResponse,
	InsightsPersonalityRequest,
	InsightsPersonalityResponse,
	InsightsSummaryRequest,
	InsightsSummaryResponse,
	InsightsTrendsRequest,
	InsightsTrendsResponse,
} from './insights.schemas.js'

/**
 * Insights Service
 *
 * Provides high-level derived analytics, summaries, and behavioral insights
 * computed over Last.fm data.
 */
export interface InsightsService {
	/**
	 * Aggregates a user's listening summary for a given period (top artists, tracks, albums, tags)
	 * and calculates Shannon diversity metrics.
	 *
	 * @param {InsightsSummaryRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsSummaryResponse>}
	 */
	getSummary: (params: InsightsSummaryRequest, init?: RequestInit) => Promise<InsightsSummaryResponse>

	/**
	 * Fetches the user's current (or most recent) track and enriches it with
	 * artist biography and similar artists.
	 *
	 * @param {InsightsNowPlayingRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsNowPlayingResponse>}
	 */
	getNowPlaying: (params: InsightsNowPlayingRequest, init?: RequestInit) => Promise<InsightsNowPlayingResponse>

	/**
	 * Buckets a user's recent scrobbles by hour-of-day (0..23) and weekday (0..6),
	 * calculating diurnal distribution and peak listening times.
	 *
	 * @param {InsightsHoursRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsHoursResponse>}
	 */
	getHoursHistogram: (params: InsightsHoursRequest, init?: RequestInit) => Promise<InsightsHoursResponse>

	/**
	 * Detects binge listening streaks (consecutive plays of the same artist or track)
	 * across a user's recent scrobbles.
	 *
	 * @param {InsightsBingesRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsBingesResponse>}
	 */
	getBinges: (params: InsightsBingesRequest, init?: RequestInit) => Promise<InsightsBingesResponse>

	/**
	 * Calculates ranking differentials (risers, fallers, newcomers, departures)
	 * between two time periods.
	 *
	 * @param {InsightsTrendsRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsTrendsResponse>}
	 */
	getTrends: (params: InsightsTrendsRequest, init?: RequestInit) => Promise<InsightsTrendsResponse>

	/**
	 * Detects newly discovered artists in a recent time window by comparing
	 * against the user's historical baseline roster.
	 *
	 * @param {InsightsDiscoveriesRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsDiscoveriesResponse>}
	 */
	getDiscoveries: (params: InsightsDiscoveriesRequest, init?: RequestInit) => Promise<InsightsDiscoveriesResponse>

	/**
	 * Classifies a user's emotional mood profile (energy vs. valence coordinates,
	 * quadrant, and top genre categories) based on community tags.
	 *
	 * @param {InsightsMoodRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsMoodResponse>}
	 */
	getMood: (params: InsightsMoodRequest, init?: RequestInit) => Promise<InsightsMoodResponse>

	/**
	 * Derives a holistic listener personality archetype (The Devotee, The Explorer,
	 * The Drifter, The DJ, The Nocturnal, The Archivist) based on multidimensional feature vectors.
	 *
	 * @param {InsightsPersonalityRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsPersonalityResponse>}
	 */
	getPersonality: (params: InsightsPersonalityRequest, init?: RequestInit) => Promise<InsightsPersonalityResponse>

	/**
	 * Compares two Last.fm users' listening affinity using Jaccard similarity
	 * over mutual top artist rosters.
	 *
	 * @param {InsightsCompareRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsCompareResponse>}
	 */
	compareUsers: (params: InsightsCompareRequest, init?: RequestInit) => Promise<InsightsCompareResponse>
}

/**
 * Creates an instance of the Insights service
 */
export function createInsightsService(config: LastFmConfig): InsightsService {
	return {
		getSummary: (params, init) => getSummary(config, params, init),
		getNowPlaying: (params, init) => getNowPlaying(config, params, init),
		getHoursHistogram: (params, init) => getHoursHistogram(config, params, init),
		getBinges: (params, init) => getBinges(config, params, init),
		getTrends: (params, init) => getTrends(config, params, init),
		getDiscoveries: (params, init) => getDiscoveries(config, params, init),
		getMood: (params, init) => getMood(config, params, init),
		getPersonality: (params, init) => getPersonality(config, params, init),
		compareUsers: (params, init) => compareUsers(config, params, init),
	}
}
