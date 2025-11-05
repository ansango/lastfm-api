import { fetcher, buildUrl } from '../utils.js';
import { batchFetcher, parsePostParamsBatchTrack, parsePostParamsTrack } from './track.utils.js';
export function createTrackService(config) {
    return {
        getInfo: (params, init) => fetcher(buildUrl(config, 'track.getInfo', params), init),
        getSimilar: (params, init) => fetcher(buildUrl(config, 'track.getSimilar', params), init),
        getTags: (params, init) => fetcher(buildUrl(config, 'track.getTags', params), init),
        getTopTags: (params, init) => fetcher(buildUrl(config, 'track.getTopTags', params), init),
        search: (params, init) => fetcher(buildUrl(config, 'track.search', params), init),
        postTrackScrobble: ({ artist, sk, timestamp, track, album }, init) => fetcher(buildUrl(config, 'track.scrobble', {
            ...parsePostParamsTrack(config, { artist, sk, timestamp, track, album })
        }), {
            ...init,
            method: 'POST'
        }),
        postBatchTrackScrobble: async ({ tracks, sk }) => batchFetcher(config, { body: parsePostParamsBatchTrack(config, { tracks, sk }) })
    };
}
//# sourceMappingURL=track.js.map