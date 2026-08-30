import type { LastFmConfig } from '../../config.js'
import { createUserService } from '../../user/index.js'
import type {
	InsightAlbumEntry,
	InsightArtistEntry,
	InsightsDiversityStats,
	InsightsSummaryRequest,
	InsightsSummaryResponse,
	InsightTagEntry,
	InsightTrackEntry,
} from '../schemas.js'
import { computeDiversity, topNShare } from './math/diversity.js'
import { resolvePeriod } from './math/periods.js'

function normalizeArtist(raw: Record<string, unknown>): InsightArtistEntry {
	const playcount = Number(raw.playcount ?? 0)
	return {
		name: String(raw.name ?? ''),
		playcount: Number.isNaN(playcount) ? 0 : playcount,
		mbid: typeof raw.mbid === 'string' && raw.mbid.length > 0 ? raw.mbid : undefined,
		url: typeof raw.url === 'string' && raw.url.length > 0 ? raw.url : undefined,
		image: Array.isArray(raw.image) ? (raw.image as InsightArtistEntry['image']) : undefined,
	}
}

function normalizeTrack(raw: Record<string, unknown>): InsightTrackEntry {
	const playcount = Number(raw.playcount ?? 0)
	const rawArtist = raw.artist as Record<string, unknown> | string | undefined
	const artist =
		typeof rawArtist === 'object' && rawArtist !== null
			? String(rawArtist.name ?? rawArtist['#text'] ?? '')
			: String(rawArtist ?? '')
	return {
		name: String(raw.name ?? ''),
		artist,
		playcount: Number.isNaN(playcount) ? 0 : playcount,
		mbid: typeof raw.mbid === 'string' && raw.mbid.length > 0 ? raw.mbid : undefined,
		url: typeof raw.url === 'string' && raw.url.length > 0 ? raw.url : undefined,
		image: Array.isArray(raw.image) ? (raw.image as InsightTrackEntry['image']) : undefined,
	}
}

function normalizeAlbum(raw: Record<string, unknown>): InsightAlbumEntry {
	const playcount = Number(raw.playcount ?? 0)
	const rawArtist = raw.artist as Record<string, unknown> | string | undefined
	const artist =
		typeof rawArtist === 'object' && rawArtist !== null
			? String(rawArtist.name ?? rawArtist['#text'] ?? '')
			: typeof rawArtist === 'string'
				? rawArtist
				: undefined
	return {
		name: String(raw.name ?? ''),
		artist,
		playcount: Number.isNaN(playcount) ? 0 : playcount,
		mbid: typeof raw.mbid === 'string' && raw.mbid.length > 0 ? raw.mbid : undefined,
		url: typeof raw.url === 'string' && raw.url.length > 0 ? raw.url : undefined,
		image: Array.isArray(raw.image) ? (raw.image as InsightAlbumEntry['image']) : undefined,
	}
}

function normalizeTag(raw: Record<string, unknown>): InsightTagEntry {
	const count = Number(raw.count ?? 0)
	return {
		name: String(raw.name ?? ''),
		count: Number.isNaN(count) ? 0 : count,
		url: typeof raw.url === 'string' && raw.url.length > 0 ? raw.url : undefined,
	}
}

export async function getSummary(
	config: LastFmConfig,
	params: InsightsSummaryRequest,
	init?: RequestInit,
): Promise<InsightsSummaryResponse> {
	const resolved = resolvePeriod(params.period)
	const userService = createUserService(config)

	const [artistsRes, tracksRes, albumsRes, tagsRes] = await Promise.all([
		userService.getTopArtists({ user: params.user, period: resolved.lastfm, limit: params.limit }, init),
		userService.getTopTracks({ user: params.user, period: resolved.lastfm, limit: params.limit }, init),
		userService.getTopAlbums({ user: params.user, period: resolved.lastfm, limit: params.limit }, init),
		userService.getTopTags({ user: params.user, limit: params.limit }, init),
	])

	const topArtists = (artistsRes.topartists?.artist ?? []).map((a) =>
		normalizeArtist(a as unknown as Record<string, unknown>),
	)
	const topTracks = (tracksRes.toptracks?.track ?? []).map((t) =>
		normalizeTrack(t as unknown as Record<string, unknown>),
	)
	const topAlbums = (albumsRes.topalbums?.album ?? []).map((a) =>
		normalizeAlbum(a as unknown as Record<string, unknown>),
	)
	const topTags = (tagsRes.toptags?.tag ?? []).map((t) => normalizeTag(t as unknown as Record<string, unknown>))

	const totalScrobbles = topArtists.reduce((acc, a) => acc + (a.playcount ?? 0), 0)

	let diversity: InsightsDiversityStats | undefined
	if (topArtists.length >= 2) {
		const counts: Record<string, number> = {}
		for (const a of topArtists) {
			if (a.playcount && a.playcount > 0) {
				counts[a.name] = a.playcount
			}
		}
		const d = computeDiversity(counts)
		diversity = {
			shannon: d.shannon,
			normalized: d.normalized,
			top1Share: topNShare(counts, 1),
			top3Share: topNShare(counts, 3),
			top5Share: topNShare(counts, 5),
			uniqueArtists: d.uniqueCount,
		}
	}

	return {
		user: params.user,
		period: params.period ?? resolved.lastfm,
		label: resolved.label,
		lastfmPeriod: resolved.lastfm,
		from: resolved.from,
		to: resolved.to,
		topArtists,
		topTracks,
		topAlbums,
		topTags,
		totalScrobbles,
		diversity,
	}
}
