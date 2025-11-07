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
	TagGetWeeklyChartListResponse
} from './tag.schemas.js';
import { fetcher, buildUrl } from '../utils.js';
import type { LastFmConfig } from '../config.js';

export interface TagService {
	/**
	 * Get the metadata for a tag on Last.fm. Includes biography.
	 * @param {TagGetInfoRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<TagGetInfoResponse>}
	 * https://www.last.fm/api/show/tag.getInfo
	 * */
	getInfo: (params: TagGetInfoRequest, init?: RequestInit) => Promise<TagGetInfoResponse>;
	/**
	 * Get the similar tags for this tag, based on listening data.
	 * @param {TagGetSimilarRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<TagGetSimilarResponse>}
	 * https://www.last.fm/api/show/tag.getSimilar
	 * */
	getSimilar: (params: TagGetSimilarRequest, init?: RequestInit) => Promise<TagGetSimilarResponse>;
	/**
	 * Get the top albums tagged by this tag, ordered by tag count.
	 * @param {TagGetTopAlbumsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<TagGetTopAlbumsResponse>}
	 * https://www.last.fm/api/show/tag.getTopAlbums
	 * */
	getTopAlbums: (
		params: TagGetTopAlbumsRequest,
		init?: RequestInit
	) => Promise<TagGetTopAlbumsResponse>;
	/**
	 * Get the top artists tagged by this tag, ordered by tag count.
	 * @param {TagGetTopArtistsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<TagGetTopArtistsResponse>}
	 * https://www.last.fm/api/show/tag.getTopArtists
	 * */
	getTopArtists: (
		params: TagGetTopArtistsRequest,
		init?: RequestInit
	) => Promise<TagGetTopArtistsResponse>;
	/**
	 *  Get the top tags on Last.fm, ordered by tag count.
	 * @param {TagGetTopTagsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<TagGetTopTagsResponse>}
	 * https://www.last.fm/api/show/tag.getTopTags
	 * */
	getTopTags: (params: TagGetTopTagsRequest, init?: RequestInit) => Promise<TagGetTopTagsResponse>;
	/**
	 * Get the top tracks tagged by this tag, ordered by tag count.
	 * @param {TagGetTopTracksRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<TagGetTopTracksResponse>}
	 * https://www.last.fm/api/show/tag.getTopTracks
	 * */
	getTopTracks: (
		params: TagGetTopTracksRequest,
		init?: RequestInit
	) => Promise<TagGetTopTracksResponse>;
	/**
	 * Get a list of available charts for this tag, expressed as date ranges which can be sent to the chart services.
	 * @param {TagGetWeeklyChartListRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<TagGetWeeklyChartListResponse>}
	 * https://www.last.fm/api/show/tag.getWeeklyChartList
	 * */
	getWeeklyChartList: (
		params: TagGetWeeklyChartListRequest,
		init?: RequestInit
	) => Promise<TagGetWeeklyChartListResponse>;
}

export function createTagService(config: LastFmConfig): TagService {
	return {
		getInfo: (params, init) =>
			fetcher<TagGetInfoResponse>(buildUrl(config, 'tag.getInfo', params), init),
		getSimilar: (params, init) =>
			fetcher<TagGetSimilarResponse>(buildUrl(config, 'tag.getSimilar', params), init),
		getTopAlbums: (params, init) =>
			fetcher<TagGetTopAlbumsResponse>(buildUrl(config, 'tag.getTopAlbums', params), init),
		getTopArtists: (params, init) =>
			fetcher<TagGetTopArtistsResponse>(buildUrl(config, 'tag.getTopArtists', params), init),
		getTopTags: (params, init) =>
			fetcher<TagGetTopTagsResponse>(buildUrl(config, 'tag.getTopTags', params), init),
		getTopTracks: (params, init) =>
			fetcher<TagGetTopTracksResponse>(buildUrl(config, 'tag.getTopTracks', params), init),
		getWeeklyChartList: (params, init) =>
			fetcher<TagGetWeeklyChartListResponse>(buildUrl(config, 'tag.getWeeklyChartList', params), init)
	};
}
