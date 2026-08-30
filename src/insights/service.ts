import type { LastFmConfig } from '../config.js'
import { getAlbumHabits } from './analytics/album-habits.js'
import { getBinges } from './analytics/binges.js'
import { compareUsers } from './analytics/compare.js'
import { getForgottenFavorites, getObsessions } from './analytics/decay.js'
import { getDiscoveries } from './analytics/discoveries.js'
import { getGenreBreakdown, getGenreEvolution } from './analytics/genres.js'
import { compareTasteGroup } from './analytics/group.js'
import { getHoursHistogram } from './analytics/hours.js'
import { getMood } from './analytics/mood.js'
import { getNowPlaying } from './analytics/now-playing.js'
import { getObscurityScore } from './analytics/obscurity.js'
import { getPersonality } from './analytics/personality.js'
import { getBridgeArtists, getSmartRecommendations } from './analytics/recommendations.js'
import { getListeningHeatmap, getListeningStreaks } from './analytics/streaks.js'
import { getSummary } from './analytics/summary.js'
import { getTrends } from './analytics/trends.js'
import type {
	InsightsAlbumHabitsRequest,
	InsightsAlbumHabitsResponse,
	InsightsBingesRequest,
	InsightsBingesResponse,
	InsightsBridgeArtistsRequest,
	InsightsBridgeArtistsResponse,
	InsightsCompareRequest,
	InsightsCompareResponse,
	InsightsCompareTasteGroupRequest,
	InsightsCompareTasteGroupResponse,
	InsightsDiscoveriesRequest,
	InsightsDiscoveriesResponse,
	InsightsForgottenFavoritesRequest,
	InsightsForgottenFavoritesResponse,
	InsightsGenreBreakdownRequest,
	InsightsGenreBreakdownResponse,
	InsightsGenreEvolutionRequest,
	InsightsGenreEvolutionResponse,
	InsightsHeatmapRequest,
	InsightsHeatmapResponse,
	InsightsHoursRequest,
	InsightsHoursResponse,
	InsightsMoodRequest,
	InsightsMoodResponse,
	InsightsNowPlayingRequest,
	InsightsNowPlayingResponse,
	InsightsObscurityRequest,
	InsightsObscurityResponse,
	InsightsObsessionsRequest,
	InsightsObsessionsResponse,
	InsightsPersonalityRequest,
	InsightsPersonalityResponse,
	InsightsRecommendationsRequest,
	InsightsRecommendationsResponse,
	InsightsStreaksRequest,
	InsightsStreaksResponse,
	InsightsSummaryRequest,
	InsightsSummaryResponse,
	InsightsTrendsRequest,
	InsightsTrendsResponse,
} from './schemas.js'

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

	/**
	 * Evaluates a user's top artists against global Last.fm popularity metrics to calculate
	 * an Obscurity / Hipster score, highlighting hidden gems and mainstream anchors.
	 *
	 * @param {InsightsObscurityRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsObscurityResponse>}
	 */
	getObscurityScore: (params: InsightsObscurityRequest, init?: RequestInit) => Promise<InsightsObscurityResponse>

	/**
	 * Identifies historical favorite artists that the user has stopped listening to
	 * in the recent period.
	 *
	 * @param {InsightsForgottenFavoritesRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsForgottenFavoritesResponse>}
	 */
	getForgottenFavorites: (
		params: InsightsForgottenFavoritesRequest,
		init?: RequestInit,
	) => Promise<InsightsForgottenFavoritesResponse>

	/**
	 * Detects intense listening obsession episodes where a single artist or track heavily dominates
	 * a sliding listening window.
	 *
	 * @param {InsightsObsessionsRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsObsessionsResponse>}
	 */
	getObsessions: (params: InsightsObsessionsRequest, init?: RequestInit) => Promise<InsightsObsessionsResponse>

	/**
	 * Calculates consecutive daily listening streaks, longest continuous streaks, and dry spells.
	 *
	 * @param {InsightsStreaksRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsStreaksResponse>}
	 */
	getListeningStreaks: (params: InsightsStreaksRequest, init?: RequestInit) => Promise<InsightsStreaksResponse>

	/**
	 * Generates a daily listening heatmap formatted with normalized intensity levels (0..4)
	 * suitable for GitHub-style calendar contribution representations.
	 *
	 * @param {InsightsHeatmapRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsHeatmapResponse>}
	 */
	getListeningHeatmap: (params: InsightsHeatmapRequest, init?: RequestInit) => Promise<InsightsHeatmapResponse>

	/**
	 * Analyzes sequential listening history to assess album completion, cohesion score (0-100),
	 * and listener profile ('Album Purist' vs 'Playlist Shuffler').
	 *
	 * @param {InsightsAlbumHabitsRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsAlbumHabitsResponse>}
	 */
	getAlbumHabits: (params: InsightsAlbumHabitsRequest, init?: RequestInit) => Promise<InsightsAlbumHabitsResponse>

	/**
	 * Computes normalized genre breakdown, filtering out noise tags and calculating
	 * Herfindahl-Hirschman (HHI) concentration metrics.
	 *
	 * @param {InsightsGenreBreakdownRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsGenreBreakdownResponse>}
	 */
	getGenreBreakdown: (
		params: InsightsGenreBreakdownRequest,
		init?: RequestInit,
	) => Promise<InsightsGenreBreakdownResponse>

	/**
	 * Tracks shifts in genre percentage shares between two time periods.
	 *
	 * @param {InsightsGenreEvolutionRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsGenreEvolutionResponse>}
	 */
	getGenreEvolution: (
		params: InsightsGenreEvolutionRequest,
		init?: RequestInit,
	) => Promise<InsightsGenreEvolutionResponse>

	/**
	 * Traverses Last.fm similarity graphs from user's top artists to recommend unlistened artists.
	 *
	 * @param {InsightsRecommendationsRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsRecommendationsResponse>}
	 */
	getSmartRecommendations: (
		params: InsightsRecommendationsRequest,
		init?: RequestInit,
	) => Promise<InsightsRecommendationsResponse>

	/**
	 * Finds artists that bridge two distinct genres or tags by computing rank overlap.
	 *
	 * @param {InsightsBridgeArtistsRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsBridgeArtistsResponse>}
	 */
	getBridgeArtists: (params: InsightsBridgeArtistsRequest, init?: RequestInit) => Promise<InsightsBridgeArtistsResponse>

	/**
	 * Compares 3 to 10 users simultaneously, computing pairwise Jaccard compatibility,
	 * consensus artists heard across the group, and identifying taste anchors and outliers.
	 *
	 * @param {InsightsCompareTasteGroupRequest} params
	 * @param {RequestInit} [init]
	 * @returns {Promise<InsightsCompareTasteGroupResponse>}
	 */
	compareTasteGroup: (
		params: InsightsCompareTasteGroupRequest,
		init?: RequestInit,
	) => Promise<InsightsCompareTasteGroupResponse>
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
		getObscurityScore: (params, init) => getObscurityScore(config, params, init),
		getForgottenFavorites: (params, init) => getForgottenFavorites(config, params, init),
		getObsessions: (params, init) => getObsessions(config, params, init),
		getListeningStreaks: (params, init) => getListeningStreaks(config, params, init),
		getListeningHeatmap: (params, init) => getListeningHeatmap(config, params, init),
		getAlbumHabits: (params, init) => getAlbumHabits(config, params, init),
		getGenreBreakdown: (params, init) => getGenreBreakdown(config, params, init),
		getGenreEvolution: (params, init) => getGenreEvolution(config, params, init),
		getSmartRecommendations: (params, init) => getSmartRecommendations(config, params, init),
		getBridgeArtists: (params, init) => getBridgeArtists(config, params, init),
		compareTasteGroup: (params, init) => compareTasteGroup(config, params, init),
	}
}
