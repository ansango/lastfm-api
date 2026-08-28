import { buildAuthUrl, fetcher, LastFmApiError, signedPost } from '../utils.js';
export function createAuthService(config) {
    const getMobileSessionImpl = (params, init) => {
        // Enforce HTTPS before any network call. The default baseUrl is
        // already https://, so this only fires when a caller has set a
        // custom baseUrl over plain http://. If baseUrl is undefined we
        // trust the default (which is HTTPS) and let signedPost use it.
        if (config.baseUrl !== undefined && !config.baseUrl.toLowerCase().startsWith('https://')) {
            throw new LastFmApiError('`auth.getMobileSession` requires HTTPS. Use the default baseUrl or set `baseUrl` to an https:// URL.', 0);
        }
        return signedPost(config, 'auth.getMobileSession', {
            params: {
                username: params.username,
                password: params.password,
            },
            requiresSession: false,
            init,
        });
    };
    return {
        getSession: (params, init) => fetcher(buildAuthUrl(config, 'auth.getSession', params), init),
        getToken: async (init) => {
            const response = await fetcher(buildAuthUrl(config, 'auth.getToken'), init);
            // Augment with the pre-built user-facing auth URL so consumers
            // don't have to construct `https://www.last.fm/api/auth/?api_key=...&token=...`
            // themselves. The CLI prints it; Scalar renders it in the response.
            // Note: this URL is NOT signed (Last.fm's /api/auth/ endpoint takes
            // api_key + token in clear, no api_sig). It also doesn't honour a
            // custom `baseUrl` because the user-facing auth page is always
            // hosted at last.fm/api/auth/ — only the API baseUrl is configurable.
            const authUrl = new URL('https://www.last.fm/api/auth/');
            authUrl.searchParams.set('api_key', config.apiKey);
            authUrl.searchParams.set('token', response.token);
            return {
                ...response,
                authUrl: authUrl.toString(),
            };
        },
        getMobileSession: getMobileSessionImpl,
    };
}
//# sourceMappingURL=auth.js.map