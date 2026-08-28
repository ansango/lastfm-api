// Configuration
// Client principal
export { createClient, LastFmClient } from './client.js';
export { createConfig, getGlobalConfig, resetGlobalConfig, setGlobalConfig, } from './config.js';
export * from './services/album.schemas.js';
export * from './services/artist.schemas.js';
export * from './services/auth.schemas.js';
export * from './services/chart.schemas.js';
export * from './services/geo.schemas.js';
// Servicios (para uso avanzado)
export { createAlbumService, createArtistService, createAuthService, createChartService, createGeoService, createInsightsService, createLibraryService, createTagService, createTrackService, createUserService, } from './services/index.js';
export * from './services/insights.schemas.js';
export * from './services/library.schemas.js';
export * from './services/schemas/index.js';
export * from './services/tag.schemas.js';
export * from './services/track.schemas.js';
// Schemas de Zod (para validación)
export * from './services/user.schemas.js';
// Utilidades (para casos avanzados)
export { buildAuthUrl, buildUrl, fetcher, generateSignature, LastFmApiError, parseLastFmResponse } from './utils.js';
//# sourceMappingURL=index.js.map