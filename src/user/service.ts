import { buildUrl, fetcher } from '../common/index.js'
import type { LastFmConfig } from '../config.js'
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
} from './schemas.js'

export interface UserService {
	getFriends: (params: UserGetFriendsRequest, init?: RequestInit) => Promise<UserGetFriendsResponse>
	getInfo: (params: UserGetInfoRequest, init?: RequestInit) => Promise<UserGetInfoResponse>
	getLovedTracks: (params: UserGetLovedTracksRequest, init?: RequestInit) => Promise<UserGetLovedTracksResponse>
	getRecentTracks: (params: UserGetRecentTracksRequest, init?: RequestInit) => Promise<UserGetRecentTracksResponse>
	getTopAlbums: (params: UserGetTopAlbumsRequest, init?: RequestInit) => Promise<UserGetTopAlbumsResponse>
	getTopArtists: (params: UserGetTopArtistsRequest, init?: RequestInit) => Promise<UserGetTopArtistsResponse>
	getTopTags: (params: UserGetTopTagsRequest, init?: RequestInit) => Promise<UserGetTopTagsResponse>
	getTopTracks: (params: UserGetTopTracksRequest, init?: RequestInit) => Promise<UserGetTopTracksResponse>
	getWeeklyAlbumChart: (
		params: UserGetWeeklyAlbumChartRequest,
		init?: RequestInit,
	) => Promise<UserGetWeeklyAlbumChartResponse>
	getWeeklyArtistChart: (
		params: UserGetWeeklyArtistChartRequest,
		init?: RequestInit,
	) => Promise<UserGetWeeklyArtistChartResponse>
	getWeeklyChartList: (
		params: UserGetWeeklyChartListRequest,
		init?: RequestInit,
	) => Promise<UserGetWeeklyChartListResponse>
	getWeeklyTrackChart: (
		params: UserGetWeeklyTrackChartRequest,
		init?: RequestInit,
	) => Promise<UserGetWeeklyTrackChartResponse>
	getPersonalTags: <T extends string>(
		params: UserGetPersonalTagsRequest<T>,
		init?: RequestInit,
	) => Promise<UserGetPersonalTagsResponse<T>>
}

export function createUserService(config: LastFmConfig): UserService {
	return {
		getFriends: (params, init) =>
			fetcher<UserGetFriendsResponse>(buildUrl(config, 'user.getFriends', params), init, config.cacheManager),
		getInfo: (params, init) =>
			fetcher<UserGetInfoResponse>(buildUrl(config, 'user.getInfo', params), init, config.cacheManager),
		getLovedTracks: (params, init) =>
			fetcher<UserGetLovedTracksResponse>(buildUrl(config, 'user.getLovedTracks', params), init, config.cacheManager),
		getRecentTracks: (params, init) =>
			fetcher<UserGetRecentTracksResponse>(buildUrl(config, 'user.getRecentTracks', params), init, config.cacheManager),
		getTopAlbums: (params, init) =>
			fetcher<UserGetTopAlbumsResponse>(buildUrl(config, 'user.getTopAlbums', params), init, config.cacheManager),
		getTopArtists: (params, init) =>
			fetcher<UserGetTopArtistsResponse>(buildUrl(config, 'user.getTopArtists', params), init, config.cacheManager),
		getTopTags: (params, init) =>
			fetcher<UserGetTopTagsResponse>(buildUrl(config, 'user.getTopTags', params), init, config.cacheManager),
		getTopTracks: (params, init) =>
			fetcher<UserGetTopTracksResponse>(buildUrl(config, 'user.getTopTracks', params), init, config.cacheManager),
		getWeeklyAlbumChart: (params, init) =>
			fetcher<UserGetWeeklyAlbumChartResponse>(
				buildUrl(config, 'user.getWeeklyAlbumChart', params),
				init,
				config.cacheManager,
			),
		getWeeklyArtistChart: (params, init) =>
			fetcher<UserGetWeeklyArtistChartResponse>(
				buildUrl(config, 'user.getWeeklyArtistChart', params),
				init,
				config.cacheManager,
			),
		getWeeklyChartList: (params, init) =>
			fetcher<UserGetWeeklyChartListResponse>(
				buildUrl(config, 'user.getWeeklyChartList', params),
				init,
				config.cacheManager,
			),
		getWeeklyTrackChart: (params, init) =>
			fetcher<UserGetWeeklyTrackChartResponse>(
				buildUrl(config, 'user.getWeeklyTrackChart', params),
				init,
				config.cacheManager,
			),
		getPersonalTags: <T extends string>(params: UserGetPersonalTagsRequest<T>, init?: RequestInit) =>
			fetcher<UserGetPersonalTagsResponse<T>>(
				buildUrl(config, 'user.getPersonalTags', params),
				init,
				config.cacheManager,
			),
	}
}
