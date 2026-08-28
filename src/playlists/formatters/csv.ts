import type { PlaylistTrackItem } from '../schemas.js'

function escapeCsv(val: string): string {
	if (val.includes(',') || val.includes('"') || val.includes('\n')) {
		return `"${val.replace(/"/g, '""')}"`
	}
	return val
}

export function formatCsv(tracks: PlaylistTrackItem[]): string {
	const header = 'Artist,Track,Album,DurationSeconds,SourceReason'
	const rows = tracks.map((t) =>
		[
			escapeCsv(t.artist),
			escapeCsv(t.name),
			escapeCsv(t.album ?? ''),
			String(t.duration ?? ''),
			escapeCsv(t.sourceReason ?? ''),
		].join(','),
	)
	return [header, ...rows].join('\n')
}
