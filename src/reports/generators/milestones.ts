import type { LastFmConfig } from '../../config.js'
import { createUserService } from '../../user/service.js'
import type { ReportMilestoneItem, ReportsMilestonesRequest, ReportsMilestonesResponse } from '../schemas.js'

function formatUtcDate(uts: number): string {
	const d = new Date(uts * 1000)
	return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export async function getMilestones(
	config: LastFmConfig,
	params: ReportsMilestonesRequest,
	init?: RequestInit,
): Promise<ReportsMilestonesResponse> {
	const targets = (params.targets ?? [1000, 5000, 10000, 25000, 50000, 100000]).sort((a, b) => a - b)
	const sampleLimit = Math.min(
		1000,
		typeof params.sampleLimit === 'string' ? Number.parseInt(params.sampleLimit, 10) : (params.sampleLimit ?? 1000),
	)

	const userService = createUserService(config)
	const [userRes, recentRes] = await Promise.all([
		userService.getInfo({ user: params.user }, init),
		userService.getRecentTracks({ user: params.user, limit: sampleLimit }, init),
	])

	const rawPlaycount = userRes.user?.playcount
	const totalScrobbles =
		typeof rawPlaycount === 'number' ? rawPlaycount : Number.parseInt(String(rawPlaycount ?? '0'), 10) || 0
	const regTimestamp =
		Number.parseInt(String(userRes.user?.registered?.unixtime ?? '0'), 10) ||
		Math.floor(Date.now() / 1000) - 365 * 24 * 3600
	const accountAgeDays = Math.max(1, Math.floor((Date.now() / 1000 - regTimestamp) / (24 * 3600)))
	const dailyRate = totalScrobbles > 0 ? totalScrobbles / accountAgeDays : 10

	const rawTracks = recentRes.recenttracks?.track ?? []
	const tracks = (Array.isArray(rawTracks) ? rawTracks : [rawTracks]).filter((t) => !t['@attr']?.nowplaying)

	const milestones: ReportMilestoneItem[] = []

	for (const target of targets) {
		if (target <= totalScrobbles) {
			const indexFromLatest = totalScrobbles - target
			if (indexFromLatest >= 0 && indexFromLatest < tracks.length) {
				const hit = tracks[indexFromLatest]
				const artist =
					typeof hit.artist === 'object' && hit.artist !== null
						? (hit.artist['#text'] ?? hit.artist.name ?? '')
						: String(hit.artist ?? '')
				const name = hit.name ?? ''
				const uts = Number.parseInt(String(hit.date?.uts ?? '0'), 10) || 0
				milestones.push({
					milestone: target,
					track: name,
					artist,
					timestamp: uts,
					date: formatUtcDate(uts),
				})
			}
		}
	}

	const nextTarget = targets.find((t) => t > totalScrobbles) ?? (Math.floor(totalScrobbles / 10000) + 1) * 10000
	const remainingScrobbles = Math.max(0, nextTarget - totalScrobbles)
	const estimatedDaysRemaining = Math.round((remainingScrobbles / Math.max(1, dailyRate)) * 10) / 10
	const projectedUts = Math.floor(Date.now() / 1000) + Math.round(estimatedDaysRemaining * 24 * 3600)

	return {
		user: params.user,
		totalScrobbles,
		milestones,
		nextMilestone: {
			target: nextTarget,
			remainingScrobbles,
			estimatedDaysRemaining,
			projectedDate: formatUtcDate(projectedUts),
		},
	}
}
