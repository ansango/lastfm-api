import type { GeoGetTopArtistsRequest, GeoGetTopArtistsResponse, GeoGetTopTracksRequest, GeoGetTopTracksResponse } from './geo.schemas.js';
import type { LastFmConfig } from '../config.js';
export interface GeoService {
    /**
     * Get the most popular artists on Last.fm by country.
     * @param {GeoGetTopArtistsRequest} params
     * @param {RequestInit} init
     * @returns {Promise<GeoGetTopArtistsResponse>}
     * https://www.last.fm/api/show/geo.getTopArtists
     * */
    getTopArtists: (params: GeoGetTopArtistsRequest, init?: RequestInit) => Promise<GeoGetTopArtistsResponse>;
    /**
     * Get the most popular tracks on Last.fm by country.
     * @param {GeoGetTopTracksRequest} params
     * @param {RequestInit} init
     * @returns {Promise<GeoGetTopTracksResponse>}
     * https://www.last.fm/api/show/geo.getTopTracks
     * */
    getTopTracks: (params: GeoGetTopTracksRequest, init?: RequestInit) => Promise<GeoGetTopTracksResponse>;
}
export declare function createGeoService(config: LastFmConfig): GeoService;
//# sourceMappingURL=geo.d.ts.map