import { z } from "zod";
export declare const geoGetTopArtistsRequestSchema: z.ZodObject<{
    country: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const geoGetTopArtistsResponseSchema: z.ZodObject<{
    topartists: z.ZodObject<{
        artist: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            listeners: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            image: z.ZodArray<z.ZodString>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            country: z.ZodString;
            page: z.ZodString;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const geoGetTopTracksRequestSchema: z.ZodObject<{
    country: z.ZodString;
    location: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const geoGetTopTracksResponseSchema: z.ZodObject<{
    tracks: z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            duration: z.ZodString;
            listeners: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            image: z.ZodArray<z.ZodString>;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            country: z.ZodString;
            page: z.ZodString;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=geo.schemas.d.ts.map