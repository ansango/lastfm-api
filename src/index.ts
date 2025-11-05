// Configuration
export {
	createConfig,
	getGlobalConfig,
	setGlobalConfig,
	resetGlobalConfig,
	type LastFmConfig
} from './config.js';

// Client principal
export { LastFmClient, createClient } from './client.js';

// Servicios (para uso avanzado)
export {
	createUserService,
	createAlbumService,
	createArtistService,
	createTrackService,
	createTagService,
	createChartService,
	createGeoService,
	createLibraryService,
	createAuthService
} from './services/index.js';

// Tipos de servicios
export type {
	UserService,
	AlbumService,
	ArtistService,
	TrackService,
	TagService,
	ChartService,
	GeoService,
	LibraryService,
	AuthService
} from './services/index.js';

// Todos los tipos de request/response
export type * from './services/user.types.js';
export type * from './services/album.types.js';
export type * from './services/artist.types.js';
export type * from './services/track.types.js';
export type * from './services/tag.types.js';
export type * from './services/chart.types.js';
export type * from './services/geo.types.js';
export type * from './services/library.types.js';
export type * from './services/auth.types.js';
export type * from './services/base.types.js';

// Utilidades (para casos avanzados)
export { fetcher, buildUrl, generateSignature, buildAuthUrl } from './utils.js';
