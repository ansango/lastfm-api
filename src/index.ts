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

// Todos los tipos y schemas de request/response
export type * from './services/user.schemas.js';
export type * from './services/album.schemas.js';
export type * from './services/artist.schemas.js';
export type * from './services/track.schemas.js';
export type * from './services/tag.schemas.js';
export type * from './services/chart.schemas.js';
export type * from './services/geo.schemas.js';
export type * from './services/library.schemas.js';
export type * from './services/auth.schemas.js';
export type * from './services/schemas/index.js';

// Schemas de Zod (para validación)
export * from './services/user.schemas.js';
export * from './services/album.schemas.js';
export * from './services/artist.schemas.js';
export * from './services/track.schemas.js';
export * from './services/tag.schemas.js';
export * from './services/chart.schemas.js';
export * from './services/geo.schemas.js';
export * from './services/library.schemas.js';
export * from './services/auth.schemas.js';
export * from './services/schemas/index.js';

// Utilidades (para casos avanzados)
export { fetcher, buildUrl, generateSignature, buildAuthUrl } from './utils.js';
