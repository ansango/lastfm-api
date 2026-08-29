import { CacheManager, createCacheService } from './cache/index.js';
import { createConfig, getGlobalConfig } from './config.js';
import { createAlbumService, createArtistService, createAuthService, createChartService, createGeoService, createLibraryService, createTagService, createTrackService, createUserService, } from './core/services/index.js';
import { createExporterService } from './exporter/index.js';
import { createInsightsService } from './insights/index.js';
import { createPlaylistsService } from './playlists/index.js';
import { createReportsService } from './reports/index.js';
/**
 * Last.fm API Client
 *
 * Universal client for interacting with the Last.fm API.
 * Works in both Node.js and browser environments.
 *
 * @example
 * ```typescript
 * // With explicit config
 * const client = new LastFmClient({
 *   apiKey: 'YOUR_API_KEY',
 *   sharedSecret: 'YOUR_SHARED_SECRET'
 * });
 *
 * // Using global config
 * setGlobalConfig({ apiKey: 'YOUR_API_KEY' });
 * const client = new LastFmClient();
 * ```
 */
export class LastFmClient {
    user;
    album;
    artist;
    track;
    tag;
    chart;
    geo;
    library;
    auth;
    insights;
    reports;
    playlists;
    exporter;
    cache;
    config;
    constructor(config) {
        this.config = config ? createConfig(config) : getGlobalConfig();
        // Ensure cache manager exists for cache operations
        if (!this.config.cacheManager) {
            this.config.cacheManager = new CacheManager({ enabled: false });
        }
        this.cache = createCacheService(this.config.cacheManager);
        // Initialize all services
        this.user = createUserService(this.config);
        this.album = createAlbumService(this.config);
        this.artist = createArtistService(this.config);
        this.track = createTrackService(this.config);
        this.tag = createTagService(this.config);
        this.chart = createChartService(this.config);
        this.geo = createGeoService(this.config);
        this.library = createLibraryService(this.config);
        this.auth = createAuthService(this.config);
        this.insights = createInsightsService(this.config);
        this.reports = createReportsService(this.config);
        this.playlists = createPlaylistsService(this.config);
        this.exporter = createExporterService(this.config);
    }
    /**
     * Get the current configuration (read-only)
     */
    getConfig() {
        return { ...this.config };
    }
}
/**
 * Helper function to create a Last.fm client instance
 *
 * @param config - Optional configuration. If not provided, uses global config.
 * @returns A new LastFmClient instance
 *
 * @example
 * ```typescript
 * const client = createClient({ apiKey: 'YOUR_API_KEY' });
 * const info = await client.user.getInfo({ user: 'ansango' });
 * ```
 */
export function createClient(config) {
    return new LastFmClient(config);
}
//# sourceMappingURL=client.js.map