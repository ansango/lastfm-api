import type { LastFmConfig } from '../../config.js'
import { createUserService } from '../../core/services/user.js'
import { formatCsvScrobbles } from '../formats/csv.js'
import { formatJsonLines } from '../formats/jsonl.js'
import { formatListenBrainz } from '../formats/listenbrainz.js'
import type { ExporterScrobblesRequest, ExporterScrobblesResponse, ExportScrobbleRecord } from '../schemas.js'

export async function exportScrobbles(
	config: LastFmConfig,
	params: ExporterScrobblesRequest,
	init?: RequestInit,
): Promise<ExporterScrobblesResponse> {
	const limit = Math.min(
		1000,
		typeof params.limit === 'string' ? Number.parseInt(params.limit, 10) : (params.limit ?? 1000),
	)
	const format = params.format ?? 'json'

	const userService = createUserService(config)
	const recentRes = await userService.getRecentTracks(
		{
			user: params.user,
			from: params.from ? String(params.from) : undefined,
			to: params.to ? String(params.to) : undefined,
			limit,
		},
		init,
	)

	const rawTracks = recentRes.recenttracks?.track ?? []
	const tracks = (Array.isArray(rawTracks) ? rawTracks : [rawTracks]).filter((t) => !t['@attr']?.nowplaying)

	const records: ExportScrobbleRecord[] = []
	let oldestUts: number | undefined
	let newestUts: number | undefined

	for (const t of tracks) {
		const artist =
			typeof t.artist === 'object' && t.artist !== null
				? (t.artist['#text'] ?? t.artist.name ?? '')
				: String(t.artist ?? '')
		const track = t.name ?? ''
		const album = typeof t.album === 'object' && t.album !== null ? (t.album['#text'] ?? '') : String(t.album ?? '')
		const uts = Number.parseInt(t.date?.uts ?? '0', 10)
		const timestamp = t.date?.['#text'] ?? (uts > 0 ? new Date(uts * 1000).toISOString() : '')
		const mbid = t.mbid && t.mbid.length > 0 ? t.mbid : undefined

		if (artist && track && uts > 0) {
			records.push({
				artist,
				track,
				album: album.length > 0 ? album : undefined,
				uts,
				timestamp,
				mbid,
			})

			if (oldestUts === undefined || uts < oldestUts) {
				oldestUts = uts
			}
			if (newestUts === undefined || uts > newestUts) {
				newestUts = uts
			}
		}
	}

	// Calculate next checkpoint timestamp for resuming backward pagination
	const nextCheckpointUts = oldestUts && oldestUts > 1 ? oldestUts - 1 : undefined

	let content = ''
	if (format === 'jsonl') {
		content = formatJsonLines(records)
	} else if (format === 'csv') {
		content = formatCsvScrobbles(records)
	} else if (format === 'listenbrainz') {
		content = formatListenBrainz(records)
	} else {
		content = JSON.stringify(records, null, 2)
	}

	return {
		user: params.user,
		format,
		totalExported: records.length,
		from: params.from,
		to: params.to,
		oldestUts,
		newestUts,
		nextCheckpointUts,
		content,
		scrobbles: records,
	}
}
