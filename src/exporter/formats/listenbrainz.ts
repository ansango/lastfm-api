import type { ExportScrobbleRecord } from '../schemas.js'

export function formatListenBrainz(records: ExportScrobbleRecord[]): string {
	const payload = {
		listen_type: 'import',
		payload: records.map((r) => ({
			listened_at: r.uts,
			track_metadata: {
				artist_name: r.artist,
				track_name: r.track,
				release_name: r.album,
				additional_info: {
					lastfm_timestamp: r.timestamp,
					recording_mbid: r.mbid,
				},
			},
		})),
	}
	return JSON.stringify(payload, null, 2)
}
