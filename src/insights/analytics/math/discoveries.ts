export interface ArtistTimestampItem {
	readonly name: string
	readonly firstSeen: number
}

export interface FindNewArtistsOptions {
	readonly maxResults?: number
}

export function findNewArtists(
	window: readonly ArtistTimestampItem[],
	baseline: ReadonlySet<string>,
	options: FindNewArtistsOptions = {},
): ArtistTimestampItem[] {
	const earliest = new Map<string, number>()
	for (const a of window) {
		const prev = earliest.get(a.name)
		if (prev === undefined || a.firstSeen < prev) {
			earliest.set(a.name, a.firstSeen)
		}
	}

	const newbies: ArtistTimestampItem[] = []
	for (const [name, firstSeen] of earliest) {
		if (!baseline.has(name)) {
			newbies.push({ name, firstSeen })
		}
	}

	newbies.sort((a, b) => a.firstSeen - b.firstSeen)
	const max = options.maxResults ?? newbies.length
	return newbies.slice(0, max)
}
