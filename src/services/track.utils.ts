import type { LastFmConfig } from '../config.js'
import type { BatchTracksScrobbleRequest, TrackScrobbleRequest } from './track.schemas.js'

export const MAX_BATCH_SCROBBLE_SIZE = 50

/**
 * Resolves the session key for a scrobble request and validates it.
 * Returns a sanitized error message that does not include the
 * session key or any other request value.
 */
function resolveSessionKey(config: LastFmConfig, requestSk: string | undefined): string {
	const sk = requestSk ?? config.sessionKey
	if (!sk) {
		throw new Error(
			'A session key (`sk`) is required to scrobble. Pass `sk` in the request params or set `sessionKey` on the LastFmConfig.',
		)
	}
	return sk
}

/**
 * Build the wire-format params for a single `track.scrobble` call. The
 * result is ready to be passed to `signedPost` as `params`. The transport
 * adds `method`, `api_key`, `api_sig`, and `format=json` and computes the
 * signature.
 */
export function buildScrobbleParams(
	config: LastFmConfig,
	{ artist, track, album, timestamp, sk }: TrackScrobbleRequest,
): Record<string, string> {
	const resolvedSk = resolveSessionKey(config, sk)
	const params: Record<string, string> = {
		artist,
		track,
		timestamp: String(timestamp),
		sk: resolvedSk,
	}
	if (album) params.album = album
	return params
}

/**
 * Build the wire-format params for a batch `track.scrobble` call. Last.fm
 * accepts at most 50 tracks per request and uses indexed keys such as
 * `artist[0]`, `track[0]`, `timestamp[0]`, `album[0]`. The transport adds
 * `method`, `api_key`, `api_sig`, and `format=json` and computes the
 * signature.
 */
export function buildBatchScrobbleParams(
	config: LastFmConfig,
	{ tracks, sk }: BatchTracksScrobbleRequest,
): Record<string, string> {
	if (tracks.length === 0) {
		throw new Error('At least one track is required for batch scrobble')
	}
	if (tracks.length > MAX_BATCH_SCROBBLE_SIZE) {
		throw new Error(`Max ${MAX_BATCH_SCROBBLE_SIZE} tracks per request (got ${tracks.length})`)
	}
	const resolvedSk = resolveSessionKey(config, sk)
	const params: Record<string, string> = { sk: resolvedSk }
	tracks.forEach((t, i) => {
		params[`artist[${i}]`] = t.artist
		params[`track[${i}]`] = t.track
		params[`timestamp[${i}]`] = String(t.timestamp)
		if (t.album) params[`album[${i}]`] = t.album
	})
	return params
}
