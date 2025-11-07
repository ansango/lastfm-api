import { z } from "zod";
export declare const libraryGetArtistsRequestSchema: z.ZodObject<{
    user: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const libraryGetArtistsResponseSchema: z.ZodObject<{
    artists: z.ZodObject<{
        artist: z.ZodArray<z.ZodObject<{
            tagCount: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            image: z.ZodArray<z.ZodString>;
            mbid: z.ZodString;
            url: z.ZodString;
            playcount: z.ZodString;
            name: z.ZodString;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            user: z.ZodString;
            totalPages: z.ZodString;
            page: z.ZodString;
            perPage: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=library.schemas.d.ts.map