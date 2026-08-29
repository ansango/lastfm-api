import { buildUrl, fetcher } from '../common/index.js'
import type { LastFmConfig } from '../config.js'
import type {
	GeoGetTopArtistsRequest,
	GeoGetTopArtistsResponse,
	GeoGetTopTracksRequest,
	GeoGetTopTracksResponse,
} from './schemas.js'

export interface GeoService {
	getTopArtists: (params: GeoGetTopArtistsRequest, init?: RequestInit) => Promise<GeoGetTopArtistsResponse>
	getTopTracks: (params: GeoGetTopTracksRequest, init?: RequestInit) => Promise<GeoGetTopTracksResponse>
}

export function createGeoService(config: LastFmConfig): GeoService {
	return {
		getTopArtists: (params, init) =>
			fetcher<GeoGetTopArtistsResponse>(buildUrl(config, 'geo.getTopArtists', params), init, config.cacheManager),
		getTopTracks: (params, init) =>
			fetcher<GeoGetTopTracksResponse>(buildUrl(config, 'geo.getTopTracks', params), init, config.cacheManager),
	}
}
