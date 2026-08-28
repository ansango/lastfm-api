import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { type AlbumService, createAlbumService } from '../entrypoints/album.js'
import * as albumSchemas from '../entrypoints/album.schemas.js'
import { createClient } from '../index.js'
import { LastFmApiError } from '../utils.js'
import { fakeAlbum, fakeTag, LAST_FM_ERROR_CODES, lastFmError } from './fixtures/lastfm-responses.js'
import { type FetchMock, installFetchMock, parseFormBody, parseUrl } from './helpers/fetch-mock.js'

const API_KEY = 'test-api-key'

describe('album service', () => {
	let mock: FetchMock
	let client: LastFmClient

	beforeEach(() => {
		mock = installFetchMock()
		client = new LastFmClient({ apiKey: API_KEY })
	})

	afterEach(() => mock.restore())

	describe('getInfo', () => {
		test('routes to album.getInfo with artist and album, returns parsed payload', async () => {
			mock.respondWithJson({
				album: {
					...fakeAlbum,
					wiki: { published: '2024-01-01', summary: 'Test', content: 'Test' },
					tags: { tag: [] },
					tracks: { track: [] },
				},
			})

			const result = await client.album.getInfo({ artist: 'Test Artist', album: 'Test Album' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('album.getInfo')
			expect(params.api_key).toBe(API_KEY)
			expect(params.format).toBe('json')
			expect(params.artist).toBe('Test Artist')
			expect(params.album).toBe('Test Album')
			expect(result.album.name).toBe(fakeAlbum.name)
		})

		test('passes optional mbid, username, and lang when provided', async () => {
			mock.respondWithJson({
				album: { ...fakeAlbum, wiki: { published: '', summary: '', content: '' }, tags: {} },
			})

			await client.album.getInfo({
				artist: 'Test Artist',
				album: 'Test Album',
				mbid: '00000000-0000-0000-0000-000000000020',
				username: 'test_user',
				lang: 'es',
			})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.mbid).toBe('00000000-0000-0000-0000-000000000020')
			expect(params.username).toBe('test_user')
			expect(params.lang).toBe('es')
		})
	})

	describe('getTags', () => {
		test('routes to album.getTags with user, artist, and album, returns parsed payload', async () => {
			mock.respondWithJson({
				tags: { tag: [fakeTag], '@attr': { artist: 'Test Artist', album: 'Test Album' } },
			})

			const result = await client.album.getTags({
				artist: 'Test Artist',
				album: 'Test Album',
				user: 'test_user',
			})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('album.getTags')
			expect(params.user).toBe('test_user')
			expect(result.tags.tag[0].name).toBe(fakeTag.name)
		})
	})

	describe('getTopTags', () => {
		test('routes to album.getTopTags and returns parsed payload', async () => {
			mock.respondWithJson({
				tags: { tag: [fakeTag], '@attr': { artist: 'Test Artist', album: 'Test Album' } },
			})

			const result = await client.album.getTopTags({
				artist: 'Test Artist',
				album: 'Test Album',
			})

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('album.getTopTags')
			expect(result.tags.tag[0].name).toBe(fakeTag.name)
		})
	})

	describe('search', () => {
		test('routes to album.search with album query, returns parsed payload', async () => {
			mock.respondWithJson({
				results: {
					'opensearch:Query': { '#text': 'Test Album', role: 'request', searchTerms: 'Test Album', startPage: '1' },
					'opensearch:totalResults': '1',
					'opensearch:startIndex': '0',
					'opensearch:itemsPerPage': '50',
					albummatches: { album: [fakeAlbum] },
					'@attr': { for: 'Test Album' },
				},
			})

			const result = await client.album.search({ album: 'Test Album' })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.method).toBe('album.search')
			expect(params.album).toBe('Test Album')
			expect(result.results.albummatches.album[0].name).toBe(fakeAlbum.name)
		})

		test('passes limit and page when provided', async () => {
			mock.respondWithJson({
				results: {
					'opensearch:Query': { '#text': 'x', role: 'r', searchTerms: 'x', startPage: '1' },
					'opensearch:totalResults': '0',
					'opensearch:startIndex': '0',
					'opensearch:itemsPerPage': '10',
					albummatches: { album: [] },
					'@attr': { for: 'x' },
				},
			})

			await client.album.search({ album: 'x', limit: 10, page: 2 })

			const { params } = parseUrl(mock.lastCall().url)
			expect(params.limit).toBe('10')
			expect(params.page).toBe('2')
		})
	})

	describe('error handling', () => {
		test('Last.fm error envelope becomes LastFmApiError', async () => {
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.INVALID_RESOURCE, 'Album not found'))

			await expect(client.album.getInfo({ artist: 'Test Artist', album: 'Nonexistent' })).rejects.toBeInstanceOf(
				LastFmApiError,
			)
		})
	})

	describe('addTags', () => {
		test('routes to album.addTags via signed POST with sk and comma-joined tags, returns void', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: 'test-shared-secret',
				sessionKey: 'SESSION-KEY',
			})
			mock.respondWithJson({})

			const result = await authed.album.addTags({
				artist: 'Test Artist',
				album: 'Test Album',
				tags: ['rock', '90s', 'favorites'],
			})

			const call = mock.lastCall()
			expect(call.method).toBe('POST')
			expect(call.url).toBe('https://ws.audioscrobbler.com/2.0/')
			expect(call.headers['Content-Type']).toBe('application/x-www-form-urlencoded')
			const body = parseFormBody(call.body)
			expect(body.method).toBe('album.addTags')
			expect(body.api_key).toBe(API_KEY)
			expect(body.artist).toBe('Test Artist')
			expect(body.album).toBe('Test Album')
			expect(body.tags).toBe('rock,90s,favorites')
			expect(body.sk).toBe('SESSION-KEY')
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/)
			expect(body.format).toBe('json')
			expect(result).toBeUndefined()
		})

		test('per-request sk overrides config.sessionKey', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: 'test-shared-secret',
				sessionKey: 'CONFIG-SK',
			})
			mock.respondWithJson({})

			await authed.album.addTags({
				artist: 'A',
				album: 'Al',
				tags: ['t1'],
				sk: 'REQUEST-SK',
			})

			const body = parseFormBody(mock.lastCall().body)
			expect(body.sk).toBe('REQUEST-SK')
		})

		test('fails before fetch when no session key is available, with a clear sanitized error', async () => {
			const noSession = new LastFmClient({ apiKey: API_KEY, sharedSecret: 'test-shared-secret' })

			let caught: unknown
			try {
				await noSession.album.addTags({ artist: 'A', album: 'Al', tags: ['t1'] })
			} catch (err) {
				caught = err
			}
			expect(caught).toBeInstanceOf(LastFmApiError)
			const e = caught as LastFmApiError
			expect(e.httpStatus).toBe(0)
			expect(e.message).toContain('session key')
			expect(mock.calls).toHaveLength(0)
		})

		test('rejects more than 10 tags in the request schema', () => {
			const result = albumSchemas.albumAddTagsRequestSchema.safeParse({
				artist: 'A',
				album: 'Al',
				tags: Array.from({ length: 11 }, (_, i) => `t${i}`),
			})
			expect(result.success).toBe(false)
		})

		test('Last.fm error envelope becomes LastFmApiError', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: 'test-shared-secret',
				sessionKey: 'SK',
			})
			mock.respondWithJson(lastFmError(LAST_FM_ERROR_CODES.AUTHENTICATION_FAILED, 'Auth failed'))

			await expect(authed.album.addTags({ artist: 'A', album: 'Al', tags: ['t'] })).rejects.toBeInstanceOf(
				LastFmApiError,
			)
		})
	})

	describe('removeTag', () => {
		test('routes to album.removeTag via signed POST with sk and single tag, returns void', async () => {
			const authed = new LastFmClient({
				apiKey: API_KEY,
				sharedSecret: 'test-shared-secret',
				sessionKey: 'SESSION-KEY',
			})
			mock.respondWithJson({})

			const result = await authed.album.removeTag({
				artist: 'Test Artist',
				album: 'Test Album',
				tag: 'favorites',
			})

			const call = mock.lastCall()
			expect(call.method).toBe('POST')
			const body = parseFormBody(call.body)
			expect(body.method).toBe('album.removeTag')
			expect(body.artist).toBe('Test Artist')
			expect(body.album).toBe('Test Album')
			expect(body.tag).toBe('favorites')
			expect(body.sk).toBe('SESSION-KEY')
			expect(body.api_sig).toMatch(/^[a-f0-9]{32}$/)
			expect(result).toBeUndefined()
		})

		test('fails before fetch when no session key is available', async () => {
			const noSession = new LastFmClient({ apiKey: API_KEY, sharedSecret: 'test-shared-secret' })

			let caught: unknown
			try {
				await noSession.album.removeTag({ artist: 'A', album: 'Al', tag: 't' })
			} catch (err) {
				caught = err
			}
			expect(caught).toBeInstanceOf(LastFmApiError)
			expect(mock.calls).toHaveLength(0)
		})
	})

	describe('import coverage', () => {
		test('album service is exposed from root, album entrypoint, and album.schemas entrypoint', () => {
			const c = createClient({ apiKey: API_KEY })
			expect(typeof c.album.getInfo).toBe('function')
			expect(typeof c.album.getTags).toBe('function')
			expect(typeof c.album.getTopTags).toBe('function')
			expect(typeof c.album.search).toBe('function')
			expect(typeof c.album.addTags).toBe('function')
			expect(typeof c.album.removeTag).toBe('function')

			const svc: AlbumService = createAlbumService({ apiKey: API_KEY })
			expect(typeof svc.getInfo).toBe('function')
			expect(typeof svc.search).toBe('function')
			expect(typeof svc.addTags).toBe('function')
			expect(typeof svc.removeTag).toBe('function')

			expect(albumSchemas.albumGetInfoRequestSchema).toBeDefined()
			expect(albumSchemas.albumSearchRequestSchema).toBeDefined()
			expect(albumSchemas.albumAddTagsRequestSchema).toBeDefined()
			expect(albumSchemas.albumRemoveTagRequestSchema).toBeDefined()
		})
	})
})
