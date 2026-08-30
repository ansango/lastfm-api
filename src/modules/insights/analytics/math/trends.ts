export interface RankedItem {
	readonly name: string
	readonly playcount: number
}

export interface RankedItemWithDelta extends RankedItem {
	readonly currentRank: number
	readonly previousRank?: number
	readonly deltaRank: number // positive = moved up
	readonly deltaCount: number // current - previous
}

export interface DiffRankingsOptions {
	readonly maxResults?: number
}

export interface RankingDiffResult {
	readonly risers: RankedItemWithDelta[]
	readonly fallers: RankedItemWithDelta[]
	readonly newcomers: RankedItemWithDelta[]
	readonly departures: RankedItem[]
}

function indexByName(list: readonly RankedItem[]): Map<string, { idx: number; item: RankedItem }> {
	const m = new Map<string, { idx: number; item: RankedItem }>()
	list.forEach((item, idx) => {
		m.set(item.name, { idx, item })
	})
	return m
}

export function diffRankings(
	current: readonly RankedItem[],
	previous: readonly RankedItem[],
	options: DiffRankingsOptions = {},
): RankingDiffResult {
	const curIdx = indexByName(current)
	const prevIdx = indexByName(previous)

	const risers: RankedItemWithDelta[] = []
	const fallers: RankedItemWithDelta[] = []
	const newcomers: RankedItemWithDelta[] = []

	current.forEach((cur, i) => {
		const prev = prevIdx.get(cur.name)
		if (!prev) {
			newcomers.push({
				name: cur.name,
				playcount: cur.playcount,
				currentRank: i + 1,
				deltaRank: 0,
				deltaCount: cur.playcount,
			})
			return
		}
		const deltaRank = prev.idx - i
		const deltaCount = cur.playcount - prev.item.playcount
		if (deltaRank > 0 || deltaCount > 0) {
			risers.push({
				name: cur.name,
				playcount: cur.playcount,
				currentRank: i + 1,
				previousRank: prev.idx + 1,
				deltaRank,
				deltaCount,
			})
		} else if (deltaRank < 0 || deltaCount < 0) {
			fallers.push({
				name: cur.name,
				playcount: cur.playcount,
				currentRank: i + 1,
				previousRank: prev.idx + 1,
				deltaRank,
				deltaCount,
			})
		}
	})

	const departures: RankedItem[] = []
	previous.forEach((prev) => {
		if (!curIdx.has(prev.name)) {
			departures.push(prev)
		}
	})

	risers.sort((a, b) => a.currentRank - b.currentRank)
	fallers.sort((a, b) => a.currentRank - b.currentRank)
	newcomers.sort((a, b) => a.currentRank - b.currentRank)

	const max = options.maxResults ?? Number.POSITIVE_INFINITY
	return {
		risers: risers.slice(0, max),
		fallers: fallers.slice(0, max),
		newcomers: newcomers.slice(0, max),
		departures: departures.slice(0, max),
	}
}
