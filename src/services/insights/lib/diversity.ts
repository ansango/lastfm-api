/**
 * diversity.ts — Shannon entropy + top-N concentration over a count map.
 *
 * Pure: takes a {name: count} map and returns normalized metrics.
 *
 * Shannon entropy H = -Σ pᵢ ln(pᵢ) where pᵢ = countᵢ / total.
 * Normalized H / ln(uniqueCount) puts it on [0, 1].
 */
export type CountMap = Readonly<Record<string, number>>

export interface Diversity {
	readonly total: number
	readonly uniqueCount: number
	/** Raw Shannon entropy in nats. */
	readonly shannon: number
	/** Shannon normalized to [0, 1] by dividing by ln(uniqueCount). 1 = perfectly even. */
	readonly normalized: number
}

/**
 * Computes the Shannon diversity index over a map of item counts.
 */
export function computeDiversity(counts: CountMap): Diversity {
	const entries = Object.entries(counts).filter(([, c]) => c > 0)
	const total = entries.reduce((acc, [, c]) => acc + c, 0)
	const uniqueCount = entries.length
	if (total === 0 || uniqueCount === 0) {
		return { total: 0, uniqueCount: 0, shannon: 0, normalized: 0 }
	}
	if (uniqueCount === 1) {
		return { total, uniqueCount: 1, shannon: 0, normalized: 0 }
	}
	let h = 0
	for (const [, c] of entries) {
		const p = c / total
		h -= p * Math.log(p)
	}
	const normalized = h / Math.log(uniqueCount)
	return { total, uniqueCount, shannon: h, normalized }
}

/**
 * Fraction of total plays consumed by the top-N entries.
 * - N larger than uniqueCount returns 1.
 * - Empty map returns 0.
 */
export function topNShare(counts: CountMap, n: number): number {
	const sorted = Object.values(counts)
		.filter((c) => c > 0)
		.sort((a, b) => b - a)
	if (sorted.length === 0) return 0
	const total = sorted.reduce((acc, c) => acc + c, 0)
	if (total === 0) return 0
	const top = sorted.slice(0, Math.max(0, n)).reduce((acc, c) => acc + c, 0)
	return top / total
}
