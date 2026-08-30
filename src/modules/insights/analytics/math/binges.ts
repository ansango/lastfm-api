export interface ScrobbleItem {
	readonly artist: string
	readonly track: string
	readonly uts: number
}

export type BingesTrackKey = 'artist' | 'track'

export interface BingeItem {
	readonly artist: string
	readonly track?: string
	readonly length: number
	readonly startUts: number
	readonly endUts: number
	readonly durationSeconds: number
}

export interface FindBingesOptions {
	readonly minLength?: number
	readonly maxGapSeconds?: number
	readonly trackKey?: BingesTrackKey
	readonly maxResults?: number
}

function keyOf(s: ScrobbleItem, k: BingesTrackKey): string {
	return k === 'artist' ? s.artist : `${s.artist}::${s.track}`
}

export function findBinges(scrobbles: readonly ScrobbleItem[], options: FindBingesOptions = {}): BingeItem[] {
	const minLength = options.minLength ?? 2
	const maxGap = options.maxGapSeconds ?? 3600
	const trackKey: BingesTrackKey = options.trackKey ?? 'artist'

	const out: BingeItem[] = []
	let runKey: string | null = null
	let runArtist: string | null = null
	let runTrack: string | null = null
	let runStart = 0
	let runEnd = 0
	let runLen = 0

	const flush = () => {
		if (runLen >= minLength && runKey !== null && runArtist !== null) {
			out.push({
				artist: runArtist,
				...(trackKey === 'track' && runTrack !== null ? { track: runTrack } : {}),
				length: runLen,
				startUts: runStart,
				endUts: runEnd,
				durationSeconds: runEnd - runStart,
			})
		}
		runKey = null
		runLen = 0
	}

	for (const s of scrobbles) {
		const k = keyOf(s, trackKey)
		if (runKey === null) {
			runKey = k
			runArtist = s.artist
			runTrack = s.track
			runStart = s.uts
			runEnd = s.uts
			runLen = 1
			continue
		}
		if (k !== runKey || s.uts - runEnd > maxGap) {
			flush()
			runKey = k
			runArtist = s.artist
			runTrack = s.track
			runStart = s.uts
			runEnd = s.uts
			runLen = 1
			continue
		}
		runEnd = s.uts
		runLen++
	}
	flush()

	out.sort((a, b) => b.length - a.length || b.endUts - a.endUts)
	return options.maxResults !== undefined ? out.slice(0, options.maxResults) : out
}
