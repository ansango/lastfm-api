import type { LastFmConfig } from '../../config.js'
import { createArtistService } from '../../core/services/artist.js'
import { createUserService } from '../../core/services/user.js'
import { resolvePeriod } from '../lib/periods.js'
import type {
	InsightGenreEntry,
	InsightGenreShift,
	InsightsGenreBreakdownRequest,
	InsightsGenreBreakdownResponse,
	InsightsGenreEvolutionRequest,
	InsightsGenreEvolutionResponse,
} from '../schemas.js'

const NOISE_TAGS = new Set([
	'seen live',
	'favorites',
	'favourite',
	'favourites',
	'spotify',
	'awesome',
	'beautiful',
	'love',
	'all',
	'albums i own',
	'under 2000 listeners',
	'my favorites',
	'tracks i like',
	'female vocalists',
	'male vocalists',
	'singer-songwriter',
	'cover',
	'soundtrack',
	'ost',
	'instrumental',
	'classic',
	'80s',
	'90s',
	'70s',
	'60s',
	'00s',
	'2000s',
	'2010s',
	'2020s',
	'american',
	'british',
	'uk',
	'us',
	'german',
	'swedish',
	'japanese',
	'spanish',
])

function isCleanGenre(tag: string): boolean {
	const lower = tag.toLowerCase().trim()
	if (lower.length < 2 || lower.length > 30) return false
	if (NOISE_TAGS.has(lower)) return false
	if (/^\d+s?$/.test(lower)) return false
	return true
}

function categorizeSpecialization(hhi: number): {
	specializationLevel: 'Highly Concentrated' | 'Moderately Diversified' | 'Musical Omnivore'
	description: string
} {
	if (hhi >= 2500) {
		return {
			specializationLevel: 'Highly Concentrated',
			description: 'Strong specialization in one or two primary musical genres.',
		}
	}
	if (hhi >= 1500) {
		return {
			specializationLevel: 'Moderately Diversified',
			description: 'Healthy rotation across several favorite genres with moderate focus.',
		}
	}
	return {
		specializationLevel: 'Musical Omnivore',
		description: 'Wide, eclectically distributed taste spanning many diverse musical styles.',
	}
}

async function computeRawGenreBreakdown(
	config: LastFmConfig,
	user: string,
	period: string,
	artistLimit: number,
	init?: RequestInit,
): Promise<{ totalWeight: number; genreMap: Map<string, number> }> {
	const resolved = resolvePeriod(period)
	const userService = createUserService(config)
	const artistService = createArtistService(config)

	const topRes = await userService.getTopArtists({ user, period: resolved.lastfm, limit: artistLimit }, init)
	const rawArtists = topRes.topartists?.artist ?? []
	const artistList = Array.isArray(rawArtists) ? rawArtists : [rawArtists]

	const genreMap = new Map<string, number>()
	let totalWeight = 0

	const promises = artistList.map(async (art) => {
		const name = art.name
		const playcount = Number.parseInt(art.playcount ?? '0', 10) || 1
		try {
			const tagRes = await artistService.getTopTags({ artist: name }, init)
			const rawTags = tagRes.toptags?.tag ?? []
			const tagList = (Array.isArray(rawTags) ? rawTags : [rawTags]).filter((t) => typeof t.name === 'string')
			const cleanTags = tagList
				.map((t) => t.name.toLowerCase().trim())
				.filter(isCleanGenre)
				.slice(0, 5)

			for (let i = 0; i < cleanTags.length; i++) {
				const tag = cleanTags[i]
				const rankWeight = 5 - i
				const weight = playcount * rankWeight
				genreMap.set(tag, (genreMap.get(tag) ?? 0) + weight)
			}
		} catch {
			// ignore tag fetch failure for individual artist
		}
	})

	await Promise.allSettled(promises)

	for (const w of genreMap.values()) {
		totalWeight += w
	}

	return { totalWeight, genreMap }
}

/**
 * Computes normalized genre breakdown, noise-filtering meta tags and calculating HHI concentration.
 */
export async function getGenreBreakdown(
	config: LastFmConfig,
	params: InsightsGenreBreakdownRequest,
	init?: RequestInit,
): Promise<InsightsGenreBreakdownResponse> {
	const limit = Math.min(
		50,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 20),
	)
	const topGenresLimit = Math.min(
		30,
		typeof params.topGenresLimit === 'string'
			? Number.parseInt(params.topGenresLimit, 10)
			: (params.topGenresLimit ?? 10),
	)
	const period = params.period ?? 'overall'

	const { totalWeight, genreMap } = await computeRawGenreBreakdown(config, params.user, period, limit, init)

	if (totalWeight === 0 || genreMap.size === 0) {
		const { specializationLevel, description } = categorizeSpecialization(0)
		return {
			user: params.user,
			period,
			totalGenresDetected: 0,
			hhiIndex: 0,
			specializationLevel,
			description,
			genres: [],
		}
	}

	const sortedGenres = Array.from(genreMap.entries()).sort((a, b) => b[1] - a[1])
	const allEntries: InsightGenreEntry[] = sortedGenres.map(([name, weight]) => ({
		name,
		weight,
		percentage: Math.round((weight / totalWeight) * 10000) / 100,
	}))

	// Calculate HHI
	let hhi = 0
	for (const g of allEntries) {
		hhi += g.percentage * g.percentage
	}
	const hhiIndex = Math.round(hhi)
	const { specializationLevel, description } = categorizeSpecialization(hhiIndex)

	return {
		user: params.user,
		period,
		totalGenresDetected: allEntries.length,
		hhiIndex,
		specializationLevel,
		description,
		genres: allEntries.slice(0, topGenresLimit),
	}
}

/**
 * Tracks shifts in genre percentage shares between two periods.
 */
export async function getGenreEvolution(
	config: LastFmConfig,
	params: InsightsGenreEvolutionRequest,
	init?: RequestInit,
): Promise<InsightsGenreEvolutionResponse> {
	const limit = Math.min(
		50,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 20),
	)
	const currentPeriod = params.currentPeriod ?? '1month'
	const previousPeriod = params.previousPeriod ?? '12month'

	const [curData, prevData] = await Promise.all([
		computeRawGenreBreakdown(config, params.user, currentPeriod, limit, init),
		computeRawGenreBreakdown(config, params.user, previousPeriod, limit, init),
	])

	const curPcts = new Map<string, number>()
	if (curData.totalWeight > 0) {
		for (const [name, w] of curData.genreMap.entries()) {
			curPcts.set(name, Math.round((w / curData.totalWeight) * 10000) / 100)
		}
	}

	const prevPcts = new Map<string, number>()
	if (prevData.totalWeight > 0) {
		for (const [name, w] of prevData.genreMap.entries()) {
			prevPcts.set(name, Math.round((w / prevData.totalWeight) * 10000) / 100)
		}
	}

	const allKeys = new Set([...curPcts.keys(), ...prevPcts.keys()])
	const shifts: InsightGenreShift[] = []
	const newGenres: Array<{ name: string; currentPct: number }> = []

	for (const name of allKeys) {
		const currentPct = curPcts.get(name) ?? 0
		const previousPct = prevPcts.get(name) ?? 0
		const deltaPct = Math.round((currentPct - previousPct) * 100) / 100

		if (previousPct === 0 && currentPct > 0) {
			newGenres.push({ name, currentPct })
		}

		if (currentPct > 0 || previousPct > 0) {
			shifts.push({ name, currentPct, previousPct, deltaPct })
		}
	}

	const risingGenres = shifts.filter((s) => s.deltaPct > 0).sort((a, b) => b.deltaPct - a.deltaPct)
	const fadingGenres = shifts.filter((s) => s.deltaPct < 0).sort((a, b) => a.deltaPct - b.deltaPct)

	return {
		user: params.user,
		currentPeriod,
		previousPeriod,
		risingGenres: risingGenres.slice(0, 10),
		fadingGenres: fadingGenres.slice(0, 10),
		newGenres: newGenres.sort((a, b) => b.currentPct - a.currentPct).slice(0, 10),
	}
}
