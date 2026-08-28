/**
 * hours.ts — bucket timestamps by hour-of-day (0..23) and weekday (0..6).
 *
 * Weekday indexing follows ISO convention: Mon=0 .. Sun=6.
 * All bucketing is in UTC for deterministic behavior.
 */
export const WEEKDAY_LABELS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
export const WEEKDAY_LABELS_ES = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] as const

export interface HourBucket {
	/** Hour of the day in 24h format, 0–23 (UTC). */
	readonly hour: number
	/** Day of the week, 0 = Monday … 6 = Sunday. */
	readonly weekday: number
}

/**
 * Convert a UNIX-seconds timestamp to (hour, weekday).
 */
export function bucketTimestamp(unixSeconds: number): HourBucket {
	const date = new Date(unixSeconds * 1000)
	const hour = date.getUTCHours()
	// Map JS getUTCDay() (Sun=0..Sat=6) to Mon=0..Sun=6.
	const jsDow = date.getUTCDay()
	const weekday = (jsDow + 6) % 7
	return { hour, weekday }
}

export interface HourHistogram {
	readonly total: number
	/** Counts per hour, index = hour (0..23). Length always 24. */
	readonly byHour: number[]
	/** Counts per weekday, index = Mon(0)..Sun(6). Length always 7. */
	readonly byWeekday: number[]
	/** Hour with the highest count, or null when total === 0. */
	readonly peakHour: number | null
	readonly peakHourCount: number
	readonly peakWeekday: number | null
	readonly peakWeekdayCount: number
	readonly peakWeekdayLabel: string | null
	/** Time-of-day shares [0..1] */
	readonly nightShare: number // 00:00 - 06:00
	readonly morningShare: number // 06:00 - 12:00
	readonly afternoonShare: number // 12:00 - 18:00
	readonly eveningShare: number // 18:00 - 24:00
	readonly weekendShare: number // Sat + Sun
}

function indexOfMax(arr: readonly number[]): number | null {
	if (arr.length === 0) return null
	let maxIdx = 0
	let maxVal = arr[0] ?? 0
	for (let i = 1; i < arr.length; i++) {
		const val = arr[i] ?? 0
		if (val > maxVal) {
			maxVal = val
			maxIdx = i
		}
	}
	return maxVal > 0 ? maxIdx : null
}

export function buildHourHistogram(timestamps: readonly number[]): HourHistogram {
	const byHour = new Array<number>(24).fill(0)
	const byWeekday = new Array<number>(7).fill(0)

	for (const ts of timestamps) {
		const b = bucketTimestamp(ts)
		byHour[b.hour] = (byHour[b.hour] ?? 0) + 1
		byWeekday[b.weekday] = (byWeekday[b.weekday] ?? 0) + 1
	}

	const total = timestamps.length
	const peakHourIdx = indexOfMax(byHour)
	const peakWeekdayIdx = indexOfMax(byWeekday)

	const nightCount = byHour.slice(0, 6).reduce((a, b) => a + b, 0)
	const morningCount = byHour.slice(6, 12).reduce((a, b) => a + b, 0)
	const afternoonCount = byHour.slice(12, 18).reduce((a, b) => a + b, 0)
	const eveningCount = byHour.slice(18, 24).reduce((a, b) => a + b, 0)
	const weekendCount = (byWeekday[5] ?? 0) + (byWeekday[6] ?? 0)

	return {
		total,
		byHour,
		byWeekday,
		peakHour: peakHourIdx,
		peakHourCount: peakHourIdx !== null ? (byHour[peakHourIdx] ?? 0) : 0,
		peakWeekday: peakWeekdayIdx,
		peakWeekdayCount: peakWeekdayIdx !== null ? (byWeekday[peakWeekdayIdx] ?? 0) : 0,
		peakWeekdayLabel: peakWeekdayIdx !== null ? (WEEKDAY_LABELS_EN[peakWeekdayIdx] ?? null) : null,
		nightShare: total > 0 ? nightCount / total : 0,
		morningShare: total > 0 ? morningCount / total : 0,
		afternoonShare: total > 0 ? afternoonCount / total : 0,
		eveningShare: total > 0 ? eveningCount / total : 0,
		weekendShare: total > 0 ? weekendCount / total : 0,
	}
}
