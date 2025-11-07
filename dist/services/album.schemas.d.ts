import { z } from "zod";
/**
 * Album
 * @see https://www.last.fm/api/show/album.getInfo
 */
export declare const albumSchema: z.ZodObject<{
    artist: z.ZodString;
    mbid: z.ZodString;
    tags: z.ZodObject<{
        tag: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>>, z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>]>>;
    }, z.core.$strip>;
    playcount: z.ZodString;
    image: z.ZodArray<z.ZodObject<{
        "#text": z.ZodString;
        size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
    }, z.core.$strip>>;
    tracks: z.ZodOptional<z.ZodObject<{
        track: z.ZodArray<z.ZodObject<{
            duration: z.ZodString;
            name: z.ZodString;
            url: z.ZodString;
            artist: z.ZodObject<{
                name: z.ZodString;
                mbid: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    url: z.ZodString;
    name: z.ZodString;
    listeners: z.ZodString;
    wiki: z.ZodObject<{
        published: z.ZodString;
        summary: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>;
    userplaycount: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const albumGetInfoRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    album: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
    username: z.ZodOptional<z.ZodString>;
    lang: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const albumGetInfoResponseSchema: z.ZodObject<{
    album: z.ZodObject<{
        artist: z.ZodString;
        mbid: z.ZodString;
        tags: z.ZodObject<{
            tag: z.ZodOptional<z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>>, z.ZodObject<{
                name: z.ZodString;
                url: z.ZodString;
            }, z.core.$strip>]>>;
        }, z.core.$strip>;
        playcount: z.ZodString;
        image: z.ZodArray<z.ZodObject<{
            "#text": z.ZodString;
            size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
        }, z.core.$strip>>;
        tracks: z.ZodOptional<z.ZodObject<{
            track: z.ZodArray<z.ZodObject<{
                duration: z.ZodString;
                name: z.ZodString;
                url: z.ZodString;
                artist: z.ZodObject<{
                    name: z.ZodString;
                    mbid: z.ZodString;
                    url: z.ZodString;
                }, z.core.$strip>;
            }, z.core.$strip>>;
        }, z.core.$strip>>;
        url: z.ZodString;
        name: z.ZodString;
        listeners: z.ZodString;
        wiki: z.ZodObject<{
            published: z.ZodString;
            summary: z.ZodString;
            content: z.ZodString;
        }, z.core.$strip>;
        userplaycount: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const albumGetTagsRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    album: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
    user: z.ZodString;
}, z.core.$strip>;
export declare const albumGetTagsResponseSchema: z.ZodObject<{
    tags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    "@attr": z.ZodObject<{
        album: z.ZodString;
        artist: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const albumGetTopTagsRequestSchema: z.ZodObject<{
    artist: z.ZodString;
    album: z.ZodString;
    mbid: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const albumGetTopTagsResponseSchema: z.ZodObject<{
    tags: z.ZodObject<{
        tag: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodString;
            count: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    "@attr": z.ZodObject<{
        album: z.ZodString;
        artist: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const albumSearchRequestSchema: z.ZodObject<{
    album: z.ZodString;
    limit: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    page: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
}, z.core.$strip>;
export declare const albumSearchResponseSchema: z.ZodObject<{
    results: z.ZodObject<{
        "opensearch:Query": z.ZodObject<{
            "#text": z.ZodString;
            role: z.ZodString;
            searchTerms: z.ZodString;
            startPage: z.ZodString;
        }, z.core.$strip>;
        "opensearch:totalResults": z.ZodString;
        "opensearch:startIndex": z.ZodString;
        "opensearch:itemsPerPage": z.ZodString;
        albummatches: z.ZodObject<{
            album: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                artist: z.ZodString;
                url: z.ZodString;
                image: z.ZodArray<z.ZodObject<{
                    "#text": z.ZodString;
                    size: z.ZodUnion<readonly [z.ZodLiteral<"small">, z.ZodLiteral<"medium">, z.ZodLiteral<"large">, z.ZodLiteral<"extralarge">, z.ZodLiteral<"mega">]>;
                }, z.core.$strip>>;
                mbid: z.ZodString;
            }, z.core.$strip>>;
        }, z.core.$strip>;
        "@attr": z.ZodObject<{
            for: z.ZodString;
        }, z.core.$strip>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type Album = z.infer<typeof albumSchema>;
export type AlbumGetInfoRequest = z.infer<typeof albumGetInfoRequestSchema>;
export type AlbumGetInfoResponse = z.infer<typeof albumGetInfoResponseSchema>;
export type AlbumGetTagsRequest = z.infer<typeof albumGetTagsRequestSchema>;
export type AlbumGetTagsResponse = z.infer<typeof albumGetTagsResponseSchema>;
export type AlbumGetTopTagsRequest = z.infer<typeof albumGetTopTagsRequestSchema>;
export type AlbumGetTopTagsResponse = z.infer<typeof albumGetTopTagsResponseSchema>;
export type AlbumSearchRequest = z.infer<typeof albumSearchRequestSchema>;
export type AlbumSearchResponse = z.infer<typeof albumSearchResponseSchema>;
//# sourceMappingURL=album.schemas.d.ts.map