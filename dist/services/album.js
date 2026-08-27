import { fetcher, buildUrl, signedPost, LastFmApiError } from '../utils.js';
function resolveSessionKeyForTagMutation(config, requestSk, action) {
    const sk = requestSk ?? config.sessionKey;
    if (!sk) {
        throw new LastFmApiError(`A session key (\`sk\`) is required to album.${action}. Pass \`sk\` in the request params or set \`sessionKey\` on the LastFmConfig.`, 0);
    }
    return sk;
}
export function createAlbumService(config) {
    const addTagsImpl = (params, init) => {
        const sk = resolveSessionKeyForTagMutation(config, params.sk, 'addTags');
        return signedPost(config, 'album.addTags', {
            params: {
                artist: params.artist,
                album: params.album,
                tags: params.tags.join(','),
                sk
            },
            init
        }).then(() => undefined);
    };
    const removeTagImpl = (params, init) => {
        const sk = resolveSessionKeyForTagMutation(config, params.sk, 'removeTag');
        return signedPost(config, 'album.removeTag', {
            params: {
                artist: params.artist,
                album: params.album,
                tag: params.tag,
                sk
            },
            init
        }).then(() => undefined);
    };
    return {
        getInfo: (params, init) => fetcher(buildUrl(config, 'album.getInfo', params), init),
        getTags: (params, init) => fetcher(buildUrl(config, 'album.getTags', params), init),
        getTopTags: (params, init) => fetcher(buildUrl(config, 'album.getTopTags', params), init),
        search: (params, init) => fetcher(buildUrl(config, 'album.search', params), init),
        addTags: addTagsImpl,
        removeTag: removeTagImpl
    };
}
//# sourceMappingURL=album.js.map