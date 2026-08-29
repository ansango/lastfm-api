import type { CacheOptions, CacheStore } from './cache/interface.js';
import { CacheManager } from './cache/manager.js';
export interface LastFmConfig {
    apiKey: string;
    sharedSecret?: string;
    sessionKey?: string;
    baseUrl?: string;
    cache?: CacheOptions | CacheStore | boolean;
    cacheManager?: CacheManager;
}
/**
 * Crea una nueva configuración validada
 */
export declare function createConfig(options?: Partial<LastFmConfig>): LastFmConfig;
/**
 * Establece la configuración global
 */
export declare function setGlobalConfig(config: Partial<LastFmConfig>): void;
/**
 * Obtiene la configuración global
 */
export declare function getGlobalConfig(): LastFmConfig;
/**
 * Resetea la configuración global (útil para testing)
 */
export declare function resetGlobalConfig(): void;
//# sourceMappingURL=config.d.ts.map