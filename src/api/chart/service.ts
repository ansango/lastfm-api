import type { LastFmConfig } from '@/core/config.js'
import { buildUrl, fetcher } from '@/core/index.js'
import type {
	ChartGetTopArtistsRequest,
	ChartGetTopArtistsResponse,
	ChartGetTopTagsRequest,
	ChartGetTopTagsResponse,
	ChartGetTopTracksRequest,
	ChartGetTopTracksResponse,
} from './schemas.js'

export interface ChartService {
	getTopArtists: (params?: ChartGetTopArtistsRequest, init?: RequestInit) => Promise<ChartGetTopArtistsResponse>
	getTopTags: (params?: ChartGetTopTagsRequest, init?: RequestInit) => Promise<ChartGetTopTagsResponse>
	getTopTracks: (params?: ChartGetTopTracksRequest, init?: RequestInit) => Promise<ChartGetTopTracksResponse>
}

export function createChartService(config: LastFmConfig): ChartService {
	return {
		getTopArtists: (params, init) =>
			fetcher<ChartGetTopArtistsResponse>(buildUrl(config, 'chart.getTopArtists', params), init, config.cacheManager),
		getTopTags: (params, init) =>
			fetcher<ChartGetTopTagsResponse>(buildUrl(config, 'chart.getTopTags', params), init, config.cacheManager),
		getTopTracks: (params, init) =>
			fetcher<ChartGetTopTracksResponse>(buildUrl(config, 'chart.getTopTracks', params), init, config.cacheManager),
	}
}
