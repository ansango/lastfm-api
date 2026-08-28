import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { type AuthService, createAuthService } from '../entrypoints/auth.js'
import * as authSchemas from '../entrypoints/auth.schemas.js'
import { createClient } from '../index.js'
import { LastFmApiError } from '../utils.js'
import { LAST_FM_ERROR_CODES, lastFmError } from './fixtures/lastfm-responses.js'
import { type FetchMock, installFetchMock, parseFormBody, parseUrl } from './helpers/fetch-mock.js'

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
 *  - getMobileSession() uses HTTPS, never puts the password in the URL,
 *    fails before fetch when the custom baseUrl is HTTP, and produces
 *    sanitized errors that never include the password;
 *  - getSession() is unchanged and still works end-to-end.
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

	describe('getMobileSession', () => {
		const USERNAME = 'fake-mobile-username-2024'
		const PASSWORD = 'super-secret-password-XXX-zzz' // fake but realistic-looking, unique token

		test('routes via HTTPS signed POST with username + password in body and no sk', async () => {
			mock.respondWithJson({
				session: { name: USERNAME, key: 'NEW_SESSION_KEY', subscriber: 0 },
			})

			const result = await client.auth.getMobileSession({
				username: USERNAME,
				password: PASSWORD,
			})

			const call = mock.lastCall()
			// HTTPS endpoint, no protocol downgrade.
			expect(call.url).toBe('https://ws.audioscrobbler.com/2.0/')
			// Signed POST.
			expect(call.method).toBe('POST')
			expect(call.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
			// Body contains the credentials and the canonical fields, never
			// in the URL.
			const body = parseFormBody(call.body)
			expect(body.method).toBe('auth.getMobileSession')
			expect(body.api_key).toBe(API_KEY)
			expect(body.username).toBe(USERNAME)
			expect(body.password).toBe(PASSWORD)
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/)
			expect(body.format).toBe('json')
			expect(body.sk).toBeUndefined()
			// URL never contains credentials.
			expect(call.url).not.toContain(USERNAME)
			expect(call.url).not.toContain(PASSWORD)
			// Returned session is the parsed response.
			expect(result.session.name).toBe(USERNAME)
			expect(result.session.key).toBe('NEW_SESSION_KEY')
		})

		test('signature excludes format and api_sig; reproducible from a fixed vector', async () => {
			mock.respondWithJson({ session: { name: 'u', key: 'k', subscriber: 0 } })

			await client.auth.getMobileSession({
				username: 'fixed_user',
				password: 'fixed_password',
			})

			const body = parseFormBody(mock.lastCall().body)
			// sorted: api_key, method, password, username
			const { md5 } = await import('js-md5')
			const expected = md5(
				`api_key${API_KEY}methodauth.getMobileSessionpasswordfixed_passwordusernamefixed_user${SHARED_SECRET}`,
			)
			expect(body.api_sig).toBe(expected)
		})

		test('rejects a non-HTTPS custom baseUrl before any fetch with no credentials in the error', async () => {
			const httpClient = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				baseUrl: 'http://insecure.example.test/2.0/',
			})

			let caught: unknown
			try {
				await httpClient.auth.getMobileSession({ username: USERNAME, password: PASSWORD })
			} catch (err) {
				caught = err
			}
			expect(caught).toBeInstanceOf(LastFmApiError)
			const e = caught as LastFmApiError
			expect(e.httpStatus).toBe(0)
			// Sanitized: full credentials strings never appear in the message.
			expect(e.message).not.toContain(PASSWORD)
			expect(e.message).not.toContain(USERNAME)
			expect(e.message.toLowerCase()).toContain('https')
			// No fetch was attempted.
			expect(mock.calls).toHaveLength(0)
		})

		test('honours an explicit https:// custom baseUrl', async () => {
			const httpsClient = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				baseUrl: 'https://proxy.example.test/2.0/',
			})
			mock.respondWithJson({ session: { name: 'u', key: 'k', subscriber: 0 } })

			await httpsClient.auth.getMobileSession({ username: USERNAME, password: PASSWORD })

			const { base } = parseUrl(mock.lastCall().url)
			expect(base).toBe('https://proxy.example.test/2.0/')
		})

		test('fails before fetch when sharedSecret is missing, with no credentials in the error', async () => {
			const noSecretClient = new LastFmClient({ apiKey: API_KEY })

			let caught: unknown
			try {
				await noSecretClient.auth.getMobileSession({ username: USERNAME, password: PASSWORD })
			} catch (err) {
				caught = err
			}
			expect(caught).toBeInstanceOf(LastFmApiError)
			const e = caught as LastFmApiError
			expect(e.httpStatus).toBe(0)
			expect(e.message).not.toContain(PASSWORD)
			expect(e.message).not.toContain(USERNAME)
			expect(e.message.toLowerCase()).toContain('sharedsecret')
			expect(mock.calls).toHaveLength(0)
		})

		test('does not persist the returned session on the client (caller owns it)', async () => {
			mock.respondWithJson({
				session: { name: USERNAME, key: 'RETURNED_SESSION_KEY', subscriber: 0 },
			})

			const before = client.getConfig().sessionKey
			await client.auth.getMobileSession({ username: USERNAME, password: PASSWORD })
			const after = client.getConfig().sessionKey

			expect(before).toBeUndefined()
			expect(after).toBeUndefined()
		})

		test('Last.fm error envelope becomes LastFmApiError with code', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.AUTHENTICATION_FAILED, 'Authentication failed'))

			let caught: unknown
			try {
				await client.auth.getMobileSession({ username: USERNAME, password: PASSWORD })
			} catch (err) {
				caught = err
			}
			expect(caught).toBeInstanceOf(LastFmApiError)
			expect((caught as LastFmApiError).code).toBe(LAST_FM_ERROR_CODES.AUTHENTICATION_FAILED)
		})
	})

	describe('import coverage', () => {
		test('auth service is exposed from root, auth entrypoint, and auth.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY, sharedSecret: SHARED_SECRET })
			expect(typeof c.auth.getSession).toBe('function')
			expect(typeof c.auth.getToken).toBe('function')
			expect(typeof c.auth.getMobileSession).toBe('function')

			const svc: AuthService = createAuthService({ apiKey: API_KEY, sharedSecret: SHARED_SECRET })
			expect(typeof svc.getSession).toBe('function')
			expect(typeof svc.getToken).toBe('function')
			expect(typeof svc.getMobileSession).toBe('function')

			// Schema entrypoint exposes every new schema and the legacy ones.
			expect(authSchemas.authGetSessionRequestSchema).toBeDefined()
			expect(authSchemas.authGetSessionResponseSchema).toBeDefined()
			expect(authSchemas.authGetTokenResponseSchema).toBeDefined()
			expect(authSchemas.authGetMobileSessionRequestSchema).toBeDefined()
			expect(authSchemas.authGetMobileSessionResponseSchema).toBeDefined()
			expect(authSchemas.sessionSchema).toBeDefined()
		})
	})
})
