import type { LastFmConfig } from '@/core/config.js'
import { buildUrl, fetcher } from '@/core/index.js'
import type {
	TagGetInfoRequest,
	TagGetInfoResponse,
	TagGetSimilarRequest,
	TagGetSimilarResponse,
	TagGetTopAlbumsRequest,
	TagGetTopAlbumsResponse,
	TagGetTopArtistsRequest,
	TagGetTopArtistsResponse,
	TagGetTopTagsRequest,
	TagGetTopTagsResponse,
	TagGetTopTracksRequest,
	TagGetTopTracksResponse,
	TagGetWeeklyChartListRequest,
	TagGetWeeklyChartListResponse,
} from './schemas.js'

export interface TagService {
	getInfo: (params: TagGetInfoRequest, init?: RequestInit) => Promise<TagGetInfoResponse>
	getSimilar: (params: TagGetSimilarRequest, init?: RequestInit) => Promise<TagGetSimilarResponse>
	getTopAlbums: (params: TagGetTopAlbumsRequest, init?: RequestInit) => Promise<TagGetTopAlbumsResponse>
	getTopArtists: (params: TagGetTopArtistsRequest, init?: RequestInit) => Promise<TagGetTopArtistsResponse>
	getTopTags: (params?: TagGetTopTagsRequest, init?: RequestInit) => Promise<TagGetTopTagsResponse>
	getTopTracks: (params: TagGetTopTracksRequest, init?: RequestInit) => Promise<TagGetTopTracksResponse>
	getWeeklyChartList: (
		params: TagGetWeeklyChartListRequest,
		init?: RequestInit,
	) => Promise<TagGetWeeklyChartListResponse>
}

export function createTagService(config: LastFmConfig): TagService {
	return {
		getInfo: (params, init) =>
			fetcher<TagGetInfoResponse>(buildUrl(config, 'tag.getInfo', params), init, config.cacheManager),
		getSimilar: (params, init) =>
			fetcher<TagGetSimilarResponse>(buildUrl(config, 'tag.getSimilar', params), init, config.cacheManager),
		getTopAlbums: (params, init) =>
			fetcher<TagGetTopAlbumsResponse>(buildUrl(config, 'tag.getTopAlbums', params), init, config.cacheManager),
		getTopArtists: (params, init) =>
			fetcher<TagGetTopArtistsResponse>(buildUrl(config, 'tag.getTopArtists', params), init, config.cacheManager),
		getTopTags: (params, init) =>
			fetcher<TagGetTopTagsResponse>(buildUrl(config, 'tag.getTopTags', params), init, config.cacheManager),
		getTopTracks: (params, init) =>
			fetcher<TagGetTopTracksResponse>(buildUrl(config, 'tag.getTopTracks', params), init, config.cacheManager),
		getWeeklyChartList: (params, init) =>
			fetcher<TagGetWeeklyChartListResponse>(
				buildUrl(config, 'tag.getWeeklyChartList', params),
				init,
				config.cacheManager,
			),
	}
}
