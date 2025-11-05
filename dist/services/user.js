import { fetcher, buildUrl } from '../utils.js';
export function createUserService(config) {
    return {
        getFriends: (params, init) => fetcher(buildUrl(config, 'user.getFriends', params), init),
        getInfo: (params, init) => fetcher(buildUrl(config, 'user.getInfo', params), init),
        getLovedTracks: (params, init) => fetcher(buildUrl(config, 'user.getLovedTracks', params), init),
        getRecentTracks: (params, init) => fetcher(buildUrl(config, 'user.getRecentTracks', params), init),
        getTopAlbums: (params, init) => fetcher(buildUrl(config, 'user.getTopAlbums', params), init),
        getTopArtists: (params, init) => fetcher(buildUrl(config, 'user.getTopArtists', params), init),
        getTopTags: (params, init) => fetcher(buildUrl(config, 'user.getTopTags', params), init),
        getTopTracks: (params, init) => fetcher(buildUrl(config, 'user.getTopTracks', params), init),
        getWeeklyAlbumChart: (params, init) => fetcher(buildUrl(config, 'user.getWeeklyAlbumChart', params), init),
        getWeeklyArtistChart: (params, init) => fetcher(buildUrl(config, 'user.getWeeklyArtistChart', params), init),
        getWeeklyChartList: (params, init) => fetcher(buildUrl(config, 'user.getWeeklyChartList', params), init),
        getWeeklyTrackChart: (params, init) => fetcher(buildUrl(config, 'user.getWeeklyTrackChart', params), init)
    };
}
//# sourceMappingURL=user.js.map