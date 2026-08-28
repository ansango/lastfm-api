import type { ExportLibraryArtistRecord, ExportLovedTrackRecord, ExportScrobbleRecord } from '../schemas.js'

function escapeCsv(val: string): string {
	if (val.includes(',') || val.includes('"') || val.includes('\n')) {
		return `"${val.replace(/"/g, '""')}"`
	}
	return val
}

export function formatCsvScrobbles(records: ExportScrobbleRecord[]): string {
	const header = 'Artist,Track,Album,UTS,Timestamp,MBID'
	const rows = records.map((r) =>
		[
			escapeCsv(r.artist),
			escapeCsv(r.track),
			escapeCsv(r.album ?? ''),
			String(r.uts),
			escapeCsv(r.timestamp),
			escapeCsv(r.mbid ?? ''),
		].join(','),
	)
	return [header, ...rows].join('\n')
}

export function formatCsvLovedTracks(records: ExportLovedTrackRecord[]): string {
	const header = 'Artist,Track,Date,UTS,URL'
	const rows = records.map((r) =>
		[escapeCsv(r.artist), escapeCsv(r.name), escapeCsv(r.date ?? ''), String(r.uts ?? ''), escapeCsv(r.url ?? '')].join(
			',',
		),
	)
	return [header, ...rows].join('\n')
}

export function formatCsvLibrary(records: ExportLibraryArtistRecord[]): string {
	const header = 'Artist,Playcount,Tagcount,MBID,URL'
	const rows = records.map((r) =>
		[
			escapeCsv(r.name),
			String(r.playcount),
			String(r.tagcount ?? ''),
			escapeCsv(r.mbid ?? ''),
			escapeCsv(r.url ?? ''),
		].join(','),
	)
	return [header, ...rows].join('\n')
}
