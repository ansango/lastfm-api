import { fetcher, buildAuthUrl, signedPost, LastFmApiError } from '../utils.js';
import type { LastFmConfig } from '../config.js';
import type {
	AuthGetMobileSessionRequest,
	AuthGetMobileSessionResponse,
	AuthGetSessionRequest,
	AuthGetSessionResponse,
	AuthGetTokenResponse
} from './auth.schemas.js';

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
	getSession: (
		params: AuthGetSessionRequest,
		init?: RequestInit
	) => Promise<AuthGetSessionResponse>;
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
	 * 2. Direct the user to `https://www.last.fm/api/auth/?api_key=<KEY>&token=<token>` in a browser
	 * 3. The user authorises the app, Last.fm redirects to your callback URL with the same token
	 * 4. `auth.getSession({ token })` to exchange for the session key
	 *
	 * @param {RequestInit} init
	 * @returns {Promise<AuthGetTokenResponse>}
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
	 * @param {AuthGetMobileSessionRequest} params
	 * @param {RequestInit} init
	 * @returns {Promise<AuthGetMobileSessionResponse>}
	 * https://www.last.fm/api/show/auth.getMobileSession
	 */
	getMobileSession: (
		params: AuthGetMobileSessionRequest,
		init?: RequestInit
	) => Promise<AuthGetMobileSessionResponse>;
}

export function createAuthService(config: LastFmConfig): AuthService {
	const getMobileSessionImpl = (params: AuthGetMobileSessionRequest, init?: RequestInit) => {
		// Enforce HTTPS before any network call. The default baseUrl is
		// already https://, so this only fires when a caller has set a
		// custom baseUrl over plain http://. If baseUrl is undefined we
		// trust the default (which is HTTPS) and let signedPost use it.
		if (config.baseUrl !== undefined && !config.baseUrl.toLowerCase().startsWith('https://')) {
			throw new LastFmApiError(
				'`auth.getMobileSession` requires HTTPS. Use the default baseUrl or set `baseUrl` to an https:// URL.',
				0
			);
		}
		return signedPost<AuthGetMobileSessionResponse>(config, 'auth.getMobileSession', {
			params: {
				username: params.username,
				password: params.password
			},
			requiresSession: false,
			init
		});
	};

	return {
		getSession: (params, init) =>
			fetcher<AuthGetSessionResponse>(buildAuthUrl(config, 'auth.getSession', params), init),
		getToken: (init) => fetcher<AuthGetTokenResponse>(buildAuthUrl(config, 'auth.getToken'), init),
		getMobileSession: getMobileSessionImpl
	};
}
