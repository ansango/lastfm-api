export { createConfig, getGlobalConfig, setGlobalConfig, resetGlobalConfig, type LastFmConfig } from './config.js';
export { LastFmClient, createClient } from './client.js';
export { createUserService, createAlbumService, createArtistService, createTrackService, createTagService, createChartService, createGeoService, createLibraryService, createAuthService } from './services/index.js';
export type { UserService, AlbumService, ArtistService, TrackService, TagService, ChartService, GeoService, LibraryService, AuthService } from './services/index.js';
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
export { fetcher, buildUrl, generateSignature, buildAuthUrl } from './utils.js';
//# sourceMappingURL=index.d.ts.map