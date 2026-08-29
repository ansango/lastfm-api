import { CacheManager } from './cache/manager.js';
let globalConfig = null;
/**
 * Carga configuración desde variables de entorno (solo Node.js)
 */
function loadEnvConfig() {
    if (typeof process !== 'undefined' && process.env) {
        return {
            apiKey: process.env.LASTFM_API_KEY,
            sharedSecret: process.env.LASTFM_SHARED_SECRET,
            sessionKey: process.env.LASTFM_SESSION_KEY,
            baseUrl: process.env.LASTFM_BASE_URL,
        };
    }
    return {};
}
/**
 * Valida que la configuración tenga los campos requeridos
 */
function validateConfig(config) {
    if (!config.apiKey) {
        throw new Error('Last.fm API key is required. Provide it via config or LASTFM_API_KEY environment variable.');
    }
    return true;
}
/**
 * Crea una nueva configuración validada
 */
export function createConfig(options = {}) {
    const envConfig = loadEnvConfig();
    const config = {
        baseUrl: 'https://ws.audioscrobbler.com/2.0/',
        ...envConfig,
        ...options,
    };
    validateConfig(config);
    // Resolve cache manager if cache option was specified
    if (options.cache !== undefined && !config.cacheManager) {
        if (typeof options.cache === 'boolean') {
            config.cacheManager = new CacheManager({ enabled: options.cache });
        }
        else if (typeof options.cache.get === 'function') {
            config.cacheManager = new CacheManager({ store: options.cache });
        }
        else {
            config.cacheManager = new CacheManager(options.cache);
        }
    }
    return config;
}
/**
 * Establece la configuración global
 */
export function setGlobalConfig(config) {
    globalConfig = createConfig(config);
}
/**
 * Obtiene la configuración global
 */
export function getGlobalConfig() {
    if (!globalConfig) {
        globalConfig = createConfig();
    }
    return globalConfig;
}
/**
 * Resetea la configuración global (útil para testing)
 */
export function resetGlobalConfig() {
    globalConfig = null;
}
//# sourceMappingURL=config.js.map