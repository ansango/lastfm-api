import { z } from "zod";
export declare const chartGetTopArtistsRequestSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const chartGetTopArtistsResponseSchema: z.ZodObject<{
    artists: z.ZodObject<{
        artist: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            playcount: z.ZodString;
            mbid: z.ZodString;
            listeners: z.ZodString;
            url: z.ZodString;
            image: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            page: z.ZodString;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const chartGetTopTagsRequestSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const chartGetTopTagsResponseSchema: z.ZodObject<{
    tags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            reach: z.ZodNumber;
            taggings: z.ZodString;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            page: z.ZodString;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const chartGetTopTracksRequestSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const chartGetTopTracksResponseSchema: z.ZodObject<{
    tracks: z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            duration: z.ZodString;
            listeners: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            playcount: z.ZodString;
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            image: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            page: z.ZodString;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=chart.schemas.d.ts.map