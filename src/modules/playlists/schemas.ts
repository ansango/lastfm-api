import { z } from 'zod'
import { artistNameSchema, limitSchema, trackNameSchema, userNameSchema } from '../../core/schemas/index.js'

export const playlistTrackItemSchema = z.object({
	name: trackNameSchema,
	artist: artistNameSchema,
	album: z.string().optional(),
	duration: z.number().int().nonnegative().optional(),
	sourceReason: z.string().optional(),
})

export const playlistsGenerateRequestSchema = z.object({
	user: userNameSchema,
	mode: z.enum(['time-capsule', 'deep-cuts', 'heavy-rotation', 'discovery-radar']),
	limit: limitSchema.optional(),
})

export const playlistsGenerateResponseSchema = z.object({
	user: userNameSchema,
	mode: z.enum(['time-capsule', 'deep-cuts', 'heavy-rotation', 'discovery-radar']),
	title: z.string(),
	description: z.string(),
	totalTracks: z.number().int().nonnegative(),
	tracks: z.array(playlistTrackItemSchema),
	formats: z.object({
		m3u: z.string(),
		csv: z.string(),
		spotifyQueries: z.array(z.string()),
	}),
})

export const playlistsExportM3URequestSchema = z.object({
	title: z.string().optional(),
	tracks: z.array(playlistTrackItemSchema),
})

export const playlistsExportM3UResponseSchema = z.object({
	filename: z.string(),
	content: z.string(),
	totalTracks: z.number().int().nonnegative(),
})

export const playlistsExportCsvRequestSchema = z.object({
	filename: z.string().optional(),
	tracks: z.array(playlistTrackItemSchema),
})

export const playlistsExportCsvResponseSchema = z.object({
	filename: z.string(),
	content: z.string(),
	totalTracks: z.number().int().nonnegative(),
})

// Schema naming convention aliases for registry lookup
export const playlistsGetGenerateRequestSchema = playlistsGenerateRequestSchema
export const playlistsGetGenerateResponseSchema = playlistsGenerateResponseSchema
export const playlistsGetExportM3URequestSchema = playlistsExportM3URequestSchema
export const playlistsGetExportM3UResponseSchema = playlistsExportM3UResponseSchema
export const playlistsGetExportCsvRequestSchema = playlistsExportCsvRequestSchema
export const playlistsGetExportCsvResponseSchema = playlistsExportCsvResponseSchema

// Inferred types
export type PlaylistTrackItem = z.infer<typeof playlistTrackItemSchema>

export type PlaylistsGenerateRequest = z.infer<typeof playlistsGenerateRequestSchema>
export type PlaylistsGenerateResponse = z.infer<typeof playlistsGenerateResponseSchema>
export type PlaylistsGetGenerateRequest = PlaylistsGenerateRequest
export type PlaylistsGetGenerateResponse = PlaylistsGenerateResponse

export type PlaylistsExportM3URequest = z.infer<typeof playlistsExportM3URequestSchema>
export type PlaylistsExportM3UResponse = z.infer<typeof playlistsExportM3UResponseSchema>
export type PlaylistsGetExportM3URequest = PlaylistsExportM3URequest
export type PlaylistsGetExportM3UResponse = PlaylistsExportM3UResponse

export type PlaylistsExportCsvRequest = z.infer<typeof playlistsExportCsvRequestSchema>
export type PlaylistsExportCsvResponse = z.infer<typeof playlistsExportCsvResponseSchema>
export type PlaylistsGetExportCsvRequest = PlaylistsExportCsvRequest
export type PlaylistsGetExportCsvResponse = PlaylistsExportCsvResponse
