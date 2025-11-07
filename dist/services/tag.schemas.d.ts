import { z } from "zod";
export declare const tagWikiSchema: z.ZodObject<{
    summary: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>;
/**
 * Tag
 * @see https://www.last.fm/api/show/tag.getInfo
 */
export declare const tagSchema: z.ZodObject<{
    name: z.ZodString;
    url: z.ZodString;
    total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    reach: z.ZodNumber;
    wiki: z.ZodObject<{
        summary: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const tagGetInfoRequestSchema: z.ZodObject<{
    tag: z.ZodString;
    lang: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const tagGetInfoResponseSchema: z.ZodObject<{
    tag: z.ZodObject<{
        name: z.ZodString;
        url: z.ZodString;
        total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        reach: z.ZodNumber;
        wiki: z.ZodObject<{
            summary: z.ZodString;
            content: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const tagGetSimilarRequestSchema: z.ZodObject<{
    tag: z.ZodString;
}, z.core.$strip>;
export declare const tagGetSimilarResponseSchema: z.ZodObject<{
    similar: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            tag: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const tagGetTopAlbumsRequestSchema: z.ZodObject<{
    tag: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const tagGetTopAlbumsResponseSchema: z.ZodObject<{
    albums: z.ZodObject<{
        album: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            tag: z.ZodString;
            page: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const tagGetTopArtistsRequestSchema: z.ZodObject<{
    tag: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const tagGetTopArtistsResponseSchema: z.ZodObject<{
    topartists: z.ZodObject<{
        artist: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            tag: z.ZodString;
            page: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const tagGetTopTagsRequestSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const tagGetTopTagsResponseSchema: z.ZodObject<{
    toptags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            reach: z.ZodNumber;
            count: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            offset: z.ZodNumber;
            num_res: z.ZodNumber;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const tagGetTopTracksRequestSchema: z.ZodObject<{
    tag: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const tagGetTopTracksResponseSchema: z.ZodObject<{
    toptracks: z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            duration: z.ZodString;
            mbid: z.ZodString;
            url: z.ZodString;
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
            image: z.ZodArray<z.ZodObject<{
                "#text": z.ZodString;
                size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
            }, z.core.$strip>>;
            "@attr": z.ZodObject<{
                rank: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            tag: z.ZodString;
            page: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            perPage: z.ZodString;
            totalPages: z.ZodString;
            total: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const tagGetWeeklyChartListRequestSchema: z.ZodObject<{
    tag: z.ZodString;
}, z.core.$strip>;
export declare const tagGetWeeklyChartListResponseSchema: z.ZodObject<{
    weeklychartlist: z.ZodObject<{
        chart: z.ZodArray<z.ZodObject<{
            from: z.ZodString;
            to: z.ZodString;
        }, z.core.$strip>>;
        "@attr": z.ZodObject<{
            tag: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
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
//# sourceMappingURL=tag.schemas.d.ts.map