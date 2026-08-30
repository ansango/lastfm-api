import { createUserService } from '../../../api/user/index.js'
import type { LastFmConfig } from '../../../core/config.js'
import type {
	InsightHeatmapDay,
	InsightsHeatmapRequest,
	InsightsHeatmapResponse,
	InsightsStreaksRequest,
	InsightsStreaksResponse,
} from '../schemas.js'

function formatUtcDate(utsSeconds: number): string {
	const d = new Date(utsSeconds * 1000)
	const year = d.getUTCFullYear()
	const month = String(d.getUTCMonth() + 1).padStart(2, '0')
	const day = String(d.getUTCDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export async function getListeningStreaks(
	config: LastFmConfig,
	params: InsightsStreaksRequest,
	init?: RequestInit,
): Promise<InsightsStreaksResponse> {
	const limit = Math.min(
		1000,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 500),
	)

	const userService = createUserService(config)
	const recentRes = await userService.getRecentTracks({ user: params.user, limit }, init)
	const rawTracks = recentRes.recenttracks?.track ?? []
	const tracks = (Array.isArray(rawTracks) ? rawTracks : [rawTracks]).filter((t) => !t['@attr']?.nowplaying)

	if (tracks.length === 0) {
		return {
			user: params.user,
			currentStreakDays: 0,
			longestStreakDays: 0,
			longestDrySpellDays: 0,
			activeDaysCount: 0,
			totalDaysEvaluated: 0,
			averageDailyScrobbles: 0,
		}
	}

	const dailyCounts: Record<string, number> = {}
	const timestamps: number[] = []

	for (const t of tracks) {
		const uts = Number.parseInt(String(t.date?.uts ?? '0'), 10)
		if (uts > 0) {
			timestamps.push(uts)
			const dateStr = formatUtcDate(uts)
			dailyCounts[dateStr] = (dailyCounts[dateStr] ?? 0) + 1
		}
	}

	if (timestamps.length === 0) {
		return {
			user: params.user,
			currentStreakDays: 0,
			longestStreakDays: 0,
			longestDrySpellDays: 0,
			activeDaysCount: 0,
			totalDaysEvaluated: 0,
			averageDailyScrobbles: 0,
		}
	}

	timestamps.sort((a, b) => a - b)
	const minDate = new Date(timestamps[0] * 1000)
	const maxDate = new Date(timestamps[timestamps.length - 1] * 1000)

	const cur = new Date(Date.UTC(minDate.getUTCFullYear(), minDate.getUTCMonth(), minDate.getUTCDate()))
	const end = new Date(Date.UTC(maxDate.getUTCFullYear(), maxDate.getUTCMonth(), maxDate.getUTCDate()))

	const fullDaysSeries: Array<{ date: string; active: boolean; count: number }> = []

	while (cur <= end) {
		const dateStr = cur.toISOString().slice(0, 10)
		const count = dailyCounts[dateStr] ?? 0
		fullDaysSeries.push({ date: dateStr, active: count > 0, count })
		cur.setUTCDate(cur.getUTCDate() + 1)
	}

	let currentStreak = 0
	let longestStreak = 0
	let runningStreak = 0
	let longestDrySpell = 0
	let runningDrySpell = 0
	let activeDaysCount = 0
	let totalScrobbles = 0

	for (const day of fullDaysSeries) {
		if (day.active) {
			activeDaysCount += 1
			totalScrobbles += day.count
			runningStreak += 1
			if (runningStreak > longestStreak) {
				longestStreak = runningStreak
			}
			runningDrySpell = 0
		} else {
			runningStreak = 0
			runningDrySpell += 1
			if (runningDrySpell > longestDrySpell) {
				longestDrySpell = runningDrySpell
			}
		}
	}

	for (let i = fullDaysSeries.length - 1; i >= 0; i--) {
		if (fullDaysSeries[i].active) {
			currentStreak += 1
		} else {
			break
		}
	}

	const avgDaily = activeDaysCount > 0 ? Math.round((totalScrobbles / activeDaysCount) * 10) / 10 : 0

	return {
		user: params.user,
		currentStreakDays: currentStreak,
		longestStreakDays: longestStreak,
		longestDrySpellDays: longestDrySpell,
		activeDaysCount,
		totalDaysEvaluated: fullDaysSeries.length,
		averageDailyScrobbles: avgDaily,
	}
}

export async function getListeningHeatmap(
	config: LastFmConfig,
	params: InsightsHeatmapRequest,
	init?: RequestInit,
): Promise<InsightsHeatmapResponse> {
	const limit = Math.min(
		1000,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 500),
	)
	const daysCount = Math.max(7, Math.min(365, params.days ?? 90))

	const userService = createUserService(config)
	const recentRes = await userService.getRecentTracks({ user: params.user, limit }, init)
	const rawTracks = recentRes.recenttracks?.track ?? []
	const tracks = (Array.isArray(rawTracks) ? rawTracks : [rawTracks]).filter((t) => !t['@attr']?.nowplaying)

	const dailyCounts: Record<string, number> = {}
	let totalScrobbles = 0

	for (const t of tracks) {
		const uts = Number.parseInt(String(t.date?.uts ?? '0'), 10)
		if (uts > 0) {
			const dateStr = formatUtcDate(uts)
			dailyCounts[dateStr] = (dailyCounts[dateStr] ?? 0) + 1
			totalScrobbles += 1
		}
	}

	const now = new Date()
	const calendarDays: Array<{ date: string; count: number }> = []
	for (let i = daysCount - 1; i >= 0; i--) {
		const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
		const dateStr = d.toISOString().slice(0, 10)
		calendarDays.push({ date: dateStr, count: dailyCounts[dateStr] ?? 0 })
	}

	let maxDailyCount = 0
	let busiestDay: { date: string; count: number } | null = null

	for (const day of calendarDays) {
		if (day.count > maxDailyCount) {
			maxDailyCount = day.count
			busiestDay = { date: day.date, count: day.count }
		}
	}

	const q1 = Math.max(1, Math.round(maxDailyCount * 0.25))
	const q2 = Math.max(2, Math.round(maxDailyCount * 0.5))
	const q3 = Math.max(3, Math.round(maxDailyCount * 0.75))

	const heatmapDays: InsightHeatmapDay[] = calendarDays.map((d) => {
		let level: 0 | 1 | 2 | 3 | 4 = 0
		if (d.count > 0) {
			if (d.count >= q3) level = 4
			else if (d.count >= q2) level = 3
			else if (d.count >= q1) level = 2
			else level = 1
		}
		return {
			date: d.date,
			count: d.count,
			level,
		}
	})

	return {
		user: params.user,
		totalScrobbles,
		maxDailyCount,
		busiestDay,
		days: heatmapDays,
	}
}
