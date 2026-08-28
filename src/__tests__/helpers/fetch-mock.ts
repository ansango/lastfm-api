/**
 * Shared test helper for mocking `globalThis.fetch` in deterministic tests.
 *
 * Usage:
 *
 *   import { installFetchMock } from './helpers/fetch-mock.js';
 *
 *   let mock: ReturnType<typeof installFetchMock>;
 *   let client: LastFmClient;
 *
 *   beforeEach(() => {
 *     mock = installFetchMock();
 *     client = new LastFmClient({ apiKey: 'test' });
 *   });
 *
 *   afterEach(() => {
 *     mock.restore();
 *   });
 *
 *   test('foo', async () => {
 *     mock.respondWithJson({ ... });
 *     await client.artist.getInfo({ artist: 'Radiohead' });
 *     const call = mock.lastCall();
 *     expect(call.url).toContain('method=artist.getInfo');
 *   });
 */

export interface CapturedCall {
	url: string
	init: RequestInit | undefined
	method: string
	headers: Record<string, string>
	body: string | undefined
}

interface QueuedResponse {
	body: BodyInit | null
	init?: ResponseInit
}

export interface FetchMock {
	readonly calls: CapturedCall[]
	/** Queue a raw response. */
	respondWith: (body: BodyInit | null, init?: ResponseInit) => void
	/** Queue several raw responses (FIFO). */
	respondWithMany: (responses: QueuedResponse[]) => void
	/** Convenience: queue a JSON response. */
	respondWithJson: (data: unknown, init?: ResponseInit) => void
	/** Queue an HTTP error response (no body validation). */
	respondWithHttpError: (status: number, statusText: string, body?: unknown) => void
	/** Get the most recent call. Throws if no calls have been made. */
	lastCall: () => CapturedCall
	/** Get a specific call by 0-based index. Throws if out of range. */
	nthCall: (n: number) => CapturedCall
	/** Reset captured calls and queued responses. Does not restore the original fetch. */
	reset: () => void
	/** Restore the original globalThis.fetch. Always call in afterEach. */
	restore: () => void
}

export function installFetchMock(): FetchMock {
	const originalFetch = globalThis.fetch
	const calls: CapturedCall[] = []
	const queue: QueuedResponse[] = []

	const mockFetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
		const method = (init?.method ?? 'GET').toUpperCase()
		const headers = (init?.headers ?? {}) as Record<string, string>
		const body = typeof init?.body === 'string' ? init.body : undefined
		calls.push({ url, init, method, headers, body })

		if (queue.length === 0) {
			throw new Error(
				`fetch mock: no response queued for call to ${method} ${url}. ` +
					`Call mock.respondWith(...) or mock.respondWithJson(...) first.`,
			)
		}
		const next = queue.shift()!
		return new Response(next.body, next.init)
	}) as unknown as typeof globalThis.fetch

	globalThis.fetch = mockFetch

	return {
		calls,
		respondWith: (body, init) => queue.push({ body, init }),
		respondWithMany: (responses) => queue.push(...responses),
		respondWithJson: (data, init) =>
			queue.push({
				body: JSON.stringify(data),
				init: {
					...init,
					headers: {
						'Content-Type': 'application/json',
						...((init?.headers as Record<string, string> | undefined) ?? {}),
					},
				},
			}),
		respondWithHttpError: (status, statusText, body) => {
			const payload = body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body)
			queue.push({
				body: payload,
				init: { status, statusText, headers: { 'Content-Type': 'application/json' } },
			})
		},
		lastCall: () => {
			if (calls.length === 0) throw new Error('fetch mock: no calls captured yet')
			return calls[calls.length - 1]
		},
		nthCall: (n) => {
			if (n < 0 || n >= calls.length) {
				throw new Error(`fetch mock: call index ${n} out of range (${calls.length} captured)`)
			}
			return calls[n]
		},
		reset: () => {
			calls.length = 0
			queue.length = 0
		},
		restore: () => {
			globalThis.fetch = originalFetch
		},
	}
}

/** Parse a captured form-urlencoded body into a plain object. */
export function parseFormBody(body: string | undefined): Record<string, string> {
	if (!body) return {}
	const out: Record<string, string> = {}
	for (const [k, v] of new URLSearchParams(body)) {
		out[k] = v
	}
	return out
}

/** Parse a captured URL into a base + query-params object. */
export function parseUrl(url: string): { base: string; params: Record<string, string> } {
	const u = new URL(url)
	const params: Record<string, string> = {}
	for (const [k, v] of u.searchParams) {
		params[k] = v
	}
	return { base: u.origin + u.pathname, params }
}
