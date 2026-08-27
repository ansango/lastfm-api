import type { LastFmConfig } from '../config.js';
import type { BatchTracksScrobbleRequest, TrackScrobbleRequest } from './track.schemas.js';
export declare const MAX_BATCH_SCROBBLE_SIZE = 50;
/**
 * Build the wire-format params for a single `track.scrobble` call. The
 * result is ready to be passed to `signedPost` as `params`. The transport
 * adds `method`, `api_key`, `api_sig`, and `format=json` and computes the
 * signature.
 */
export declare function buildScrobbleParams(config: LastFmConfig, { artist, track, album, timestamp, sk }: TrackScrobbleRequest): Record<string, string>;
/**
 * Build the wire-format params for a batch `track.scrobble` call. Last.fm
 * accepts at most 50 tracks per request and uses indexed keys such as
 * `artist[0]`, `track[0]`, `timestamp[0]`, `album[0]`. The transport adds
 * `method`, `api_key`, `api_sig`, and `format=json` and computes the
 * signature.
 */
export declare function buildBatchScrobbleParams(config: LastFmConfig, { tracks, sk }: BatchTracksScrobbleRequest): Record<string, string>;
//# sourceMappingURL=track.utils.d.ts.map