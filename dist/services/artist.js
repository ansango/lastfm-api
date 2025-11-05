import { fetcher, buildUrl } from '../utils.js';
export function createArtistService(config) {
    return {
        getInfo: (params, init) => fetcher(buildUrl(config, 'artist.getInfo', params), init),
        getTags: (params, init) => fetcher(buildUrl(config, 'artist.getTags', params), init),
        getSimilar: (params, init) => fetcher(buildUrl(config, 'artist.getSimilar', params), init),
        getTopTags: (params, init) => fetcher(buildUrl(config, 'artist.getTopTags', params), init),
        getTopAlbums: (params, init) => fetcher(buildUrl(config, 'artist.getTopAlbums', params), init),
        getTopTracks: (params, init) => fetcher(buildUrl(config, 'artist.getTopTracks', params), init),
        search: (params, init) => fetcher(buildUrl(config, 'artist.search', params), init)
    };
}
//# sourceMappingURL=artist.js.map