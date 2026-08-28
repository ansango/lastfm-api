import { z } from 'zod'
import {
	artistNameSchema,
	limitSchema,
	mbidSchema,
	trackNameSchema,
	urlSchema,
	userNameSchema,
} from '../core/schemas/base/index.js'

export const exportScrobbleRecordSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
	album: z.string().optional(),
	uts: z.number().int().positive(),
	timestamp: z.string(),
	mbid: mbidSchema.optional(),
})

export const exporterScrobblesRequestSchema = z.object({
	user: userNameSchema,
	from: z.number().int().positive().optional(),
	to: z.number().int().positive().optional(),
	limit: limitSchema.optional(),
	format: z.enum(['json', 'jsonl', 'csv', 'listenbrainz']).optional(),
})

export const exporterScrobblesResponseSchema = z.object({
	user: userNameSchema,
	format: z.enum(['json', 'jsonl', 'csv', 'listenbrainz']),
	totalExported: z.number().int().nonnegative(),
	from: z.number().int().positive().optional(),
	to: z.number().int().positive().optional(),
	oldestUts: z.number().int().positive().optional(),
	newestUts: z.number().int().positive().optional(),
	nextCheckpointUts: z.number().int().positive().optional(),
	content: z.string(),
	scrobbles: z.array(exportScrobbleRecordSchema),
})

export const exportLovedTrackRecordSchema = z.object({
	name: trackNameSchema,
	artist: artistNameSchema,
	url: urlSchema.optional(),
	date: z.string().optional(),
	uts: z.number().int().positive().optional(),
})

export const exporterLovedTracksRequestSchema = z.object({
	user: userNameSchema,
	limit: limitSchema.optional(),
	format: z.enum(['json', 'csv']).optional(),
})

export const exporterLovedTracksResponseSchema = z.object({
	user: userNameSchema,
	format: z.enum(['json', 'csv']),
	totalExported: z.number().int().nonnegative(),
	content: z.string(),
	tracks: z.array(exportLovedTrackRecordSchema),
})

export const exportLibraryArtistRecordSchema = z.object({
	name: artistNameSchema,
	playcount: z.number().int().nonnegative(),
	tagcount: z.number().int().nonnegative().optional(),
	mbid: mbidSchema.optional(),
	url: urlSchema.optional(),
})

export const exporterLibraryRequestSchema = z.object({
	user: userNameSchema,
	limit: limitSchema.optional(),
	format: z.enum(['json', 'csv']).optional(),
})

export const exporterLibraryResponseSchema = z.object({
	user: userNameSchema,
	format: z.enum(['json', 'csv']),
	totalExported: z.number().int().nonnegative(),
	content: z.string(),
	artists: z.array(exportLibraryArtistRecordSchema),
})

// Schema naming convention aliases for registry lookup
export const exporterExportScrobblesRequestSchema = exporterScrobblesRequestSchema
export const exporterExportScrobblesResponseSchema = exporterScrobblesResponseSchema
export const exporterExportLovedTracksRequestSchema = exporterLovedTracksRequestSchema
export const exporterExportLovedTracksResponseSchema = exporterLovedTracksResponseSchema
export const exporterExportLibraryRequestSchema = exporterLibraryRequestSchema
export const exporterExportLibraryResponseSchema = exporterLibraryResponseSchema
export const exporterGetExportScrobblesRequestSchema = exporterScrobblesRequestSchema
export const exporterGetExportScrobblesResponseSchema = exporterScrobblesResponseSchema
export const exporterGetExportLovedTracksRequestSchema = exporterLovedTracksRequestSchema
export const exporterGetExportLovedTracksResponseSchema = exporterLovedTracksResponseSchema
export const exporterGetExportLibraryRequestSchema = exporterLibraryRequestSchema
export const exporterGetExportLibraryResponseSchema = exporterLibraryResponseSchema

// Inferred types
export type ExportScrobbleRecord = z.infer<typeof exportScrobbleRecordSchema>
export type ExporterScrobblesRequest = z.infer<typeof exporterScrobblesRequestSchema>
export type ExporterScrobblesResponse = z.infer<typeof exporterScrobblesResponseSchema>
export type ExporterGetExportScrobblesRequest = ExporterScrobblesRequest
export type ExporterGetExportScrobblesResponse = ExporterScrobblesResponse

export type ExportLovedTrackRecord = z.infer<typeof exportLovedTrackRecordSchema>
export type ExporterLovedTracksRequest = z.infer<typeof exporterLovedTracksRequestSchema>
export type ExporterLovedTracksResponse = z.infer<typeof exporterLovedTracksResponseSchema>
export type ExporterGetExportLovedTracksRequest = ExporterLovedTracksRequest
export type ExporterGetExportLovedTracksResponse = ExporterLovedTracksResponse

export type ExportLibraryArtistRecord = z.infer<typeof exportLibraryArtistRecordSchema>
export type ExporterLibraryRequest = z.infer<typeof exporterLibraryRequestSchema>
export type ExporterLibraryResponse = z.infer<typeof exporterLibraryResponseSchema>
export type ExporterGetExportLibraryRequest = ExporterLibraryRequest
export type ExporterGetExportLibraryResponse = ExporterLibraryResponse
