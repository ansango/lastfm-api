import { createUserService } from '@/api/user/service.js'
import type { LastFmConfig } from '@/core/config.js'
import { formatCsvLovedTracks } from '../formats/csv.js'
import type { ExporterLovedTracksRequest, ExporterLovedTracksResponse, ExportLovedTrackRecord } from '../schemas.js'

export async function exportLovedTracks(
	config: LastFmConfig,
	params: ExporterLovedTracksRequest,
	init?: RequestInit,
): Promise<ExporterLovedTracksResponse> {
	const limit = Math.min(
		1000,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 1000),
	)
	const format = params.format ?? 'json'

	const userService = createUserService(config)
	const lovedRes = await userService.getLovedTracks({ user: params.user, limit }, init)
	const raw = lovedRes.lovedtracks?.track ?? []
	const trackList = Array.isArray(raw) ? raw : [raw]

	const records: ExportLovedTrackRecord[] = []
	for (const t of trackList) {
		const name = t.name ?? ''
		const artist = typeof t.artist === 'object' && t.artist !== null ? (t.artist.name ?? '') : String(t.artist ?? '')
		const date = t.date?.['#text']
		const uts = t.date?.uts ? Number.parseInt(String(t.date.uts), 10) : undefined

		if (name && artist) {
			records.push({
				name,
				artist,
				url: t.url,
				date,
				uts,
			})
		}
	}

	const content = format === 'csv' ? formatCsvLovedTracks(records) : JSON.stringify(records, null, 2)

	return {
		user: params.user,
		format,
		totalExported: records.length,
		content,
		tracks: records,
	}
}
