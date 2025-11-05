import type {
	GeoGetTopArtistsRequest,
	GeoGetTopArtistsResponse,
	GeoGetTopTracksRequest,
	GeoGetTopTracksResponse
} from './geo.types.js';
import { fetcher, buildUrl } from '../utils.js';
import type { LastFmConfig } from '../config.js';

export interface GeoService {
	/**
	 * Get the most popular artists on Last.fm by country.
	 * @param {GeoGetTopArtistsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<GeoGetTopArtistsResponse>}
	 * https://www.last.fm/api/show/geo.getTopArtists
	 * */
	getTopArtists: (
		params: GeoGetTopArtistsRequest,
		init?: RequestInit
	) => Promise<GeoGetTopArtistsResponse>;
	/**
	 * Get the most popular tracks on Last.fm by country.
	 * @param {GeoGetTopTracksRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<GeoGetTopTracksResponse>}
	 * https://www.last.fm/api/show/geo.getTopTracks
	 * */
	getTopTracks: (
		params: GeoGetTopTracksRequest,
		init?: RequestInit
	) => Promise<GeoGetTopTracksResponse>;
}

export function createGeoService(config: LastFmConfig): GeoService {
	return {
		getTopArtists: (params, init) =>
			fetcher<GeoGetTopArtistsResponse>(buildUrl(config, 'geo.getTopArtists', params), init),
		getTopTracks: (params, init) =>
			fetcher<GeoGetTopTracksResponse>(buildUrl(config, 'geo.getTopTracks', params), init)
	};
}
