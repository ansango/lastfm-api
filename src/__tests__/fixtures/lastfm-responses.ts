/**
 * Synthetic Last.fm response fixtures.
 *
 * All values are fake. No real artist names, MBIDs, or user names. No real
 * API keys, shared secrets, session keys, signatures, or signed URLs.
 *
 * Each entity satisfies the shape Last.fm documents, with the caveat that
 * the wire protocol sends most numeric fields as strings. The package does
 * not run Zod validation at the service layer (consumer-invoked only), so
 * fixtures do not need to pass schema.parse() — they just need to mirror
 * the documented shape closely enough that response handling code paths
 * are exercised.
 */

export const fakeArtist = {
	name: 'Test Artist',
	playcount: '1000',
	listeners: '500',
	mbid: '00000000-0000-0000-0000-000000000001',
	url: 'https://www.last.fm/music/Test+Artist',
	image: [
		{ '#text': 'https://example.com/s.jpg', size: 'small' },
		{ '#text': 'https://example.com/m.jpg', size: 'medium' },
		{ '#text': 'https://example.com/l.jpg', size: 'large' }
	],
	streamable: '0',
	ontour: '0',
	stats: { listeners: '500', playcount: '1000', userplaycount: '0' },
	similar: { artist: [] },
	tags: { tag: [] },
	bio: { published: '2024-01-01 00:00', summary: 'Test summary', content: 'Test content' }
};

export const fakeTrack = {
	name: 'Test Track',
	playcount: '1000',
	listeners: '500',
	duration: '240',
	mbid: '00000000-0000-0000-0000-000000000010',
	url: 'https://www.last.fm/music/Test+Artist/_/Test+Track',
	streamable: { '#text': '0', fulltrack: '0' },
	artist: {
		name: 'Test Artist',
		mbid: '00000000-0000-0000-0000-000000000001',
		url: 'https://www.last.fm/music/Test+Artist'
	},
	album: {
		'#text': 'Test Album',
		mbid: '00000000-0000-0000-0000-000000000020',
		position: '1'
	},
	image: [
		{ '#text': 'https://example.com/s.jpg', size: 'small' },
		{ '#text': 'https://example.com/m.jpg', size: 'medium' }
	],
	'@attr': { rank: '1' }
};

export const fakeAlbum = {
	name: 'Test Album',
	playcount: '1000',
	mbid: '00000000-0000-0000-0000-000000000020',
	url: 'https://www.last.fm/music/Test+Artist/Test+Album',
	artist: {
		name: 'Test Artist',
		mbid: '00000000-0000-0000-0000-000000000001',
		url: 'https://www.last.fm/music/Test+Artist'
	},
	image: [
		{ '#text': 'https://example.com/s.jpg', size: 'small' },
		{ '#text': 'https://example.com/m.jpg', size: 'medium' }
	]
};

export const fakeUser = {
	name: 'test_user',
	age: '30',
	subscriber: '0',
	realname: 'Test User',
	bootstrap: '0',
	playcount: '5000',
	artist_count: '100',
	playlists: '0',
	track_count: '500',
	album_count: '50',
	image: [
		{ '#text': 'https://example.com/s.jpg', size: 'small' },
		{ '#text': 'https://example.com/l.jpg', size: 'large' }
	],
	registered: { unixtime: '1700000000', '#text': 1700000000 },
	country: 'Spain',
	gender: 'n',
	url: 'https://www.last.fm/user/test_user',
	type: 'user'
};

export const fakeTag = {
	name: 'test tag',
	url: 'https://www.last.fm/tag/test+tag',
	count: '100',
	reach: '50000',
	taggings: '1000'
};

/** Standard Last.fm error envelope used in error-path tests. */
export function lastFmError(code: number, message: string) {
	return { error: code, message };
}

export const LAST_FM_ERROR_CODES = {
	INVALID_SERVICE: 2,
	INVALID_METHOD: 3,
	AUTHENTICATION_FAILED: 4,
	INVALID_FORMAT: 5,
	INVALID_PARAMS: 6,
	INVALID_RESOURCE: 7,
	OPERATION_FAILED: 8,
	INVALID_SESSION_KEY: 9,
	INVALID_API_KEY: 10,
	SERVICE_OFFLINE: 11,
	SUBSCRIBER_ONLY: 12,
	INVALID_METHOD_SIGNATURE: 13,
	UNAUTHORIZED_TOKEN: 14,
	TOKEN_NOT_AUTHORIZED: 15,
	NO_CORRECTION: 16,
	NO_TAG: 17,
	DAY_LIMIT_EXCEEDED: 18,
	TEMPORARY_UNAVAILABLE: 21,
	DEPRECATED: 22,
	API_KEY_SUSPENDED: 26,
	RATE_LIMIT_EXCEEDED: 29
} as const;

export function okAttr(page = 1, perPage = 50, total = 1) {
	return { page: String(page), perPage: String(perPage), totalPages: '1', total: String(total) };
}
