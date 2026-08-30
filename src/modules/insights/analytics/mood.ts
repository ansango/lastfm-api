import { createArtistService } from '../../../api/artist/index.js'
import { createUserService } from '../../../api/user/index.js'
import type { LastFmConfig } from '../../../core/config.js'
import type { InsightsMoodRequest, InsightsMoodResponse } from '../schemas.js'
import { classifyMood } from './math/mood.js'
import { resolvePeriod } from './math/periods.js'

export async function getMood(
	config: LastFmConfig,
	params: InsightsMoodRequest,
	init?: RequestInit,
): Promise<InsightsMoodResponse> {
	const userService = createUserService(config)
	const artistService = createArtistService(config)
	const resolved = resolvePeriod(params.period ?? '7day')
	const topArtistsLimit =
		typeof params.topArtistsLimit === 'string'
			? Number.parseInt(params.topArtistsLimit, 10)
			: (params.topArtistsLimit ?? 10)

	const [topArtistsRes, userTagsRes] = await Promise.all([
		userService.getTopArtists({ user: params.user, period: resolved.lastfm, limit: topArtistsLimit }, init),
		userService.getTopTags({ user: params.user, limit: 50 }, init),
	])

	const artistNames = (topArtistsRes.topartists?.artist ?? [])
		.map((a) => a.name)
		.filter((name): name is string => typeof name === 'string' && name.length > 0)
		.slice(0, topArtistsLimit)

	const userTags = (userTagsRes.toptags?.tag ?? [])
		.map((t) => t.name)
		.filter((name): name is string => typeof name === 'string' && name.length > 0)

	const perArtist = await Promise.allSettled(
		artistNames.map((name) =>
			artistService
				.getTopTags({ artist: name }, init)
				.then((res) =>
					(res.toptags?.tag ?? []).map((t) => t.name).filter((n): n is string => typeof n === 'string' && n.length > 0),
				),
		),
	)

	const artistTags: string[] = []
	let artistHits = 0
	for (const r of perArtist) {
		if (r.status === 'fulfilled') {
			artistTags.push(...r.value)
			artistHits++
		}
	}

	const allTags = [...userTags, ...artistTags]
	const profile = classifyMood(allTags)

	const primarySource: InsightsMoodResponse['primarySource'] =
		userTags.length === 0 ? 'artist-tags' : artistTags.length === 0 ? 'user-tags' : 'mixed'

	return {
		user: params.user,
		period: resolved.lastfm,
		axes: profile.axes,
		label: profile.label,
		categories: [...profile.categories],
		confidence: profile.confidence,
		tagSourceCount: allTags.length,
		artistCount: artistHits,
		primarySource,
	}
}
