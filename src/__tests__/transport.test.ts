import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { LastFmApiError, signedPost } from '../utils.js'
import { type FetchMock, installFetchMock, parseFormBody, parseUrl } from './helpers/fetch-mock.js'

const API_KEY = 'test-api-key'
const SHARED_SECRET = 'test-shared-secret'
const SESSION_KEY = 'SESSION-KEY-VALUE'

/**
 * Tests for the signed POST transport introduced in issue #68.
 *
 * The transport is the single place where:
 *  - reserved fields are generated (method, api_key, api_sig, format),
 *  - session keys are resolved and validated,
 *  - the request body is built,
 *  - errors are routed through `parseLastFmResponse`.
 *
 * It is not re-exported through the package's public `exports` map, so these
 * tests import it directly from `utils.js` (the module is internal but
 * importable inside the package).
 */
describe('signed POST transport (issue #68)', () => {
	let mock: FetchMock

	beforeEach(() => {
		mock = installFetchMock()
	})

	afterEach(() => {
		mock.restore()
	})

	// ── single scrobble: routing, body, signature ─────────────────────────

	describe('single track.scrobble', () => {
		test('sends a signed POST with form body; nothing signed in the URL', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: {
					artist: 'Test Artist',
					track: 'Test Track',
					timestamp: 1700000000,
				},
			})

			const call = mock.lastCall()
			// No signed parameters in the URL.
			expect(call.url).toBe('https://ws.audioscrobbler.com/2.0/')
			expect(call.url).not.toContain('artist=')
			expect(call.url).not.toContain('api_sig=')
			// Method is POST, content-type is form-urlencoded.
			expect(call.method).toBe('POST')
			expect(call.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
			// Body contains the canonical fields and the functional params.
			const body = parseFormBody(call.body)
			expect(body.method).toBe('track.scrobble')
			expect(body.api_key).toBe(API_KEY)
			expect(body.sk).toBe(SESSION_KEY)
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/)
			expect(body.format).toBe('json')
			expect(body.artist).toBe('Test Artist')
			expect(body.track).toBe('Test Track')
			expect(body.timestamp).toBe('1700000000')
		})

		test('signature excludes format and api_sig and is reproducible from a fixed vector', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: {
					artist: 'Fixed Artist',
					track: 'Fixed Track',
					timestamp: 1700000000,
				},
			})

			const body = parseFormBody(mock.lastCall().body)
			// Reconstruct the signature from the public algorithm.
			// sorted keys: api_key, artist, method, sk, timestamp, track
			const { md5 } = await import('js-md5')
			const expected = md5(
				`api_key${API_KEY}artistFixed Artistmethodtrack.scrobblesk${SESSION_KEY}timestamp1700000000trackFixed Track${SHARED_SECRET}`,
			)
			expect(body.api_sig).toBe(expected)
			// Sanity: `format` and `api_sig` were never part of the input.
			expect(body.format).toBe('json')
			expect(body.api_sig).not.toBe('api_sig')
		})

		test('coerces numeric timestamp to string in the wire body', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: { artist: 'A', track: 'T', timestamp: 1700000000 },
			})

			const body = parseFormBody(mock.lastCall().body)
			expect(body.timestamp).toBe('1700000000')
		})

		test('passes through optional album', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: { artist: 'A', track: 'T', timestamp: 1, album: 'The Album' },
			})

			const body = parseFormBody(mock.lastCall().body)
			expect(body.album).toBe('The Album')
		})
	})

	// ── batch scrobble: indexed params, 50-cap, default baseUrl ───────────

	describe('batch track.scrobble', () => {
		test('preserves indexed artist[0], track[0], timestamp[0], album[0] keys', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 2, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: {
					sk: SESSION_KEY,
					'artist[0]': 'A',
					'track[0]': 'T0',
					'timestamp[0]': 1700000000,
					'artist[1]': 'B',
					'track[1]': 'T1',
					'timestamp[1]': 1700000100,
					'album[1]': 'Album B',
				},
			})

			const body = parseFormBody(mock.lastCall().body)
			expect(body['artist[0]']).toBe('A')
			expect(body['track[0]']).toBe('T0')
			expect(body['timestamp[0]']).toBe('1700000000')
			expect(body['artist[1]']).toBe('B')
			expect(body['track[1]']).toBe('T1')
			expect(body['timestamp[1]']).toBe('1700000100')
			expect(body['album[1]']).toBe('Album B')
		})

		test('does not put any write parameter in the URL', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: { sk: SESSION_KEY, 'artist[0]': 'A', 'track[0]': 'T', 'timestamp[0]': 1 },
			})

			const url = mock.lastCall().url
			expect(url).toBe('https://ws.audioscrobbler.com/2.0/')
			expect(url).not.toContain('artist')
			expect(url).not.toContain('api_sig')
		})
	})

	// ── session resolution and pre-fetch failures ────────────────────────

	describe('session resolution and pre-fetch failures', () => {
		test('request sk overrides config.sessionKey', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: 'from-config' }, 'track.scrobble', {
				params: {
					artist: 'A',
					track: 'T',
					timestamp: 1,
					sk: 'from-request',
				},
			})

			const body = parseFormBody(mock.lastCall().body)
			expect(body.sk).toBe('from-request')
		})

		test('config.sessionKey is used when request does not provide sk', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: 'from-config' }, 'track.scrobble', {
				params: { artist: 'A', track: 'T', timestamp: 1 },
			})

			const body = parseFormBody(mock.lastCall().body)
			expect(body.sk).toBe('from-config')
		})

		test('missing session fails before fetch with a clear, sanitized error', async () => {
			let caught: unknown
			try {
				await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET }, 'track.scrobble', {
					params: { artist: 'My Artist', track: 'My Track', timestamp: 1 },
				})
			} catch (err) {
				caught = err
			}
			expect(caught).toBeInstanceOf(LastFmApiError)
			const e = caught as LastFmApiError
			expect(e.httpStatus).toBe(0) // pre-fetch
			expect(e.message.toLowerCase()).toContain('session key')
			// The error must not contain any of the request values.
			expect(e.message).not.toContain('My Artist')
			expect(e.message).not.toContain('My Track')
			// No fetch was made.
			expect(mock.calls).toHaveLength(0)
		})

		test('missing sharedSecret fails before fetch with a clear, sanitized error', async () => {
			let caught: unknown
			try {
				await signedPost({ apiKey: API_KEY, sessionKey: SESSION_KEY }, 'track.scrobble', {
					params: { artist: 'My Artist', track: 'My Track', timestamp: 1 },
				})
			} catch (err) {
				caught = err
			}
			expect(caught).toBeInstanceOf(LastFmApiError)
			const e = caught as LastFmApiError
			expect(e.httpStatus).toBe(0)
			expect(e.message.toLowerCase()).toContain('sharedsecret')
			expect(e.message).not.toContain('My Artist')
			expect(e.message).not.toContain('My Track')
			expect(mock.calls).toHaveLength(0)
		})
	})

	// ── reserved field protection ────────────────────────────────────────

	describe('reserved field protection', () => {
		test('caller cannot override method, api_key, api_sig, or format via params', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: {
					artist: 'A',
					track: 'T',
					timestamp: 1,
					// attempt to inject:
					method: 'foo.bar',
					api_key: 'attacker-key',
					api_sig: '0'.repeat(32),
					format: 'xml',
				},
			})

			const body = parseFormBody(mock.lastCall().body)
			expect(body.method).toBe('track.scrobble')
			expect(body.api_key).toBe(API_KEY)
			expect(body.format).toBe('json')
			expect(body.api_sig).not.toBe('0'.repeat(32))
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/)
		})

		test('caller cannot replace method, body, or Content-Type via init', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: { artist: 'A', track: 'T', timestamp: 1 },
				init: {
					method: 'GET',
					body: 'hijacked',
					headers: { 'Content-Type': 'text/plain' },
				},
			})

			const call = mock.lastCall()
			expect(call.method).toBe('POST')
			expect(call.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
			expect(call.body).not.toBe('hijacked')
			expect(call.body).toContain('method=track.scrobble')
		})
	})

	// ── RequestInit preservation ─────────────────────────────────────────

	describe('RequestInit preservation', () => {
		test('preserves caller-provided signal', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			const controller = new AbortController()
			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: { artist: 'A', track: 'T', timestamp: 1 },
				init: { signal: controller.signal },
			})

			expect(mock.lastCall().init?.signal).toBe(controller.signal)
		})

		test('preserves safe caller-provided headers (besides Content-Type)', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: { artist: 'A', track: 'T', timestamp: 1 },
				init: { headers: { 'X-Trace-Id': 'abc-123' } },
			})

			const headers = mock.lastCall().headers
			expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded')
			expect(headers['X-Trace-Id']).toBe('abc-123')
		})
	})

	// ── error routing ────────────────────────────────────────────────────

	describe('error routing', () => {
		test('HTTP failure with no JSON body surfaces as LastFmApiError', async () => {
			mock.respondWithHttpError(500, 'Internal Server Error', 'not json')

			let caught: unknown
			try {
				await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
					params: { artist: 'A', track: 'T', timestamp: 1 },
				})
			} catch (err) {
				caught = err
			}
			expect(caught).toBeInstanceOf(LastFmApiError)
			expect((caught as LastFmApiError).httpStatus).toBe(500)
		})

		test('Last.fm error envelope surfaces as LastFmApiError with code and message', async () => {
			mock.respondWithJson({ error: 14, message: 'Unauthorized Token' })

			let caught: unknown
			try {
				await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
					params: { artist: 'A', track: 'T', timestamp: 1 },
				})
			} catch (err) {
				caught = err
			}
			expect(caught).toBeInstanceOf(LastFmApiError)
			const e = caught as LastFmApiError
			expect(e.code).toBe(14)
			expect(e.httpStatus).toBe(200)
			expect(e.message).toContain('Unauthorized Token')
		})

		test('empty success body is returned, not turned into an error', async () => {
			mock.respondWith('', { status: 200 })

			const result = await signedPost(
				{ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY },
				'track.scrobble',
				{ params: { artist: 'A', track: 'T', timestamp: 1 } },
			)

			expect(result).toBeNull()
		})
	})

	// ── baseUrl handling ────────────────────────────────────────────────

	describe('baseUrl handling', () => {
		test('uses default baseUrl when config.baseUrl is undefined', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET, sessionKey: SESSION_KEY }, 'track.scrobble', {
				params: { artist: 'A', track: 'T', timestamp: 1 },
			})

			const { base } = parseUrl(mock.lastCall().url)
			expect(base).toBe('https://ws.audioscrobbler.com/2.0/')
		})

		test('honours an explicit config.baseUrl', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			await signedPost(
				{
					apiKey: API_KEY,
					sharedSecret: SHARED_SECRET,
					sessionKey: SESSION_KEY,
					baseUrl: 'https://example.test/api/',
				},
				'track.scrobble',
				{ params: { artist: 'A', track: 'T', timestamp: 1 } },
			)

			const { base } = parseUrl(mock.lastCall().url)
			expect(base).toBe('https://example.test/api/')
		})
	})

	// ── session-less signed methods (capability, used by #72) ───────────

	describe('session-less signed methods (forward-compat for #72)', () => {
		test('requiresSession: false omits sk from signature and body', async () => {
			mock.respondWithJson({ token: 'some-token' })

			await signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET }, 'auth.getToken', {
				params: {},
				requiresSession: false,
			})

			const call = mock.lastCall()
			const body = parseFormBody(call.body)
			expect(body.method).toBe('auth.getToken')
			expect(body.api_key).toBe(API_KEY)
			expect(body.format).toBe('json')
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/)
			// No sk anywhere.
			expect(body.sk).toBeUndefined()
			expect(JSON.stringify(call.headers)).not.toContain(SESSION_KEY)
		})

		test('requiresSession: false does not fail when config has no sessionKey', async () => {
			mock.respondWithJson({ token: 'some-token' })

			await expect(
				signedPost({ apiKey: API_KEY, sharedSecret: SHARED_SECRET }, 'auth.getToken', {
					params: {},
					requiresSession: false,
				}),
			).resolves.toBeDefined()
		})
	})

	// ── end-to-end through the public service surface ────────────────────

	describe('integration through LastFmClient.track', () => {
		test('scrobble and postTrackScrobble share the same implementation', () => {
			const client = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: SESSION_KEY,
			})
			expect(client.track.scrobble).toBe(client.track.postTrackScrobble)
		})

		test('scrobbleMany and postBatchTrackScrobble share the same implementation', () => {
			const client = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: SESSION_KEY,
			})
			expect(client.track.scrobbleMany).toBe(client.track.postBatchTrackScrobble)
		})

		test('scrobble routes a numeric timestamp through the service', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 1, ignored: 0 } } })

			const client = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: SESSION_KEY,
			})
			await client.track.scrobble({
				artist: 'A',
				track: 'T',
				timestamp: 1700000000,
			})

			const body = parseFormBody(mock.lastCall().body)
			expect(body.timestamp).toBe('1700000000')
		})

		test('scrobbleMany preserves indexed batch keys through the service', async () => {
			mock.respondWithJson({ scrobbles: { scrobble: {}, '@attr': { accepted: 2, ignored: 0 } } })

			const client = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: SHARED_SECRET,
				sessionKey: SESSION_KEY,
			})
			await client.track.scrobbleMany({
				tracks: [
					{ artist: 'A1', track: 'T1', timestamp: 1700000000 },
					{ artist: 'A2', track: 'T2', timestamp: 1700000100, album: 'Album 2' },
				],
			})

			const body = parseFormBody(mock.lastCall().body)
			expect(body['artist[0]']).toBe('A1')
			expect(body['track[0]']).toBe('T1')
			expect(body['timestamp[0]']).toBe('1700000000')
			expect(body['artist[1]']).toBe('A2')
			expect(body['track[1]']).toBe('T2')
			expect(body['album[1]']).toBe('Album 2')
		})
	})
})
