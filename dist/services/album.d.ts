import type { LastFmConfig } from '../config.js';
import type { AlbumAddTagsRequest, AlbumGetInfoRequest, AlbumGetInfoResponse, AlbumRemoveTagRequest, AlbumGetTagsRequest, AlbumGetTagsResponse, AlbumGetTopTagsRequest, AlbumGetTopTagsResponse, AlbumSearchRequest, AlbumSearchResponse } from './album.schemas.js';
export interface AlbumService {
    /**
     * Get the metadata for an album on Last.fm using the album name or a musicbrainz id.
     * @param {AlbumGetInfoRequest} params
     * @param {RequestInit} init
     * @returns {Promise<AlbumGetInfoResponse>}
     * https://www.last.fm/api/show/album.getInfo
     */
    getInfo: (params: AlbumGetInfoRequest, init?: RequestInit) => Promise<AlbumGetInfoResponse>;
    /**
     * Get the tags applied by an individual user to an album on Last.fm.
     * @param {AlbumGetTagsRequest} params
     * @param {RequestInit} init
     * @returns {Promise<AlbumGetTagsResponse>}
     * https://www.last.fm/api/show/album.getTags
     */
    getTags: (params: AlbumGetTagsRequest, init?: RequestInit) => Promise<AlbumGetTagsResponse>;
    /**
     * Get the top tags for an album on Last.fm, ordered by popularity.
     * @param {AlbumGetTopTagsRequest} params
     * @param {RequestInit} init
     * @returns {Promise<AlbumGetTopTagsResponse>}
     * https://www.last.fm/api/show/album.getTopTags
     */
    getTopTags: (params: AlbumGetTopTagsRequest, init?: RequestInit) => Promise<AlbumGetTopTagsResponse>;
    /**
     * Search for an album by name. Returns album matches sorted by relevance.
     * @param {AlbumSearchRequest} params
     * @param {RequestInit} init
     * @returns {Promise<AlbumSearchResponse>}
     * https://www.last.fm/api/show/album.search
     */
    search: (params: AlbumSearchRequest, init?: RequestInit) => Promise<AlbumSearchResponse>;
    /**
     * Add one or more personal tags to an album. Requires an
     * authenticated session.
     *
     * The `tags` array is sent on the wire as a comma-separated string
     * (Last.fm convention). Returns when the call has been accepted by
     * Last.fm.
     *
     * Idempotency is not guaranteed by Last.fm; calling twice may add
     * the same tag twice if the previous run is reported as ignored.
     *
     * **Authentication:** pass `sk` in `params.sk` (preferred for ad-hoc
     * calls) or set `sessionKey` on the `LastFmConfig` when constructing
     * the client (preferred for long-lived clients). Obtain a session key
     * via `auth.getToken` + the browser-based `auth.getSession` flow, or
     * via `auth.getMobileSession` (mobile-class API keys only).
     *
     * @param {AlbumAddTagsRequest} params
     * @param {RequestInit} init
     * @returns {Promise<void>}
     * https://www.last.fm/api/show/album.addTags
     */
    addTags: (params: AlbumAddTagsRequest, init?: RequestInit) => Promise<void>;
    /**
     * Remove a single personal tag from an album. Requires an
     * authenticated session.
     *
     * Last.fm does not document idempotency for `album.removeTag`;
     * removing an absent tag is a no-op or a server error depending
     * on the live behaviour.
     *
     * **Authentication:** pass `sk` in `params.sk` (preferred for ad-hoc
     * calls) or set `sessionKey` on the `LastFmConfig` when constructing
     * the client. Obtain a session key via `auth.getToken` +
     * `auth.getSession`, or `auth.getMobileSession` (mobile-class only).
     *
     * @param {AlbumRemoveTagRequest} params
     * @param {RequestInit} init
     * @returns {Promise<void>}
     * https://www.last.fm/api/show/album.removeTag
     */
    removeTag: (params: AlbumRemoveTagRequest, init?: RequestInit) => Promise<void>;
}
export declare function createAlbumService(config: LastFmConfig): AlbumService;
//# sourceMappingURL=album.d.ts.map