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
