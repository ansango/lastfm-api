import { fetcher, buildUrl } from '../utils.js';
export function createLibraryService(config) {
    return {
        getArtists: (params, init) => fetcher(buildUrl(config, 'library.getArtists', params), init)
    };
}
//# sourceMappingURL=library.js.map