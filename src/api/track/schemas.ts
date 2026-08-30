import { z } from 'zod'
import {
	albumNameSchema,
	artistNameSchema,
	imageSchema,
	limitSchema,
	mbidSchema,
	pageSchema,
	trackNameSchema,
	urlSchema,
	userNameSchema,
} from '../../core/schemas/index.js'

const countSchema = z.string().or(z.number()).optional()
const durationSchema = z.string().or(z.number()).optional()
const listenersSchema = z.string().or(z.number()).optional()
const matchSchema = z.string().or(z.number()).optional()
const playcountSchema = z.string().or(z.number()).optional()
const positionSchema = z.string().or(z.number()).optional()
const publishedSchema = z.string().optional()
const summarySchema = z.string().optional()
const contentSchema = z.string().optional()
const roleSchema = z.string().optional()
const searchTermsSchema = z.string().optional()
const startIndexSchema = z.string().or(z.number()).optional()
const startPageSchema = z.string().or(z.number()).optional()
const tagNameSchema = z.string().min(1, 'Tag name cannot be empty')
const totalResultsSchema = z.string().or(z.number()).optional()
const itemsPerPageSchema = z.string().or(z.number()).optional()

export const trackArtistSchema = z.object({
	name: artistNameSchema,
	mbid: mbidSchema,
	url: urlSchema,
})

export const trackAlbumSchema = z.object({
	artist: artistNameSchema,
	title: albumNameSchema,
	mbid: mbidSchema,
	url: urlSchema,
	image: z.array(imageSchema),
	'@attr': z.object({
		position: positionSchema,
	}),
})

export const trackTopTagSchema = z.object({
	tag: z.array(
		z.object({
			name: tagNameSchema,
			url: urlSchema,
		}),
	),
})

export const trackWikiSchema = z.object({
	published: publishedSchema,
	summary: summarySchema,
	content: contentSchema,
})

/**
 * Track
 * @see https://www.last.fm/api/show/track.getInfo
 */
export const trackSchema = z.object({
	name: trackNameSchema,
	mbid: mbidSchema,
	url: urlSchema,
	duration: durationSchema,
	listeners: listenersSchema,
	playcount: playcountSchema,
	artist: trackArtistSchema,
	album: trackAlbumSchema,
	topTags: trackTopTagSchema,
	wiki: trackWikiSchema,
	userplaycount: playcountSchema,
})

export const trackGetInfoRequestSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
	mbid: mbidSchema.optional(),
	username: userNameSchema.optional(),
})

export const trackGetInfoResponseSchema = z.object({
	track: trackSchema,
})

export const trackGetSimilarRequestSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
	mbid: mbidSchema.optional(),
	limit: limitSchema.optional(),
})

export const trackGetSimilarResponseSchema = z.object({
	similartracks: z.object({
		track: z.array(
			z.object({
				name: trackNameSchema,
				playcount: playcountSchema,
				mbid: mbidSchema,
				match: matchSchema,
				url: urlSchema,
				duration: durationSchema,
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
		}),
	}),
})

export const trackGetTagsRequestSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
	mbid: mbidSchema.optional(),
	user: userNameSchema.optional(),
})

export const trackGetTagsResponseSchema = z.object({
	tags: z.object({
		tag: z.array(
			z.object({
				name: tagNameSchema,
				url: urlSchema,
			}),
		),
		'@attr': z.object({
			artist: artistNameSchema,
			track: trackNameSchema,
		}),
	}),
})

export const trackGetTopTagsRequestSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
	mbid: mbidSchema.optional(),
})

export const trackGetTopTagsResponseSchema = z.object({
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
			track: trackNameSchema,
		}),
	}),
})

export const trackSearchRequestSchema = z.object({
	track: trackNameSchema,
	limit: limitSchema.optional(),
	page: pageSchema.optional(),
	artist: artistNameSchema.optional(),
})

export const trackSearchResponseSchema = z.object({
	results: z.object({
		'opensearch:Query': z.object({
			'#text': z.string(),
			role: roleSchema,
			searchTerms: searchTermsSchema,
			startPage: startPageSchema,
		}),
		'opensearch:totalResults': totalResultsSchema,
		'opensearch:startIndex': startIndexSchema,
		'opensearch:itemsPerPage': itemsPerPageSchema,
		trackmatches: z.object({
			track: z.array(
				z.object({
					name: trackNameSchema,
					artist: artistNameSchema,
					url: urlSchema,
					listeners: listenersSchema,
					image: z.array(imageSchema),
					mbid: mbidSchema,
				}),
			),
		}),
		'@attr': z.object({
			for: z.string(),
		}),
	}),
})

export const trackCorrectionSchema = z.object({
	track: z.object({
		name: trackNameSchema,
		mbid: mbidSchema,
		url: urlSchema,
	}),
	artist: z.object({
		name: artistNameSchema,
		mbid: mbidSchema,
		url: urlSchema,
	}),
	artistcorrected: z.string().optional(),
	trackcorrected: z.string().optional(),
	'@attr': z
		.object({
			index: z.string(),
		})
		.optional(),
})

export const trackGetCorrectionRequestSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
})

export const trackGetCorrectionResponseSchema = z.object({
	corrections: z.object({
		correction: z.array(trackCorrectionSchema),
		'@attr': z
			.object({
				artist: artistNameSchema,
				track: trackNameSchema,
			})
			.optional(),
	}),
})

export const trackScrobbleRequestSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
	timestamp: z.union([z.string(), z.number()]),
	sk: z.string().optional(),
	album: albumNameSchema.optional(),
})

export const trackScrobbleResponseSchema = z.object({
	scrobbles: z.object({
		scrobble: z.object({
			artist: z.object({
				corrected: z.string(),
				'#text': artistNameSchema,
			}),
			album: z.object({
				corrected: z.string(),
			}),
			track: z.object({
				corrected: z.string(),
				'#text': trackNameSchema,
			}),
			ignoredMessage: z.object({
				code: z.string(),
				'#text': z.string(),
			}),
			albumArtist: z.object({
				corrected: z.string(),
				'#text': albumNameSchema,
			}),
			timestamp: z.string(),
		}),
		'@attr': z.object({
			accepted: z.number(),
			ignored: z.number(),
		}),
	}),
})

export const batchTracksScrobbleRequestSchema = z.object({
	tracks: z.array(trackScrobbleRequestSchema.omit({ sk: true })),
	sk: z.string().optional(),
})

export const MAX_TRACK_TAGS_PER_ADD = 10

export const trackAddTagsRequestSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
	tags: z.array(tagNameSchema).max(MAX_TRACK_TAGS_PER_ADD, {
		message: `track.addTags accepts at most ${MAX_TRACK_TAGS_PER_ADD} tags per request`,
	}),
	sk: z.string().optional(),
})

export const trackRemoveTagRequestSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
	tag: tagNameSchema,
	sk: z.string().optional(),
})

export const trackLoveRequestSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
	sk: z.string().optional(),
})

export const trackUnloveRequestSchema = trackLoveRequestSchema

export const trackMutationResponseSchema = z.unknown()

export const trackUpdateNowPlayingRequestSchema = z.object({
	artist: artistNameSchema,
	track: trackNameSchema,
	album: albumNameSchema.optional(),
	trackNumber: z.union([z.string(), z.number()]).optional(),
	context: z.string().optional(),
	mbid: mbidSchema.optional(),
	duration: z.union([z.string(), z.number()]).optional(),
	albumArtist: artistNameSchema.optional(),
	sk: z.string().optional(),
})

export const correctedTextFieldSchema = z.object({
	corrected: z.string(),
	'#text': z.string(),
})

export const correctedFlagOnlyFieldSchema = z.object({
	corrected: z.string(),
})

export const nowPlayingIgnoredMessageSchema = z.object({
	code: z.string(),
	'#text': z.string(),
})

export const trackUpdateNowPlayingResponseSchema = z.object({
	nowplaying: z.object({
		track: correctedTextFieldSchema.optional(),
		artist: correctedTextFieldSchema.optional(),
		album: correctedFlagOnlyFieldSchema.optional(),
		albumArtist: correctedTextFieldSchema.optional(),
		ignoredMessage: nowPlayingIgnoredMessageSchema,
	}),
})

// Inferred types
export type TrackArtist = z.infer<typeof trackArtistSchema>
export type TrackAlbum = z.infer<typeof trackAlbumSchema>
export type TrackTopTag = z.infer<typeof trackTopTagSchema>
export type TrackWiki = z.infer<typeof trackWikiSchema>
export type Track = z.infer<typeof trackSchema>
export type TrackGetInfoRequest = z.infer<typeof trackGetInfoRequestSchema>
export type TrackGetInfoResponse = z.infer<typeof trackGetInfoResponseSchema>
export type TrackGetSimilarRequest = z.infer<typeof trackGetSimilarRequestSchema>
export type TrackGetSimilarResponse = z.infer<typeof trackGetSimilarResponseSchema>
export type TrackGetTagsRequest = z.infer<typeof trackGetTagsRequestSchema>
export type TrackGetTagsResponse = z.infer<typeof trackGetTagsResponseSchema>
export type TrackGetTopTagsRequest = z.infer<typeof trackGetTopTagsRequestSchema>
export type TrackGetTopTagsResponse = z.infer<typeof trackGetTopTagsResponseSchema>
export type TrackSearchRequest = z.infer<typeof trackSearchRequestSchema>
export type TrackSearchResponse = z.infer<typeof trackSearchResponseSchema>
export type TrackCorrection = z.infer<typeof trackCorrectionSchema>
export type TrackGetCorrectionRequest = z.infer<typeof trackGetCorrectionRequestSchema>
export type TrackGetCorrectionResponse = z.infer<typeof trackGetCorrectionResponseSchema>
export type TrackScrobbleRequest = z.infer<typeof trackScrobbleRequestSchema>
export type TrackScrobbleResponse = z.infer<typeof trackScrobbleResponseSchema>
export type BatchTracksScrobbleRequest = z.infer<typeof batchTracksScrobbleRequestSchema>
export type TrackAddTagsRequest = z.infer<typeof trackAddTagsRequestSchema>
export type TrackRemoveTagRequest = z.infer<typeof trackRemoveTagRequestSchema>
export type TrackLoveRequest = z.infer<typeof trackLoveRequestSchema>
export type TrackUnloveRequest = TrackLoveRequest
export type TrackMutationResponse = z.infer<typeof trackMutationResponseSchema>
export type TrackUpdateNowPlayingRequest = z.infer<typeof trackUpdateNowPlayingRequestSchema>
export type CorrectedTextField = z.infer<typeof correctedTextFieldSchema>
export type CorrectedFlagOnlyField = z.infer<typeof correctedFlagOnlyFieldSchema>
export type NowPlayingIgnoredMessage = z.infer<typeof nowPlayingIgnoredMessageSchema>
export type TrackUpdateNowPlayingResponse = z.infer<typeof trackUpdateNowPlayingResponseSchema>
