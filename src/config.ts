import type { CacheOptions, CacheStore } from './cache/interface.js'
import { CacheManager } from './cache/manager.js'

export interface LastFmConfig {
	apiKey: string
	sharedSecret?: string
	sessionKey?: string
	baseUrl?: string
	cache?: CacheOptions | CacheStore | boolean
	cacheManager?: CacheManager
}

let globalConfig: LastFmConfig | null = null

/**
 * Carga configuración desde variables de entorno (solo Node.js)
 */
function loadEnvConfig(): Partial<LastFmConfig> {
	if (typeof process !== 'undefined' && process.env) {
		return {
			apiKey: process.env.LASTFM_API_KEY,
			sharedSecret: process.env.LASTFM_SHARED_SECRET,
			sessionKey: process.env.LASTFM_SESSION_KEY,
			baseUrl: process.env.LASTFM_BASE_URL,
		}
	}
	return {}
}

/**
 * Valida que la configuración tenga los campos requeridos
 */
function validateConfig(config: Partial<LastFmConfig>): config is LastFmConfig {
	if (!config.apiKey) {
		throw new Error('Last.fm API key is required. Provide it via config or LASTFM_API_KEY environment variable.')
	}
	return true
}

/**
 * Crea una nueva configuración validada
 */
export function createConfig(options: Partial<LastFmConfig> = {}): LastFmConfig {
	const envConfig = loadEnvConfig()
	const config: LastFmConfig = {
		baseUrl: 'https://ws.audioscrobbler.com/2.0/',
		...envConfig,
		...options,
	} as LastFmConfig

	validateConfig(config)

	// Resolve cache manager if cache option was specified
	if (options.cache !== undefined && !config.cacheManager) {
		if (typeof options.cache === 'boolean') {
			config.cacheManager = new CacheManager({ enabled: options.cache })
		} else if (typeof (options.cache as CacheStore).get === 'function') {
			config.cacheManager = new CacheManager({ store: options.cache as CacheStore })
		} else {
			config.cacheManager = new CacheManager(options.cache as CacheOptions)
		}
	}

	return config
}

/**
 * Establece la configuración global
 */
export function setGlobalConfig(config: Partial<LastFmConfig>): void {
	globalConfig = createConfig(config)
}

/**
 * Obtiene la configuración global
 */
export function getGlobalConfig(): LastFmConfig {
	if (!globalConfig) {
		globalConfig = createConfig()
	}
	return globalConfig
}

/**
 * Resetea la configuración global (útil para testing)
 */
export function resetGlobalConfig(): void {
	globalConfig = null
}
