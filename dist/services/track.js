import { fetcher, buildUrl, signedPost, LastFmApiError } from '../utils.js';
import { buildBatchScrobbleParams, buildScrobbleParams } from './track.utils.js';
function resolveSessionKeyForNowPlaying(config, requestSk) {
    const sk = requestSk ?? config.sessionKey;
    if (!sk) {
        throw new LastFmApiError('A session key (`sk`) is required to track.updateNowPlaying. Pass `sk` in the request params or set `sessionKey` on the LastFmConfig.', 0);
    }
    return sk;
}
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
        getCorrection: (params, init) => fetcher(buildUrl(config, 'track.getCorrection', params), init),
        search: (params, init) => fetcher(buildUrl(config, 'track.search', params), init),
        scrobble: scrobbleImpl,
        postTrackScrobble: scrobbleImpl,
        scrobbleMany: scrobbleManyImpl,
        postBatchTrackScrobble: scrobbleManyImpl,
        updateNowPlaying: (params, init) => {
            const sk = resolveSessionKeyForNowPlaying(config, params.sk);
            return signedPost(config, 'track.updateNowPlaying', {
                params: {
                    artist: params.artist,
                    track: params.track,
                    album: params.album,
                    trackNumber: params.trackNumber,
                    context: params.context,
                    mbid: params.mbid,
                    duration: params.duration,
                    albumArtist: params.albumArtist,
                    sk
                },
                init
            });
        }
    };
}
//# sourceMappingURL=track.js.map