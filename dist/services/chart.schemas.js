import { z } from "zod";
import { artistNameSchema, durationSchema, imageSchema, itemsPerPageSchema, limitSchema, listenersSchema, mbidSchema, pageSchema, playcountSchema, reachSchema, tagNameSchema, totalPagesSchema, totalSchema, trackNameSchema, urlSchema } from "./schemas/index.js";
export const chartGetTopArtistsRequestSchema = z.object({
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});
export const chartGetTopArtistsResponseSchema = z.object({
    artists: z.object({
        artist: z.array(z.object({
            name: artistNameSchema,
            playcount: playcountSchema,
            mbid: mbidSchema,
            listeners: listenersSchema,
            url: urlSchema,
            image: z.array(imageSchema)
        })),
        "@attr": z.object({
            page: pageSchema,
            perPage: itemsPerPageSchema,
            totalPages: totalPagesSchema,
            total: totalSchema
        })
    })
});
export const chartGetTopTagsRequestSchema = z.object({
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});
export const chartGetTopTagsResponseSchema = z.object({
    tags: z.object({
        tag: z.array(z.object({
            name: tagNameSchema,
            url: urlSchema,
            reach: reachSchema,
            taggings: z.string()
        })),
        "@attr": z.object({
            page: pageSchema,
            perPage: itemsPerPageSchema,
            totalPages: totalPagesSchema,
            total: totalSchema
        })
    })
});
export const chartGetTopTracksRequestSchema = z.object({
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});
export const chartGetTopTracksResponseSchema = z.object({
    tracks: z.object({
        track: z.array(z.object({
            name: trackNameSchema,
            duration: durationSchema,
            listeners: listenersSchema,
            mbid: mbidSchema,
            url: urlSchema,
            playcount: playcountSchema,
            artist: z.object({
                name: artistNameSchema,
                mbid: mbidSchema,
                url: urlSchema
            }),
            image: z.array(imageSchema)
        })),
        "@attr": z.object({
            page: pageSchema,
            perPage: itemsPerPageSchema,
            totalPages: totalPagesSchema,
            total: totalSchema
        })
    })
});
//# sourceMappingURL=chart.schemas.js.map