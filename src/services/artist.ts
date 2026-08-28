import type { LastFmConfig } from '../config.js'
import { buildUrl, fetcher, LastFmApiError, signedPost } from '../utils.js'
import type {
	ArtistAddTagsRequest,
	ArtistGetCorrectionRequest,
	ArtistGetCorrectionResponse,
	ArtistGetInfoRequest,
	ArtistGetInfoResponse,
	ArtistGetSimilarRequest,
	ArtistGetSimilarResponse,
	ArtistGetTagsRequest,
	ArtistGetTagsResponse,
	ArtistGetTopAlbumsRequest,
	ArtistGetTopAlbumsResponse,
	ArtistGetTopTagsRequest,
	ArtistGetTopTagsResponse,
	ArtistGetTopTracksRequest,
	ArtistGetTopTracksResponse,
	ArtistRemoveTagRequest,
	ArtistSearchRequest,
	ArtistSearchResponse,
} from './artist.schemas.js'

export interface ArtistService {
	/**
	 * Get the metadata for an artist. Includes biography.
	 * @param {ArtistGetInfoRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ArtistGetInfoResponse>}
	 * https://www.last.fm/api/show/artist.getInfo
	 */
	getInfo: (params: ArtistGetInfoRequest, init?: RequestInit) => Promise<ArtistGetInfoResponse>
	/**
	 * Get the tags applied by an individual user to an artist on Last.fm.
	 * @param {ArtistGetTagsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ArtistGetTagsResponse>}
	 * https://www.last.fm/api/show/artist.getTags
	 * */
	getTags: (params: ArtistGetTagsRequest, init?: RequestInit) => Promise<ArtistGetTagsResponse>
	/**
	 * Get the similar artists for this artist on Last.fm, based on listening data.
	 * @param {ArtistGetSimilarRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ArtistGetSimilarResponse>}
	 * https://www.last.fm/api/show/artist.getSimilar
	 * */
	getSimilar: (params: ArtistGetSimilarRequest, init?: RequestInit) => Promise<ArtistGetSimilarResponse>
	/**
	 * Get the top tags for an artist on Last.fm, ordered by popularity.
	 * @param {ArtistGetTopTagsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ArtistGetTopTagsResponse>}
	 * https://www.last.fm/api/show/artist.getTopTags
	 * */
	getTopTags: (params: ArtistGetTopTagsRequest, init?: RequestInit) => Promise<ArtistGetTopTagsResponse>
	/**
	 * Get the top albums for an artist on Last.fm, ordered by popularity.
	 * @param {ArtistGetTopAlbumsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ArtistGetTopAlbumsResponse>}
	 * https://www.last.fm/api/show/artist.getTopAlbums
	 * */
	getTopAlbums: (params: ArtistGetTopAlbumsRequest, init?: RequestInit) => Promise<ArtistGetTopAlbumsResponse>
	/**
	 * Get the top tracks by an artist on Last.fm, ordered by popularity.
	 * @param {ArtistGetTopTracksRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ArtistGetTopTracksResponse>}
	 * https://www.last.fm/api/show/artist.getTopTracks
	 * */
	getTopTracks: (params: ArtistGetTopTracksRequest, init?: RequestInit) => Promise<ArtistGetTopTracksResponse>
	/**
	 * Search for an artist by name. Returns artist matches sorted by relevance.
	 * @param {ArtistSearchRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ArtistSearchResponse>}
	 * https://www.last.fm/api/show/artist.search
	 * */
	search: (params: ArtistSearchRequest, init?: RequestInit) => Promise<ArtistSearchResponse>
	/**
	 * Get the canonical correction for a misspelled or noncanonical artist
	 * name. Returns the list of corrections Last.fm would apply to the
	 * provided input. Unsigned GET — no `sk` or `api_sig` are sent.
	 * @param {ArtistGetCorrectionRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ArtistGetCorrectionResponse>}
	 * https://www.last.fm/api/show/artist.getCorrection
	 */
	getCorrection: (params: ArtistGetCorrectionRequest, init?: RequestInit) => Promise<ArtistGetCorrectionResponse>
	/**
	 * Add one or more personal tags to an artist. Requires an
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
	 * @param {ArtistAddTagsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<void>}
	 * https://www.last.fm/api/show/artist.addTags
	 */
	addTags: (params: ArtistAddTagsRequest, init?: RequestInit) => Promise<void>
	/**
	 * Remove a single personal tag from an artist. Requires an
	 * authenticated session.
	 *
	 * Last.fm does not document idempotency for `artist.removeTag`.
	 *
	 * **Authentication:** pass `sk` in `params.sk` (preferred for ad-hoc
	 * calls) or set `sessionKey` on the `LastFmConfig` when constructing
	 * the client. Obtain a session key via `auth.getToken` +
	 * `auth.getSession`, or `auth.getMobileSession` (mobile-class only).
	 *
	 * @param {ArtistRemoveTagRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<void>}
	 * https://www.last.fm/api/show/artist.removeTag
	 */
	removeTag: (params: ArtistRemoveTagRequest, init?: RequestInit) => Promise<void>
}

function resolveSessionKeyForArtistTagMutation(
	config: LastFmConfig,
	requestSk: string | undefined,
	action: 'addTags' | 'removeTag',
): string {
	const sk = requestSk ?? config.sessionKey
	if (!sk) {
		throw new LastFmApiError(
			`A session key (\`sk\`) is required to artist.${action}. Pass \`sk\` in the request params or set \`sessionKey\` on the LastFmConfig.`,
			0,
		)
	}
	return sk
}

export function createArtistService(config: LastFmConfig): ArtistService {
	const addTagsImpl = (params: ArtistAddTagsRequest, init?: RequestInit) => {
		const sk = resolveSessionKeyForArtistTagMutation(config, params.sk, 'addTags')
		return signedPost(config, 'artist.addTags', {
			params: {
				artist: params.artist,
				tags: params.tags.join(','),
				sk,
			},
			init,
		}).then(() => undefined)
	}

	const removeTagImpl = (params: ArtistRemoveTagRequest, init?: RequestInit) => {
		const sk = resolveSessionKeyForArtistTagMutation(config, params.sk, 'removeTag')
		return signedPost(config, 'artist.removeTag', {
			params: {
				artist: params.artist,
				tag: params.tag,
				sk,
			},
			init,
		}).then(() => undefined)
	}

	return {
		getInfo: (params, init) => fetcher<ArtistGetInfoResponse>(buildUrl(config, 'artist.getInfo', params), init),
		getTags: (params, init) => fetcher<ArtistGetTagsResponse>(buildUrl(config, 'artist.getTags', params), init),
		getSimilar: (params, init) =>
			fetcher<ArtistGetSimilarResponse>(buildUrl(config, 'artist.getSimilar', params), init),
		getTopTags: (params, init) =>
			fetcher<ArtistGetTopTagsResponse>(buildUrl(config, 'artist.getTopTags', params), init),
		getTopAlbums: (params, init) =>
			fetcher<ArtistGetTopAlbumsResponse>(buildUrl(config, 'artist.getTopAlbums', params), init),
		getTopTracks: (params, init) =>
			fetcher<ArtistGetTopTracksResponse>(buildUrl(config, 'artist.getTopTracks', params), init),
		search: (params, init) => fetcher<ArtistSearchResponse>(buildUrl(config, 'artist.search', params), init),
		getCorrection: (params, init) =>
			fetcher<ArtistGetCorrectionResponse>(buildUrl(config, 'artist.getCorrection', params), init),
		addTags: addTagsImpl,
		removeTag: removeTagImpl,
	}
}
