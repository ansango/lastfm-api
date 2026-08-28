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

// Hours Histogram request & response schemas
export const insightsHoursRequestSchema = z.object({
	user: userNameSchema,
	from: z.number().int().nonnegative().optional(),
	to: z.number().int().nonnegative().optional(),
	sinceDays: z.number().int().positive().optional(),
	maxPages: z.number().int().positive().optional(),
})

export const insightsHoursResponseSchema = z.object({
	user: userNameSchema,
	from: z.number().int().nonnegative().optional(),
	to: z.number().int().nonnegative(),
	total: z.number().int().nonnegative(),
	byHour: z.array(z.number().int().nonnegative()),
	byWeekday: z.array(z.number().int().nonnegative()),
	peakHour: z.number().int().nullable(),
	peakHourCount: z.number().int().nonnegative(),
	peakWeekday: z.number().int().nullable(),
	peakWeekdayCount: z.number().int().nonnegative(),
	peakWeekdayLabel: z.string().nullable(),
	nightShare: z.number(),
	morningShare: z.number(),
	afternoonShare: z.number(),
	eveningShare: z.number(),
	weekendShare: z.number(),
})

// Binges request & response schemas
export const insightBingeItemSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema.optional(),
	length: z.number().int().positive(),
	startUts: z.number().int().nonnegative(),
	endUts: z.number().int().nonnegative(),
	durationSeconds: z.number().int().nonnegative(),
})

export const insightsBingesRequestSchema = z.object({
	user: userNameSchema,
	from: z.number().int().nonnegative().optional(),
	to: z.number().int().nonnegative().optional(),
	sinceDays: z.number().int().positive().optional(),
	minLength: z.number().int().positive().optional(),
	maxGapSeconds: z.number().int().positive().optional(),
	trackKey: z.union([z.literal('artist'), z.literal('track'), z.boolean()]).optional(),
	maxResults: z.number().int().positive().optional(),
	maxPages: z.number().int().positive().optional(),
})

export const insightsBingesResponseSchema = z.object({
	user: userNameSchema,
	totalScrobbles: z.number().int().nonnegative(),
	binges: z.array(insightBingeItemSchema),
})

// Trends request & response schemas
export const insightRankedItemSchema = z.object({
	name: z.string(),
	playcount: z.number().int().nonnegative(),
})

export const insightRankedWithDeltaSchema = z.object({
	name: z.string(),
	playcount: z.number().int().nonnegative(),
	currentRank: z.number().int().positive(),
	previousRank: z.number().int().positive().optional(),
	deltaRank: z.number().int(),
	deltaCount: z.number().int(),
})

export const insightsTrendsRequestSchema = z.object({
	user: userNameSchema,
	target: z.union([z.literal('artists'), z.literal('tracks'), z.literal('albums')]).optional(),
	currentPeriod: insightsPeriodSchema.optional(),
	previousPeriod: insightsPeriodSchema.optional(),
	limit: limitSchema.optional(),
	maxResults: z.number().int().positive().optional(),
})

export const insightsTrendsResponseSchema = z.object({
	user: userNameSchema,
	target: z.union([z.literal('artists'), z.literal('tracks'), z.literal('albums')]),
	currentPeriod: z.string(),
	previousPeriod: z.string(),
	risers: z.array(insightRankedWithDeltaSchema),
	fallers: z.array(insightRankedWithDeltaSchema),
	newcomers: z.array(insightRankedWithDeltaSchema),
	departures: z.array(insightRankedItemSchema),
})

// Discoveries request & response schemas
export const insightDiscoveredArtistSchema = z.object({
	name: artistNameSchema,
	firstSeen: z.number().int().nonnegative(),
})

export const insightsDiscoveriesRequestSchema = z.object({
	user: userNameSchema,
	from: z.number().int().nonnegative().optional(),
	to: z.number().int().nonnegative().optional(),
	windowDays: z.number().int().positive().optional(),
	baselineLimit: limitSchema.optional(),
	maxResults: z.number().int().positive().optional(),
	maxPages: z.number().int().positive().optional(),
})

export const insightsDiscoveriesResponseSchema = z.object({
	user: userNameSchema,
	windowDays: z.number().int().positive(),
	baselineSize: z.number().int().nonnegative(),
	totalDiscovered: z.number().int().nonnegative(),
	discoveries: z.array(insightDiscoveredArtistSchema),
})

// Mood request & response schemas
export const insightMoodAxesSchema = z.object({
	energy: z.number(),
	valence: z.number(),
})

export const insightsMoodRequestSchema = z.object({
	user: userNameSchema,
	period: insightsPeriodSchema.optional(),
	topArtistsLimit: limitSchema.optional(),
})

export const insightsMoodResponseSchema = z.object({
	user: userNameSchema,
	period: z.string(),
	axes: insightMoodAxesSchema,
	label: z.string(),
	categories: z.array(z.string()),
	confidence: z.number(),
	tagSourceCount: z.number().int().nonnegative(),
	artistCount: z.number().int().nonnegative(),
	primarySource: z.union([z.literal('user-tags'), z.literal('artist-tags'), z.literal('mixed')]),
})

// Personality request & response schemas
export const insightPersonalityFeaturesSchema = z.object({
	totalScrobbles: z.number().int().nonnegative(),
	uniqueArtists: z.number().int().nonnegative(),
	top1Share: z.number(),
	top3Share: z.number(),
	top5Share: z.number(),
	normalizedDiversity: z.number(),
	newArtistsLast30d: z.number().int().nonnegative(),
	totalArtistsLast30d: z.number().int().nonnegative(),
	nightHourShare: z.number(),
	morningHourShare: z.number(),
	weekdayShare: z.number(),
})

export const insightPersonalityArchetypeSchema = z.object({
	id: z.string(),
	name: z.string(),
	emoji: z.string(),
	blurb: z.string(),
})

export const insightsPersonalityRequestSchema = z.object({
	user: userNameSchema,
})

export const insightsPersonalityResponseSchema = z.object({
	user: userNameSchema,
	winner: z.union([
		z.literal('Devotee'),
		z.literal('Explorer'),
		z.literal('Drifter'),
		z.literal('DJ'),
		z.literal('Nocturnal'),
		z.literal('Archivist'),
	]),
	archetype: insightPersonalityArchetypeSchema,
	scores: z.record(z.string(), z.number()),
	reasons: z.array(z.string()),
	features: insightPersonalityFeaturesSchema,
})

// Compare request & response schemas
export const insightSharedArtistSchema = z.object({
	name: artistNameSchema,
	userAPlaycount: z.number().int().nonnegative(),
	userBPlaycount: z.number().int().nonnegative(),
	weight: z.number().int().nonnegative(),
})

export const insightsCompareRequestSchema = z.object({
	userA: userNameSchema,
	userB: userNameSchema,
	period: insightsPeriodSchema.optional(),
	limit: limitSchema.optional(),
})

export const insightsCompareResponseSchema = z.object({
	userA: userNameSchema,
	userB: userNameSchema,
	period: z.string(),
	compatibilityScore: z.number().int().nonnegative(),
	jaccard: z.number(),
	sharedCount: z.number().int().nonnegative(),
	userACount: z.number().int().nonnegative(),
	userBCount: z.number().int().nonnegative(),
	sharedArtists: z.array(insightSharedArtistSchema),
	onlyUserA: z.array(artistNameSchema),
	onlyUserB: z.array(artistNameSchema),
})

// Schema naming convention aliases for registry lookup
export const insightsGetSummaryRequestSchema = insightsSummaryRequestSchema
export const insightsGetSummaryResponseSchema = insightsSummaryResponseSchema
export const insightsGetNowPlayingRequestSchema = insightsNowPlayingRequestSchema
export const insightsGetNowPlayingResponseSchema = insightsNowPlayingResponseSchema
export const insightsGetHoursHistogramRequestSchema = insightsHoursRequestSchema
export const insightsGetHoursHistogramResponseSchema = insightsHoursResponseSchema
export const insightsGetBingesRequestSchema = insightsBingesRequestSchema
export const insightsGetBingesResponseSchema = insightsBingesResponseSchema
export const insightsGetTrendsRequestSchema = insightsTrendsRequestSchema
export const insightsGetTrendsResponseSchema = insightsTrendsResponseSchema
export const insightsGetDiscoveriesRequestSchema = insightsDiscoveriesRequestSchema
export const insightsGetDiscoveriesResponseSchema = insightsDiscoveriesResponseSchema
export const insightsGetMoodRequestSchema = insightsMoodRequestSchema
export const insightsGetMoodResponseSchema = insightsMoodResponseSchema
export const insightsGetPersonalityRequestSchema = insightsPersonalityRequestSchema
export const insightsGetPersonalityResponseSchema = insightsPersonalityResponseSchema
export const insightsCompareUsersRequestSchema = insightsCompareRequestSchema
export const insightsCompareUsersResponseSchema = insightsCompareResponseSchema
export const insightsGetCompareUsersRequestSchema = insightsCompareRequestSchema
export const insightsGetCompareUsersResponseSchema = insightsCompareResponseSchema

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
export type InsightsHoursRequest = z.infer<typeof insightsHoursRequestSchema>
export type InsightsHoursResponse = z.infer<typeof insightsHoursResponseSchema>
export type InsightsGetHoursHistogramRequest = InsightsHoursRequest
export type InsightsGetHoursHistogramResponse = InsightsHoursResponse
export type InsightBingeItem = z.infer<typeof insightBingeItemSchema>
export type InsightsBingesRequest = z.infer<typeof insightsBingesRequestSchema>
export type InsightsBingesResponse = z.infer<typeof insightsBingesResponseSchema>
export type InsightsGetBingesRequest = InsightsBingesRequest
export type InsightsGetBingesResponse = InsightsBingesResponse
export type InsightRankedItem = z.infer<typeof insightRankedItemSchema>
export type InsightRankedWithDelta = z.infer<typeof insightRankedWithDeltaSchema>
export type InsightsTrendsRequest = z.infer<typeof insightsTrendsRequestSchema>
export type InsightsTrendsResponse = z.infer<typeof insightsTrendsResponseSchema>
export type InsightsGetTrendsRequest = InsightsTrendsRequest
export type InsightsGetTrendsResponse = InsightsTrendsResponse
export type InsightDiscoveredArtist = z.infer<typeof insightDiscoveredArtistSchema>
export type InsightsDiscoveriesRequest = z.infer<typeof insightsDiscoveriesRequestSchema>
export type InsightsDiscoveriesResponse = z.infer<typeof insightsDiscoveriesResponseSchema>
export type InsightsGetDiscoveriesRequest = InsightsDiscoveriesRequest
export type InsightsGetDiscoveriesResponse = InsightsDiscoveriesResponse
export type InsightMoodAxes = z.infer<typeof insightMoodAxesSchema>
export type InsightsMoodRequest = z.infer<typeof insightsMoodRequestSchema>
export type InsightsMoodResponse = z.infer<typeof insightsMoodResponseSchema>
export type InsightsGetMoodRequest = InsightsMoodRequest
export type InsightsGetMoodResponse = InsightsMoodResponse
export type InsightPersonalityFeatures = z.infer<typeof insightPersonalityFeaturesSchema>
export type InsightPersonalityArchetype = z.infer<typeof insightPersonalityArchetypeSchema>
export type InsightsPersonalityRequest = z.infer<typeof insightsPersonalityRequestSchema>
export type InsightsPersonalityResponse = z.infer<typeof insightsPersonalityResponseSchema>
export type InsightsGetPersonalityRequest = InsightsPersonalityRequest
export type InsightsGetPersonalityResponse = InsightsPersonalityResponse
export type InsightSharedArtist = z.infer<typeof insightSharedArtistSchema>
export type InsightsCompareRequest = z.infer<typeof insightsCompareRequestSchema>
export type InsightsCompareResponse = z.infer<typeof insightsCompareResponseSchema>
export type InsightsCompareUsersRequest = InsightsCompareRequest
export type InsightsCompareUsersResponse = InsightsCompareResponse
