import { createArtistService } from '../../artist/index.js'
import type { LastFmConfig } from '../../config.js'
import { createUserService } from '../../user/index.js'
import type { InsightsNowPlayingRequest, InsightsNowPlayingResponse } from '../schemas.js'

export function stripWiki(s: string): string {
	return s
		.replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, '$2')
		.replace(/\[\[([^\]]+)\]\]/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim()
}

export function summarizeBio(bio: string | undefined, maxChars: number): string {
	if (!bio) return ''
	const clean = stripWiki(bio)
	if (clean.length <= maxChars) return clean
	const cut = clean.slice(0, maxChars)
	const lastSpace = cut.lastIndexOf(' ')
	return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`
}

export function findBestImage(images: unknown): string | undefined {
	if (!Array.isArray(images)) return undefined
	const order = ['mega', 'extralarge', 'large', 'medium', 'small']
	for (const size of order) {
		const hit = images.find((i) => i?.size === size && typeof i['#text'] === 'string' && i['#text'].length > 0)
		if (hit) return hit['#text']
	}
	return undefined
}

export async function getNowPlaying(
	config: LastFmConfig,
	params: InsightsNowPlayingRequest,
	init?: RequestInit,
): Promise<InsightsNowPlayingResponse> {
	const similarLimit =
		typeof params.similarLimit === 'string' ? Number.parseInt(params.similarLimit, 10) : (params.similarLimit ?? 3)
	const bioMaxChars = params.bioMaxChars ?? 320

	const userService = createUserService(config)
	const artistService = createArtistService(config)

	const recentRes = await userService.getRecentTracks({ user: params.user, limit: 1 }, init)
	const tracks = recentRes.recenttracks?.track ?? []

	if (tracks.length === 0) {
		return {
			user: params.user,
			nowPlaying: false,
			track: { name: '' },
			artist: { name: '' },
			bio: '',
			similar: [],
		}
	}

	const last = tracks[0] as Record<string, unknown>
	const attr = (last['@attr'] ?? recentRes.recenttracks?.['@attr']) as { nowplaying?: string | boolean } | undefined
	const nowPlaying = attr?.nowplaying === 'true' || attr?.nowplaying === true

	const trackName = String(last.name ?? '')
	const rawArtist = last.artist as Record<string, unknown> | string | undefined
	const artistName =
		typeof rawArtist === 'object' && rawArtist !== null
			? String(rawArtist.name ?? rawArtist['#text'] ?? '')
			: String(rawArtist ?? '')

	const rawAlbum = last.album as Record<string, unknown> | string | undefined
	const album =
		typeof rawAlbum === 'object' && rawAlbum !== null
			? String(rawAlbum['#text'] ?? rawAlbum.title ?? '')
			: typeof rawAlbum === 'string'
				? rawAlbum
				: undefined

	const image = findBestImage(last.image)

	let bio = ''
	let artistMbid: string | undefined =
		typeof rawArtist === 'object' && rawArtist !== null ? (rawArtist.mbid as string | undefined) : undefined
	let artistUrl: string | undefined =
		typeof rawArtist === 'object' && rawArtist !== null ? (rawArtist.url as string | undefined) : undefined
	const similar: Array<{ name: string; url?: string; match?: number }> = []

	if (artistName.length > 0) {
		try {
			const [infoRes, similarRes] = await Promise.all([
				artistService.getInfo({ artist: artistName }, init),
				artistService.getSimilar({ artist: artistName, limit: similarLimit }, init),
			])

			const bioSummary = infoRes.artist?.bio?.summary ?? infoRes.artist?.bio?.content ?? ''
			bio = summarizeBio(bioSummary, bioMaxChars)

			if (!artistMbid && infoRes.artist?.mbid) {
				artistMbid = infoRes.artist.mbid
			}
			if (!artistUrl && infoRes.artist?.url) {
				artistUrl = infoRes.artist.url
			}

			const rawSimilar = similarRes.similarartists?.artist ?? []
			for (const s of rawSimilar.slice(0, similarLimit)) {
				const matchNum = Number(s.match)
				similar.push({
					name: s.name,
					url: s.url || undefined,
					match: Number.isNaN(matchNum) ? undefined : matchNum,
				})
			}
		} catch {
			// Best-effort enrichment
		}
	}

	return {
		user: params.user,
		nowPlaying,
		track: {
			name: trackName,
			mbid: typeof last.mbid === 'string' && last.mbid.length > 0 ? last.mbid : undefined,
			url: typeof last.url === 'string' && last.url.length > 0 ? last.url : undefined,
		},
		artist: {
			name: artistName,
			mbid: artistMbid || undefined,
			url: artistUrl || undefined,
		},
		album: album || undefined,
		image,
		bio,
		similar,
	}
}
