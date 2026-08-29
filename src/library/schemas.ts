import { z } from 'zod'
import {
	artistNameSchema,
	imageSchema,
	limitSchema,
	mbidSchema,
	pageSchema,
	urlSchema,
	userNameSchema,
} from '../common/schemas/index.js'

const countSchema = z.string().or(z.number()).optional()
const itemsPerPageSchema = z.string().or(z.number()).optional()
const playcountSchema = z.string().or(z.number()).optional()
const totalPagesSchema = z.string().or(z.number()).optional()
const totalSchema = z.string().or(z.number()).optional()

export const libraryGetArtistsRequestSchema = z.object({
	user: userNameSchema,
	limit: limitSchema.optional(),
	page: pageSchema.optional(),
})

export const libraryGetArtistsResponseSchema = z.object({
	artists: z.object({
		artist: z.array(
			z.object({
				tagCount: countSchema,
				image: z.array(imageSchema),
				mbid: mbidSchema,
				url: urlSchema,
				playcount: playcountSchema,
				name: artistNameSchema,
			}),
		),
		'@attr': z.object({
			user: userNameSchema,
			totalPages: totalPagesSchema,
			page: pageSchema,
			perPage: itemsPerPageSchema,
			total: totalSchema,
		}),
	}),
})

export type LibraryGetArtistsRequest = z.infer<typeof libraryGetArtistsRequestSchema>
export type LibraryGetArtistsResponse = z.infer<typeof libraryGetArtistsResponseSchema>
