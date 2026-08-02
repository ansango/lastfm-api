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
/**
 * Realiza una petición POST con body URL-encoded
 */
export declare function postFetcher<T>(url: string, body: string): Promise<T>;
//# sourceMappingURL=utils.d.ts.map