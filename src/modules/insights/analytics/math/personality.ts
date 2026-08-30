/**
 * personality.ts — classify the user into a listening personality archetype.
 */

export type ArchetypeId = 'Devotee' | 'Explorer' | 'Drifter' | 'DJ' | 'Nocturnal' | 'Archivist'

export const ARCHETYPE_ORDER: readonly ArchetypeId[] = [
	'Devotee',
	'Explorer',
	'Drifter',
	'DJ',
	'Nocturnal',
	'Archivist',
]

export interface PersonalityFeatures {
	readonly totalScrobbles: number
	readonly uniqueArtists: number
	readonly top1Share: number
	readonly top3Share: number
	readonly top5Share: number
	readonly normalizedDiversity: number
	readonly newArtistsLast30d: number
	readonly totalArtistsLast30d: number
	readonly nightHourShare: number
	readonly morningHourShare: number
	readonly weekdayShare: number
}

export interface PersonalityResult {
	readonly scores: Record<ArchetypeId, number>
	readonly winner: ArchetypeId
	readonly reasons: readonly string[]
}

function clamp01(n: number): number {
	return Math.max(0, Math.min(1, n))
}

export const ARCHETYPE_INFO: Record<ArchetypeId, { name: string; emoji: string; blurb: string }> = {
	Devotee: {
		name: 'The Devotee',
		emoji: '🛐',
		blurb: 'Extreme loyalty to your favorite artists. High concentration, low dispersion.',
	},
	Explorer: {
		name: 'The Explorer',
		emoji: '🧭',
		blurb: 'Always discovering new music. Your musical radar is constantly searching.',
	},
	Drifter: {
		name: 'The Drifter',
		emoji: '🍂',
		blurb: 'Balanced listening across varied genres without strong fixations.',
	},
	DJ: {
		name: 'The DJ',
		emoji: '🎧',
		blurb: 'High listening velocity across a broad and rotating selection of artists.',
	},
	Nocturnal: {
		name: 'The Nocturnal',
		emoji: '🌙',
		blurb: 'Your music comes alive at night. The late hours are your peak listening zone.',
	},
	Archivist: {
		name: 'The Archivist',
		emoji: '📚',
		blurb: 'A massive, eclectic, and deep personal music library with balanced play counts.',
	},
}

export function scoreArchetypes(features: PersonalityFeatures): PersonalityResult {
	const scores: Record<ArchetypeId, number> = {
		Devotee: 0,
		Explorer: 0,
		Drifter: 0,
		DJ: 0,
		Nocturnal: 0,
		Archivist: 0,
	}
	const reasons: Record<ArchetypeId, string[]> = {
		Devotee: [],
		Explorer: [],
		Drifter: [],
		DJ: [],
		Nocturnal: [],
		Archivist: [],
	}

	// Devotee: high top1Share + low diversity + small unique roster
	{
		const focus = clamp01((features.top1Share - 0.15) / 0.5)
		const monotony = clamp01((0.6 - features.normalizedDiversity) / 0.6)
		const smallness = clamp01((20 - features.uniqueArtists) / 20)
		scores.Devotee = Math.round((0.5 * focus + 0.3 * monotony + 0.2 * smallness) * 100) / 100
		if (focus > 0.5)
			reasons.Devotee.push(`Top artist accounts for ${(features.top1Share * 100).toFixed(0)}% of scrobbles.`)
		if (monotony > 0.5) reasons.Devotee.push(`Low diversity score (${features.normalizedDiversity.toFixed(2)}).`)
	}

	// Explorer: high diversity + many new artists relative to total roster
	{
		const diversity = features.normalizedDiversity
		const newRatio =
			features.totalArtistsLast30d > 0 ? clamp01(features.newArtistsLast30d / features.totalArtistsLast30d) : 0
		scores.Explorer = Math.round((0.5 * diversity + 0.5 * newRatio) * 100) / 100
		if (diversity > 0.7) reasons.Explorer.push(`High diversity score (${diversity.toFixed(2)}).`)
		if (newRatio > 0.2)
			reasons.Explorer.push(
				`${features.newArtistsLast30d} new artists discovered this month out of ${features.totalArtistsLast30d} played.`,
			)
	}

	// Drifter: middle of the road on diversity and low novelty
	{
		const midDiversity = 1 - Math.abs(features.normalizedDiversity - 0.65) / 0.35
		const lowNovelty = clamp01(
			(0.15 - (features.totalArtistsLast30d > 0 ? features.newArtistsLast30d / features.totalArtistsLast30d : 0)) /
				0.15,
		)
		const lowFocus = clamp01((0.4 - features.top3Share) / 0.4)
		scores.Drifter = Math.round((0.4 * midDiversity + 0.3 * lowNovelty + 0.3 * lowFocus) * 100) / 100
		if (midDiversity > 0.7) reasons.Drifter.push(`Moderate diversity (${features.normalizedDiversity.toFixed(2)}).`)
	}

	// DJ: high velocity + many artists
	{
		const velocity = clamp01((features.totalScrobbles - 200) / 1800)
		const breadth = clamp01((features.uniqueArtists - 20) / 80)
		scores.DJ = Math.round((0.5 * velocity + 0.3 * breadth + 0.2 * features.normalizedDiversity) * 100) / 100
		if (velocity > 0.5) reasons.DJ.push(`${features.totalScrobbles} total scrobbles in the window.`)
	}

	// Nocturnal: nightHourShare dominant
	{
		const nightness = clamp01((features.nightHourShare - 0.4) / 0.2)
		const antiDaytime = clamp01((0.3 - features.morningHourShare) / 0.3)
		scores.Nocturnal = Math.round((0.7 * nightness + 0.3 * antiDaytime) * 100) / 100
		if (nightness > 0.5)
			reasons.Nocturnal.push(`${(features.nightHourShare * 100).toFixed(0)}% of scrobbles occurred during night hours.`)
	}

	// Archivist: massive library, spread across many artists
	{
		const massive = clamp01((features.totalScrobbles - 1500) / 3500)
		const hugeRoster = clamp01((features.uniqueArtists - 100) / 200)
		const spread = clamp01((1 - features.top5Share) / 0.5)
		scores.Archivist = Math.round((0.4 * massive + 0.4 * hugeRoster + 0.2 * spread) * 100) / 100
		if (hugeRoster > 0.5) reasons.Archivist.push(`${features.uniqueArtists} unique artists in window.`)
	}

	let winner: ArchetypeId = 'Devotee'
	let best = -Number.POSITIVE_INFINITY
	for (const id of ARCHETYPE_ORDER) {
		const s = scores[id]
		if (s > best) {
			best = s
			winner = id
		}
	}

	return { scores, winner, reasons: reasons[winner] ?? [] }
}
