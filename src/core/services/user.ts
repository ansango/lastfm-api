import type { LastFmConfig } from '../../config.js'
import { buildUrl, fetcher } from '../../utils.js'
import type {
	UserGetFriendsRequest,
	UserGetFriendsResponse,
	UserGetInfoRequest,
	UserGetInfoResponse,
	UserGetLovedTracksRequest,
	UserGetLovedTracksResponse,
	UserGetPersonalTagsRequest,
	UserGetPersonalTagsResponse,
	UserGetRecentTracksRequest,
	UserGetRecentTracksResponse,
	UserGetTopAlbumsRequest,
	UserGetTopAlbumsResponse,
	UserGetTopArtistsRequest,
	UserGetTopArtistsResponse,
	UserGetTopTagsRequest,
	UserGetTopTagsResponse,
	UserGetTopTracksRequest,
	UserGetTopTracksResponse,
	UserGetWeeklyAlbumChartRequest,
	UserGetWeeklyAlbumChartResponse,
	UserGetWeeklyArtistChartRequest,
	UserGetWeeklyArtistChartResponse,
	UserGetWeeklyChartListRequest,
	UserGetWeeklyChartListResponse,
	UserGetWeeklyTrackChartRequest,
	UserGetWeeklyTrackChartResponse,
} from '../schemas/user.schemas.js'

export interface UserService {
	/**
	 * Fetches a list of the user's friends
	 * @param {UserGetFriendsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetFriendsResponse>}
	 * https://www.last.fm/api/show/user.getFriends
	 */
	getFriends: (params: UserGetFriendsRequest, init?: RequestInit) => Promise<UserGetFriendsResponse>
	/**
	 * Fetch user info
	 * @param {UserGetInfoRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetInfoResponse>}
	 * https://www.last.fm/api/show/user.getInfo
	 */

	getInfo: (params: UserGetInfoRequest, init?: RequestInit) => Promise<UserGetInfoResponse>
	/**
	 * Fetches a list of the user's loved tracks
	 * @param {UserGetLovedTracksRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetLovedTracksResponse>}
	 * https://www.last.fm/api/show/user.getLovedTracks
	 */
	getLovedTracks: (params: UserGetLovedTracksRequest, init?: RequestInit) => Promise<UserGetLovedTracksResponse>
	/**
	 * Fetches a list of the user's recent tracks
	 * @param {UserGetRecentTracksRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetRecentTracksResponse>}
	 * https://www.last.fm/api/show/user.getRecentTracks
	 */
	getRecentTracks: (params: UserGetRecentTracksRequest, init?: RequestInit) => Promise<UserGetRecentTracksResponse>
	/**
	 * Fetches a list of the user's top albums
	 * @param {UserGetTopAlbumsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetTopAlbumsResponse>}
	 * https://www.last.fm/api/show/user.getTopAlbums
	 */
	getTopAlbums: (params: UserGetTopAlbumsRequest, init?: RequestInit) => Promise<UserGetTopAlbumsResponse>
	/**
	 * Fetches a list of the user's top artists
	 * @param {UserGetTopArtistsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetTopArtistsResponse>}
	 * https://www.last.fm/api/show/user.getTopArtists
	 */
	getTopArtists: (params: UserGetTopArtistsRequest, init?: RequestInit) => Promise<UserGetTopArtistsResponse>
	/**
	 * Fetches a list of the user's top tags
	 * @param {UserGetTopTagsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetTopTagsResponse>}
	 * https://www.last.fm/api/show/user.getTopTags
	 */
	getTopTags: (params: UserGetTopTagsRequest, init?: RequestInit) => Promise<UserGetTopTagsResponse>
	/**
	 * Fetches a list of the user's top tracks
	 * @param {UserGetTopTracksRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetTopTracksResponse>}
	 * https://www.last.fm/api/show/user.getTopTracks
	 */
	getTopTracks: (params: UserGetTopTracksRequest, init?: RequestInit) => Promise<UserGetTopTracksResponse>
	/**
	 * Fetches a list of the user's chart albums for a given week
	 * @param {UserGetWeeklyAlbumChartRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetWeeklyAlbumChartResponse>}
	 * https://www.last.fm/api/show/user.getWeeklyAlbumChart
	 */
	getWeeklyAlbumChart: (
		params: UserGetWeeklyAlbumChartRequest,
		init?: RequestInit,
	) => Promise<UserGetWeeklyAlbumChartResponse>
	/**
	 * Fetches a list of the user's chart artists for a given week
	 * @param {UserGetWeeklyArtistChartRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetWeeklyArtistChartResponse>}
	 * https://www.last.fm/api/show/user.getWeeklyArtistChart
	 */
	getWeeklyArtistChart: (
		params: UserGetWeeklyArtistChartRequest,
		init?: RequestInit,
	) => Promise<UserGetWeeklyArtistChartResponse>
	/**
	 * Fetches a list of the user's chart lists for a given week
	 * @param {UserGetWeeklyChartListRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetWeeklyChartListResponse>}
	 * https://www.last.fm/api/show/user.getWeeklyChartList
	 */
	getWeeklyChartList: (
		params: UserGetWeeklyChartListRequest,
		init?: RequestInit,
	) => Promise<UserGetWeeklyChartListResponse>
	/**
	 * Fetches a list of the user's chart tracks for a given week
	 * @param {UserGetWeeklyTrackChartRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetWeeklyTrackChartResponse>}
	 * https://www.last.fm/api/show/user.getWeeklyTrackChart
	 */
	getWeeklyTrackChart: (
		params: UserGetWeeklyTrackChartRequest,
		init?: RequestInit,
	) => Promise<UserGetWeeklyTrackChartResponse>
	/**
	 * Get the personal tags a user has applied to artists, albums, or
	 * tracks. The response is narrowed by the literal `taggingtype`:
	 *
	 *   - `taggingtype: "artist"` → response contains `taggings.artists`
	 *   - `taggingtype: "album"`  → response contains `taggings.albums`
	 *   - `taggingtype: "track"`  → response contains `taggings.tracks`
	 *
	 * Passing a wider type (e.g. a `string` variable) yields the
	 * documented union response.
	 *
	 * Unsigned GET — no `sk` or `api_sig` are sent.
	 * @param {UserGetPersonalTagsRequest<T>} params
	 * @param {RequestInit} init
	 * @returns {Promise<UserGetPersonalTagsResponse<T>>}
	 * https://www.last.fm/api/show/user.getPersonalTags
	 */
	getPersonalTags: <T extends string>(
		params: UserGetPersonalTagsRequest<T>,
		init?: RequestInit,
	) => Promise<UserGetPersonalTagsResponse<T>>
}

export function createUserService(config: LastFmConfig): UserService {
	return {
		getFriends: (params, init) => fetcher<UserGetFriendsResponse>(buildUrl(config, 'user.getFriends', params), init),

		getInfo: (params, init) => fetcher<UserGetInfoResponse>(buildUrl(config, 'user.getInfo', params), init),

		getLovedTracks: (params, init) =>
			fetcher<UserGetLovedTracksResponse>(buildUrl(config, 'user.getLovedTracks', params), init),
		getRecentTracks: (params, init) =>
			fetcher<UserGetRecentTracksResponse>(buildUrl(config, 'user.getRecentTracks', params), init),
		getTopAlbums: (params, init) =>
			fetcher<UserGetTopAlbumsResponse>(buildUrl(config, 'user.getTopAlbums', params), init),
		getTopArtists: (params, init) =>
			fetcher<UserGetTopArtistsResponse>(buildUrl(config, 'user.getTopArtists', params), init),
		getTopTags: (params, init) => fetcher<UserGetTopTagsResponse>(buildUrl(config, 'user.getTopTags', params), init),
		getTopTracks: (params, init) =>
			fetcher<UserGetTopTracksResponse>(buildUrl(config, 'user.getTopTracks', params), init),
		getWeeklyAlbumChart: (params, init) =>
			fetcher<UserGetWeeklyAlbumChartResponse>(buildUrl(config, 'user.getWeeklyAlbumChart', params), init),
		getWeeklyArtistChart: (params, init) =>
			fetcher<UserGetWeeklyArtistChartResponse>(buildUrl(config, 'user.getWeeklyArtistChart', params), init),
		getWeeklyChartList: (params, init) =>
			fetcher<UserGetWeeklyChartListResponse>(buildUrl(config, 'user.getWeeklyChartList', params), init),
		getWeeklyTrackChart: (params, init) =>
			fetcher<UserGetWeeklyTrackChartResponse>(buildUrl(config, 'user.getWeeklyTrackChart', params), init),
		getPersonalTags: <T extends string>(params: UserGetPersonalTagsRequest<T>, init?: RequestInit) =>
			fetcher<UserGetPersonalTagsResponse<T>>(buildUrl(config, 'user.getPersonalTags', params), init),
	}
}
