import type { LastFmConfig } from './config.js';
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