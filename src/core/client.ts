import { createConfig, getGlobalConfig, type LastFmConfig } from '../config.js'
import {
	type AlbumService,
	type ArtistService,
	type AuthService,
	type ChartService,
	createAlbumService,
	createArtistService,
	createAuthService,
	createChartService,
	createGeoService,
	createLibraryService,
	createTagService,
	createTrackService,
	createUserService,
	type GeoService,
	type LibraryService,
	type TagService,
	type TrackService,
	type UserService,
} from './services/index.js'

/**
 * Lightweight Last.fm Core API client.
 *
 * Provides access strictly to the 56 canonical Last.fm REST API methods
 * across the 9 official namespaces.
 */
export class LastFmCoreClient {
	public readonly user: UserService
	public readonly album: AlbumService
	public readonly artist: ArtistService
	public readonly track: TrackService
	public readonly tag: TagService
	public readonly chart: ChartService
	public readonly geo: GeoService
	public readonly library: LibraryService
	public readonly auth: AuthService

	private readonly config: LastFmConfig

	constructor(config?: Partial<LastFmConfig>) {
		this.config = config ? createConfig(config) : getGlobalConfig()

		this.user = createUserService(this.config)
		this.album = createAlbumService(this.config)
		this.artist = createArtistService(this.config)
		this.track = createTrackService(this.config)
		this.tag = createTagService(this.config)
		this.chart = createChartService(this.config)
		this.geo = createGeoService(this.config)
		this.library = createLibraryService(this.config)
		this.auth = createAuthService(this.config)
	}

	/**
	 * Get the current configuration (read-only)
	 */
	getConfig(): Readonly<LastFmConfig> {
		return { ...this.config }
	}
}

/**
 * Helper function to create a Last.fm core client instance
 *
 * @param config - Optional configuration. If not provided, uses global config.
 * @returns A new LastFmCoreClient instance
 */
export function createCoreClient(config?: Partial<LastFmConfig>): LastFmCoreClient {
	return new LastFmCoreClient(config)
}
