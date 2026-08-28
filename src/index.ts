// Configuration

// Client principal
export { createClient, LastFmClient } from './client.js'
export {
	createConfig,
	getGlobalConfig,
	type LastFmConfig,
	resetGlobalConfig,
	setGlobalConfig,
} from './config.js'
export type * from './services/album.schemas.js'
export * from './services/album.schemas.js'
export type * from './services/artist.schemas.js'
export * from './services/artist.schemas.js'
export type * from './services/auth.schemas.js'
export * from './services/auth.schemas.js'
export type * from './services/chart.schemas.js'
export * from './services/chart.schemas.js'
export type * from './services/geo.schemas.js'
export * from './services/geo.schemas.js'
// Tipos de servicios
export type {
	AlbumService,
	ArtistService,
	AuthService,
	ChartService,
	GeoService,
	LibraryService,
	TagService,
	TrackService,
	UserService,
} from './services/index.js'
// Servicios (para uso avanzado)
export {
	createAlbumService,
	createArtistService,
	createAuthService,
	createChartService,
	createGeoService,
	createLibraryService,
	createTagService,
	createTrackService,
	createUserService,
} from './services/index.js'
export type * from './services/library.schemas.js'
export * from './services/library.schemas.js'
export type * from './services/schemas/index.js'
export * from './services/schemas/index.js'
export type * from './services/tag.schemas.js'
export * from './services/tag.schemas.js'
export type * from './services/track.schemas.js'
export * from './services/track.schemas.js'
// Todos los tipos y schemas de request/response
export type * from './services/user.schemas.js'
// Schemas de Zod (para validación)
export * from './services/user.schemas.js'

// Utilidades (para casos avanzados)
export { buildAuthUrl, buildUrl, fetcher, generateSignature, LastFmApiError, parseLastFmResponse } from './utils.js'
