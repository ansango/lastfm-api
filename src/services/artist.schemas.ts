import { z } from 'zod'
import {
	artistNameSchema,
	contentSchema,
	countSchema,
	forSchema,
	imageSchema,
	indexSchema,
	itemsPerPageSchema,
	langSchema,
	limitSchema,
	listenersSchema,
	matchSchema,
	mbidSchema,
	pageSchema,
	playcountSchema,
	publishedSchema,
	rankSchema,
	roleSchema,
	searchTermsSchema,
	startIndexSchema,
	startPageSchema,
	summarySchema,
	tagNameSchema,
	textSchema,
	totalPagesSchema,
	totalResultsSchema,
	totalSchema,
	urlSchema,
	userNameSchema,
} from './schemas/index.js'

export const artistStatsSchema = z.object({
	listeners: listenersSchema,
	playcount: playcountSchema,
	userplaycount: playcountSchema.optional(),
})

export const artistSimilarSchema = z.object({
	artist: z.array(
		z.object({
			name: artistNameSchema,
			url: urlSchema,
			image: z.array(imageSchema),
		}),
	),
})

export const artistTagsSchema = z.object({
	tag: z.array(
		z.object({
			name: tagNameSchema,
			url: urlSchema,
		}),
	),
})

export const artistBioSchema = z.object({
	links: z.object({
		link: z.object({
			'#text': textSchema,
			rel: z.string(),
			href: z.string(),
		}),
	}),
	published: publishedSchema,
	summary: summarySchema,
	content: contentSchema,
})

/**
 * Artist
 * @see https://www.last.fm/api/show/artist.getInfo
 */
export const artistSchema = z.object({
	name: artistNameSchema,
	mbid: mbidSchema,
	url: urlSchema,
	image: z.array(imageSchema),
	ontour: z.string(),
	stats: artistStatsSchema,
	similar: artistSimilarSchema,
	tags: artistTagsSchema,
	bio: artistBioSchema,
})

export const artistGetInfoRequestSchema = z.object({
	artist: artistNameSchema,
	mbid: mbidSchema.optional(),
	lang: langSchema.optional(),
	user: userNameSchema.optional(),
})

export const artistGetInfoResponseSchema = z.object({
	artist: artistSchema,
})

export const artistGetTagsRequestSchema = z.object({
	artist: artistNameSchema,
	mbid: mbidSchema.optional(),
	limit: limitSchema.optional(),
})

export const artistGetTagsResponseSchema = z.object({
	tags: z.object({
		tag: z.array(
			z.object({
				name: tagNameSchema,
				url: urlSchema,
			}),
		),
		'@attr': z.object({
			artist: artistNameSchema,
		}),
	}),
})

/**
 * Artist correction entry returned by `artist.getCorrection`.
 *
 * Last.fm returns a list of corrections. Each entry carries the
 * canonical artist identity (`name`, `mbid`, `url`) and a positional
 * `index` attribute indicating which input this correction maps to.
 * https://www.last.fm/api/show/artist.getCorrection
 */
export const artistCorrectionSchema = z.object({
	artist: z.object({
		name: artistNameSchema,
		mbid: mbidSchema,
		url: urlSchema,
	}),
	'@attr': z
		.object({
			index: indexSchema,
		})
		.optional(),
})

export const artistGetCorrectionRequestSchema = z.object({
	artist: artistNameSchema,
})

export const artistGetCorrectionResponseSchema = z.object({
	corrections: z.object({
		correction: z.array(artistCorrectionSchema),
		'@attr': z
			.object({
				artist: artistNameSchema,
			})
			.optional(),
	}),
})

/**
 * Maximum number of tags accepted by `artist.addTags` per the Last.fm
 * API documentation.
 */
export const MAX_ARTIST_TAGS_PER_ADD = 10

/**
 * Request shape for `artist.addTags`. The `tags` array is sent on the
 * wire as a comma-separated string and validated to at most
 * `MAX_ARTIST_TAGS_PER_ADD` entries.
 * https://www.last.fm/api/show/artist.addTags
 */
export const artistAddTagsRequestSchema = z.object({
	artist: artistNameSchema,
	tags: z.array(tagNameSchema).max(MAX_ARTIST_TAGS_PER_ADD, {
		message: `artist.addTags accepts at most ${MAX_ARTIST_TAGS_PER_ADD} tags per request`,
	}),
	sk: z.string().optional(),
})

/**
 * Request shape for `artist.removeTag`. A single tag is removed per
 * call.
 * https://www.last.fm/api/show/artist.removeTag
 */
export const artistRemoveTagRequestSchema = z.object({
	artist: artistNameSchema,
	tag: tagNameSchema,
	sk: z.string().optional(),
})

/**
 * Empty success payload for the void tag-mutation methods.
 */
export const artistTagMutationResponseSchema = z.unknown()

export const artistGetSimilarRequestSchema = z.object({
	artist: artistNameSchema,
	mbid: mbidSchema.optional(),
	limit: limitSchema.optional(),
})

export const artistGetSimilarResponseSchema = z.object({
	similarartists: z.object({
		artist: z.array(
			z.object({
				name: artistNameSchema,
				match: matchSchema,
				url: urlSchema,
				image: z.array(imageSchema),
			}),
		),
		'@attr': z.object({
			artist: artistNameSchema,
		}),
	}),
})

export const artistGetTopAlbumsRequestSchema = z.object({
	artist: artistNameSchema,
	mbid: mbidSchema.optional(),
	limit: limitSchema.optional(),
	page: pageSchema.optional(),
})

export const artistGetTopAlbumsResponseSchema = z.object({
	topalbums: z.object({
		album: z.array(
			z.object({
				name: artistNameSchema,
				playcount: playcountSchema,
				mbid: mbidSchema,
				url: urlSchema,
				artist: z.object({
					name: artistNameSchema,
					mbid: mbidSchema,
					url: urlSchema,
				}),
				image: z.array(imageSchema),
			}),
		),
		'@attr': z.object({
			artist: artistNameSchema,
			page: pageSchema,
			perPage: itemsPerPageSchema,
			totalPages: totalPagesSchema,
			total: totalSchema,
		}),
	}),
})

export const artistGetTopTagsRequestSchema = z.object({
	artist: artistNameSchema,
	mbid: mbidSchema.optional(),
})

export const artistGetTopTagsResponseSchema = z.object({
	toptags: z.object({
		tag: z.array(
			z.object({
				name: tagNameSchema,
				url: urlSchema,
				count: countSchema,
			}),
		),
		'@attr': z.object({
			artist: artistNameSchema,
		}),
	}),
})

export const artistGetTopTracksRequestSchema = z.object({
	artist: artistNameSchema,
	mbid: mbidSchema.optional(),
	limit: limitSchema.optional(),
	page: pageSchema.optional(),
})

export const artistGetTopTracksResponseSchema = z.object({
	toptracks: z.object({
		track: z.array(
			z.object({
				name: artistNameSchema,
				playcount: playcountSchema,
				listeners: listenersSchema,
				mbid: mbidSchema,
				url: urlSchema,
				artist: z.object({
					name: artistNameSchema,
					mbid: mbidSchema,
					url: urlSchema,
				}),
				image: z.array(imageSchema),
				'@attr': z.object({
					rank: rankSchema,
				}),
			}),
		),
		'@attr': z.object({
			artist: artistNameSchema,
			page: pageSchema,
			perPage: itemsPerPageSchema,
			totalPages: totalPagesSchema,
			total: totalSchema,
		}),
	}),
})

export const artistSearchRequestSchema = z.object({
	artist: artistNameSchema,
	limit: limitSchema.optional(),
	page: pageSchema.optional(),
})

export const artistSearchResponseSchema = z.object({
	results: z.object({
		'opensearch:Query': z.object({
			'#text': textSchema,
			role: roleSchema,
			searchTerms: searchTermsSchema,
			startPage: startPageSchema,
		}),
		'opensearch:totalResults': totalResultsSchema,
		'opensearch:startIndex': startIndexSchema,
		'opensearch:itemsPerPage': itemsPerPageSchema,
		artistmatches: z.object({
			artist: z.array(
				z.object({
					name: artistNameSchema,
					listeners: listenersSchema,
					mbid: mbidSchema,
					url: urlSchema,
					image: z.array(imageSchema),
				}),
			),
		}),
		'@attr': z.object({
			for: forSchema,
		}),
	}),
})

// Inferred types
export type ArtistStats = z.infer<typeof artistStatsSchema>
export type ArtistSimilar = z.infer<typeof artistSimilarSchema>
export type ArtistTags = z.infer<typeof artistTagsSchema>
export type ArtistBio = z.infer<typeof artistBioSchema>
export type Artist = z.infer<typeof artistSchema>
export type ArtistGetInfoRequest = z.infer<typeof artistGetInfoRequestSchema>
export type ArtistGetInfoResponse = z.infer<typeof artistGetInfoResponseSchema>
export type ArtistGetTagsRequest = z.infer<typeof artistGetTagsRequestSchema>
export type ArtistGetTagsResponse = z.infer<typeof artistGetTagsResponseSchema>
export type ArtistCorrection = z.infer<typeof artistCorrectionSchema>
export type ArtistGetCorrectionRequest = z.infer<typeof artistGetCorrectionRequestSchema>
export type ArtistGetCorrectionResponse = z.infer<typeof artistGetCorrectionResponseSchema>
export type ArtistAddTagsRequest = z.infer<typeof artistAddTagsRequestSchema>
export type ArtistRemoveTagRequest = z.infer<typeof artistRemoveTagRequestSchema>
export type ArtistTagMutationResponse = z.infer<typeof artistTagMutationResponseSchema>
export type ArtistGetSimilarRequest = z.infer<typeof artistGetSimilarRequestSchema>
export type ArtistGetSimilarResponse = z.infer<typeof artistGetSimilarResponseSchema>
export type ArtistGetTopAlbumsRequest = z.infer<typeof artistGetTopAlbumsRequestSchema>
export type ArtistGetTopAlbumsResponse = z.infer<typeof artistGetTopAlbumsResponseSchema>
export type ArtistGetTopTagsRequest = z.infer<typeof artistGetTopTagsRequestSchema>
export type ArtistGetTopTagsResponse = z.infer<typeof artistGetTopTagsResponseSchema>
export type ArtistGetTopTracksRequest = z.infer<typeof artistGetTopTracksRequestSchema>
export type ArtistGetTopTracksResponse = z.infer<typeof artistGetTopTracksResponseSchema>
export type ArtistSearchRequest = z.infer<typeof artistSearchRequestSchema>
export type ArtistSearchResponse = z.infer<typeof artistSearchResponseSchema>
