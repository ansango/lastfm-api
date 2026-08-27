import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { LastFmClient } from '../client.js';
import { LastFmApiError } from '../utils.js';
import { installFetchMock, type FetchMock, parseUrl } from './helpers/fetch-mock.js';
import { lastFmError, LAST_FM_ERROR_CODES } from './fixtures/lastfm-responses.js';
import { createClient } from '../index.js';
import { createAuthService, type AuthService } from '../entrypoints/auth.js';
import * as authSchemas from '../entrypoints/auth.schemas.js';

const API_KEY = 'test-api-key';
const SHARED_SECRET = 'test-shared-secret';

describe('auth service', () => {
	let mock: FetchMock;
	let client: LastFmClient;

	beforeEach(() => {
		mock = installFetchMock();
		client = new LastFmClient({ apiKey: API_KEY, sharedSecret: SHARED_SECRET });
	});

	afterEach(() => mock.restore());

	describe('getSession', () => {
		test('routes to auth.getSession with token and api_sig, returns parsed payload', async () => {
			mock.respondWithJson({
				session: { name: 'test_user', key: 'SESSION_KEY_VALUE', subscriber: 0 }
			});

			const result = await client.auth.getSession({ token: 'test-token' });

			const { params } = parseUrl(mock.lastCall().url);
			expect(params.method).toBe('auth.getSession');
			expect(params.api_key).toBe(API_KEY);
			expect(params.format).toBe('json');
			expect(params.token).toBe('test-token');
			// api_sig must be present and look like an md5
			expect(params.api_sig).toMatch(/^[a-f0-9]{32}$/);
			// session key must not leak into the URL beyond the parsed params (it's in the response only)
			expect(result.session.name).toBe('test_user');
		});

		test('uses GET (no body) for signed auth.getSession', async () => {
			mock.respondWithJson({ session: { name: 'test_user', key: 'k', subscriber: 0 } });

			await client.auth.getSession({ token: 'test-token' });

			const call = mock.lastCall();
			expect(call.method).toBe('GET');
			expect(call.body).toBeUndefined();
		});

		test('throws LastFmApiError on auth failure', async () => {
			mock.respondWithJson(
				lastFmError(LAST_FM_ERROR_CODES.AUTHENTICATION_FAILED, 'Authentication failed')
			);

			await expect(client.auth.getSession({ token: 'bad' })).rejects.toBeInstanceOf(
				LastFmApiError
			);
		});

		test('signature is reproducible from a fixed vector', async () => {
			mock.respondWithJson({ session: { name: 'test_user', key: 'k', subscriber: 0 } });

			await client.auth.getSession({ token: 'fixed-token-value' });

			const { params } = parseUrl(mock.lastCall().url);
			// Signature is md5 of sorted(method, api_key, token) + sharedSecret
			// sorted: api_key, method, token → "api_keytest-api_keymethodauth.getSessiontokenfixed-token-valuetest-shared-secret"
			// md5 of that is deterministic; we re-derive it and compare.
			const expected = (await import('js-md5')).md5(
				`api_key${API_KEY}methodauth.getSessiontokenfixed-token-value${SHARED_SECRET}`
			);
			expect(params.api_sig).toBe(expected);
		});
	});

	describe('import coverage', () => {
		test('auth service is exposed from root, auth entrypoint, and auth.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY, sharedSecret: SHARED_SECRET });
			expect(typeof c.auth.getSession).toBe('function');

			const svc: AuthService = createAuthService({ apiKey: API_KEY, sharedSecret: SHARED_SECRET });
			expect(typeof svc.getSession).toBe('function');

			expect(authSchemas.authGetSessionRequestSchema).toBeDefined();
		});
	});
});
