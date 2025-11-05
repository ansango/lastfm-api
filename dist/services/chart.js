import { fetcher, buildUrl } from '../utils.js';
export function createChartService(config) {
    return {
        getTopArtists: (params, init) => fetcher(buildUrl(config, 'chart.getTopArtists', params), init),
        getTopTags: (params, init) => fetcher(buildUrl(config, 'chart.getTopTags', params), init),
        getTopTracks: (params, init) => fetcher(buildUrl(config, 'chart.getTopTracks', params), init)
    };
}
//# sourceMappingURL=chart.js.map