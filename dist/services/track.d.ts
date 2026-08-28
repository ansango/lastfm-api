import type { LastFmConfig } from '../config.js';
import type { BatchTracksScrobbleRequest, TrackAddTagsRequest, TrackGetCorrectionRequest, TrackGetCorrectionResponse, TrackGetInfoRequest, TrackGetInfoResponse, TrackGetSimilarRequest, TrackGetSimilarResponse, TrackGetTagsRequest, TrackGetTagsResponse, TrackGetTopTagsRequest, TrackGetTopTagsResponse, TrackLoveRequest, TrackRemoveTagRequest, TrackScrobbleRequest, TrackScrobbleResponse, TrackSearchRequest, TrackSearchResponse, TrackUpdateNowPlayingRequest, TrackUpdateNowPlayingResponse } from './track.schemas.js';
export interface TrackService {
    /**
     * Get the metadata for a track on Last.fm using the artist/track name or a musicbrainz id.
     * @param {TrackGetInfoRequest} params
     * @param {RequestInit} init
     * @returns {Promise<TrackGetInfoResponse>}
     * https://www.last.fm/api/show/track.getInfo
     * */
    getInfo: (params: TrackGetInfoRequest, init?: RequestInit) => Promise<TrackGetInfoResponse>;
    /**
     * Get the tags applied by an individual user to a track on Last.fm.
     * @param {TrackGetSimilarRequest} params
     * @param {RequestInit} init
     * @returns {Promise<TrackGetSimilarResponse>}
     * https://www.last.fm/api/show/track.getSimilar
     * */
    getSimilar: (params: TrackGetSimilarRequest, init?: RequestInit) => Promise<TrackGetSimilarResponse>;
    /**
     * Get the tags applied by an individual user to a track on Last.fm.
     * @param {TrackGetTagsRequest} params
     * @param {RequestInit} init
     * @returns {Promise<TrackGetTagsResponse>}
     * https://www.last.fm/api/show/track.getTags
     * */
    getTags: (params: TrackGetTagsRequest, init?: RequestInit) => Promise<TrackGetTagsResponse>;
    /**
     * Get the top tags for a track on Last.fm, ordered by popularity.
     *  @param {TrackGetTopTagsRequest} params
     * @param {RequestInit} init
     * @returns {Promise<TrackGetTopTagsResponse>}
     * https://www.last.fm/api/show/track.getTopTags
     * */
    getTopTags: (params: TrackGetTopTagsRequest, init?: RequestInit) => Promise<TrackGetTopTagsResponse>;
    /**
     * Get the canonical correction for a misspelled or noncanonical
     * track (with its artist). Returns the list of corrections Last.fm
     * would apply to the provided input, including the corrected track
     * and artist identities plus per-field "corrected" flags and a
     * positional `index` attribute. Unsigned GET — no `sk` or
     * `api_sig` are sent.
     * @param {TrackGetCorrectionRequest} params
     * @param {RequestInit} init
     * @returns {Promise<TrackGetCorrectionResponse>}
     * https://www.last.fm/api/show/track.getCorrection
     */
    getCorrection: (params: TrackGetCorrectionRequest, init?: RequestInit) => Promise<TrackGetCorrectionResponse>;
    /**
     * Search for a track by track name. Returns track matches sorted by relevance.
     * @param {TrackSearchRequest} params
     * @param {RequestInit} init
     * @returns {Promise<TrackSearchResponse>}
     * https://www.last.fm/api/show/track.search
     * */
    search: (params: TrackSearchRequest, init?: RequestInit) => Promise<TrackSearchResponse>;
    /**
     * Scrobble a track. Submits a track play to the Last.fm.
     * Canonical Last.fm method name: `track.scrobble`.
     *
     * **Requires authentication.** Pass `sk` in `params.sk` (preferred for
     * ad-hoc calls) or set `sessionKey` on the `LastFmConfig` when
     * constructing the client (preferred for long-lived clients). Obtain a
     * session key via `auth.getToken` + the browser-based `auth.getSession`
     * flow (works for self-service API keys), or via `auth.getMobileSession`
     * (requires a mobile-class API key — not self-service).
     *
     * @param {TrackScrobbleRequest} params - `artist`, `track`, `timestamp`, and optional `sk` and `album`
     * @param {RequestInit} init
     * @returns {Promise<TrackScrobbleResponse>}
     * https://www.last.fm/api/show/track.scrobble
     */
    scrobble: (params: TrackScrobbleRequest, init?: RequestInit) => Promise<TrackScrobbleResponse>;
    /**
     * @deprecated Use `scrobble` instead. Renamed to match the canonical Last.fm
     * method name (`track.scrobble`). Kept as an alias for backwards compatibility.
     */
    postTrackScrobble: (params: TrackScrobbleRequest, init?: RequestInit) => Promise<TrackScrobbleResponse>;
    /**
     * Scrobble a batch of tracks. Submits a batch of track plays to the Last.fm.
     * Canonical Last.fm method name: `track.scrobble`.
     * @param {BatchTracksScrobbleRequest} params
     * @param {RequestInit} init
     * @returns {Promise<TrackScrobbleResponse>}
     * https://www.last.fm/api/show/track.scrobble
     * */
    scrobbleMany: (params: BatchTracksScrobbleRequest, init?: RequestInit) => Promise<TrackScrobbleResponse>;
    /**
     * @deprecated Use `scrobbleMany` instead. Renamed to match the canonical
     * Last.fm method name (`track.scrobble`). Kept as an alias for backwards
     * compatibility.
     */
    postBatchTrackScrobble: (params: BatchTracksScrobbleRequest, init?: RequestInit) => Promise<TrackScrobbleResponse>;
    /**
     * Add one or more personal tags to a track. Requires an
     * authenticated session.
     *
     * The `tags` array is sent on the wire as a comma-separated string
     * (Last.fm convention). Returns when the call has been accepted by
     * Last.fm.
     *
     * Idempotency is not guaranteed by Last.fm.
     *
     * **Authentication:** pass `sk` in `params.sk` (preferred for ad-hoc
     * calls) or set `sessionKey` on the `LastFmConfig` when constructing
     * the client (preferred for long-lived clients). Obtain a session key
     * via `auth.getToken` + the browser-based `auth.getSession` flow, or
     * via `auth.getMobileSession` (mobile-class API keys only).
     *
     * @param {TrackAddTagsRequest} params
     * @param {RequestInit} init
     * @returns {Promise<void>}
     * https://www.last.fm/api/show/track.addTags
     */
    addTags: (params: TrackAddTagsRequest, init?: RequestInit) => Promise<void>;
    /**
     * Remove a single personal tag from a track. Requires an
     * authenticated session.
     *
     * Last.fm does not document idempotency for `track.removeTag`.
     *
     * **Authentication:** pass `sk` in `params.sk` (preferred for ad-hoc
     * calls) or set `sessionKey` on the `LastFmConfig` when constructing
     * the client. Obtain a session key via `auth.getToken` +
     * `auth.getSession`, or `auth.getMobileSession` (mobile-class only).
     *
     * @param {TrackRemoveTagRequest} params
     * @param {RequestInit} init
     * @returns {Promise<void>}
     * https://www.last.fm/api/show/track.removeTag
     */
    removeTag: (params: TrackRemoveTagRequest, init?: RequestInit) => Promise<void>;
    /**
     * Mark a track as loved on the user's Last.fm account. Requires an
     * authenticated session.
     *
     * Last.fm does not document idempotency for `track.love`; calling
     * twice is a server-side concern.
     *
     * **Authentication:** pass `sk` in `params.sk` (preferred for ad-hoc
     * calls) or set `sessionKey` on the `LastFmConfig` when constructing
     * the client. Obtain a session key via `auth.getToken` +
     * `auth.getSession`, or `auth.getMobileSession` (mobile-class only).
     *
     * @param {TrackLoveRequest} params
     * @param {RequestInit} init
     * @returns {Promise<void>}
     * https://www.last.fm/api/show/track.love
     */
    love: (params: TrackLoveRequest, init?: RequestInit) => Promise<void>;
    /**
     * Remove a track from the user's loved list on Last.fm. Requires an
     * authenticated session.
     *
     * Last.fm does not document idempotency for `track.unlove`.
     *
     * **Authentication:** pass `sk` in `params.sk` (preferred for ad-hoc
     * calls) or set `sessionKey` on the `LastFmConfig` when constructing
     * the client. Obtain a session key via `auth.getToken` +
     * `auth.getSession`, or `auth.getMobileSession` (mobile-class only).
     *
     * @param {TrackUnloveRequest} params
     * @param {RequestInit} init
     * @returns {Promise<void>}
     * https://www.last.fm/api/show/track.unlove
     */
    unlove: (params: TrackLoveRequest, init?: RequestInit) => Promise<void>;
    /**
     * Announce the track the user is currently listening to on Last.fm.
     * Requires an authenticated session.
     *
     * Optional fields (`album`, `trackNumber`, `context`, `mbid`,
     * `duration`, `albumArtist`) are only included in the body and
     * signature when they are defined; the shared `signedPost`
     * transport strips `undefined` values before signing. Note that
     * `trackNumber` and `albumArtist` keep their exact wire casing.
     *
     * This endpoint does not accept a `timestamp` parameter — Last.fm
     * derives now-playing state from server time. Use
     * `track.scrobble` for completed plays.
     *
     * The `context` field is honoured only for API keys that Last.fm
     * has whitelisted; other API keys receive an ignored-message code.
     *
     * **Authentication:** pass `sk` in `params.sk` (preferred for ad-hoc
     * calls) or set `sessionKey` on the `LastFmConfig` when constructing
     * the client. Obtain a session key via `auth.getToken` +
     * `auth.getSession`, or `auth.getMobileSession` (mobile-class only).
     *
     * @param {TrackUpdateNowPlayingRequest} params
     * @param {RequestInit} init
     * @returns {Promise<TrackUpdateNowPlayingResponse>}
     * https://www.last.fm/api/show/track.updateNowPlaying
     */
    updateNowPlaying: (params: TrackUpdateNowPlayingRequest, init?: RequestInit) => Promise<TrackUpdateNowPlayingResponse>;
}
export declare function createTrackService(config: LastFmConfig): TrackService;
//# sourceMappingURL=track.d.ts.map