import { fetcher, buildAuthUrl } from '../utils.js';
export function createAuthService(config) {
    return {
        getSession: async (params, init) => fetcher(buildAuthUrl(config, 'auth.getSession', params), init)
    };
}
//# sourceMappingURL=auth.js.map