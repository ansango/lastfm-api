import type { LastFmConfig } from './config.js';
/**
 * Error thrown when a Last.fm API call fails. Carries the HTTP status and
 * (when available) the Last.fm-specific error code so callers can branch on
 * the failure reason (auth, rate limit, invalid params, etc.) without having
 * to parse error messages.
 */
export declare class LastFmApiError extends Error {
    readonly httpStatus: number;
    readonly code?: number;
    constructor(message: string, httpStatus: number, code?: number);
}
/**
 * Parses a Last.fm API response. Throws a `LastFmApiError` if the response
 * is not OK or the body contains a Last.fm error envelope; otherwise returns
 * the parsed JSON body.
 */
export declare function parseLastFmResponse(response: Response): Promise<unknown>;
/**
 * Realiza una petición HTTP y parsea la respuesta como JSON
 */
export declare function fetcher<T>(url: string, init?: RequestInit): Promise<T>;
/**
 * Construye la URL para las peticiones a la API de Last.fm
 */
export declare function buildUrl(config: LastFmConfig, method: string, params?: Record<string, any>): string;
/**
 * Genera la firma MD5 requerida para métodos autenticados
 */
export declare function generateSignature(config: LastFmConfig, params: Record<string, any>): string;
/**
 * Construye URL para métodos autenticados
 */
export declare function buildAuthUrl(config: LastFmConfig, method: string, params?: Record<string, any>): string;
export interface SignedRequestOptions {
    /** Functional parameters (artist, track, timestamp, sk, ...). Values are stringified. */
    params: Record<string, string | number | undefined>;
    /**
     * Whether this method requires a session key. When true, `sk` is resolved
     * from `params.sk` (request) or `config.sessionKey` and is included in
     * the signature and the body. When false, the transport signs and sends
     * without an `sk` (used by `auth.getToken` and `auth.getMobileSession`).
     * @default true
     */
    requiresSession?: boolean;
    /**
     * Caller-provided `RequestInit`. `signal` and safe, non-conflicting
     * headers are preserved. `method`, `body`, and `Content-Type` are
     * always overridden by the transport.
     */
    init?: RequestInit;
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
export declare function signedPost<T = unknown>(config: LastFmConfig, method: string, options: SignedRequestOptions): Promise<T>;
//# sourceMappingURL=utils.d.ts.map