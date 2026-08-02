import { md5 } from 'js-md5';
const DEFAULT_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
/**
 * Error thrown when a Last.fm API call fails. Carries the HTTP status and
 * (when available) the Last.fm-specific error code so callers can branch on
 * the failure reason (auth, rate limit, invalid params, etc.) without having
 * to parse error messages.
 */
export class LastFmApiError extends Error {
    httpStatus;
    code;
    constructor(message, httpStatus, code) {
        super(message);
        this.name = 'LastFmApiError';
        this.httpStatus = httpStatus;
        this.code = code;
    }
}
/**
 * Parses a Last.fm API response. Throws a `LastFmApiError` if the response
 * is not OK or the body contains a Last.fm error envelope; otherwise returns
 * the parsed JSON body.
 */
export async function parseLastFmResponse(response) {
    const httpStatus = response.status;
    let body = null;
    try {
        body = await response.json();
    }
    catch {
        // Body wasn't JSON — fall through to the HTTP-status-based error below.
    }
    if (!response.ok) {
        throw new LastFmApiError(`HTTP Error: ${httpStatus} ${response.statusText}`, httpStatus, typeof body?.error === 'number' ? body.error : undefined);
    }
    if (body && body.error) {
        const code = typeof body.error === 'number' ? body.error : undefined;
        throw new LastFmApiError(`Last.fm API Error ${body.error}: ${body.message ?? ''}`.trim(), httpStatus, code);
    }
    return body;
}
/**
 * Realiza una petición HTTP y parsea la respuesta como JSON
 */
export async function fetcher(url, init) {
    const response = await fetch(url, init);
    return (await parseLastFmResponse(response));
}
/**
 * Construye la URL para las peticiones a la API de Last.fm
 */
export function buildUrl(config, method, params = {}) {
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    const urlParams = new URLSearchParams({
        method,
        api_key: config.apiKey,
        format: 'json',
        ...cleanParams(params)
    });
    return `${baseUrl}?${urlParams.toString()}`;
}
/**
 * Genera la firma MD5 requerida para métodos autenticados
 */
export function generateSignature(config, params) {
    if (!config.sharedSecret) {
        throw new Error('Shared secret is required for authenticated methods');
    }
    const sorted = Object.keys(params)
        .sort()
        .map((key) => `${key}${params[key]}`)
        .join('');
    return md5(sorted + config.sharedSecret);
}
/**
 * Limpia parámetros removiendo valores undefined/null
 */
function cleanParams(params) {
    const cleaned = {};
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
            cleaned[key] = String(value);
        }
    }
    return cleaned;
}
/**
 * Construye URL para métodos autenticados
 */
export function buildAuthUrl(config, method, params = {}) {
    const authParams = {
        method,
        api_key: config.apiKey,
        ...cleanParams(params)
    };
    const signature = generateSignature(config, authParams);
    const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
    const urlParams = new URLSearchParams({
        ...authParams,
        api_sig: signature,
        format: 'json'
    });
    return `${baseUrl}?${urlParams.toString()}`;
}
/**
 * Realiza una petición POST con body URL-encoded
 */
export async function postFetcher(url, body) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
    });
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    if (data.error) {
        throw new Error(`Last.fm API Error ${data.error}: ${data.message}`);
    }
    return data;
}
//# sourceMappingURL=utils.js.map