import { type AlbumService, type ArtistService, type AuthService, type ChartService, type GeoService, type LibraryService, type TagService, type TrackService, type UserService } from './api/index.js';
import { type LastFmConfig } from './core/index.js';
import { type CacheService, type ExporterService, type InsightsService, type PlaylistsService, type ReportsService, type WatcherService } from './modules/index.js';
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
export declare class LastFmClient {
    readonly user: UserService;
    readonly album: AlbumService;
    readonly artist: ArtistService;
    readonly track: TrackService;
    readonly tag: TagService;
    readonly chart: ChartService;
    readonly geo: GeoService;
    readonly library: LibraryService;
    readonly auth: AuthService;
    readonly insights: InsightsService;
    readonly reports: ReportsService;
    readonly playlists: PlaylistsService;
    readonly exporter: ExporterService;
    readonly cache: CacheService;
    readonly watcher: WatcherService;
    private readonly config;
    constructor(config?: Partial<LastFmConfig>);
    /**
     * Get the current configuration (read-only)
     */
    getConfig(): Readonly<LastFmConfig>;
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
export declare function createClient(config?: Partial<LastFmConfig>): LastFmClient;
//# sourceMappingURL=client.d.ts.map