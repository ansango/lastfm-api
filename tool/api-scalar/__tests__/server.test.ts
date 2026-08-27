/**
 * Server smoke tests (HU5 of #92).
 *
 * Verifies that:
 *  - `createApp()` returns an OpenAPIHono app with all 57 routes
 *  - `GET /doc` returns valid OpenAPI 3.0 JSON listing all 57 paths
 *  - `GET /` returns the Scalar HTML page
 *  - One endpoint per namespace can be invoked and reaches the
 *    underlying package (with `globalThis.fetch` mocked)
 */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { createApp } from '../src/server.js';
import { mountOpenAPI } from '../src/doc.js';
import { allMethods } from '../../../src/method-registry.js';

/**
 * Build a complete app (with `/doc` and Scalar UI) for tests that
 * exercise the doc surface. Per-namespace smoke tests use plain
 * `createApp()` because they only need the 57 wired routes.
 */
function createFullApp(opts: { apiKey?: string; sharedSecret?: string; sessionKey?: string } = {}) {
	const app = createApp(opts);
	mountOpenAPI(app);
	return app;
}

const ORIGINAL_FETCH = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = ORIGINAL_FETCH;
});

function mockFetchOnce(responseBody: unknown, init?: { status?: number; contentType?: string }): void {
	const status = init?.status ?? 200;
	const contentType = init?.contentType ?? 'application/json; charset=utf-8';
	globalThis.fetch = (async () =>
		new Response(JSON.stringify(responseBody), { status, headers: { 'content-type': contentType } })) as unknown as typeof fetch;
}

describe('createApp: shape', () => {
	test('returns an OpenAPIHono app', () => {
		const app = createApp({ apiKey: 'test-key' });
		expect(typeof app.fetch).toBe('function');
	});

	test('GET /doc returns valid OpenAPI 3.0 JSON with 57 paths', async () => {
		const app = createFullApp({ apiKey: 'test-key' });
		const res = await app.request('/doc');
		expect(res.status).toBe(200);
		const body = (await res.json()) as { openapi: string; paths: Record<string, unknown> };
		expect(body.openapi).toBe('3.0.0');
		expect(Object.keys(body.paths).length).toBe(57);
	});

	test('GET / returns the Scalar HTML page', async () => {
		const app = createFullApp({ apiKey: 'test-key' });
		const res = await app.request('/');
		expect(res.status).toBe(200);
		const text = await res.text();
		expect(text).toContain('<title>');
		expect(text.toLowerCase()).toContain('scalar');
	});

	test('an unknown route returns 404 JSON', async () => {
		const app = createApp({ apiKey: 'test-key' });
		const res = await app.request('/this-does-not-exist');
		expect(res.status).toBe(404);
	});
});

describe('createApp: per-namespace smoke (mocked fetch)', () => {
	// Pick one canonical method per namespace to exercise end-to-end.
	// The query string must satisfy each method's required params.
	const samples: Array<{ id: string; path: string; query: string }> = [
		{ id: 'artist.getInfo', path: '/artist/get-info', query: '?artist=cher' },
		{ id: 'album.getInfo', path: '/album/get-info', query: '?artist=cher&album=believe' },
		{ id: 'track.getInfo', path: '/track/get-info', query: '?artist=cher&track=believe' },
		{ id: 'user.getInfo', path: '/user/get-info', query: '?user=ansango' },
		{ id: 'tag.getInfo', path: '/tag/get-info', query: '?tag=rock' },
		{ id: 'chart.getTopArtists', path: '/chart/get-top-artists', query: '?page=1&limit=10' },
		{ id: 'geo.getTopArtists', path: '/geo/get-top-artists', query: '?country=spain&limit=10' },
		{ id: 'library.getArtists', path: '/library/get-artists', query: '?user=ansango' },
		{ id: 'auth.getToken', path: '/auth/get-token', query: '' }
	];

	for (const sample of samples) {
		test(`${sample.id} → 200 with mocked Last.fm response`, async () => {
			mockFetchOnce({ ok: true, mocked: true });
			const app = createApp({ apiKey: 'test-key', sharedSecret: 'test-secret' });
			const res = await app.request(`${sample.path}${sample.query}`);
			expect(res.status).toBe(200);
			const body = (await res.json()) as { ok: boolean; mocked: boolean };
			expect(body.ok).toBe(true);
			expect(body.mocked).toBe(true);
		});
	}
});

describe('createApp: write methods hit the package with a signed POST', () => {
	test('track.love is wired as POST and reaches fetch with a body', async () => {
		let captured: { url: string; method: string; body: string } | null = null;
		globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
			captured = {
				url: String(input),
				method: init?.method ?? 'GET',
				body: typeof init?.body === 'string' ? init.body : ''
			};
			return new Response(JSON.stringify({ ok: true }), { status: 200 });
		}) as unknown as typeof fetch;

		const app = createApp({ apiKey: 'test-key', sharedSecret: 'test-secret' });
		const res = await app.request('/track/love', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ artist: 'Cher', track: 'Believe', sk: 'session-key' })
		});

		expect(res.status).toBe(200);
		expect(captured).not.toBeNull();
		expect(captured!.method).toBe('POST');
		// The package signs the request, so the body must include `api_sig`
		// and `method=track.love`.
		expect(captured!.body).toContain('api_sig=');
		expect(captured!.body).toContain('method=track.love');
	});
});
