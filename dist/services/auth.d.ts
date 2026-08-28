import type { LastFmConfig } from '../config.js';
import type { AuthGetMobileSessionRequest, AuthGetMobileSessionResponse, AuthGetSessionRequest, AuthGetSessionResponse, AuthGetTokenResponse } from './auth.schemas.js';
export interface AuthService {
    /**
     * Get the session key for a user. Used for authenticating a user when scrobbling.
     *
     * This is the second step of the **browser-based auth flow**:
     * 1. `auth.getToken()` — returns a request token
     * 2. Direct the user to `https://www.last.fm/api/auth/?api_key=<KEY>&token=<token>` in a browser
     * 3. The user authorises the app, Last.fm redirects to your callback URL with the same token
     * 4. Call `auth.getSession({ token })` — this method — to exchange the authorised token for a session key
     *
     * The returned `session.key` is what write methods (`track.love`, `track.scrobble`, …) expect as `sk`.
     *
     * @param {AuthGetSessionRequest} params
     * @param {RequestInit} init
     * @returns {Promise<AuthGetSessionResponse>}
     * https://www.last.fm/api/show/auth.getSession
     * */
    getSession: (params: AuthGetSessionRequest, init?: RequestInit) => Promise<AuthGetSessionResponse>;
    /**
     * Get a request token for user authentication. The returned token still
     * requires the user to authorise it on the Last.fm website before it can
     * be exchanged for a session via `auth.getSession`.
     *
     * Signed GET with no functional request parameters and no existing
     * session. Safe to call from any environment.
     *
     * This is the first step of the **browser-based auth flow** — the
     * recommended path for self-service users. The full flow is:
     * 1. `auth.getToken()` — this method
     * 2. Open the returned `authUrl` in a browser. Log in if prompted, click "Allow access"
     * 3. Last.fm redirects to the callback URL configured on your API account with the same token
     * 4. `auth.getSession({ token })` to exchange for the session key
     *
     * The response includes a pre-built `authUrl` so consumers don't have to
     * construct the URL themselves. The CLI prints it; Scalar renders it in
     * the "Try it" response.
     *
     * @param {RequestInit} init
     * @returns {Promise<AuthGetTokenResponse>} `{ token, authUrl }` — `authUrl` is
     *   the full Last.fm auth URL ready to open in a browser.
     * https://www.last.fm/api/show/auth.getToken
     */
    getToken: (init?: RequestInit) => Promise<AuthGetTokenResponse>;
    /**
     * Get a mobile session for a user, exchanging a username/email and
     * password for a session key. Returns the session to the caller; the
     * client does not persist it.
     *
     * **Server-side / trusted environments only.** This method handles a
     * password and the application's shared secret; it must never be used
     * from a browser or any environment where the bundle is exposed.
     *
     * **Mobile-class API keys only.** Last.fm rejects this call with 403
     * (`error: 4 — Authentication Failed`) for self-service web/desktop
     * API keys. Self-service users should use the browser flow
     * (`auth.getToken` + `auth.getSession`) instead. The Last.fm create
     * form has no app-type selector; to obtain a mobile-class key you
     * need to email `partners@last.fm` and ask for a reclassification.
     *
     * Requires HTTPS — a custom `baseUrl` over plain HTTP is rejected
     * before any network call.
     *
     * Intentionally does not support the deprecated `authToken` /
     * `md5(username + md5(password))` credential flow.
     *
     * @deprecated Last.fm restricts this method to **mobile-class API
     * keys**, which are not exposed through the public self-service create
     * form. Every self-service key defaults to "web", so this call returns
     * `error: 4 — Authentication Failed` for almost all users. Use the
     * browser flow (`auth.getToken` + `auth.getSession`) instead, which
     * works for every self-service API key. See
     * <https://www.last.fm/api/webauth> for the full flow. This method
     * is still callable and will be removed in a future major release.
     *
     * @param {AuthGetMobileSessionRequest} params
     * @param {RequestInit} init
     * @returns {Promise<AuthGetMobileSessionResponse>}
     * https://www.last.fm/api/show/auth.getMobileSession
     */
    getMobileSession: (params: AuthGetMobileSessionRequest, init?: RequestInit) => Promise<AuthGetMobileSessionResponse>;
}
export declare function createAuthService(config: LastFmConfig): AuthService;
//# sourceMappingURL=auth.d.ts.map