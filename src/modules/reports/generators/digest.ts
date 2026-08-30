import { createUserService } from '../../../api/user/service.js'
import type { LastFmConfig } from '../../../core/config.js'
import type {
	ReportRankedEntity,
	ReportRankedTrack,
	ReportsMonthlyDigestRequest,
	ReportsMonthlyDigestResponse,
} from '../schemas.js'

const MONTH_NAMES = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
]

export async function getMonthlyDigest(
	config: LastFmConfig,
	params: ReportsMonthlyDigestRequest,
	init?: RequestInit,
): Promise<ReportsMonthlyDigestResponse> {
	const now = new Date()
	let year = params.year ?? now.getUTCFullYear()
	let month = params.month ?? now.getUTCMonth()
	if (month === 0) {
		month = 12
		year -= 1
	}

	const monthIndex = month - 1
	const monthName = MONTH_NAMES[monthIndex]

	const curFrom = Math.floor(Date.UTC(year, monthIndex, 1, 0, 0, 0) / 1000)
	const curTo = Math.floor(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59) / 1000)

	const prevYear = monthIndex === 0 ? year - 1 : year
	const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1
	const prevFrom = Math.floor(Date.UTC(prevYear, prevMonthIndex, 1, 0, 0, 0) / 1000)
	const prevTo = Math.floor(Date.UTC(prevYear, prevMonthIndex + 1, 0, 23, 59, 59) / 1000)

	const userService = createUserService(config)
	const [curRes, prevRes] = await Promise.all([
		userService.getRecentTracks({ user: params.user, from: String(curFrom), to: String(curTo), limit: 1000 }, init),
		userService.getRecentTracks({ user: params.user, from: String(prevFrom), to: String(prevTo), limit: 1000 }, init),
	])

	const rawCur = curRes.recenttracks?.track ?? []
	const curTracks = (Array.isArray(rawCur) ? rawCur : [rawCur]).filter((t) => !t['@attr']?.nowplaying)
	const rawCurTotal = curRes.recenttracks?.['@attr']?.total
	const curTotal =
		typeof rawCurTotal === 'number'
			? rawCurTotal
			: Number.parseInt(String(rawCurTotal ?? curTracks.length), 10) || curTracks.length

	const rawPrev = prevRes.recenttracks?.track ?? []
	const prevTracks = (Array.isArray(rawPrev) ? rawPrev : [rawPrev]).filter((t) => !t['@attr']?.nowplaying)
	const rawPrevTotal = prevRes.recenttracks?.['@attr']?.total
	const prevTotal =
		typeof rawPrevTotal === 'number'
			? rawPrevTotal
			: Number.parseInt(String(rawPrevTotal ?? prevTracks.length), 10) || prevTracks.length

	const growthPercentage =
		prevTotal > 0 ? Math.round(((curTotal - prevTotal) / prevTotal) * 10000) / 100 : curTotal > 0 ? 100 : 0

	const artistCounts: Record<string, number> = {}
	const trackCounts: Record<string, { artist: string; count: number }> = {}

	for (const t of curTracks) {
		const artistName =
			typeof t.artist === 'object' && t.artist !== null
				? (t.artist['#text'] ?? t.artist.name ?? '')
				: String(t.artist ?? '')
		const trackTitle = t.name ?? ''

		if (artistName) {
			artistCounts[artistName] = (artistCounts[artistName] ?? 0) + 1
		}
		if (trackTitle && artistName) {
			const trkKey = `${trackTitle}:::${artistName}`
			trackCounts[trkKey] = {
				artist: artistName,
				count: (trackCounts[trkKey]?.count ?? 0) + 1,
			}
		}
	}

	const topArtists: ReportRankedEntity[] = Object.entries(artistCounts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5)
		.map(([name, playcount]) => ({
			name,
			playcount,
			percentage: curTotal > 0 ? Math.round((playcount / curTotal) * 10000) / 100 : 0,
		}))

	const topTracks: ReportRankedTrack[] = Object.entries(trackCounts)
		.sort((a, b) => b[1].count - a[1].count)
		.slice(0, 5)
		.map(([key, data]) => {
			const name = key.split(':::')[0]
			return { name, artist: data.artist, playcount: data.count }
		})

	return {
		user: params.user,
		year,
		month,
		monthName,
		totalScrobbles: curTotal,
		previousMonthScrobbles: prevTotal,
		growthPercentage,
		topArtists,
		topTracks,
	}
}
