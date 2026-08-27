import { fetcher, buildUrl, signedPost, LastFmApiError } from '../utils.js';
function resolveSessionKeyForArtistTagMutation(config, requestSk, action) {
    const sk = requestSk ?? config.sessionKey;
    if (!sk) {
        throw new LastFmApiError(`A session key (\`sk\`) is required to artist.${action}. Pass \`sk\` in the request params or set \`sessionKey\` on the LastFmConfig.`, 0);
    }
    return sk;
}
export function createArtistService(config) {
    const addTagsImpl = (params, init) => {
        const sk = resolveSessionKeyForArtistTagMutation(config, params.sk, 'addTags');
        return signedPost(config, 'artist.addTags', {
            params: {
                artist: params.artist,
                tags: params.tags.join(','),
                sk
            },
            init
        }).then(() => undefined);
    };
    const removeTagImpl = (params, init) => {
        const sk = resolveSessionKeyForArtistTagMutation(config, params.sk, 'removeTag');
        return signedPost(config, 'artist.removeTag', {
            params: {
                artist: params.artist,
                tag: params.tag,
                sk
            },
            init
        }).then(() => undefined);
    };
    return {
        getInfo: (params, init) => fetcher(buildUrl(config, 'artist.getInfo', params), init),
        getTags: (params, init) => fetcher(buildUrl(config, 'artist.getTags', params), init),
        getSimilar: (params, init) => fetcher(buildUrl(config, 'artist.getSimilar', params), init),
        getTopTags: (params, init) => fetcher(buildUrl(config, 'artist.getTopTags', params), init),
        getTopAlbums: (params, init) => fetcher(buildUrl(config, 'artist.getTopAlbums', params), init),
        getTopTracks: (params, init) => fetcher(buildUrl(config, 'artist.getTopTracks', params), init),
        search: (params, init) => fetcher(buildUrl(config, 'artist.search', params), init),
        getCorrection: (params, init) => fetcher(buildUrl(config, 'artist.getCorrection', params), init),
        addTags: addTagsImpl,
        removeTag: removeTagImpl
    };
}
//# sourceMappingURL=artist.js.map