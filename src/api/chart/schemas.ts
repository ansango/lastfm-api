import { z } from 'zod'
import {
	artistNameSchema,
	imageSchema,
	limitSchema,
	mbidSchema,
	pageSchema,
	trackNameSchema,
	urlSchema,
} from '../../core/schemas/index.js'

const durationSchema = z.string().or(z.number()).optional()
const itemsPerPageSchema = z.string().or(z.number()).optional()
const listenersSchema = z.string().or(z.number()).optional()
const playcountSchema = z.string().or(z.number()).optional()
const reachSchema = z.string().or(z.number()).optional()
const tagNameSchema = z.string().min(1, 'Tag name cannot be empty')
const totalPagesSchema = z.string().or(z.number()).optional()
const totalSchema = z.string().or(z.number()).optional()

export const chartGetTopArtistsRequestSchema = z.object({
	limit: limitSchema.optional(),
	page: pageSchema.optional(),
})

export const chartGetTopArtistsResponseSchema = z.object({
	artists: z.object({
		artist: z.array(
			z.object({
				name: artistNameSchema,
				playcount: playcountSchema,
				mbid: mbidSchema,
				listeners: listenersSchema,
				url: urlSchema,
				image: z.array(imageSchema),
			}),
		),
		'@attr': z.object({
			page: pageSchema,
			perPage: itemsPerPageSchema,
			totalPages: totalPagesSchema,
			total: totalSchema,
		}),
	}),
})

export const chartGetTopTagsRequestSchema = z.object({
	limit: limitSchema.optional(),
	page: pageSchema.optional(),
})

export const chartGetTopTagsResponseSchema = z.object({
	tags: z.object({
		tag: z.array(
			z.object({
				name: tagNameSchema,
				url: urlSchema,
				reach: reachSchema,
				taggings: z.string(),
			}),
		),
		'@attr': z.object({
			page: pageSchema,
			perPage: itemsPerPageSchema,
			totalPages: totalPagesSchema,
			total: totalSchema,
		}),
	}),
})

export const chartGetTopTracksRequestSchema = z.object({
	limit: limitSchema.optional(),
	page: pageSchema.optional(),
})

export const chartGetTopTracksResponseSchema = z.object({
	tracks: z.object({
		track: z.array(
			z.object({
				name: trackNameSchema,
				duration: durationSchema,
				listeners: listenersSchema,
				mbid: mbidSchema,
				url: urlSchema,
				playcount: playcountSchema,
				artist: z.object({
					name: artistNameSchema,
					mbid: mbidSchema,
					url: urlSchema,
				}),
				image: z.array(imageSchema),
			}),
		),
		'@attr': z.object({
			page: pageSchema,
			perPage: itemsPerPageSchema,
			totalPages: totalPagesSchema,
			total: totalSchema,
		}),
	}),
})

export type ChartGetTopArtistsRequest = z.infer<typeof chartGetTopArtistsRequestSchema>
export type ChartGetTopArtistsResponse = z.infer<typeof chartGetTopArtistsResponseSchema>
export type ChartGetTopTagsRequest = z.infer<typeof chartGetTopTagsRequestSchema>
export type ChartGetTopTagsResponse = z.infer<typeof chartGetTopTagsResponseSchema>
export type ChartGetTopTracksRequest = z.infer<typeof chartGetTopTracksRequestSchema>
export type ChartGetTopTracksResponse = z.infer<typeof chartGetTopTracksResponseSchema>
