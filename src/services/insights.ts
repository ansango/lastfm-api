import type { LastFmConfig } from '../config.js'
import { getNowPlaying } from './insights/now-playing.js'
import { getSummary } from './insights/summary.js'
import type {
	InsightsNowPlayingRequest,
	InsightsNowPlayingResponse,
	InsightsSummaryRequest,
	InsightsSummaryResponse,
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
}

/**
 * Creates an instance of the Insights service
 */
export function createInsightsService(config: LastFmConfig): InsightsService {
	return {
		getSummary: (params, init) => getSummary(config, params, init),
		getNowPlaying: (params, init) => getNowPlaying(config, params, init),
	}
}
