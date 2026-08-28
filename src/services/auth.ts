import type { LastFmConfig } from '../config.js'
import { buildAuthUrl, fetcher } from '../utils.js'
import type { AuthGetSessionRequest, AuthGetSessionResponse, AuthGetTokenResponse } from './auth.schemas.js'

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
	getSession: (params: AuthGetSessionRequest, init?: RequestInit) => Promise<AuthGetSessionResponse>
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
	getToken: (init?: RequestInit) => Promise<AuthGetTokenResponse>
}

export function createAuthService(config: LastFmConfig): AuthService {
	return {
		getSession: (params, init) =>
			fetcher<AuthGetSessionResponse>(buildAuthUrl(config, 'auth.getSession', params), init),
		getToken: async (init) => {
			const response = await fetcher<AuthGetTokenResponse>(buildAuthUrl(config, 'auth.getToken'), init)
			// Augment with the pre-built user-facing auth URL so consumers
			// don't have to construct `https://www.last.fm/api/auth/?api_key=...&token=...`
			// themselves. The CLI prints it; Scalar renders it in the response.
			// Note: this URL is NOT signed (Last.fm's /api/auth/ endpoint takes
			// api_key + token in clear, no api_sig). It also doesn't honour a
			// custom `baseUrl` because the user-facing auth page is always
			// hosted at last.fm/api/auth/ — only the API baseUrl is configurable.
			const authUrl = new URL('https://www.last.fm/api/auth/')
			authUrl.searchParams.set('api_key', config.apiKey)
			authUrl.searchParams.set('token', response.token)
			return {
				...response,
				authUrl: authUrl.toString(),
			}
		},
	}
}
