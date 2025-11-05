import { fetcher, buildUrl } from '../utils.js';
export function createAlbumService(config) {
    return {
        getInfo: (params, init) => fetcher(buildUrl(config, 'album.getInfo', params), init),
        getTags: (params, init) => fetcher(buildUrl(config, 'album.getTags', params), init),
        getTopTags: (params, init) => fetcher(buildUrl(config, 'album.getTopTags', params), init),
        search: (params, init) => fetcher(buildUrl(config, 'album.search', params), init)
    };
}
//# sourceMappingURL=album.js.map