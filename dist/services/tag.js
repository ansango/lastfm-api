import { fetcher, buildUrl } from '../utils.js';
export function createTagService(config) {
    return {
        getInfo: (params, init) => fetcher(buildUrl(config, 'tag.getInfo', params), init),
        getSimilar: (params, init) => fetcher(buildUrl(config, 'tag.getSimilar', params), init),
        getTopAlbums: (params, init) => fetcher(buildUrl(config, 'tag.getTopAlbums', params), init),
        getTopArtists: (params, init) => fetcher(buildUrl(config, 'tag.getTopArtists', params), init),
        getTopTags: (params, init) => fetcher(buildUrl(config, 'tag.getTopTags', params), init),
        getTopTracks: (params, init) => fetcher(buildUrl(config, 'tag.getTopTracks', params), init),
        getWeeklyChartList: (params, init) => fetcher(buildUrl(config, 'tag.getWeeklyChartList', params), init)
    };
}
//# sourceMappingURL=tag.js.map