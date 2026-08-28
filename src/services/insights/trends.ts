import type { LastFmConfig } from '../../config.js'
import type { InsightsTrendsRequest, InsightsTrendsResponse } from '../insights.schemas.js'
import { createUserService } from '../user.js'
import { resolvePeriod } from './lib/periods.js'
import { diffRankings, type RankedItem } from './lib/trends.js'

/**
 * Calculates ranking differentials (risers, fallers, newcomers, departures)
 * between two time periods for artists, tracks, or albums.
 */
export async function getTrends(
	config: LastFmConfig,
	params: InsightsTrendsRequest,
	init?: RequestInit,
): Promise<InsightsTrendsResponse> {
	const userService = createUserService(config)
	const target = params.target ?? 'artists'
	const currentResolved = resolvePeriod(params.currentPeriod ?? '7day')
	const previousResolved = resolvePeriod(params.previousPeriod ?? '1month')
	const limit = params.limit ?? 30

	let currentItems: RankedItem[] = []
	let previousItems: RankedItem[] = []

	if (target === 'tracks') {
		const [curRes, prevRes] = await Promise.all([
			userService.getTopTracks({ user: params.user, period: currentResolved.lastfm, limit }, init),
			userService.getTopTracks({ user: params.user, period: previousResolved.lastfm, limit }, init),
		])
		currentItems = (curRes.toptracks?.track ?? []).map((t) => {
			const rawArtist = t.artist as Record<string, unknown> | string | undefined
			const artistName =
				typeof rawArtist === 'object' && rawArtist !== null
					? String(rawArtist.name ?? rawArtist['#text'] ?? '')
					: String(rawArtist ?? '')
			return {
				name: artistName.length > 0 ? `${artistName} - ${t.name}` : t.name,
				playcount: Number(t.playcount ?? 0),
			}
		})
		previousItems = (prevRes.toptracks?.track ?? []).map((t) => {
			const rawArtist = t.artist as Record<string, unknown> | string | undefined
			const artistName =
				typeof rawArtist === 'object' && rawArtist !== null
					? String(rawArtist.name ?? rawArtist['#text'] ?? '')
					: String(rawArtist ?? '')
			return {
				name: artistName.length > 0 ? `${artistName} - ${t.name}` : t.name,
				playcount: Number(t.playcount ?? 0),
			}
		})
	} else if (target === 'albums') {
		const [curRes, prevRes] = await Promise.all([
			userService.getTopAlbums({ user: params.user, period: currentResolved.lastfm, limit }, init),
			userService.getTopAlbums({ user: params.user, period: previousResolved.lastfm, limit }, init),
		])
		currentItems = (curRes.topalbums?.album ?? []).map((a) => {
			const rawArtist = a.artist as Record<string, unknown> | string | undefined
			const artistName =
				typeof rawArtist === 'object' && rawArtist !== null
					? String(rawArtist.name ?? rawArtist['#text'] ?? '')
					: typeof rawArtist === 'string'
						? rawArtist
						: ''
			return {
				name: artistName.length > 0 ? `${artistName} - ${a.name}` : a.name,
				playcount: Number(a.playcount ?? 0),
			}
		})
		previousItems = (prevRes.topalbums?.album ?? []).map((a) => {
			const rawArtist = a.artist as Record<string, unknown> | string | undefined
			const artistName =
				typeof rawArtist === 'object' && rawArtist !== null
					? String(rawArtist.name ?? rawArtist['#text'] ?? '')
					: typeof rawArtist === 'string'
						? rawArtist
						: ''
			return {
				name: artistName.length > 0 ? `${artistName} - ${a.name}` : a.name,
				playcount: Number(a.playcount ?? 0),
			}
		})
	} else {
		// default: artists
		const [curRes, prevRes] = await Promise.all([
			userService.getTopArtists({ user: params.user, period: currentResolved.lastfm, limit }, init),
			userService.getTopArtists({ user: params.user, period: previousResolved.lastfm, limit }, init),
		])
		currentItems = (curRes.topartists?.artist ?? []).map((a) => ({
			name: a.name,
			playcount: Number(a.playcount ?? 0),
		}))
		previousItems = (prevRes.topartists?.artist ?? []).map((a) => ({
			name: a.name,
			playcount: Number(a.playcount ?? 0),
		}))
	}

	const diff = diffRankings(currentItems, previousItems, { maxResults: params.maxResults })

	return {
		user: params.user,
		target,
		currentPeriod: currentResolved.lastfm,
		previousPeriod: previousResolved.lastfm,
		...diff,
	}
}
