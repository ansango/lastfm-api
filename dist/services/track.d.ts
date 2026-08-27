import type { BatchTracksScrobbleRequest, TrackGetCorrectionRequest, TrackGetCorrectionResponse, TrackGetInfoRequest, TrackGetInfoResponse, TrackGetSimilarRequest, TrackGetSimilarResponse, TrackGetTagsRequest, TrackGetTagsResponse, TrackGetTopTagsRequest, TrackGetTopTagsResponse, TrackScrobbleRequest, TrackScrobbleResponse, TrackSearchRequest, TrackSearchResponse } from './track.schemas.js';
import type { LastFmConfig } from '../config.js';
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
     * @param {TrackScrobbleRequest} params
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
}
export declare function createTrackService(config: LastFmConfig): TrackService;
//# sourceMappingURL=track.d.ts.map