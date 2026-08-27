import { describe, test, expect } from 'bun:test';
import { LastFmClient } from '../client.js';

/**
 * Inventory of canonical Last.fm methods implemented by this package.
 *
 * This list is the source of truth for the "57/57" coverage declared
 * in the parent epic (#67) and re-audited in #77.
 *
 * Rules:
 * - Only canonical Last.fm namespace.method pairs go here.
 * - Wrapper/alias methods (e.g. `scrobbleMany`, `postTrackScrobble`,
 *   `postBatchTrackScrobble`) are excluded because they all target the
 *   same canonical endpoint (`track.scrobble`) and must not be
 *   double-counted.
 * - The 14 methods added under #69–#76 close the gap from the
 *   previous 43/57 baseline. The audit at docs/api-coverage.md is
 *   the human-readable companion to this list.
 */
const CANONICAL_METHODS: readonly string[] = [
	// artist (10) — added getCorrection (#69), addTags, removeTag (#74)
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
	// album (6) — added addTags, removeTag (#73)
	'album.getInfo',
	'album.getTags',
	'album.getTopTags',
	'album.search',
	'album.addTags',
	'album.removeTag',
	// track (12) — added getCorrection (#70), addTags, removeTag, love,
	// unlove, updateNowPlaying (the last 5 from #75/#76)
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
	// user (13) — added getPersonalTags (#71)
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
	// auth (3) — added getToken, getMobileSession (#72)
	'auth.getSession',
	'auth.getToken',
	'auth.getMobileSession'
];

describe('inventory: 57/57 canonical Last.fm methods', () => {
	test('the inventory list itself contains exactly 57 entries', () => {
		expect(CANONICAL_METHODS.length).toBe(57);
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

	test('per-namespace breakdown matches the docs/api-coverage.md audit', () => {
		const expected: Record<string, number> = {
			artist: 10,
			album: 6,
			track: 12,
			user: 13,
			tag: 7,
			chart: 3,
			geo: 2,
			library: 1,
			auth: 3
		};
		const actual: Record<string, number> = {};
		for (const canonical of CANONICAL_METHODS) {
			const [ns] = canonical.split('.');
			actual[ns] = (actual[ns] ?? 0) + 1;
		}
		expect(actual).toEqual(expected);
	});
});
