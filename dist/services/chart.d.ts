import type { ChartGetTopArtistsRequest, ChartGetTopArtistsResponse, ChartGetTopTagsRequest, ChartGetTopTagsResponse, ChartGetTopTracksRequest, ChartGetTopTracksResponse } from './chart.types.js';
import type { LastFmConfig } from '../config.js';
export interface ChartService {
    /**
     * Get the top artists chart
     * @param {ChartGetTopArtistsRequest} params
     * @param {RequestInit} init
     * @returns {Promise<ChartGetTopArtistsResponse>}
     * https://www.last.fm/api/show/chart.getTopArtists
     * */
    getTopArtists: (params: ChartGetTopArtistsRequest, init?: RequestInit) => Promise<ChartGetTopArtistsResponse>;
    /**
     * Get the top tags chart
     * @param {ChartGetTopTagsRequest} params
     * @param {RequestInit} init
     * @returns {Promise<ChartGetTopTagsResponse>}
     * https://www.last.fm/api/show/chart.getTopTags
     * */
    getTopTags: (params: ChartGetTopTagsRequest, init?: RequestInit) => Promise<ChartGetTopTagsResponse>;
    /**
     * Get the top tracks chart
     * @param {ChartGetTopTracksRequest} params
     * @param {RequestInit} init
     * @returns {Promise<ChartGetTopTracksResponse>}
     * https://www.last.fm/api/show/chart.getTopTracks
     * */
    getTopTracks: (params: ChartGetTopTracksRequest, init?: RequestInit) => Promise<ChartGetTopTracksResponse>;
}
export declare function createChartService(config: LastFmConfig): ChartService;
//# sourceMappingURL=chart.d.ts.map