import { buildUrl, fetcher } from '../common/index.js'
import type { LastFmConfig } from '../config.js'
import type { LibraryGetArtistsRequest, LibraryGetArtistsResponse } from './schemas.js'

export interface LibraryService {
	getArtists: (params: LibraryGetArtistsRequest, init?: RequestInit) => Promise<LibraryGetArtistsResponse>
}

export function createLibraryService(config: LastFmConfig): LibraryService {
	return {
		getArtists: (params, init) =>
			fetcher<LibraryGetArtistsResponse>(buildUrl(config, 'library.getArtists', params), init, config.cacheManager),
	}
}
