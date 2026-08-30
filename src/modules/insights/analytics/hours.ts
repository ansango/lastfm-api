import { createUserService } from '@/api/user/index.js'
import type { LastFmConfig } from '@/core/config.js'
import type { InsightsHoursRequest, InsightsHoursResponse } from '../schemas.js'
import { buildHourHistogram } from './math/hours.js'

export async function getHoursHistogram(
	config: LastFmConfig,
	params: InsightsHoursRequest,
	init?: RequestInit,
): Promise<InsightsHoursResponse> {
	const userService = createUserService(config)
	const to = params.to ?? Math.floor(Date.now() / 1000)
	const from = params.from ?? (params.sinceDays ? to - params.sinceDays * 86400 : to - 30 * 86400)
	const maxPages = params.maxPages ?? 50

	const timestamps: number[] = []
	let page = 1

	while (page <= maxPages) {
		const res = await userService.getRecentTracks(
			{
				user: params.user,
				from: String(from),
				to: String(to),
				limit: 200,
				page,
			},
			init,
		)

		const tracks = res.recenttracks?.track ?? []
		for (const t of tracks) {
			const uts = t.date?.uts
			if (uts) {
				const num = Number(uts)
				if (!Number.isNaN(num)) timestamps.push(num)
			}
		}

		if (tracks.length < 200) break
		page++
	}

	const histogram = buildHourHistogram(timestamps)

	return {
		user: params.user,
		from,
		to,
		...histogram,
	}
}
