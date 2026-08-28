import { z } from 'zod'
import { artistNameSchema, imageSchema, mbidSchema, trackNameSchema, urlSchema } from './schemas/index.js'

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
	artist: artistNameSchema,
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

// Inferred types
export type InsightArtistEntry = z.infer<typeof insightArtistEntrySchema>
export type InsightTrackEntry = z.infer<typeof insightTrackEntrySchema>
export type InsightAlbumEntry = z.infer<typeof insightAlbumEntrySchema>
export type InsightTagEntry = z.infer<typeof insightTagEntrySchema>
