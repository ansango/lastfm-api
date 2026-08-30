export type CanonicalPeriod = 'overall' | '7day' | '1month' | '3month' | '6month' | '12month'

export type InsightsPeriodInput = CanonicalPeriod | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface ResolvedPeriod {
	readonly lastfm: CanonicalPeriod
	readonly from?: number // UNIX seconds; undefined for 'overall'
	readonly to: number // UNIX seconds
	readonly label: string // human label, e.g. "this week"
}

const SECOND = 1
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const LASTFM_BY_PERIOD: Record<string, CanonicalPeriod> = {
	daily: '7day',
	weekly: '7day',
	monthly: '1month',
	yearly: '12month',
	'7day': '7day',
	'1month': '1month',
	'3month': '3month',
	'6month': '6month',
	'12month': '12month',
	overall: 'overall',
}

const LABEL_BY_PERIOD: Record<string, string> = {
	daily: 'last 24 hours',
	weekly: 'this week',
	monthly: 'this month',
	yearly: 'this year',
	'7day': 'last 7 days',
	'1month': 'last 30 days',
	'3month': 'last 90 days',
	'6month': 'last 180 days',
	'12month': 'last 365 days',
	overall: 'all time',
}

const WINDOW_SECONDS: Record<string, number> = {
	daily: 1 * DAY,
	weekly: 7 * DAY,
	monthly: 30 * DAY,
	yearly: 365 * DAY,
	'7day': 7 * DAY,
	'1month': 30 * DAY,
	'3month': 90 * DAY,
	'6month': 180 * DAY,
	'12month': 365 * DAY,
}

export function periodToLastfm(p: string): CanonicalPeriod {
	return LASTFM_BY_PERIOD[p] ?? '7day'
}

export function resolvePeriod(p: string = '7day', clock: () => number = Date.now): ResolvedPeriod {
	const lastfm = periodToLastfm(p)
	const label = LABEL_BY_PERIOD[p] ?? LABEL_BY_PERIOD[lastfm] ?? p
	const to = Math.floor(clock() / 1000)

	if (p === 'overall' || lastfm === 'overall') {
		return {
			lastfm: 'overall',
			to,
			label: 'all time',
		}
	}

	const span = WINDOW_SECONDS[p] ?? WINDOW_SECONDS[lastfm] ?? 7 * DAY
	const from = to - span
	return {
		lastfm,
		from,
		to,
		label,
	}
}
