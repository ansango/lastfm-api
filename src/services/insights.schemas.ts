import { z } from 'zod'
import {
	artistNameSchema,
	imageSchema,
	limitSchema,
	mbidSchema,
	periodSchema,
	trackNameSchema,
	urlSchema,
	userNameSchema,
} from './schemas/index.js'

// Period schema supporting canonical tokens and human aliases
export const insightsPeriodSchema = z.union([
	periodSchema,
	z.literal('daily'),
	z.literal('weekly'),
	z.literal('monthly'),
	z.literal('yearly'),
])

// Base entity schemas for insights
export const insightArtistEntrySchema = z.object({
	name: artistNameSchema,
	playcount: z.number().int().nonnegative().optional(),
	mbid: mbidSchema.optional(),
	url: urlSchema.optional(),
	image: z.array(imageSchema).optional(),
})

export const insightTrackEntrySchema = z.object({
	name: trackNameSchema,
	artist: artistNameSchema,
	album: z.string().optional(),
	playcount: z.number().int().nonnegative().optional(),
	mbid: mbidSchema.optional(),
	url: urlSchema.optional(),
	image: z.array(imageSchema).optional(),
})

export const insightAlbumEntrySchema = z.object({
	name: z.string(),
	artist: artistNameSchema.optional(),
	playcount: z.number().int().nonnegative().optional(),
	mbid: mbidSchema.optional(),
	url: urlSchema.optional(),
	image: z.array(imageSchema).optional(),
})

export const insightTagEntrySchema = z.object({
	name: z.string(),
	count: z.number().int().nonnegative().optional(),
	url: urlSchema.optional(),
})

// Diversity stats schema
export const insightsDiversityStatsSchema = z.object({
	shannon: z.number(),
	normalized: z.number(),
	top1Share: z.number(),
	top3Share: z.number(),
	top5Share: z.number(),
	uniqueArtists: z.number().int().nonnegative(),
})

// Summary request & response schemas
export const insightsSummaryRequestSchema = z.object({
	user: userNameSchema,
	period: insightsPeriodSchema.optional(),
	limit: limitSchema.optional(),
})

export const insightsSummaryResponseSchema = z.object({
	user: userNameSchema,
	period: z.string(),
	label: z.string(),
	lastfmPeriod: z.string(),
	from: z.number().optional(),
	to: z.number(),
	topArtists: z.array(insightArtistEntrySchema),
	topTracks: z.array(insightTrackEntrySchema),
	topAlbums: z.array(insightAlbumEntrySchema),
	topTags: z.array(insightTagEntrySchema),
	totalScrobbles: z.number().int().nonnegative(),
	diversity: insightsDiversityStatsSchema.optional(),
})

// Now Playing request & response schemas
export const insightsNowPlayingRequestSchema = z.object({
	user: userNameSchema,
	similarLimit: limitSchema.optional(),
	bioMaxChars: z.number().int().positive().optional(),
})

export const insightsNowPlayingResponseSchema = z.object({
	user: userNameSchema,
	nowPlaying: z.boolean(),
	track: z.object({
		name: z.string(),
		mbid: mbidSchema.optional(),
		url: urlSchema.optional(),
	}),
	artist: z.object({
		name: artistNameSchema,
		mbid: mbidSchema.optional(),
		url: urlSchema.optional(),
	}),
	album: z.string().optional(),
	image: z.string().optional(),
	bio: z.string(),
	similar: z.array(
		z.object({
			name: artistNameSchema,
			url: urlSchema.optional(),
			match: z.number().optional(),
		}),
	),
})

// Schema naming convention aliases for registry lookup
export const insightsGetSummaryRequestSchema = insightsSummaryRequestSchema
export const insightsGetSummaryResponseSchema = insightsSummaryResponseSchema
export const insightsGetNowPlayingRequestSchema = insightsNowPlayingRequestSchema
export const insightsGetNowPlayingResponseSchema = insightsNowPlayingResponseSchema

// Inferred types
export type InsightsPeriod = z.infer<typeof insightsPeriodSchema>
export type InsightArtistEntry = z.infer<typeof insightArtistEntrySchema>
export type InsightTrackEntry = z.infer<typeof insightTrackEntrySchema>
export type InsightAlbumEntry = z.infer<typeof insightAlbumEntrySchema>
export type InsightTagEntry = z.infer<typeof insightTagEntrySchema>
export type InsightsDiversityStats = z.infer<typeof insightsDiversityStatsSchema>
export type InsightsSummaryRequest = z.infer<typeof insightsSummaryRequestSchema>
export type InsightsSummaryResponse = z.infer<typeof insightsSummaryResponseSchema>
export type InsightsGetSummaryRequest = InsightsSummaryRequest
export type InsightsGetSummaryResponse = InsightsSummaryResponse
export type InsightsNowPlayingRequest = z.infer<typeof insightsNowPlayingRequestSchema>
export type InsightsNowPlayingResponse = z.infer<typeof insightsNowPlayingResponseSchema>
export type InsightsGetNowPlayingRequest = InsightsNowPlayingRequest
export type InsightsGetNowPlayingResponse = InsightsNowPlayingResponse
