import type { LastFmConfig } from '../config.js';
import type { AuthGetSessionRequest, AuthGetSessionResponse } from './auth.schemas.js';
export interface AuthService {
    /**
     * Get the session key for a user. Used for authenticating a user when scrobbling.
     * @param {AuthGetSessionRequest} params
     * @param {RequestInit} init
     * @returns {Promise<AuthGetSessionResponse>}
     * https://www.last.fm/api/show/auth.getSession
     * */
    getSession: (params: AuthGetSessionRequest, init?: RequestInit) => Promise<AuthGetSessionResponse>;
}
export declare function createAuthService(config: LastFmConfig): AuthService;
//# sourceMappingURL=auth.d.ts.map