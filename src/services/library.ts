import type { LibraryGetArtistsRequest, LibraryGetArtistsResponse } from './library.schemas.js';
import { fetcher, buildUrl } from '../utils.js';
import type { LastFmConfig } from '../config.js';

export interface LibraryService {
	/**
	 * Get a list of the artists saved in a user's Last.fm library, along with the number of plays by the user.
	 * @param {LibraryGetArtistsRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<LibraryGetArtistsResponse>}
	 * https://www.last.fm/api/show/library.getArtists
	 * */
	getArtists: (
		params: LibraryGetArtistsRequest,
		init?: RequestInit
	) => Promise<LibraryGetArtistsResponse>;
}

export function createLibraryService(config: LastFmConfig): LibraryService {
	return {
		getArtists: (params, init) =>
			fetcher<LibraryGetArtistsResponse>(buildUrl(config, 'library.getArtists', params), init)
	};
}
