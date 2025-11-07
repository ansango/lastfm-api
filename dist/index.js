// Configuration
export { createConfig, getGlobalConfig, setGlobalConfig, resetGlobalConfig } from './config.js';
// Client principal
export { LastFmClient, createClient } from './client.js';
// Servicios (para uso avanzado)
export { createUserService, createAlbumService, createArtistService, createTrackService, createTagService, createChartService, createGeoService, createLibraryService, createAuthService } from './services/index.js';
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
//# sourceMappingURL=index.js.map