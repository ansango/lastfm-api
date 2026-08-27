import { describe, test, expect } from 'bun:test';
import { LastFmClient } from '../client.js';

/**
 * Inventory of canonical Last.fm methods implemented by this package.
 *
 * This list is the source of truth for the "43/57" baseline declared in
 * the parent epic (#67). It will be tightened to 57/57 when the remaining
 * 14 child issues (#69–#76) land.
 *
 * Rules:
 * - Only canonical Last.fm namespace.method pairs go here.
 * - Wrapper/alias methods (e.g. `scrobbleMany`, `postTrackScrobble`,
 *   `postBatchTrackScrobble`) are excluded because they all target the
 *   same canonical endpoint (`track.scrobble`) and must not be double-counted.
 */
const CANONICAL_METHODS: readonly string[] = [
	// artist (7)
	'artist.getInfo',
	'artist.getTags',
	'artist.getSimilar',
	'artist.getTopTags',
	'artist.getTopAlbums',
	'artist.getTopTracks',
	'artist.search',
	// album (4)
	'album.getInfo',
	'album.getTags',
	'album.getTopTags',
	'album.search',
	// track reads (5)
	'track.getInfo',
	'track.getSimilar',
	'track.getTags',
	'track.getTopTags',
	'track.search',
	// track writes (1)
	'track.scrobble',
	// user (12)
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
	// auth (1)
	'auth.getSession'
];

describe('inventory: 43/43 canonical Last.fm methods', () => {
	test('the inventory list itself contains exactly 43 entries', () => {
		expect(CANONICAL_METHODS.length).toBe(43);
	});

	test('all canonical methods exist on the LastFmClient as callable functions', () => {
		const client = new LastFmClient({ apiKey: 'inventory-test' });
		const namespaces: Record<string, Record<string, unknown>> = {
			artist: client.artist as unknown as Record<string, unknown>,
			album: client.album as unknown as Record<string, unknown>,
			track: client.track as unknown as Record<string, unknown>,
			user: client.user as unknown as Record<string, unknown>,
			tag: client.tag as unknown as Record<string, unknown>,
			chart: client.chart as unknown as Record<string, unknown>,
			geo: client.geo as unknown as Record<string, unknown>,
			library: client.library as unknown as Record<string, unknown>,
			auth: client.auth as unknown as Record<string, unknown>
		};

		for (const canonical of CANONICAL_METHODS) {
			const [ns, method] = canonical.split('.');
			expect(namespaces[ns], `namespace ${ns} missing`).toBeDefined();
			expect(typeof namespaces[ns][method], `${canonical} should be a function`).toBe(
				'function'
			);
		}
	});

	test('no duplicate canonical methods are listed', () => {
		const set = new Set(CANONICAL_METHODS);
		expect(set.size).toBe(CANONICAL_METHODS.length);
	});

	test('every entry matches the namespace.method shape', () => {
		for (const canonical of CANONICAL_METHODS) {
			expect(canonical).toMatch(/^[a-z]+\.[a-zA-Z]+$/);
		}
	});
});
