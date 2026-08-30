import type { LastFmConfig } from '../../core/config.js'
import { buildUrl, fetcher } from '../../core/index.js'
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
