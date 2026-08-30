import type { CacheManager } from '../cache/manager.js'
import type { LastFmConfig } from '../config.js'
import { parseLastFmResponse } from './errors.js'
import { generateSignature } from './signature.js'

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
 * Limpia parámetros removiendo valores undefined/null
 */
export function cleanParams(params: Record<string, any>): Record<string, string> {
	const cleaned: Record<string, string> = {}

	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== null) {
			cleaned[key] = String(value)
		}
	}

	return cleaned
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
