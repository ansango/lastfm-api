import type { LastFmConfig } from './config.js';
import { getGlobalConfig, createConfig } from './config.js';
import {
	createUserService,
	createAlbumService,
	createArtistService,
	createTrackService,
	createTagService,
	createChartService,
	createGeoService,
	createLibraryService,
	createAuthService,
	type UserService,
	type AlbumService,
	type ArtistService,
	type TrackService,
	type TagService,
	type ChartService,
	type GeoService,
	type LibraryService,
	type AuthService
} from './services/index.js';

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
	public readonly user: UserService;
	public readonly album: AlbumService;
	public readonly artist: ArtistService;
	public readonly track: TrackService;
	public readonly tag: TagService;
	public readonly chart: ChartService;
	public readonly geo: GeoService;
	public readonly library: LibraryService;
	public readonly auth: AuthService;

	private readonly config: LastFmConfig;

	constructor(config?: Partial<LastFmConfig>) {
		this.config = config ? createConfig(config) : getGlobalConfig();

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
	}

	/**
	 * Get the current configuration (read-only)
	 */
	getConfig(): Readonly<LastFmConfig> {
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
export function createClient(config?: Partial<LastFmConfig>): LastFmClient {
	return new LastFmClient(config);
}
