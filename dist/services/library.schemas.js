import { z } from "zod";
import { artistNameSchema, countSchema, imageSchema, itemsPerPageSchema, limitSchema, mbidSchema, pageSchema, playcountSchema, totalPagesSchema, totalSchema, urlSchema, userNameSchema } from "./schemas/index.js";
export const libraryGetArtistsRequestSchema = z.object({
    user: userNameSchema,
    limit: limitSchema.optional(),
    page: pageSchema.optional()
});
export const libraryGetArtistsResponseSchema = z.object({
    artists: z.object({
        artist: z.array(z.object({
            tagCount: countSchema,
            image: z.array(imageSchema),
            mbid: mbidSchema,
            url: urlSchema,
            playcount: playcountSchema,
            name: artistNameSchema
        })),
        "@attr": z.object({
            user: userNameSchema,
            totalPages: totalPagesSchema,
            page: pageSchema,
            perPage: itemsPerPageSchema,
            total: totalSchema
        })
    })
});
//# sourceMappingURL=library.schemas.js.map