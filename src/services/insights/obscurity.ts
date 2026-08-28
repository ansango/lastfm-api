import type { LastFmConfig } from '../../config.js'
import { createArtistService } from '../artist.js'
import type { InsightObscureArtist, InsightsObscurityRequest, InsightsObscurityResponse } from '../insights.schemas.js'
import { createUserService } from '../user.js'
import { resolvePeriod } from './lib/periods.js'

/**
 * Calculates obscurity score (0-100) for a given global listener count.
 * Logarithmic mapping where:
 * <= 10 listeners -> 100 (Ultra obscure)
 * 100 listeners -> ~82
 * 1,000 listeners -> ~65
 * 10,000 listeners -> ~47
 * 100,000 listeners -> ~30
 * 1,000,000 listeners -> ~12
 * >= 5,000,000 listeners -> 0 (Mega mainstream)
 */
export function calculateArtistObscurity(listeners: number): number {
	if (listeners <= 1) return 100
	const minLog = 1 // log10(10)
	const maxLog = 6.7 // log10(5,000,000)
	const logVal = Math.log10(Math.max(1, listeners))
	const popularity = Math.min(100, Math.max(0, ((logVal - minLog) / (maxLog - minLog)) * 100))
	return Math.round((100 - popularity) * 100) / 100
}

/**
 * Categorizes the overall obscurity score.
 */
export function categorizeObscurity(score: number): {
	category: 'Purist Underground' | 'Indie Explorer' | 'Balanced Listener' | 'Mainstream Enthusiast' | 'Chart Chaser'
	description: string
} {
	if (score >= 80) {
		return {
			category: 'Purist Underground',
			description: 'Deep underground affinity with predominantly niche, indie, and obscure artists.',
		}
	}
	if (score >= 60) {
		return {
			category: 'Indie Explorer',
			description: 'Strong indie and underground inclination with minimal mainstream exposure.',
		}
	}
	if (score >= 40) {
		return {
			category: 'Balanced Listener',
			description: 'Eclectic balance between popular cultural staples and underground acts.',
		}
	}
	if (score >= 20) {
		return {
			category: 'Mainstream Enthusiast',
			description: 'Tilted towards widely recognized artists, established headliners, and chart staples.',
		}
	}
	return {
		category: 'Chart Chaser',
		description: 'Dominated by global superstar acts, viral sensations, and mega-hits.',
	}
}

/**
 * Evaluates the user's top artists against global Last.fm popularity metrics to calculate
 * an Obscurity / Hipster score.
 */
export async function getObscurityScore(
	config: LastFmConfig,
	params: InsightsObscurityRequest,
	init?: RequestInit,
): Promise<InsightsObscurityResponse> {
	const limit = Math.min(
		50,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 20),
	)
	const resolved = resolvePeriod(params.period ?? 'overall')
	const period = params.period ?? 'overall'

	const userService = createUserService(config)
	const artistService = createArtistService(config)

	// Fetch top artists for user
	const topRes = await userService.getTopArtists({ user: params.user, period: resolved.lastfm, limit }, init)
	const rawArtists = topRes.topartists?.artist ?? []
	const artistList = Array.isArray(rawArtists) ? rawArtists : [rawArtists]

	if (artistList.length === 0) {
		const { category, description } = categorizeObscurity(50)
		return {
			user: params.user,
			period,
			obscurityScore: 50,
			category,
			description,
			totalArtistsEvaluated: 0,
			averageGlobalListeners: 0,
			medianGlobalListeners: 0,
			hiddenGems: [],
			mainstreamAnchors: [],
			artists: [],
		}
	}

	// Fetch global artist info in parallel
	const infoPromises = artistList.map(async (art) => {
		const name = art.name
		const userPlaycount = Number.parseInt(art.playcount ?? '0', 10) || 0
		try {
			const infoRes = await artistService.getInfo({ artist: name }, init)
			const globalListeners = Number.parseInt(infoRes.artist?.stats?.listeners ?? '0', 10) || 0
			const globalPlaycount = Number.parseInt(infoRes.artist?.stats?.playcount ?? '0', 10) || 0
			const obscurityScore = calculateArtistObscurity(globalListeners)
			return {
				name,
				userPlaycount,
				globalListeners,
				globalPlaycount,
				obscurityScore,
				url: infoRes.artist?.url,
			}
		} catch {
			// Fallback if individual artist info fails
			const globalListeners = 100000
			const obscurityScore = calculateArtistObscurity(globalListeners)
			return {
				name,
				userPlaycount,
				globalListeners,
				globalPlaycount: 0,
				obscurityScore,
			}
		}
	})

	const evaluatedArtists: InsightObscureArtist[] = await Promise.all(infoPromises)

	// Calculate weighted obscurity score
	const totalPlaycount = evaluatedArtists.reduce((acc, a) => acc + a.userPlaycount, 0)
	let weightedScoreSum = 0
	for (const a of evaluatedArtists) {
		const weight = totalPlaycount > 0 ? a.userPlaycount / totalPlaycount : 1 / evaluatedArtists.length
		weightedScoreSum += a.obscurityScore * weight
	}
	const overallObscurity = Math.round(weightedScoreSum * 100) / 100
	const { category, description } = categorizeObscurity(overallObscurity)

	// Global listeners stats
	const listenerCounts = evaluatedArtists.map((a) => a.globalListeners).sort((a, b) => a - b)
	const avgListeners = Math.round(listenerCounts.reduce((acc, l) => acc + l, 0) / evaluatedArtists.length)
	const mid = Math.floor(listenerCounts.length / 2)
	const medianListeners =
		listenerCounts.length % 2 !== 0
			? listenerCounts[mid]
			: Math.round((listenerCounts[mid - 1] + listenerCounts[mid]) / 2)

	// Hidden gems: global listeners < 100,000 (or lowest 3 if all are >= 100k)
	const gems = evaluatedArtists
		.filter((a) => a.globalListeners < 100000)
		.sort((a, b) => a.globalListeners - b.globalListeners)
	const hiddenGems =
		gems.length > 0
			? gems.slice(0, 5)
			: [...evaluatedArtists].sort((a, b) => a.globalListeners - b.globalListeners).slice(0, 3)

	// Mainstream anchors: top 3 highest global listener counts
	const mainstreamAnchors = [...evaluatedArtists].sort((a, b) => b.globalListeners - a.globalListeners).slice(0, 3)

	return {
		user: params.user,
		period,
		obscurityScore: overallObscurity,
		category,
		description,
		totalArtistsEvaluated: evaluatedArtists.length,
		averageGlobalListeners: avgListeners,
		medianGlobalListeners: medianListeners,
		hiddenGems,
		mainstreamAnchors,
		artists: evaluatedArtists.sort((a, b) => a.obscurityScore - b.obscurityScore),
	}
}
