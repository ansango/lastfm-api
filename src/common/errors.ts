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
