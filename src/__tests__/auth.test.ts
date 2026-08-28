import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { type AuthService, createAuthService } from '../entrypoints/auth.js'
import * as authSchemas from '../entrypoints/auth.schemas.js'
import { createClient } from '../index.js'
import { LastFmApiError } from '../utils.js'
import { LAST_FM_ERROR_CODES, lastFmError } from './fixtures/lastfm-responses.js'
import { type FetchMock, installFetchMock, parseUrl } from './helpers/fetch-mock.js'

const API_KEY = 'test-api-key'
const SHARED_SECRET = 'test-shared-secret'

/**
 * Tests for the auth service (issue #72).
 *
 * The transport behaviour shared with track.scrobble (signature shape, body
 * encoding, RequestInit preservation, error routing) is covered in
 * transport.test.ts. Here we focus on the auth-specific concerns:
 *
 *  - getToken() works without a request object and signs only with the
 *    method/api_key/sharedSecret triple (no sk);
 *  - getSession() is unchanged and still works end-to-end.
 *
 * `auth.getMobileSession` was removed in v4.0.0 (BREAKING); use the
 * browser flow instead.
 */
describe('auth service', () => {
	let mock: FetchMock
	let client: LastFmClient

	beforeEach(() => {
		mock = installFetchMock()
		client = new LastFmClient({ apiKey: API_KEY, sharedSecret: SHARED_SECRET })
	})

	afterEach(() => mock.restore())

	describe('getSession (regression — unchanged by #72)', () => {
		test('routes to auth.getSession with token and api_sig, returns parsed payload', async () => {
			mock.respondWithJson({
				session: { name: 'test_user', key: 'SESSION_KEY_VALUE', subscriber: 0 },
			})

			const result = await client.auth.getSession({ token: 'test-token' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('auth.getSession')
			expect(params.api_key).toBe(API_KEY)
			expect(params.format).toBe('json')
			expect(params.token).toBe('test-token')
			expect(params.api_sig).toMatch(/^[a-f0-9]{32}$/)
			expect(result.session.name).toBe('test_user')
		})

		test('throws LastFmApiError on auth failure', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.AUTHENTICATION_FAILED, 'Authentication failed'))

			await expect(client.auth.getSession({ token: 'bad' })).rejects.toBeInstanceOf(LastFmApiError)
		})
	})

	describe('getToken', () => {
		test('works without a request object and signs GET with no sk', async () => {
			mock.respondWithJson({ token: 'request-token-abc' })

			const result = await client.auth.getToken()

			const call = mock.lastCall()
			const { params, base } = parseUrl(call.url)
			expect(base).toBe('https://ws.audioscrobbler.com/2.0/')
			expect(params.method).toBe('auth.getToken')
			expect(params.api_key).toBe(API_KEY)
			expect(params.format).toBe('json')
			expect(params.api_sig).toMatch(/^[a-f0-9]{32}$/)
			// No sk anywhere.
			expect(params.sk).toBeUndefined()
			expect(call.method).toBe('GET')
			expect(call.body).toBeUndefined()
			expect(result.token).toBe('request-token-abc')
		})

		test('response includes a pre-built authUrl pointing at last.fm/api/auth', async () => {
			mock.respondWithJson({ token: 'request-token-abc' })

			const result = await client.auth.getToken()

			expect(result.authUrl).toBe(`https://www.last.fm/api/auth/?api_key=${API_KEY}&token=request-token-abc`)
		})

		test('authUrl is independent of the network roundtrip (built from the returned token)', async () => {
			// Verifies the authUrl is constructed from `response.token` (the value
			// Last.fm gave us), not from a separate request. A custom Last.fm
			// response token must propagate into the authUrl verbatim.
			mock.respondWithJson({ token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4' })

			const result = await client.auth.getToken()

			expect(result.authUrl).toContain('token=a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4')
			expect(result.authUrl).toContain(`api_key=${API_KEY}`)
		})

		test('signature is reproducible from a fixed vector (method + api_key only)', async () => {
			mock.respondWithJson({ token: 'tok' })

			await client.auth.getToken()

			const { params } = parseUrl(mock.lastCall().url)
			// Sorted: api_key, method → "api_keytest-api-keymethodauth.getTokentest-shared-secret"
			const { md5 } = await import('js-md5')
			const expected = md5(`api_key${API_KEY}methodauth.getToken${SHARED_SECRET}`)
			expect(params.api_sig).toBe(expected)
		})

		test('preserves caller-provided signal and safe headers', async () => {
			mock.respondWithJson({ token: 'tok' })
			const controller = new AbortController()
			await client.auth.getToken({ signal: controller.signal, headers: { 'X-Trace-Id': 't-1' } })

			const call = mock.lastCall()
			expect(call.init?.signal).toBe(controller.signal)
			expect(call.headers['X-Trace-Id']).toBe('t-1')
		})

		test('Last.fm error envelope becomes LastFmApiError', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.AUTHENTICATION_FAILED, 'Authentication failed'))

			await expect(client.auth.getToken()).rejects.toBeInstanceOf(LastFmApiError)
		})
	})

	describe('import coverage', () => {
		test('auth service is exposed from root, auth entrypoint, and auth.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY, sharedSecret: SHARED_SECRET })
			expect(typeof c.auth.getSession).toBe('function')
			expect(typeof c.auth.getToken).toBe('function')

			const svc: AuthService = createAuthService({ apiKey: API_KEY, sharedSecret: SHARED_SECRET })
			expect(typeof svc.getSession).toBe('function')
			expect(typeof svc.getToken).toBe('function')

			// Schema entrypoint exposes every new schema and the legacy ones.
			expect(authSchemas.authGetSessionRequestSchema).toBeDefined()
			expect(authSchemas.authGetSessionResponseSchema).toBeDefined()
			expect(authSchemas.authGetTokenResponseSchema).toBeDefined()
			expect(authSchemas.sessionSchema).toBeDefined()
		})
	})
})
