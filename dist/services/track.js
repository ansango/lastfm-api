import { fetcher, buildUrl, signedPost, LastFmApiError } from '../utils.js';
import { buildBatchScrobbleParams, buildScrobbleParams } from './track.utils.js';
function resolveSessionKeyForTrackMutation(config, requestSk, action) {
    const sk = requestSk ?? config.sessionKey;
    if (!sk) {
        throw new LastFmApiError(`A session key (\`sk\`) is required to track.${action}. Pass \`sk\` in the request params or set \`sessionKey\` on the LastFmConfig.`, 0);
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
        addTags: (params, init) => {
            const sk = resolveSessionKeyForTrackMutation(config, params.sk, 'addTags');
            return signedPost(config, 'track.addTags', {
                params: {
                    artist: params.artist,
                    track: params.track,
                    tags: params.tags.join(','),
                    sk
                },
                init
            }).then(() => undefined);
        },
        removeTag: (params, init) => {
            const sk = resolveSessionKeyForTrackMutation(config, params.sk, 'removeTag');
            return signedPost(config, 'track.removeTag', {
                params: {
                    artist: params.artist,
                    track: params.track,
                    tag: params.tag,
                    sk
                },
                init
            }).then(() => undefined);
        },
        love: (params, init) => {
            const sk = resolveSessionKeyForTrackMutation(config, params.sk, 'love');
            return signedPost(config, 'track.love', {
                params: { artist: params.artist, track: params.track, sk },
                init
            }).then(() => undefined);
        },
        unlove: (params, init) => {
            const sk = resolveSessionKeyForTrackMutation(config, params.sk, 'unlove');
            return signedPost(config, 'track.unlove', {
                params: { artist: params.artist, track: params.track, sk },
                init
            }).then(() => undefined);
        }
    };
}
//# sourceMappingURL=track.js.map