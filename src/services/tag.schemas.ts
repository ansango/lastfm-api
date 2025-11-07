import { z } from "zod";
import {
	albumNameSchema,
	artistNameSchema,
	contentSchema,
	countSchema,
	durationSchema,
	fromSchema,
	imageSchema,
	itemsPerPageSchema,
	langSchema,
	limitSchema,
	mbidSchema,
	pageSchema,
	rankSchema,
	reachSchema,
	summarySchema,
	tagNameSchema,
	toSchema,
	totalPagesSchema,
	totalSchema,
	trackNameSchema,
	urlSchema
} from "./schemas/index.js";

export const tagWikiSchema = z.object({
    summary: summarySchema,
    content: contentSchema
});

/**
 * Tag
 * @see https://www.last.fm/api/show/tag.getInfo
 */
export const tagSchema = z.object({
    name: tagNameSchema,
    url: urlSchema,
    total: totalSchema,
    reach: reachSchema,
    wiki: tagWikiSchema
});

export const tagGetInfoRequestSchema = z.object({
    tag: tagNameSchema,
    lang: langSchema.optional()
});

export const tagGetInfoResponseSchema = z.object({
    tag: tagSchema
});

export const tagGetSimilarRequestSchema = z.object({
    tag: tagNameSchema
});

export const tagGetSimilarResponseSchema = z.object({
    similar: z.object({
        tag: z.array(z.object({
            name: tagNameSchema,
            url: urlSchema
        })),
        "@attr": z.object({
            tag: tagNameSchema
        })
    })
});

export const tagGetTopAlbumsRequestSchema = z.object({
    tag: tagNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});

export const tagGetTopAlbumsResponseSchema = z.object({
    albums: z.object({
        album: z.array(z.object({
            name: albumNameSchema,
            mbid: mbidSchema,
            url: urlSchema,
            artist: z.object({
                name: artistNameSchema,
                mbid: mbidSchema,
                url: urlSchema
            }),
            image: z.array(imageSchema),
            "@attr": z.object({
                rank: rankSchema
            })
        })),
        "@attr": z.object({
            tag: tagNameSchema,
            page: pageSchema,
            perPage: itemsPerPageSchema,
            totalPages: totalPagesSchema,
            total: totalSchema
        })
    })
});

export const tagGetTopArtistsRequestSchema = z.object({
    tag: tagNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});

export const tagGetTopArtistsResponseSchema = z.object({
    topartists: z.object({
        artist: z.array(z.object({
            name: artistNameSchema,
            mbid: mbidSchema,
            url: urlSchema,
            image: z.array(imageSchema),
            "@attr": z.object({
                rank: rankSchema
            })
        })),
        "@attr": z.object({
            tag: tagNameSchema,
            page: pageSchema,
            perPage: itemsPerPageSchema,
            totalPages: totalPagesSchema,
            total: totalSchema
        })
    })
});

export const tagGetTopTagsRequestSchema = z.object({
    limit: limitSchema.optional()
});

export const tagGetTopTagsResponseSchema = z.object({
    toptags: z.object({
        tag: z.array(z.object({
            name: tagNameSchema,
            reach: reachSchema,
            count: countSchema
        })),
        "@attr": z.object({
            offset: z.number(),
            num_res: z.number(),
            total: totalSchema
        })
    })
});

export const tagGetTopTracksRequestSchema = z.object({
    tag: tagNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});

export const tagGetTopTracksResponseSchema = z.object({
    toptracks: z.object({
        track: z.array(z.object({
            name: trackNameSchema,
            duration: durationSchema,
            mbid: mbidSchema,
            url: urlSchema,
            artist: z.object({
                name: artistNameSchema,
                mbid: mbidSchema,
                url: urlSchema
            }),
            image: z.array(imageSchema),
            "@attr": z.object({
                rank: rankSchema
            })
        })),
        "@attr": z.object({
            tag: tagNameSchema,
            page: pageSchema,
            perPage: itemsPerPageSchema,
            totalPages: totalPagesSchema,
            total: totalSchema
        })
    })
});

export const tagGetWeeklyChartListRequestSchema = z.object({
    tag: tagNameSchema
});

export const tagGetWeeklyChartListResponseSchema = z.object({
    weeklychartlist: z.object({
        chart: z.array(z.object({
            from: fromSchema,
            to: toSchema
        })),
        "@attr": z.object({
            tag: tagNameSchema
        })
    })
});

// Inferred types
export type TagWiki = z.infer<typeof tagWikiSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type TagGetInfoRequest = z.infer<typeof tagGetInfoRequestSchema>;
export type TagGetInfoResponse = z.infer<typeof tagGetInfoResponseSchema>;
export type TagGetSimilarRequest = z.infer<typeof tagGetSimilarRequestSchema>;
export type TagGetSimilarResponse = z.infer<typeof tagGetSimilarResponseSchema>;
export type TagGetTopAlbumsRequest = z.infer<typeof tagGetTopAlbumsRequestSchema>;
export type TagGetTopAlbumsResponse = z.infer<typeof tagGetTopAlbumsResponseSchema>;
export type TagGetTopArtistsRequest = z.infer<typeof tagGetTopArtistsRequestSchema>;
export type TagGetTopArtistsResponse = z.infer<typeof tagGetTopArtistsResponseSchema>;
export type TagGetTopTagsRequest = z.infer<typeof tagGetTopTagsRequestSchema>;
export type TagGetTopTagsResponse = z.infer<typeof tagGetTopTagsResponseSchema>;
export type TagGetTopTracksRequest = z.infer<typeof tagGetTopTracksRequestSchema>;
export type TagGetTopTracksResponse = z.infer<typeof tagGetTopTracksResponseSchema>;
export type TagGetWeeklyChartListRequest = z.infer<typeof tagGetWeeklyChartListRequestSchema>;
export type TagGetWeeklyChartListResponse = z.infer<typeof tagGetWeeklyChartListResponseSchema>;
