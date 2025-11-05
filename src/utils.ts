import { md5 } from 'js-md5';
import type { LastFmConfig } from './config.js';

/**
 * Realiza una petición HTTP y parsea la respuesta como JSON
 */
export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
	const response = await fetch(url, init);

	if (!response.ok) {
		throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
	}

	const data = await response.json();

	if (data.error) {
		throw new Error(`Last.fm API Error ${data.error}: ${data.message}`);
	}

	return data as T;
}

/**
 * Construye la URL para las peticiones a la API de Last.fm
 */
export function buildUrl(
	config: LastFmConfig,
	method: string,
	params: Record<string, any> = {}
): string {
	const urlParams = new URLSearchParams({
		method,
		api_key: config.apiKey,
		format: 'json',
		...cleanParams(params)
	});

	return `${config.baseUrl}?${urlParams.toString()}`;
}

/**
 * Genera la firma MD5 requerida para métodos autenticados
 */
export function generateSignature(
	config: LastFmConfig,
	params: Record<string, any>
): string {
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
function cleanParams(params: Record<string, any>): Record<string, string> {
	const cleaned: Record<string, string> = {};

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
export function buildAuthUrl(
	config: LastFmConfig,
	method: string,
	params: Record<string, any> = {}
): string {
	const authParams = {
		method,
		api_key: config.apiKey,
		...cleanParams(params)
	};

	const signature = generateSignature(config, authParams);

	const urlParams = new URLSearchParams({
		...authParams,
		api_sig: signature,
		format: 'json'
	});

	return `${config.baseUrl}?${urlParams.toString()}`;
}

/**
 * Realiza una petición POST con body URL-encoded
 */
export async function postFetcher<T>(url: string, body: string): Promise<T> {
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

	return data as T;
}
