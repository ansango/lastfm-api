import { z } from 'zod'
import { artistNameSchema, limitSchema, trackNameSchema, userNameSchema } from '../../core/schemas/index.js'

export const reportRankedEntitySchema = z.object({
	name: z.string(),
	playcount: z.number().int().nonnegative(),
	percentage: z.number().nonnegative().optional(),
})

export const reportRankedTrackSchema = z.object({
	name: trackNameSchema,
	artist: artistNameSchema,
	playcount: z.number().int().nonnegative(),
})

export const reportSeasonProfileSchema = z.object({
	topArtist: artistNameSchema.nullable(),
	topTrack: trackNameSchema.nullable(),
	scrobbles: z.number().int().nonnegative(),
})

export const reportsWrappedRequestSchema = z.object({
	user: userNameSchema,
	year: z.number().int().min(2002).max(2030).optional(),
	from: z.number().int().positive().optional(),
	to: z.number().int().positive().optional(),
})

export const reportsWrappedResponseSchema = z.object({
	user: userNameSchema,
	year: z.number().int().optional(),
	from: z.number().int().positive(),
	to: z.number().int().positive(),
	totalScrobbles: z.number().int().nonnegative(),
	estimatedListeningMinutes: z.number().nonnegative(),
	topArtists: z.array(reportRankedEntitySchema),
	topTracks: z.array(reportRankedTrackSchema),
	topAlbums: z.array(reportRankedTrackSchema),
	busiestDay: z.object({
		date: z.string(),
		scrobbles: z.number().int().nonnegative(),
		topArtist: artistNameSchema.nullable(),
	}),
	seasons: z.object({
		winter: reportSeasonProfileSchema,
		spring: reportSeasonProfileSchema,
		summer: reportSeasonProfileSchema,
		fall: reportSeasonProfileSchema,
	}),
})

export const reportMilestoneItemSchema = z.object({
	milestone: z.number().int().positive(),
	track: trackNameSchema,
	artist: artistNameSchema,
	timestamp: z.number().int().positive(),
	date: z.string(),
})

export const reportsMilestonesRequestSchema = z.object({
	user: userNameSchema,
	targets: z.array(z.number().int().positive()).optional(),
	sampleLimit: limitSchema.optional(),
})

export const reportsMilestonesResponseSchema = z.object({
	user: userNameSchema,
	totalScrobbles: z.number().int().nonnegative(),
	milestones: z.array(reportMilestoneItemSchema),
	nextMilestone: z.object({
		target: z.number().int().positive(),
		remainingScrobbles: z.number().int().nonnegative(),
		estimatedDaysRemaining: z.number().nonnegative(),
		projectedDate: z.string(),
	}),
})

export const reportsMonthlyDigestRequestSchema = z.object({
	user: userNameSchema,
	year: z.number().int().min(2002).max(2030).optional(),
	month: z.number().int().min(1).max(12).optional(),
})

export const reportsMonthlyDigestResponseSchema = z.object({
	user: userNameSchema,
	year: z.number().int(),
	month: z.number().int(),
	monthName: z.string(),
	totalScrobbles: z.number().int().nonnegative(),
	previousMonthScrobbles: z.number().int().nonnegative(),
	growthPercentage: z.number(),
	topArtists: z.array(reportRankedEntitySchema),
	topTracks: z.array(reportRankedTrackSchema),
})

// Schema naming convention aliases for registry lookup
export const reportsGetWrappedRequestSchema = reportsWrappedRequestSchema
export const reportsGetWrappedResponseSchema = reportsWrappedResponseSchema
export const reportsGetMilestonesRequestSchema = reportsMilestonesRequestSchema
export const reportsGetMilestonesResponseSchema = reportsMilestonesResponseSchema
export const reportsGetMonthlyDigestRequestSchema = reportsMonthlyDigestRequestSchema
export const reportsGetMonthlyDigestResponseSchema = reportsMonthlyDigestResponseSchema

// Inferred types
export type ReportRankedEntity = z.infer<typeof reportRankedEntitySchema>
export type ReportRankedTrack = z.infer<typeof reportRankedTrackSchema>
export type ReportSeasonProfile = z.infer<typeof reportSeasonProfileSchema>
export type ReportMilestoneItem = z.infer<typeof reportMilestoneItemSchema>

export type ReportsWrappedRequest = z.infer<typeof reportsWrappedRequestSchema>
export type ReportsWrappedResponse = z.infer<typeof reportsWrappedResponseSchema>
export type ReportsGetWrappedRequest = ReportsWrappedRequest
export type ReportsGetWrappedResponse = ReportsWrappedResponse

export type ReportsMilestonesRequest = z.infer<typeof reportsMilestonesRequestSchema>
export type ReportsMilestonesResponse = z.infer<typeof reportsMilestonesResponseSchema>
export type ReportsGetMilestonesRequest = ReportsMilestonesRequest
export type ReportsGetMilestonesResponse = ReportsMilestonesResponse

export type ReportsMonthlyDigestRequest = z.infer<typeof reportsMonthlyDigestRequestSchema>
export type ReportsMonthlyDigestResponse = z.infer<typeof reportsMonthlyDigestResponseSchema>
export type ReportsGetMonthlyDigestRequest = ReportsMonthlyDigestRequest
export type ReportsGetMonthlyDigestResponse = ReportsMonthlyDigestResponse
