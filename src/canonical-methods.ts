/**
 * Canonical Last.fm method inventory.
 *
 * Single source of truth for the "57/57" coverage of the Last.fm API.
 * Consumed by:
 *  - `src/__tests__/inventory.test.ts` — verifies that each method exists on the client
 *  - `src/method-registry.ts` — wires the docs tool (Hono + Scalar)
 *
 * Rules:
 *  - Only canonical Last.fm `namespace.method` pairs go here.
 *  - Wrapper/alias methods (e.g. `scrobbleMany`, `postTrackScrobble`,
 *    `postBatchTrackScrobble`) are excluded because they all target the
 *    same canonical endpoint (`track.scrobble`) and must not be
 *    double-counted.
 *
 * The per-namespace breakdown:
 *  - artist (10), album (6), track (12), user (13), tag (7),
 *    chart (3), geo (2), library (1), auth (3) = 57
 */
export const CANONICAL_METHODS = [
	// artist (10)
	'artist.getInfo',
	'artist.getTags',
	'artist.getSimilar',
	'artist.getTopTags',
	'artist.getTopAlbums',
	'artist.getTopTracks',
	'artist.search',
	'artist.getCorrection',
	'artist.addTags',
	'artist.removeTag',
	// album (6)
	'album.getInfo',
	'album.getTags',
	'album.getTopTags',
	'album.search',
	'album.addTags',
	'album.removeTag',
	// track (12)
	'track.getInfo',
	'track.getSimilar',
	'track.getTags',
	'track.getTopTags',
	'track.search',
	'track.getCorrection',
	'track.addTags',
	'track.removeTag',
	'track.love',
	'track.unlove',
	'track.updateNowPlaying',
	'track.scrobble',
	// user (13)
	'user.getInfo',
	'user.getFriends',
	'user.getLovedTracks',
	'user.getRecentTracks',
	'user.getTopAlbums',
	'user.getTopArtists',
	'user.getTopTags',
	'user.getTopTracks',
	'user.getWeeklyAlbumChart',
	'user.getWeeklyArtistChart',
	'user.getWeeklyChartList',
	'user.getWeeklyTrackChart',
	'user.getPersonalTags',
	// tag (7)
	'tag.getInfo',
	'tag.getSimilar',
	'tag.getTopAlbums',
	'tag.getTopArtists',
	'tag.getTopTags',
	'tag.getTopTracks',
	'tag.getWeeklyChartList',
	// chart (3)
	'chart.getTopArtists',
	'chart.getTopTags',
	'chart.getTopTracks',
	// geo (2)
	'geo.getTopArtists',
	'geo.getTopTracks',
	// library (1)
	'library.getArtists',
	// auth (3)
	'auth.getSession',
	'auth.getToken',
	'auth.getMobileSession',
] as const

export type CanonicalMethodId = (typeof CANONICAL_METHODS)[number]
export type Namespace = CanonicalMethodId extends `${infer N}.${string}` ? N : never
