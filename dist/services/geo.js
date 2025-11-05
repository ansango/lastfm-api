import { fetcher, buildUrl } from '../utils.js';
export function createGeoService(config) {
    return {
        getTopArtists: (params, init) => fetcher(buildUrl(config, 'geo.getTopArtists', params), init),
        getTopTracks: (params, init) => fetcher(buildUrl(config, 'geo.getTopTracks', params), init)
    };
}
//# sourceMappingURL=geo.js.map