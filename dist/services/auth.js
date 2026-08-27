import { fetcher, buildAuthUrl, signedPost, LastFmApiError } from '../utils.js';
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
                password: params.password
            },
            requiresSession: false,
            init
        });
    };
    return {
        getSession: (params, init) => fetcher(buildAuthUrl(config, 'auth.getSession', params), init),
        getToken: (init) => fetcher(buildAuthUrl(config, 'auth.getToken'), init),
        getMobileSession: getMobileSessionImpl
    };
}
//# sourceMappingURL=auth.js.map