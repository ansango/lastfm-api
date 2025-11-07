import { z } from "zod";
export declare const libraryGetArtistsRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const libraryGetArtistsResponseSchema: z.ZodObject<{
    artists: z.ZodObject<{
        artist: z.ZodArray<z.ZodObject<{
            tagCount: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
            mbid: z.ZodString;
            url: z.ZodString;
            playcount: z.ZodString;
            name: z.ZodString;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            totalPages: z.ZodString;
            page: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPage: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type LibraryGetArtistsRequest = z.infer<typeof libraryGetArtistsRequestSchema>;
export type LibraryGetArtistsResponse = z.infer<typeof libraryGetArtistsResponseSchema>;
//# sourceMappingURL=library.schemas.d.ts.map