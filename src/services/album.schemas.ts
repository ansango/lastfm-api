import { z } from "zod";
import {
	tagNameSchema,
	urlSchema,
	artistNameSchema,
	mbidSchema,
	durationSchema,
	nameSchema,
	publishedSchema,
	summarySchema,
	contentSchema,
	playcountSchema,
	imageSchema,
	albumNameSchema,
	listenersSchema,
	userNameSchema,
	langSchema,
	countSchema,
	limitSchema,
	pageSchema,
	textSchema,
	roleSchema,
	searchTermsSchema,
	startPageSchema,
	totalResultsSchema,
	startIndexSchema,
	itemsPerPageSchema,
	forSchema,
} from "./schemas/index.js";

const albumTagSchema = z.object({
	tag: z
		.union([
			z.array(
				z.object({
					name: tagNameSchema,
					url: urlSchema,
				})
			),
			z.object({
				name: tagNameSchema,
				url: urlSchema,
			}),
		])
		.optional(),
});

const albumTrackArtistSchema = z.object({
	name: artistNameSchema,
	mbid: mbidSchema,
	url: urlSchema,
});

const albumTrackSchema = z.object({
	track: z.array(
		z.object({
			duration: durationSchema,
			name: nameSchema,
			url: urlSchema,
			artist: albumTrackArtistSchema,
		})
	),
});

const albumWikiSchema = z.object({
	published: publishedSchema,
	summary: summarySchema,
	content: contentSchema,
});

/**
 * Album
 * @see https://www.last.fm/api/show/album.getInfo
 */
export const albumSchema = z.object({
	artist: artistNameSchema,
	mbid: mbidSchema,
	tags: albumTagSchema,
	playcount: playcountSchema,
	image: z.array(imageSchema),
	tracks: albumTrackSchema.optional(),
	url: urlSchema,
	name: albumNameSchema,
	listeners: listenersSchema,
	wiki: albumWikiSchema,
	userplaycount: playcountSchema.optional(),
});

export const albumGetInfoRequestSchema = z.object({
	artist: artistNameSchema,
	album: albumNameSchema,
	mbid: mbidSchema.optional(),
	username: userNameSchema.optional(),
	lang: langSchema.optional(),
});

export const albumGetInfoResponseSchema = z.object({
	album: albumSchema,
});

export const albumGetTagsRequestSchema = z.object({
	artist: artistNameSchema,
	album: albumNameSchema,
	mbid: mbidSchema.optional(),
	user: userNameSchema,
});

export const albumGetTagsResponseSchema = z.object({
	tags: z.object({
		tag: z.array(
			z.object({
				name: tagNameSchema,
				url: urlSchema,
			})
		),
	}),
	"@attr": z.object({
		album: albumNameSchema,
		artist: artistNameSchema,
	}),
});

export const albumGetTopTagsRequestSchema = z.object({
	artist: artistNameSchema,
	album: albumNameSchema,
	mbid: mbidSchema.optional(),
});

export const albumGetTopTagsResponseSchema = z.object({
	tags: z.object({
		tag: z.array(
			z.object({
				name: tagNameSchema,
				url: urlSchema,
				count: countSchema,
			})
		),
	}),
	"@attr": z.object({
		album: albumNameSchema,
		artist: artistNameSchema,
	}),
});

export const albumSearchRequestSchema = z.object({
	album: albumNameSchema,
	limit: limitSchema.optional(),
	page: pageSchema.optional(),
});

export const albumSearchResponseSchema = z.object({
	results: z.object({
		"opensearch:Query": z.object({
			"#text": textSchema,
			role: roleSchema,
			searchTerms: searchTermsSchema,
			startPage: startPageSchema,
		}),
		"opensearch:totalResults": totalResultsSchema,
		"opensearch:startIndex": startIndexSchema,
		"opensearch:itemsPerPage": itemsPerPageSchema,
		albummatches: z.object({
			album: z.array(
				z.object({
					name: albumNameSchema,
					artist: artistNameSchema,
					url: urlSchema,
					image: z.array(imageSchema),
					mbid: mbidSchema,
				})
			),
		}),
		"@attr": z.object({
			for: forSchema,
		}),
	}),
});

// Inferred types
export type Album = z.infer<typeof albumSchema>;
export type AlbumGetInfoRequest = z.infer<typeof albumGetInfoRequestSchema>;
export type AlbumGetInfoResponse = z.infer<typeof albumGetInfoResponseSchema>;
export type AlbumGetTagsRequest = z.infer<typeof albumGetTagsRequestSchema>;
export type AlbumGetTagsResponse = z.infer<typeof albumGetTagsResponseSchema>;
export type AlbumGetTopTagsRequest = z.infer<typeof albumGetTopTagsRequestSchema>;
export type AlbumGetTopTagsResponse = z.infer<typeof albumGetTopTagsResponseSchema>;
export type AlbumSearchRequest = z.infer<typeof albumSearchRequestSchema>;
export type AlbumSearchResponse = z.infer<typeof albumSearchResponseSchema>;
