export { createConfig, getGlobalConfig, setGlobalConfig, resetGlobalConfig, type LastFmConfig } from './config.js';
export { LastFmClient, createClient } from './client.js';
export { createUserService, createAlbumService, createArtistService, createTrackService, createTagService, createChartService, createGeoService, createLibraryService, createAuthService } from './services/index.js';
export type { UserService, AlbumService, ArtistService, TrackService, TagService, ChartService, GeoService, LibraryService, AuthService } from './services/index.js';
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
export { fetcher, buildUrl, generateSignature, buildAuthUrl } from './utils.js';
//# sourceMappingURL=index.d.ts.map