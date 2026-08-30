import { md5 } from 'js-md5'
import type { LastFmConfig } from '@/core/config.js'
import { LastFmApiError, parseLastFmResponse } from '@/core/errors/errors.js'
import { DEFAULT_BASE_URL } from '@/core/http/fetcher.js'

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

	// 4. Drop any reserved field the caller tried to inject.
	for (const reserved of RESERVED_FIELDS) {
		delete cleanParams[reserved]
	}

	// 5. Build signature input.
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

	// 6. Build body.
	const body = new URLSearchParams()
	body.set('method', method)
	body.set('api_key', config.apiKey)
	for (const [k, v] of Object.entries(cleanParams)) {
		body.set(k, v)
	}
	body.set('api_sig', api_sig)
	body.set('format', 'json')

	// 7. Merge caller `init` safely.
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
