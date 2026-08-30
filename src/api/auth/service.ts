import type { LastFmConfig } from '../../core/config.js'
import { buildAuthUrl, fetcher } from '../../core/index.js'
import type { AuthGetSessionRequest, AuthGetSessionResponse, AuthGetTokenResponse } from './schemas.js'

export interface AuthService {
	getSession: (params: AuthGetSessionRequest, init?: RequestInit) => Promise<AuthGetSessionResponse>
	getToken: (init?: RequestInit) => Promise<AuthGetTokenResponse>
}

export function createAuthService(config: LastFmConfig): AuthService {
	return {
		getSession: (params, init) =>
			fetcher<AuthGetSessionResponse>(buildAuthUrl(config, 'auth.getSession', params), init),
		getToken: async (init) => {
			const response = await fetcher<AuthGetTokenResponse>(buildAuthUrl(config, 'auth.getToken'), init)
			if (response?.token) {
				response.authUrl = `https://www.last.fm/api/auth/?api_key=${encodeURIComponent(config.apiKey)}&token=${encodeURIComponent(response.token)}`
			}
			return response
		},
	}
}
