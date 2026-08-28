/**
 * compare.ts — compare two ranked artist lists and compute Jaccard similarity.
 */
export interface NamedArtistEntry {
	readonly name: string
	readonly playcount: number
}

export interface CompareArtistsResult {
	readonly aCount: number
	readonly bCount: number
	readonly intersection: readonly string[]
	readonly sharedArtists: ReadonlyArray<{
		readonly name: string
		readonly userAPlaycount: number
		readonly userBPlaycount: number
		readonly weight: number
	}>
	readonly onlyA: readonly string[]
	readonly onlyB: readonly string[]
	readonly jaccard: number
	readonly compatibilityScore: number
}

/**
 * Computes Jaccard similarity: |A ∩ B| / |A ∪ B|.
 */
export function jaccard<T>(a: ReadonlySet<T>, b: ReadonlySet<T>): number {
	if (a.size === 0 && b.size === 0) return 0
	let inter = 0
	for (const x of a) {
		if (b.has(x)) inter++
	}
	const union = a.size + b.size - inter
	if (union === 0) return 0
	return inter / union
}

/**
 * Compares two artist rosters, calculating mutual artist overlap and affinity metrics.
 */
export function compareArtists(a: readonly NamedArtistEntry[], b: readonly NamedArtistEntry[]): CompareArtistsResult {
	const mapA = new Map<string, number>()
	const mapB = new Map<string, number>()
	for (const x of a) mapA.set(x.name, x.playcount)
	for (const x of b) mapB.set(x.name, x.playcount)

	const intersection: string[] = []
	const onlyA: string[] = []
	const onlyB: string[] = []

	for (const [name] of mapA) {
		if (mapB.has(name)) intersection.push(name)
		else onlyA.push(name)
	}
	for (const [name] of mapB) {
		if (!mapA.has(name)) onlyB.push(name)
	}

	const sharedArtists = intersection
		.map((name) => {
			const userAPlaycount = mapA.get(name) ?? 0
			const userBPlaycount = mapB.get(name) ?? 0
			const weight = Math.min(userAPlaycount, userBPlaycount)
			return {
				name,
				userAPlaycount,
				userBPlaycount,
				weight,
			}
		})
		.sort((x, y) => y.weight - x.weight)

	const setA = new Set(mapA.keys())
	const setB = new Set(mapB.keys())
	const j = jaccard(setA, setB)
	const compatibilityScore = Math.round(j * 100)

	return {
		aCount: a.length,
		bCount: b.length,
		intersection: intersection.sort(),
		sharedArtists,
		onlyA: onlyA.sort(),
		onlyB: onlyB.sort(),
		jaccard: Math.round(j * 1000) / 1000,
		compatibilityScore,
	}
}
