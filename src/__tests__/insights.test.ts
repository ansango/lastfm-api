import { describe, expect, test } from 'bun:test'
import { LastFmClient } from '../client.js'
import { createInsightsService, type InsightsService } from '../entrypoints/insights.js'
import * as insightSchemas from '../entrypoints/insights.schemas.js'
import { createClient } from '../index.js'

const API_KEY = 'test-api-key'

describe('insights service foundation', () => {
	describe('client integration', () => {
		test('exposes insights service property on LastFmClient', () => {
			const client = new LastFmClient({ apiKey: API_KEY })
			expect(client.insights).toBeDefined()
			expect(typeof client.insights).toBe('object')
		})

		test('factory createInsightsService instantiates InsightsService', () => {
			const svc: InsightsService = createInsightsService({ apiKey: API_KEY })
			expect(svc).toBeDefined()
			expect(typeof svc).toBe('object')
		})

		test('exposes insights service via createClient helper', () => {
			const client = createClient({ apiKey: API_KEY })
			expect(client.insights).toBeDefined()
			expect(typeof client.insights).toBe('object')
		})
	})

	describe('schema exports and validation', () => {
		test('insightArtistEntrySchema validates valid artist entries', () => {
			const valid = {
				name: 'Radiohead',
				playcount: 42,
				url: 'https://www.last.fm/music/Radiohead',
			}
			const result = insightSchemas.insightArtistEntrySchema.safeParse(valid)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.name).toBe('Radiohead')
				expect(result.data.playcount).toBe(42)
			}
		})

		test('insightTrackEntrySchema validates valid track entries', () => {
			const valid = {
				name: 'Karma Police',
				artist: 'Radiohead',
				playcount: 10,
			}
			const result = insightSchemas.insightTrackEntrySchema.safeParse(valid)
			expect(result.success).toBe(true)
		})

		test('insightAlbumEntrySchema validates valid album entries', () => {
			const valid = {
				name: 'OK Computer',
				artist: 'Radiohead',
				playcount: 15,
			}
			const result = insightSchemas.insightAlbumEntrySchema.safeParse(valid)
			expect(result.success).toBe(true)
		})

		test('insightTagEntrySchema validates valid tag entries', () => {
			const valid = {
				name: 'alternative rock',
				count: 100,
			}
			const result = insightSchemas.insightTagEntrySchema.safeParse(valid)
			expect(result.success).toBe(true)
		})
	})

	describe('import coverage', () => {
		test('insights schemas and service are exposed from subpaths and root', () => {
			expect(insightSchemas.insightArtistEntrySchema).toBeDefined()
			expect(insightSchemas.insightTrackEntrySchema).toBeDefined()
			expect(insightSchemas.insightAlbumEntrySchema).toBeDefined()
			expect(insightSchemas.insightTagEntrySchema).toBeDefined()
		})
	})
})
