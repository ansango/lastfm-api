import { fetcher, buildUrl, signedPost } from '../utils.js';
import { buildBatchScrobbleParams, buildScrobbleParams } from './track.utils.js';
export function createTrackService(config) {
    const scrobbleImpl = (params, init) => signedPost(config, 'track.scrobble', {
        params: buildScrobbleParams(config, params),
        init
    });
    const scrobbleManyImpl = (params, init) => signedPost(config, 'track.scrobble', {
        params: buildBatchScrobbleParams(config, params),
        init
    });
    return {
        getInfo: (params, init) => fetcher(buildUrl(config, 'track.getInfo', params), init),
        getSimilar: (params, init) => fetcher(buildUrl(config, 'track.getSimilar', params), init),
        getTags: (params, init) => fetcher(buildUrl(config, 'track.getTags', params), init),
        getTopTags: (params, init) => fetcher(buildUrl(config, 'track.getTopTags', params), init),
        search: (params, init) => fetcher(buildUrl(config, 'track.search', params), init),
        scrobble: scrobbleImpl,
        postTrackScrobble: scrobbleImpl,
        scrobbleMany: scrobbleManyImpl,
        postBatchTrackScrobble: scrobbleManyImpl
    };
}
//# sourceMappingURL=track.js.map