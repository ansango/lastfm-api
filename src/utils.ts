import { md5 } from 'js-md5'
import type { CacheManager } from './cache/manager.js'
import type { LastFmConfig } from './config.js'

const DEFAULT_BASE_URL = 'https://ws.audioscrobbler.com/2.0/'

function extractMethodFromUrl(url: string): string | undefined {
	try {
		const parsed = new URL(url)
		return parsed.searchParams.get('method') ?? undefined
	} catch {
		return undefined
	}
}

/**
 * Error thrown when a Last.fm API call fails. Carries the HTTP status and
 * (when available) the Last.fm-specific error code so callers can branch on
 * the failure reason (auth, rate limit, invalid params, etc.) without having
 * to parse error messages.
 */
export class LastFmApiError extends Error {
	readonly httpStatus: number
	readonly code?: number

	constructor(message: string, httpStatus: number, code?: number) {
		super(message)
		this.name = 'LastFmApiError'
		this.httpStatus = httpStatus
		this.code = code
	}
}

/**
 * Parses a Last.fm API response. Throws a `LastFmApiError` if the response
 * is not OK or the body contains a Last.fm error envelope; otherwise returns
 * the parsed JSON body.
 */
export async function parseLastFmResponse(response: Response): Promise<unknown> {
	const httpStatus = response.status
	let body: any = null
	try {
		body = await response.json()
	} catch {
		// Body wasn't JSON — fall through to the HTTP-status-based error below.
	}

	if (!response.ok) {
		throw new LastFmApiError(
			`HTTP Error: ${httpStatus} ${response.statusText}`,
			httpStatus,
			typeof body?.error === 'number' ? body.error : undefined,
		)
	}

	if (body?.error) {
		const code = typeof body?.error === 'number' ? body.error : undefined
		throw new LastFmApiError(`Last.fm API Error ${body.error}: ${body.message ?? ''}`.trim(), httpStatus, code)
	}

	return body
}

/**
 * Realiza una petición HTTP y parsea la respuesta como JSON con soporte de caché transparente
 */
export async function fetcher<T>(url: string, init?: RequestInit, cacheManager?: CacheManager): Promise<T> {
	if (cacheManager?.isEnabled() && (!init?.method || init.method.toUpperCase() === 'GET')) {
		const method = extractMethodFromUrl(url)
		const ttl = cacheManager.resolveTtl(method)
		return cacheManager.wrap(
			url,
			async () => {
				const response = await fetch(url, init)
				return (await parseLastFmResponse(response)) as T
			},
			ttl,
		)
	}

	const response = await fetch(url, init)
	return (await parseLastFmResponse(response)) as T
}

/**
 * Construye la URL para las peticiones a la API de Last.fm
 */
export function buildUrl(config: LastFmConfig, method: string, params: Record<string, any> = {}): string {
	const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
	const urlParams = new URLSearchParams({
		method,
		api_key: config.apiKey,
		format: 'json',
		...cleanParams(params),
	})

	return `${baseUrl}?${urlParams.toString()}`
}

/**
 * Genera la firma MD5 requerida para métodos autenticados
 */
export function generateSignature(config: LastFmConfig, params: Record<string, any>): string {
	if (!config.sharedSecret) {
		throw new Error('Shared secret is required for authenticated methods')
	}

	const sorted = Object.keys(params)
		.sort()
		.map((key) => `${key}${params[key]}`)
		.join('')

	return md5(sorted + config.sharedSecret)
}

/**
 * Limpia parámetros removiendo valores undefined/null
 */
function cleanParams(params: Record<string, any>): Record<string, string> {
	const cleaned: Record<string, string> = {}

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			cleaned[key] = String(value)
		}
	}

	return cleaned
}

/**
 * Construye URL para métodos autenticados
 */
export function buildAuthUrl(config: LastFmConfig, method: string, params: Record<string, any> = {}): string {
	const authParams = {
		method,
		api_key: config.apiKey,
		...cleanParams(params),
	}

	const signature = generateSignature(config, authParams)

	const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
	const urlParams = new URLSearchParams({
		...authParams,
		api_sig: signature,
		format: 'json',
	})

	return `${baseUrl}?${urlParams.toString()}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Signed POST transport (issue #68)
//
// One reusable signed POST path used by every authenticated write. Services are
// responsible only for the domain-specific param shape (e.g. indexed keys for
// batch scrobble). Everything else — session resolution, signature, body
// encoding, error routing — lives here.
//
// Internal on purpose. Do not re-export through the public `exports` map of
// `package.json`. The issue explicitly requires that this helper is not
// promoted to a public API of the package.
// ─────────────────────────────────────────────────────────────────────────────

/** Last.fm wire fields that the transport always owns. */
const RESERVED_FIELDS = ['method', 'api_key', 'api_sig', 'format'] as const

export interface SignedRequestOptions {
	/** Functional parameters (artist, track, timestamp, sk, ...). Values are stringified. */
	params: Record<string, string | number | undefined>
	/**
	 * Whether this method requires a session key. When true, `sk` is resolved
	 * from `params.sk` (request) or `config.sessionKey` and is included in
	 * the signature and the body. When false, the transport signs and sends
	 * without an `sk` (used by `auth.getToken`).
	 * @default true
	 */
	requiresSession?: boolean
	/**
	 * Caller-provided `RequestInit`. `signal` and safe, non-conflicting
	 * headers are preserved. `method`, `body`, and `Content-Type` are
	 * always overridden by the transport.
	 */
	init?: RequestInit
}

/**
 * Send a signed POST to the Last.fm API and return the parsed JSON body.
 *
 * Behaviour:
 *
 * - Reserved fields (`method`, `api_key`, `api_sig`, `format`) are always
 *   generated internally; any caller-supplied values are silently ignored.
 * - Signature input is the sorted concatenation of `method`, `api_key`,
 *   functional params, and `sk` (when required). `format` and `api_sig`
 *   are never part of the signature input.
 * - The body is `application/x-www-form-urlencoded` and contains `method`,
 *   `api_key`, every functional param, optional `sk`, `api_sig`, and
 *   `format=json`. Nothing goes in the URL.
 * - Missing `sharedSecret` or required `sk` fail with a sanitized
 *   `LastFmApiError` (no request values in the message) before any
 *   `fetch` is issued.
 * - The response is routed through `parseLastFmResponse`, so HTTP
 *   failures and Last.fm error envelopes both surface as `LastFmApiError`.
 *   An empty or non-JSON success body is returned as-is, not as an error.
 */
export async function signedPost<T = unknown>(
	config: LastFmConfig,
	method: string,
	options: SignedRequestOptions,
): Promise<T> {
	const requiresSession = options.requiresSession ?? true

	// 1. Shared secret must exist before we touch anything.
	if (!config.sharedSecret) {
		throw new LastFmApiError(
			'A `sharedSecret` is required for signed methods. Pass `sharedSecret` in the LastFmConfig.',
			0,
		)
	}

	// 2. Coerce params to string and drop undefined/null.
	const cleanParams: Record<string, string> = {}
	for (const [k, v] of Object.entries(options.params)) {
		if (v !== undefined && v !== null) {
			cleanParams[k] = String(v)
		}
	}

	// 3. Resolve `sk` for session-required methods.
	if (requiresSession) {
		const requestSk = cleanParams.sk
		const resolvedSk = requestSk ?? config.sessionKey
		if (!resolvedSk) {
			throw new LastFmApiError(
				'A session key (`sk`) is required for this method. Pass `sk` in the request or set `sessionKey` on the LastFmConfig.',
				0,
			)
		}
		cleanParams.sk = resolvedSk
	}

	// 4. Drop any reserved field the caller tried to inject. The transport
	//    owns these — they will be set to canonical values below.
	for (const reserved of RESERVED_FIELDS) {
		delete cleanParams[reserved]
	}

	// 5. Build signature input. Note: `format` and `api_sig` are never part
	//    of the signature input per the Last.fm contract.
	const sigInput: Record<string, string> = {
		method,
		api_key: config.apiKey,
		...cleanParams,
	}
	const sigString = Object.keys(sigInput)
		.sort()
		.map((k) => `${k}${sigInput[k]}`)
		.join('')
	const api_sig = md5(sigString + config.sharedSecret)

	// 6. Build body. Order: method, api_key, functional params (incl. sk if
	//    present), api_sig, format=json. URLSearchParams handles encoding.
	const body = new URLSearchParams()
	body.set('method', method)
	body.set('api_key', config.apiKey)
	for (const [k, v] of Object.entries(cleanParams)) {
		body.set(k, v)
	}
	body.set('api_sig', api_sig)
	body.set('format', 'json')

	// 7. Merge caller `init` safely. The transport owns method, body, and
	//    Content-Type; signal and other safe headers pass through. Caller
	//    headers go first so the canonical Content-Type always wins.
	const callerHeaders = (options.init?.headers ?? {}) as Record<string, string>
	const finalHeaders: Record<string, string> = {
		...callerHeaders,
		'Content-Type': 'application/x-www-form-urlencoded',
	}
	const finalInit: RequestInit = {
		...options.init,
		method: 'POST',
		headers: finalHeaders,
		body: body.toString(),
	}
	if (options.init?.signal) {
		finalInit.signal = options.init.signal
	}

	// 8. Send.
	const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
	const response = await fetch(baseUrl, finalInit)
	return (await parseLastFmResponse(response)) as T
}
