import { z } from "zod";
import { artistNameSchema, contentSchema, countSchema, forSchema, imageSchema, itemsPerPageSchema, langSchema, limitSchema, listenersSchema, matchSchema, mbidSchema, pageSchema, playcountSchema, publishedSchema, rankSchema, roleSchema, searchTermsSchema, startIndexSchema, startPageSchema, summarySchema, tagNameSchema, textSchema, totalPagesSchema, totalResultsSchema, totalSchema, urlSchema, userNameSchema, } from "./schemas/index.js";
export const artistStatsSchema = z.object({
    listeners: listenersSchema,
    playcount: playcountSchema,
    userplaycount: playcountSchema.optional()
});
export const artistSimilarSchema = z.object({
    artist: z.array(z.object({
        name: artistNameSchema,
        url: urlSchema,
        image: z.array(imageSchema)
    }))
});
export const artistTagsSchema = z.object({
    tag: z.array(z.object({
        name: tagNameSchema,
        url: urlSchema
    }))
});
export const artistBioSchema = z.object({
    links: z.object({
        link: z.object({
            "#text": textSchema,
            rel: z.string(),
            href: z.string()
        })
    }),
    published: publishedSchema,
    summary: summarySchema,
    content: contentSchema
});
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
    bio: artistBioSchema
});
export const artistGetInfoRequestSchema = z.object({
    artist: artistNameSchema,
    mbid: mbidSchema.optional(),
    lang: langSchema.optional(),
    user: userNameSchema.optional()
});
export const artistGetInfoResponseSchema = z.object({
    artist: artistSchema
});
export const artistGetTagsRequestSchema = z.object({
    artist: artistNameSchema,
    mbid: mbidSchema.optional(),
    limit: limitSchema.optional()
});
export const artistGetTagsResponseSchema = z.object({
    tags: z.object({
        tag: z.array(z.object({
            name: tagNameSchema,
            url: urlSchema
        })),
        "@attr": z.object({
            artist: artistNameSchema
        })
    })
});
export const artistGetSimilarRequestSchema = z.object({
    artist: artistNameSchema,
    mbid: mbidSchema.optional(),
    limit: limitSchema.optional()
});
export const artistGetSimilarResponseSchema = z.object({
    similarartists: z.object({
        artist: z.array(z.object({
            name: artistNameSchema,
            match: matchSchema,
            url: urlSchema,
            image: z.array(imageSchema)
        })),
        "@attr": z.object({
            artist: artistNameSchema
        })
    })
});
export const artistGetTopAlbumsRequestSchema = z.object({
    artist: artistNameSchema,
    mbid: mbidSchema.optional(),
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});
export const artistGetTopAlbumsResponseSchema = z.object({
    topalbums: z.object({
        album: z.array(z.object({
            name: artistNameSchema,
            playcount: playcountSchema,
            mbid: mbidSchema,
            url: urlSchema,
            artist: z.object({
                name: artistNameSchema,
                mbid: mbidSchema,
                url: urlSchema
            }),
            image: z.array(imageSchema)
        })),
        "@attr": z.object({
            artist: artistNameSchema,
            page: pageSchema,
            perPage: itemsPerPageSchema,
            totalPages: totalPagesSchema,
            total: totalSchema
        })
    })
});
export const artistGetTopTagsRequestSchema = z.object({
    artist: artistNameSchema,
    mbid: mbidSchema.optional()
});
export const artistGetTopTagsResponseSchema = z.object({
    toptags: z.object({
        tag: z.array(z.object({
            name: tagNameSchema,
            url: urlSchema,
            count: countSchema
        })),
        "@attr": z.object({
            artist: artistNameSchema
        })
    })
});
export const artistGetTopTracksRequestSchema = z.object({
    artist: artistNameSchema,
    mbid: mbidSchema.optional(),
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});
export const artistGetTopTracksResponseSchema = z.object({
    toptracks: z.object({
        track: z.array(z.object({
            name: artistNameSchema,
            playcount: playcountSchema,
            listeners: listenersSchema,
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
            artist: artistNameSchema,
            page: pageSchema,
            perPage: itemsPerPageSchema,
            totalPages: totalPagesSchema,
            total: totalSchema
        })
    })
});
export const artistSearchRequestSchema = z.object({
    artist: artistNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});
export const artistSearchResponseSchema = z.object({
    results: z.object({
        "opensearch:Query": z.object({
            "#text": textSchema,
            role: roleSchema,
            searchTerms: searchTermsSchema,
            startPage: startPageSchema
        }),
        "opensearch:totalResults": totalResultsSchema,
        "opensearch:startIndex": startIndexSchema,
        "opensearch:itemsPerPage": itemsPerPageSchema,
        artistmatches: z.object({
            artist: z.array(z.object({
                name: artistNameSchema,
                listeners: listenersSchema,
                mbid: mbidSchema,
                url: urlSchema,
                image: z.array(imageSchema)
            }))
        }),
        "@attr": z.object({
            for: forSchema
        })
    })
});
//# sourceMappingURL=artist.schemas.js.map