import { createLibraryService } from '../../../api/library/service.js'
import type { LastFmConfig } from '../../../core/config.js'
import { formatCsvLibrary } from '../formats/csv.js'
import type { ExporterLibraryRequest, ExporterLibraryResponse, ExportLibraryArtistRecord } from '../schemas.js'

export async function exportLibrary(
	config: LastFmConfig,
	params: ExporterLibraryRequest,
	init?: RequestInit,
): Promise<ExporterLibraryResponse> {
	const limit = Math.min(
		1000,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 1000),
	)
	const format = params.format ?? 'json'

	const libraryService = createLibraryService(config)
	const libRes = await libraryService.getArtists({ user: params.user, limit }, init)
	const raw = libRes.artists?.artist ?? []
	const artistList = Array.isArray(raw) ? raw : [raw]

	const records: ExportLibraryArtistRecord[] = []
	for (const a of artistList) {
		const name = a.name ?? ''
		const playcount = Number.parseInt(String(a.playcount ?? '0'), 10) || 0
		const tagcount = a.tagCount ? Number.parseInt(String(a.tagCount), 10) : undefined

		if (name) {
			records.push({
				name,
				playcount,
				tagcount,
				mbid: a.mbid && a.mbid.length > 0 ? a.mbid : undefined,
				url: a.url,
			})
		}
	}

	const content = format === 'csv' ? formatCsvLibrary(records) : JSON.stringify(records, null, 2)

	return {
		user: params.user,
		format,
		totalExported: records.length,
		content,
		artists: records,
	}
}
