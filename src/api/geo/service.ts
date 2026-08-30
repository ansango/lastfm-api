import type { LastFmConfig } from '../../core/config.js'
import { buildUrl, fetcher } from '../../core/index.js'
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
