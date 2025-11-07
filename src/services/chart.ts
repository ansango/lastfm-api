import type {
	ChartGetTopArtistsRequest,
	ChartGetTopArtistsResponse,
	ChartGetTopTagsRequest,
	ChartGetTopTagsResponse,
	ChartGetTopTracksRequest,
	ChartGetTopTracksResponse
} from './chart.schemas.js';

import { fetcher, buildUrl } from '../utils.js';
import type { LastFmConfig } from '../config.js';

export interface ChartService {
	/**
	 * Get the top artists chart
	 * @param {ChartGetTopArtistsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ChartGetTopArtistsResponse>}
	 * https://www.last.fm/api/show/chart.getTopArtists
	 * */
	getTopArtists: (
		params: ChartGetTopArtistsRequest,
		init?: RequestInit
	) => Promise<ChartGetTopArtistsResponse>;
	/**
	 * Get the top tags chart
	 * @param {ChartGetTopTagsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ChartGetTopTagsResponse>}
	 * https://www.last.fm/api/show/chart.getTopTags
	 * */
	getTopTags: (
		params: ChartGetTopTagsRequest,
		init?: RequestInit
	) => Promise<ChartGetTopTagsResponse>;
	/**
	 * Get the top tracks chart
	 * @param {ChartGetTopTracksRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<ChartGetTopTracksResponse>}
	 * https://www.last.fm/api/show/chart.getTopTracks
	 * */
	getTopTracks: (
		params: ChartGetTopTracksRequest,
		init?: RequestInit
	) => Promise<ChartGetTopTracksResponse>;
}

export function createChartService(config: LastFmConfig): ChartService {
	return {
		getTopArtists: (params, init) =>
			fetcher<ChartGetTopArtistsResponse>(buildUrl(config, 'chart.getTopArtists', params), init),
		getTopTags: (params, init) =>
			fetcher<ChartGetTopTagsResponse>(buildUrl(config, 'chart.getTopTags', params), init),
		getTopTracks: (params, init) =>
			fetcher<ChartGetTopTracksResponse>(buildUrl(config, 'chart.getTopTracks', params), init)
	};
}
